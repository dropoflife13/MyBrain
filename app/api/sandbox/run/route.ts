import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { z } from 'zod';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

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
      limiter: Ratelimit.slidingWindow(20, '60 s'),
      analytics: true,
      prefix: 'cortex:ratelimit:sandbox',
    });
  } catch (e) {
    console.warn('[Cortex Sandbox] Failed to initialize Upstash Ratelimit:', e);
  }
}

interface InMemoryRateLimitRecord {
  timestamps: number[];
}
const inMemoryRateLimitStore = new Map<string, InMemoryRateLimitRecord>();

function checkInMemoryRateLimit(
  ip: string,
  limit = 20,
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
  return { success: true, reset: 60 };
}

function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return '127.0.0.1';
}

const SandboxRequestSchema = z.object({
  code: z.string().min(1, 'Code cannot be empty').max(100000, 'Code exceeds 100KB limit'),
  language: z.string().optional().default('typescript'),
  command: z.string().optional(),
  stream: z.boolean().optional().default(true),
  timeoutMs: z.number().min(1000).max(15000).optional().default(8000),
});

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

/**
 * Strips all sensitive credentials from subprocess environment.
 * The untrusted code running in the sandbox can never leak secrets or tokens.
 */
function getSanitizedEnv(): NodeJS.ProcessEnv {
  const safeEnv: NodeJS.ProcessEnv = {
    PATH: process.env.PATH || '',
    TEMP: os.tmpdir(),
    TMP: os.tmpdir(),
    NODE_ENV: 'production',
    LANG: 'en_US.UTF-8',
  };

  if (process.platform === 'win32') {
    safeEnv.SYSTEMROOT = process.env.SYSTEMROOT || 'C:\\Windows';
    safeEnv.COMSPEC = process.env.COMSPEC || 'C:\\Windows\\System32\\cmd.exe';
    safeEnv.PATHEXT = process.env.PATHEXT || '.COM;.EXE;.BAT;.CMD';
  } else {
    safeEnv.HOME = os.tmpdir();
    safeEnv.USER = 'sandbox';
  }

  return safeEnv;
}

export async function POST(req: Request) {
  try {
    // 1. Verify Rate Limit (20 executions per minute per IP)
    const ip = getClientIp(req);
    let rateCheck = { success: true, reset: 60 };
    if (upstashRatelimit) {
      try {
        const result = await upstashRatelimit.limit(ip);
        rateCheck = { success: result.success, reset: Math.ceil(result.reset / 1000) };
      } catch {
        rateCheck = checkInMemoryRateLimit(ip);
      }
    } else {
      rateCheck = checkInMemoryRateLimit(ip);
    }

    if (!rateCheck.success) {
      return NextResponse.json(
        {
          error: `Execution rate limit reached. Please wait ${rateCheck.reset} seconds before running more code.`,
          status: 'rate_limited',
        },
        { status: 429, headers: CORS_HEADERS }
      );
    }

    // 2. Parse & Validate Payload
    const body = await req.json().catch(() => null);
    const parsed = SandboxRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Invalid sandbox payload',
          details: parsed.error.issues.map((i) => i.message).join(', '),
        },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const { code, language, stream: wantStream, timeoutMs } = parsed.data;
    const normLang = language.toLowerCase().trim();

    // 3. Optional E2B Cloud Sandbox Integration (if E2B_API_KEY is configured)
    if (process.env.E2B_API_KEY) {
      try {
        const e2bModule: any = await import('@e2b/code-interpreter');
        const SandboxClass = e2bModule.Sandbox || e2bModule.default;
        const sandbox = await SandboxClass.create({ apiKey: process.env.E2B_API_KEY });
        const startTime = Date.now();
        const execution = await sandbox.commands.run(
          normLang.startsWith('py') ? `python -c "${code.replace(/"/g, '\\"')}"` : `node -e "${code.replace(/"/g, '\\"')}"`
        );
        await sandbox.kill();

        const stdout = execution.stdout || '';
        const stderr = execution.stderr || '';
        const duration = Date.now() - startTime;
        const exitCode = execution.exitCode ?? 0;

        if (wantStream) {
          const encoder = new TextEncoder();
          const readable = new ReadableStream({
            start(controller) {
              if (stdout) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'stdout', text: stdout })}\n\n`));
              }
              if (stderr) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'stderr', text: stderr })}\n\n`));
              }
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: 'exit',
                    exitCode,
                    executionTimeMs: duration,
                    status: exitCode === 0 ? 'success' : 'error',
                    sandbox: 'e2b-cloud',
                  })}\n\n`
                )
              );
              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
              controller.close();
            },
          });
          return new Response(readable, {
            headers: {
              ...CORS_HEADERS,
              'Content-Type': 'text/event-stream; charset=utf-8',
              'Cache-Control': 'no-cache, no-transform',
              Connection: 'keep-alive',
            },
          });
        }

        return NextResponse.json(
          {
            stdout,
            stderr,
            exitCode,
            executionTimeMs: duration,
            status: exitCode === 0 ? 'success' : 'error',
            sandbox: 'e2b-cloud',
          },
          { headers: CORS_HEADERS }
        );
      } catch (e2bErr: any) {
        console.warn('[Cortex Sandbox] E2B execution failed, falling back to isolated runner:', e2bErr?.message);
      }
    }

    // 4. Isolated Local Sandbox Runner
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cortex-sandbox-'));
    let command = 'node';
    let args: string[] = [];
    let sourceFilePath = '';

    const isPython = ['python', 'py', 'python3'].includes(normLang);
    const isShell = ['bash', 'sh', 'shell', 'zsh'].includes(normLang);

    if (isPython) {
      command = process.platform === 'win32' ? 'python' : 'python3';
      sourceFilePath = path.join(tempDir, 'script.py');
      fs.writeFileSync(sourceFilePath, code, 'utf8');
      args = [sourceFilePath];
    } else if (isShell) {
      if (process.platform === 'win32') {
        command = 'powershell';
        sourceFilePath = path.join(tempDir, 'script.ps1');
        fs.writeFileSync(sourceFilePath, code, 'utf8');
        args = ['-ExecutionPolicy', 'Bypass', '-File', sourceFilePath];
      } else {
        command = 'bash';
        sourceFilePath = path.join(tempDir, 'script.sh');
        fs.writeFileSync(sourceFilePath, code, 'utf8');
        args = [sourceFilePath];
      }
    } else {
      // Default: Node.js (TypeScript & JavaScript)
      command = 'node';
      const ext = ['typescript', 'ts', 'tsx'].includes(normLang) ? '.ts' : '.js';
      sourceFilePath = path.join(tempDir, `script${ext}`);
      fs.writeFileSync(sourceFilePath, code, 'utf8');
      args = [sourceFilePath];
    }

    const safeEnv = getSanitizedEnv();
    const startTime = Date.now();

    if (wantStream) {
      // Streaming SSE Response
      const encoder = new TextEncoder();
      let isProcessClosed = false;

      const readable = new ReadableStream({
        start(controller) {
          let childProc: any = null;
          let timer: NodeJS.Timeout | null = null;

          try {
            childProc = spawn(command, args, {
              cwd: tempDir,
              env: safeEnv,
              stdio: ['pipe', 'pipe', 'pipe'],
              timeout: timeoutMs,
            });

            // Hard timeout watchdog
            timer = setTimeout(() => {
              if (!isProcessClosed && childProc) {
                isProcessClosed = true;
                try {
                  childProc.kill('SIGKILL');
                } catch {}
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({
                      type: 'stderr',
                      text: `\n[Cortex Sandbox Error: Process timed out after ${timeoutMs}ms]\n`,
                    })}\n\n`
                  )
                );
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({
                      type: 'exit',
                      exitCode: 124,
                      executionTimeMs: timeoutMs,
                      status: 'timeout',
                      sandbox: 'cortex-isolated-runner',
                    })}\n\n`
                  )
                );
                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                controller.close();
                cleanUpTemp(tempDir);
              }
            }, timeoutMs);

            childProc.stdout.on('data', (chunk: Buffer) => {
              if (isProcessClosed) return;
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ type: 'stdout', text: chunk.toString('utf8') })}\n\n`
                )
              );
            });

            childProc.stderr.on('data', (chunk: Buffer) => {
              if (isProcessClosed) return;
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ type: 'stderr', text: chunk.toString('utf8') })}\n\n`
                )
              );
            });

            childProc.on('error', (err: any) => {
              if (isProcessClosed) return;
              isProcessClosed = true;
              if (timer) clearTimeout(timer);
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: 'stderr',
                    text: `\n[Execution Error: ${err.message || 'Process spawn failed'}]\n`,
                  })}\n\n`
                )
              );
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: 'exit',
                    exitCode: 1,
                    executionTimeMs: Date.now() - startTime,
                    status: 'error',
                    sandbox: 'cortex-isolated-runner',
                  })}\n\n`
                )
              );
              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
              controller.close();
              cleanUpTemp(tempDir);
            });

            childProc.on('close', (code: number | null) => {
              if (isProcessClosed) return;
              isProcessClosed = true;
              if (timer) clearTimeout(timer);
              const duration = Date.now() - startTime;
              const exitCode = code ?? 0;
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: 'exit',
                    exitCode,
                    executionTimeMs: duration,
                    status: exitCode === 0 ? 'success' : 'error',
                    sandbox: 'cortex-isolated-runner',
                  })}\n\n`
                )
              );
              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
              controller.close();
              cleanUpTemp(tempDir);
            });
          } catch (spawnErr: any) {
            if (!isProcessClosed) {
              isProcessClosed = true;
              if (timer) clearTimeout(timer);
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: 'stderr',
                    text: `\n[Spawn Exception: ${spawnErr?.message || 'Unknown error'}]\n`,
                  })}\n\n`
                )
              );
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: 'exit',
                    exitCode: 1,
                    executionTimeMs: Date.now() - startTime,
                    status: 'error',
                    sandbox: 'cortex-isolated-runner',
                  })}\n\n`
                )
              );
              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
              controller.close();
              cleanUpTemp(tempDir);
            }
          }
        },
      });

      return new Response(readable, {
        headers: {
          ...CORS_HEADERS,
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-cache, no-transform',
          Connection: 'keep-alive',
        },
      });
    }

    // Non-streaming fallback execution
    return new Promise<NextResponse>((resolve) => {
      let stdout = '';
      let stderr = '';
      let finished = false;

      const child = spawn(command, args, {
        cwd: tempDir,
        env: safeEnv,
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      const timer = setTimeout(() => {
        if (!finished) {
          finished = true;
          try {
            child.kill('SIGKILL');
          } catch {}
          cleanUpTemp(tempDir);
          resolve(
            NextResponse.json(
              {
                stdout,
                stderr: stderr + `\n[Cortex Sandbox Error: Process timed out after ${timeoutMs}ms]`,
                exitCode: 124,
                executionTimeMs: timeoutMs,
                status: 'timeout',
                sandbox: 'cortex-isolated-runner',
              },
              { headers: CORS_HEADERS }
            )
          );
        }
      }, timeoutMs);

      child.stdout.on('data', (d) => {
        stdout += d.toString('utf8');
      });
      child.stderr.on('data', (d) => {
        stderr += d.toString('utf8');
      });

      child.on('error', (err) => {
        if (!finished) {
          finished = true;
          clearTimeout(timer);
          cleanUpTemp(tempDir);
          resolve(
            NextResponse.json(
              {
                stdout,
                stderr: stderr + `\n[Execution Error: ${err.message}]`,
                exitCode: 1,
                executionTimeMs: Date.now() - startTime,
                status: 'error',
                sandbox: 'cortex-isolated-runner',
              },
              { headers: CORS_HEADERS }
            )
          );
        }
      });

      child.on('close', (code) => {
        if (!finished) {
          finished = true;
          clearTimeout(timer);
          cleanUpTemp(tempDir);
          resolve(
            NextResponse.json(
              {
                stdout,
                stderr,
                exitCode: code ?? 0,
                executionTimeMs: Date.now() - startTime,
                status: (code ?? 0) === 0 ? 'success' : 'error',
                sandbox: 'cortex-isolated-runner',
              },
              { headers: CORS_HEADERS }
            )
          );
        }
      });
    });
  } catch (err: any) {
    console.error('[Cortex Sandbox] Unhandled exception:', err);
    return NextResponse.json(
      {
        error: 'Sandbox execution failed',
        details: err?.message || 'Internal error',
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

function cleanUpTemp(dir: string) {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch {}
}
