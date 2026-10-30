import fs from 'fs';
import path from 'path';

export interface RuleEmbeddingRecord {
  ruleId: string;
  file: string;
  line: number;
  text: string;
  embedding: number[];
}

export interface ScoredRuleMatch {
  ruleId: string;
  file: string;
  text: string;
  score: number;
}

let extractorPipeline: any = null;
let cachedEmbeddings: RuleEmbeddingRecord[] | null = null;

/**
 * Initializes and caches the local ONNX feature extraction pipeline.
 * Runs completely locally without external API keys or cost.
 */
export async function getExtractor() {
  if (!extractorPipeline) {
    const { pipeline } = await import('@xenova/transformers');
    extractorPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return extractorPipeline;
}

/**
 * Generates a normalized 384-dimensional dense vector for any string.
 */
export async function embedText(text: string): Promise<number[]> {
  const extractor = await getExtractor();
  const clean = text.replace(/\s+/g, ' ').trim();
  const output = await extractor(clean, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}

/**
 * Mathematically calculates the cosine similarity between two vectors.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (!a || !b || a.length !== b.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

function resolveFilePath(relPath: string): string | null {
  const rootDir = process.cwd();
  const filename = path.basename(relPath);
  const candidates = [
    path.join(rootDir, relPath),
    path.join(rootDir, 'public', relPath),
    path.join(rootDir, 'public', filename),
    path.join(rootDir, 'brain-web', relPath),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

/**
 * Recursively retrieves all markdown files from a target directory.
 */
function getMarkdownFiles(dir: string): string[] {
  const results: string[] = [];
  const fullDir = path.resolve(process.cwd(), dir);
  if (!fs.existsSync(fullDir)) return results;

  const entries = fs.readdirSync(fullDir, { withFileTypes: true });
  for (const entry of entries) {
    const res = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...getMarkdownFiles(res));
    } else if (entry.name.endsWith('.md')) {
      results.push(res.replace(/\\/g, '/'));
    }
  }
  return results;
}

/**
 * Scans all vault files, extracts canonical rules, and generates vector embeddings.
 * Writes to brain-embeddings.json and public/brain-embeddings.json.
 */
export async function generateAllEmbeddings(
  onProgress?: (current: number, total: number, ruleId: string) => void
): Promise<RuleEmbeddingRecord[]> {
  const targetDirs = [
    'agents',
    'brain/02-domains',
    'brain/03-heuristics',
    'brain/01-identity',
    'brain/07-meta',
  ];

  const allMarkdownFiles: string[] = [];
  for (const d of targetDirs) {
    allMarkdownFiles.push(...getMarkdownFiles(d));
  }

  // Deduplicate files
  const uniqueFiles = Array.from(new Set(allMarkdownFiles));

  // Chunk by canonical rule: - **[PREFIX]-[NUMBER]** [content]
  const rawRules: Array<{ ruleId: string; file: string; line: number; text: string }> = [];
  const seenRuleIds = new Set<string>();

  for (const fileRel of uniqueFiles) {
    const full = resolveFilePath(fileRel);
    if (!full || !fs.existsSync(full)) continue;

    const content = fs.readFileSync(full, 'utf8');
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const match = line.match(/^-\s+\*\*([A-Z]{1,5}-\d+)\*\*:?\s*(.+)/);
      if (match) {
        const ruleId = match[1];
        const ruleBody = match[2].trim();
        // Skip duplicate ID definitions if already collected
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

  console.log(`[Cortex Embedder] Found ${rawRules.length} canonical rules to vectorize.`);
  const records: RuleEmbeddingRecord[] = [];

  for (let idx = 0; idx < rawRules.length; idx++) {
    const item = rawRules[idx];
    onProgress?.(idx + 1, rawRules.length, item.ruleId);

    // Vectorize item text using all-MiniLM-L6-v2
    const embedding = await embedText(item.text);
    records.push({
      ruleId: item.ruleId,
      file: item.file,
      line: item.line,
      text: item.text,
      embedding,
    });
  }

  // Persist embeddings to JSON files
  const rootDir = process.cwd();
  const outputPathRoot = path.join(rootDir, 'brain-embeddings.json');
  const outputPathPublic = path.join(rootDir, 'public', 'brain-embeddings.json');

  const jsonStr = JSON.stringify(records, null, 2);
  fs.writeFileSync(outputPathRoot, jsonStr, 'utf8');

  try {
    const publicDir = path.join(rootDir, 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    fs.writeFileSync(outputPathPublic, jsonStr, 'utf8');
  } catch {}

  cachedEmbeddings = records;
  console.log(`[Cortex Embedder] Successfully vectorized and saved ${records.length} rules to ${outputPathRoot}.`);
  return records;
}

/**
 * Loads pre-computed embeddings from brain-embeddings.json.
 */
export function loadEmbeddings(): RuleEmbeddingRecord[] {
  if (cachedEmbeddings && cachedEmbeddings.length > 0) {
    return cachedEmbeddings;
  }

  const candidatePaths = [
    resolveFilePath('brain-embeddings.json'),
    resolveFilePath('public/brain-embeddings.json'),
    path.join(process.cwd(), 'brain-embeddings.json'),
    path.join(process.cwd(), 'public', 'brain-embeddings.json'),
  ].filter(Boolean) as string[];

  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      try {
        const raw = fs.readFileSync(p, 'utf8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          cachedEmbeddings = parsed;
          return cachedEmbeddings;
        }
      } catch (err) {
        console.warn(`[Cortex Embedder] Failed to parse embeddings from ${p}:`, err);
      }
    }
  }

  return [];
}

/**
 * Embeds user query, calculates cosine similarity against all indexed rules,
 * and returns the top K most relevant rules.
 */
export async function findTopRules(query: string, topK = 3): Promise<ScoredRuleMatch[]> {
  const embeddings = loadEmbeddings();
  if (!embeddings || embeddings.length === 0) {
    console.warn('[Cortex Embedder] No pre-computed embeddings found in brain-embeddings.json.');
    return [];
  }

  const queryVector = await embedText(query);
  const scored: ScoredRuleMatch[] = [];

  for (const record of embeddings) {
    const score = cosineSimilarity(queryVector, record.embedding);
    scored.push({
      ruleId: record.ruleId,
      file: record.file,
      text: record.text,
      score,
    });
  }

  // Sort descending by cosine similarity score
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}

// Standalone execution script runner (when called directly via node/tsx)
if (process.argv[1] && (process.argv[1].endsWith('embedder.ts') || process.argv[1].endsWith('embedder.js'))) {
  console.log('[Cortex Embedder] Initializing semantic vector embedding indexing pipeline...');
  generateAllEmbeddings((cur, tot, id) => {
    if (cur % 25 === 0 || cur === tot) {
      console.log(`[Cortex Embedder] Vectorizing rules: [${cur}/${tot}] (Current: ${id})`);
    }
  })
    .then((recs) => {
      console.log(`[Cortex Embedder] Complete! Generated embeddings for ${recs.length} rules.`);
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Cortex Embedder] Fatal error generating embeddings:', err);
      process.exit(1);
    });
}
