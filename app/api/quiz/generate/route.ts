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

export type QuizPersona = 'student' | 'junior' | 'senior' | 'non-technical';

// Fallback high-fidelity questions reflecting realistic engineering scenarios without leaking rule IDs
const FALLBACK_QUESTIONS: QuizQuestion[] = [
  {
    id: 'Q1',
    questionType: 'scenario',
    title: 'Multi-Tenant Permissions: Student Assignment Editing',
    context:
      'You are building a university portal where students submit and edit their internship reports. An API route currently contains an insecure check: `if (user.role === \'student\') { await updateReport(reportId, payload); }`. Any student can edit any other student\'s report by guessing the report ID.',
    codeSnippet: `// Insecure route handler in /api/reports/[id]:\nif (user.role === 'student') {\n  await updateReport(reportId, payload);\n}`,
    codeLanguage: 'typescript',
    prompt: 'What is the most robust and scalable way to prevent students from tampering with other students\' reports?',
    options: [
      'Add more hardcoded roles to the database (e.g., student_owner, student_viewer, student_editor).',
      'Rely on frontend React state to disable the edit button if the report author does not match.',
      'Externalize permission checks using Attribute-Based Access Control (ABAC) with derived roles (e.g., allow edit if resource.authorId == principal.id).',
      'Create a completely separate SQL database for each enrolled student.',
    ],
    correctAnswer: 2,
    ruleId: 'AUTH-04',
    explanation:
      'Externalizing decision logic to a Policy Decision Point (PDP) using ABAC and derived roles decouples ownership verification from code and prevents role explosion.',
  },
  {
    id: 'Q2',
    questionType: 'scenario',
    title: 'Concurrent Sales: Small Retail POS Stock Decrement',
    context:
      'In a local campus supply shop POS, two cashiers ring up the very last uniform badge at the exact same second. Your backend executes a SELECT stock check followed by an UPDATE stock - 1. Both check queries return 1, and both write updates succeed, resulting in negative stock (-1) on the shelf.',
    codeSnippet: `-- Vulnerable read-then-write sequence:\nSELECT quantity FROM inventory WHERE item_id = 'badge_01';\n-- Both cashier threads see quantity = 1, then proceed:\nUPDATE inventory SET quantity = quantity - 1 WHERE item_id = 'badge_01';`,
    codeLanguage: 'sql',
    prompt: 'How should the database guarantee stock never dips below zero under concurrent traffic?',
    options: [
      'Add a visual disabled spinner on the checkout button to prevent double-clicks.',
      'Execute an atomic conditional update directly in SQL: UPDATE inventory SET quantity = quantity - 1 WHERE item_id = ? AND quantity >= 1.',
      'Temporarily store inventory balances in client-side localStorage before syncing to disk.',
      'Run an hourly background cleanup job to reset negative inventory values back to zero.',
    ],
    correctAnswer: 1,
    ruleId: 'DB-13',
    explanation:
      'Atomic conditional database updates guarantee that counters never breach zero without requiring table-wide locks or fragile application-level checks.',
  },
  {
    id: 'Q3',
    questionType: 'scenario',
    title: 'Data Privacy: Redacting Wholesale Costs in Cashier Terminal',
    context:
      'A school cooperative store employs student cashiers on shifts. The cashier terminal must display retail selling prices, but wholesale supplier costs and store profit margins must remain strictly confidential.',
    codeSnippet: `// Server API endpoint serving POS terminal:\nconst products = await db.products.findMany();\n// products array contains: [{ id, name, retailPrice, wholesaleCost, marginPercent }]\nreturn res.json(products);`,
    codeLanguage: 'typescript',
    prompt: 'Where must the wholesale cost and profit margin fields be stripped from the data?',
    options: [
      'In the React component by conditionally hiding the wholesale cost table column.',
      'Using CSS opacity: 0 and user-select: none to conceal the margin text.',
      'On the backend server before sending the HTTP response, using selective field projections or DTO sanitization.',
      'By instructing student cashiers not to open browser developer tools during their shift.',
    ],
    correctAnswer: 2,
    ruleId: 'SEC-14',
    explanation:
      'Server-side projection and sanitization must strip confidential commercial fields before payloads cross the server-client network boundary.',
  },
  {
    id: 'Q4',
    questionType: 'scenario',
    title: 'Intermittent Connectivity: Tracking OJT Hours in the Field',
    context:
      'An engineering student is completing an off-campus On-the-Job Training (OJT) shift at a remote construction site with dead cellular reception. They clock out at 5:00 PM, but the app fails to reach the cloud server.',
    codeSnippet: `async function logClockOut(studentId: string, timestamp: number) {\n  // What happens if navigator.onLine is false or the request times out?\n  await fetch('/api/ojt/clock-out', { method: 'POST', body: JSON.stringify({ studentId, timestamp }) });\n}`,
    codeLanguage: 'typescript',
    prompt: 'What architectural pattern guarantees student time records are never lost during field outages?',
    options: [
      'Show an alert error stating "No Connection" and clear the student\'s entered time entry.',
      'Persist the time entry in an offline IndexedDB queue and use a Service Worker background sync to replay it when connectivity returns.',
      'Block the student from opening the application until an active 5G signal is re-established.',
      'Store time logs in unencrypted cookies and delete them once the browser tab closes.',
    ],
    correctAnswer: 1,
    ruleId: 'IR-05',
    explanation:
      'Offline-first resilient integration requires local persistence in IndexedDB with transactional replay queues to prevent data loss during network disruptions.',
  },
  {
    id: 'Q5',
    questionType: 'scenario',
    title: 'System Discovery: Interrogating Edge Cases Before Specifying',
    context:
      'A university faculty asks your engineering capstone team to build a real-time thesis defense scheduler. Before drafting UI wireframes or writing database schemas, your team needs to identify blind spots, scheduling conflicts, and room double-booking pitfalls.',
    codeSnippet: `# Software Project Lifecycle:\nPhase 1: [ ??? ] -> Phase 2: Technical Specification -> Phase 3: Ticket Breakdown -> Phase 4: Implementation`,
    codeLanguage: 'text',
    prompt: 'What engineering practice should the team execute first before locking in requirements?',
    options: [
      'Begin coding the database migration immediately so frontend engineers have mock endpoints.',
      'Conduct a structured problem pre-mortem and grill assumptions to reveal failure modes before writing specs.',
      'Deploy an unauthenticated prototype directly to production to gather user ratings.',
      'Purchase enterprise cloud infrastructure before confirming student and faculty volume.',
    ],
    correctAnswer: 1,
    ruleId: 'PM-01',
    explanation:
      'Thorough pre-mortem problem interrogation surfaces hidden constraints, edge cases, and architectural risks before specifications and code are committed.',
  },
  {
    id: 'Q6',
    questionType: 'advanced',
    title: 'Shared Edge Caching: Preventing Tenant Information Leaks',
    context:
      'A school portal deploys a shared CDN edge cache in front of its API. An authenticated student views their private academic transcript. Shortly after, another student on a shared computer requests the same endpoint and views the first student\'s private grades.',
    codeSnippet: `HTTP/1.1 200 OK\nContent-Type: application/json\nCache-Control: public, max-age=3600`,
    codeLanguage: 'http',
    prompt: 'Which HTTP Cache-Control header directive prevents intermediate CDNs and shared proxies from caching private student data?',
    options: [
      'Cache-Control: public, max-age=86400',
      'Cache-Control: private, no-store, no-cache, must-revalidate',
      'Access-Control-Allow-Origin: *',
      'X-Forwarded-For: 127.0.0.1',
    ],
    correctAnswer: 1,
    ruleId: 'SEC-15',
    explanation:
      'Configuring `Cache-Control: private, no-store, no-cache, must-revalidate` on authenticated user responses ensures downstream CDNs, shared proxies, and browser caches never persist tenant-sensitive records.',
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

    // 2. Parse Persona / Difficulty Level
    let persona: QuizPersona = 'junior';
    try {
      const body = await req.json();
      if (body?.persona && ['student', 'junior', 'senior', 'non-technical'].includes(body.persona)) {
        persona = body.persona as QuizPersona;
      }
    } catch {
      // Default to junior developer
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
        persona,
      });
    }

    const vaultRulesText = loadVaultRules();
    if (!vaultRulesText) {
      return NextResponse.json({
        questions: FALLBACK_QUESTIONS,
        isFallback: true,
        source: 'static-fallback',
        persona,
      });
    }

    const personaDescriptions: Record<QuizPersona, string> = {
      student: `Target Persona: Student / Beginner.
Focus on general logic, data privacy (e.g. redacting confidential columns, student grades), basic UX (loading states, friendly error messages), tracking OJT internship hours, school portal submissions, and handling intermittent/offline internet connections.`,
      junior: `Target Persona: Junior Developer.
Focus on standard web security (SQL injection prevention, auth tokens, CORS/CSRF), basic SQL/NoSQL queries, React patterns, offline queueing, and practical error recovery in web applications.`,
      senior: `Target Persona: Senior Architect.
Focus on high-scale architecture trade-offs, race conditions, atomic conditional database updates, multi-tenancy access control (ABAC, PDP, Derived Roles), distributed caching and CDN cache isolation, and fault tolerance under load.`,
      'non-technical': `Target Persona: Non-Technical / Product Stakeholder.
Focus on software process (Golden Path SDLC, pre-mortems), OJT attendance logging workflows, user empathy & reducing friction, business logic boundaries, MVP scope definition, and compliance.`,
    };

    const prompt = `You are an expert technical examiner designing a scenario-based, adaptive engineering assessment for the Cortex Architecture and Procedural Judgment Vault.

${personaDescriptions[persona]}

Read these active rules from the 14 domains and agent gatekeepers:
${vaultRulesText}

CRITICAL RULES FOR QUESTION GENERATION:
1. NEVER mention rule IDs (such as "DB-13", "SEC-02", "RS-03", "SO-05", "AUTH-04", "PM-01", etc.) anywhere in the question 'title', 'context', 'codeSnippet', 'prompt', or 'options'. The user must NOT see rule codes during the exam. The exam must feel like a genuine, scenario-based engineering assessment, NOT a glossary or rule-memorization exam.
2. Ground questions in realistic student and engineering scenarios: e.g. a student tracking OJT hours in the field, a school portal handling thesis or exam submissions, a small retail POS with concurrent cashier checkouts, protecting wholesale costs from cashiers, or handling flaky offline connections.
3. The 'ruleId' field in the returned JSON must strictly contain the canonical rule ID being tested (e.g., "DB-13", "AUTH-04", "SEC-14", "IR-05", "PM-01", "SEC-15", etc.) for grading metadata.
4. The 'explanation' field should concisely explain why the correct option is architecturally sound.

Generate exactly 6 multiple-choice questions:
- For 'student' or 'non-technical': 3 scenario-based questions, 3 conceptual/practical workflow questions.
- For 'junior': 4 scenario-based questions, 2 practical implementation questions.
- For 'senior': 4 advanced scenario-based questions with code, 2 deep architectural trade-off questions.

For each question, provide:
- id: e.g. "Q1", "Q2", "Q3", "Q4", "Q5", "Q6"
- questionType: "recall" | "scenario" | "advanced"
- title: A realistic, technical problem title (DO NOT include rule IDs)
- context: A concrete scenario or problem context (DO NOT include rule IDs)
- codeSnippet: (Optional) 2-6 lines of realistic code, sql, or config demonstrating the issue
- codeLanguage: (Optional) "typescript" | "sql" | "bash" | "http" | "text"
- prompt: The clear, direct question being asked (DO NOT include rule IDs)
- options: An array of exactly 4 strings (options A, B, C, D) describing practical engineering approaches (DO NOT include rule IDs)
- correctAnswer: The 0-based integer index (0 for A, 1 for B, 2 for C, or 3 for D) of the correct answer
- ruleId: The specific rule ID being tested (e.g., "AUTH-04", "DB-13", "SEC-14", "RS-03", "PM-01", "SEC-15", "IR-05")
- explanation: A concise 1-2 sentence explanation of why the correct answer is right.

Output strictly as a valid JSON array of 6 question objects. Do NOT include markdown code blocks, explanatory preamble, or trailing commentary. Just the raw JSON array.`;

    // Helper to sanitize questions and ensure NO rule IDs leak into visible fields
    const sanitizeGeneratedQuestions = (questions: any[]): QuizQuestion[] => {
      const ruleIdRegex = /\b([A-Z]{2,4}-\d{2,3})\b/g;
      return questions.map((q, idx) => {
        const rawTitle = typeof q.title === 'string' ? q.title.replace(ruleIdRegex, '').replace(/\s*\(\s*\)/g, '').trim() : `Scenario ${idx + 1}`;
        const rawContext = typeof q.context === 'string' ? q.context.replace(ruleIdRegex, '').trim() : '';
        const rawPrompt = typeof q.prompt === 'string' ? q.prompt.replace(ruleIdRegex, '').trim() : '';
        const rawOptions = Array.isArray(q.options)
          ? q.options.map((opt: any) => (typeof opt === 'string' ? opt.replace(ruleIdRegex, '').trim() : String(opt)))
          : ['Option A', 'Option B', 'Option C', 'Option D'];

        return {
          id: q.id || `Q${idx + 1}`,
          questionType: ['recall', 'scenario', 'advanced'].includes(q.questionType) ? q.questionType : 'scenario',
          title: rawTitle,
          context: rawContext,
          codeSnippet: typeof q.codeSnippet === 'string' ? q.codeSnippet : undefined,
          codeLanguage: typeof q.codeLanguage === 'string' ? q.codeLanguage : 'typescript',
          prompt: rawPrompt,
          options: rawOptions.slice(0, 4),
          correctAnswer: typeof q.correctAnswer === 'number' && q.correctAnswer >= 0 && q.correctAnswer <= 3 ? q.correctAnswer : 0,
          ruleId: typeof q.ruleId === 'string' && q.ruleId.length > 0 ? q.ruleId : 'SEC-01',
          explanation: typeof q.explanation === 'string' ? q.explanation : 'Aligns with core architectural invariants.',
        };
      });
    };

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
          const sanitized = sanitizeGeneratedQuestions(parsed.slice(0, 6));
          return NextResponse.json({
            questions: sanitized,
            isFallback: false,
            model: 'gemini-3.5-flash',
            persona,
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
                  'You are an expert technical examiner. Return strictly a JSON array of 6 scenario-based multiple-choice questions without markdown tags, rule IDs in titles/prompts, or extra text.',
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
            const sanitized = sanitizeGeneratedQuestions(parsed.slice(0, 6));
            return NextResponse.json({
              questions: sanitized,
              isFallback: false,
              model: 'nvidia-nim',
              persona,
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
      persona,
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

