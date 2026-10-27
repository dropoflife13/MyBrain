'use client';

import React from 'react';
import { motion } from 'framer-motion';

const AGENTS = [
  { code: 'PM', label: 'Product' },
  { code: 'UX', label: 'UI / UX' },
  { code: 'GR', label: 'Growth' },
  { code: 'SD', label: 'Systems' },
  { code: 'IR', label: 'Integration' },
  { code: 'DB', label: 'Database' },
  { code: 'SEC', label: 'Security' },
];

export interface NeuralLoaderProps {
  className?: string;
}

export default function NeuralLoader({ className = '' }: NeuralLoaderProps) {
  // Coordinate geometry for 7 radial agent nodes
  const cx = 250;
  const cy = 250;
  const radius = 150;

  const agentCoords = AGENTS.map((agent, i) => {
    const angle = (2 * Math.PI * i) / AGENTS.length - Math.PI / 2;
    return {
      ...agent,
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
      angle,
    };
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.55, ease: 'easeInOut' } }}
      transition={{ duration: 0.25 }}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050505] text-white select-none overflow-hidden font-mono ${className}`}
    >
      {/* Ambient background glow & tactical scanlines */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-25"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 50%, rgba(0, 255, 255, 0.14) 0%, transparent 65%), repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.5) 0px, rgba(0, 0, 0, 0.5) 1px, transparent 1px, transparent 3px)',
        }}
      />

      <div className="relative z-10 flex flex-col items-center max-w-lg w-full px-4">
        {/* SVG Neural Wiring Diagram */}
        <div className="w-80 h-80 sm:w-96 sm:h-96 relative flex items-center justify-center">
          <svg
            viewBox="0 0 500 500"
            className="w-full h-full overflow-visible drop-shadow-[0_0_28px_rgba(0,255,255,0.45)]"
          >
            <defs>
              {/* Cyan Glow Filter */}
              <filter id="loader-neural-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="4.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Core Flare Glow Filter */}
              <filter id="loader-core-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Radial Gradients */}
              <radialGradient id="loader-center-grad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="45%" stopColor="#00ffff" />
                <stop offset="100%" stopColor="#0284c7" />
              </radialGradient>
            </defs>

            {/* Tactical Outer Perimeter Orbit Ring */}
            <motion.circle
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke="#00ffff"
              strokeWidth="1"
              strokeDasharray="4 8"
              initial={{ opacity: 0, rotate: 0 }}
              animate={{ opacity: 0.28, rotate: 360 }}
              transition={{
                opacity: { duration: 0.6 },
                rotate: { duration: 22, repeat: Infinity, ease: 'linear' },
              }}
              style={{ transformOrigin: `${cx}px ${cy}px` }}
            />

            {/* Secondary Concentric Orbital Ring */}
            <motion.circle
              cx={cx}
              cy={cy}
              r={radius + 32}
              fill="none"
              stroke="#0284c7"
              strokeWidth="0.75"
              strokeDasharray="2 12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.2 }}
              transition={{ duration: 0.6 }}
            />

            {/* 7 Synaptic Lines Drawing Outward From Center to Perimeter Nodes */}
            {agentCoords.map((agent, i) => (
              <g key={`loader-link-${agent.code}`}>
                {/* Cyan Glow Backline */}
                <motion.line
                  x1={cx}
                  y1={cy}
                  x2={agent.x}
                  y2={agent.y}
                  stroke="#00ffff"
                  strokeWidth="3"
                  strokeLinecap="round"
                  filter="url(#loader-neural-glow)"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.75 }}
                  transition={{
                    pathLength: { duration: 0.75, delay: 0.15 + i * 0.06, ease: 'easeOut' },
                    opacity: { duration: 0.3, delay: 0.15 + i * 0.06 },
                  }}
                />

                {/* Crisp White Core Line */}
                <motion.line
                  x1={cx}
                  y1={cy}
                  x2={agent.x}
                  y2={agent.y}
                  stroke="#ffffff"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{
                    duration: 0.75,
                    delay: 0.15 + i * 0.06,
                    ease: 'easeOut',
                  }}
                />

                {/* Continuous Traveling Synaptic Energy Spark */}
                <motion.circle
                  r={2.5}
                  fill="#ffffff"
                  filter="url(#loader-neural-glow)"
                  animate={{
                    cx: [cx, agent.x],
                    cy: [cy, agent.y],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 1.1,
                    repeat: Infinity,
                    delay: 0.35 + i * 0.12,
                    ease: 'easeInOut',
                  }}
                />

                {/* Perimeter Agent Node (Dot + Outer Halo) */}
                <motion.circle
                  cx={agent.x}
                  cy={agent.y}
                  r={14}
                  fill="#00ffff"
                  fillOpacity="0.12"
                  stroke="#00ffff"
                  strokeWidth="1"
                  filter="url(#loader-neural-glow)"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 1.25, 1], opacity: 0.85 }}
                  transition={{
                    duration: 0.4,
                    delay: 0.6 + i * 0.06,
                    ease: 'easeOut',
                  }}
                  style={{ transformOrigin: `${agent.x}px ${agent.y}px` }}
                />

                <motion.circle
                  cx={agent.x}
                  cy={agent.y}
                  r={5}
                  fill="#00ffff"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    duration: 0.3,
                    delay: 0.6 + i * 0.06,
                    ease: 'backOut',
                  }}
                  style={{ transformOrigin: `${agent.x}px ${agent.y}px` }}
                />

                <motion.circle
                  cx={agent.x}
                  cy={agent.y}
                  r={2}
                  fill="#ffffff"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.65 + i * 0.06 }}
                />

                {/* Agent Code Label */}
                <motion.text
                  x={cx + (radius + 22) * Math.cos(agent.angle)}
                  y={cy + (radius + 22) * Math.sin(agent.angle) + 4}
                  textAnchor="middle"
                  fill="#00ffff"
                  fontSize="11"
                  fontWeight="bold"
                  letterSpacing="1"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + i * 0.06, duration: 0.3 }}
                  className="select-none font-mono"
                >
                  {agent.code}
                </motion.text>
              </g>
            ))}

            {/* Central Glowing Cognitive Hub */}
            {/* Ambient Expanding Pulse Waves */}
            <motion.circle
              cx={cx}
              cy={cy}
              r={12}
              fill="none"
              stroke="#00ffff"
              strokeWidth="1.5"
              initial={{ scale: 0.8, opacity: 0.8 }}
              animate={{
                scale: [0.8, 2.4, 3.2],
                opacity: [0.9, 0.4, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeOut',
              }}
              style={{ transformOrigin: `${cx}px ${cy}px` }}
            />

            {/* Center Core Outer Glow */}
            <motion.circle
              cx={cx}
              cy={cy}
              r={18}
              fill="url(#loader-center-grad)"
              fillOpacity="0.32"
              filter="url(#loader-core-glow)"
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.3, 1] }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              style={{ transformOrigin: `${cx}px ${cy}px` }}
            />

            {/* Center Core Solid Dot */}
            <motion.circle
              cx={cx}
              cy={cy}
              r={9}
              fill="url(#loader-center-grad)"
              stroke="#ffffff"
              strokeWidth="1.5"
              filter="url(#loader-neural-glow)"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4, ease: 'backOut' }}
              style={{ transformOrigin: `${cx}px ${cy}px` }}
            />

            <motion.circle
              cx={cx}
              cy={cy}
              r={3.5}
              fill="#ffffff"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            />
          </svg>
        </div>

        {/* Telemetry Status Caption */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="mt-6 flex flex-col items-center text-center space-y-1.5"
        >
          <div className="flex items-center gap-2 text-xs text-[#00ffff] font-semibold tracking-widest uppercase">
            <span className="w-2 h-2 rounded-full bg-[#00ffff] animate-ping" />
            <span>Wiring 7-Agent Neural Matrix</span>
          </div>
          <p className="text-[11px] text-zinc-400">
            Binding PM • UX • GR • SD • IR • DB • SEC to 3D Coordinates...
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}

export { NeuralLoader };

