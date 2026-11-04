import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import fs from 'fs';
import path from 'path';
import {
  AGENT_STAT_CONFIGS,
  type AgentStatConfig,
  calculateCortexStats,
} from '@/lib/stats';

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
  ];
  const agentsCandidates = [
    path.join(root, 'agents'),
    path.join(root, 'public', 'agents'),
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

// Known engineering domain sub-files whose rules roll up into the 8 Core Agents
const CORE_AGENT_SUBDOMAIN_FILES = new Set([
  'cybersec.md',
  'authorization.md',
  'ui-frontend.md',
  'solutions.md',
  'empathy-personas.md',
  'database.md',
]);

function discoverVaultFilesAndConfigs(brainDir: string | null, agentsDir: string | null): {
  allRuleFiles: string[];
  discoveredConfigs: AgentStatConfig[];
  totalCoreAgents: number;
  totalDomains: number;
} {
  const allRuleFiles: string[] = [];
  const discoveredConfigs: AgentStatConfig[] = [];
  const knownFiles = new Set(AGENT_STAT_CONFIGS.map((c) => path.basename(c.file).toLowerCase()));

  let totalCoreAgents = 0;
  let totalDomains = 0;

  if (agentsDir && fs.existsSync(agentsDir)) {
    try {
      for (const file of fs.readdirSync(agentsDir)) {
        if (file.endsWith('.md') && file.toLowerCase() !== 'readme.md' && !file.startsWith('_')) {
          const fullPath = path.join(agentsDir, file);
          allRuleFiles.push(fullPath);
          totalCoreAgents++;

          if (!knownFiles.has(file.toLowerCase())) {
            const raw = fs.readFileSync(fullPath, 'utf8');
            const id = path.basename(file, '.md');
            const h1 = raw.match(/^#\s+(.+)$/m)?.[1]?.trim() || id;
            const prefixMatches = Array.from(raw.matchAll(/^\s*-\s*\*\*([A-Z]{1,5})-\d+\*\*/gm)).map((m) =>
              m[1].toUpperCase()
            );
            const uniquePrefixes = Array.from(new Set(prefixMatches));
            const code = uniquePrefixes[0] || id.slice(0, 3).toUpperCase();
            discoveredConfigs.push({
              id,
              code,
              cluster: 'Engineering',
              label: h1.replace(/\s+Agent$/i, '').trim(),
              fullName: h1,
              file: `agents/${file}`,
              prefixes: uniquePrefixes.length > 0 ? uniquePrefixes : [code],
              description: `Dynamically discovered agent (${file}).`,
            });
          }
        }
      }
    } catch {}
  }

  if (brainDir && fs.existsSync(brainDir)) {
    const domainsDir = path.join(brainDir, '02-domains');
    if (fs.existsSync(domainsDir)) {
      try {
        for (const file of fs.readdirSync(domainsDir)) {
          if (file.endsWith('.md') && !file.startsWith('_') && file.toLowerCase() !== 'readme.md') {
            const fullPath = path.join(domainsDir, file);
            allRuleFiles.push(fullPath);
            totalDomains++;

            if (
              !knownFiles.has(file.toLowerCase()) &&
              !CORE_AGENT_SUBDOMAIN_FILES.has(file.toLowerCase())
            ) {
              const raw = fs.readFileSync(fullPath, 'utf8');
              const id = path.basename(file, '.md');
              const h1 = raw.match(/^#\s+(.+)$/m)?.[1]?.trim() || id;
              const clusterMatch = raw.match(/^cluster:\s*(.+)$/im)?.[1]?.trim();
              const prefixMatches = Array.from(raw.matchAll(/^\s*-\s*\*\*([A-Z]{1,5})-\d+\*\*/gm)).map((m) =>
                m[1].toUpperCase()
              );
              const uniquePrefixes = Array.from(new Set(prefixMatches));
              const code = uniquePrefixes[0] || id.slice(0, 3).toUpperCase();
              discoveredConfigs.push({
                id,
                code,
                cluster: clusterMatch || 'World',
                label: h1.split(/[—–-]/)[0].trim(),
                fullName: `${h1.split(/[—–-]/)[0].trim()} Domain`,
                file: `brain/02-domains/${file}`,
                prefixes: uniquePrefixes.length > 0 ? uniquePrefixes : [code],
                description: `Dynamically discovered domain (${file}).`,
              });
            }
          }
        }
      } catch {}
    }

    const extraRuleSubdirs = ['01-identity', '03-heuristics'];
    for (const sub of extraRuleSubdirs) {
      const subDir = path.join(brainDir, sub);
      if (!fs.existsSync(subDir)) continue;
      try {
        for (const file of fs.readdirSync(subDir)) {
          if (file.endsWith('.md') && !file.startsWith('_')) {
            allRuleFiles.push(path.join(subDir, file));
          }
        }
      } catch {}
    }
  }

  return {
    allRuleFiles: Array.from(new Set(allRuleFiles)),
    discoveredConfigs,
    totalCoreAgents: totalCoreAgents || 8,
    totalDomains: totalDomains || 29,
  };
}

function buildStatsResponse() {
  const { brainDir, agentsDir } = resolveDirectories();
  const { allRuleFiles, discoveredConfigs, totalCoreAgents, totalDomains } =
    discoverVaultFilesAndConfigs(brainDir, agentsDir);

  const markdownContents: string[] = [];

  for (const filePath of allRuleFiles) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      markdownContents.push(content);
    } catch {}
  }

  const cortexStats = calculateCortexStats({
    markdownContents,
    discoveredConfigs,
    totalCoreAgents,
    totalDomains,
  });

  const cognitiveStats = cortexStats.dimensions.map((d) => ({
    subject: d.subject || d.label,
    key: d.key,
    cluster: d.cluster,
    value: d.percentage,
    count: d.count,
    weightedScore: d.weightedScore,
    displayScore: d.displayScore,
    displayCount: d.displayCount,
    target: d.target,
    avgConfidence: d.avgConfidence,
    isHighConfidence: d.isHighConfidence,
    isOverclocked: d.isOverclocked,
    isUnverified: d.isUnverified,
    percentageText: d.percentageText,
    fractionText: d.fractionText,
    rawFractionText: d.rawFractionText,
    prefixes: d.prefixes,
    description: d.description,
  }));

  const agentMastery = cortexStats.agentList.map((a) => ({
    id: a.id,
    agent: a.agent || a.fullName,
    fullName: a.fullName,
    label: a.label,
    code: a.code || '',
    cluster: a.cluster || 'Engineering',
    file: a.file || '',
    count: a.count,
    weightedScore: a.weightedScore,
    displayScore: a.displayScore,
    displayCount: a.displayCount,
    target: a.target,
    percentage: a.percentage,
    avgConfidence: a.avgConfidence,
    isHighConfidence: a.isHighConfidence,
    isOverclocked: a.isOverclocked,
    isUnverified: a.isUnverified,
    isUnseeded: a.isUnseeded,
    status: a.status,
    percentageText: a.percentageText,
    fractionText: a.fractionText,
    rawFractionText: a.rawFractionText,
    description: a.description,
  }));

  return {
    level: cortexStats.level,
    totalAgents: cortexStats.totalAgents,
    totalCoreAgents: cortexStats.totalCoreAgents,
    totalDomains: cortexStats.totalDomains,
    totalRules: cortexStats.totalRules,
    totalClusters: cortexStats.totalClusters,
    targetRulesPerAgent: cortexStats.targetRulesPerAgent,
    targetWeightedScorePerAgent: cortexStats.targetWeightedScorePerAgent,
    cognitiveStats,
    agentMastery,
    clusters: cortexStats.clusters,
    clusterList: cortexStats.clusterList,
    blindSpots: cortexStats.blindSpots,
    prefixCounts: cortexStats.prefixCounts,
    prefixWeights: cortexStats.prefixWeights,
    scannedFilesCount: allRuleFiles.length,
    timestamp: new Date().toISOString(),
  };
}

export async function GET() {
  try {
    const payload = buildStatsResponse();
    return NextResponse.json(payload, { headers: RESPONSE_HEADERS });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error?.message || 'Failed to calculate Cortex Profile stats',
      },
      { status: 500, headers: RESPONSE_HEADERS }
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
    const payload = buildStatsResponse();
    return NextResponse.json({ revalidated: true, ...payload }, { headers: RESPONSE_HEADERS });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to revalidate stats' },
      { status: 500, headers: RESPONSE_HEADERS }
    );
  }
}
