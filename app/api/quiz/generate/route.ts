import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

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
    path.resolve(__dirname, '../../../../', relPath),
    path.resolve(__dirname, '../../../../../', relPath),
    path.resolve(rootDir, '.next', 'server', relPath),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
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
      prefix: 'cortex:ratelimit:quiz',
    });
  } catch (e) {
    console.warn('[Cortex Quiz API] Failed to initialize Upstash Ratelimit:', e);
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
  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (record.timestamps.length >= limit) {
    const oldest = record.timestamps[0];
    const resetSec = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    return { success: false, reset: resetSec };
  }

  record.timestamps.push(now);
  inMemoryRateLimitStore.set(ip, record);

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
      console.warn('[Cortex Quiz API] Upstash rate limit failed, using in-memory fallback:', err);
    }
  }
  return checkInMemoryRateLimit(ip, 5, 60 * 1000);
}

export interface QuizQuestion {
  id: string;
  questionType: 'recall' | 'scenario' | 'advanced';
  title: string;
  context: string;
  codeSnippet?: string;
  codeLanguage?: string;
  prompt: string;
  options: string[];
  correctAnswer: number; // 0, 1, 2, or 3
  ruleId: string;
  explanation: string;
}

// Fallback high-fidelity questions reflecting elite enterprise standards
const FALLBACK_QUESTIONS: QuizQuestion[] = [
  {
    id: 'Q1',
    questionType: 'scenario',
    title: 'Authorization: Scalable Multi-Tenant Access Control',
    context:
      'You are building a multi-tenant SaaS where a user can only edit their own posts. You currently have if (user.role === \'author\') hardcoded in your API route.',
    codeSnippet: `if (user.role === 'author') {\n  await updatePost(postId, payload);\n}`,
    codeLanguage: 'typescript',
    prompt: 'What is the most scalable way to handle this?',
    options: [
      'Add more roles (e.g., post_owner, post_editor) to the database.',
      'Use Postgres Row-Level Security (RLS) with a user_id = auth.uid() policy.',
      'Externalize the decision to a PDP using ABAC and Derived Roles (e.g., role: owner if resource.ownerId == principal.id).',
      'Create a new table for every user.',
    ],
    correctAnswer: 2,
    ruleId: 'AUTH-04',
    explanation:
      'Matches AUTH-01 and AUTH-04: Externalizing decision logic to a PDP using ABAC and derived roles decouples policy from code and prevents role explosion.',
  },
  {
    id: 'Q2',
    questionType: 'scenario',
    title: 'Race Conditions: Concurrent Stock Decrement',
    context:
      'Two cashiers buy the last bag of feed at the exact same millisecond. Your code does SELECT stock then UPDATE stock - 1. Both succeed, resulting in -1 inventory.',
    codeSnippet: `-- Vulnerable non-atomic read-then-write\nSELECT quantity FROM inventory WHERE product_id = 'prod_1';\nUPDATE inventory SET quantity = quantity - 1 WHERE product_id = 'prod_1';`,
    codeLanguage: 'sql',
    prompt: 'How do you fix this at the database level?',
    options: [
      'Add a UI loading spinner to block the second click.',
      'Use an atomic conditional update (UPDATE stock SET quantity = quantity - 1 WHERE quantity >= 1).',
      'Store the stock in a Redis cache.',
      'Use a cron job to fix negative inventory every hour.',
    ],
    correctAnswer: 1,
    ruleId: 'DB-13',
    explanation:
      'Matches DB-13: Atomic conditional updates directly in the database engine guarantee counters never breach zero without needing locks or fragile app-level checks.',
  },
  {
    id: 'Q3',
    questionType: 'scenario',
    title: 'Data Privacy: Commercial Margin & Cost Redaction',
    context:
      'A store owner wants their cashiers to use the POS system, but cashiers must NOT see the buyingCost or profitMargin of the products.',
    codeSnippet: `// Cashier POS query\nconst products = await db.products.findMany();\nreturn res.json(products); // Exposes buyingCost & profitMargin`,
    codeLanguage: 'typescript',
    prompt: 'Where should this data redaction be enforced?',
    options: [
      'Hide the UI column using React conditional rendering.',
      'Use CSS to make the text invisible.',
      'Sanitize the API response on the server to strip buyingCost before it reaches the client.',
      'Trust the cashiers not to open DevTools.',
    ],
    correctAnswer: 2,
    ruleId: 'SEC-14',
    explanation:
      'Matches SEC-14: Server-side projection and sanitization must strip confidential commercial fields before payload leaves the server boundary.',
  },
  {
    id: 'Q4',
    questionType: 'recall',
    title: 'Anti-Hallucination: Epistemic Rigor',
    context:
      'A user asks the AI: "What is the current inflation rate in the Philippines today?" You have no local Markdown documents containing current statistics, and real-time web access is unavailable.',
    codeSnippet: `User: "What is the current inflation rate in the Philippines today?"\nLocal Vault: [No current macroeconomic statistics present]`,
    codeLanguage: 'text',
    prompt: 'What should the AI do if it does not have real-time web access?',
    options: [
      'Guess the number based on the year.',
      'Say "I don\'t know, but it\'s probably around 4%."',
      'State: "WARNING: I do not have verified data for this. Hallucination risk is high. Please provide a source."',
      'Refuse to answer and end the chat.',
    ],
    correctAnswer: 2,
    ruleId: 'RS-03',
    explanation:
      'Matches RS-03: When local vault documents do not contain verified data and web retrieval is unavailable, the AI must halt and state the explicit anti-hallucination warning.',
  },
  {
    id: 'Q5',
    questionType: 'recall',
    title: 'The Golden Path: Problem Interrogation',
    context:
      'You are starting a new project in the Cortex Software Factory. You want to interrogate the problem and find edge cases before writing the technical PRD.',
    codeSnippet: `Step 1: [ ??? ] -> Step 2: /pitch -> Step 3: /to-spec -> Step 4: /to-tickets`,
    codeLanguage: 'bash',
    prompt: 'Which pipeline command do you run first?',
    options: ['/to-spec', '/grill', '/implement', '/harden'],
    correctAnswer: 1,
    ruleId: 'PM-01',
    explanation:
      'Matches PM-01 and the Golden Path SDLC: /grill activates Product Manager rules to interrogate assumptions and surface edge cases before any specification or code is produced.',
  },
  {
    id: 'Q6',
    questionType: 'advanced',
    title: 'Enterprise Hardening: CDN Cache Isolation',
    context:
      'Your API serves tenant-specific data. A global CDN (like Cloudflare) caches the response, and the next user sees the previous user\'s data.',
    codeSnippet: `HTTP/1.1 200 OK\nContent-Type: application/json\nCache-Control: public, max-age=3600`,
    codeLanguage: 'http',
    prompt: 'What header prevents cross-tenant CDN cache leaks?',
    options: [
      'Cache-Control: public, max-age=3600',
      'Cache-Control: private, no-store, no-cache, must-revalidate',
      'Access-Control-Allow-Origin: *',
      'Content-Type: application/json',
    ],
    correctAnswer: 1,
    ruleId: 'SEC-15',
    explanation:
      'Matches SEC-15: Setting Cache-Control: private, no-store, no-cache, must-revalidate on authenticated routes prevents shared proxies and CDNs from storing tenant data.',
  },
];

// Read canonical rules from agents and domains
function loadVaultRules(): string {
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

  const domainFiles = [
    'brain/02-domains/cybersec.md',
    'brain/02-domains/authorization.md',
    'brain/02-domains/solutions.md',
    'brain/02-domains/business-analysis.md',
    'brain/02-domains/ui-frontend.md',
    'brain/02-domains/psychology.md',
    'brain/02-domains/economy.md',
    'brain/02-domains/philosophy.md',
    'brain/02-domains/geopolitics.md',
    'brain/02-domains/rhetoric.md',
    'brain/02-domains/health.md',
  ];

  const collected: string[] = [];

  for (const rel of [...agentFiles, ...domainFiles]) {
    const full = resolveFilePath(rel);
    if (full && fs.existsSync(full)) {
      try {
        const text = fs.readFileSync(full, 'utf8');
        // Extract active rules lines (matching CV-02 rule format: - **ID** WHEN ...)
        const ruleLines = text
          .split('\n')
          .filter((line) => line.trim().startsWith('- **') && line.includes(' | '))
          .slice(0, 12); // Sample up to 12 rules per file to manage context budget
        if (ruleLines.length > 0) {
          collected.push(`### Source: ${rel}\n${ruleLines.join('\n')}`);
        }
      } catch (err) {
        console.warn(`[Cortex Quiz API] Error reading ${rel}:`, err);
      }
    }
  }

  return collected.join('\n\n');
}

export async function POST(req: Request) {
  try {
    // 1. Rate Limiting Check
    const rateLimit = await verifyRateLimit(req);
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. Please wait a moment before generating another quiz.',
          questions: FALLBACK_QUESTIONS,
          isFallback: true,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.reset || 60),
          },
        }
      );
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    const nvidiaApiKey =
      process.env.NVIDIA_API_KEY ||
      process.env['NVIDIABuild-Autogen-44'] ||
      process.env.NVIDIA_KEY;

    if (!geminiApiKey && !nvidiaApiKey) {
      console.warn('[Cortex Quiz API] No AI API keys detected. Returning static fallback assessment.');
      return NextResponse.json({
        questions: FALLBACK_QUESTIONS,
        isFallback: true,
        source: 'static-fallback',
      });
    }

    const vaultRulesText = loadVaultRules();
    if (!vaultRulesText) {
      return NextResponse.json({
        questions: FALLBACK_QUESTIONS,
        isFallback: true,
        source: 'static-fallback',
      });
    }

    const prompt = `You are an expert examiner for the Cortex Architecture and Procedural Judgment Vault.
Read these active rules from the 14 domains and agent gatekeepers:

${vaultRulesText}

Generate exactly 6 multiple-choice questions based on these rules:
- 2 should be basic recall (e.g., 'What does rule X state?').
- 2 should be scenario-based (e.g., 'A developer does Y, which rule is violated?').
- 2 should be advanced (e.g., 'Which combination of rules prevents Z?').

For each question, provide:
- id: e.g. "Q1", "Q2", "Q3", "Q4", "Q5", "Q6"
- questionType: "recall" | "scenario" | "advanced"
- title: A short, professional technical title
- context: Scenario context or problem description
- codeSnippet: (Optional) 1-4 lines of code, sql, or config demonstrating the problem
- codeLanguage: (Optional) "typescript" | "sql" | "bash" | "http" | "text"
- prompt: The clear, direct question being asked
- options: An array of exactly 4 strings (options A, B, C, D)
- correctAnswer: The 0-based integer index (0 for A, 1 for B, 2 for C, or 3 for D) of the correct answer
- ruleId: The specific rule ID being tested (e.g., "AUTH-01", "DB-13", "SEC-14", "RS-03", "PM-01", "SEC-15", etc.)
- explanation: A concise, exactly 1-sentence explanation of why the correct answer is right and why the rule mandates it.

Output strictly as a valid JSON array of 6 question objects. Do NOT include markdown code blocks, explanatory preamble, or trailing commentary. Just the raw JSON array.`;

    // Attempt Gemini Generation
    if (geminiApiKey) {
      try {
        const genAI = new GoogleGenerativeAI(geminiApiKey);
        const model = genAI.getGenerativeModel({
          model: 'gemini-3.5-flash',
          generationConfig: {
            temperature: 0.3,
            responseMimeType: 'application/json',
          },
        });

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        const cleaned = text.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
        const parsed = JSON.parse(cleaned);

        if (Array.isArray(parsed) && parsed.length >= 6) {
          return NextResponse.json({
            questions: parsed.slice(0, 6),
            isFallback: false,
            model: 'gemini-3.5-flash',
          });
        }
      } catch (err: any) {
        console.warn('[Cortex Quiz API] Gemini quiz generation failed:', err?.message);
      }
    }

    // Attempt NVIDIA NIM Generation if Gemini failed or missing
    if (nvidiaApiKey) {
      try {
        const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${nvidiaApiKey}`,
          },
          body: JSON.stringify({
            model: process.env.NVIDIA_MODEL || 'meta/llama-3.3-70b-instruct',
            messages: [
              {
                role: 'system',
                content:
                  'You are an expert technical examiner. Return strictly a JSON array of 6 multiple-choice questions without markdown tags or extra text.',
              },
              { role: 'user', content: prompt },
            ],
            temperature: 0.2,
            max_tokens: 4096,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const raw = data?.choices?.[0]?.message?.content || '';
          const cleaned = raw.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
          const parsed = JSON.parse(cleaned);
          if (Array.isArray(parsed) && parsed.length >= 6) {
            return NextResponse.json({
              questions: parsed.slice(0, 6),
              isFallback: false,
              model: 'nvidia-nim',
            });
          }
        }
      } catch (err: any) {
        console.warn('[Cortex Quiz API] NVIDIA NIM generation failed:', err?.message);
      }
    }

    // Graceful fallback to static high-standard questions
    return NextResponse.json({
      questions: FALLBACK_QUESTIONS,
      isFallback: true,
      source: 'static-fallback',
    });
  } catch (err: any) {
    console.error('[Cortex Quiz API] Unexpected error in quiz route:', err);
    return NextResponse.json({
      questions: FALLBACK_QUESTIONS,
      isFallback: true,
      source: 'error-fallback',
      error: err?.message,
    });
  }
}

