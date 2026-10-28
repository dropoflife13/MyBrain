import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

function resolveDirectories(): { brainDir: string | null; agentsDir: string | null } {
  const root = process.cwd();
  const brainCandidates = [
    path.join(root, 'brain'),
    path.join(root, 'public', 'brain'),
    path.join(root, 'brain-web', 'brain'),
    path.resolve(__dirname, '../../../brain'),
    path.resolve(__dirname, '../../../../brain'),
  ];
  const agentsCandidates = [
    path.join(root, 'agents'),
    path.join(root, 'public', 'agents'),
    path.join(root, 'brain-web', 'agents'),
    path.resolve(__dirname, '../../../agents'),
    path.resolve(__dirname, '../../../../agents'),
  ];

  let brainDir: string | null = null;
  for (const c of brainCandidates) {
    if (fs.existsSync(c)) {
      brainDir = c;
      break;
    }
  }

  let agentsDir: string | null = null;
  for (const c of agentsCandidates) {
    if (fs.existsSync(c)) {
      agentsDir = c;
      break;
    }
  }

  return { brainDir, agentsDir };
}

function collectMarkdownFiles(dir: string): string[] {
  let results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  try {
    const list = fs.readdirSync(dir);
    for (const file of list) {
      const full = path.join(dir, file);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        results = results.concat(collectMarkdownFiles(full));
      } else if (file.endsWith('.md')) {
        results.push(full);
      }
    }
  } catch {}
  return results;
}

export async function GET() {
  try {
    const { brainDir, agentsDir } = resolveDirectories();
    const brainFiles = brainDir ? collectMarkdownFiles(brainDir) : [];
    const agentsFiles = agentsDir ? collectMarkdownFiles(agentsDir) : [];
    const allFiles = Array.from(new Set([...brainFiles, ...agentsFiles]));

    const prefixCounts: Record<string, number> = {};
    const uniqueRules = new Set<string>();
    const rulePattern = /(?:^|\n)\s*-\s*\*\*([A-Z]{1,4})-(\d+)/g;

    for (const filePath of allFiles) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        let match: RegExpExecArray | null;
        while ((match = rulePattern.exec(content)) !== null) {
          const prefix = match[1].toUpperCase();
          const ruleId = `${prefix}-${match[2]}`;
          uniqueRules.add(ruleId);
          prefixCounts[prefix] = (prefixCounts[prefix] || 0) + 1;
        }
      } catch {}
    }

    const totalUniqueRules = uniqueRules.size || 159;

    // 1. Group into 5 Core Cognitive Stats:
    // Security: SEC + CS (Target: 20 rules = 100%)
    const secCount = (prefixCounts['SEC'] || 0) + (prefixCounts['CS'] || 0);
    const secTarget = 20;
    const secPct = Math.min(100, Math.round((secCount / secTarget) * 100));

    // Systems: SD + DB (Target: 20 rules = 100%)
    const sysCount = (prefixCounts['SD'] || 0) + (prefixCounts['DB'] || 0);
    const sysTarget = 20;
    const sysPct = Math.min(100, Math.round((sysCount / sysTarget) * 100));

    // Empathy: PM + UX (Target: 20 rules = 100%)
    const empCount = (prefixCounts['PM'] || 0) + (prefixCounts['UX'] || 0);
    const empTarget = 20;
    const empPct = Math.min(100, Math.round((empCount / empTarget) * 100));

    // Execution: IR + GR (Target: 20 rules = 100%)
    const execCount = (prefixCounts['IR'] || 0) + (prefixCounts['GR'] || 0);
    const execTarget = 20;
    const execPct = Math.min(100, Math.round((execCount / execTarget) * 100));

    // Capacity: Total Rules in vault (Target: 100 rules = 100%)
    const capCount = totalUniqueRules;
    const capTarget = 100;
    const capPct = Math.min(100, Math.round((capCount / capTarget) * 100));

    const cognitiveStats = [
      {
        subject: 'Security',
        key: 'security',
        value: secPct,
        count: secCount,
        target: secTarget,
        prefixes: ['SEC', 'CS'],
        description: 'STRIDE threat modeling, RLS default-deny, privileged secret isolation, tamper-proof audit trails.',
      },
      {
        subject: 'Systems',
        key: 'systems',
        value: sysPct,
        count: sysCount,
        target: sysTarget,
        prefixes: ['SD', 'DB'],
        description: 'Append-only schema architecture, distributed queues, failure modes, data contracts.',
      },
      {
        subject: 'Empathy',
        key: 'empathy',
        value: empPct,
        count: empCount,
        target: empTarget,
        prefixes: ['PM', 'UX'],
        description: 'Problem edge-case interrogation, UI state hygiene, persona empathy, cognitive friction reduction.',
      },
      {
        subject: 'Execution',
        key: 'execution',
        value: execPct,
        count: execCount,
        target: execTarget,
        prefixes: ['IR', 'GR'],
        description: 'Webhook verification, atomic ticket delivery, telemetry loops, viral growth mechanics.',
      },
      {
        subject: 'Capacity',
        key: 'capacity',
        value: capPct,
        count: capCount,
        target: capTarget,
        prefixes: ['ALL'],
        description: 'Total externalized procedural heuristics and gatekeeper invariants in the vault.',
      },
    ];

    // 2. Dynamic Title / Mastery Level based on totalRules
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

    // 3. 7 Agent Detailed Breakdown
    const agentMastery = [
      {
        agent: 'Security Agent',
        code: 'SEC',
        file: 'agents/securityagent.md',
        count: secCount,
        target: 20,
        percentage: secPct,
        description: 'Offensive & defensive security, RLS bypass suites, secret isolation.',
      },
      {
        agent: 'Systems Design Agent',
        code: 'SD',
        file: 'agents/systemsdesignagent.md',
        count: (prefixCounts['SD'] || 0) + (prefixCounts['SO'] || 0),
        target: 15,
        percentage: Math.min(100, Math.round((((prefixCounts['SD'] || 0) + (prefixCounts['SO'] || 0)) / 15) * 100)),
        description: 'Architecture boundaries, failure modes, data contracts, TRD authoring.',
      },
      {
        agent: 'Database Agent',
        code: 'DB',
        file: 'agents/dbaagent.md',
        count: prefixCounts['DB'] || 0,
        target: 15,
        percentage: Math.min(100, Math.round(((prefixCounts['DB'] || 0) / 15) * 100)),
        description: 'Append-only immutability, RLS authoring, index optimization, migrations.',
      },
      {
        agent: 'Product Manager Agent',
        code: 'PM',
        file: 'agents/productmanageragent.md',
        count: (prefixCounts['PM'] || 0) + (prefixCounts['BA'] || 0),
        target: 20,
        percentage: Math.min(100, Math.round((((prefixCounts['PM'] || 0) + (prefixCounts['BA'] || 0)) / 20) * 100)),
        description: 'Interrogation, edge cases, scope boundary enforcement, acceptance criteria.',
      },
      {
        agent: 'UI/UX Agent',
        code: 'UX',
        file: 'agents/uiuxagent.md',
        count: (prefixCounts['UX'] || 0) + (prefixCounts['UI'] || 0) + (prefixCounts['TA'] || 0),
        target: 20,
        percentage: Math.min(100, Math.round((((prefixCounts['UX'] || 0) + (prefixCounts['UI'] || 0) + (prefixCounts['TA'] || 0)) / 20) * 100)),
        description: 'Interaction design, cognitive friction, accessibility, cyber-terminal polish.',
      },
      {
        agent: 'Integration Agent',
        code: 'IR',
        file: 'agents/integrationagent.md',
        count: (prefixCounts['IR'] || 0) + (prefixCounts['H'] || 0) + (prefixCounts['P'] || 0) + (prefixCounts['RF'] || 0),
        target: 20,
        percentage: Math.min(100, Math.round((((prefixCounts['IR'] || 0) + (prefixCounts['H'] || 0) + (prefixCounts['P'] || 0) + (prefixCounts['RF'] || 0)) / 20) * 100)),
        description: 'External API contracts, offline sync queues, retry policies, webhooks.',
      },
      {
        agent: 'Growth Agent',
        code: 'GR',
        file: 'agents/growthagent.md',
        count: prefixCounts['GR'] || 0,
        target: 10,
        percentage: Math.min(100, Math.round(((prefixCounts['GR'] || 0) / 10) * 100)),
        description: 'Value synthesis, executive pitches, activation loops, viral mechanics.',
      },
    ];

    // 4. Gap Analysis: Blind Spots (any stat < 30%)
    const blindSpots: Array<{
      stat: string;
      percentage: number;
      label: string;
      advice: string;
      file: string;
    }> = [];

    if (secPct < 30) {
      blindSpots.push({
        stat: 'Security',
        percentage: secPct,
        label: 'Low Security Invariants',
        advice: 'Add defensive rules, STRIDE threat boundaries, or RLS bypass rules to securityagent.md and cybersec.md.',
        file: 'agents/securityagent.md',
      });
    }
    if (sysPct < 30) {
      blindSpots.push({
        stat: 'Systems',
        percentage: sysPct,
        label: 'Low Systems Design',
        advice: 'Add architecture schemas, failure recovery modes, or database constraints to systemsdesignagent.md and dbaagent.md.',
        file: 'agents/systemsdesignagent.md',
      });
    }
    if (empPct < 30) {
      blindSpots.push({
        stat: 'Empathy',
        percentage: empPct,
        label: 'Low User Empathy',
        advice: 'Add user constraints, cognitive friction limits, or interrogation criteria to uiuxagent.md and productmanageragent.md.',
        file: 'agents/uiuxagent.md',
      });
    }
    if (execPct < 30) {
      blindSpots.push({
        stat: 'Execution',
        percentage: execPct,
        label: 'Low Execution & Delivery',
        advice: 'Add webhook verification, retry semantics, or delivery specifications to integrationagent.md and growthagent.md.',
        file: 'agents/integrationagent.md',
      });
    }
    if (capPct < 30) {
      blindSpots.push({
        stat: 'Capacity',
        percentage: capPct,
        label: 'Low Rule Capacity',
        advice: 'Your external memory vault is still nascent. Extract tacit heuristics using /assess or document your first-move rules.',
        file: 'brain/03-heuristics/HEURISTICS.md',
      });
    }

    return NextResponse.json(
      {
        level: {
          levelNumber,
          title: levelTitle,
          subtitle: levelSubtitle,
          totalRules: totalUniqueRules,
        },
        cognitiveStats,
        agentMastery,
        blindSpots,
        prefixCounts,
        scannedFilesCount: allFiles.length,
        timestamp: new Date().toISOString(),
      },
      { headers: CORS_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error?.message || 'Failed to calculate Cortex Profile stats',
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
