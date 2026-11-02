import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getBrainData } from '../../../lib/brain-parser';
import { findTopRules, loadEmbeddings, type ScoredRuleMatch } from '../../../lib/embedder';
import {
  classifyTierLightweight,
  findRuleInVault,
  type RouterTier,
  type TierClassification,
  type VaultRuleMatch,
} from '../../../lib/tiered-router';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { z } from 'zod';

// Resolve file paths reliably across local dev, monorepos, and Vercel serverless environments
function resolveFilePath(relPath: string): string | null {
  const rootDir = process.cwd();
  const filename = path.basename(relPath);
  const candidates = [
    path.join(rootDir, relPath),
    path.join(rootDir, 'agents', filename),
    path.join(rootDir, 'public', 'agents', filename),
    path.join(rootDir, 'public', relPath),
    path.join(rootDir, 'brain', '04-agents', filename),
    path.join(rootDir, 'public', 'brain', '04-agents', filename),
    path.join(rootDir, 'brain', '02-domains', filename),
    path.join(rootDir, 'public', 'brain', '02-domains', filename),
    path.join(rootDir, 'brain', '01-identity', filename),
    path.join(rootDir, 'public', 'brain', '01-identity', filename),
    path.join(rootDir, 'brain', '03-heuristics', filename),
    path.join(rootDir, 'public', 'brain', '03-heuristics', filename),
    path.join(rootDir, 'brain', '07-meta', filename),
    path.join(rootDir, 'public', 'brain', '07-meta', filename),
    path.join(rootDir, 'brain-web', relPath),
    path.join(rootDir, 'brain-web', 'agents', filename),
    path.join(rootDir, 'brain-web', 'public', 'agents', filename),
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
  // Short agent codes
  DB: 'agents/dbaagent.md',
  SEC: 'agents/securityagent.md',
  UX: 'agents/uiuxagent.md',
  PM: 'agents/productmanageragent.md',
  SD: 'agents/systemsdesignagent.md',
  IR: 'agents/integrationagent.md',
  GR: 'agents/growthagent.md',
  RS: 'agents/researchagent.md',
  db: 'agents/dbaagent.md',
  sec: 'agents/securityagent.md',
  ux: 'agents/uiuxagent.md',
  pm: 'agents/productmanageragent.md',
  sd: 'agents/systemsdesignagent.md',
  ir: 'agents/integrationagent.md',
  gr: 'agents/growthagent.md',
  rs: 'agents/researchagent.md',
  // Agent file ids
  dbaagent: 'agents/dbaagent.md',
  securityagent: 'agents/securityagent.md',
  uiuxagent: 'agents/uiuxagent.md',
  productmanageragent: 'agents/productmanageragent.md',
  systemsdesignagent: 'agents/systemsdesignagent.md',
  integrationagent: 'agents/integrationagent.md',
  growthagent: 'agents/growthagent.md',
  researchagent: 'agents/researchagent.md',
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
  'SIX-COMMANDS': 'brain/08-workflows/SIX-COMMANDS.md',
  'six-commands': 'brain/08-workflows/SIX-COMMANDS.md',
  psychology: 'brain/02-domains/psychology.md',
  philosophy: 'brain/02-domains/philosophy.md',
  rhetoric: 'brain/02-domains/rhetoric.md',
  literature: 'brain/02-domains/literature.md',
  art: 'brain/02-domains/art.md',
  education: 'brain/02-domains/education.md',
  marketing: 'brain/02-domains/marketing.md',
  management: 'brain/02-domains/management.md',
  economy: 'brain/02-domains/economy.md',
  geopolitics: 'brain/02-domains/geopolitics.md',
  law: 'brain/02-domains/law.md',
  politics: 'brain/02-domains/politics.md',
  environment: 'brain/02-domains/environment.md',
  history: 'brain/02-domains/history.md',
  crypto: 'brain/02-domains/crypto.md',
  finance: 'brain/02-domains/finance.md',
  news: 'brain/02-domains/news.md',
  business: 'brain/02-domains/business.md',
  health: 'brain/02-domains/health.md',
  'data-science': 'brain/02-domains/data-science.md',
  science: 'brain/02-domains/science.md',
  medicine: 'brain/02-domains/medicine.md',
  authorization: 'brain/02-domains/authorization.md',
  arbiter: 'brain/02-domains/arbiter.md',
  ARB: 'brain/02-domains/arbiter.md',
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
  RS: 'agents/researchagent.md',
  ARB: 'brain/02-domains/arbiter.md',
  PSY: 'brain/02-domains/psychology.md',
  PHI: 'brain/02-domains/philosophy.md',
  RHE: 'brain/02-domains/rhetoric.md',
  LIT: 'brain/02-domains/literature.md',
  ART: 'brain/02-domains/art.md',
  EDU: 'brain/02-domains/education.md',
  MKT: 'brain/02-domains/marketing.md',
  MGT: 'brain/02-domains/management.md',
  ECO: 'brain/02-domains/economy.md',
  GEO: 'brain/02-domains/geopolitics.md',
  LAW: 'brain/02-domains/law.md',
  POL: 'brain/02-domains/politics.md',
  ENV: 'brain/02-domains/environment.md',
  HIS: 'brain/02-domains/history.md',
  CRY: 'brain/02-domains/crypto.md',
  FIN: 'brain/02-domains/finance.md',
  NWS: 'brain/02-domains/news.md',
  BIZ: 'brain/02-domains/business.md',
  HLT: 'brain/02-domains/health.md',
  DS: 'brain/02-domains/data-science.md',
  SCI: 'brain/02-domains/science.md',
  MED: 'brain/02-domains/medicine.md',
  AUTH: 'brain/02-domains/authorization.md',
};

function getFileContentForNode(contextNode: any): string {
  if (!contextNode) {
    return 'Cortex Knowledge Vault: 7 Core Agent Gatekeepers (PM, UX, GR, SD, IR, DB, SEC) + Research Agent (RS) with 175 engineering and research invariants.';
  }

  const rawId = typeof contextNode === 'string' ? contextNode : contextNode.id || '';
  const cleanId = rawId.split('::')[0].trim();

  // If node is hub, pass a combined summary of the 7 core agent gatekeepers + research agent
  if (cleanId === 'hub' || cleanId.toLowerCase() === 'hub') {
    const agentFiles = [
      'agents/productmanageragent.md',
      'agents/uiuxagent.md',
      'agents/growthagent.md',
      'agents/systemsdesignagent.md',
      'agents/integrationagent.md',
      'agents/dbaagent.md',
      'agents/securityagent.md',
      'agents/researchagent.md',
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
    return 'Cortex Hub: The procedural master coordinator governing the 8 Agent Gatekeepers: PM, UX, GR, SD, IR, DB, SEC, and RS.';
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

interface WorkflowStepConfig {
  cmd: string;
  name: string;
  agents: string[];
  instruction: string;
}

const WORKFLOW_COMMANDS: Record<string, WorkflowStepConfig> = {
  grill: {
    cmd: '/grill',
    name: 'Problem & Edge-Case Interrogation',
    agents: ['agents/productmanageragent.md'],
    instruction:
      'You are executing the /grill step of the Golden Path SDLC. You strictly enforce Product Manager rules (PM-01 to PM-14). Interrogate the user problem, uncover edge cases, challenge technical assumptions, and ask exactly 5 hard, non-obvious questions about the application idea before any code is written.',
  },
  pitch: {
    cmd: '/pitch',
    name: '3-Minute Executive Pitch',
    agents: ['agents/growthagent.md', 'agents/productmanageragent.md'],
    instruction:
      'You are executing the /pitch step of the Golden Path SDLC. Synthesize the core value proposition and write a crisp, compelling 3-minute executive pitch to sell the idea based on Growth (GR) and Product Manager (PM) principles.',
  },
  'to-spec': {
    cmd: '/to-spec',
    name: 'Technical Specification & PRD',
    agents: ['agents/systemsdesignagent.md', 'agents/dbaagent.md', 'brain/02-domains/authorization.md'],
    instruction:
      'You are executing the /to-spec step of the Golden Path SDLC. Read systemsdesignagent.md, dbaagent.md, and authorization.md. Draft the architecture, data model, and authorization strategy with As-Is/To-Be architectures, failure modes, data contracts, PDP/PEP enforcement, and explicit non-goals.',
  },
  'to-tickets': {
    cmd: '/to-tickets',
    name: 'Atomic Ticket Decomposition',
    agents: ['agents/productmanageragent.md', 'agents/systemsdesignagent.md'],
    instruction:
      'You are executing the /to-tickets step of the Golden Path SDLC. Break the PRD specification down into 5 atomic, sequential implementation tickets with measurable acceptance criteria. Do not write implementation code yet.',
  },
  implement: {
    cmd: '/implement',
    name: 'Production-Grade Implementation',
    agents: ['agents/dbaagent.md', 'agents/securityagent.md', 'agents/integrationagent.md'],
    instruction:
      'You are executing the /implement step of the Golden Path SDLC (Layer 6 Sandbox Execution). Write production-ready, runnable code for the requested feature or Ticket. Strictly obey DB rules (DB-13 atomic conditionals, append-only, RLS default deny), Security rules (SEC-14 server-side redaction, STRIDE, client never sees service_role), and Integration rules. Provide complete, runnable code in markdown code blocks (e.g. ```typescript or ```javascript or ```python) including a self-contained execution test or main driver with console outputs, so the operator can immediately run it in the Cortex Code Sandbox.',
  },
  review: {
    cmd: '/review',
    name: 'Invariant & Security Audit',
    agents: ['agents/securityagent.md', 'agents/systemsdesignagent.md'],
    instruction:
      'You are executing the /review step of the Golden Path SDLC. Run a strict architectural and security code review against Rule BN-00 invariants, STRIDE threat boundaries, RLS bypass vectors, and systems integrity.',
  },
  harden: {
    cmd: '/harden',
    name: 'Enterprise Security & Database Hardening',
    agents: ['agents/dbaagent.md', 'agents/securityagent.md', 'brain/02-domains/authorization.md'],
    instruction:
      'You are executing the /harden step of the Cortex Pipeline. You strictly enforce DBA Agent rules (DB-13 Atomic Conditionals, DB-14 Multi-Tenant Row Isolation) and Security Agent rules (SEC-14 Server-Side Redaction, SEC-15 Cache-Control for Private Data). Audit the authorization strategy (checking AUTH-01 through AUTH-05: PDP/PEP separation, ABAC dynamic policies, policy-as-code in Git, derived roles, and centralized control planes). Audit the architecture and code for race conditions on counters/stock (DB-13), verify multi-tenant isolation at query/RLS level (DB-14), ensure sensitive commercial fields (e.g. buyingCost, profitMargin, adminNotes) are sanitized server-side before reaching clients (SEC-14), and verify Cache-Control private/no-store headers on authenticated endpoints (SEC-15).',
  },
  research: {
    cmd: '/research',
    name: 'Epistemic Rigor & Source Verification',
    agents: ['agents/researchagent.md'],
    instruction:
      'You are executing the /research step of the Cortex Pipeline. You strictly enforce Research Agent rules (RS-01 to RS-04). When discussing current events, statistics, or recent trends, never guess: state the source, data date, and context (RS-01). Clearly separate objective facts from predictions or opinions (RS-02). When local Markdown files do not contain the answer and real-time web access is unavailable, you MUST halt and output: "WARNING: I do not have verified data for this. Hallucination risk is high. Please provide a source." (RS-03). Require at least two independent, reliable sources before accepting a claim as fact (RS-04).',
  },
};

function readAgentOrDoc(relPath: string, fallbackId: string): string {
  const full = resolveFilePath(relPath);
  if (full && fs.existsSync(full)) {
    try {
      return fs.readFileSync(full, 'utf8');
    } catch {}
  }
  const inMemory = getBrainData({ nodeCount: 1 }).nodes.find(
    (n) => n.id.toLowerCase() === fallbackId.toLowerCase()
  );
  if (inMemory?.content) return inMemory.content;
  return `Agent rules for ${fallbackId}`;
}

function detectWorkflowCommand(query: string, commandProp?: string): WorkflowStepConfig | null {
  if (commandProp) {
    const clean = commandProp.replace(/^\//, '').toLowerCase();
    if (WORKFLOW_COMMANDS[clean]) return WORKFLOW_COMMANDS[clean];
    if (clean === 'code-review') return WORKFLOW_COMMANDS['review'];
    if (clean === 'grill-with-docs') return WORKFLOW_COMMANDS['grill'];
    if (clean === 'harden' || clean === 'enterprise-harden') return WORKFLOW_COMMANDS['harden'];
  }

  const q = query.trim().toLowerCase();
  for (const [key, config] of Object.entries(WORKFLOW_COMMANDS)) {
    if (q.startsWith(config.cmd.toLowerCase()) || q.includes(config.cmd.toLowerCase())) {
      return config;
    }
  }
  if (q.includes('/code-review')) return WORKFLOW_COMMANDS['review'];
  if (q.includes('/grill-with-docs')) return WORKFLOW_COMMANDS['grill'];
  return null;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

// Rate Limiter: Upstash Redis if configured, otherwise reliable in-memory sliding window
let upstashRatelimit: Ratelimit | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    upstashRatelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '60 s'),
      analytics: true,
      prefix: 'cortex:ratelimit:chat',
    });
  } catch (e) {
    console.warn('[Cortex Chat API] Failed to initialize Upstash Ratelimit:', e);
  }
}

interface InMemoryRateLimitRecord {
  timestamps: number[];
}
const inMemoryRateLimitStore = new Map<string, InMemoryRateLimitRecord>();

function checkInMemoryRateLimit(
  ip: string,
  limit = 5,
  windowMs = 60 * 1000
): { success: boolean; reset: number } {
  const now = Date.now();
  const record = inMemoryRateLimitStore.get(ip) || { timestamps: [] };
  // Keep only timestamps within sliding window
  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (record.timestamps.length >= limit) {
    const oldest = record.timestamps[0];
    const resetSec = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    return { success: false, reset: resetSec };
  }

  record.timestamps.push(now);
  inMemoryRateLimitStore.set(ip, record);

  // Periodic cleanup of stale IPs
  if (inMemoryRateLimitStore.size > 5000) {
    for (const [key, val] of inMemoryRateLimitStore.entries()) {
      if (val.timestamps.every((ts) => now - ts >= windowMs)) {
        inMemoryRateLimitStore.delete(key);
      }
    }
  }

  return { success: true, reset: 60 };
}

function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return '127.0.0.1';
}

async function verifyRateLimit(req: Request): Promise<{ success: boolean; reset: number }> {
  const ip = getClientIp(req);

  if (upstashRatelimit) {
    try {
      const result = await upstashRatelimit.limit(ip);
      return {
        success: result.success,
        reset: Math.max(1, Math.ceil(result.reset / 1000)),
      };
    } catch (err) {
      console.warn('[Cortex Chat API] Upstash rate limit check failed, falling back to in-memory:', err);
    }
  }

  return checkInMemoryRateLimit(ip, 5, 60 * 1000);
}

// 2MB base64 string length limit (2,097,152 characters)
const MAX_IMAGE_BASE64_LENGTH = 2 * 1024 * 1024;

const ChatRequestSchema = z.object({
  query: z
    .string()
    .min(1, 'Query parameter cannot be empty')
    .max(2000, 'Query parameter cannot exceed 2000 characters'),
  contextNode: z
    .string()
    .max(50, 'contextNode cannot exceed 50 characters')
    .optional(),
  workflowCommand: z.string().max(50).optional(),
  provider: z.string().max(50).optional(),
  source: z.string().max(50).optional(),
  imageUrl: z
    .string()
    .max(MAX_IMAGE_BASE64_LENGTH, 'Image base64 payload exceeds 2MB limit')
    .refine(
      (val) => {
        if (!val) return true;
        return /^data:image\/(jpeg|png|webp);base64,/i.test(val);
      },
      {
        message: 'Invalid image format. Only image/jpeg, image/png, and image/webp are allowed',
      }
    )
    .optional()
    .nullable(),
});

function isHighDemandError(err: any): boolean {
  const status = err?.status || err?.statusCode || err?.code;
  if (status === 503 || status === 429) return true;
  const msg = String(err?.message || '').toLowerCase();
  return (
    msg.includes('503') ||
    msg.includes('429') ||
    msg.includes('service unavailable') ||
    msg.includes('high demand') ||
    msg.includes('overloaded') ||
    msg.includes('resource_exhausted') ||
    msg.includes('unavailable')
  );
}

async function queryNvidiaNim(
  prompt: string,
  apiKey: string,
  modelName?: string,
  imageUrl?: string
): Promise<{ text: string; model: string }> {
  const isVision = Boolean(imageUrl);
  const defaultModel = isVision
    ? 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning'
    : (process.env.NVIDIA_MODEL || 'nvidia/nemotron-3-ultra-550b-a55b');
  const model = modelName || defaultModel;
  const baseUrl = (process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1').replace(/\/+$/, '');
  const url = `${baseUrl}/chat/completions`;

  console.log(`[Cortex Chat API] Querying NVIDIA NIM (${isVision ? 'Vision' : 'Text'}): ${model} via ${url}...`);

  const userContent: any = isVision
    ? [
        { type: 'text', text: prompt },
        { type: 'image_url', image_url: { url: imageUrl } },
      ]
    : prompt;

  const requestBody: any = {
    model,
    messages: [
      {
        role: 'system',
        content:
          'You are Cortex AI, the procedural judgment engine and 8-Agent SDLC supervisor. Respond with strict engineering rigor, adherence to invariants, and structured markdown. When inspecting diagrams, mockups, or schemas, audit them against our 8 gatekeepers (DB, SEC, UX, PM, SD, IR, GR, RS).',
      },
      {
        role: 'user',
        content: userContent,
      },
    ],
    temperature: 0.6,
    top_p: 0.95,
    max_tokens: isVision ? 16384 : 8192,
  };

  if (isVision) {
    requestBody.reasoning_budget = 4096;
  } else {
    requestBody.chat_template_kwargs = { enable_thinking: true };
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => '');
    throw new Error(`NVIDIA NIM API error [${res.status} ${res.statusText}]: ${errorText}`);
  }

  const data = await res.json();
  const choice = data?.choices?.[0]?.message;
  const content = choice?.content || '';
  if (choice?.reasoning_content) {
    console.log(`[Cortex Chat API] NVIDIA NIM reasoning tokens received (${choice.reasoning_content.length} chars).`);
  }
  return { text: content.trim(), model };
}

async function queryOpenRouter(
  prompt: string,
  apiKey: string,
  modelName?: string,
  imageUrl?: string
): Promise<{ text: string; model: string }> {
  const isVision = Boolean(imageUrl);
  const defaultModel = isVision
    ? 'google/gemini-2.5-flash'
    : (process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct');
  const model = modelName || defaultModel;
  const url = 'https://openrouter.ai/api/v1/chat/completions';

  console.log(`[Cortex Chat API] Querying OpenRouter (${isVision ? 'Vision' : 'Text'}): ${model}...`);

  const userContent: any = isVision
    ? [
        { type: 'text', text: prompt },
        { type: 'image_url', image_url: { url: imageUrl } },
      ]
    : prompt;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://cortex.internal',
      'X-Title': 'Cortex AI Engine',
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content:
            'You are Cortex AI, the procedural judgment engine and 8-Agent SDLC supervisor. Respond with strict engineering rigor, adherence to invariants, and structured markdown.',
        },
        {
          role: 'user',
          content: userContent,
        },
      ],
      temperature: 0.6,
      max_tokens: 8192,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => '');
    throw new Error(`OpenRouter API error [${res.status} ${res.statusText}]: ${errorText}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content || '';
  return { text: content.trim(), model };
}

async function queryGroq(
  prompt: string,
  apiKey: string,
  modelName = 'llama-3.3-70b-versatile'
): Promise<{ text: string; model: string }> {
  const url = 'https://api.groq.com/openai/v1/chat/completions';
  console.log(`[Cortex Chat API] Querying Groq (${modelName}) via ${url}...`);

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelName,
      messages: [
        {
          role: 'system',
          content:
            'You are Cortex AI, the procedural judgment engine and 8-Agent SDLC supervisor. Respond with strict engineering rigor, adherence to invariants, and structured markdown.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.6,
      max_tokens: 4096,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => '');
    throw new Error(`Groq API error [${res.status} ${res.statusText}]: ${errorText}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content || '';
  return { text: content.trim(), model: modelName };
}

export async function POST(req: Request) {
  try {
    // 1. Rate Limiting Check (5 requests per minute per IP)
    const rateLimit = await verifyRateLimit(req);
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: 'System overheated. Please wait a minute.',
          text: 'System overheated. Please wait a minute.',
        },
        {
          status: 429,
          headers: {
            ...CORS_HEADERS,
            'Retry-After': String(rateLimit.reset || 60),
          },
        }
      );
    }

    // 2. Strict Input Validation (Zod)
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Bad Request', details: 'Malformed JSON payload', text: 'Validation error: Malformed JSON payload' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const validation = ChatRequestSchema.safeParse(body);
    if (!validation.success) {
      const errorMsg = validation.error.issues
        .map((issue) => `${issue.path.join('.') || 'payload'}: ${issue.message}`)
        .join('; ');
      return NextResponse.json(
        {
          error: 'Bad Request',
          details: errorMsg,
          text: `Validation error: ${errorMsg}`,
        },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const { query, contextNode, workflowCommand, provider, source } = validation.data;
    const imageUrl = validation.data.imageUrl || undefined;
    const hasImage = Boolean(imageUrl);
    const workflow = detectWorkflowCommand(query, workflowCommand);

    // 1. Tiered AI Router (Jev Architecture) - Lightweight Classification Check
    const tierDecision = classifyTierLightweight(query, Boolean(workflow), hasImage);
    console.log(
      `[Cortex Tiered Router] Query: "${query.slice(0, 60)}" -> Tier: ${tierDecision.tier.toUpperCase()} (${tierDecision.reason})`
    );

    // 2. Tier 1 (Direct Local Lookup): $0 Cost, zero LLM latency
    if (tierDecision.tier === 'tier1_local' && tierDecision.ruleId) {
      const match = findRuleInVault(tierDecision.ruleId);
      if (match) {
        console.log(
          `[Cortex Tiered Router] Tier 1 Hit: Serving [${match.ruleId}] from ${match.file} (Cost: $0.00, Latency: <1ms)`
        );

        const formattedText =
          source === 'hq'
            ? `Rule ${match.ruleId} (${match.file}): ${match.text.replace(/^[A-Z0-9_-]+:\s*/, '')}`
            : `### Rule [${match.ruleId}]\n**Vault Source:** \`${match.file}\` (Line ${match.line})\n\n${match.text}\n\n---\n*⚡ Tier 1: Direct Local Lookup (Markdown Vault • Cost: $0.00 • Latency: <1ms)*`;

        return NextResponse.json(
          {
            text: formattedText,
            model: 'direct-lookup',
            provider: 'local',
            tier: 'tier1_local',
            topRules: [
              {
                ruleId: match.ruleId,
                file: match.file,
                score: 1.0,
              },
            ],
          },
          { headers: CORS_HEADERS }
        );
      } else {
        // Prevent Tier 1 Fall-Through: Rule ID does not exist in vault (RS-03 Anti-Hallucination)
        console.log(
          `[Cortex Tiered Router] Tier 1 Prevent Fall-Through: Rule [${tierDecision.ruleId}] not in vault.`
        );
        return NextResponse.json(
          {
            text: `Rule [${tierDecision.ruleId}] is not defined in the Cortex Vault. Please check the ID or add it to the relevant Markdown file.`,
            model: 'direct-lookup',
            provider: 'local',
            tier: 'tier1_local',
            topRules: [],
          },
          { headers: CORS_HEADERS }
        );
      }
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    const groqApiKey = process.env.GROQ_API_KEY;
    const nvidiaApiKey =
      process.env.NVIDIA_API_KEY ||
      process.env['NVIDIABuild-Autogen-44'] ||
      process.env.NVIDIA_KEY;
    const openrouterApiKey = process.env.OPENROUTER_API_KEY;

    if (!geminiApiKey && !groqApiKey && !nvidiaApiKey && !openrouterApiKey) {
      return NextResponse.json(
        {
          error: 'No AI API key is configured in the environment.',
          text: 'Error: Neither GEMINI_API_KEY, GROQ_API_KEY, NVIDIA_API_KEY, nor OPENROUTER_API_KEY is configured in .env.local.',
        },
        { status: 500, headers: CORS_HEADERS }
      );
    }

    const forcedNvidia =
      hasImage || // Prioritize Nemotron Omni Vision for multimodal attachments
      provider === 'nvidia' ||
      process.env.AI_PROVIDER === 'nvidia' ||
      (!geminiApiKey && !groqApiKey && Boolean(nvidiaApiKey));

    const forcedOpenRouter =
      provider === 'openrouter' ||
      process.env.AI_PROVIDER === 'openrouter' ||
      (!geminiApiKey && !groqApiKey && !nvidiaApiKey && Boolean(openrouterApiKey));

    const forcedGroq =
      provider === 'groq' ||
      process.env.AI_PROVIDER === 'groq';

    // Tier-based Model Selection
    let modelChain: string[];
    if (tierDecision.tier === 'tier3_heavy') {
      // Tier 3 (Heavy Model): Route to gemini-4-argon with robust fallback chain
      const baseTier3 = ['gemini-4-argon', 'gemini-3.5-flash', 'gemini-3.1-flash-lite'];
      modelChain = process.env.AI_MODEL
        ? Array.from(new Set(['gemini-4-argon', process.env.AI_MODEL, ...baseTier3]))
        : baseTier3;
    } else {
      // Tier 2 (Fast Model): Route to gemini-2.5-flash or llama-3.3-70b via Groq
      const baseTier2 = ['gemini-2.5-flash', 'gemini-3.5-flash', 'gemini-3.1-flash-lite'];
      modelChain = process.env.AI_MODEL
        ? Array.from(new Set(['gemini-2.5-flash', process.env.AI_MODEL, ...baseTier2]))
        : baseTier2;
    }

    console.log(
      `[Cortex Chat API] Routing mode: ${
        forcedNvidia ? 'NVIDIA NIM' : forcedOpenRouter ? 'OpenRouter' : forcedGroq ? 'Groq' : 'Gemini Chain + Failover'
      } [Tier: ${tierDecision.tier.toUpperCase()}] Target models: ${modelChain.join(', ')}`
    );

    let prompt: string;
    // 0. Semantic Vector RAG Retrieval (@xenova/transformers all-MiniLM-L6-v2)
    let topRules: ScoredRuleMatch[] = [];
    let topRulesPrompt = '';
    try {
      topRules = await findTopRules(query, 3);
      if (topRules.length > 0) {
        topRulesPrompt = topRules
          .map(
            (r, i) =>
              `### Rule ${i + 1}: [${r.ruleId}] (Cosine Similarity: ${r.score.toFixed(3)})\nSource: \`${r.file}\`\n${r.text}`
          )
          .join('\n\n');
        console.log(
          `[Cortex Chat API] Vector RAG retrieved top ${topRules.length} rules: ${topRules
            .map((r) => `${r.ruleId} (${r.score.toFixed(3)})`)
            .join(', ')}`
        );
      }
    } catch (err: any) {
      console.warn('[Cortex Chat API] Vector RAG retrieval failed, falling back:', err?.message);
    }

    // 1. RS-03 Epistemic Circuit Breaker: Halt if highest cosine similarity is < 0.28
    const highestScore = topRules.length > 0 ? topRules[0].score : 0;
    const isResearchWorkflow = workflow?.cmd === '/research';
    if ((!workflow || isResearchWorkflow) && highestScore < 0.28) {
      console.log(
        `[Cortex Chat API] RS-03 Epistemic Circuit Breaker triggered (highest score: ${highestScore.toFixed(3)} < 0.28). Halting to prevent hallucination.`
      );
      return NextResponse.json(
        {
          text: 'WARNING: I do not have verified data for this in my local Vault. Hallucination risk is high. Please provide a source or populate the relevant domain.',
          model: 'epistemic-guard',
          provider: 'system',
          tier: tierDecision.tier,
          topRules: topRules.map((r) => ({ ruleId: r.ruleId, file: r.file, score: r.score })),
        },
        { headers: CORS_HEADERS }
      );
    }

    if (workflow) {
      const workflowDoc = readAgentOrDoc('brain/08-workflows/SIX-COMMANDS.md', 'SIX-COMMANDS');
      const agentDocs = workflow.agents.map((p) => {
        const id = path.basename(p, '.md');
        return readAgentOrDoc(p, id);
      });

      prompt = `You are the Cortex Software Factory executing the Golden Path SDLC workflow.
Current Step: ${workflow.cmd} (${workflow.name})

ROLE & WORKFLOW INSTRUCTION:
${workflow.instruction}

GOVERNING WORKFLOW SPECIFICATION (SIX-COMMANDS.md):
${workflowDoc}

MANDATORY ENFORCED AGENT GATEKEEPERS:
${agentDocs.join('\n\n---\n\n')}

${topRulesPrompt ? `TOP RELEVANT INVARIANTS (VECTOR RAG RETRIEVAL):\n${topRulesPrompt}\n\n` : ''}USER REQUEST / PROBLEM DESCRIPTION:
${query}

Respond in clean, highly structured GitHub-flavored markdown with strict engineering rigor.`;
    } else {
      const fileContent = contextNode ? getFileContentForNode(contextNode) : '';
      if (topRulesPrompt) {
        prompt = `You are Cortex AI, representing agent ${contextNode || 'hub'} in the procedural judgment engine.
Answer the user's question with strict engineering rigor, adhering to these top 3 mathematically triangulated rules retrieved via Semantic Vector RAG (all-MiniLM-L6-v2):

${topRulesPrompt}
${fileContent ? `\n\nAGENT CONTEXT & INVARIANTS:\n${fileContent}\n` : ''}
User Question:
${query}`;
      } else {
        prompt = `You are answering based on these rules: \n\n ${fileContent} \n\n User Question: ${query}`;
      }
    }

    // Requirement 3: Fix AI Verbosity for HQ Route
    if (source === 'hq') {
      prompt += `\n\nYou are speaking inside a quick command center. Be highly concise. Answer in 1-2 sentences maximum. Do NOT use markdown headers (like ###) or long bullet points unless absolutely necessary. Speak directly and casually.`;
    }

    let succeededText = '';
    let succeededModel = '';
    let succeededProvider = '';
    let lastError: any = null;

    // Direct Groq execution if explicitly targeted or in Tier 2 with Groq provider
    if ((forcedGroq || (tierDecision.tier === 'tier2_fast' && provider === 'groq')) && groqApiKey) {
      try {
        console.log(`[Cortex Chat API] Executing direct Groq request: llama-3.3-70b-versatile...`);
        const groqRes = await queryGroq(prompt, groqApiKey, 'llama-3.3-70b-versatile');
        return NextResponse.json(
          {
            text: groqRes.text,
            model: groqRes.model,
            provider: 'groq',
            tier: tierDecision.tier,
            topRules: topRules.map((r) => ({ ruleId: r.ruleId, file: r.file, score: r.score })),
          },
          { headers: CORS_HEADERS }
        );
      } catch (err: any) {
        lastError = err;
        console.warn('[Cortex Chat API] Direct Groq request failed:', err?.message);
        if (!geminiApiKey && !nvidiaApiKey && !openrouterApiKey) {
          throw err;
        }
      }
    }

    // Direct NVIDIA NIM execution if explicitly targeted, image attached, or if Gemini key is absent
    if (forcedNvidia && nvidiaApiKey) {
      try {
        console.log(`[Cortex Chat API] Executing direct NVIDIA NIM request ${hasImage ? '(Multimodal Vision)' : ''}...`);
        const nimRes = await queryNvidiaNim(prompt, nvidiaApiKey, undefined, imageUrl);
        return NextResponse.json(
          {
            text: nimRes.text,
            model: nimRes.model,
            provider: 'nvidia',
            tier: tierDecision.tier,
            topRules: topRules.map((r) => ({ ruleId: r.ruleId, file: r.file, score: r.score })),
          },
          { headers: CORS_HEADERS }
        );
      } catch (err: any) {
        lastError = err;
        console.warn('[Cortex Chat API] Direct NVIDIA NIM request failed:', err?.message);
        if (!geminiApiKey && !openrouterApiKey) {
          throw err;
        }
      }
    }

    // Direct OpenRouter execution if explicitly targeted
    if (forcedOpenRouter && openrouterApiKey) {
      try {
        console.log(`[Cortex Chat API] Executing direct OpenRouter request ${hasImage ? '(Multimodal Vision)' : ''}...`);
        const orRes = await queryOpenRouter(prompt, openrouterApiKey, undefined, imageUrl);
        return NextResponse.json(
          {
            text: orRes.text,
            model: orRes.model,
            provider: 'openrouter',
            tier: tierDecision.tier,
            topRules: topRules.map((r) => ({ ruleId: r.ruleId, file: r.file, score: r.score })),
          },
          { headers: CORS_HEADERS }
        );
      } catch (err: any) {
        lastError = err;
        console.warn('[Cortex Chat API] Direct OpenRouter request failed:', err?.message);
        if (!geminiApiKey && !nvidiaApiKey) {
          throw err;
        }
      }
    }

    // Try Gemini model chain with Exponential Backoff + Jitter (bounded by global MAX_TOTAL_GEMINI_ATTEMPTS = 3)
    if (geminiApiKey && !succeededText) {
      const genAI = new GoogleGenerativeAI(geminiApiKey);
      let totalGeminiAttempts = 0;
      const MAX_TOTAL_GEMINI_ATTEMPTS = 3;

      modelLoop: for (let mIndex = 0; mIndex < modelChain.length; mIndex++) {
        if (totalGeminiAttempts >= MAX_TOTAL_GEMINI_ATTEMPTS) {
          console.warn(
            `[Cortex Chat API] Total Gemini attempts capped at ${MAX_TOTAL_GEMINI_ATTEMPTS}. Breaking model chain to activate failover.`
          );
          break modelLoop;
        }

        const currentModelName = modelChain[mIndex];
        const maxRetries = 1; // At most 1 retry per model, bounded globally

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
          if (totalGeminiAttempts >= MAX_TOTAL_GEMINI_ATTEMPTS) {
            break modelLoop;
          }
          totalGeminiAttempts++;

          try {
            console.log(
              `[Cortex Chat API] Attempting model: ${currentModelName} (attempt ${attempt + 1}/${maxRetries + 1}, total: ${totalGeminiAttempts}/${MAX_TOTAL_GEMINI_ATTEMPTS})`
            );
            const model = genAI.getGenerativeModel({ model: currentModelName });

            let geminiContent: any = prompt;
            if (imageUrl && imageUrl.startsWith('data:')) {
              const match = imageUrl.match(/^data:([^;]+);base64,(.+)$/);
              if (match) {
                geminiContent = [
                  prompt,
                  {
                    inlineData: {
                      mimeType: match[1],
                      data: match[2],
                    },
                  },
                ];
              }
            }

            const result = await model.generateContent(geminiContent);
            succeededText = result.response.text();
            succeededModel = currentModelName;
            succeededProvider = 'google';

            console.log(`[Cortex Chat API] Model ${currentModelName} succeeded on attempt ${attempt + 1}.`);
            break modelLoop; // Success: exit chain
          } catch (err: any) {
            lastError = err;
            const status = err?.status || err?.statusCode || (isHighDemandError(err) ? 503 : 500);
            const errMsg = String(err?.message || '').toLowerCase();
            const isHardQuota = errMsg.includes('resource_exhausted') || errMsg.includes('quota') || status === 429;

            console.warn(
              `[Cortex Chat API] Model ${currentModelName} attempt ${attempt + 1} failed [status: ${status}]: ${err?.message}`
            );

            // If hard quota exhaustion (429/resource_exhausted), retrying the same model with sleep is futile.
            // Break model retry loop immediately to advance to the next model or failover provider.
            if (isHardQuota) {
              console.warn(
                `[Cortex Chat API] Hard rate limit / quota exhaustion on ${currentModelName}. Bypassing intra-model retries to failover.`
              );
              break;
            }

            if (attempt < maxRetries && isHighDemandError(err)) {
              // Exponential backoff with jitter: (500ms * 2^attempt) + random(0-500ms)
              const backoff = 500 * Math.pow(2, attempt) + Math.random() * 500;
              console.log(
                `[Cortex Chat API] High demand (503) detected. Waiting ${Math.round(backoff)}ms before retry ${attempt + 2}...`
              );
              await delay(backoff);
            } else {
              console.warn(
                `[Cortex Chat API] Model ${currentModelName} exhausted retries or encountered unrecoverable status. Falling back to next model...`
              );
              break; // Break retry loop to try next model in fallback chain
            }
          }
        }
      }
    }

    // Tier 2 Groq Failover: If Gemini failed in Tier 2 and Groq API key is present
    if (!succeededText && groqApiKey && tierDecision.tier === 'tier2_fast') {
      console.log(
        `[Cortex Chat API] Gemini chain exhausted for Tier 2. Activating Groq failover (llama-3.3-70b-versatile)...`
      );
      try {
        const groqRes = await queryGroq(prompt, groqApiKey, 'llama-3.3-70b-versatile');
        succeededText = groqRes.text;
        succeededModel = groqRes.model;
        succeededProvider = 'groq';
        console.log('[Cortex Chat API] Groq Tier 2 failover succeeded!');
      } catch (groqErr: any) {
        lastError = groqErr;
        console.warn('[Cortex Chat API] Groq Tier 2 failover failed:', groqErr?.message);
      }
    }

    // Secondary Failover: If Gemini failed / exhausted retries, try NVIDIA NIM
    if (!succeededText && nvidiaApiKey) {
      console.log(
        `[Cortex Chat API] Gemini chain exhausted. Activating secondary multi-provider failover: NVIDIA NIM (${process.env.NVIDIA_MODEL || 'nvidia/nemotron-3-ultra-550b-a55b'})...`
      );
      try {
        const nimRes = await queryNvidiaNim(prompt, nvidiaApiKey, undefined, imageUrl);
        succeededText = nimRes.text;
        succeededModel = nimRes.model;
        succeededProvider = 'nvidia';
        console.log('[Cortex Chat API] NVIDIA NIM failover succeeded!');
      } catch (nimErr: any) {
        lastError = nimErr;
        console.warn('[Cortex Chat API] NVIDIA NIM failover failed:', nimErr?.message);
      }
    }

    // Tertiary Failover: If Gemini & NVIDIA failed / exhausted retries, try OpenRouter
    if (!succeededText && openrouterApiKey) {
      console.log(
        `[Cortex Chat API] Gemini and NVIDIA exhausted. Activating tertiary multi-provider failover: OpenRouter (${process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct'})...`
      );
      try {
        const orRes = await queryOpenRouter(prompt, openrouterApiKey, undefined, imageUrl);
        succeededText = orRes.text;
        succeededModel = orRes.model;
        succeededProvider = 'openrouter';
        console.log('[Cortex Chat API] OpenRouter failover succeeded!');
      } catch (orErr: any) {
        lastError = orErr;
        console.warn('[Cortex Chat API] OpenRouter failover failed:', orErr?.message);
      }
    }

    // If all providers and fallback models in the chain fail, return clean message
    if (!succeededText) {
      console.error('[Cortex Chat API] All fallback models and providers failed. Last error:', lastError);
      return NextResponse.json(
        {
          error: 'The AI is currently experiencing high demand. Please try again in a few moments.',
          text: 'The AI is currently experiencing high demand. Please try again in a few moments.',
        },
        { status: 503, headers: CORS_HEADERS }
      );
    }

    return NextResponse.json(
      {
        text: succeededText,
        model: succeededModel,
        provider: succeededProvider,
        tier: tierDecision.tier,
        topRules: topRules.map((r) => ({ ruleId: r.ruleId, file: r.file, score: r.score })),
      },
      { headers: CORS_HEADERS }
    );
  } catch (error: any) {
    console.error('[Cortex Chat API Unhandled Error]:', error);
    const errorMessage =
      isHighDemandError(error)
        ? 'The AI is currently experiencing high demand. Please try again in a few moments.'
        : error?.message || 'An error occurred while querying Gemini.';

    return NextResponse.json(
      {
        error: errorMessage,
        text: isHighDemandError(error)
          ? errorMessage
          : `Neural link error: ${errorMessage}`,
      },
      { status: isHighDemandError(error) ? 503 : 500, headers: CORS_HEADERS }
    );
  }
}

