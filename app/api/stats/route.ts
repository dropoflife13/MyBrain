import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { calculateCortexStats } from '@/lib/stats';

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

    // Standardized Cortex Stats using centralized lib/stats.ts
    const cortexStats = calculateCortexStats({
      prefixCounts,
      uniqueRules,
      totalRules: totalUniqueRules,
    });

    const cognitiveStats = cortexStats.dimensions.map((d) => ({
      subject: d.subject || d.label,
      key: d.key,
      value: d.percentage,
      count: d.count,
      displayCount: d.displayCount,
      target: d.target,
      isOverclocked: d.isOverclocked,
      percentageText: d.percentageText,
      fractionText: d.fractionText,
      rawFractionText: d.rawFractionText,
      prefixes: d.prefixes,
      description: d.description,
    }));

    const agentMastery = cortexStats.agentList.map((a) => ({
      agent: a.agent || a.fullName,
      code: a.code || '',
      file: a.file || '',
      count: a.count,
      displayCount: a.displayCount,
      target: a.target,
      percentage: a.percentage,
      isOverclocked: a.isOverclocked,
      percentageText: a.percentageText,
      fractionText: a.fractionText,
      rawFractionText: a.rawFractionText,
      description: a.description,
    }));

    return NextResponse.json(
      {
        level: cortexStats.level,
        targetRulesPerAgent: cortexStats.targetRulesPerAgent,
        cognitiveStats,
        agentMastery,
        blindSpots: cortexStats.blindSpots,
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

