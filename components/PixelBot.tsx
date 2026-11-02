'use client';

import React from 'react';
import { motion } from 'framer-motion';

export type AgentCode = 'DB' | 'SEC' | 'UX' | 'PM' | 'SD' | 'IR' | 'GR' | 'RS' | 'ARB';

export interface AgentMeta {
  code: AgentCode;
  id: string;
  name: string;
  role: string;
  colorName: string;
  color: string;
  colorLight: string;
  colorDark: string;
  glowColor: string;
  badgeBg: string;
  borderColor: string;
  textColor: string;
  invariants: string;
  description: string;
  samplePrompt: string;
}

export const AGENT_REGISTRY: Record<AgentCode, AgentMeta> = {
  DB: {
    code: 'DB',
    id: 'dbaagent',
    name: 'Database Agent',
    role: 'The Archivist',
    colorName: 'Blue',
    color: '#2563eb',
    colorLight: '#60a5fa',
    colorDark: '#1e40af',
    glowColor: 'rgba(59, 130, 246, 0.6)',
    badgeBg: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    borderColor: 'border-blue-500',
    textColor: 'text-blue-400',
    invariants: 'DB-01 to DB-14: Immutability, RLS, Indexes',
    description: 'Enforces append-only schemas, strict Row-Level Security, and indexing integrity.',
    samplePrompt: 'Audit my schema for append-only immutability and missing RLS policies.',
  },
  SEC: {
    code: 'SEC',
    id: 'securityagent',
    name: 'Security Agent',
    role: 'The Sentinel',
    colorName: 'Red',
    color: '#dc2626',
    colorLight: '#f87171',
    colorDark: '#991b1b',
    glowColor: 'rgba(239, 68, 68, 0.6)',
    badgeBg: 'bg-red-500/15 text-red-400 border-red-500/30',
    borderColor: 'border-red-500',
    textColor: 'text-red-400',
    invariants: 'SEC-01 to SEC-15: STRIDE, Externalized AuthZ, Secret Isolation',
    description: 'Guards against privilege escalation, externalizes PDP/PEP authorization, and insulates secrets.',
    samplePrompt: 'Review my authentication flow against STRIDE threat modeling and PDP/PEP patterns.',
  },
  UX: {
    code: 'UX',
    id: 'uiuxagent',
    name: 'UI/UX Agent',
    role: 'The Stylist',
    colorName: 'Purple',
    color: '#9333ea',
    colorLight: '#c084fc',
    colorDark: '#6b21a8',
    glowColor: 'rgba(168, 85, 247, 0.6)',
    badgeBg: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    borderColor: 'border-purple-500',
    textColor: 'text-purple-400',
    invariants: 'UX-01 to UX-15: Cognitive Friction, A11y, Visual Hierarchy',
    description: 'Eliminates cognitive drag, polishes cyber-terminal ergonomics, and ensures WCAG a11y compliance.',
    samplePrompt: 'How can I reduce cognitive friction and streamline the operator experience for this view?',
  },
  PM: {
    code: 'PM',
    id: 'productmanageragent',
    name: 'Product Manager Agent',
    role: 'The Inquisitor',
    colorName: 'Yellow',
    color: '#ca8a04',
    colorLight: '#fde047',
    colorDark: '#854d0e',
    glowColor: 'rgba(234, 179, 8, 0.6)',
    badgeBg: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    borderColor: 'border-yellow-500',
    textColor: 'text-yellow-400',
    invariants: 'PM-01 to PM-14: Problem Interrogation, Edge Cases, Acceptance Criteria',
    description: 'Interrogates assumptions with 5 hard questions, draws strict scope boundaries, and enforces PRD rigor.',
    samplePrompt: 'Interrogate this feature request with 5 edge-case questions before we write any code.',
  },
  SD: {
    code: 'SD',
    id: 'systemsdesignagent',
    name: 'Systems Design Agent',
    role: 'The Architect',
    colorName: 'Cyan',
    color: '#0891b2',
    colorLight: '#22d3ee',
    colorDark: '#155e75',
    glowColor: 'rgba(6, 182, 212, 0.6)',
    badgeBg: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    borderColor: 'border-cyan-500',
    textColor: 'text-cyan-400',
    invariants: 'SD-01 to SD-14: Architecture Boundaries, Failure Modes, Data Contracts',
    description: 'Defines As-Is and To-Be architectures, specifies failure topologies, and enforces zero circular dependencies.',
    samplePrompt: 'Draft an architectural technical specification (TRD) with explicit failure modes and data contracts.',
  },
  IR: {
    code: 'IR',
    id: 'integrationagent',
    name: 'Integration Agent',
    role: 'The Lineman',
    colorName: 'Orange',
    color: '#ea580c',
    colorLight: '#fb923c',
    colorDark: '#9a3412',
    glowColor: 'rgba(249, 115, 22, 0.6)',
    badgeBg: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    borderColor: 'border-orange-500',
    textColor: 'text-orange-400',
    invariants: 'IR-01 to IR-14: API Resilience, Offline Queues, Idempotent Retries',
    description: 'Hardens external endpoints, provisions resilient retry backoffs, and maintains offline sync queues.',
    samplePrompt: 'Design an idempotent retry policy and dead-letter queue for external third-party webhook integrations.',
  },
  GR: {
    code: 'GR',
    id: 'growthagent',
    name: 'Growth Agent',
    role: 'The Catalyst',
    colorName: 'Green',
    color: '#16a34a',
    colorLight: '#4ade80',
    colorDark: '#14532d',
    glowColor: 'rgba(34, 197, 94, 0.6)',
    badgeBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    borderColor: 'border-emerald-500',
    textColor: 'text-emerald-400',
    invariants: 'GR-01 to GR-14: Executive Pitch, Activation Loops, Speed to Value',
    description: 'Synthesizes value propositions, writes high-conviction 3-minute pitches, and accelerates user time-to-aha.',
    samplePrompt: 'Craft a punchy 3-minute executive pitch selling the architectural upgrade to leadership.',
  },
  RS: {
    code: 'RS',
    id: 'researchagent',
    name: 'Research Agent',
    role: 'The Epistemologist',
    colorName: 'White',
    color: '#cbd5e1',
    colorLight: '#ffffff',
    colorDark: '#64748b',
    glowColor: 'rgba(248, 250, 252, 0.8)',
    badgeBg: 'bg-slate-200/20 text-slate-200 border-slate-300/30',
    borderColor: 'border-slate-300',
    textColor: 'text-slate-200',
    invariants: 'RS-01 to RS-14: Anti-Hallucination, Source Triangulation, Epistemic Rigor',
    description: 'Mandates source triangulation, separates verifiable facts from opinions, and executes the "I don\'t know" rule.',
    samplePrompt: 'Triangulate this claim across primary sources and flag any potential hallucinations or ungrounded assumptions.',
  },
  ARB: {
    code: 'ARB',
    id: 'arbiter',
    name: 'Judgment Arbiter',
    role: 'The Supreme Court',
    colorName: 'Crimson Gold',
    color: '#e11d48',
    colorLight: '#fb7185',
    colorDark: '#881337',
    glowColor: 'rgba(225, 29, 72, 0.7)',
    badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    borderColor: 'border-rose-500',
    textColor: 'text-rose-400',
    invariants: 'ARB-01 to ARB-06: Domain Separation, Conflict Fallback, Fact vs. Opinion, Precautionary Principle, Trend Verification, Seeding Boundaries',
    description: 'The Supreme Court of the Cortex. Resolves conflicts between domains and enforces your core invariants when rules contradict.',
    samplePrompt: 'Resolve a conflict between aggressive growth metrics (GR/MKT) and clinical safety invariants (MED/HLT).',
  },
};

const DOMAIN_COLOR_PALETTES: Record<
  string,
  { name: string; role: string; color: string; colorLight: string; colorDark: string; glowColor: string; spriteKey: AgentCode }
> = {
  // Humanities & Enterprise
  PSY: { name: 'Psychology Bot', role: 'The Behaviorist', color: '#ec4899', colorLight: '#f472b6', colorDark: '#9d174d', glowColor: 'rgba(236,72,153,0.6)', spriteKey: 'UX' },
  PHI: { name: 'Philosophy Bot', role: 'The Dialectician', color: '#8b5cf6', colorLight: '#a78bfa', colorDark: '#5b21b6', glowColor: 'rgba(139,92,246,0.6)', spriteKey: 'RS' },
  RHE: { name: 'Rhetoric Bot', role: 'The Orator', color: '#a855f7', colorLight: '#c084fc', colorDark: '#6b21a8', glowColor: 'rgba(168,85,247,0.6)', spriteKey: 'GR' },
  LIT: { name: 'Literature Bot', role: 'The Chronicler', color: '#d946ef', colorLight: '#e879f9', colorDark: '#86198f', glowColor: 'rgba(217,70,239,0.6)', spriteKey: 'RS' },
  ART: { name: 'Art & Aesthetics Bot', role: 'The Visionary', color: '#f43f5e', colorLight: '#fb7185', colorDark: '#9f1239', glowColor: 'rgba(244,63,94,0.6)', spriteKey: 'UX' },
  EDU: { name: 'Education Bot', role: 'The Pedagogue', color: '#6366f1', colorLight: '#818cf8', colorDark: '#3730a3', glowColor: 'rgba(99,102,241,0.6)', spriteKey: 'PM' },
  MKT: { name: 'Marketing Bot', role: 'The Storyteller', color: '#c026d3', colorLight: '#e879f9', colorDark: '#701a75', glowColor: 'rgba(192,38,211,0.6)', spriteKey: 'GR' },
  MGT: { name: 'Management Bot', role: 'The Orchestrator', color: '#7c3aed', colorLight: '#a78bfa', colorDark: '#4c1d95', glowColor: 'rgba(124,58,237,0.6)', spriteKey: 'PM' },
  // Global & Society
  ECO: { name: 'Economy Bot', role: 'The Economist', color: '#f59e0b', colorLight: '#fbbf24', colorDark: '#92400e', glowColor: 'rgba(245,158,11,0.6)', spriteKey: 'GR' },
  GEO: { name: 'Geopolitics Bot', role: 'The Diplomat', color: '#0ea5e9', colorLight: '#38bdf8', colorDark: '#075985', glowColor: 'rgba(14,165,233,0.6)', spriteKey: 'SD' },
  HLT: { name: 'Health Bot', role: 'The Bio-Guardian', color: '#10b981', colorLight: '#34d399', colorDark: '#065f46', glowColor: 'rgba(16,185,129,0.6)', spriteKey: 'SEC' },
  LAW: { name: 'Law Bot', role: 'The Jurist', color: '#14b8a6', colorLight: '#2dd4bf', colorDark: '#115e59', glowColor: 'rgba(20,184,166,0.6)', spriteKey: 'ARB' },
  POL: { name: 'Politics Bot', role: 'The Statesman', color: '#06b6d4', colorLight: '#22d3ee', colorDark: '#155e75', glowColor: 'rgba(6,182,212,0.6)', spriteKey: 'PM' },
  ENV: { name: 'Environment Bot', role: 'The Ecologist', color: '#22c55e', colorLight: '#4ade80', colorDark: '#166534', glowColor: 'rgba(34,197,94,0.6)', spriteKey: 'IR' },
  HIS: { name: 'History Bot', role: 'The Archivist', color: '#d97706', colorLight: '#fbbf24', colorDark: '#78350f', glowColor: 'rgba(217,119,6,0.6)', spriteKey: 'DB' },
  CRY: { name: 'Crypto Bot', role: 'The Validator', color: '#0284c7', colorLight: '#38bdf8', colorDark: '#0c4a6e', glowColor: 'rgba(2,132,199,0.6)', spriteKey: 'SEC' },
  FIN: { name: 'Finance Bot', role: 'The Quant', color: '#059669', colorLight: '#34d399', colorDark: '#064e3b', glowColor: 'rgba(5,150,105,0.6)', spriteKey: 'DB' },
  NWS: { name: 'News & Media Bot', role: 'The Fact-Checker', color: '#3b82f6', colorLight: '#60a5fa', colorDark: '#1e3a8a', glowColor: 'rgba(59,130,246,0.6)', spriteKey: 'RS' },
  BIZ: { name: 'Business Bot', role: 'The Strategist', color: '#10b981', colorLight: '#6ee7b7', colorDark: '#047857', glowColor: 'rgba(16,185,129,0.6)', spriteKey: 'GR' },
  // Frontier & Science
  DS: { name: 'Data Science Bot', role: 'The Statistician', color: '#f59e0b', colorLight: '#fcd34d', colorDark: '#92400e', glowColor: 'rgba(245,158,11,0.6)', spriteKey: 'SD' },
  SCI: { name: 'Science Bot', role: 'The Empiricist', color: '#eab308', colorLight: '#fde047', colorDark: '#854d0e', glowColor: 'rgba(234,179,8,0.6)', spriteKey: 'RS' },
  MED: { name: 'Medicine Bot', role: 'The Clinician', color: '#f43f5e', colorLight: '#fda4af', colorDark: '#881337', glowColor: 'rgba(244,63,94,0.6)', spriteKey: 'ARB' },
};

/**
 * 16x16 Pixel Maps for each of the 8 robots
 * Legend:
 * . = transparent
 * # = dark outline (#05070f)
 * P = Primary color
 * S = Secondary / lighter color
 * D = Depth / shadow color
 * E = Eye pixel (turns flashing warning yellow if low knowledge)
 * X = Unique feature (siren, shield, crystal, checklist, badge, monocle)
 * W = Highlight white / spark
 */
const SPRITE_MAPS: Record<AgentCode, string[]> = {
  // DB: Dual storage antenna, server disk bay slots with blinking LED lights
  DB: [
    '....#......#....',
    '....#......#....',
    '...###....###...',
    '..############..',
    '.#SSSSSSSSSSSS#.',
    '.#SPPEEEEEEPPS#.',
    '.#SPPD#EED#PPS#.',
    '.#SPPD####DPPS#.',
    '..############..',
    '.##############.',
    '.#SS#X#X#X#X#SS#.',
    '.#PP#X#X#X#X#PP#.',
    '.#DD#X#X#X#X#DD#.',
    '..############..',
    '..###......###..',
    '.#####....#####.',
  ],

  // SEC: Armored samurai helmet crest, combat visor slit eyes, golden Aegis chest shield
  SEC: [
    '..#..........#..',
    '..##........##..',
    '..###......###..',
    '.##############.',
    '#SSSSSSSSSSSSSS#',
    '#SPPPD#EE#DPPPS#',
    '#SPPPD#EE#DPPPS#',
    '.#SPD######DPS#.',
    '..############..',
    '################',
    '#SS#DPPXXPPD#SS#',
    '#PP#DPXXXXPD#PP#',
    '#DD#DDPXXPDD#DD#',
    '.##############.',
    '..####....####..',
    '.######..######.',
  ],

  // UX: Dual cute antenna bobbles, round glasses eyes, glowing pink crystal core
  UX: [
    '...X........X...',
    '...#........#...',
    '...#...##...#...',
    '..############..',
    '.#SSSSSSSSSSSS#.',
    '.#SP#EE##EE#PS#.',
    '.#SP#EE##EE#PS#.',
    '.#SPPD#WW#DPPS#.',
    '..############..',
    '..############..',
    '.#SS#DXXXXD#SS#.',
    '.#PP#DXXXXD#PP#.',
    '..##DDPPPDD##...',
    '...##########...',
    '....###..###....',
    '....#X#..#X#....',
  ],

  // PM: Commander chevron cap antenna, sharp tactical oculars, golden checklist badge
  PM: [
    '.......##.......',
    '......####......',
    '....########....',
    '...##########...',
    '..#SSSSSSSSSS#..',
    '.##SP#EE##EE#PS#',
    '.##SP#EE##EE#PS#',
    '..#SPPD##DPPS#..',
    '...##########...',
    '..############..',
    '.#SS#DPXXXXPD#SS#',
    '.#PP#DPXWWXPD#PP#',
    '.#DD#DPXXXXPD#DD#',
    '..############..',
    '..###......###..',
    '.#####....#####.',
  ],

  // SD: Circuit wing fins, wide panoramic CAD blueprint scanner, Nexus crosshair core
  SD: [
    '#..............#',
    '##............##',
    '###..######..###',
    '.##.########.##.',
    '..#SSSSSSSSSS#..',
    '.#SP#EEEEEE#PS#.',
    '.#SP#EEEEEE#PS#.',
    '..#SPPD##DPPS#..',
    '...##########...',
    '################',
    '.#SS#D#XWX#D#SS#.',
    '.#PP#DXXWXXD#PP#.',
    '.#DD#D#XWX#D#DD#.',
    '..############..',
    '...####..####...',
    '..######.######.',
  ],

  // IR: Rotating orange beacon siren, dual optical goggles, network cable patch jacks
  IR: [
    '......XXXX......',
    '.....######.....',
    '....########....',
    '...##########...',
    '..#SSSSSSSSSS#..',
    '.##SP#EE##EE#PS#',
    '.##SP#EE##EE#PS#',
    '..#SPPD##DPPS#..',
    '...##########...',
    '.##############.',
    '#SS#D#X##X#D#SS#',
    '#PP#D#X##X#D#PP#',
    '#DD#D######D#DD#',
    '.##############.',
    '.##############.',
    '.##############.',
  ],

  // GR: Upward aerodynamic needle, angled wings, speed visor, green growth chevron (^)
  GR: [
    '.......##.......',
    '......####......',
    '.#...######...#.',
    '.##.########.##.',
    '.##SSSSSSSSSS##.',
    '.#SP#EE##EE#PS#.',
    '.#SP#EE##EE#PS#.',
    '..#SPPD##DPPS#..',
    '...##########...',
    '..############..',
    '.#SS#D##X##D#SS#.',
    '.#PP#D#XXX#D#PP#.',
    '.#DD#D##X##D#DD#.',
    '..############..',
    '..####....####..',
    '..#XX#....#XX#..',
  ],

  // RS: Satellite truth dish halo, epistemologist monocle ocular, open fact matrix book
  RS: [
    '....########....',
    '...#XXXXXXXX#...',
    '....########....',
    '.......##.......',
    '..#SSSSSSSSSS#..',
    '.#SP#EE##EX#PS#.',
    '.#SP#EE##XX#PS#.',
    '..#SPPD##DPPS#..',
    '...##########...',
    '.##############.',
    '.#SS#D#XWWX#D#SS#',
    '.#PP#D#WWWW#D#PP#',
    '.#DD#D#XWWX#D#DD#',
    '..############..',
    '...##########...',
    '....########....',
  ],

  // ARB: Supreme Court Judge Crown/Scales crest, balanced golden scales on crimson judicial armor
  ARB: [
    '..X....XX....X..',
    '..#...####...#..',
    '..############..',
    '.#XXXXXXXXXXXX#.',
    '.#SSSSSSSSSSSS#.',
    '.#SP#EE##EE#PS#.',
    '.#SP#EE##EE#PS#.',
    '..#SPPD##DPPS#..',
    '...##########...',
    '################',
    '#SS#XXXXXXXX#SS#',
    '#PP#X#PWWP#X#PP#',
    '#DD#XX#WW#XX#DD#',
    '.##############.',
    '..####....####..',
    '.######..######.',
  ],
};

export interface PixelBotProps {
  code: AgentCode | string;
  size?: number; // pixel width/height (default: 64)
  knowledge?: number; // 0 - 100 percentage
  health?: number; // 0 - 100 percentage
  isSelected?: boolean;
  isHovered?: boolean;
  isWalking?: boolean;
  isLowKnowledgeOverride?: boolean;
  showNameTag?: boolean;
  showStats?: boolean;
  showHealthBar?: boolean;
  bobDelay?: number;
  onClick?: () => void;
  className?: string;
}

export default function PixelBot({
  code,
  size = 64,
  knowledge = 100,
  health = 100,
  isSelected = false,
  isHovered = false,
  isWalking = false,
  isLowKnowledgeOverride,
  showNameTag = true,
  showStats = false,
  showHealthBar = false,
  bobDelay = 0,
  onClick,
  className = '',
}: PixelBotProps) {
  const upperCode = (code || 'SD').toUpperCase();
  const coreMeta = AGENT_REGISTRY[upperCode as AgentCode];
  const domainFallback = DOMAIN_COLOR_PALETTES[upperCode];

  const meta: AgentMeta = coreMeta || {
    code: upperCode as AgentCode,
    id: upperCode.toLowerCase(),
    name: domainFallback?.name || `${upperCode} Domain Bot`,
    role: domainFallback?.role || 'Domain Specialist',
    colorName: 'Custom',
    color: domainFallback?.color || '#0891b2',
    colorLight: domainFallback?.colorLight || '#22d3ee',
    colorDark: domainFallback?.colorDark || '#155e75',
    glowColor: domainFallback?.glowColor || 'rgba(6, 182, 212, 0.6)',
    badgeBg: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    borderColor: 'border-cyan-500',
    textColor: 'text-cyan-400',
    invariants: `${upperCode}-01+: Domain Invariants`,
    description: `${upperCode} domain specialist.`,
    samplePrompt: `Query ${upperCode} domain invariants.`,
  };

  const spriteMap =
    SPRITE_MAPS[upperCode as AgentCode] ||
    (domainFallback ? SPRITE_MAPS[domainFallback.spriteKey] : SPRITE_MAPS.SD);

  // Requirement 4: If knowledge is low (< 30%), pixel eyes flash yellow as a warning!
  const isLowKnowledge =
    isLowKnowledgeOverride !== undefined
      ? isLowKnowledgeOverride
      : (knowledge !== undefined && knowledge < 30);

  // Normal eye colors per bot
  const defaultEyeColors: Record<string, string> = {
    DB: '#93c5fd', // bright sky blue
    SEC: '#fca5a5', // bright coral red
    UX: '#f3e8ff', // radiant lavender
    PM: '#fef08a', // tactical gold
    SD: '#a5f3fc', // blueprint laser cyan
    IR: '#fed7aa', // thermal orange
    GR: '#bbf7d0', // neon speed green
    RS: '#38bdf8', // truth ice sapphire
    ARB: '#fde047', // supreme court gold
  };

  const normalEyeColor = defaultEyeColors[upperCode] || meta.colorLight || '#ffffff';
  // Flashing Warning Eye Color: Neon Yellow (#facc15 / #eab308)
  const warningEyeColor = '#facc15';

  // Resolve palette mapping for pixel grid
  const resolveColor = (char: string): string => {
    switch (char) {
      case '#':
        return '#080d1a'; // Crisp dark outline
      case 'P':
        return meta.color;
      case 'S':
        return meta.colorLight;
      case 'D':
        return meta.colorDark;
      case 'E':
        return isLowKnowledge ? warningEyeColor : normalEyeColor;
      case 'X':
        // Unique feature accents
        if (upperCode === 'ARB' || upperCode === 'LAW' || upperCode === 'MED') return '#fbbf24'; // Supreme Scales Gold
        if (upperCode === 'SEC') return '#fbbf24'; // Gold shield
        if (upperCode === 'UX') return '#f472b6'; // Pink crystal
        if (upperCode === 'IR') return '#facc15'; // Flashing siren beacon
        if (upperCode === 'RS') return '#0284c7'; // Monocle lens
        if (upperCode === 'GR') return '#86efac'; // Neon green chevron
        if (upperCode === 'DB') return '#38bdf8'; // Cyan drive LED
        if (upperCode === 'PM') return '#ffffff'; // White checklist
        return '#fbbf24';
      case 'W':
        return '#ffffff';
      default:
        return 'transparent';
    }
  };

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={`relative inline-flex flex-col items-center select-none cursor-pointer group outline-none ${className}`}
      title={`${meta.name} (${meta.code}) — Knowledge: ${knowledge}% | Health: ${health}% ${
        isLowKnowledge ? '⚠️ WARNING: Knowledge < 30%' : ''
      }`}
    >
      {/* Bot Floating / Walking Animation Wrapper */}
      <motion.div
        animate={
          isWalking
            ? {
                y: [0, -6, 0, -4, 0],
                rotate: [-3, 3, -3, 3, -3],
                transition: {
                  repeat: Infinity,
                  duration: 0.5,
                  ease: 'easeInOut',
                },
              }
            : {
                y: [0, -5, 0],
                transition: {
                  repeat: Infinity,
                  duration: 2.2 + bobDelay * 0.2,
                  delay: bobDelay * 0.25,
                  ease: 'easeInOut',
                },
              }
        }
        className="relative flex items-center justify-center"
      >
        {/* Selection / Hover Aura Glow Ring */}
        {(isSelected || isHovered) && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.15, opacity: 1 }}
            className="absolute inset-0 rounded-full blur-md pointer-events-none"
            style={{
              backgroundColor: isLowKnowledge ? 'rgba(234, 179, 8, 0.45)' : meta.glowColor,
            }}
          />
        )}

        {/* Low Knowledge Warning Beacon Aura */}
        {isLowKnowledge && (
          <div className="absolute -top-1 -right-1 z-20 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-yellow-500 text-[9px] font-bold text-black items-center justify-center border border-black">
              !
            </span>
          </div>
        )}

        {/* 16x16 Pixel Art SVG */}
        <svg
          width={size}
          height={size}
          viewBox="0 0 16 16"
          style={{
            imageRendering: 'pixelated',
            shapeRendering: 'crispEdges',
            filter: isSelected
              ? `drop-shadow(0 0 12px ${meta.colorLight}) drop-shadow(0 0 4px ${meta.color})`
              : isHovered
              ? `drop-shadow(0 0 8px ${meta.glowColor})`
              : `drop-shadow(0 4px 6px rgba(0,0,0,0.5))`,
          }}
          className={`transition-all duration-200 ${
            isLowKnowledge ? 'animate-[pulse_1.2s_ease-in-out_infinite]' : ''
          }`}
        >
          {spriteMap.map((rowStr, y) =>
            rowStr.split('').map((char, x) => {
              if (char === '.') return null;
              const fill = resolveColor(char);
              const isEye = char === 'E';

              return (
                <rect
                  key={`${x}-${y}`}
                  x={x}
                  y={y}
                  width={1}
                  height={1}
                  fill={fill}
                  className={
                    isEye && isLowKnowledge
                      ? 'animate-[ping_0.8s_cubic-bezier(0,0,0.2,1)_infinite]'
                      : undefined
                  }
                />
              );
            })
          )}
        </svg>
      </motion.div>

      {/* Ground Shadow below Bot */}
      <motion.div
        animate={
          isWalking
            ? {
                scaleX: [1, 0.7, 1],
                opacity: [0.6, 0.3, 0.6],
                transition: { repeat: Infinity, duration: 0.5, ease: 'easeInOut' },
              }
            : {
                scaleX: [1, 0.82, 1],
                opacity: [0.65, 0.35, 0.65],
                transition: {
                  repeat: Infinity,
                  duration: 2.2 + bobDelay * 0.2,
                  delay: bobDelay * 0.25,
                  ease: 'easeInOut',
                },
              }
        }
        className="w-8 h-1.5 rounded-full bg-black/60 dark:bg-black/80 blur-[1.5px] mt-0.5"
      />

      {/* Name Tag & Code Pill */}
      {showNameTag && (
        <div className="mt-1 flex flex-col items-center">
          <div
            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider flex items-center gap-1 border transition-all ${
              isSelected
                ? 'bg-white text-black border-white shadow-[0_0_10px_rgba(255,255,255,0.7)]'
                : isLowKnowledge
                ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40 shadow-[0_0_8px_rgba(234,179,8,0.4)]'
                : 'bg-black/75 dark:bg-zinc-900/80 text-zinc-300 border-zinc-700/60 group-hover:border-white/40'
            }`}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                backgroundColor: isLowKnowledge ? '#facc15' : meta.color,
                boxShadow: `0 0 4px ${isLowKnowledge ? '#facc15' : meta.color}`,
              }}
            />
            <span>{meta.code}</span>
          </div>

          {/* Optional Health Bar */}
          {showHealthBar && (
            <div className="w-10 h-1 bg-black/60 rounded-full overflow-hidden mt-1 p-0.5 border border-zinc-700/50">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  health >= 70
                    ? 'bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.8)]'
                    : health >= 35
                    ? 'bg-amber-500 shadow-[0_0_4px_rgba(245,158,11,0.8)]'
                    : 'bg-rose-500 shadow-[0_0_4px_rgba(244,63,94,0.8)]'
                }`}
                style={{ width: `${Math.max(8, health)}%` }}
              />
            </div>
          )}

          {/* Stats Subtitle */}
          {showStats && (
            <div className="text-[9px] font-mono text-zinc-400 mt-0.5 flex items-center gap-1">
              <span className={isLowKnowledge ? 'text-yellow-400 font-bold' : 'text-cyan-400'}>
                {knowledge}%
              </span>
              <span>•</span>
              <span className="text-zinc-500">{meta.role.replace('The ', '')}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

