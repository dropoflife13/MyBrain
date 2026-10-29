import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { getBrainData } from '../../../lib/brain-parser';
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
  'SIX-COMMANDS': 'brain/08-workflows/SIX-COMMANDS.md',
  'six-commands': 'brain/08-workflows/SIX-COMMANDS.md',
  researchagent: 'agents/researchagent.md',
  psychology: 'brain/02-domains/psychology.md',
  philosophy: 'brain/02-domains/philosophy.md',
  rhetoric: 'brain/02-domains/rhetoric.md',
  economy: 'brain/02-domains/economy.md',
  geopolitics: 'brain/02-domains/geopolitics.md',
  health: 'brain/02-domains/health.md',
  authorization: 'brain/02-domains/authorization.md',
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
  PSY: 'brain/02-domains/psychology.md',
  PHI: 'brain/02-domains/philosophy.md',
  RHE: 'brain/02-domains/rhetoric.md',
  ECO: 'brain/02-domains/economy.md',
  GEO: 'brain/02-domains/geopolitics.md',
  HLT: 'brain/02-domains/health.md',
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
    agents: ['agents/systemsdesignagent.md'],
    instruction:
      'You are executing the /to-spec step of the Golden Path SDLC. Follow Systems Design (SD) rules. Write a comprehensive technical PRD with As-Is and To-Be architectures, failure modes, data contracts, and explicit non-goals.',
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
      'You are executing the /implement step of the Golden Path SDLC. Write production-ready code for Ticket 1. You must strictly obey DB rules (append-only, RLS default deny, indexes), Security rules (STRIDE, client never sees service_role, no raw input trust), and Integration rules. Fail closed if any rule is violated.',
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
    agents: ['agents/dbaagent.md', 'agents/securityagent.md'],
    instruction:
      'You are executing the /harden step of the Cortex Pipeline. You strictly enforce DBA Agent rules (DB-13 Atomic Conditionals, DB-14 Multi-Tenant Row Isolation) and Security Agent rules (SEC-14 Server-Side Redaction, SEC-15 Cache-Control for Private Data). Audit the architecture and code for race conditions on counters/stock (DB-13), verify multi-tenant isolation at query/RLS level (DB-14), ensure sensitive commercial fields (e.g. buyingCost, profitMargin, adminNotes) are sanitized server-side before reaching clients (SEC-14), and verify Cache-Control private/no-store headers on authenticated endpoints (SEC-15).',
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
          'You are Cortex AI, the procedural judgment engine and 7-Agent SDLC supervisor. Respond with strict engineering rigor, adherence to invariants, and structured markdown. When inspecting diagrams, mockups, or schemas, audit them against our 7 gatekeepers (DB, SEC, UX, PM, SD, IR, GR).',
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
            'You are Cortex AI, the procedural judgment engine and 7-Agent SDLC supervisor. Respond with strict engineering rigor, adherence to invariants, and structured markdown.',
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

const CLASSIFIER_SYSTEM_PROMPT = `You are a specialized Task Routing AI for the Cortex Architecture.
Your sole function is to analyze the user's request and classify its complexity. Choose between 'flash' (SIMPLE) or 'pro' (COMPLEX):
1. 'flash': Fast, efficient model for simple, well-defined tasks (1-3 steps, rule lookups, single definition).
2. 'pro': Powerful model for complex, open-ended tasks (4+ steps, strategic design, ambiguity, deep root-cause debugging).`;

async function classifyTaskComplexity(
  query: string,
  apiKey: string
): Promise<{ modelChoice: 'flash' | 'pro'; reasoning: string } | null> {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const classifier = genAI.getGenerativeModel({
      model: 'gemini-3.1-flash-lite',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            reasoning: {
              type: SchemaType.STRING,
              description: 'A brief, step-by-step explanation for the model choice, referencing the rubric.',
            },
            modelChoice: {
              type: SchemaType.STRING,
              format: 'enum',
              enum: ['flash', 'pro'],
            },
          },
          required: ['reasoning', 'modelChoice'],
        },
        temperature: 0.1,
      },
      systemInstruction: CLASSIFIER_SYSTEM_PROMPT,
    });

    const res = await classifier.generateContent(query);
    const parsed = JSON.parse(res.response.text());
    console.log(`[Cortex Chat API] Task Classifier Decision: ${parsed.modelChoice} - ${parsed.reasoning}`);
    return parsed;
  } catch (err: any) {
    console.warn('[Cortex Chat API] Task Classifier skipped or failed:', err?.message);
    return null;
  }
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

    const { query, contextNode, workflowCommand, provider } = validation.data;
    const imageUrl = validation.data.imageUrl || undefined;

    const geminiApiKey = process.env.GEMINI_API_KEY;
    const nvidiaApiKey =
      process.env.NVIDIA_API_KEY ||
      process.env['NVIDIABuild-Autogen-44'] ||
      process.env.NVIDIA_KEY;
    const openrouterApiKey = process.env.OPENROUTER_API_KEY;

    if (!geminiApiKey && !nvidiaApiKey && !openrouterApiKey) {
      return NextResponse.json(
        {
          error: 'No AI API key is configured in the environment.',
          text: 'Error: Neither GEMINI_API_KEY, NVIDIA_API_KEY, nor OPENROUTER_API_KEY is configured in .env.local.',
        },
        { status: 500, headers: CORS_HEADERS }
      );
    }

    const hasImage = Boolean(imageUrl);
    const forcedNvidia =
      hasImage || // Prioritize Nemotron Omni Vision for multimodal attachments
      provider === 'nvidia' ||
      process.env.AI_PROVIDER === 'nvidia' ||
      (!geminiApiKey && Boolean(nvidiaApiKey));

    const forcedOpenRouter =
      provider === 'openrouter' ||
      process.env.AI_PROVIDER === 'openrouter' ||
      (!geminiApiKey && !nvidiaApiKey && Boolean(openrouterApiKey));

    // Dynamic Task Routing & Classification
    const workflow = detectWorkflowCommand(query, workflowCommand);
    let complexity: 'flash' | 'pro' = 'flash';
    if (workflow || hasImage) {
      complexity = 'pro';
    } else if (geminiApiKey) {
      const classification = await classifyTaskComplexity(query, geminiApiKey);
      if (classification?.modelChoice) {
        complexity = classification.modelChoice;
      }
    }

    // 1. Define Fallback Chain: ['gemini-3.5-flash', 'gemini-3.1-flash-lite']
    const baseChain = ['gemini-3.5-flash', 'gemini-3.1-flash-lite'];
    const modelChain = process.env.AI_MODEL
      ? Array.from(new Set([process.env.AI_MODEL, ...baseChain]))
      : baseChain;

    console.log(
      `[Cortex Chat API] Routing mode: ${
        forcedNvidia ? 'NVIDIA NIM' : forcedOpenRouter ? 'OpenRouter' : 'Gemini Chain + Failover'
      } [Complexity: ${complexity.toUpperCase()}]`
    );

    let prompt: string;
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

USER REQUEST / PROBLEM DESCRIPTION:
${query}

Respond in clean, highly structured GitHub-flavored markdown with strict engineering rigor.`;
    } else {
      const fileContent = getFileContentForNode(contextNode);
      prompt = `You are answering based on these rules: \n\n ${fileContent} \n\n User Question: ${query}`;
    }

    let succeededText = '';
    let succeededModel = '';
    let succeededProvider = '';
    let lastError: any = null;

    // Direct NVIDIA NIM execution if explicitly targeted, image attached, or if Gemini key is absent
    if (forcedNvidia && nvidiaApiKey) {
      try {
        console.log(`[Cortex Chat API] Executing direct NVIDIA NIM request ${hasImage ? '(Multimodal Vision)' : ''}...`);
        const nimRes = await queryNvidiaNim(prompt, nvidiaApiKey, undefined, imageUrl);
        return NextResponse.json(
          { text: nimRes.text, model: nimRes.model, provider: 'nvidia' },
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
          { text: orRes.text, model: orRes.model, provider: 'openrouter' },
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

    // Try Gemini model chain with Exponential Backoff + Jitter
    if (geminiApiKey && !succeededText) {
      const genAI = new GoogleGenerativeAI(geminiApiKey);

      modelLoop: for (let mIndex = 0; mIndex < modelChain.length; mIndex++) {
        const currentModelName = modelChain[mIndex];
        const maxRetries = 2; // Up to 2 retries (3 attempts total) per model

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
          try {
            console.log(
              `[Cortex Chat API] Attempting model: ${currentModelName} (attempt ${attempt + 1}/${maxRetries + 1})`
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
            console.warn(
              `[Cortex Chat API] Model ${currentModelName} attempt ${attempt + 1} failed [status: ${status}]: ${err?.message}`
            );

            if (attempt < maxRetries && isHighDemandError(err)) {
              // Exponential backoff with jitter: (500ms * 2^attempt) + random(0-500ms)
              const backoff = 500 * Math.pow(2, attempt) + Math.random() * 500;
              console.log(
                `[Cortex Chat API] High demand / rate limit (503/429) detected. Waiting ${Math.round(backoff)}ms before retry ${attempt + 2}...`
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

