import type { BrainDocNode } from './brain-parser';

/**
 * Mastery Target per Agent in the Weighted Scoring Engine (v2).
 * Each rule contributes its confidence weight (conf 1..5, default 1 if untagged).
 * 60 weighted points = 100% Mastery for a single Agent (e.g., 12 proven conf:5 rules or 15 conf:4 rules).
 */
export const TARGET_WEIGHTED_SCORE_PER_AGENT = 60;
export const TARGET_RULES_PER_AGENT = TARGET_WEIGHTED_SCORE_PER_AGENT;

export interface AgentStatConfig {
  id: string;
  code: 'DB' | 'SEC' | 'UX' | 'PM' | 'SD' | 'IR' | 'GR';
  label: string;
  fullName: string;
  file: string;
  prefixes: string[];
  description: string;
}

export const AGENT_STAT_CONFIGS: AgentStatConfig[] = [
  {
    id: 'dbaagent',
    code: 'DB',
    label: 'Database',
    fullName: 'Database Agent',
    file: 'agents/dbaagent.md',
    prefixes: ['DB'],
    description: 'Append-only immutability, RLS authoring, index optimization, migrations.',
  },
  {
    id: 'securityagent',
    code: 'SEC',
    label: 'Security',
    fullName: 'Security Agent',
    file: 'agents/securityagent.md',
    prefixes: ['SEC', 'CS'],
    description: 'Offensive & defensive security, RLS bypass suites, secret isolation.',
  },
  {
    id: 'uiuxagent',
    code: 'UX',
    label: 'UI / UX',
    fullName: 'UI/UX Agent',
    file: 'agents/uiuxagent.md',
    prefixes: ['UX', 'UI', 'TA'],
    description: 'Interaction design, cognitive friction, accessibility, cyber-terminal polish.',
  },
  {
    id: 'productmanageragent',
    code: 'PM',
    label: 'Product',
    fullName: 'Product Manager Agent',
    file: 'agents/productmanageragent.md',
    prefixes: ['PM', 'BA', 'OP', 'EP'],
    description: 'Interrogation, edge cases, scope boundary enforcement, acceptance criteria.',
  },
  {
    id: 'systemsdesignagent',
    code: 'SD',
    label: 'Systems',
    fullName: 'Systems Design Agent',
    file: 'agents/systemsdesignagent.md',
    prefixes: ['SD', 'SO'],
    description: 'Architecture boundaries, failure modes, data contracts, TRD authoring.',
  },
  {
    id: 'integrationagent',
    code: 'IR',
    label: 'Integration',
    fullName: 'Integration Agent',
    file: 'agents/integrationagent.md',
    prefixes: ['IR', 'RF', 'H', 'P'],
    description: 'External API contracts, offline sync queues, retry policies, webhooks.',
  },
  {
    id: 'growthagent',
    code: 'GR',
    label: 'Growth',
    fullName: 'Growth Agent',
    file: 'agents/growthagent.md',
    prefixes: ['GR'],
    description: 'Value synthesis, executive pitches, activation loops, viral mechanics.',
  },
];

export interface DimensionConfig {
  key: string;
  subject: string;
  label: string;
  prefixes: string[];
  agentCodes: Array<'DB' | 'SEC' | 'UX' | 'PM' | 'SD' | 'IR' | 'GR'>;
  agentCount: number;
  description: string;
}

export const DIMENSION_CONFIGS: DimensionConfig[] = [
  {
    key: 'security',
    subject: 'Security',
    label: 'Security',
    prefixes: ['SEC', 'CS'],
    agentCodes: ['SEC'],
    agentCount: 1, // 1 * 60 = 60 pts
    description: 'STRIDE threat modeling, RLS default-deny, privileged secret isolation, tamper-proof audit trails.',
  },
  {
    key: 'systems',
    subject: 'Systems',
    label: 'Systems',
    prefixes: ['SD', 'SO', 'DB'],
    agentCodes: ['SD', 'DB'],
    agentCount: 2, // 2 * 60 = 120 pts
    description: 'Append-only schema architecture, distributed queues, failure modes, data contracts.',
  },
  {
    key: 'empathy',
    subject: 'Empathy',
    label: 'Empathy',
    prefixes: ['PM', 'BA', 'OP', 'EP', 'UX', 'UI', 'TA'],
    agentCodes: ['PM', 'UX'],
    agentCount: 2, // 2 * 60 = 120 pts
    description: 'Problem edge-case interrogation, UI state hygiene, persona empathy, cognitive friction reduction.',
  },
  {
    key: 'execution',
    subject: 'Execution',
    label: 'Execution',
    prefixes: ['IR', 'RF', 'H', 'P', 'GR'],
    agentCodes: ['IR', 'GR'],
    agentCount: 2, // 2 * 60 = 120 pts
    description: 'Webhook verification, atomic ticket delivery, telemetry loops, viral growth mechanics.',
  },
  {
    key: 'capacity',
    subject: 'Capacity',
    label: 'Capacity',
    prefixes: ['ALL'],
    agentCodes: ['DB', 'SEC', 'UX', 'PM', 'SD', 'IR', 'GR'],
    agentCount: 7, // 7 * 60 = 420 pts
    description: 'Total confidence-weighted procedural heuristics and gatekeeper invariants in the vault.',
  },
];

export interface StatMetric {
  key: string;
  code?: string;
  agent?: string;
  fullName?: string;
  label: string;
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

export interface CortexStatsResult {
  level: {
    levelNumber: number;
    title: string;
    subtitle: string;
    totalRules: number;
    totalWeightedScore: number;
    avgConfidence: number;
  };
  targetRulesPerAgent: number;
  targetWeightedScorePerAgent: number;
  agents: Record<string, StatMetric>;
  agentList: StatMetric[];
  dimensions: StatMetric[];
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
function extractRulesAndWeights(input: StatsCalculationInput): {
  ruleMap: Map<string, { prefix: string; weight: number }>;
  prefixCounts: Record<string, number>;
  prefixWeights: Record<string, number>;
} {
  const ruleMap = new Map<string, { prefix: string; weight: number }>();

  const recordRule = (prefix: string, id: string, weight: number = 1) => {
    const cleanPrefix = prefix.toUpperCase();
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
      159;
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
    const percentage = Math.min(100, Math.round((weightedScore / target) * 100));
    const rawPercentage = Math.round((weightedScore / target) * 100);
    const avgConfidence = count > 0 ? Number((weightedScore / count).toFixed(2)) : 0;
    const isHighConfidence = weightedScore > target;
    const isUnverified = count >= 10 && avgConfidence < 2.0;
    const displayScore = Math.min(weightedScore, target);

    const metric: StatMetric = {
      key: cfg.code.toLowerCase(),
      code: cfg.code,
      agent: cfg.fullName,
      fullName: cfg.fullName,
      label: cfg.label,
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
      percentageText: isHighConfidence ? '100%+' : `${percentage}%`,
      fractionText: `${displayScore} / ${target} pts`,
      rawFractionText: `${weightedScore} / ${target} pts`,
      description: cfg.description,
    };

    agents[cfg.code] = metric;
    agentList.push(metric);
  }

  // 2. Calculate stats for the 5 Grouped Cognitive Dimensions
  const dimensions: StatMetric[] = [];

  for (const dim of DIMENSION_CONFIGS) {
    let count = 0;
    let weightedScore = 0;
    const target = dim.agentCount * TARGET_WEIGHTED_SCORE_PER_AGENT;

    if (dim.key === 'capacity') {
      count = totalUniqueRules;
      weightedScore = totalWeightedScore;
    } else if (ruleMap.size > 0) {
      ruleMap.forEach((val) => {
        if (dim.prefixes.includes(val.prefix)) {
          count += 1;
          weightedScore += val.weight;
        }
      });
    } else {
      count = dim.prefixes.reduce((sum, p) => sum + (prefixCounts[p] || 0), 0);
      weightedScore = dim.prefixes.reduce(
        (sum, p) => sum + (prefixWeights[p] ?? prefixCounts[p] ?? 0),
        0
      );
    }

    const percentage = Math.min(100, Math.round((weightedScore / target) * 100));
    const rawPercentage = Math.round((weightedScore / target) * 100);
    const avgConfidence = count > 0 ? Number((weightedScore / count).toFixed(2)) : 0;
    const isHighConfidence = weightedScore > target;
    const isUnverified = count >= 10 && avgConfidence < 2.0;
    const displayScore = Math.min(weightedScore, target);

    dimensions.push({
      key: dim.key,
      subject: dim.subject,
      label: dim.label,
      prefixes: dim.prefixes,
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
      description: dim.description,
    });
  }

  // 3. Operator Level & Title calculation (Weighted Quality Grade)
  let levelNumber = 1;
  let levelTitle = 'Level 1 Initiate';
  let levelSubtitle = 'Novice External Memory';

  if (totalWeightedScore >= 360) {
    levelNumber = 5;
    levelTitle = 'Level 5 Autonomous Mastermind';
    levelSubtitle = 'Comprehensive Proven Invariant Singularity';
  } else if (totalWeightedScore >= 240) {
    levelNumber = 4;
    levelTitle = 'Level 4 Principal Gatekeeper';
    levelSubtitle = 'High-Confidence Institutional Memory & Strict SDLC Governance';
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

  // 4a. Unverified Knowledge Diagnostics per Agent
  for (const agent of agentList) {
    if (agent.isUnverified) {
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

  // 4b. Low Mastery Diagnostics (< 30% of 60pt target)
  const dimMap = new Map(dimensions.map((d) => [d.key, d]));
  const secDim = dimMap.get('security');
  const sysDim = dimMap.get('systems');
  const empDim = dimMap.get('empathy');
  const execDim = dimMap.get('execution');
  const capDim = dimMap.get('capacity');

  if (secDim && secDim.percentage < 30) {
    blindSpots.push({
      type: 'low_mastery',
      stat: 'Security',
      percentage: secDim.percentage,
      avgConfidence: secDim.avgConfidence,
      ruleCount: secDim.count,
      label: 'Low Security Invariants',
      advice: 'Add defensive rules, STRIDE threat boundaries, or proven RLS bypass evidence (conf: 3–5) to securityagent.md and cybersec.md.',
      file: 'agents/securityagent.md',
    });
  }
  if (sysDim && sysDim.percentage < 30) {
    blindSpots.push({
      type: 'low_mastery',
      stat: 'Systems',
      percentage: sysDim.percentage,
      avgConfidence: sysDim.avgConfidence,
      ruleCount: sysDim.count,
      label: 'Low Systems Design',
      advice: 'Add architecture schemas, failure recovery modes, or database constraints with project evidence to systemsdesignagent.md and dbaagent.md.',
      file: 'agents/systemsdesignagent.md',
    });
  }
  if (empDim && empDim.percentage < 30) {
    blindSpots.push({
      type: 'low_mastery',
      stat: 'Empathy',
      percentage: empDim.percentage,
      avgConfidence: empDim.avgConfidence,
      ruleCount: empDim.count,
      label: 'Low User Empathy',
      advice: 'Add user constraints, cognitive friction limits, or interrogation criteria with session evidence to uiuxagent.md and productmanageragent.md.',
      file: 'agents/uiuxagent.md',
    });
  }
  if (execDim && execDim.percentage < 30) {
    blindSpots.push({
      type: 'low_mastery',
      stat: 'Execution',
      percentage: execDim.percentage,
      avgConfidence: execDim.avgConfidence,
      ruleCount: execDim.count,
      label: 'Low Execution & Delivery',
      advice: 'Add webhook verification, retry semantics, or delivery specifications to integrationagent.md and growthagent.md.',
      file: 'agents/integrationagent.md',
    });
  }
  if (capDim && capDim.percentage < 30) {
    blindSpots.push({
      type: 'low_mastery',
      stat: 'Capacity',
      percentage: capDim.percentage,
      avgConfidence: capDim.avgConfidence,
      ruleCount: capDim.count,
      label: 'Low Weighted Rule Capacity',
      advice: 'Your external memory vault needs higher-confidence rules. Extract tacit heuristics using /assess and link real project evidence (ev:).',
      file: 'brain/03-heuristics/HEURISTICS.md',
    });
  }

  // Also check individual agents below 30% that weren't already flagged as unverified
  for (const agent of agentList) {
    if (agent.percentage < 30 && !agent.isUnverified) {
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
    targetRulesPerAgent: TARGET_WEIGHTED_SCORE_PER_AGENT,
    targetWeightedScorePerAgent: TARGET_WEIGHTED_SCORE_PER_AGENT,
    agents,
    agentList,
    dimensions,
    blindSpots,
    prefixCounts,
    prefixWeights,
    totalUniqueRules,
    totalWeightedScore,
  };
}
