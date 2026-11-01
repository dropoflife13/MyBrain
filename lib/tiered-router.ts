import fs from 'fs';
import path from 'path';
import { loadEmbeddings } from './embedder';

export type RouterTier = 'tier1_local' | 'tier2_fast' | 'tier3_heavy';

export interface TierClassification {
  tier: RouterTier;
  reason: string;
  ruleId?: string;
}

export interface VaultRuleMatch {
  ruleId: string;
  file: string;
  line: number;
  text: string;
}

const PREFIX_TO_AGENT_FILE: Record<string, string> = {
  DB: 'agents/dbaagent.md',
  CS: 'agents/securityagent.md',
  SEC: 'agents/securityagent.md',
  UX: 'agents/uiuxagent.md',
  UI: 'brain/02-domains/ui-frontend.md',
  TA: 'brain/01-identity/TASTE.md',
  PM: 'agents/productmanageragent.md',
  BA: 'brain/02-domains/business-analysis.md',
  OP: 'brain/01-identity/OPERATING-PRINCIPLES.md',
  SD: 'agents/systemsdesignagent.md',
  SO: 'brain/02-domains/solutions.md',
  IR: 'agents/integrationagent.md',
  RF: 'brain/03-heuristics/RED-FLAGS.md',
  H: 'brain/03-heuristics/HEURISTICS.md',
  P: 'brain/03-heuristics/PATTERNS.md',
  GR: 'agents/growthagent.md',
  RS: 'agents/researchagent.md',
  PSY: 'brain/02-domains/psychology.md',
  PHI: 'brain/02-domains/philosophy.md',
  RHE: 'brain/02-domains/rhetoric.md',
  ECO: 'brain/02-domains/economy.md',
  GEO: 'brain/02-domains/geopolitics.md',
  HLT: 'brain/02-domains/health.md',
  AUTH: 'brain/02-domains/authorization.md',
};

function resolveFilePath(relPath: string): string | null {
  const rootDir = process.cwd();
  const filename = path.basename(relPath);
  const candidates = [
    path.join(rootDir, relPath),
    path.join(rootDir, 'agents', filename),
    path.join(rootDir, 'public', 'agents', filename),
    path.join(rootDir, 'public', relPath),
    path.join(rootDir, 'brain', '04-agents', filename),
    path.join(rootDir, 'public', 'brain', '04-agents', filename),
    path.join(rootDir, 'brain', '02-domains', filename),
    path.join(rootDir, 'public', 'brain', '02-domains', filename),
    path.join(rootDir, 'brain', '01-identity', filename),
    path.join(rootDir, 'public', 'brain', '01-identity', filename),
    path.join(rootDir, 'brain', '03-heuristics', filename),
    path.join(rootDir, 'public', 'brain', '03-heuristics', filename),
    path.join(rootDir, 'brain', '07-meta', filename),
    path.join(rootDir, 'public', 'brain', '07-meta', filename),
    path.join(rootDir, 'brain-web', relPath),
    path.join(rootDir, 'brain-web', 'agents', filename),
    path.join(rootDir, 'brain-web', 'public', 'agents', filename),
    path.join(rootDir, 'brain-web', 'brain', '04-agents', filename),
    path.resolve(__dirname, '../../../', relPath),
    path.resolve(__dirname, '../../../../', relPath),
    path.resolve(rootDir, '.next', 'server', relPath),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

export function extractRuleIdFromQuery(query: string): string | null {
  const clean = query.trim().replace(/[?!.]+$/, '').trim();
  // 1. Direct rule ID: "DB-13", "sec-02", "cs-01", "auth-03"
  if (/^[A-Za-z]{1,5}-\d+$/i.test(clean)) {
    return clean.toUpperCase();
  }
  // 2. Natural language single-rule lookups:
  // "What is SEC-02?", "Tell me about rule DB-13", "Explain DB-14", "Show rule UX-01", "Lookup DB-01", "What does DB-13 say?"
  const pattern =
    /^(?:what\s+(?:is|does)\s+(?:the\s+)?(?:rule\s+)?|explain\s+(?:the\s+)?(?:rule\s+)?|show\s+(?:me\s+)?(?:the\s+)?(?:rule\s+)?|tell\s+me\s+about\s+(?:the\s+)?(?:rule\s+)?|rule\s+|lookup\s+(?:rule\s+)?|describe\s+(?:the\s+)?(?:rule\s+)?|get\s+(?:rule\s+)?|check\s+(?:rule\s+)?|find\s+(?:rule\s+)?)\s*([A-Za-z]{1,5}-\d+)(?:\s+(?:say|mean|state))?$/i;
  const match = clean.match(pattern);
  if (match) {
    return match[1].toUpperCase();
  }
  return null;
}

export function findRuleInVault(ruleId: string): VaultRuleMatch | null {
  const normId = ruleId.trim().toUpperCase();

  // 1. Lookup in indexed vector embeddings (fastest, memory-resident)
  try {
    const embeddings = loadEmbeddings();
    const hit = embeddings.find((r) => r.ruleId.toUpperCase() === normId);
    if (hit) {
      return {
        ruleId: hit.ruleId,
        file: hit.file,
        line: hit.line,
        text: hit.text,
      };
    }
  } catch {}

  // 2. Direct regex scan in vault markdown files as robust fallback
  const prefixMatch = normId.match(/^([A-Z]{1,5})-\d+/);
  const candidateFiles: string[] = [];
  if (prefixMatch && PREFIX_TO_AGENT_FILE[prefixMatch[1]]) {
    candidateFiles.push(PREFIX_TO_AGENT_FILE[prefixMatch[1]]);
  }

  candidateFiles.push(
    'agents/dbaagent.md',
    'agents/securityagent.md',
    'agents/uiuxagent.md',
    'agents/productmanageragent.md',
    'agents/systemsdesignagent.md',
    'agents/integrationagent.md',
    'agents/growthagent.md',
    'agents/researchagent.md',
    'brain/02-domains/authorization.md',
    'brain/02-domains/cybersec.md',
    'brain/02-domains/solutions.md',
    'brain/02-domains/business-analysis.md',
    'brain/02-domains/ui-frontend.md',
    'brain/01-identity/OPERATING-PRINCIPLES.md',
    'brain/01-identity/TASTE.md',
    'brain/03-heuristics/HEURISTICS.md',
    'brain/03-heuristics/PATTERNS.md',
    'brain/03-heuristics/RED-FLAGS.md'
  );

  for (const rel of candidateFiles) {
    const full = resolveFilePath(rel);
    if (!full || !fs.existsSync(full)) continue;

    const content = fs.readFileSync(full, 'utf8');
    const lines = content.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const match = line.match(new RegExp(`^-\\s+\\*\\*(${normId})\\*\\*:?\\s*(.+)`, 'i'));
      if (match) {
        return {
          ruleId: match[1].toUpperCase(),
          file: rel,
          line: i + 1,
          text: `${match[1].toUpperCase()}: ${match[2].trim()}`,
        };
      }
    }
  }

  return null;
}

export function classifyTierLightweight(
  query: string,
  isWorkflow: boolean,
  hasImage?: boolean
): TierClassification {
  const q = query.trim();
  const lower = q.toLowerCase();

  // Tier 3 Check: Workflow commands (/implement, /harden, etc.), image attachments, or complex multi-step reasoning
  if (isWorkflow) {
    return {
      tier: 'tier3_heavy',
      reason: 'Golden Path workflow command detected',
    };
  }

  if (hasImage) {
    return {
      tier: 'tier3_heavy',
      reason: 'Multimodal vision query requires heavy vision model',
    };
  }

  if (
    lower.startsWith('/implement') ||
    lower.startsWith('/harden') ||
    lower.startsWith('/to-spec') ||
    lower.startsWith('/review') ||
    lower.startsWith('/pitch') ||
    lower.startsWith('/grill') ||
    lower.startsWith('/research') ||
    lower.includes('/implement') ||
    lower.includes('/harden')
  ) {
    return {
      tier: 'tier3_heavy',
      reason: 'Heavy command detected (/implement or /harden)',
    };
  }

  const isComplexMultiStep =
    /\b(step[- ]by[- ]step|multi[- ]step|end[- ]to[- ]end|threat model|stride analysis|refactor the entire|architecture specification|migration plan|benchmark analysis|deep dive)\b/i.test(
      q
    ) ||
    (q.includes('1.') && q.includes('2.') && q.includes('3.')) ||
    (q.split('?').length > 3 && q.length > 300);

  if (isComplexMultiStep) {
    return {
      tier: 'tier3_heavy',
      reason: 'Complex multi-step reasoning or architecture inquiry detected',
    };
  }

  // Tier 1 Check: Direct rule ID lookup (e.g. "DB-13" or "What is SEC-02?")
  const extractedRuleId = extractRuleIdFromQuery(q);
  if (extractedRuleId) {
    const vaultMatch = findRuleInVault(extractedRuleId);
    if (vaultMatch) {
      return {
        tier: 'tier1_local',
        reason: `Canonical rule [${extractedRuleId}] matched in vault (${vaultMatch.file})`,
        ruleId: extractedRuleId,
      };
    }
  }

  // Tier 2: Default fast model for conversational queries and simple questions (e.g. "Summarize my security rules")
  return {
    tier: 'tier2_fast',
    reason: 'Simple question or conversational query (fast utility tier)',
  };
}

