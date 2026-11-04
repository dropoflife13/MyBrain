#!/usr/bin/env node
/**
 * scripts/sync-vault.js
 *
 * Single Source of Truth Automation Pipeline for Cortex (brain-web):
 * 1. Mirrors all Markdown (.md) and verification (.py) files from:
 *    - `brain/`  -> `public/brain/`
 *    - `agents/` -> `public/agents/`
 *    Prunes any orphaned files in `public/brain/` or `public/agents/` so
 *    source and static public mirrors stay 100% byte-identical.
 * 2. Incrementally syncs vector embeddings (`brain-embeddings.json` &
 *    `public/brain-embeddings.json`). Reuses existing 384-dim vectors for
 *    unchanged rules and only runs `@xenova/transformers` (`Xenova/all-MiniLM-L6-v2`)
 *    when rules are added, edited, or `--force-embed` is passed.
 */

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const MODEL_NAME = 'Xenova/all-MiniLM-L6-v2';
const EMBEDDINGS_FILENAME = 'brain-embeddings.json';

function syncDirectoryMirror(srcDir, destDir) {
  let copied = 0;
  let unchanged = 0;
  let removed = 0;

  if (!fs.existsSync(srcDir)) {
    return { copied, unchanged, removed };
  }

  fs.mkdirSync(destDir, { recursive: true });

  const srcEntries = fs.readdirSync(srcDir, { withFileTypes: true });
  const srcNames = new Set(srcEntries.map((e) => e.name));

  // Remove stale entries in destDir that no longer exist in srcDir
  if (fs.existsSync(destDir)) {
    const destEntries = fs.readdirSync(destDir, { withFileTypes: true });
    for (const destEntry of destEntries) {
      if (!srcNames.has(destEntry.name)) {
        const targetToRemove = path.join(destDir, destEntry.name);
        fs.rmSync(targetToRemove, { recursive: true, force: true });
        removed++;
      }
    }
  }

  for (const entry of srcEntries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      const sub = syncDirectoryMirror(srcPath, destPath);
      copied += sub.copied;
      unchanged += sub.unchanged;
      removed += sub.removed;
    } else if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.py'))) {
      const srcBuf = fs.readFileSync(srcPath);
      if (fs.existsSync(destPath)) {
        const destBuf = fs.readFileSync(destPath);
        if (srcBuf.equals(destBuf)) {
          unchanged++;
          continue;
        }
      }
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.writeFileSync(destPath, srcBuf);
      copied++;
    }
  }

  return { copied, unchanged, removed };
}

function getMarkdownFiles(dir, depth = 0, maxDepth = 6, visited = new Set()) {
  const results = [];
  if (depth > maxDepth) return results;

  const normalizedDir = dir.replace(/\\/g, '/').replace(/^\.\//, '');
  const fullDir = normalizedDir.startsWith('agents')
    ? path.join(ROOT, 'agents', normalizedDir.slice('agents'.length))
    : path.join(
        ROOT,
        'brain',
        normalizedDir.startsWith('brain/') ? normalizedDir.slice('brain/'.length) : normalizedDir
      );
  if (!fs.existsSync(fullDir)) return results;

  let realDir;
  try {
    realDir = fs.realpathSync(fullDir);
  } catch {
    return results;
  }

  if (visited.has(realDir)) return results;
  visited.add(realDir);

  let entries;
  try {
    entries = fs.readdirSync(fullDir, { withFileTypes: true });
  } catch {
    return results;
  }

  for (const entry of entries) {
    const res = path.join(dir, entry.name);
    try {
      if (entry.isDirectory()) {
        results.push(...getMarkdownFiles(res, depth + 1, maxDepth, visited));
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        results.push(res.replace(/\\/g, '/'));
      }
    } catch {
      // ignore
    }
  }
  return results;
}

function resolveFilePath(relPath) {
  const normalized = relPath.replace(/\\/g, '/').replace(/^\.\//, '');
  const filename = path.basename(normalized);
  const subFromBrain = normalized.startsWith('brain/')
    ? normalized.slice('brain/'.length)
    : normalized;
  const candidates = [
    path.join(ROOT, 'brain', subFromBrain),
    path.join(ROOT, 'agents', filename),
    path.join(ROOT, 'public', 'brain', subFromBrain),
    path.join(ROOT, 'public', 'agents', filename),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

function extractCanonicalRules() {
  const targetDirs = [
    'agents',
    'brain/02-domains',
    'brain/03-heuristics',
    'brain/01-identity',
    'brain/07-meta',
  ];

  const allMarkdownFiles = [];
  for (const d of targetDirs) {
    allMarkdownFiles.push(...getMarkdownFiles(d));
  }

  const uniqueFiles = Array.from(new Set(allMarkdownFiles));
  const rawRules = [];
  const seenRuleIds = new Set();

  for (const fileRel of uniqueFiles) {
    const full = resolveFilePath(fileRel);
    if (!full || !fs.existsSync(full)) continue;

    const content = fs.readFileSync(full, 'utf8');
    const lines = content.split(/\r?\n/);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const match = line.match(/^-\s+\*\*([A-Z]{1,5}-\d+)\*\*:?\s*(.+)/);
      if (match) {
        const ruleId = match[1];
        const ruleBody = match[2].trim();
        if (seenRuleIds.has(ruleId)) continue;
        seenRuleIds.add(ruleId);

        const fullRuleText = `${ruleId}: ${ruleBody}`;
        rawRules.push({
          ruleId,
          file: fileRel,
          line: i + 1,
          text: fullRuleText,
        });
      }
    }
  }

  return rawRules;
}

async function syncEmbeddings({ forceAll = false } = {}) {
  const rootEmbeddingsPath = path.join(ROOT, EMBEDDINGS_FILENAME);
  const publicEmbeddingsPath = path.join(ROOT, 'public', EMBEDDINGS_FILENAME);

  const currentRules = extractCanonicalRules();

  let existingRecords = [];
  if (fs.existsSync(rootEmbeddingsPath)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(rootEmbeddingsPath, 'utf8'));
      if (Array.isArray(parsed)) {
        existingRecords = parsed;
      } else if (parsed && Array.isArray(parsed.entries)) {
        existingRecords = parsed.entries;
      }
    } catch {
      existingRecords = [];
    }
  }

  const existingByRuleId = new Map();
  if (!forceAll) {
    for (const entry of existingRecords) {
      if (entry && entry.ruleId && Array.isArray(entry.embedding) && entry.embedding.length > 0) {
        existingByRuleId.set(entry.ruleId, entry);
      }
    }
  }

  const rulesToEmbed = [];
  for (const rule of currentRules) {
    const prev = existingByRuleId.get(rule.ruleId);
    if (!prev || prev.text !== rule.text) {
      rulesToEmbed.push(rule);
    }
  }

  const countOrOrderChanged =
    existingRecords.length !== currentRules.length ||
    currentRules.some((r, idx) => {
      const ex = existingRecords[idx];
      return !ex || ex.ruleId !== r.ruleId || ex.line !== r.line || ex.file !== r.file;
    });

  if (rulesToEmbed.length === 0 && !countOrOrderChanged) {
    // Ensure public/brain-embeddings.json is synced with root brain-embeddings.json
    if (fs.existsSync(rootEmbeddingsPath)) {
      const rootBuf = fs.readFileSync(rootEmbeddingsPath);
      if (!fs.existsSync(publicEmbeddingsPath) || !rootBuf.equals(fs.readFileSync(publicEmbeddingsPath))) {
        fs.mkdirSync(path.dirname(publicEmbeddingsPath), { recursive: true });
        fs.writeFileSync(publicEmbeddingsPath, rootBuf);
        console.log(`[sync-vault] Mirrored ${EMBEDDINGS_FILENAME} -> public/${EMBEDDINGS_FILENAME}`);
      }
    }
    console.log(
      `[sync-vault] Embeddings up to date (${currentRules.length} rules verified, 0 changes).`
    );
    return;
  }

  let extractor = null;
  if (rulesToEmbed.length > 0) {
    console.log(
      `[sync-vault] Vectorizing ${rulesToEmbed.length} new/updated rule(s) using ${MODEL_NAME}...`
    );
    const { pipeline } = await import('@xenova/transformers');
    extractor = await pipeline('feature-extraction', MODEL_NAME);
  }

  const newlyEmbeddedMap = new Map();
  for (const rule of rulesToEmbed) {
    const clean = rule.text.replace(/\s+/g, ' ').trim();
    const output = await extractor(clean, {
      pooling: 'mean',
      normalize: true,
    });
    const vector = Array.from(output.data);
    newlyEmbeddedMap.set(rule.ruleId, {
      ruleId: rule.ruleId,
      file: rule.file,
      line: rule.line,
      text: rule.text,
      embedding: vector,
    });
  }

  const finalRecords = currentRules.map((rule) => {
    if (newlyEmbeddedMap.has(rule.ruleId)) {
      return newlyEmbeddedMap.get(rule.ruleId);
    }
    const prev = existingByRuleId.get(rule.ruleId);
    return {
      ruleId: rule.ruleId,
      file: rule.file,
      line: rule.line,
      text: rule.text,
      embedding: prev.embedding,
    };
  });

  const serialized = JSON.stringify(finalRecords, null, 2);
  fs.writeFileSync(rootEmbeddingsPath, serialized, 'utf8');
  fs.mkdirSync(path.dirname(publicEmbeddingsPath), { recursive: true });
  fs.writeFileSync(publicEmbeddingsPath, serialized, 'utf8');

  console.log(
    `[sync-vault] Saved ${finalRecords.length} embeddings (${rulesToEmbed.length} recomputed, ${
      finalRecords.length - rulesToEmbed.length
    } reused from cache) -> ${EMBEDDINGS_FILENAME} & public/${EMBEDDINGS_FILENAME}`
  );
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const forceAll = args.has('--force-embed');

  // 1. Mirror brain/ -> public/brain/ and agents/ -> public/agents/
  const brainStats = syncDirectoryMirror(
    path.join(ROOT, 'brain'),
    path.join(ROOT, 'public', 'brain')
  );
  const agentsStats = syncDirectoryMirror(
    path.join(ROOT, 'agents'),
    path.join(ROOT, 'public', 'agents')
  );

  const totalCopied = brainStats.copied + agentsStats.copied;
  const totalUnchanged = brainStats.unchanged + agentsStats.unchanged;
  const totalRemoved = brainStats.removed + agentsStats.removed;

  console.log(
    `[sync-vault] Vault mirror complete: ${totalCopied} updated, ${totalUnchanged} unchanged, ${totalRemoved} pruned.`
  );

  // 2. Incrementally verify & update vector embeddings
  await syncEmbeddings({ forceAll });
}

main().catch((err) => {
  console.error('[sync-vault] Fatal error:', err);
  process.exit(1);
});
