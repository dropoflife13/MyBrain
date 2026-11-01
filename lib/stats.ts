import { type BrainDocNode, getBrainData } from './brain-parser';

/**
 * Mastery Target per Agent in the Weighted Scoring Engine (v2).
 * Each rule contributes its confidence weight (conf 1..5, default 1 if untagged).
 * 60 weighted points = 100% Mastery for a single Agent (e.g., 12 proven conf:5 rules or 15 conf:4 rules).
 */
export const TARGET_WEIGHTED_SCORE_PER_AGENT = 60;
export const TARGET_RULES_PER_AGENT = TARGET_WEIGHTED_SCORE_PER_AGENT;

export type ClusterId = 'Engineering' | 'Humanities' | 'World' | 'Science' | string;

export interface AgentStatConfig {
  id: string;
  code: string;
  cluster: ClusterId;
  label: string;
  fullName: string;
  file: string;
  prefixes: string[];
  description: string;
}

export const AGENT_STAT_CONFIGS: AgentStatConfig[] = [
  // --- Cluster 1: Engineering & Core Governance (The 8 Core Agents + Judgment Arbiter) ---
  {
    id: 'dbaagent',
    code: 'DB',
    cluster: 'Engineering',
    label: 'Database',
    fullName: 'Database Agent',
    file: 'agents/dbaagent.md',
    prefixes: ['DB'],
    description: 'Append-only immutability, RLS authoring, index optimization, migrations.',
  },
  {
    id: 'securityagent',
    code: 'SEC',
    cluster: 'Engineering',
    label: 'Security',
    fullName: 'Security Agent',
    file: 'agents/securityagent.md',
    prefixes: ['SEC', 'CS', 'AUTH'],
    description: 'Offensive & defensive security, RLS bypass suites, externalized authorization, secret isolation, rate limits.',
  },
  {
    id: 'uiuxagent',
    code: 'UX',
    cluster: 'Engineering',
    label: 'UI / UX',
    fullName: 'UI/UX Agent',
    file: 'agents/uiuxagent.md',
    prefixes: ['UX', 'UI', 'TA'],
    description: 'Interaction design, cognitive friction, accessibility, cyber-terminal polish.',
  },
  {
    id: 'productmanageragent',
    code: 'PM',
    cluster: 'Engineering',
    label: 'Product',
    fullName: 'Product Manager Agent',
    file: 'agents/productmanageragent.md',
    prefixes: ['PM', 'BA', 'OP'],
    description: 'Interrogation, edge cases, scope boundary enforcement, acceptance criteria.',
  },
  {
    id: 'systemsdesignagent',
    code: 'SD',
    cluster: 'Engineering',
    label: 'Systems',
    fullName: 'Systems Design Agent',
    file: 'agents/systemsdesignagent.md',
    prefixes: ['SD', 'SO'],
    description: 'Architecture boundaries, failure modes, data contracts, TRD authoring.',
  },
  {
    id: 'integrationagent',
    code: 'IR',
    cluster: 'Engineering',
    label: 'Integration',
    fullName: 'Integration Agent',
    file: 'agents/integrationagent.md',
    prefixes: ['IR', 'RF', 'H', 'P'],
    description: 'External API contracts, offline sync queues, retry policies, webhooks.',
  },
  {
    id: 'growthagent',
    code: 'GR',
    cluster: 'Engineering',
    label: 'Growth',
    fullName: 'Growth Agent',
    file: 'agents/growthagent.md',
    prefixes: ['GR'],
    description: 'Value synthesis, executive pitches, activation loops, viral mechanics.',
  },
  {
    id: 'researchagent',
    code: 'RS',
    cluster: 'Engineering',
    label: 'Research',
    fullName: 'Research Agent',
    file: 'agents/researchagent.md',
    prefixes: ['RS'],
    description: 'Epistemic rigor, source verification, triangulation, anti-hallucination gates.',
  },
  {
    id: 'arbiter',
    code: 'ARB',
    cluster: 'Engineering',
    label: 'Arbiter',
    fullName: 'Judgment Arbiter',
    file: 'brain/02-domains/arbiter.md',
    prefixes: ['ARB'],
    description: 'Cross-domain conflict resolution, domain separation, precautionary principle, fact vs. opinion.',
  },

  // --- Cluster 2: Humanities & Enterprise (Inner Galactic Ring) ---
  {
    id: 'psychology',
    code: 'PSY',
    cluster: 'Humanities',
    label: 'Psychology',
    fullName: 'Psychology Domain',
    file: 'brain/02-domains/psychology.md',
    prefixes: ['PSY'],
    description: 'Behavioral economics, cognitive biases, mental models, emotional resonance.',
  },
  {
    id: 'philosophy',
    code: 'PHI',
    cluster: 'Humanities',
    label: 'Philosophy',
    fullName: 'Philosophy Domain',
    file: 'brain/02-domains/philosophy.md',
    prefixes: ['PHI'],
    description: 'Epistemology, ethical frameworks, dialectics, first-principles inquiry.',
  },
  {
    id: 'rhetoric',
    code: 'RHE',
    cluster: 'Humanities',
    label: 'Rhetoric',
    fullName: 'Rhetoric Domain',
    file: 'brain/02-domains/rhetoric.md',
    prefixes: ['RHE'],
    description: 'Persuasion, narrative framing, classical argumentation, voice and tone.',
  },
  {
    id: 'literature',
    code: 'LIT',
    cluster: 'Humanities',
    label: 'Literature',
    fullName: 'Literature Domain',
    file: 'brain/02-domains/literature.md',
    prefixes: ['LIT'],
    description: 'Narrative structure, literary criticism, intertextuality, and primary text analysis.',
  },
  {
    id: 'art',
    code: 'ART',
    cluster: 'Humanities',
    label: 'Art',
    fullName: 'Art & Aesthetics Domain',
    file: 'brain/02-domains/art.md',
    prefixes: ['ART'],
    description: 'Visual composition, art history, aesthetic theory, and creative synthesis.',
  },
  {
    id: 'education',
    code: 'EDU',
    cluster: 'Humanities',
    label: 'Education',
    fullName: 'Education & Pedagogy Domain',
    file: 'brain/02-domains/education.md',
    prefixes: ['EDU'],
    description: 'Instructional design, spaced repetition, cognitive load management, and mastery learning.',
  },
  {
    id: 'marketing',
    code: 'MKT',
    cluster: 'Humanities',
    label: 'Marketing',
    fullName: 'Marketing & Brand Domain',
    file: 'brain/02-domains/marketing.md',
    prefixes: ['MKT'],
    description: 'Brand positioning, audience segmentation, distribution channels, and conversion psychology.',
  },
  {
    id: 'management',
    code: 'MGT',
    cluster: 'Humanities',
    label: 'Management',
    fullName: 'Management & Operations Domain',
    file: 'brain/02-domains/management.md',
    prefixes: ['MGT'],
    description: 'Organizational design, team governance, operational cadence, and bottleneck resolution.',
  },

  // --- Cluster 3: Global & Society (Outer Galactic Ring) ---
  {
    id: 'economy',
    code: 'ECO',
    cluster: 'World',
    label: 'Economy',
    fullName: 'Economy Domain',
    file: 'brain/02-domains/economy.md',
    prefixes: ['ECO'],
    description: 'Market incentives, macroeconomic cycles, monetary dynamics, capital allocation.',
  },
  {
    id: 'geopolitics',
    code: 'GEO',
    cluster: 'World',
    label: 'Geopolitics',
    fullName: 'Geopolitics Domain',
    file: 'brain/02-domains/geopolitics.md',
    prefixes: ['GEO'],
    description: 'Global resource flows, international trade, sovereignty, statecraft.',
  },
  {
    id: 'health',
    code: 'HLT',
    cluster: 'World',
    label: 'Health',
    fullName: 'Health & Longevity Domain',
    file: 'brain/02-domains/health.md',
    prefixes: ['HLT'],
    description: 'Biological longevity, metabolic health, cognitive endurance, somatic baselines.',
  },
  {
    id: 'law',
    code: 'LAW',
    cluster: 'World',
    label: 'Law',
    fullName: 'Law & Jurisprudence Domain',
    file: 'brain/02-domains/law.md',
    prefixes: ['LAW'],
    description: 'Statutory interpretation, regulatory compliance, contractual liability, and due process.',
  },
  {
    id: 'politics',
    code: 'POL',
    cluster: 'World',
    label: 'Politics',
    fullName: 'Politics & Policy Domain',
    file: 'brain/02-domains/politics.md',
    prefixes: ['POL'],
    description: 'Institutional incentives, public policy analysis, coalition dynamics, and civic governance.',
  },
  {
    id: 'environment',
    code: 'ENV',
    cluster: 'World',
    label: 'Environment',
    fullName: 'Environment & Ecology Domain',
    file: 'brain/02-domains/environment.md',
    prefixes: ['ENV'],
    description: 'Ecological systems, climate resilience, carbon accounting, and resource sustainability.',
  },
  {
    id: 'history',
    code: 'HIS',
    cluster: 'World',
    label: 'History',
    fullName: 'History & Historiography Domain',
    file: 'brain/02-domains/history.md',
    prefixes: ['HIS'],
    description: 'Primary archival analysis, civilizational cycles, institutional evolution, and historical parallels.',
  },
  {
    id: 'crypto',
    code: 'CRY',
    cluster: 'World',
    label: 'Crypto',
    fullName: 'Crypto & Web3 Systems Domain',
    file: 'brain/02-domains/crypto.md',
    prefixes: ['CRY'],
    description: 'Cryptographic primitives, distributed consensus, on-chain verification, and protocol economics.',
  },
  {
    id: 'finance',
    code: 'FIN',
    cluster: 'World',
    label: 'Finance',
    fullName: 'Finance & Capital Markets Domain',
    file: 'brain/02-domains/finance.md',
    prefixes: ['FIN'],
    description: 'Valuation modeling, risk-adjusted returns, liquidity management, and balance-sheet discipline.',
  },
  {
    id: 'news',
    code: 'NWS',
    cluster: 'World',
    label: 'News & Media',
    fullName: 'News & Media Epistemology Domain',
    file: 'brain/02-domains/news.md',
    prefixes: ['NWS'],
    description: 'Media framing analysis, primary-source attribution, bias detection, and signal-to-noise filtering.',
  },
  {
    id: 'business',
    code: 'BIZ',
    cluster: 'World',
    label: 'Business',
    fullName: 'Business Strategy Domain',
    file: 'brain/02-domains/business.md',
    prefixes: ['BIZ'],
    description: 'Unit economics, competitive moats, pricing architecture, and enterprise go-to-market.',
  },

  // --- Cluster 4: Frontier & Science (Outer Galactic Ring) ---
  {
    id: 'data-science',
    code: 'DS',
    cluster: 'Science',
    label: 'Data Science',
    fullName: 'Data Science Domain',
    file: 'brain/02-domains/data-science.md',
    prefixes: ['DS'],
    description: 'Statistical inference, experimental design, causal modeling, and feature engineering.',
  },
  {
    id: 'science',
    code: 'SCI',
    cluster: 'Science',
    label: 'Science',
    fullName: 'Natural Sciences Domain',
    file: 'brain/02-domains/science.md',
    prefixes: ['SCI'],
    description: 'Empirical falsifiability, peer-reviewed replication standards, and physical modeling.',
  },
  {
    id: 'medicine',
    code: 'MED',
    cluster: 'Science',
    label: 'Medicine',
    fullName: 'Medicine & Clinical Domain',
    file: 'brain/02-domains/medicine.md',
    prefixes: ['MED'],
    description: 'Clinical trial hierarchy, pathophysiology, Precautionary Principle, and evidence-based boundaries.',
  },
];

export interface DimensionConfig {
  key: string;
  subject: string;
  label: string;
  cluster: ClusterId;
  prefixes: string[];
  agentCodes: string[];
  agentCount: number;
  description: string;
}

export const DIMENSION_CONFIGS: DimensionConfig[] = [
  {
    key: 'engineering',
    subject: 'Engineering Core',
    label: 'Engineering Core',
    cluster: 'Engineering',
    prefixes: ['DB', 'SEC', 'CS', 'AUTH', 'UX', 'UI', 'TA', 'PM', 'BA', 'OP', 'SD', 'SO', 'IR', 'RF', 'H', 'P', 'GR', 'RS', 'ARB'],
    agentCodes: ['PM', 'UX', 'GR', 'SD', 'IR', 'DB', 'SEC', 'RS', 'ARB'],
    agentCount: 9, // 9 * 60 = 540 pts
    description: 'Architecture, security, database immutability, UI/UX polish, research verification, and the Judgment Arbiter (The Galactic Core).',
  },
  {
    key: 'humanities',
    subject: 'Humanities & Enterprise',
    label: 'Humanities & Enterprise',
    cluster: 'Humanities',
    prefixes: ['PSY', 'PHI', 'RHE', 'LIT', 'ART', 'EDU', 'MKT', 'MGT'],
    agentCodes: ['PSY', 'PHI', 'RHE', 'LIT', 'ART', 'EDU', 'MKT', 'MGT'],
    agentCount: 8, // 8 * 60 = 480 pts
    description: 'Psychology, philosophy, rhetoric, literature, art, education, marketing, and management (Inner Galactic Ring).',
  },
  {
    key: 'world',
    subject: 'Global & Society',
    label: 'Global & Society',
    cluster: 'World',
    prefixes: ['ECO', 'GEO', 'HLT', 'LAW', 'POL', 'ENV', 'HIS', 'CRY', 'FIN', 'NWS', 'BIZ'],
    agentCodes: ['ECO', 'GEO', 'HLT', 'LAW', 'POL', 'ENV', 'HIS', 'CRY', 'FIN', 'NWS', 'BIZ'],
    agentCount: 11, // 11 * 60 = 660 pts
    description: 'Economy, geopolitics, health, law, politics, environment, history, crypto, finance, news, and business (Outer Galactic Ring).',
  },
  {
    key: 'science',
    subject: 'Frontier & Science',
    label: 'Frontier & Science',
    cluster: 'Science',
    prefixes: ['DS', 'SCI', 'MED'],
    agentCodes: ['DS', 'SCI', 'MED'],
    agentCount: 3, // 3 * 60 = 180 pts
    description: 'Data science, natural sciences, and clinical medicine governed by the Precautionary Principle (Outer Galactic Ring).',
  },
];

export interface StatMetric {
  id?: string;
  key: string;
  code?: string;
  agent?: string;
  fullName?: string;
  label: string;
  cluster?: ClusterId;
  subject?: string;
  file?: string;
  prefixes: string[];
  count: number; // Raw rule count
  weightedScore: number; // Sum of rule confidence weights (1..5 per rule)
  displayScore: number; // Math.min(weightedScore, target)
  displayCount: number; // Alias for displayScore for UI fraction compatibility
  target: number; // Target weighted points (60 per agent)
  percentage: number; // Capped 0-100: Math.min(100, Math.round((weightedScore / target) * 100))
  rawPercentage: number; // Uncapped percentage
  avgConfidence: number; // Average confidence (weightedScore / count)
  isHighConfidence: boolean; // weightedScore > target
  isOverclocked: boolean; // Alias for isHighConfidence
  isUnverified: boolean; // High rule count (>= 10 rules) with low average confidence (< 2.0)
  isUnseeded: boolean; // Domain has 0 rules (awaiting elicitation)
  status: 'seeded' | 'unseeded'; // Tagged status per audit protocol
  percentageText: string; // '100%+' when isHighConfidence, else `${percentage}%`
  fractionText: string; // `${displayScore} / ${target} pts`
  rawFractionText: string; // `${weightedScore} / ${target} pts`
  description: string;
}

export interface BlindSpotMetric {
  type?: 'low_mastery' | 'unverified';
  stat: string;
  percentage: number;
  avgConfidence?: number;
  ruleCount?: number;
  label: string;
  advice: string;
  file: string;
}

export interface ClusterGroup {
  id: ClusterId;
  name: string;
  description: string;
  agents: StatMetric[];
  seededAgents: StatMetric[];
  unseededAgents: StatMetric[];
  dimension: StatMetric;
}

export interface CortexStatsResult {
  level: {
    levelNumber: number;
    title: string;
    subtitle: string;
    totalRules: number;
    totalWeightedScore: number;
    avgConfidence: number;
  };
  totalAgents: number;
  totalRules: number;
  totalClusters: number;
  targetRulesPerAgent: number;
  targetWeightedScorePerAgent: number;
  agents: Record<string, StatMetric>;
  agentList: StatMetric[];
  seededAgentList: StatMetric[];
  unseededAgentList: StatMetric[];
  dimensions: StatMetric[];
  clusters: Record<ClusterId | string, ClusterGroup>;
  clusterList: ClusterGroup[];
  blindSpots: BlindSpotMetric[];
  prefixCounts: Record<string, number>;
  prefixWeights: Record<string, number>;
  totalUniqueRules: number;
  totalWeightedScore: number;
}

export interface RuleWeightRecord {
  id: string;
  prefix: string;
  weight: number;
}

export type StatsCalculationInput =
  | BrainDocNode[]
  | {
      nodes?: BrainDocNode[];
      prefixCounts?: Record<string, number>;
      prefixWeights?: Record<string, number>;
      ruleWeights?: Map<string, number> | Record<string, number> | RuleWeightRecord[];
      uniqueRules?: Set<string> | string[];
      totalRules?: number;
      markdownContents?: string[];
    }
  | string[];

/**
 * Extracts `conf: X` (1..5) from a rule line.
 * Defaults to 1 if `conf: 1` or if no `conf:` tag is present.
 */
export function parseConfidenceWeight(line: string): number {
  const confMatch = line.match(/\bconf:\s*([1-5])\b/i);
  if (!confMatch) return 1;
  const parsed = parseInt(confMatch[1], 10);
  if (Number.isNaN(parsed)) return 1;
  return Math.max(1, Math.min(5, parsed));
}

/**
 * Deterministic helper to extract unique rules, their confidence weights (1..5),
 * and per-prefix counts/weights from BrainDocNode[], markdown strings, or pre-parsed maps.
 */
export const VALID_RULE_PREFIXES = new Set(
  AGENT_STAT_CONFIGS.flatMap((a) => a.prefixes)
);

function extractRulesAndWeights(input: StatsCalculationInput): {
  ruleMap: Map<string, { prefix: string; weight: number }>;
  prefixCounts: Record<string, number>;
  prefixWeights: Record<string, number>;
} {
  const ruleMap = new Map<string, { prefix: string; weight: number }>();

  const recordRule = (prefix: string, id: string, weight: number = 1) => {
    const cleanPrefix = prefix.toUpperCase();
    if (!VALID_RULE_PREFIXES.has(cleanPrefix)) return;
    const cleanId = id.toUpperCase();
    const cleanWeight = Math.max(1, Math.min(5, weight));
    const existing = ruleMap.get(cleanId);
    if (!existing || cleanWeight > existing.weight) {
      ruleMap.set(cleanId, { prefix: cleanPrefix, weight: cleanWeight });
    }
  };

  const scanMarkdownText = (text: string) => {
    const lines = text.split(/\r?\n/);
    for (const rawLine of lines) {
      const m = rawLine.match(/^\s*-\s*\*\*([A-Z]{1,4})-(\d+)\*\*/);
      if (m) {
        const prefix = m[1].toUpperCase();
        const ruleId = `${prefix}-${m[2]}`;
        const weight = parseConfidenceWeight(rawLine);
        recordRule(prefix, ruleId, weight);
      }
    }
  };

  if (Array.isArray(input)) {
    for (const item of input) {
      if (typeof item === 'string') {
        if (item.includes('\n') || item.trim().startsWith('- **')) {
          scanMarkdownText(item);
        } else {
          const m = item.match(/\b([A-Z]{1,4})-(\d+)\b/);
          if (m) {
            recordRule(m[1], `${m[1]}-${m[2]}`, parseConfidenceWeight(item));
          }
        }
      } else if (item && typeof item === 'object') {
        const node = item as BrainDocNode;
        const cleanId = String(node.id).split('::')[0];
        const idMatch = cleanId.match(/^([A-Z]{1,4})-(\d+)/);
        if (idMatch) {
          recordRule(
            idMatch[1],
            `${idMatch[1]}-${idMatch[2]}`,
            node.description ? parseConfidenceWeight(node.description) : 1
          );
        }

        if (Array.isArray(node.rules)) {
          for (const r of node.rules) {
            const rm = r.match(/\b([A-Z]{1,4})-(\d+)\b/);
            if (rm) {
              recordRule(rm[1], `${rm[1]}-${rm[2]}`, parseConfidenceWeight(r));
            }
          }
        }

        if (typeof node.content === 'string') {
          scanMarkdownText(node.content);
        }
      }
    }
  } else if (input && typeof input === 'object') {
    if (Array.isArray(input.markdownContents)) {
      for (const md of input.markdownContents) {
        scanMarkdownText(md);
      }
    }

    if (input.nodes && Array.isArray(input.nodes)) {
      const nested = extractRulesAndWeights(input.nodes);
      nested.ruleMap.forEach((val, key) => {
        recordRule(val.prefix, key, val.weight);
      });
    }

    if (input.uniqueRules) {
      for (const r of input.uniqueRules) {
        const clean = r.toUpperCase();
        const prefix = clean.split('-')[0];
        if (prefix) {
          recordRule(prefix, clean, 1);
        }
      }
    }

    if (input.ruleWeights) {
      if (input.ruleWeights instanceof Map) {
        input.ruleWeights.forEach((w, id) => {
          const clean = id.toUpperCase();
          const prefix = clean.split('-')[0];
          if (prefix) recordRule(prefix, clean, w);
        });
      } else if (Array.isArray(input.ruleWeights)) {
        for (const item of input.ruleWeights) {
          recordRule(item.prefix, item.id, item.weight);
        }
      } else {
        for (const [id, w] of Object.entries(input.ruleWeights)) {
          const clean = id.toUpperCase();
          const prefix = clean.split('-')[0];
          if (prefix) recordRule(prefix, clean, Number(w) || 1);
        }
      }
    }
  }

  const prefixCounts: Record<string, number> = {};
  const prefixWeights: Record<string, number> = {};

  ruleMap.forEach(({ prefix, weight }) => {
    prefixCounts[prefix] = (prefixCounts[prefix] || 0) + 1;
    prefixWeights[prefix] = (prefixWeights[prefix] || 0) + weight;
  });

  if (input && typeof input === 'object' && !Array.isArray(input)) {
    if (input.prefixCounts && ruleMap.size === 0) {
      Object.assign(prefixCounts, input.prefixCounts);
    }
    if (input.prefixWeights && ruleMap.size === 0) {
      Object.assign(prefixWeights, input.prefixWeights);
    }
  }

  return { ruleMap, prefixCounts, prefixWeights };
}

/**
 * Centralized Cortex Weighted Stats Calculator (v2 — Quality > Quantity).
 *
 * Enforces:
 * - Confidence weights: conf: 1 (or untagged) = 1, conf: 2 = 2, conf: 3 = 3, conf: 4 = 4, conf: 5 = 5
 * - TARGET_WEIGHTED_SCORE_PER_AGENT = 60 weighted points per Agent
 * - Grouped dimension targets: 60 * agentCount (60 for 1 agent, 120 for 2 agents, 420 for Capacity)
 * - Percentage formula: Math.min(100, Math.round((weightedScore / target) * 100))
 * - High Confidence state: weightedScore > target (displays 100%+ and glowing purple styling)
 * - Unverified state: count >= 10 && avgConfidence < 2.0 (flags rules lacking real-world evidence)
 */
export function calculateCortexStats(input: StatsCalculationInput): CortexStatsResult {
  const { ruleMap, prefixCounts, prefixWeights } = extractRulesAndWeights(input);

  let totalUniqueRules = ruleMap.size;
  let totalWeightedScore = 0;
  ruleMap.forEach((v) => {
    totalWeightedScore += v.weight;
  });

  if (totalUniqueRules === 0 && typeof input === 'object' && !Array.isArray(input)) {
    totalUniqueRules =
      input.totalRules ||
      Object.values(prefixCounts).reduce((a, b) => a + b, 0) ||
      175;
    totalWeightedScore =
      Object.values(prefixWeights).reduce((a, b) => a + b, 0) ||
      totalUniqueRules;
  }

  const overallAvgConfidence =
    totalUniqueRules > 0 ? Number((totalWeightedScore / totalUniqueRules).toFixed(2)) : 0;

  // 1. Calculate stats for the 7 Individual Agents
  const agents: Record<string, StatMetric> = {};
  const agentList: StatMetric[] = [];

  for (const cfg of AGENT_STAT_CONFIGS) {
    let count = 0;
    let weightedScore = 0;

    if (ruleMap.size > 0) {
      ruleMap.forEach((val) => {
        if (cfg.prefixes.includes(val.prefix) || val.prefix === cfg.code) {
          count += 1;
          weightedScore += val.weight;
        }
      });
    } else {
      count = cfg.prefixes.reduce((sum, p) => sum + (prefixCounts[p] || 0), 0);
      weightedScore = cfg.prefixes.reduce(
        (sum, p) => sum + (prefixWeights[p] ?? prefixCounts[p] ?? 0),
        0
      );
    }

    const target = TARGET_WEIGHTED_SCORE_PER_AGENT;
    const isUnseeded = count === 0;
    const status: 'seeded' | 'unseeded' = isUnseeded ? 'unseeded' : 'seeded';
    const percentage = isUnseeded ? 0 : Math.min(100, Math.round((weightedScore / target) * 100));
    const rawPercentage = isUnseeded ? 0 : Math.round((weightedScore / target) * 100);
    const avgConfidence = count > 0 ? Number((weightedScore / count).toFixed(2)) : 0;
    const isHighConfidence = weightedScore > target;
    const isUnverified = count >= 10 && avgConfidence < 2.0;
    const displayScore = Math.min(weightedScore, target);

    const metric: StatMetric = {
      id: cfg.id,
      key: cfg.code.toLowerCase(),
      code: cfg.code,
      agent: cfg.fullName,
      fullName: cfg.fullName,
      label: cfg.label,
      cluster: cfg.cluster,
      file: cfg.file,
      prefixes: cfg.prefixes,
      count,
      weightedScore,
      displayScore,
      displayCount: displayScore,
      target,
      percentage,
      rawPercentage,
      avgConfidence,
      isHighConfidence,
      isOverclocked: isHighConfidence,
      isUnverified,
      isUnseeded,
      status,
      percentageText: isUnseeded ? 'Awaiting Elicitation' : isHighConfidence ? '100%+' : `${percentage}%`,
      fractionText: isUnseeded ? '0 rules (unseeded)' : `${displayScore} / ${target} pts`,
      rawFractionText: `${weightedScore} / ${target} pts`,
      description: cfg.description,
    };

    agents[cfg.code] = metric;
    agentList.push(metric);
  }

  // 2. Dynamically group agents into Clusters & calculate Cognitive Dimensions
  const CLUSTER_DESCRIPTIONS: Record<string, string> = {
    Engineering:
      'Architecture, security, database immutability, UI/UX polish, research verification, and the Judgment Arbiter (The Galactic Core).',
    Humanities:
      'Psychology, philosophy, rhetoric, literature, art, education, marketing, and management (Inner Galactic Ring).',
    World:
      'Economy, geopolitics, health, law, politics, environment, history, crypto, finance, news, and business (Outer Galactic Ring).',
    Science:
      'Data science, natural sciences, and clinical medicine governed by the Precautionary Principle (Outer Galactic Ring).',
  };

  const CLUSTER_NAMES: Record<string, string> = {
    Engineering: 'Engineering Core',
    Humanities: 'Humanities & Enterprise',
    World: 'Global & Society',
    Science: 'Frontier & Science',
  };

  const CLUSTER_SUBJECTS: Record<string, string> = {
    Engineering: 'Engineering Core',
    Humanities: 'Humanities & Enterprise',
    World: 'Global & Society',
    Science: 'Frontier & Science',
  };

  // Dynamically identify all clusters present in agentList
  const uniqueClusterIds: string[] = [];
  for (const a of agentList) {
    const c = a.cluster || 'Engineering';
    if (!uniqueClusterIds.includes(c)) {
      uniqueClusterIds.push(c);
    }
  }

  const dimensions: StatMetric[] = [];
  const clusters: Record<string, ClusterGroup> = {};

  for (const clusterId of uniqueClusterIds) {
    const clusterAgents = agentList.filter((a) => (a.cluster || 'Engineering') === clusterId);
    const clusterPrefixes = Array.from(new Set(clusterAgents.flatMap((a) => a.prefixes)));
    const target = clusterAgents.length * TARGET_WEIGHTED_SCORE_PER_AGENT;

    let count = 0;
    let weightedScore = 0;

    for (const a of clusterAgents) {
      count += a.count;
      weightedScore += a.weightedScore;
    }

    const percentage = target > 0 ? Math.min(100, Math.round((weightedScore / target) * 100)) : 0;
    const rawPercentage = target > 0 ? Math.round((weightedScore / target) * 100) : 0;
    const avgConfidence = count > 0 ? Number((weightedScore / count).toFixed(2)) : 0;
    const isHighConfidence = weightedScore > target;
    const isUnverified = count >= 10 && avgConfidence < 2.0;
    const displayScore = Math.min(weightedScore, target);

    const clusterDim: StatMetric = {
      key: clusterId.toLowerCase(),
      subject: CLUSTER_SUBJECTS[clusterId] || clusterId,
      label: CLUSTER_NAMES[clusterId] || `${clusterId} Cluster`,
      cluster: clusterId as ClusterId,
      prefixes: clusterPrefixes,
      count,
      weightedScore,
      displayScore,
      displayCount: displayScore,
      target,
      percentage,
      rawPercentage,
      avgConfidence,
      isHighConfidence,
      isOverclocked: isHighConfidence,
      isUnverified,
      percentageText: isHighConfidence ? '100%+' : `${percentage}%`,
      fractionText: `${displayScore} / ${target} pts`,
      rawFractionText: `${weightedScore} / ${target} pts`,
      description: CLUSTER_DESCRIPTIONS[clusterId] || `${clusterId} multi-agent cognitive cluster.`,
      status: count === 0 && clusterId !== 'Engineering' ? 'unseeded' : 'seeded',
      isUnseeded: count === 0 && clusterId !== 'Engineering',
    };

    dimensions.push(clusterDim);

    const seededAgents = clusterAgents.filter((a) => !a.isUnseeded);
    const unseededAgents = clusterAgents.filter((a) => a.isUnseeded);

    clusters[clusterId] = {
      id: clusterId as ClusterId,
      name: CLUSTER_NAMES[clusterId] || `${clusterId} Cluster`,
      description: clusterDim.description,
      agents: clusterAgents,
      seededAgents,
      unseededAgents,
      dimension: clusterDim,
    };
  }

  const clusterList: ClusterGroup[] = Object.values(clusters);

  // 3. Operator Level & Title calculation (Weighted Quality Grade)
  let levelNumber = 1;
  let levelTitle = 'Level 1 Initiate';
  let levelSubtitle = 'Novice External Memory';

  if (totalWeightedScore >= 420) {
    levelNumber = 5;
    levelTitle = 'Level 5 Autonomous Mastermind';
    levelSubtitle = 'Global Second Brain Singularity & Multi-Cluster Mastery';
  } else if (totalWeightedScore >= 240) {
    levelNumber = 4;
    levelTitle = 'Level 4 Principal Architect';
    levelSubtitle = 'High-Confidence Institutional Memory Across Clusters';
  } else if (totalWeightedScore >= 120) {
    levelNumber = 3;
    levelTitle = 'Level 3 Systems Architect';
    levelSubtitle = 'Multi-Agent Evidence-Backed Governance';
  } else if (totalWeightedScore >= 60) {
    levelNumber = 2;
    levelTitle = 'Level 2 Associate Architect';
    levelSubtitle = 'Emerging Behavioral Invariants';
  }

  // 4. Gap Analysis: Low Mastery (< 30%) & Unverified Knowledge (count >= 10 && avgConfidence < 2.0)
  const blindSpots: BlindSpotMetric[] = [];

  // 4a. Unverified Knowledge Diagnostics per Agent (Seeded only)
  for (const agent of agentList) {
    if (agent.isUnverified && !agent.isUnseeded) {
      blindSpots.push({
        type: 'unverified',
        stat: agent.fullName || agent.label,
        percentage: agent.percentage,
        avgConfidence: agent.avgConfidence,
        ruleCount: agent.count,
        label: `Unverified Knowledge: ${agent.fullName || agent.label}`,
        advice: `You have many rules for ${agent.fullName || agent.label} (${agent.count} rules, avg conf ${agent.avgConfidence.toFixed(1)}), but they lack evidence. Link them to sessions or projects to prove them.`,
        file: agent.file || 'agents/',
      });
    }
  }

  // 4b. Low Mastery Diagnostics (< 30% of target) for Clusters
  for (const dim of dimensions) {
    if (dim.percentage < 30) {
      blindSpots.push({
        type: 'low_mastery',
        stat: dim.subject || dim.label,
        percentage: dim.percentage,
        avgConfidence: dim.avgConfidence,
        ruleCount: dim.count,
        label: `Low ${dim.subject || dim.label} Mastery`,
        advice: `Add verified rules across ${dim.subject || dim.label} to meet the ${dim.target}-point cluster target.`,
        file: dim.prefixes[0] ? `agents/` : 'brain/',
      });
    }
  }

  // Also check individual agents below 30% that weren't already flagged as unverified and ARE seeded
  for (const agent of agentList) {
    if (agent.percentage < 30 && !agent.isUnverified && !agent.isUnseeded) {
      blindSpots.push({
        type: 'low_mastery',
        stat: agent.fullName || agent.label,
        percentage: agent.percentage,
        avgConfidence: agent.avgConfidence,
        ruleCount: agent.count,
        label: `Low Mastery: ${agent.fullName || agent.label}`,
        advice: `${agent.fullName || agent.label} is at ${agent.weightedScore} / ${agent.target} weighted pts (${agent.count} rules). Add proven rules (conf: 3–5) to reach the 60-point mastery benchmark.`,
        file: agent.file || 'agents/',
      });
    }
  }

  return {
    level: {
      levelNumber,
      title: levelTitle,
      subtitle: levelSubtitle,
      totalRules: totalUniqueRules,
      totalWeightedScore,
      avgConfidence: overallAvgConfidence,
    },
    totalAgents: agentList.length,
    totalRules: totalUniqueRules,
    totalClusters: Object.keys(clusters).length,
    targetRulesPerAgent: TARGET_WEIGHTED_SCORE_PER_AGENT,
    targetWeightedScorePerAgent: TARGET_WEIGHTED_SCORE_PER_AGENT,
    agents,
    agentList,
    seededAgentList: agentList.filter((a) => !a.isUnseeded),
    unseededAgentList: agentList.filter((a) => a.isUnseeded),
    dimensions,
    clusters,
    clusterList,
    blindSpots,
    prefixCounts,
    prefixWeights,
    totalUniqueRules,
    totalWeightedScore,
  };
}

/**
 * Master API to retrieve comprehensive cognitive stats.
 * Returns TOTAL counts (totalAgents, totalRules, totalClusters) and dynamic cluster groupings.
 */
export function getCognitiveStats(input?: StatsCalculationInput): CortexStatsResult {
  if (!input) {
    try {
      const brainData = getBrainData({ mode: 'assessed' });
      return calculateCortexStats(brainData.nodes);
    } catch {
      return calculateCortexStats([]);
    }
  }
  return calculateCortexStats(input);
}
