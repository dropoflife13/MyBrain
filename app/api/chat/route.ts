import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Resolve file paths reliably across local dev, monorepos, and Vercel serverless environments
function resolveFilePath(relPath: string): string | null {
  const rootDir = process.cwd();
  const filename = path.basename(relPath);
  const candidates = [
    path.join(rootDir, relPath),
    path.join(rootDir, 'agents', filename),
    path.join(rootDir, 'brain', '04-agents', filename),
    path.join(rootDir, 'brain', '02-domains', filename),
    path.join(rootDir, 'brain', '01-identity', filename),
    path.join(rootDir, 'brain', '03-heuristics', filename),
    path.join(rootDir, 'brain', '07-meta', filename),
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

const FILE_MAP: Record<string, string> = {
  dbaagent: 'agents/dbaagent.md',
  securityagent: 'agents/securityagent.md',
  uiuxagent: 'agents/uiuxagent.md',
  productmanageragent: 'agents/productmanageragent.md',
  systemsdesignagent: 'agents/systemsdesignagent.md',
  integrationagent: 'agents/integrationagent.md',
  growthagent: 'agents/growthagent.md',
  cybersec: 'brain/02-domains/cybersec.md',
  solutions: 'brain/02-domains/solutions.md',
  'business-analysis': 'brain/02-domains/business-analysis.md',
  'ui-frontend': 'brain/02-domains/ui-frontend.md',
  'empathy-personas': 'brain/02-domains/empathy-personas.md',
  'OPERATING-PRINCIPLES': 'brain/01-identity/OPERATING-PRINCIPLES.md',
  TASTE: 'brain/01-identity/TASTE.md',
  'ABOUT-ME': 'brain/01-identity/ABOUT-ME.md',
  HEURISTICS: 'brain/03-heuristics/HEURISTICS.md',
  PATTERNS: 'brain/03-heuristics/PATTERNS.md',
  'RED-FLAGS': 'brain/03-heuristics/RED-FLAGS.md',
  DIGEST: 'brain/07-meta/DIGEST.md',
};

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
};

function getFileContentForNode(contextNode: any): string {
  if (!contextNode) {
    return 'Cortex Knowledge Vault: 7 Core Agent Gatekeepers (PM, UX, GR, SD, IR, DB, SEC) with 159 engineering invariants.';
  }

  const rawId = typeof contextNode === 'string' ? contextNode : contextNode.id || '';
  const cleanId = rawId.split('::')[0].trim();

  // If node is hub, pass a combined summary of the 7 core agent gatekeepers
  if (cleanId === 'hub' || cleanId.toLowerCase() === 'hub') {
    const agentFiles = [
      'agents/productmanageragent.md',
      'agents/uiuxagent.md',
      'agents/growthagent.md',
      'agents/systemsdesignagent.md',
      'agents/integrationagent.md',
      'agents/dbaagent.md',
      'agents/securityagent.md',
    ];
    const sections: string[] = [];
    for (const rel of agentFiles) {
      const full = resolveFilePath(rel);
      if (full && fs.existsSync(full)) {
        sections.push(fs.readFileSync(full, 'utf8'));
      }
    }
    if (sections.length > 0) {
      return sections.join('\n\n---\n\n');
    }
    return 'Cortex Hub: The procedural master coordinator governing the 7 Agent Gatekeepers: PM, UX, GR, SD, IR, DB, and SEC.';
  }

  // 1. Direct match in FILE_MAP
  if (FILE_MAP[cleanId]) {
    const full = resolveFilePath(FILE_MAP[cleanId]);
    if (full && fs.existsSync(full)) {
      return fs.readFileSync(full, 'utf8');
    }
  }

  // 2. Prefix match for individual rules (e.g., CS-01, DB-04)
  const prefixMatch = cleanId.match(/^([A-Z]{1,4})-\d+/);
  if (prefixMatch && PREFIX_TO_AGENT_FILE[prefixMatch[1]]) {
    const rel = PREFIX_TO_AGENT_FILE[prefixMatch[1]];
    const full = resolveFilePath(rel);
    if (full && fs.existsSync(full)) {
      return fs.readFileSync(full, 'utf8');
    }
  }

  // 3. Fallback to node's in-memory content if available
  if (typeof contextNode === 'object' && contextNode?.content) {
    return contextNode.content;
  }

  return `Rule Context for ${cleanId}: Enforces procedural engineering invariants and gate governance in the Cortex system.`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { query, contextNode } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'GEMINI_API_KEY is not configured in the environment.',
          text: 'Error: GEMINI_API_KEY is not configured in .env.local. Please provide a valid Gemini API key.',
        },
        { status: 500 }
      );
    }

    const modelName = process.env.AI_MODEL || 'gemini-2.5-flash';
    console.log(`[Cortex Chat API] Using AI Model: ${modelName}`);

    const fileContent = getFileContentForNode(contextNode);
    const prompt = `You are answering based on these rules: \n\n ${fileContent} \n\n User Question: ${query}`;

    const genAI = new GoogleGenerativeAI(apiKey);
    let text = '';

    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      text = result.response.text();
    } catch (err: any) {
      // Graceful fallback if the specific model version is deprecated or migrating
      if (err?.message?.includes('gemini-3.8-flash') || err?.status === 404) {
        console.log('[Cortex Chat API] Falling back to gemini-3.8-flash');
        const fallbackModel = genAI.getGenerativeModel({ model: 'gemini-3.8-flash' });
        const result = await fallbackModel.generateContent(prompt);
        text = result.response.text();
      } else {
        throw err;
      }
    }

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error('[Cortex Chat API Error]:', error);
    const errorMessage = error?.message || 'An error occurred while querying Gemini.';
    return NextResponse.json(
      {
        error: errorMessage,
        text: `Neural link error: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}

