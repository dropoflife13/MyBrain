/**
 * Deterministic Validation Suite for /implement Workflows
 * Enforces strict "Deterministic-First, LLM-Fallback" architecture.
 *
 * Checks:
 * 1. Extraction: Code block presence and format.
 * 2. Static Linter / Invariant Verification (DB-13, SEC-14, syntax balance).
 * 3. Execution: Sandbox unit test execution via /api/sandbox/run.
 */

export interface CodeBlockInfo {
  code: string;
  language: string;
  fullBlock: string;
}

export interface ValidationChecksSummary {
  syntaxBalance: boolean;
  db13Invariants: boolean;
  sec14Safety: boolean;
  testAssertionsPresent: boolean;
  sandboxExitCodeZero: boolean;
}

export interface DeterministicValidationResult {
  passed: boolean;
  stage: 'extraction' | 'linter' | 'execution' | 'passed';
  error?: string;
  code?: string;
  language?: string;
  stdout?: string;
  stderr?: string;
  exitCode?: number;
  durationMs?: number;
  checksSummary?: ValidationChecksSummary;
}

/**
 * Extracts the primary executable code block from LLM markdown output.
 */
export function extractCodeBlock(markdown: string): CodeBlockInfo | null {
  if (!markdown) return null;
  const regex = /```([a-zA-Z0-9_-]*)\s*\n([\s\S]*?)```/g;
  const match = regex.exec(markdown);
  if (!match) return null;

  const rawLang = match[1]?.trim().toLowerCase() || 'typescript';
  const code = match[2]?.trim() || '';
  return {
    code,
    language: rawLang,
    fullBlock: match[0],
  };
}

/**
 * Fast deterministic linter check running in <1ms without LLM overhead.
 */
export function runStaticLinter(
  code: string,
  language: string
): { passed: boolean; error?: string; checksSummary: ValidationChecksSummary } {
  const normLang = language.toLowerCase();
  const isJsTs = ['typescript', 'ts', 'tsx', 'javascript', 'js', 'jsx'].includes(normLang);

  const checksSummary = {
    syntaxBalance: true,
    db13Invariants: true,
    sec14Safety: true,
    testAssertionsPresent: true,
    sandboxExitCodeZero: false,
  };

  // 1. Bracket & Brace Balance Check
  let braceCount = 0;
  let parenCount = 0;
  let bracketCount = 0;
  let inString: string | null = null;
  let isEscaped = false;

  for (let i = 0; i < code.length; i++) {
    const ch = code[i];

    if (inString) {
      if (isEscaped) {
        isEscaped = false;
      } else if (ch === '\\') {
        isEscaped = true;
      } else if (ch === inString) {
        inString = null;
      }
      continue;
    }

    if (ch === '"' || ch === "'" || ch === '`') {
      inString = ch;
      continue;
    }

    // Skip single-line comments in JS/TS
    if (isJsTs && ch === '/' && code[i + 1] === '/') {
      const nextNewline = code.indexOf('\n', i + 2);
      i = nextNewline === -1 ? code.length : nextNewline;
      continue;
    }

    if (ch === '{') braceCount++;
    else if (ch === '}') braceCount--;
    else if (ch === '(') parenCount++;
    else if (ch === ')') parenCount--;
    else if (ch === '[') bracketCount++;
    else if (ch === ']') bracketCount--;

    if (braceCount < 0 || parenCount < 0 || bracketCount < 0) {
      checksSummary.syntaxBalance = false;
      return {
        passed: false,
        error: `Syntax balance error: Unexpected closing symbol '${ch}' at character position ${i}.`,
        checksSummary,
      };
    }
  }

  if (braceCount !== 0 || parenCount !== 0 || bracketCount !== 0) {
    checksSummary.syntaxBalance = false;
    return {
      passed: false,
      error: `Syntax balance error: Unclosed delimiters (unbalanced: {}: ${braceCount}, (): ${parenCount}, []: ${bracketCount}).`,
      checksSummary,
    };
  }

  // 2. DB-13 Invariant Check (Atomic Conditionals)
  const codeWithoutComments = code.replace(/\/\/[^\n]*/g, '');
  const isDbModifying =
    /(\.update\(|\.delete\(|\.patch\(|\bUPDATE\s+|\bDELETE\s+FROM)/i.test(codeWithoutComments) &&
    !/(\.where\(|\.eq\(|\.match\(|\.filter\(|\bWHERE\s+|atomicCondition|tx\.)/i.test(codeWithoutComments);

  if (isDbModifying) {
    checksSummary.db13Invariants = false;
    return {
      passed: false,
      error: 'Cortex DB-13 Violation: Database state mutation detected without atomic conditional check (.eq, where, or transaction filter).',
      checksSummary,
    };
  }

  // 3. SEC-14 Invariant Check (Sensitive Key Redaction)
  const leaksServiceRole =
    /service_role|SUPABASE_SERVICE_ROLE_KEY|PRIVATE_KEY|DATABASE_ROOT_PASSWORD/i.test(code) &&
    /(return\s*\{[^}]*service_role|res\.json\([^)]*service_role|res\.send\([^)]*service_role)/i.test(code);

  if (leaksServiceRole) {
    checksSummary.sec14Safety = false;
    return {
      passed: false,
      error: 'Cortex SEC-14 Violation: Sensitive credential or service_role key exposed in client-facing response payload.',
      checksSummary,
    };
  }

  // 4. Test Assertion & Driver Presence Check
  const hasAssertions =
    /(assert|console\.assert|expect\(|assert\.strictEqual|test\(|describe\(|checkResult|verify\(|===|!==)/i.test(
      code
    );

  if (!hasAssertions && code.length > 50) {
    checksSummary.testAssertionsPresent = false;
    return {
      passed: false,
      error: 'Deterministic Test Missing: Implementation code must include a runnable driver or self-contained assertion verification test.',
      checksSummary,
    };
  }

  return { passed: true, checksSummary };
}

/**
 * Executes the full Deterministic Validation Phase:
 * 1. Extraction of code block
 * 2. Static linter & type balance checks
 * 3. Execution in isolated sandbox
 */
export async function runDeterministicValidation(
  markdownOrCode: string,
  preferredLanguage?: string
): Promise<DeterministicValidationResult> {
  const extracted = extractCodeBlock(markdownOrCode);
  const code = extracted ? extracted.code : markdownOrCode.trim();
  const language = extracted ? extracted.language : preferredLanguage || 'typescript';

  if (!code) {
    return {
      passed: false,
      stage: 'extraction',
      error: 'No implementation code or markdown code block found in response.',
    };
  }

  // Step 2.1: Run static linter & invariant checks
  const linterResult = runStaticLinter(code, language);
  if (!linterResult.passed) {
    return {
      passed: false,
      stage: 'linter',
      error: linterResult.error,
      code,
      language,
      checksSummary: linterResult.checksSummary,
    };
  }

  // Step 2.2: Execute unit tests in isolated sandbox (/api/sandbox/run)
  const startTime = Date.now();
  try {
    const baseUrl =
      typeof window !== 'undefined'
        ? ''
        : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/sandbox/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        language,
        stream: false,
        timeoutMs: 7000,
      }),
    });

    const data = await res.json().catch(() => null);
    const durationMs = Date.now() - startTime;

    if (!res.ok || !data) {
      return {
        passed: false,
        stage: 'execution',
        error: data?.error || `Sandbox request returned HTTP ${res.status}`,
        code,
        language,
        durationMs,
        checksSummary: { ...linterResult.checksSummary, sandboxExitCodeZero: false },
      };
    }

    const exitCode = typeof data.exitCode === 'number' ? data.exitCode : data.status === 'success' ? 0 : 1;
    const stdout = data.stdout || '';
    const stderr = data.stderr || '';

    // If process exited with error or failed an assertion
    if (exitCode !== 0 || data.status === 'error' || data.status === 'timeout' || /AssertionError|SyntaxError|ReferenceError|TypeError/i.test(stderr)) {
      const detailedError = (stderr.trim() || stdout.trim() || `Process exited with error code ${exitCode}`).slice(0, 800);
      return {
        passed: false,
        stage: 'execution',
        error: detailedError,
        code,
        language,
        stdout,
        stderr,
        exitCode,
        durationMs,
        checksSummary: { ...linterResult.checksSummary, sandboxExitCodeZero: false },
      };
    }

    // Success: All deterministic validation checks passed!
    return {
      passed: true,
      stage: 'passed',
      code,
      language,
      stdout,
      stderr,
      exitCode: 0,
      durationMs,
      checksSummary: { ...linterResult.checksSummary, sandboxExitCodeZero: true },
    };
  } catch (err: any) {
    return {
      passed: false,
      stage: 'execution',
      error: `Deterministic test runner exception: ${err?.message || 'Connection failed'}`,
      code,
      language,
      durationMs: Date.now() - startTime,
      checksSummary: { ...linterResult.checksSummary, sandboxExitCodeZero: false },
    };
  }
}
