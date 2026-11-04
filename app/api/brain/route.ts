import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import fs from 'fs';
import path from 'path';
import {
  BrainDocNode,
  getBrainData,
  parseMarkdownNode,
  REQUIRED_SEVEN_AGENTS,
  verifySevenAgentsGate,
} from '../../../lib/brain-parser';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const RESPONSE_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: RESPONSE_HEADERS,
  });
}

function resolveDirectories(): { brainDir: string | null; agentsDir: string | null } {
  const root = process.cwd();
  const brainCandidates = [
    path.join(root, 'brain'),
    path.join(root, 'public', 'brain'),
    path.resolve(root, '..', 'brain'),
  ];
  const agentsCandidates = [
    path.join(root, 'agents'),
    path.join(root, 'public', 'agents'),
    path.resolve(root, '..', 'agents'),
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

function verifyAgentsOnDisk(agentsDir: string | null): {
  passed: boolean;
  ruleId: 'BN-00';
  missingAgents: string[];
  checkedDir: string | null;
} {
  if (!agentsDir || !fs.existsSync(agentsDir)) {
    return {
      passed: false,
      ruleId: 'BN-00',
      missingAgents: REQUIRED_SEVEN_AGENTS.map((a) => a.filename),
      checkedDir: agentsDir,
    };
  }

  const missingAgents: string[] = [];
  for (const agent of REQUIRED_SEVEN_AGENTS) {
    const fullPath = path.join(agentsDir, agent.filename);
    if (!fs.existsSync(fullPath)) {
      missingAgents.push(agent.filename);
    }
  }

  return {
    passed: missingAgents.length === 0,
    ruleId: 'BN-00',
    missingAgents,
    checkedDir: agentsDir,
  };
}

type VaultFileCategory = Parameters<typeof parseMarkdownNode>[2];

function buildDynamicFileMap(
  brainDir: string | null,
  agentsDir: string | null
): Array<{
  id: string;
  base: 'brain' | 'agents';
  rel: string;
  category: VaultFileCategory;
}> {
  const baseMap: Array<{
    id: string;
    base: 'brain' | 'agents';
    rel: string;
    category: VaultFileCategory;
  }> = [
    { id: '00-INDEX', base: 'brain', rel: '00-INDEX.md', category: 'workflow' },
    { id: 'ABOUT-ME', base: 'brain', rel: '01-identity/ABOUT-ME.md', category: 'identity' },
    { id: 'OPERATING-PRINCIPLES', base: 'brain', rel: '01-identity/OPERATING-PRINCIPLES.md', category: 'identity' },
    { id: 'TASTE', base: 'brain', rel: '01-identity/TASTE.md', category: 'identity' },
    { id: 'authorization', base: 'brain', rel: '02-domains/authorization.md', category: 'domain' },
    { id: 'cybersec', base: 'brain', rel: '02-domains/cybersec.md', category: 'domain' },
    { id: 'database', base: 'brain', rel: '02-domains/database.md', category: 'domain' },
    { id: 'empathy-personas', base: 'brain', rel: '02-domains/empathy-personas.md', category: 'domain' },
    { id: 'solutions', base: 'brain', rel: '02-domains/solutions.md', category: 'domain' },
    { id: 'ui-frontend', base: 'brain', rel: '02-domains/ui-frontend.md', category: 'domain' },
    { id: 'arbiter', base: 'brain', rel: '02-domains/arbiter.md', category: 'domain' },
    { id: 'psychology', base: 'brain', rel: '02-domains/psychology.md', category: 'domain' },
    { id: 'economy', base: 'brain', rel: '02-domains/economy.md', category: 'domain' },
    { id: 'philosophy', base: 'brain', rel: '02-domains/philosophy.md', category: 'domain' },
    { id: 'health', base: 'brain', rel: '02-domains/health.md', category: 'domain' },
    { id: 'rhetoric', base: 'brain', rel: '02-domains/rhetoric.md', category: 'domain' },
    { id: 'geopolitics', base: 'brain', rel: '02-domains/geopolitics.md', category: 'domain' },
    { id: 'data-science', base: 'brain', rel: '02-domains/data-science.md', category: 'domain' },
    { id: 'literature', base: 'brain', rel: '02-domains/literature.md', category: 'domain' },
    { id: 'art', base: 'brain', rel: '02-domains/art.md', category: 'domain' },
    { id: 'education', base: 'brain', rel: '02-domains/education.md', category: 'domain' },
    { id: 'marketing', base: 'brain', rel: '02-domains/marketing.md', category: 'domain' },
    { id: 'management', base: 'brain', rel: '02-domains/management.md', category: 'domain' },
    { id: 'law', base: 'brain', rel: '02-domains/law.md', category: 'domain' },
    { id: 'politics', base: 'brain', rel: '02-domains/politics.md', category: 'domain' },
    { id: 'environment', base: 'brain', rel: '02-domains/environment.md', category: 'domain' },
    { id: 'history', base: 'brain', rel: '02-domains/history.md', category: 'domain' },
    { id: 'crypto', base: 'brain', rel: '02-domains/crypto.md', category: 'domain' },
    { id: 'finance', base: 'brain', rel: '02-domains/finance.md', category: 'domain' },
    { id: 'news', base: 'brain', rel: '02-domains/news.md', category: 'domain' },
    { id: 'business', base: 'brain', rel: '02-domains/business.md', category: 'domain' },
    { id: 'science', base: 'brain', rel: '02-domains/science.md', category: 'domain' },
    { id: 'medicine', base: 'brain', rel: '02-domains/medicine.md', category: 'domain' },
    { id: 'HEURISTICS', base: 'brain', rel: '03-heuristics/HEURISTICS.md', category: 'heuristic' },
    { id: 'PATTERNS', base: 'brain', rel: '03-heuristics/PATTERNS.md', category: 'heuristic' },
    { id: 'RED-FLAGS', base: 'brain', rel: '03-heuristics/RED-FLAGS.md', category: 'heuristic' },
    { id: 'THE-TEST', base: 'brain', rel: '05-elicitation/THE-TEST.md', category: 'workflow' },
    { id: 'DIGEST', base: 'brain', rel: '07-meta/DIGEST.md', category: 'workflow' },
    { id: 'productmanageragent', base: 'agents', rel: 'productmanageragent.md', category: 'agent' },
    { id: 'uiuxagent', base: 'agents', rel: 'uiuxagent.md', category: 'agent' },
    { id: 'growthagent', base: 'agents', rel: 'growthagent.md', category: 'agent' },
    { id: 'systemsdesignagent', base: 'agents', rel: 'systemsdesignagent.md', category: 'agent' },
    { id: 'integrationagent', base: 'agents', rel: 'integrationagent.md', category: 'agent' },
    { id: 'dbaagent', base: 'agents', rel: 'dbaagent.md', category: 'agent' },
    { id: 'securityagent', base: 'agents', rel: 'securityagent.md', category: 'agent' },
    { id: 'researchagent', base: 'agents', rel: 'researchagent.md', category: 'agent' },
  ];

  const seenIds = new Set(baseMap.map((m) => m.id.toLowerCase()));

  // Dynamically scan agents/*.md for any newly added agent files
  if (agentsDir && fs.existsSync(agentsDir)) {
    try {
      for (const file of fs.readdirSync(agentsDir)) {
        if (file.endsWith('.md') && file.toLowerCase() !== 'readme.md' && !file.startsWith('_')) {
          const id = path.basename(file, '.md');
          if (!seenIds.has(id.toLowerCase())) {
            seenIds.add(id.toLowerCase());
            baseMap.push({
              id,
              base: 'agents',
              rel: file,
              category: 'agent',
            });
          }
        }
      }
    } catch {}
  }

  // Dynamically scan brain/02-domains/*.md for any newly added domain files
  if (brainDir && fs.existsSync(brainDir)) {
    const domainsDir = path.join(brainDir, '02-domains');
    if (fs.existsSync(domainsDir)) {
      try {
        for (const file of fs.readdirSync(domainsDir)) {
          if (file.endsWith('.md') && !file.startsWith('_') && file.toLowerCase() !== 'readme.md') {
            const id = path.basename(file, '.md');
            if (!seenIds.has(id.toLowerCase())) {
              seenIds.add(id.toLowerCase());
              baseMap.push({
                id,
                base: 'brain',
                rel: `02-domains/${file}`,
                category: 'domain',
              });
            }
          }
        }
      } catch {}
    }
  }

  return baseMap;
}

function buildBrainPayload() {
  const { brainDir, agentsDir } = resolveDirectories();
  const diskGate = verifyAgentsOnDisk(agentsDir);
  const fileMap = buildDynamicFileMap(brainDir, agentsDir);

  if (!brainDir) {
    const fallback = getBrainData({ nodeCount: 360 });
    const graphGate = verifySevenAgentsGate(fallback.nodes);
    return {
      status: 200,
      body: {
        ...fallback,
        source: 'static-snapshot',
        gateStatus: diskGate.checkedDir ? diskGate : graphGate,
      },
    };
  }

  const liveById = new Map<string, BrainDocNode>();

  for (const item of fileMap) {
    const rootDir = item.base === 'agents' ? agentsDir : brainDir;
    if (!rootDir) continue;
    const fullPath = path.join(rootDir, item.rel);
    if (!fs.existsSync(fullPath)) continue;
    const raw = fs.readFileSync(fullPath, 'utf8');
    liveById.set(item.id, parseMarkdownNode(item.id, raw, item.category));
  }

  const graph = getBrainData({
    nodeCount: 360,
    liveOverrides: liveById,
  });

  if (!diskGate.passed) {
    const missingSet = new Set(
      diskGate.missingAgents.map((filename) => filename.replace(/\.md$/i, ''))
    );
    graph.nodes = graph.nodes.filter((n) => !missingSet.has(n.id));
    graph.links = graph.links.filter((l) => {
      const s = typeof l.source === 'object' ? (l.source as any).id : l.source;
      const t = typeof l.target === 'object' ? (l.target as any).id : l.target;
      return !missingSet.has(s) && !missingSet.has(t);
    });
  }

  return {
    status: diskGate.passed ? 200 : 422,
    body: {
      ...graph,
      source: 'live-vault',
      vaultDir: brainDir,
      agentsDir,
      gateStatus: diskGate,
      timestamp: new Date().toISOString(),
    },
  };
}

export async function GET() {
  try {
    const { status, body } = buildBrainPayload();
    return NextResponse.json(body, { status, headers: RESPONSE_HEADERS });
  } catch (error) {
    const fallback = getBrainData({ nodeCount: 360 });
    const graphGate = verifySevenAgentsGate(fallback.nodes);
    return NextResponse.json(
      {
        ...fallback,
        source: 'fallback-snapshot',
        gateStatus: graphGate,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { headers: RESPONSE_HEADERS }
    );
  }
}

export async function POST() {
  try {
    revalidatePath('/');
    revalidatePath('/console');
    revalidatePath('/profile');
    revalidatePath('/agents');
    revalidatePath('/hq');
    const { status, body } = buildBrainPayload();
    return NextResponse.json({ revalidated: true, ...body }, { status, headers: RESPONSE_HEADERS });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500, headers: RESPONSE_HEADERS }
    );
  }
}
