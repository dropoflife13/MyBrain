import type { BrainDocNode } from './brain-parser';

export const TARGET_RULES_PER_AGENT = 20;

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
    agentCount: 1, // 1 * 20 = 20
    description: 'STRIDE threat modeling, RLS default-deny, privileged secret isolation, tamper-proof audit trails.',
  },
  {
    key: 'systems',
    subject: 'Systems',
    label: 'Systems',
    prefixes: ['SD', 'SO', 'DB'],
    agentCodes: ['SD', 'DB'],
    agentCount: 2, // 2 * 20 = 40
    description: 'Append-only schema architecture, distributed queues, failure modes, data contracts.',
  },
  {
    key: 'empathy',
    subject: 'Empathy',
    label: 'Empathy',
    prefixes: ['PM', 'BA', 'OP', 'EP', 'UX', 'UI', 'TA'],
    agentCodes: ['PM', 'UX'],
    agentCount: 2, // 2 * 20 = 40
    description: 'Problem edge-case interrogation, UI state hygiene, persona empathy, cognitive friction reduction.',
  },
  {
    key: 'execution',
    subject: 'Execution',
    label: 'Execution',
    prefixes: ['IR', 'RF', 'H', 'P', 'GR'],
    agentCodes: ['IR', 'GR'],
    agentCount: 2, // 2 * 20 = 40
    description: 'Webhook verification, atomic ticket delivery, telemetry loops, viral growth mechanics.',
  },
  {
    key: 'capacity',
    subject: 'Capacity',
    label: 'Capacity',
    prefixes: ['ALL'],
    agentCodes: ['DB', 'SEC', 'UX', 'PM', 'SD', 'IR', 'GR'],
    agentCount: 7, // 7 * 20 = 140
    description: 'Total externalized procedural heuristics and gatekeeper invariants in the vault.',
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
  count: number;
  displayCount: number;
  target: number;
  percentage: number;
  rawPercentage: number;
  isOverclocked: boolean;
  percentageText: string;
  fractionText: string;
  rawFractionText: string;
  description: string;
}

export interface BlindSpotMetric {
  stat: string;
  percentage: number;
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
  };
  targetRulesPerAgent: number;
  agents: Record<string, StatMetric>;
  agentList: StatMetric[];
  dimensions: StatMetric[];
  blindSpots: BlindSpotMetric[];
  prefixCounts: Record<string, number>;
  totalUniqueRules: number;
}

export type StatsCalculationInput =
  | BrainDocNode[]
  | {
      nodes?: BrainDocNode[];
      prefixCounts?: Record<string, number>;
      uniqueRules?: Set<string> | string[];
      totalRules?: number;
    }
  | string[];

/**
 * Deterministic helper to extract unique rules and prefix occurrences
 * from BrainDocNode array or raw string rules.
 */
function extractRulesAndPrefixes(input: StatsCalculationInput): {
  uniqueRules: Set<string>;
  prefixCounts: Record<string, number>;
} {
  const uniqueRules = new Set<string>();
  const prefixCounts: Record<string, number> = {};

  const recordRule = (prefix: string, id: string) => {
    const cleanPrefix = prefix.toUpperCase();
    const cleanId = id.toUpperCase();
    uniqueRules.add(cleanId);
    prefixCounts[cleanPrefix] = (prefixCounts[cleanPrefix] || 0) + 1;
  };

  if (Array.isArray(input)) {
    for (const item of input) {
      if (typeof item === 'string') {
        const m = item.match(/\b([A-Z]{1,4})-(\d+)\b/);
        if (m) {
          recordRule(m[1], `${m[1]}-${m[2]}`);
        }
      } else if (item && typeof item === 'object') {
        // BrainDocNode item
        const node = item as BrainDocNode;
        const cleanId = String(node.id).split('::')[0];
        const idMatch = cleanId.match(/^([A-Z]{1,4})-(\d+)/);
        if (idMatch) {
          recordRule(idMatch[1], `${idMatch[1]}-${idMatch[2]}`);
        }

        if (Array.isArray(node.rules)) {
          for (const r of node.rules) {
            const rm = r.match(/\b([A-Z]{1,4})-(\d+)\b/);
            if (rm) {
              recordRule(rm[1], `${rm[1]}-${rm[2]}`);
            }
          }
        }

        if (typeof node.content === 'string') {
          const rulePattern = /(?:^|\n)\s*-\s*\*\*([A-Z]{1,4})-(\d+)/g;
          let cm: RegExpExecArray | null;
          while ((cm = rulePattern.exec(node.content)) !== null) {
            recordRule(cm[1], `${cm[1]}-${cm[2]}`);
          }
        }
      }
    }
  } else if (input && typeof input === 'object') {
    if (input.prefixCounts) {
      Object.assign(prefixCounts, input.prefixCounts);
    }
    if (input.uniqueRules) {
      for (const r of input.uniqueRules) {
        uniqueRules.add(r.toUpperCase());
        const prefix = r.split('-')[0].toUpperCase();
        if (prefix && !prefixCounts[prefix]) {
          prefixCounts[prefix] = 1;
        }
      }
    }
    if (input.nodes && Array.isArray(input.nodes)) {
      const nested = extractRulesAndPrefixes(input.nodes);
      nested.uniqueRules.forEach((r) => uniqueRules.add(r));
      for (const [p, c] of Object.entries(nested.prefixCounts)) {
        prefixCounts[p] = Math.max(prefixCounts[p] || 0, c);
      }
    }
  }

  return { uniqueRules, prefixCounts };
}

/**
 * Centralized Cortex Stats Calculator.
 *
 * Enforces:
 * - TARGET_RULES_PER_AGENT = 20
 * - Dimension targets: 20 per agent involved (e.g. 2 agents = 40, Capacity = 140)
 * - Percentage formula: Math.min(100, Math.round((count / target) * 100))
 * - Capped display count: Math.min(count, target) to completely prevent impossible fractions like 22/20
 * - Overclocked status: count > target, showing 100%+ and triggering purple mastery glow
 */
export function calculateCortexStats(input: StatsCalculationInput): CortexStatsResult {
  const { uniqueRules, prefixCounts } = extractRulesAndPrefixes(input);

  const totalUniqueRules =
    (typeof input === 'object' && !Array.isArray(input) && input.totalRules) ||
    uniqueRules.size ||
    159;

  // 1. Calculate stats for the 7 Individual Agents
  const agents: Record<string, StatMetric> = {};
  const agentList: StatMetric[] = [];

  for (const cfg of AGENT_STAT_CONFIGS) {
    // Count unique rules matching this agent's prefixes
    let count = 0;
    const matchedRules = new Set<string>();

    for (const r of uniqueRules) {
      const p = r.split('-')[0].toUpperCase();
      if (cfg.prefixes.includes(p) || p === cfg.code) {
        matchedRules.add(r);
      }
    }

    if (matchedRules.size > 0) {
      count = matchedRules.size;
    } else {
      // Fallback to prefixCounts sum
      count = cfg.prefixes.reduce((sum, p) => sum + (prefixCounts[p] || 0), 0);
    }

    const target = TARGET_RULES_PER_AGENT;
    const percentage = Math.min(100, Math.round((count / target) * 100));
    const rawPercentage = Math.round((count / target) * 100);
    const isOverclocked = count > target;
    const displayCount = Math.min(count, target);

    const metric: StatMetric = {
      key: cfg.code.toLowerCase(),
      code: cfg.code,
      agent: cfg.fullName,
      fullName: cfg.fullName,
      label: cfg.label,
      file: cfg.file,
      prefixes: cfg.prefixes,
      count,
      displayCount,
      target,
      percentage,
      rawPercentage,
      isOverclocked,
      percentageText: isOverclocked ? '100%+' : `${percentage}%`,
      fractionText: `${displayCount} / ${target}`,
      rawFractionText: `${count} / ${target}`,
      description: cfg.description,
    };

    agents[cfg.code] = metric;
    agentList.push(metric);
  }

  // 2. Calculate stats for the 5 Grouped Cognitive Dimensions
  const dimensions: StatMetric[] = [];

  for (const dim of DIMENSION_CONFIGS) {
    let count = 0;
    const target = dim.agentCount * TARGET_RULES_PER_AGENT;

    if (dim.key === 'capacity') {
      count = totalUniqueRules;
    } else {
      const matched = new Set<string>();
      for (const r of uniqueRules) {
        const p = r.split('-')[0].toUpperCase();
        if (dim.prefixes.includes(p)) {
          matched.add(r);
        }
      }

      if (matched.size > 0) {
        count = matched.size;
      } else {
        count = dim.prefixes.reduce((sum, p) => sum + (prefixCounts[p] || 0), 0);
      }
    }

    const percentage = Math.min(100, Math.round((count / target) * 100));
    const rawPercentage = Math.round((count / target) * 100);
    const isOverclocked = count > target;
    const displayCount = Math.min(count, target);

    dimensions.push({
      key: dim.key,
      subject: dim.subject,
      label: dim.label,
      prefixes: dim.prefixes,
      count,
      displayCount,
      target,
      percentage,
      rawPercentage,
      isOverclocked,
      percentageText: isOverclocked ? '100%+' : `${percentage}%`,
      fractionText: `${displayCount} / ${target}`,
      rawFractionText: `${count} / ${target}`,
      description: dim.description,
    });
  }

  // 3. Operator Level & Title calculation
  let levelNumber = 1;
  let levelTitle = 'Level 1 Initiate';
  let levelSubtitle = 'Novice External Memory';

  if (totalUniqueRules >= 120) {
    levelNumber = 5;
    levelTitle = 'Level 5 Autonomous Mastermind';
    levelSubtitle = 'Comprehensive Invariant Singularity';
  } else if (totalUniqueRules >= 85) {
    levelNumber = 4;
    levelTitle = 'Level 4 Principal Gatekeeper';
    levelSubtitle = 'Deep Institutional Memory & Strict SDLC Governance';
  } else if (totalUniqueRules >= 50) {
    levelNumber = 3;
    levelTitle = 'Level 3 Systems Architect';
    levelSubtitle = 'Multi-Agent Production Governance';
  } else if (totalUniqueRules >= 20) {
    levelNumber = 2;
    levelTitle = 'Level 2 Associate Architect';
    levelSubtitle = 'Emerging Behavioral Invariants';
  }

  // 4. Gap Analysis (Blind Spots with percentage < 30%)
  const blindSpots: BlindSpotMetric[] = [];

  const dimMap = new Map(dimensions.map((d) => [d.key, d]));
  const secDim = dimMap.get('security');
  const sysDim = dimMap.get('systems');
  const empDim = dimMap.get('empathy');
  const execDim = dimMap.get('execution');
  const capDim = dimMap.get('capacity');

  if (secDim && secDim.percentage < 30) {
    blindSpots.push({
      stat: 'Security',
      percentage: secDim.percentage,
      label: 'Low Security Invariants',
      advice: 'Add defensive rules, STRIDE threat boundaries, or RLS bypass rules to securityagent.md and cybersec.md.',
      file: 'agents/securityagent.md',
    });
  }
  if (sysDim && sysDim.percentage < 30) {
    blindSpots.push({
      stat: 'Systems',
      percentage: sysDim.percentage,
      label: 'Low Systems Design',
      advice: 'Add architecture schemas, failure recovery modes, or database constraints to systemsdesignagent.md and dbaagent.md.',
      file: 'agents/systemsdesignagent.md',
    });
  }
  if (empDim && empDim.percentage < 30) {
    blindSpots.push({
      stat: 'Empathy',
      percentage: empDim.percentage,
      label: 'Low User Empathy',
      advice: 'Add user constraints, cognitive friction limits, or interrogation criteria to uiuxagent.md and productmanageragent.md.',
      file: 'agents/uiuxagent.md',
    });
  }
  if (execDim && execDim.percentage < 30) {
    blindSpots.push({
      stat: 'Execution',
      percentage: execDim.percentage,
      label: 'Low Execution & Delivery',
      advice: 'Add webhook verification, retry semantics, or delivery specifications to integrationagent.md and growthagent.md.',
      file: 'agents/integrationagent.md',
    });
  }
  if (capDim && capDim.percentage < 30) {
    blindSpots.push({
      stat: 'Capacity',
      percentage: capDim.percentage,
      label: 'Low Rule Capacity',
      advice: 'Your external memory vault is still nascent. Extract tacit heuristics using /assess or document your first-move rules.',
      file: 'brain/03-heuristics/HEURISTICS.md',
    });
  }

  return {
    level: {
      levelNumber,
      title: levelTitle,
      subtitle: levelSubtitle,
      totalRules: totalUniqueRules,
    },
    targetRulesPerAgent: TARGET_RULES_PER_AGENT,
    agents,
    agentList,
    dimensions,
    blindSpots,
    prefixCounts,
    totalUniqueRules,
  };
}
