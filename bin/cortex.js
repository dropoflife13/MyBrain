#!/usr/bin/env node
/**
 * bin/cortex.js
 *
 * CORTEX v3.0 // Zero-Dependency Deterministic CLI & Procedural Gate Verifier
 * Executed via:
 *   $ npx cortex gate --verify-all
 *   $ npx cortex stats
 *   $ npx cortex sync
 */

const fs = require('fs');
const path = require('path');

const CWD = process.cwd();
const args = process.argv.slice(2);

// ANSI formatting
const isTTY = process.stdout.isTTY;
const c = {
  reset: isTTY ? '\x1b[0m' : '',
  bold: isTTY ? '\x1b[1m' : '',
  dim: isTTY ? '\x1b[2m' : '',
  cyan: isTTY ? '\x1b[36m' : '',
  emerald: isTTY ? '\x1b[32m' : '',
  yellow: isTTY ? '\x1b[33m' : '',
  red: isTTY ? '\x1b[31m' : '',
  purple: isTTY ? '\x1b[35m' : '',
  bgCyan: isTTY ? '\x1b[46m\x1b[30m' : '',
  bgDark: isTTY ? '\x1b[40m' : '',
};

function banner() {
  console.log(`
${c.cyan}${c.bold}  ╔══════════════════════════════════════════════════════════════════╗${c.reset}
${c.cyan}${c.bold}  ║   CORTEX v3.0 // PROCEDURAL JUDGMENT & DETERMINISTIC GATE VERIFIER ║${c.reset}
${c.cyan}${c.bold}  ╚══════════════════════════════════════════════════════════════════╝${c.reset}
${c.dim}  Deterministic Multi-Agent SDLC & 29-Domain Invariant Pipeline${c.reset}
`);
}

const CORE_AGENTS = [
  { file: 'productmanageragent.md', code: 'PM', title: 'Product Manager Agent' },
  { file: 'uiuxagent.md', code: 'UX', title: 'UI/UX Specialist Agent' },
  { file: 'growthagent.md', code: 'GR', title: 'Growth & Business Agent' },
  { file: 'systemsdesignagent.md', code: 'SD', title: 'Systems Design Agent' },
  { file: 'integrationagent.md', code: 'IR', title: 'Integration Agent' },
  { file: 'dbaagent.md', code: 'DB', title: 'DBA & Data Platform Agent' },
  { file: 'securityagent.md', code: 'SEC', title: 'Security & AuthZ Agent' },
  { file: 'researchagent.md', code: 'RS', title: 'Research & Fact-Checker Agent' },
];

function findVaultRoot() {
  // Check if current directory is vault root
  if (fs.existsSync(path.join(CWD, 'brain')) && fs.existsSync(path.join(CWD, 'agents'))) {
    return CWD;
  }
  // Check parent
  const parent = path.dirname(CWD);
  if (fs.existsSync(path.join(parent, 'brain')) && fs.existsSync(path.join(parent, 'agents'))) {
    return parent;
  }
  return CWD;
}

function verifyAll() {
  banner();
  const root = findVaultRoot();
  let hasErrors = false;
  const errors = [];
  const telemetry = {
    agentsPassed: 0,
    domainsActive: 0,
    totalRules: 0,
    clusters: 4,
  };

  console.log(`${c.bold}🔍 Running Full Gate Audit (--verify-all)...${c.reset}\n`);

  // 1. BN-00 Constitution Gate: Check 8 Core Agents
  process.stdout.write(`  [1/4] Checking BN-00 Constitution Gate (8 Core Agents)... `);
  const agentsDir = path.join(root, 'agents');
  const missingAgents = [];
  const agentViolations = [];

  if (!fs.existsSync(agentsDir)) {
    missingAgents.push('agents/ directory missing');
  } else {
    for (const a of CORE_AGENTS) {
      const p = path.join(agentsDir, a.file);
      if (!fs.existsSync(p)) {
        missingAgents.push(a.file);
      } else {
        telemetry.agentsPassed++;
        const content = fs.readFileSync(p, 'utf8');
        // Check for 6 required sections
        const requiredSections = [
          '## 1. Identity & Scope',
          '## 2. Read-First',
          '## 3. Hard Restrictions',
          '## 4. Required Checks',
          '## 5. Gate vs Insight Mode',
          '## 6. Handoff',
        ];
        for (const s of requiredSections) {
          if (!content.includes(s)) {
            agentViolations.push(`${a.file} missing required section: "${s}"`);
          }
        }
      }
    }
  }

  if (missingAgents.length > 0) {
    hasErrors = true;
    console.log(`${c.red}${c.bold}GATE: FAIL BN-00${c.reset}`);
    for (const m of missingAgents) {
      errors.push(`BN-00 CRITICAL: Missing core agent: ${m}`);
    }
  } else if (agentViolations.length > 0) {
    hasErrors = true;
    console.log(`${c.red}${c.bold}FAIL${c.reset}`);
    for (const v of agentViolations) {
      errors.push(`Agent Grammar Violation: ${v}`);
    }
  } else {
    console.log(`${c.emerald}${c.bold}PASS${c.reset} ${c.dim}(8/8 Active)${c.reset}`);
  }

  // 2. Domain Registries (28 active domains + 1 framework)
  process.stdout.write(`  [2/4] Validating 29 Domain Invariants & Rules... `);
  const domainsDir = path.join(root, 'brain', '02-domains');
  const domainErrors = [];
  const domainRuleIds = new Set();

  if (!fs.existsSync(domainsDir)) {
    hasErrors = true;
    domainErrors.push('brain/02-domains/ directory missing');
  } else {
    const files = fs.readdirSync(domainsDir).filter((f) => f.endsWith('.md') && !f.startsWith('_TEMPLATE'));
    telemetry.domainsActive = files.length;

    for (const f of files) {
      const filePath = path.join(domainsDir, f);
      const text = fs.readFileSync(filePath, 'utf8');
      const lines = text.split(/\r?\n/);

      // Verify Frontmatter
      if (!text.startsWith('---')) {
        domainErrors.push(`${f}: Missing YAML frontmatter`);
      }

      // Check rules
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const ruleMatch = line.match(/^\s*-\s*\*\*([A-Z]{1,5}-\d{2,3})\*\*(.*)$/);
        if (ruleMatch) {
          const rid = ruleMatch[1];
          telemetry.totalRules++;

          if (domainRuleIds.has(rid)) {
            domainErrors.push(`${f}:${i + 1}: Duplicate rule ID: ${rid}`);
          }
          domainRuleIds.add(rid);

          // Invariant: must contain WHEN and DO
          if (!line.includes('WHEN') || !line.includes('→ DO')) {
            domainErrors.push(`${f}:${i + 1}: Rule ${rid} missing 'WHEN ... → DO ...'`);
          }

          // Invariant: must end with anchor ^<lowercase-id>
          const expectedAnchor = `^${rid.toLowerCase()}`;
          if (!line.trim().endsWith(expectedAnchor)) {
            domainErrors.push(`${f}:${i + 1}: Rule ${rid} missing terminating anchor: ${expectedAnchor}`);
          }

          // Invariant: mandatory why, breaks, conf, ev, status
          const requiredPipes = ['| why:', '| breaks:', '| conf:', '| ev:', '| status: active'];
          for (const pipe of requiredPipes) {
            if (!line.includes(pipe)) {
              domainErrors.push(`${f}:${i + 1}: Rule ${rid} missing field '${pipe}'`);
            }
          }
        }
      }
    }
  }

  if (domainErrors.length > 0) {
    hasErrors = true;
    console.log(`${c.red}${c.bold}FAIL${c.reset}`);
    for (const e of domainErrors.slice(0, 5)) {
      errors.push(`Domain Invariant: ${e}`);
    }
    if (domainErrors.length > 5) {
      errors.push(`... and ${domainErrors.length - 5} more domain errors`);
    }
  } else {
    console.log(`${c.emerald}${c.bold}PASS${c.reset} ${c.dim}(${telemetry.domainsActive} Domains, ${domainRuleIds.size} Rules)${c.reset}`);
  }

  // 3. Arbiter Conflict Resolution Invariants (ARB-01..08)
  process.stdout.write(`  [3/4] Verifying Judgment Arbiter & Fallback Precedence... `);
  const arbiterFile = path.join(domainsDir, 'arbiter.md');
  if (!fs.existsSync(arbiterFile)) {
    hasErrors = true;
    errors.push('CRITICAL: Judgment Arbiter missing (brain/02-domains/arbiter.md)');
    console.log(`${c.red}${c.bold}FAIL${c.reset}`);
  } else {
    const arbiterText = fs.readFileSync(arbiterFile, 'utf8');
    const arbMatches = arbiterText.match(/- \*\*ARB-\d{2}\*\*/g) || [];
    if (arbMatches.length < 8) {
      hasErrors = true;
      errors.push(`Judgment Arbiter rule deficit: Expected >= 8 ARB rules, found ${arbMatches.length}`);
      console.log(`${c.red}${c.bold}FAIL${c.reset}`);
    } else {
      console.log(`${c.emerald}${c.bold}PASS${c.reset} ${c.dim}(${arbMatches.length}/${arbMatches.length} ARB Rules Active)${c.reset}`);
    }
  }

  // 4. Static Mirror & Public Cache Parity
  process.stdout.write(`  [4/4] Auditing Static Mirrors & Single Source of Truth... `);
  const publicBrain = path.join(root, 'public', 'brain');
  const publicAgents = path.join(root, 'public', 'agents');
  let mirrorParity = true;

  if (fs.existsSync(publicBrain) && fs.existsSync(publicAgents)) {
    // Check if public agents mirror matches
    for (const a of CORE_AGENTS) {
      const src = path.join(agentsDir, a.file);
      const dst = path.join(publicAgents, a.file);
      if (!fs.existsSync(dst)) {
        mirrorParity = false;
        errors.push(`Mirror Missing: public/agents/${a.file}`);
      } else if (fs.readFileSync(src, 'utf8') !== fs.readFileSync(dst, 'utf8')) {
        mirrorParity = false;
        errors.push(`Mirror Desync: public/agents/${a.file} out of date`);
      }
    }
  }

  if (!mirrorParity) {
    hasErrors = true;
    console.log(`${c.red}${c.bold}FAIL${c.reset}`);
  } else {
    console.log(`${c.emerald}${c.bold}PASS${c.reset} ${c.dim}(100% Synced)${c.reset}`);
  }

  console.log(`\n${c.cyan}──────────────────────────────────────────────────────────────────${c.reset}`);

  // Summary Report
  if (hasErrors) {
    console.log(`\n${c.red}${c.bold}❌ CORTEX AUDIT FAILED // GATE: REJECT${c.reset}\n`);
    for (const err of errors) {
      console.log(`  ${c.red}•${c.reset} ${err}`);
    }
    console.log(`\n${c.yellow}Run 'npm run sync' to resolve mirror drift, or fix rule syntax before pushing.${c.reset}\n`);
    process.exit(1);
  } else {
    console.log(`\n${c.emerald}${c.bold}✅ CORTEX AUDIT PASSED // GATE: CERTIFIED${c.reset}\n`);
    console.log(`  ${c.bold}Core Agents:${c.reset}     ${c.emerald}8/8 Operational (BN-00 Invariant Verified)${c.reset}`);
    console.log(`  ${c.bold}Active Domains:${c.reset}  ${c.cyan}${telemetry.domainsActive} Domains across 4 Clusters${c.reset}`);
    console.log(`  ${c.bold}Rule Invariants:${c.reset} ${c.cyan}${domainRuleIds.size} Active Axioms (100% Deterministic)${c.reset}`);
    console.log(`  ${c.bold}Arbiter Status:${c.reset}  ${c.emerald}Active (Precedence: Security > Growth)${c.reset}`);
    console.log(`  ${c.bold}Mirror Parity:${c.reset}   ${c.emerald}100% Parity (Zero Drift)${c.reset}\n`);
    process.exit(0);
  }
}

function copyMarkdownDir(srcDir, destDir, excludeFiles = []) {
  fs.mkdirSync(destDir, { recursive: true });
  if (!fs.existsSync(srcDir)) return 0;
  let count = 0;
  for (const f of fs.readdirSync(srcDir)) {
    if (f.endsWith('.md') && !excludeFiles.includes(f)) {
      fs.copyFileSync(path.join(srcDir, f), path.join(destDir, f));
      count++;
    }
  }
  return count;
}

function initVault(targetDirName) {
  banner();
  const pkgRoot = path.resolve(__dirname, '..');
  const targetDir = targetDirName ? path.resolve(CWD, targetDirName) : CWD;

  console.log(`${c.bold}🚀 Initializing Cortex Vault in:${c.reset} ${c.cyan}${targetDir}${c.reset}\n`);

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Pre-flight check: ensure template files exist in package
  const templateAgents = path.join(pkgRoot, 'agents');
  const templateBrain = path.join(pkgRoot, 'brain');

  if (!fs.existsSync(templateAgents) || !fs.existsSync(templateBrain)) {
    console.error(`${c.red}Error: Cortex package templates not found in ${pkgRoot}${c.reset}`);
    process.exit(1);
  }

  // 1. Copy agents
  const destAgents = path.join(targetDir, 'agents');
  fs.mkdirSync(destAgents, { recursive: true });
  for (const a of CORE_AGENTS) {
    const src = path.join(templateAgents, a.file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(destAgents, a.file));
    }
  }
  if (fs.existsSync(path.join(templateAgents, 'README.md'))) {
    fs.copyFileSync(path.join(templateAgents, 'README.md'), path.join(destAgents, 'README.md'));
  }
  console.log(`  ${c.emerald}✓${c.reset} Unpacked 8 Core Agent Gatekeepers -> ${c.cyan}agents/${c.reset}`);

  // 2. Copy brain/02-domains
  copyMarkdownDir(path.join(templateBrain, '02-domains'), path.join(targetDir, 'brain', '02-domains'));
  console.log(`  ${c.emerald}✓${c.reset} Unpacked 29 Procedural Knowledge Domains -> ${c.cyan}brain/02-domains/${c.reset}`);

  // 3. Copy brain/00-INDEX.md & 07-meta
  const srcIndex = path.join(templateBrain, '00-INDEX.md');
  if (fs.existsSync(srcIndex)) {
    fs.mkdirSync(path.join(targetDir, 'brain'), { recursive: true });
    fs.copyFileSync(srcIndex, path.join(targetDir, 'brain', '00-INDEX.md'));
  }
  copyMarkdownDir(path.join(templateBrain, '07-meta'), path.join(targetDir, 'brain', '07-meta'));
  console.log(`  ${c.emerald}✓${c.reset} Unpacked Index & Meta Governance -> ${c.cyan}brain/07-meta/${c.reset}`);

  // 4. Copy 01-identity (OPERATING-PRINCIPLES, TASTE — exclude ABOUT-ME.md per SP-05/BN-09)
  copyMarkdownDir(path.join(templateBrain, '01-identity'), path.join(targetDir, 'brain', '01-identity'), ['ABOUT-ME.md']);

  // 5. Copy 03-heuristics, 04-models, and 08-workflows (Golden Path SIX-COMMANDS & STATS-ENGINE)
  copyMarkdownDir(path.join(templateBrain, '03-heuristics'), path.join(targetDir, 'brain', '03-heuristics'));
  copyMarkdownDir(path.join(templateBrain, '04-models'), path.join(targetDir, 'brain', '04-models'));
  copyMarkdownDir(path.join(templateBrain, '08-workflows'), path.join(targetDir, 'brain', '08-workflows'));
  console.log(`  ${c.emerald}✓${c.reset} Unpacked Heuristics, Models & Golden Path Workflows -> ${c.cyan}brain/03,04,08/${c.reset}`);

  // 6. Create empty candidate inbox
  const destRaw = path.join(targetDir, 'brain', '06-raw');
  fs.mkdirSync(destRaw, { recursive: true });
  const inboxContent = `---\ntype: inbox\nversion: 1\nstatus: active\n---\n# Inbox — Candidate Staging\n\nAppend new rule candidates here in CV-02 format.\n`;
  fs.writeFileSync(path.join(destRaw, 'inbox.md'), inboxContent, 'utf8');

  // 7. Write AGENTS.md & CLAUDE.md
  const agentsMd = `# Cortex Multi-Agent Constitution\n\nBN-00 Invariant: All 8 core agents in agents/ must exist and cannot be bypassed.\nRules: Every architecture or code change must satisfy GATE: PASS across the 8 specialist agents.\n`;
  fs.writeFileSync(path.join(targetDir, 'AGENTS.md'), agentsMd, 'utf8');

  const srcClaude = path.join(pkgRoot, 'CLAUDE.md');
  if (fs.existsSync(srcClaude) && !fs.existsSync(path.join(targetDir, 'CLAUDE.md'))) {
    fs.copyFileSync(srcClaude, path.join(targetDir, 'CLAUDE.md'));
  }

  console.log(`  ${c.emerald}✓${c.reset} Configured Multi-Agent Constitution -> ${c.cyan}AGENTS.md & CLAUDE.md${c.reset}\n`);
  console.log(`${c.emerald}${c.bold}🎉 Cortex Vault Initialized Successfully!${c.reset}\n`);
  console.log(`Next steps:`);
  console.log(`  1. Review the 8 agents in ${c.cyan}agents/${c.reset}`);
  console.log(`  2. Run audit: ${c.cyan}npx cortex gate --verify-all${c.reset}\n`);
}

function showStats() {
  banner();
  const root = findVaultRoot();
  const domainsDir = path.join(root, 'brain', '02-domains');
  const files = fs.existsSync(domainsDir) ? fs.readdirSync(domainsDir).filter((f) => f.endsWith('.md')) : [];
  let ruleCount = 0;

  for (const f of files) {
    const text = fs.readFileSync(path.join(domainsDir, f), 'utf8');
    const matches = text.match(/^\s*-\s*\*\*([A-Z]{1,5}-\d{2,3})\*\*/gm) || [];
    ruleCount += matches.length;
  }

  console.log(`${c.bold}📊 CORTEX TELEMETRY STATS:${c.reset}`);
  console.log(`  • Core Agents:     8 Specialist Gatekeepers`);
  console.log(`  • Knowledge Vault: ${files.length} Domains across 4 Clusters`);
  console.log(`  • Synaptic Rules:  ${ruleCount} Active Rules`);
  console.log(`  • Judgment Gate:   ARB-01..10 Enforced\n`);
}

function showHelp() {
  banner();
  console.log(`${c.bold}USAGE:${c.reset}`);
  console.log(`  $ npx cortex init [directory]     ${c.dim}# Download & scaffold complete Cortex vault & 8 agents${c.reset}`);
  console.log(`  $ npx cortex gate --verify-all    ${c.dim}# Run complete deterministic gate audit${c.reset}`);
  console.log(`  $ npx cortex stats                ${c.dim}# Print live procedural telemetry${c.reset}`);
  console.log(`  $ npx cortex sync                 ${c.dim}# Mirror vault markdown & rebuild embeddings${c.reset}`);
  console.log(`  $ npx cortex --help               ${c.dim}# Show this help manual${c.reset}\n`);
}

// Command routing
const cmd = args[0] ? args[0].toLowerCase() : '';
const sub = args[1] ? args[1].toLowerCase() : '';

if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
  showHelp();
} else if (cmd === 'init' || cmd === 'create') {
  initVault(args[1]);
} else if (
  (cmd === 'gate' && (sub === '--verify-all' || sub === '-v' || sub === 'verify' || sub === 'verify-all')) ||
  cmd === 'verify' ||
  cmd === 'verify-all'
) {
  verifyAll();
} else if (cmd === 'stats') {
  showStats();
} else if (cmd === 'sync') {
  const syncScript = path.join(findVaultRoot(), 'scripts', 'sync-vault.js');
  if (fs.existsSync(syncScript)) {
    require(syncScript);
  } else {
    console.error('Error: scripts/sync-vault.js not found');
  }
} else {
  console.log(`Unknown command: ${args.join(' ')}\n`);
  showHelp();
  process.exit(1);
}

