// brainGraph.ts — procedural "synaptic constellation" brain.
// Pure data, no three.js. Deterministic (seeded), so the layout is identical on every load.
//
// Coordinate convention (three.js): x = left/right, y = up, z = front/back (+z = frontal pole).

export interface BrainNode {
  id: number;
  hemi: -1 | 1;                         // -1 = left hemisphere, +1 = right
  ax: number; ay: number; az: number;   // anchor: where the shape wants this node to settle
  x?: number; y?: number; z?: number;   // written by the d3 simulation
  vx?: number; vy?: number; vz?: number;
}

export interface BrainLink {
  source: number | BrainNode;           // d3 swaps ids for node objects after the first tick
  target: number | BrainNode;
  len: number;                          // rest length (distance between anchors)
}

/** Shape parameters, in world units. Whole brain is ~115 wide, ~130 long, ~57 tall. */
export const BRAIN = {
  gap: 6,          // width of the longitudinal fissure between the hemispheres
  rxLat: 48,       // lateral half-width of one hemisphere
  rxMed: 0.18,     // medial side is squashed to this fraction → flat inner wall
  ry: 36,          // half-height (bottom is flattened below)
  rz: 66,          // half-length, front to back
} as const;

export interface BrainGraphOptions {
  nodeCount?: number;   // total, both hemispheres (default 900)
  k?: number;           // nearest neighbours linked per node (default 3)
  maxLinkLen?: number;  // drop links longer than this (default 17)
  seed?: number;
}

// ---------- seeded random helpers ----------
function mulberry32(a: number) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function randomUnit(rnd: () => number): [number, number, number] {
  // uniform direction on the sphere via gaussian triplet
  const g = () => Math.sqrt(-2 * Math.log(rnd() || 1e-9)) * Math.cos(2 * Math.PI * rnd());
  const x = g(), y = g(), z = g();
  const l = Math.hypot(x, y, z) || 1;
  return [x / l, y / l, z / l];
}

// ---------- shape ----------
const CX = BRAIN.gap / 2 + BRAIN.rxMed * BRAIN.rxLat; // hemisphere centre offset from x = 0

/** One point of the cerebrum for hemisphere `s` (-1 / +1). `shell` 1 = on the cortex surface. */
function cerebrumPoint(s: -1 | 1, rnd: () => number): [number, number, number] {
  const [ux, uy, uz] = randomUnit(rnd);
  const medial = ux * s < 0;
  // medial wall is the fissure: keep it sparse so the two hemispheres read as separate
  if (medial && rnd() < 0.65) return cerebrumPoint(s, rnd);

  // ~86% of nodes sit on the cortex, the rest inside, so the silhouette stays crisp
  const shell = rnd() < 0.86 ? 1 : 0.35 + 0.5 * Math.cbrt(rnd());

  // gyri: low-frequency folds on the surface
  const g = 1
    + 0.07 * Math.sin(6.1 * ux + 2.3 * uz) * Math.cos(5.3 * uy - 1.7 * ux)
    + 0.045 * Math.sin(11 * uz + 3 * uy);

  const taper = 1 - 0.18 * Math.max(0, uz) - 0.10 * Math.max(0, -uz); // narrower frontal pole
  const lx = ux * (medial ? BRAIN.rxMed : 1) * BRAIN.rxLat * taper;
  const ly = uy * BRAIN.ry * (uy < 0 ? 0.6 : 1);                      // flat underside
  const lz = uz * BRAIN.rz;

  return [s * CX + lx * g * shell, ly * g * shell, lz * g * shell];
}

/** One point of the cerebellum (small striated lobe under the occipital pole). */
function cerebellumPoint(s: -1 | 1, rnd: () => number): [number, number, number] {
  const [ux, uy, uz] = randomUnit(rnd);
  const g = 1 + 0.09 * Math.sin(15 * uy);   // tight horizontal folia
  return [s * 17 + ux * 17 * g, -26 + uy * 10 * g, -50 + uz * 13 * g];
}

// ---------- graph ----------
export function buildBrainGraph(opts: BrainGraphOptions = {}) {
  const { nodeCount = 900, k = 3, maxLinkLen = 17, seed = 7 } = opts;
  const rnd = mulberry32(seed);

  const nodes: BrainNode[] = [];
  for (let i = 0; i < nodeCount; i++) {
    const hemi: -1 | 1 = i % 2 === 0 ? -1 : 1;
    const [ax, ay, az] = rnd() < 0.88 ? cerebrumPoint(hemi, rnd) : cerebellumPoint(hemi, rnd);
    // start as a tight cloud at the origin: the forces make the brain "unfold" into place
    nodes.push({
      id: i, hemi, ax, ay, az,
      x: (rnd() - 0.5) * 12, y: (rnd() - 0.5) * 12, z: (rnd() - 0.5) * 12,
    });
  }

  const dist = (a: BrainNode, b: BrainNode) => Math.hypot(a.ax - b.ax, a.ay - b.ay, a.az - b.az);
  const seen = new Set<string>();
  const links: BrainLink[] = [];
  const add = (a: BrainNode, b: BrainNode) => {
    const key = a.id < b.id ? `${a.id}-${b.id}` : `${b.id}-${a.id}`;
    if (seen.has(key)) return;
    seen.add(key);
    links.push({ source: a.id, target: b.id, len: dist(a, b) });
  };

  // 1) k nearest neighbours *within the same hemisphere* → a web that traces the cortex
  for (const a of nodes) {
    const near = nodes
      .filter((b) => b !== a && b.hemi === a.hemi)
      .map((b) => ({ b, d: dist(a, b) }))
      .sort((p, q) => p.d - q.d)
      .slice(0, k);
    near.forEach(({ b, d }, i) => { if (i === 0 || d <= maxLinkLen) add(a, b); });
  }

  // 2) a handful of commissural links across the fissure (corpus-callosum-ish)
  const left = nodes.filter((n) => n.hemi === -1 && Math.abs(n.ax) < CX + 6);
  const right = nodes.filter((n) => n.hemi === 1 && Math.abs(n.ax) < CX + 6);
  for (let i = 0; i < Math.min(18, left.length); i++) {
    const a = left[Math.floor(rnd() * left.length)];
    let best: BrainNode | null = null, bd = Infinity;
    for (const b of right) { const d = dist(a, b); if (d < bd) { bd = d; best = b; } }
    if (best && bd < 22) add(a, best);
  }

  return { nodes, links };
}

// ---------- d3 forces ----------

/** Pulls every node toward its anchor, so the shape is reliable instead of hoped-for. */
export function forceAnchor(strength = 0.1) {
  let nodes: BrainNode[] = [];
  const force = (alpha: number) => {
    const k = strength * alpha;
    for (const n of nodes) {
      n.vx! += (n.ax - n.x!) * k;
      n.vy! += (n.ay - n.y!) * k;
      n.vz! += (n.az - n.z!) * k;
    }
  };
  force.initialize = (ns: BrainNode[]) => { nodes = ns; };
  return force;
}

/**
 * Splits the swarm into two clusters: each hemisphere is drawn toward its own side,
 * and anything that drifts into the central slab is shoved out, keeping the fissure open.
 */
export function forceHemispheres(strength = 0.06) {
  let nodes: BrainNode[] = [];
  const half = BRAIN.gap / 2;
  const force = (alpha: number) => {
    const k = strength * alpha;
    for (const n of nodes) {
      const want = n.hemi * CX;                       // hemisphere centre line
      n.vx! += (want - n.x!) * k * 0.35;              // gentle cohesion toward own side
      const inward = n.hemi * n.x!;                   // >0 = on the correct side
      if (inward < half) n.vx! += n.hemi * (half - inward) * k * 6; // fissure: push out
    }
  };
  force.initialize = (ns: BrainNode[]) => { nodes = ns; };
  return force;
}
