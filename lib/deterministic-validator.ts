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
  axiomSqlForensics: boolean;
  testAssertionsPresent: boolean;
  sandboxExitCodeZero: boolean;
}

export interface UtilityGateResult {
  passed: boolean;
  ruleId?: string;
  stage: 'grammar' | 'verbatim_identifiers' | 'forensic_collision' | 'fixture_probe' | 'passed';
  reason?: string;
  extractedIdentifiers: string[];
  persistedTo?: string;
  quarantined?: boolean;
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

  const checksSummary: ValidationChecksSummary = {
    syntaxBalance: true,
    db13Invariants: true,
    sec14Safety: true,
    axiomSqlForensics: true,
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

  // 3.5 Axiom SQL Forensics Checks (Authority Separation — Invariant 0)
  const isSql = normLang === 'sql' || normLang === 'pgsql' || /\bCREATE\s+TABLE\b/i.test(code);
  if (isSql) {
    const sqlClean = code
      .replace(/--[^\n]*/g, '')
      .replace(/\/\*[\s\S]*?\*\//g, '');

    // Check 1: Duplicate PRIMARY KEY within a single CREATE TABLE block (GLM-5.3 defect)
    const createTableBlocks = sqlClean.match(/CREATE\s+TABLE[\s\S]*?\);/gi) || [];
    for (const block of createTableBlocks) {
      const pkMatches = block.match(/\bPRIMARY\s+KEY\b/gi) || [];
      if (pkMatches.length > 1) {
        checksSummary.axiomSqlForensics = false;
        return {
          passed: false,
          error:
            'Axiom SQL Forensics Violation (F-01): Duplicate PRIMARY KEY clause detected inside a single CREATE TABLE statement.',
          checksSummary,
        };
      }
    }

    // Check 2: F-16 / F-36 Inline REFERENCES collision on supersedes_id
    if (/\bsupersedes_id\s+uuid\s+(?:NULL\s+)?REFERENCES\b/i.test(sqlClean) && !/\bCONSTRAINT\s+fk_[a-z0-9_]+_supersedes_id\b/i.test(sqlClean)) {
      checksSummary.axiomSqlForensics = false;
      return {
        passed: false,
        error:
          'Axiom SQL Forensics Violation (F-16 / F-36): Anonymous inline REFERENCES on supersedes_id violates fk_<table>_<column> naming. Use explicit CONSTRAINT fk_<table>_supersedes_id FOREIGN KEY.',
        checksSummary,
      };
    }

    // Check 3: F-26 user_metadata tenant spoofing
    if (/user_metadata\s*['"->>]+\s*tenant_id/i.test(sqlClean)) {
      checksSummary.axiomSqlForensics = false;
      return {
        passed: false,
        error:
          "Axiom SQL Forensics Violation (F-26): Tenant RLS policy references untrusted user_metadata.tenant_id instead of auth.jwt() -> 'app_metadata' ->> 'tenant_id'.",
        checksSummary,
      };
    }

    // Check 4: F-31 SECURITY DEFINER without SET search_path
    if (/\bSECURITY\s+DEFINER\b/i.test(sqlClean) && !/\bSET\s+search_path\s*=\s*(?:''|""|pg_catalog)/i.test(sqlClean)) {
      checksSummary.axiomSqlForensics = false;
      return {
        passed: false,
        error:
          "Axiom SQL Forensics Violation (F-31): SECURITY DEFINER function missing explicit SET search_path = '' declaration.",
        checksSummary,
      };
    }
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

/**
 * CORTEX v3.0 // The Utility Gate (Rule RS-06 / IR-10 / Invariant 0)
 * Deterministically verifies any newly proposed rule or lesson before it is allowed
 * into the canonical Vault:
 *   1. Grammar Gate: Must follow `- **<PREFIX>-<NN>** ... WHEN ... → DO ... | why: ... | breaks: ... | conf: ... | ev: ... | status: ... ^<anchor>`
 *   2. Verbatim Identifier Gate (Anti-Distillation): Must include concrete backticked code/SQL/system identifiers (`...`)
 *   3. Forensic Collision Gate: Rejects rules containing known self-colliding patterns (e.g. anonymous inline REFERENCES on supersedes_id or USING (true) on writes)
 *   4. Executable Fixture Probe: If positive/negative code fixtures are supplied, verifies the rule's regex/AST probe passes positive and rejects negative fixtures.
 */
export function verifyCandidateRuleUtilityGate(
  candidateLine: string,
  options?: {
    requireDomainPipes?: boolean;
    positiveFixtureCode?: string;
    negativeFixtureCode?: string;
    probeRegex?: RegExp;
  }
): UtilityGateResult {
  const clean = (candidateLine || '').trim();
  const requirePipes = options?.requireDomainPipes ?? true;

  // Stage 1: Grammar & Rule ID structure
  const idMatch = clean.match(/^-\s+\*\*([A-Z]{2,5}-\d{2,3})\*\*\s*(.+)$/);
  if (!idMatch) {
    return {
      passed: false,
      stage: 'grammar',
      reason: 'Rule must begin with `- **<PREFIX>-<NN>**` (e.g. `- **DB-15**` or `- **ARB-09**`).',
      extractedIdentifiers: [],
    };
  }

  const ruleId = idMatch[1];
  if (!clean.includes('WHEN ') || !clean.includes('→ DO ')) {
    return {
      passed: false,
      ruleId,
      stage: 'grammar',
      reason: `Rule ${ruleId} must contain deterministic trigger/action phrasing: 'WHEN <condition> → DO <action>'.`,
      extractedIdentifiers: [],
    };
  }

  if (requirePipes) {
    const requiredPipes = ['| why:', '| breaks:', '| conf:', '| ev:', '| status:'];
    for (const p of requiredPipes) {
      if (!clean.includes(p)) {
        return {
          passed: false,
          ruleId,
          stage: 'grammar',
          reason: `Rule ${ruleId} missing required domain grammar segment '${p}'.`,
          extractedIdentifiers: [],
        };
      }
    }
    const expectedAnchor = `^${ruleId.toLowerCase()}`;
    if (!clean.endsWith(expectedAnchor)) {
      return {
        passed: false,
        ruleId,
        stage: 'grammar',
        reason: `Rule ${ruleId} must terminate with block anchor '${expectedAnchor}'.`,
        extractedIdentifiers: [],
      };
    }
  }

  // Stage 2: Verbatim Identifier Gate (prevents the Distillation Penalty)
  const backtickMatches = clean.match(/`([^`]+)`/g) || [];
  const extractedIdentifiers = backtickMatches.map((m) => m.replace(/`/g, '').trim()).filter(Boolean);
  if (extractedIdentifiers.length === 0) {
    return {
      passed: false,
      ruleId,
      stage: 'verbatim_identifiers',
      reason: `Distillation Penalty Violation (ARB-10 / RS-05): Rule ${ruleId} contains zero backticked verbatim code/schema identifiers (e.g. \`app_metadata.tenant_id\`, \`supersedes_id\`, \`FORCE ROW LEVEL SECURITY\`). Vague natural-language rules are rejected.`,
      extractedIdentifiers: [],
    };
  }

  // Stage 3: Forensic Invariant Collision Gate (F-16 / F-36 & F-30)
  if (
    /supersedes_id\s+uuid\s+REFERENCES/i.test(clean) &&
    !/CONSTRAINT\s+fk_<table>_supersedes_id/i.test(clean)
  ) {
    return {
      passed: false,
      ruleId,
      stage: 'forensic_collision',
      reason: `Forensic Collision Detected (F-16 vs F-36): Inline 'supersedes_id uuid REFERENCES' auto-generates '<table>_supersedes_id_fkey' in PostgreSQL 16, violating fk_<table>_<column>. Specify explicit CONSTRAINT fk_<table>_supersedes_id FOREIGN KEY.`,
      extractedIdentifiers,
    };
  }

  // Stage 4: Optional Positive & Negative Fixture Verification
  if (options?.probeRegex) {
    if (options.positiveFixtureCode && !options.probeRegex.test(options.positiveFixtureCode)) {
      return {
        passed: false,
        ruleId,
        stage: 'fixture_probe',
        reason: `Rule ${ruleId} probe failed to match canonical positive fixture.`,
        extractedIdentifiers,
      };
    }
    if (options.negativeFixtureCode && options.probeRegex.test(options.negativeFixtureCode)) {
      return {
        passed: false,
        ruleId,
        stage: 'fixture_probe',
        reason: `Rule ${ruleId} probe falsely passed negative violation fixture.`,
        extractedIdentifiers,
      };
    }
  }

  return {
    passed: true,
    ruleId,
    stage: 'passed',
    extractedIdentifiers,
  };
}

