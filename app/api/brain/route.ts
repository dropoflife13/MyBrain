import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import {
  getBrainData,
  parseMarkdownNode,
  BrainDocNode,
  REQUIRED_SEVEN_AGENTS,
} from '../../../lib/brain-parser';

// Resolve file paths reliably across local dev, monorepos, and Vercel serverless lambda environments
function resolveFilePath(relPath: string): string | null {
  const rootDir = process.cwd();
  const filename = path.basename(relPath);
  const candidates = [
    path.join(rootDir, relPath),
    path.join(rootDir, 'agents', filename),
    path.join(rootDir, 'brain', '04-agents', filename),
    path.join(rootDir, 'brain-web', relPath),
    path.join(rootDir, 'brain-web', 'agents', filename),
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

export async function GET() {
  try {
    const rootDir = process.cwd();

    // Check if the agents directory exists in any candidate location
    const hasAgentsDirectory = [
      path.join(rootDir, 'agents'),
      path.join(rootDir, 'brain', '04-agents'),
      path.join(rootDir, 'brain-web', 'agents'),
      path.join(rootDir, 'brain-web', 'brain', '04-agents'),
      path.resolve(__dirname, '../../../agents'),
      path.resolve(__dirname, '../../../../agents'),
    ].some((d) => fs.existsSync(d));

    // Enforce BN-00: Verify all 7 Core Agent files exist
    const missingAgents: string[] = [];
    if (hasAgentsDirectory) {
      for (const agent of REQUIRED_SEVEN_AGENTS) {
        const fullAgentPath = resolveFilePath(agent.file);
        if (!fullAgentPath) {
          missingAgents.push(agent.filename);
        }
      }
    }

    // Strict Architectural Halt (CS-07): If any of the 7 Agents are missing, vanish 3D nodes and return failure
    if (missingAgents.length > 0) {
      return NextResponse.json({
        nodes: [],
        links: [],
        gateStatus: {
          passed: false,
          ruleId: 'BN-00',
          missingAgents,
        },
      });
    }

    const fileMap: Array<{ id: string; relPath: string; category: BrainDocNode['category'] }> = [
      { id: 'dbaagent', relPath: 'agents/dbaagent.md', category: 'agent' },
      { id: 'securityagent', relPath: 'agents/securityagent.md', category: 'agent' },
      { id: 'uiuxagent', relPath: 'agents/uiuxagent.md', category: 'agent' },
      { id: 'productmanageragent', relPath: 'agents/productmanageragent.md', category: 'agent' },
      { id: 'systemsdesignagent', relPath: 'agents/systemsdesignagent.md', category: 'agent' },
      { id: 'integrationagent', relPath: 'agents/integrationagent.md', category: 'agent' },
      { id: 'growthagent', relPath: 'agents/growthagent.md', category: 'agent' },
      { id: 'cybersec', relPath: 'brain/02-domains/cybersec.md', category: 'domain' },
      { id: 'solutions', relPath: 'brain/02-domains/solutions.md', category: 'domain' },
      { id: 'business-analysis', relPath: 'brain/02-domains/business-analysis.md', category: 'domain' },
      { id: 'ui-frontend', relPath: 'brain/02-domains/ui-frontend.md', category: 'domain' },
      { id: 'empathy-personas', relPath: 'brain/02-domains/empathy-personas.md', category: 'domain' },
      { id: 'OPERATING-PRINCIPLES', relPath: 'brain/01-identity/OPERATING-PRINCIPLES.md', category: 'identity' },
      { id: 'TASTE', relPath: 'brain/01-identity/TASTE.md', category: 'identity' },
      { id: 'ABOUT-ME', relPath: 'brain/01-identity/ABOUT-ME.md', category: 'identity' },
      { id: 'HEURISTICS', relPath: 'brain/03-heuristics/HEURISTICS.md', category: 'heuristic' },
      { id: 'PATTERNS', relPath: 'brain/03-heuristics/PATTERNS.md', category: 'heuristic' },
      { id: 'RED-FLAGS', relPath: 'brain/03-heuristics/RED-FLAGS.md', category: 'heuristic' },
      { id: 'DIGEST', relPath: 'brain/07-meta/DIGEST.md', category: 'identity' },
    ];

    const liveById = new Map<string, BrainDocNode>();
    for (const item of fileMap) {
      const fullPath = resolveFilePath(item.relPath);
      if (fullPath && fs.existsSync(fullPath)) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          const node = parseMarkdownNode(item.id, content, item.category);
          liveById.set(item.id, node);
        } catch {
          // File read fallback
        }
      }
    }

    // Merge live parsed markdown nodes over the base 360-node topological constellation
    const liveGraph = getBrainData({
      nodeCount: 360,
      liveOverrides: liveById,
    });

    return NextResponse.json({
      nodes: liveGraph.nodes,
      links: liveGraph.links,
      gateStatus: {
        passed: true,
        ruleId: 'BN-00',
        missingAgents: [],
      },
      vaultAudit: liveGraph.vaultAudit,
    });
  } catch (error: any) {
    return NextResponse.json(getBrainData({ nodeCount: 360 }));
  }
}

export async function POST() {
  const rootDir = process.cwd();
  const hasAgentsDirectory = [
    path.join(rootDir, 'agents'),
    path.join(rootDir, 'brain', '04-agents'),
    path.join(rootDir, 'brain-web', 'agents'),
    path.join(rootDir, 'brain-web', 'brain', '04-agents'),
    path.resolve(__dirname, '../../../agents'),
    path.resolve(__dirname, '../../../../agents'),
  ].some((d) => fs.existsSync(d));

  const missingAgents: string[] = [];
  if (hasAgentsDirectory) {
    for (const agent of REQUIRED_SEVEN_AGENTS) {
      const fullAgentPath = resolveFilePath(agent.file);
      if (!fullAgentPath) {
        missingAgents.push(agent.filename);
      }
    }
  }

  if (missingAgents.length > 0) {
    return NextResponse.json(
      {
        error: 'GATE: FAIL BN-00 — Execution Halted. Missing 7-Agent Suite.',
        missingAgents: missingAgents.map((f) => `[ERROR: AGENT_NOT_FOUND: ${f}]`),
      },
      { status: 422 }
    );
  }

  return NextResponse.json({ ok: true });
}
