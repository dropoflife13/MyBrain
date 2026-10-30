/**
 * WebContainer API Integration (Layer 6 of the Agentic AI Stack)
 *
 * Provides in-browser WebAssembly execution via @webcontainer/api when
 * cross-origin isolation is enabled, and coordinates with /api/sandbox/run
 * for universal serverless/node sandbox execution.
 */

import { WebContainer } from '@webcontainer/api';

let webcontainerPromise: Promise<WebContainer | null> | null = null;

export async function getWebContainerInstance(): Promise<WebContainer | null> {
  if (typeof window === 'undefined') return null;

  // WebContainer requires Cross-Origin-Isolation (SharedArrayBuffer)
  if (!window.crossOriginIsolated) {
    return null;
  }

  if (!webcontainerPromise) {
    webcontainerPromise = WebContainer.boot().catch((err) => {
      console.warn('[WebContainer] In-browser WebContainer boot failed, fallback to server runner:', err);
      return null;
    });
  }

  return webcontainerPromise;
}

export interface SandboxExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  executionTimeMs: number;
  status: 'success' | 'error' | 'timeout';
  sandbox: 'webcontainer-browser' | 'cortex-isolated-runner' | 'e2b-cloud';
}

/**
 * Execute code using client-side WebContainer if available, or stream via /api/sandbox/run
 */
export async function executeCodeInSandbox(
  code: string,
  language = 'typescript',
  onChunk?: (type: 'stdout' | 'stderr', text: string) => void
): Promise<SandboxExecutionResult> {
  const startTime = Date.now();
  const wc = await getWebContainerInstance();

  // 1. If in-browser WebContainer is ready and crossOriginIsolated is true
  if (wc) {
    try {
      const ext = ['python', 'py'].includes(language.toLowerCase()) ? 'py' : 'js';
      const filename = `index.${ext}`;
      await wc.fs.writeFile(filename, code);

      let stdout = '';
      let stderr = '';
      const process = await wc.spawn('node', [filename]);

      process.output.pipeTo(
        new WritableStream({
          write(data) {
            stdout += data;
            onChunk?.('stdout', data);
          },
        })
      );

      const exitCode = await process.exit;
      const duration = Date.now() - startTime;

      return {
        stdout,
        stderr,
        exitCode,
        executionTimeMs: duration,
        status: exitCode === 0 ? 'success' : 'error',
        sandbox: 'webcontainer-browser',
      };
    } catch (err: any) {
      console.warn('[WebContainer] Client execution exception, falling back to API runner:', err);
    }
  }

  // 2. Stream execution via /api/sandbox/run (Universal Server Sandbox)
  const res = await fetch('/api/sandbox/run', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    },
    body: JSON.stringify({
      code,
      language,
      stream: true,
      timeoutMs: 8000,
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error || `Sandbox returned HTTP ${res.status}`);
  }

  // Handle Server-Sent Events stream
  if (res.headers.get('content-type')?.includes('text/event-stream') && res.body) {
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let stdout = '';
    let stderr = '';
    let exitCode = 0;
    let executionTimeMs = 0;
    let status: 'success' | 'error' | 'timeout' = 'success';
    let sandboxType: 'cortex-isolated-runner' | 'e2b-cloud' = 'cortex-isolated-runner';

    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;
        const dataStr = trimmed.replace(/^data:\s*/, '').trim();
        if (dataStr === '[DONE]') continue;

        try {
          const payload = JSON.parse(dataStr);
          if (payload.type === 'stdout' && payload.text) {
            stdout += payload.text;
            onChunk?.('stdout', payload.text);
          } else if (payload.type === 'stderr' && payload.text) {
            stderr += payload.text;
            onChunk?.('stderr', payload.text);
          } else if (payload.type === 'exit') {
            exitCode = payload.exitCode ?? 0;
            executionTimeMs = payload.executionTimeMs ?? (Date.now() - startTime);
            status = payload.status ?? (exitCode === 0 ? 'success' : 'error');
            if (payload.sandbox === 'e2b-cloud') sandboxType = 'e2b-cloud';
          }
        } catch {}
      }
    }

    return {
      stdout,
      stderr,
      exitCode,
      executionTimeMs: executionTimeMs || (Date.now() - startTime),
      status,
      sandbox: sandboxType,
    };
  }

  // Non-streaming fallback
  const result = await res.json();
  return {
    stdout: result.stdout || '',
    stderr: result.stderr || '',
    exitCode: result.exitCode ?? 0,
    executionTimeMs: result.executionTimeMs || (Date.now() - startTime),
    status: result.status || 'success',
    sandbox: result.sandbox || 'cortex-isolated-runner',
  };
}

