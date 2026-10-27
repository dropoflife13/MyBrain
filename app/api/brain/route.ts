import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import {
  getBrainData,
  parseMarkdownNode,
  BrainDocNode,
  REQUIRED_SEVEN_AGENTS,
} from '../../../lib/brain-parser';

export async function GET() {
  try {
    const baseGraph = getBrainData({ nodeCount: 360 });
    const rootDir = process.cwd();

    // Enforce BN-00: Verify all 7 Core Agent files exist in /agents
    const missingAgents: string[] = [];
    for (const agent of REQUIRED_SEVEN_AGENTS) {
      const fullAgentPath = path.join(rootDir, agent.file);
      if (!fs.existsSync(fullAgentPath)) {
        missingAgents.push(agent.filename);
      }
    }

    // Strict Architectural Halt: If any of the 7 Agents are missing, vanish 3D nodes and return failure
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
      const fullPath = path.join(rootDir, item.relPath);
      if (fs.existsSync(fullPath)) {
        const raw = fs.readFileSync(fullPath, 'utf8');
        liveById.set(item.id, parseMarkdownNode(item.id, raw, item.category));
      }
    }

    const updatedNodes = baseGraph.nodes.map((node) => {
      const live = liveById.get(node.id);
      if (live) {
        return {
          ...node,
          name: live.name,
          description: live.description,
          group: live.group,
          content: live.content,
          rules: live.rules,
        };
      }
      return node;
    });

    return NextResponse.json({
      nodes: updatedNodes,
      links: baseGraph.links,
      gateStatus: {
        passed: missingAgents.length === 0,
        ruleId: 'BN-00',
        missingAgents,
      },
    });
  } catch (error: any) {
    return NextResponse.json(getBrainData({ nodeCount: 360 }));
  }
}

export async function POST() {
  const rootDir = process.cwd();
  const missingAgents: string[] = [];
  for (const agent of REQUIRED_SEVEN_AGENTS) {
    const fullAgentPath = path.join(rootDir, agent.file);
    if (!fs.existsSync(fullAgentPath)) {
      missingAgents.push(agent.filename);
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
