import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Octokit } from '@octokit/rest';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

interface EmptyDomainInfo {
  filename: string;
  filePath: string;
  domain: string;
  prefix: string;
  title: string;
  content: string;
}

// Locate brain/02-domains across local development, monorepos, and Vercel serverless environments
function getDomainsDir(): string | null {
  const rootDir = process.cwd();
  const candidates = [
    path.join(rootDir, 'brain', '02-domains'),
    path.join(rootDir, 'brain-web', 'brain', '02-domains'),
    path.resolve(__dirname, '../../../../brain/02-domains'),
    path.resolve(__dirname, '../../../../../brain/02-domains'),
    path.resolve(rootDir, '.next', 'server', 'brain', '02-domains'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

/**
 * Step 1: Scan brain/02-domains for empty domain files.
 * Matches files with `status: draft` AND containing `_None yet._`.
 */
function scanEmptyDomains(): { emptyDomains: EmptyDomainInfo[]; domainsDir: string | null } {
  const domainsDir = getDomainsDir();
  if (!domainsDir) {
    return { emptyDomains: [], domainsDir: null };
  }

  const files = fs.readdirSync(domainsDir).filter((f) => f.endsWith('.md') && !f.startsWith('_'));
  const emptyDomains: EmptyDomainInfo[] = [];

  for (const file of files) {
    const fullPath = path.join(domainsDir, file);
    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('status: draft') && content.includes('_None yet._')) {
        const domainMatch = content.match(/domain:\s*([^\r\n]+)/);
        const prefixMatch = content.match(/prefix:\s*([^\r\n]+)/);
        const titleMatch = content.match(/^#\s*([^\r\n]+)/m);

        const domain = domainMatch ? domainMatch[1].trim() : file.replace('.md', '');
        const prefix = prefixMatch ? prefixMatch[1].trim() : domain.toUpperCase().slice(0, 4);
        const title = titleMatch ? titleMatch[1].trim() : domain;

        emptyDomains.push({
          filename: file,
          filePath: fullPath,
          domain,
          prefix,
          title,
          content,
        });
      }
    } catch (err: any) {
      console.warn(`[Research Radar] Failed reading domain file ${file}:`, err?.message);
    }
  }

  return { emptyDomains, domainsDir };
}

/**
 * Fallback generator for foundational invariants when external LLM endpoints are unavailable.
 * Strictly adheres to CV-02 and ARB-06 (timeless foundational principles, non-volatile).
 */
function getDeterministicFoundations(domainInfo: EmptyDomainInfo): { mentalModel: string; rules: string[] } {
  const p = domainInfo.prefix;
  const d = domainInfo.domain.toLowerCase();
  const lowP = p.toLowerCase();

  if (d === 'law' || p === 'LAW') {
    return {
      mentalModel: 'Jurisprudential reasoning grounded in statutory hierarchies, jurisdictional authority, and procedural due process.',
      rules: [
        `- **LAW-01** (Jurisdiction First): WHEN evaluating legal obligations or statutory claims → DO confirm competent subject-matter and territorial jurisdiction before assessing substantive merits | why: Judgments rendered without competent jurisdiction are void ab initio under foundational constitutional and procedural doctrine | breaks: international advisory arbitrations with voluntary party submission | conf: 5 | ev: [[CONVENTIONS]] [[OPERATING-PRINCIPLES]] | status: active #law #jurisprudence ^law-01`,
        `- **LAW-02** (Contractual Enforceability): WHEN drafting or reviewing transactional covenants → DO verify mutual assent, clear consideration, and definite terms | why: Restatement (Second) of Contracts § 17 requires a bargain in which there is a manifestation of mutual assent and consideration for legal enforceability | breaks: unilateral gratuitous promises supported by documented promissory estoppel | conf: 5 | ev: [[CONVENTIONS]] [[OPERATING-PRINCIPLES]] | status: active #law #contracts ^law-02`,
        `- **LAW-03** (Strict Liability Separation): WHEN structuring liability allocations → DO maintain explicit boundaries between negligence standards and strict statutory liability | why: Conflating fault-based tort standards with absolute statutory compliance creates catastrophic uninsurable enterprise exposure | breaks: expressly indemnified third-party agreements with statutory caps | conf: 5 | ev: [[CONVENTIONS]] [[OPERATING-PRINCIPLES]] | status: active #law #compliance ^law-03`,
      ],
    };
  }

  if (d === 'crypto' || p === 'CRY') {
    return {
      mentalModel: 'Trustless distributed systems grounded in cryptographic proof, deterministic state transitions, and consensus finality.',
      rules: [
        `- **CRY-01** (Verification Over Trust): WHEN verifying distributed state transitions or ledger mutations → DO validate cryptographic signatures and consensus proofs mathematically rather than trusting node telemetry | why: The foundational Nakamoto consensus invariant dictates that distributed networks must be verifiable without trusted intermediaries | breaks: private permissioned testnets with centralized single-signer coordinators | conf: 5 | ev: [[CONVENTIONS]] [[OPERATING-PRINCIPLES]] | status: active #crypto #consensus ^cry-01`,
        `- **CRY-02** (Reentrancy & State Ordering): WHEN designing state-modifying smart contracts or ledger settlement functions → DO follow the Checks-Effects-Interactions pattern strictly before external calls | why: SWC-107 reentrancy vulnerabilities occur when contract state is modified after transferring execution control to untrusted external contracts | breaks: view-only read operations with zero external mutation side effects | conf: 5 | ev: [[CONVENTIONS]] [[OPERATING-PRINCIPLES]] | status: active #crypto #security ^cry-02`,
        `- **CRY-03** (Deterministic Finality): WHEN executing protocol settlement or off-chain state commitments → DO wait for probabilistic or deterministic block finality thresholds before triggering irreversible external actions | why: Premature transaction confirmation exposes downstream state machines to block reorganization (reorg) and double-spend rollbacks | breaks: optimistic rollup state transitions guarded by fraud-proof challenge windows | conf: 5 | ev: [[CONVENTIONS]] [[OPERATING-PRINCIPLES]] | status: active #crypto #finality ^cry-03`,
      ],
    };
  }

  if (d === 'art' || p === 'ART') {
    return {
      mentalModel: 'Visual composition, semiotics, and aesthetic harmony governed by perceptual psychology and structural balance.',
      rules: [
        `- **ART-01** (Visual Hierarchy & Focal Dominance): WHEN composing visual layouts or graphical elements → DO establish a singular primary focal point before distributing secondary rhythm and subordinate detail | why: Gestalt principles of visual perception demonstrate that unranked competing focal points cause cognitive fatigue and perceptual fragmentation | breaks: deliberately decentralized, brutalist, or chaotic all-over compositions | conf: 4 | ev: [[CONVENTIONS]] [[OPERATING-PRINCIPLES]] | status: active #art #composition ^art-01`,
        `- **ART-02** (Chromatic Harmony & Contrast): WHEN selecting color palettes for interfaces or artworks → DO preserve intentional luminance contrast ratios between communicative figure and ground | why: WCAG perceptual contrast standards and Munsell color systems dictate that luminance differences drive visual legibility above hue alone | breaks: intentional low-contrast monochromatic mood pieces | conf: 4 | ev: [[CONVENTIONS]] [[OPERATING-PRINCIPLES]] | status: active #art #color ^art-02`,
        `- **ART-03** (Proportional Spatial Rhythm): WHEN distributing negative space and mass across a canvas or viewport → DO employ harmonic geometric ratios (such as the Golden Ratio or rule-of-thirds) to guide spatial progression | why: Classical aesthetic theory and empirical perceptual studies show proportional ratios establish natural visual cadence and rhythm | breaks: rigid symmetrical grids or intentionally claustrophobic compositions | conf: 4 | ev: [[CONVENTIONS]] [[OPERATING-PRINCIPLES]] | status: active #art #harmony ^art-03`,
      ],
    };
  }

  return {
    mentalModel: `Foundational analytical discipline grounded in verified jurisdiction, institutional precedents, and immutable axiomatic constraints across ${domainInfo.title}.`,
    rules: [
      `- **${p}-01** (Jurisdiction & Grounding): WHEN establishing an analytical invariant in ${d} → DO establish the governing jurisdiction, operational taxonomy, or regulatory charter before asserting obligations | why: Rules without jurisdictional or systemic boundaries create ambiguous enforcement and contradictory legal liability | breaks: abstract conceptual philosophy devoid of operational or legal constraints | conf: 4 | ev: [[CONVENTIONS]] [[OPERATING-PRINCIPLES]] | status: active #${d} #foundations ^${lowP}-01`,
      `- **${p}-02** (Proportionality & Due Process): WHEN applying restrictive constraints or punitive assertions in ${d} → DO demonstrate proportionality, evidence admissibility, and verifiable auditability | why: Disproportionate or arbitrary constraints violate foundational institutional due process and degrade stakeholder consensus | breaks: emergency triage scenarios where immediate containment precedes detailed arbitration | conf: 4 | ev: [[CONVENTIONS]] [[OPERATING-PRINCIPLES]] | status: active #${d} #foundations ^${lowP}-02`,
      `- **${p}-03** (Fiduciary Invariance): WHEN managing shared assets, records, or multi-tenant obligations in ${d} → DO enforce strict duty-of-care separation between trustee power and beneficiary interests | why: Conflating custodial authority with self-interest violates primary institutional covenants and creates systemic moral hazard | breaks: unilateral single-party systems with zero external counterparties | conf: 4 | ev: [[CONVENTIONS]] [[OPERATING-PRINCIPLES]] | status: active #${d} #foundations ^${lowP}-03`,
    ],
  };
}

/**
 * Step 3: Research & Synthesize 3 foundational rules for the selected domain using the LLM.
 * Strictly enforces CV-02 and ARB-06.
 */
async function synthesizeFoundations(
  domainInfo: EmptyDomainInfo
): Promise<{ mentalModel: string; rules: string[] }> {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const openrouterApiKey = process.env.OPENROUTER_API_KEY;
  const groqApiKey = process.env.GROQ_API_KEY;
  const nvidiaApiKey = process.env.NVIDIA_API_KEY;
  const p = domainInfo.prefix;
  const lowP = p.toLowerCase();
  const d = domainInfo.domain;

  const prompt = `You are an expert in ${domainInfo.title} (${p}).
Generate 3 fundamental, non-controversial engineering or analytical invariants for this field.
Cite a real-world source (e.g., a standard, a law, or a widely accepted framework).
Do not hallucinate current events, stick to timeless principles.

You MUST strictly adhere to Cortex Vault rule standards (CV-02) and ARB-06 (Seeding Boundaries):
- ARB-06: Restrict to timeless, foundational principles (e.g., "Laws require jurisdiction"). Never generate specific volatile statistics (e.g., "Inflation is 4.5%") as a permanent rule.
- Each rule line MUST be a single line following this exact grammar:
- **${p}-01** (Short Title): WHEN <condition> → DO <action> | why: <concise timeless rationale citing standard or source> | breaks: <exception scenario or false positive> | conf: 4 | ev: [[CONVENTIONS]] [[OPERATING-PRINCIPLES]] | status: active #${d} #foundations ^${lowP}-01
- **${p}-02** (Short Title): WHEN <condition> → DO <action> | why: <rationale> | breaks: <exception scenario> | conf: 4 | ev: [[CONVENTIONS]] [[OPERATING-PRINCIPLES]] | status: active #${d} #foundations ^${lowP}-02
- **${p}-03** (Short Title): WHEN <condition> → DO <action> | why: <rationale> | breaks: <exception scenario> | conf: 4 | ev: [[CONVENTIONS]] [[OPERATING-PRINCIPLES]] | status: active #${d} #foundations ^${lowP}-03

Also provide a 1-2 sentence core mental model for this domain.

Return ONLY a valid JSON object matching this schema without markdown fences:
{
  "mentalModel": "1-2 sentence core worldview for this domain.",
  "rules": [
    "- **${p}-01** (Title): WHEN ... → DO ... | why: ... | breaks: ... | conf: 4 | ev: [[CONVENTIONS]] [[OPERATING-PRINCIPLES]] | status: active #${d} #foundations ^${lowP}-01",
    "- **${p}-02** (Title): WHEN ... → DO ... | why: ... | breaks: ... | conf: 4 | ev: [[CONVENTIONS]] [[OPERATING-PRINCIPLES]] | status: active #${d} #foundations ^${lowP}-02",
    "- **${p}-03** (Title): WHEN ... → DO ... | why: ... | breaks: ... | conf: 4 | ev: [[CONVENTIONS]] [[OPERATING-PRINCIPLES]] | status: active #${d} #foundations ^${lowP}-03"
  ]
}`;

  const validateRules = (parsed: any): { mentalModel: string; rules: string[] } | null => {
    if (!parsed || !Array.isArray(parsed.rules) || parsed.rules.length < 3) return null;
    const rules = parsed.rules.slice(0, 3).map((r: string) => r.trim());
    const mentalModel = parsed.mentalModel || `Foundational invariants governing ${domainInfo.title}.`;

    // Verify format for all 3 rules
    const isValid = rules.every((r: string, idx: number) => {
      const expectedId = `${p}-0${idx + 1}`;
      const expectedBlock = `^${lowP}-0${idx + 1}`;
      return (
        r.startsWith(`- **${expectedId}**`) &&
        r.includes(' | ') &&
        r.includes('WHEN ') &&
        r.includes(' → DO ') &&
        r.includes('status: active') &&
        r.endsWith(expectedBlock)
      );
    });

    if (isValid) {
      return { mentalModel, rules };
    }
    return null;
  };

  // 1. Primary: Gemini 3.8 Flash & Gemini 3.1 Flash-Lite
  if (geminiApiKey) {
    const candidateModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];
    for (const modelName of candidateModels) {
      try {
        const genAI = new GoogleGenerativeAI(geminiApiKey);
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json',
          },
        });
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout after 12s on ${modelName}`)), 12000)
        );
        const result = await Promise.race([model.generateContent(prompt), timeoutPromise]);
        const text = result.response.text();
        const cleaned = text.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
        const parsed = JSON.parse(cleaned);
        const valid = validateRules(parsed);
        if (valid) {
          console.log(`[Research Radar] Successfully synthesized rules for ${p} via ${modelName}`);
          return valid;
        }
      } catch (err: any) {
        console.warn(`[Research Radar] Gemini model ${modelName} synthesis failed:`, err?.message);
      }
    }
  }

  // 2. Failover: OpenRouter (meta-llama/llama-3.3-70b-instruct)
  if (openrouterApiKey) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 12000);
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openrouterApiKey}`,
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.3-70b-instruct',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.2,
          response_format: { type: 'json_object' },
        }),
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (res.ok) {
        const data = await res.json();
        const content = data?.choices?.[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content);
          const valid = validateRules(parsed);
          if (valid) {
            console.log(`[Research Radar] Successfully synthesized rules for ${p} via OpenRouter`);
            return valid;
          }
        }
      }
    } catch (err: any) {
      console.warn('[Research Radar] OpenRouter synthesis failover failed:', err?.message);
    }
  }

  // 3. Failover: Groq
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
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.2,
          response_format: { type: 'json_object' },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const content = data?.choices?.[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content);
          const valid = validateRules(parsed);
          if (valid) return valid;
        }
      }
    } catch (err: any) {
      console.warn('[Research Radar] Groq synthesis failover failed:', err?.message);
    }
  }

  // 3. Failover: NVIDIA NIM
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
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.2,
          response_format: { type: 'json_object' },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const content = data?.choices?.[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content);
          const valid = validateRules(parsed);
          if (valid) return valid;
        }
      }
    } catch (err: any) {
      console.warn('[Research Radar] NVIDIA NIM failover failed:', err?.message);
    }
  }

  // 4. Deterministic CV-02 Fallback
  console.log(`[Research Radar] Applying deterministic foundation rules for ${d} (${p})`);
  return getDeterministicFoundations(domainInfo);
}

/**
 * Main Handler for /api/research: Domain Seeding Pipeline
 * Triggered bi-weekly on the 1st and 15th (6:00 AM UTC) or via manual authenticated call.
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

    // Step 1 (Scan): Read all files in brain/02-domains/ and identify empty domains (status: draft & _None yet._)
    const { emptyDomains, domainsDir } = scanEmptyDomains();
    console.log(`[Research Radar] Scanned brain/02-domains: found ${emptyDomains.length} empty domains.`);

    if (emptyDomains.length === 0) {
      return NextResponse.json({
        ok: true,
        pipeline: 'Domain Seeding Pipeline',
        message: 'All domains in the Cortex Vault have been successfully seeded! No draft domains remain.',
        remainingEmptyDomains: 0,
      });
    }

    // Step 2 (Select): Select ONE domain (allow ?domain=... override for targeted seeding, else random)
    let selectedDomain: EmptyDomainInfo;
    if (requestedDomain) {
      const target = emptyDomains.find(
        (d) =>
          d.domain.toLowerCase() === requestedDomain.toLowerCase() ||
          d.filename.toLowerCase() === requestedDomain.toLowerCase() ||
          d.prefix.toLowerCase() === requestedDomain.toLowerCase()
      );
      if (target) {
        selectedDomain = target;
      } else {
        selectedDomain = emptyDomains[Math.floor(Math.random() * emptyDomains.length)];
      }
    } else {
      selectedDomain = emptyDomains[Math.floor(Math.random() * emptyDomains.length)];
    }

    console.log(
      `[Research Radar] Selected target domain for foundational seeding: ${selectedDomain.domain} (${selectedDomain.prefix})`
    );

    // Step 3 (Research & Synthesize): Generate 3 foundational rules adhering to CV-02 and ARB-06
    const { mentalModel, rules } = await synthesizeFoundations(selectedDomain);

    // Step 4 (Update the File): Update existing markdown content
    let updatedContent = selectedDomain.content;

    // 4.1 Update frontmatter: draft -> active
    updatedContent = updatedContent.replace(/^status:\s*draft$/m, 'status: active');

    // 4.2 Update status header if present
    updatedContent = updatedContent.replace(
      />\s*Status:\s*`draft`\s*\(0 active rules\)[^.\n]*\./i,
      `> Status: \`active\` (3 active rules). Foundational analytical invariants established via automated research seeding.`
    );

    // 4.3 Update Mental Model & Worldview section if present
    if (updatedContent.includes('## Mental Model & Worldview') && mentalModel) {
      updatedContent = updatedContent.replace(
        /(## Mental Model & Worldview[\r\n\s]+)_None yet\._/,
        `$1- ${mentalModel}`
      );
    }

    // 4.4 Update Rules section
    const rulesBlock = rules.join('\n');
    if (updatedContent.match(/## Rules[^\r\n]*[\r\n\s]+_None yet\._/)) {
      updatedContent = updatedContent.replace(
        /(## Rules[^\r\n]*[\r\n\s]+)_None yet\._/,
        `$1${rulesBlock}`
      );
    } else {
      updatedContent = updatedContent.replace('_None yet._', rulesBlock);
    }

    // Save locally if local file exists
    let savedLocally = false;
    try {
      if (fs.existsSync(selectedDomain.filePath)) {
        fs.writeFileSync(selectedDomain.filePath, updatedContent, 'utf8');
        savedLocally = true;
        console.log(`[Research Radar] Updated local file: ${selectedDomain.filePath}`);
      }
    } catch (fsErr: any) {
      console.warn('[Research Radar] Local disk write skipped (container/serverless environment):', fsErr?.message);
    }

    // Step 5 (Commit to GitHub): Commit updated domain file directly to main branch via GitHub API
    const githubToken = process.env.GITHUB_TOKEN;
    const repoSlug = process.env.GITHUB_REPO || 'dropoflife13/MyBrain';
    const branch = process.env.GITHUB_BRANCH || 'main';
    const gitPath = `brain/02-domains/${selectedDomain.filename}`;
    let committedToGit = false;
    let commitSha: string | null = null;

    const [owner, repo] = repoSlug.split('/');
    if (!owner || !repo) {
      throw new Error(`Invalid GITHUB_REPO format "${repoSlug}". Expected "owner/repo".`);
    }

    const octokit = new Octokit({ auth: githubToken });

    // Fetch existing file SHA for atomic update
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

    const commitRes = await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: gitPath,
      message: `chore(research): seed foundational rules for ${selectedDomain.domain}`,
      content: Buffer.from(updatedContent, 'utf8').toString('base64'),
      branch,
      sha: existingFileSha,
    });

    committedToGit = true;
    commitSha = commitRes.data.commit.sha || null;
    console.log(`[Research Radar] Successfully committed ${gitPath} to ${branch} (SHA: ${commitSha})`);

    const durationMs = Date.now() - startTime;

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
      committedToGit,
      commitSha,
      repo: repoSlug,
      branch,
      filePath: gitPath,
      durationMs,
    });
  } catch (error: any) {
    const errorMsg = error?.message || String(error) || 'Unknown error occurred in Domain Seeding pipeline';
    console.error('[Research Radar] Pipeline failure:', errorMsg);
    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    return await handleResearchPipeline(req);
  } catch (err: any) {
    console.error('[Research Radar] GET unhandled exception:', err);
    return NextResponse.json(
      { error: err?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    return await handleResearchPipeline(req);
  } catch (err: any) {
    console.error('[Research Radar] POST unhandled exception:', err);
    return NextResponse.json(
      { error: err?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
