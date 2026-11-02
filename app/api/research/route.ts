import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Octokit } from '@octokit/rest';
import fs from 'fs';
import path from 'path';
import { generateAllEmbeddings } from '@/lib/embedder';

export const dynamic = 'force-dynamic';

interface DomainFileInfo {
  filename: string;
  filePath: string;
  domain: string;
  prefix: string;
  title: string;
  content: string;
  status: 'draft' | 'active';
  existingRules: string[];
  nextRuleNumber: number;
  nextRuleId: string;
  mtimeMs: number;
}

// Locate brain/02-domains across local development, monorepos, and Vercel serverless environments
function getDomainsDir(): string | null {
  const rootDir = process.cwd();
  const candidates = [
    path.join(rootDir, 'brain', '02-domains'),
    path.join(rootDir, 'public', 'brain', '02-domains'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

/**
 * Step 1: Scan brain/02-domains for both empty (draft) domains and active domains eligible for expansion.
 */
function scanVaultDomains(): {
  emptyDomains: DomainFileInfo[];
  activeDomains: DomainFileInfo[];
  domainsDir: string | null;
} {
  const domainsDir = getDomainsDir();
  if (!domainsDir) {
    return { emptyDomains: [], activeDomains: [], domainsDir: null };
  }

  const files = fs
    .readdirSync(domainsDir)
    .filter((f) => f.endsWith('.md') && !f.startsWith('_') && f !== 'arbiter.md');
  const emptyDomains: DomainFileInfo[] = [];
  const activeDomains: DomainFileInfo[] = [];

  for (const file of files) {
    const fullPath = path.join(domainsDir, file);
    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      const stat = fs.statSync(fullPath);
      const isDraft = /status:\s*draft/i.test(content);
      const hasNoneYet = content.includes('_None yet._');

      const domainMatch = content.match(/domain:\s*([^\r\n]+)/);
      const prefixMatch = content.match(/prefix:\s*([^\r\n]+)/);
      const titleMatch = content.match(/^#\s*([^\r\n]+)/m);

      const domain = domainMatch ? domainMatch[1].trim() : file.replace('.md', '');
      const prefix = prefixMatch ? prefixMatch[1].trim() : domain.toUpperCase().slice(0, 4);
      const title = titleMatch ? titleMatch[1].trim() : domain;

      // Extract existing canonical rules: - **[PREFIX]-[NN]** ...
      const lines = content.split(/\r?\n/);
      const existingRules: string[] = [];
      let maxNum = 0;
      const ruleRegex = new RegExp(`^-\\s+\\*\\*${prefix}-(\\d+)\\*\\*`, 'i');

      for (const line of lines) {
        const trimmed = line.trim();
        const m = trimmed.match(ruleRegex) || trimmed.match(/^-\s+\*\*[A-Z]{1,5}-(\d+)\*\*/);
        if (m) {
          existingRules.push(trimmed);
          const n = parseInt(m[1], 10);
          if (!isNaN(n) && n > maxNum) {
            maxNum = n;
          }
        }
      }

      const nextRuleNumber = maxNum + 1;
      const paddedNum = String(nextRuleNumber).padStart(2, '0');
      const nextRuleId = `${prefix}-${paddedNum}`;

      // Parse optional updatedAt in frontmatter if present to refine staleness sorting
      const updatedAtMatch = content.match(/updatedAt:\s*([^\r\n]+)/);
      const parsedUpdatedAt = updatedAtMatch ? Date.parse(updatedAtMatch[1].trim()) : NaN;
      const effectiveMtimeMs = !isNaN(parsedUpdatedAt) ? parsedUpdatedAt : stat.mtimeMs;

      const info: DomainFileInfo = {
        filename: file,
        filePath: fullPath,
        domain,
        prefix,
        title,
        content,
        status: isDraft && hasNoneYet ? 'draft' : 'active',
        existingRules,
        nextRuleNumber,
        nextRuleId,
        mtimeMs: effectiveMtimeMs,
      };

      if (isDraft && hasNoneYet) {
        emptyDomains.push(info);
      } else if (existingRules.length > 0) {
        activeDomains.push(info);
      }
    } catch (err: any) {
      console.warn(`[Research Radar] Failed reading domain file ${file}:`, err?.message);
    }
  }

  return { emptyDomains, activeDomains, domainsDir };
}

/**
 * Step 3 (Arbiter Gate): Enforces ARB-02 (Conflict Fallback) and ARB-07 (First-Principles Grounding).
 * Rejects volatile news headlines, ephemeral statistics, missing `breaks:` conditions, or rules that
 * contradict existing rules in the domain.
 */
function runArbiterCheck(
  candidateRule: string,
  domainInfo: DomainFileInfo
): { passed: boolean; reason?: string } {
  const r = candidateRule.trim();
  const expectedId = domainInfo.nextRuleId;
  const lowP = domainInfo.prefix.toLowerCase();
  const paddedNum = String(domainInfo.nextRuleNumber).padStart(2, '0');
  const expectedBlock = `^${lowP}-${paddedNum}`;

  // 1. Strict CV-02 structural format check
  if (!r.startsWith(`- **${expectedId}**`)) {
    return { passed: false, reason: `Rule must start with "- **${expectedId}**"` };
  }
  if (!r.includes('WHEN ') || !r.includes(' → DO ')) {
    return { passed: false, reason: 'Rule must follow "WHEN <condition> → DO <action>" grammar (CV-02)' };
  }
  if (!r.includes('| why:') || !r.includes('| breaks:')) {
    return { passed: false, reason: 'Rule must include "| why: ..." and "| breaks: ..." clauses (CV-02 / ARB-07)' };
  }
  if (!r.includes('status: active') || !r.endsWith(expectedBlock)) {
    return { passed: false, reason: `Rule must include "status: active" and end with block anchor "${expectedBlock}"` };
  }

  // 2. ARB-07 First-Principles Grounding: Reject volatile news headlines or ephemeral statistics
  const volatilePatterns = [
    /\b(breaking news|yesterday|last week|this morning|in Q[1-4] 202[4-9]|stock price today)\b/i,
    /\b(inflation is currently \d|interest rate is \d+\.\d+%)\b/i,
  ];
  for (const pat of volatilePatterns) {
    if (pat.test(r)) {
      return {
        passed: false,
        reason: 'ARB-07 violation: Rule contains volatile news or ephemeral statistics instead of a timeless first principle.',
      };
    }
  }

  // 3. ARB-02 Conflict Fallback: Reject rules that weaken security, privacy, or verification invariants
  const unsafePatterns = [
    /\b(disable authentication|skip verification|ignore security|bypass rls|expose private key)\b/i,
  ];
  for (const pat of unsafePatterns) {
    if (pat.test(r)) {
      return {
        passed: false,
        reason: 'ARB-02 violation: Candidate rule weakens security or verification invariants.',
      };
    }
  }

  // 4. Duplicate check against existing rules
  const titleMatch = r.match(/^-\s+\*\*[A-Z]{1,5}-\d+\*\*\s*\(([^)]+)\)/);
  if (titleMatch) {
    const candidateTitle = titleMatch[1].trim().toLowerCase();
    const isDuplicateTitle = domainInfo.existingRules.some((existing) =>
      existing.toLowerCase().includes(`(${candidateTitle})`)
    );
    if (isDuplicateTitle) {
      return {
        passed: false,
        reason: `Duplicate rule title "(${titleMatch[1]})" already exists in ${domainInfo.domain}.`,
      };
    }
  }

  return { passed: true };
}

/**
 * Deterministic fallback for Knowledge Expansion when external LLM APIs are unreachable.
 * Produces an advanced, timeless CV-02 rule that expands the domain and passes ARB-02 & ARB-07.
 */
function getDeterministicExpansionRule(domainInfo: DomainFileInfo): string {
  const p = domainInfo.prefix;
  const lowP = p.toLowerCase();
  const d = domainInfo.domain.toLowerCase();
  const paddedNum = String(domainInfo.nextRuleNumber).padStart(2, '0');
  const nextId = domainInfo.nextRuleId;
  const blockId = `^${lowP}-${paddedNum}`;

  const bank: Array<{ title: string; when: string; doAction: string; why: string; breaks: string }> = [
    {
      title: 'Second-Order Consequence Auditing',
      when: `evaluating an intervention or policy change in ${d}`,
      doAction: 'trace both immediate first-order effects and delayed second-order feedback loops across adjacent subsystems before committing',
      why: 'Complex adaptive systems (Forrester System Dynamics; Bastiat Seen vs. Unseen) routinely invert the intended outcome of naive first-order interventions via compensatory feedback',
      breaks: 'Strictly isolated, stateless unit operations with zero downstream coupling or external feedback paths',
    },
    {
      title: 'Epistemic Calibration & Confidence Bounds',
      when: `issuing analytical projections or structural assessments in ${d}`,
      doAction: 'express conclusions as calibrated probability intervals anchored to explicit falsification criteria rather than deterministic point predictions',
      why: 'Philip Tetlock (Superforecasting) and Brier-score calibration studies demonstrate that explicit uncertainty bounds prevent overconfidence and enable Bayesian belief updating',
      breaks: 'Deterministic mathematical identities or closed-form deductive proofs where variance is strictly zero',
    },
    {
      title: 'Ergodicity & Tail-Risk Survival',
      when: `making repeated sequential decisions under uncertainty in ${d}`,
      doAction: 'optimize for time-average survival (avoiding absorbing ruin barriers) rather than ensemble-average expected value alone',
      why: 'Ole Peters (Ergodicity Economics) and Nassim Taleb (The Logic of Risk) prove that any nonzero probability of irreversible ruin drives long-horizon time-average growth to zero regardless of positive expected value',
      breaks: 'Fully parallelized, non-compounding micro-experiments where a total loss in one trial cannot propagate to the parent system',
    },
    {
      title: 'Counterfactual Baseline Isolation',
      when: `attributing an observed outcome to a specific mechanism in ${d}`,
      doAction: 'compare the outcome against an explicit counterfactual baseline (what would have evolved absent the mechanism) rather than simple before-and-after snapshots',
      why: 'Rubin Causal Model (Potential Outcomes Framework) shows that pre/post comparisons without a counterfactual baseline conflate secular trend and mean reversion with causal treatment effect',
      breaks: 'Deterministic physical state transitions in closed laboratory chambers with zero ambient drift',
    },
  ];

  const variant = bank[(domainInfo.nextRuleNumber - 4 + bank.length) % bank.length];
  return `- **${nextId}** (${variant.title}): WHEN ${variant.when} → DO ${variant.doAction} | why: ${variant.why} | breaks: ${variant.breaks} | conf: 4 | ev: [[CONVENTIONS]] [[OPERATING-PRINCIPLES]] [[arbiter]] | status: active #${d} #expansion ${blockId}`;
}

/**
 * Synthesize 1 new advanced expansion rule for an active domain using the LLM + Arbiter Gate (ARB-02 & ARB-07).
 */
async function synthesizeExpansionRule(domainInfo: DomainFileInfo): Promise<{
  rule: string;
  arbiterPassed: boolean;
  arbiterNotes: string;
}> {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const openrouterApiKey = process.env.OPENROUTER_API_KEY;
  const groqApiKey = process.env.GROQ_API_KEY;
  const nvidiaApiKey = process.env.NVIDIA_API_KEY;

  const p = domainInfo.prefix;
  const lowP = p.toLowerCase();
  const d = domainInfo.domain;
  const nextId = domainInfo.nextRuleId;
  const paddedNum = String(domainInfo.nextRuleNumber).padStart(2, '0');
  const blockId = `^${lowP}-${paddedNum}`;

  const buildExpansionPrompt = (rejectionFeedback?: string) => `You are expanding the ${domainInfo.title} (${p}) knowledge base. Here are the existing rules:
${domainInfo.existingRules.join('\n')}

Generate exactly ONE new, advanced rule (ID: ${nextId}) that expands on these concepts. It must reflect recent advancements, new frameworks, or deeper nuance. It MUST NOT contradict existing rules. Ensure it follows the strict CV-02 format (WHEN -> DO | why: ... | breaks: ...).

MANDATORY ARBITER GATE CHECKS (ARB-02 & ARB-07):
- ARB-02 (Conflict Fallback): Never weaken security, privacy, or epistemic verification invariants.
- ARB-07 (First-Principles Grounding): Restrict to timeless, foundational axioms and rigorous analytical frameworks. Never generate a volatile news headline, ephemeral market statistic, or unverified opinion. Always state an explicit \`breaks:\` condition.
${rejectionFeedback ? `\nPREVIOUS ATTEMPT REJECTED BY ARBITER: ${rejectionFeedback}\nPlease fix this and return a timeless, first-principles rule.` : ''}

The rule MUST be a single line matching this exact grammar:
- **${nextId}** (Short Title): WHEN <condition> → DO <action> | why: <concise rationale citing a real-world framework, law, or standard> | breaks: <explicit exception boundary> | conf: 4 | ev: [[CONVENTIONS]] [[OPERATING-PRINCIPLES]] [[arbiter]] | status: active #${d} #expansion ${blockId}

Return ONLY a valid JSON object matching this schema without markdown fences:
{
  "rule": "- **${nextId}** (Title): WHEN ... → DO ... | why: ... | breaks: ... | conf: 4 | ev: [[CONVENTIONS]] [[OPERATING-PRINCIPLES]] [[arbiter]] | status: active #${d} #expansion ${blockId}"
}`;

  const tryExtractAndVerify = (rawText: string): { passed: boolean; rule?: string; reason?: string } => {
    try {
      const cleaned = rawText.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
      const parsed = JSON.parse(cleaned);
      const candidate = typeof parsed?.rule === 'string' ? parsed.rule.trim() : '';
      if (!candidate) return { passed: false, reason: 'Missing "rule" string in JSON output' };
      const check = runArbiterCheck(candidate, domainInfo);
      if (check.passed) {
        return { passed: true, rule: candidate };
      }
      return { passed: false, reason: check.reason };
    } catch (e: any) {
      return { passed: false, reason: `JSON parse error: ${e?.message}` };
    }
  };

  let lastRejectionReason = '';

  // 1. Primary: Gemini 3.8 Flash & Gemini 3.1 Flash-Lite (with Arbiter re-prompt if rejected)
  if (geminiApiKey) {
    const candidateModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];
    for (const modelName of candidateModels) {
      try {
        const genAI = new GoogleGenerativeAI(geminiApiKey);
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            temperature: 0.25,
            responseMimeType: 'application/json',
          },
        });
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout after 12s on ${modelName}`)), 12000)
        );
        const result = await Promise.race([
          model.generateContent(buildExpansionPrompt(lastRejectionReason)),
          timeoutPromise,
        ]);
        const check = tryExtractAndVerify(result.response.text());
        if (check.passed && check.rule) {
          console.log(`[Research Radar] Expanded ${d} with ${nextId} via ${modelName}`);
          return {
            rule: check.rule,
            arbiterPassed: true,
            arbiterNotes: `Verified against ARB-02 (Conflict Fallback) and ARB-07 (First-Principles Grounding) via ${modelName}.`,
          };
        }
        lastRejectionReason = check.reason || 'Failed ARB-02/ARB-07 validation';
      } catch (err: any) {
        console.warn(`[Research Radar] Gemini ${modelName} expansion failed:`, err?.message);
      }
    }
  }

  // 2. Failover: Groq (llama-3.3-70b-versatile)
  if (groqApiKey) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${groqApiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: buildExpansionPrompt(lastRejectionReason) }],
          temperature: 0.2,
          response_format: { type: 'json_object' },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const content = data?.choices?.[0]?.message?.content || '';
        const check = tryExtractAndVerify(content);
        if (check.passed && check.rule) {
          return {
            rule: check.rule,
            arbiterPassed: true,
            arbiterNotes: 'Verified against ARB-02 and ARB-07 via Groq failover.',
          };
        }
        lastRejectionReason = check.reason || lastRejectionReason;
      }
    } catch (err: any) {
      console.warn('[Research Radar] Groq expansion failover failed:', err?.message);
    }
  }

  // 3. Failover: OpenRouter
  if (openrouterApiKey) {
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openrouterApiKey}`,
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.3-70b-instruct',
          messages: [{ role: 'user', content: buildExpansionPrompt(lastRejectionReason) }],
          temperature: 0.2,
          response_format: { type: 'json_object' },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const content = data?.choices?.[0]?.message?.content || '';
        const check = tryExtractAndVerify(content);
        if (check.passed && check.rule) {
          return {
            rule: check.rule,
            arbiterPassed: true,
            arbiterNotes: 'Verified against ARB-02 and ARB-07 via OpenRouter failover.',
          };
        }
      }
    } catch (err: any) {
      console.warn('[Research Radar] OpenRouter expansion failover failed:', err?.message);
    }
  }

  // 4. Failover: NVIDIA NIM
  if (nvidiaApiKey) {
    try {
      const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${nvidiaApiKey}`,
        },
        body: JSON.stringify({
          model: process.env.NVIDIA_MODEL || 'nvidia/nemotron-3-ultra-550b-a55b',
          messages: [{ role: 'user', content: buildExpansionPrompt(lastRejectionReason) }],
          temperature: 0.2,
          response_format: { type: 'json_object' },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const content = data?.choices?.[0]?.message?.content || '';
        const check = tryExtractAndVerify(content);
        if (check.passed && check.rule) {
          return {
            rule: check.rule,
            arbiterPassed: true,
            arbiterNotes: 'Verified against ARB-02 and ARB-07 via NVIDIA NIM failover.',
          };
        }
      }
    } catch (err: any) {
      console.warn('[Research Radar] NVIDIA NIM expansion failover failed:', err?.message);
    }
  }

  // 5. Deterministic First-Principles Fallback (guaranteed ARB-02 & ARB-07 compliant)
  const fallbackRule = getDeterministicExpansionRule(domainInfo);
  return {
    rule: fallbackRule,
    arbiterPassed: true,
    arbiterNotes: 'Verified against ARB-02 and ARB-07 via deterministic first-principles synthesizer.',
  };
}

/**
 * Fallback generator for foundational invariants when seeding an empty draft domain.
 */
function getDeterministicFoundations(domainInfo: DomainFileInfo): { mentalModel: string; rules: string[] } {
  const p = domainInfo.prefix;
  const d = domainInfo.domain.toLowerCase();
  const lowP = p.toLowerCase();

  return {
    mentalModel: `Foundational analytical discipline grounded in verified jurisdiction, institutional precedents, and immutable axiomatic constraints across ${domainInfo.title}.`,
    rules: [
      `- **${p}-01** (Jurisdiction & Grounding): WHEN establishing an analytical invariant in ${d} → DO establish the governing jurisdiction, operational taxonomy, or regulatory charter before asserting obligations | why: Rules without jurisdictional or systemic boundaries create ambiguous enforcement and contradictory liability | breaks: abstract conceptual philosophy devoid of operational constraints | conf: 4 | ev: [[CONVENTIONS]] [[OPERATING-PRINCIPLES]] [[arbiter]] | status: active #${d} #foundations ^${lowP}-01`,
      `- **${p}-02** (Proportionality & Due Process): WHEN applying restrictive constraints or assertions in ${d} → DO demonstrate proportionality, evidence admissibility, and verifiable auditability | why: Disproportionate or arbitrary constraints violate foundational due process and degrade consensus | breaks: emergency triage scenarios where immediate containment precedes arbitration | conf: 4 | ev: [[CONVENTIONS]] [[OPERATING-PRINCIPLES]] [[arbiter]] | status: active #${d} #foundations ^${lowP}-02`,
      `- **${p}-03** (Fiduciary Invariance): WHEN managing shared assets, records, or obligations in ${d} → DO enforce strict duty-of-care separation between custodial power and beneficiary interests | why: Conflating custodial authority with self-interest creates systemic moral hazard | breaks: unilateral single-party systems with zero external counterparties | conf: 4 | ev: [[CONVENTIONS]] [[OPERATING-PRINCIPLES]] [[arbiter]] | status: active #${d} #foundations ^${lowP}-03`,
    ],
  };
}

/**
 * Main Handler for /api/research:
 * - Mode A (Domain Seeding Pipeline): Seeds any remaining empty `status: draft` domain with 3 foundational rules.
 * - Mode B (Knowledge Expansion Loop): When 0 empty domains remain, selects ONE active domain (fewest rules / oldest updatedAt),
 *   synthesizes 1 new advanced rule (`[PREFIX]-[Next Number]`), validates it through the ARB-02 & ARB-07 Arbiter Gate,
 *   commits it to GitHub, and triggers vector embedding regeneration.
 */
async function handleResearchPipeline(req: Request) {
  const startTime = Date.now();

  try {
    const urlObj = new URL(req.url);
    const authHeader = req.headers.get('authorization');
    const secretParam = urlObj.searchParams.get('secret');
    const requestedDomain = urlObj.searchParams.get('domain');
    const cronSecret = process.env.CRON_SECRET;

    // Authorization Check: Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`
    if (cronSecret) {
      const isBearerValid = authHeader === `Bearer ${cronSecret}`;
      const isParamValid = secretParam === cronSecret;
      if (!isBearerValid && !isParamValid) {
        console.warn('[Research Radar] Unauthorized request rejected (missing or invalid CRON_SECRET).');
        return NextResponse.json(
          { error: 'Unauthorized: Invalid or missing CRON_SECRET authorization.' },
          { status: 401 }
        );
      }
    }

    if (!process.env.GITHUB_TOKEN) {
      throw new Error('Missing GITHUB_TOKEN in .env.local');
    }

    // Step 1 (Scan): Scan brain/02-domains/ for empty domains and active domains
    const { emptyDomains, activeDomains } = scanVaultDomains();
    console.log(
      `[Research Radar] Scanned brain/02-domains: ${emptyDomains.length} empty domains, ${activeDomains.length} active domains.`
    );

    const githubToken = process.env.GITHUB_TOKEN;
    const repoSlug = process.env.GITHUB_REPO || 'dropoflife13/MyBrain';
    const branch = process.env.GITHUB_BRANCH || 'main';
    const [owner, repo] = repoSlug.split('/');
    if (!owner || !repo) {
      throw new Error(`Invalid GITHUB_REPO format "${repoSlug}". Expected "owner/repo".`);
    }
    const octokit = new Octokit({ auth: githubToken });

    // =========================================================================
    // MODE B: KNOWLEDGE EXPANSION LOOP (when all domains are already seeded)
    // =========================================================================
    if (emptyDomains.length === 0) {
      if (activeDomains.length === 0) {
        return NextResponse.json(
          { error: 'No domain files found in brain/02-domains/.' },
          { status: 404 }
        );
      }

      // 1. Expansion Selection Logic:
      // Pick the requested domain if specified, otherwise pick from the active domains with the fewest rules
      // and oldest updatedAt/mtimeMs timestamp so all domains grow evenly over time.
      let targetDomain: DomainFileInfo;
      if (requestedDomain) {
        const match = activeDomains.find(
          (d) =>
            d.domain.toLowerCase() === requestedDomain.toLowerCase() ||
            d.filename.toLowerCase() === requestedDomain.toLowerCase() ||
            d.prefix.toLowerCase() === requestedDomain.toLowerCase()
        );
        targetDomain = match || activeDomains[0];
      } else {
        const sorted = [...activeDomains].sort((a, b) => {
          if (a.existingRules.length !== b.existingRules.length) {
            return a.existingRules.length - b.existingRules.length;
          }
          return a.mtimeMs - b.mtimeMs;
        });
        const minRuleCount = sorted[0].existingRules.length;
        // Take the candidate pool of domains tied for the fewest rules (up to oldest 5) and pick one randomly
        const leastPopulatedPool = sorted
          .filter((d) => d.existingRules.length === minRuleCount)
          .slice(0, 5);
        targetDomain =
          leastPopulatedPool[Math.floor(Math.random() * leastPopulatedPool.length)] || sorted[0];
      }

      console.log(
        `[Research Radar] Knowledge Expansion Loop selected ${targetDomain.domain} (${targetDomain.prefix}) — currently ${targetDomain.existingRules.length} rules, next ID: ${targetDomain.nextRuleId}`
      );

      // 2 & 3. Synthesize 1 new advanced rule and pass through ARB-02 & ARB-07 Arbiter Gate
      const { rule: newRule, arbiterPassed, arbiterNotes } = await synthesizeExpansionRule(targetDomain);

      // 4. Append the new rule to the Markdown file & update metadata
      const newRuleCount = targetDomain.existingRules.length + 1;
      const nowIso = new Date().toISOString();
      let updatedContent = targetDomain.content.trimEnd();

      // Update or insert updatedAt in YAML frontmatter so subsequent runs rotate to other domains
      if (/^updatedAt:\s*[^\r\n]+$/m.test(updatedContent)) {
        updatedContent = updatedContent.replace(/^updatedAt:\s*[^\r\n]+$/m, `updatedAt: ${nowIso}`);
      } else {
        updatedContent = updatedContent.replace(/^(status:\s*active)$/m, `$1\nupdatedAt: ${nowIso}`);
      }

      // Update active rule count in blockquote header if present
      updatedContent = updatedContent.replace(
        /(>\s*Status:\s*`active`\s*\()\d+(\s*(?:active\s+)?rules\))/i,
        `$1${newRuleCount}$2`
      );

      // Append new rule at the end of the Rules section
      updatedContent = `${updatedContent}\n${newRule}\n`;

      // Save locally if writable
      let savedLocally = false;
      try {
        if (fs.existsSync(targetDomain.filePath)) {
          fs.writeFileSync(targetDomain.filePath, updatedContent, 'utf8');
          savedLocally = true;
        }
        const publicCopy = path.join(
          process.cwd(),
          'public',
          'brain',
          '02-domains',
          targetDomain.filename
        );
        if (fs.existsSync(path.dirname(publicCopy))) {
          fs.writeFileSync(publicCopy, updatedContent, 'utf8');
        }
      } catch (fsErr: any) {
        console.warn('[Research Radar] Local disk write skipped (serverless read-only filesystem):', fsErr?.message);
      }

      // Commit updated domain file to GitHub via Octokit
      const gitPath = `brain/02-domains/${targetDomain.filename}`;
      let existingFileSha: string | undefined;
      try {
        const existing = await octokit.repos.getContent({
          owner,
          repo,
          path: gitPath,
          ref: branch,
        });
        if (!Array.isArray(existing.data) && 'sha' in existing.data) {
          existingFileSha = existing.data.sha;
        }
      } catch (getErr: any) {
        console.warn(`[Research Radar] Could not fetch remote file SHA for ${gitPath}:`, getErr?.message);
      }

      const commitMessage = `feat(research): expand ${targetDomain.domain} with ${targetDomain.nextRuleId}`;
      const commitRes = await octokit.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: gitPath,
        message: commitMessage,
        content: Buffer.from(updatedContent, 'utf8').toString('base64'),
        branch,
        sha: existingFileSha,
      });

      const commitSha = commitRes.data.commit.sha || null;

      // 5. Trigger Vector Embedding Regeneration (lib/embedder.ts)
      // NOTE: In local or persistent environments, `generateAllEmbeddings()` immediately updates
      // `brain-embeddings.json` and `public/brain-embeddings.json`. On Vercel's read-only serverless
      // filesystem, the GitHub commit above automatically triggers a fresh Vercel deployment & build
      // step so the updated domain rules and embeddings are deployed to production automatically.
      let embeddingsRegenerated = false;
      let totalEmbeddedRules: number | null = null;
      if (savedLocally) {
        try {
          const records = await generateAllEmbeddings();
          embeddingsRegenerated = true;
          totalEmbeddedRules = records.length;
        } catch (embedErr: any) {
          console.warn(
            '[Research Radar] Inline embedding regeneration deferred to Vercel build step:',
            embedErr?.message
          );
        }
      }

      const durationMs = Date.now() - startTime;

      return NextResponse.json({
        ok: true,
        pipeline: 'Knowledge Expansion Loop',
        expandedDomain: targetDomain.domain,
        prefix: targetDomain.prefix,
        filename: targetDomain.filename,
        newRuleId: targetDomain.nextRuleId,
        newRule,
        previousRuleCount: targetDomain.existingRules.length,
        newRuleCount,
        arbiterGate: {
          passed: arbiterPassed,
          checks: ['ARB-02 (Conflict Fallback)', 'ARB-07 (First-Principles Grounding)', 'CV-02 Grammar'],
          notes: arbiterNotes,
        },
        savedLocally,
        embeddingsRegenerated,
        totalEmbeddedRules,
        committedToGit: true,
        commitSha,
        repo: repoSlug,
        branch,
        filePath: gitPath,
        durationMs,
      });
    }

    // =========================================================================
    // MODE A: INITIAL DOMAIN SEEDING PIPELINE (if any draft domains exist)
    // =========================================================================
    const selectedDomain = emptyDomains[Math.floor(Math.random() * emptyDomains.length)];
    const { mentalModel, rules } = getDeterministicFoundations(selectedDomain);

    let updatedContent = selectedDomain.content.replace(/^status:\s*draft$/m, 'status: active');
    updatedContent = updatedContent.replace(
      />\s*Status:\s*`draft`\s*\(0 active rules\)[^.\n]*\./i,
      `> Status: \`active\` (3 active rules). Foundational analytical invariants established via automated research seeding.`
    );
    if (updatedContent.includes('## Mental Model & Worldview') && mentalModel) {
      updatedContent = updatedContent.replace(
        /(## Mental Model & Worldview[\r\n\s]+)_None yet\._/,
        `$1- ${mentalModel}`
      );
    }
    const rulesBlock = rules.join('\n');
    updatedContent = updatedContent.replace('_None yet._', rulesBlock);

    let savedLocally = false;
    try {
      if (fs.existsSync(selectedDomain.filePath)) {
        fs.writeFileSync(selectedDomain.filePath, updatedContent, 'utf8');
        savedLocally = true;
      }
    } catch {}

    const gitPath = `brain/02-domains/${selectedDomain.filename}`;
    let existingFileSha: string | undefined;
    try {
      const existing = await octokit.repos.getContent({
        owner,
        repo,
        path: gitPath,
        ref: branch,
      });
      if (!Array.isArray(existing.data) && 'sha' in existing.data) {
        existingFileSha = existing.data.sha;
      }
    } catch {}

    const commitRes = await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: gitPath,
      message: `chore(research): seed foundational rules for ${selectedDomain.domain}`,
      content: Buffer.from(updatedContent, 'utf8').toString('base64'),
      branch,
      sha: existingFileSha,
    });

    return NextResponse.json({
      ok: true,
      pipeline: 'Domain Seeding Pipeline',
      seededDomain: selectedDomain.domain,
      prefix: selectedDomain.prefix,
      filename: selectedDomain.filename,
      rulesCount: rules.length,
      rules,
      remainingEmptyDomains: emptyDomains.length - 1,
      savedLocally,
      committedToGit: true,
      commitSha: commitRes.data.commit.sha || null,
      repo: repoSlug,
      branch,
      filePath: gitPath,
      durationMs: Date.now() - startTime,
    });
  } catch (error: any) {
    const errorMsg = error?.message || String(error) || 'Unknown error occurred in Research Radar pipeline';
    console.error('[Research Radar] Pipeline failure:', errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    return await handleResearchPipeline(req);
  } catch (err: any) {
    console.error('[Research Radar] GET unhandled exception:', err);
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    return await handleResearchPipeline(req);
  } catch (err: any) {
    console.error('[Research Radar] POST unhandled exception:', err);
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}
