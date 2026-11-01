'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AgentCode } from './PixelBot';

export const IDLE_SPEECH_MESSAGES: Record<AgentCode, string> = {
  DB: 'Indexing...',
  SEC: 'Scanning...',
  UX: 'Polishing...',
  PM: 'Planning...',
  SD: 'Architecting...',
  IR: 'Syncing...',
  GR: 'Pitching...',
  RS: 'Researching...',
};

export interface SpeechBubbleProps {
  text?: string | null;
  isProcessing?: boolean;
  accentColor?: string;
}

/**
 * Pixel-art speech bubble with a triangular tail pointing down to the bot.
 * Supports smooth pop-in / fade-out via Framer Motion AnimatePresence and animated dots when processing.
 */
export default function SpeechBubble({
  text,
  isProcessing = false,
  accentColor = '#00ffff',
}: SpeechBubbleProps) {
  const showBubble = isProcessing || Boolean(text);

  return (
    <AnimatePresence mode="wait">
      {showBubble && (
        <motion.div
          key={isProcessing ? 'processing-bubble' : `idle-bubble-${text}`}
          initial={{ opacity: 0, y: 6, scale: 0.82 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 4, scale: 0.88 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="absolute -top-9 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center select-none"
        >
          {/* Pixelated White Box */}
          <div
            className="px-2.5 py-1 bg-white text-slate-950 border-2 border-slate-950 font-mono text-[10px] font-extrabold tracking-tight whitespace-nowrap flex items-center gap-1.5"
            style={{
              boxShadow: '3px 3px 0px rgba(0, 0, 0, 0.85)',
              imageRendering: 'pixelated',
            }}
          >
            <span
              className="w-1.5 h-1.5 shrink-0"
              style={{
                backgroundColor: accentColor,
                boxShadow: isProcessing ? `0 0 6px ${accentColor}` : undefined,
              }}
            />
            {isProcessing ? (
              <span className="inline-flex items-center">
                <span>Processing</span>
                <span className="inline-flex w-3.5 justify-start ml-0.5">
                  <motion.span
                    animate={{ opacity: [0.15, 1, 0.15] }}
                    transition={{ repeat: Infinity, duration: 0.9, delay: 0 }}
                  >
                    .
                  </motion.span>
                  <motion.span
                    animate={{ opacity: [0.15, 1, 0.15] }}
                    transition={{ repeat: Infinity, duration: 0.9, delay: 0.25 }}
                  >
                    .
                  </motion.span>
                  <motion.span
                    animate={{ opacity: [0.15, 1, 0.15] }}
                    transition={{ repeat: Infinity, duration: 0.9, delay: 0.5 }}
                  >
                    .
                  </motion.span>
                </span>
              </span>
            ) : (
              <span>{text}</span>
            )}
          </div>

          {/* Pixel Triangular Tail Pointing Down to the Bot */}
          <div className="relative flex flex-col items-center -mt-[1px]">
            {/* Outer dark border triangle */}
            <div
              className="w-0 h-0"
              style={{
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: '6px solid #020617',
              }}
            />
            {/* Inner white triangle fill */}
            <div
              className="w-0 h-0 absolute -top-[2px]"
              style={{
                borderLeft: '4px solid transparent',
                borderRight: '4px solid transparent',
                borderTop: '4px solid #ffffff',
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Faint pixelated "Workstation / Cyber Desk" sprite placed behind each bot's base position
 * so the Space Station HQ feels like an isometric office / command deck.
 */
export function PixelWorkstation({
  code,
  color,
  colorLight,
  isLowKnowledge = false,
}: {
  code: AgentCode;
  color: string;
  colorLight: string;
  isLowKnowledge?: boolean;
}) {
  const screenColor = isLowKnowledge ? '#facc15' : colorLight;
  const bezelColor = isLowKnowledge ? '#854d0e' : color;

  return (
    <div className="relative flex flex-col items-center pointer-events-none select-none opacity-65 group-hover:opacity-90 transition-opacity">
      {/* 28x18 Pixel Art Workstation Desk + Dual Monitors + Server Rack */}
      <svg
        width={96}
        height={62}
        viewBox="0 0 28 18"
        style={{
          imageRendering: 'pixelated',
          shapeRendering: 'crispEdges',
          filter: `drop-shadow(0 0 8px ${bezelColor}44)`,
        }}
      >
        {/* Left Server Rack Tower */}
        <rect x="2" y="3" width="5" height="10" fill="#0f172a" />
        <rect x="3" y="4" width="3" height="8" fill="#1e293b" />
        {/* Server blinking LEDs */}
        <rect x="3" y="5" width="1" height="1" fill={screenColor} />
        <rect x="5" y="5" width="1" height="1" fill="#10b981" />
        <rect x="3" y="7" width="2" height="1" fill={bezelColor} />
        <rect x="3" y="9" width="2" height="1" fill="#38bdf8" />

        {/* Central Wide Cyber Monitor */}
        <rect x="8" y="2" width="12" height="8" fill="#0f172a" />
        <rect x="9" y="3" width="10" height="6" fill="#09152b" />
        {/* Monitor Top Glow Bar & Pixel Code Lines */}
        <rect x="9" y="3" width="10" height="1" fill={bezelColor} opacity="0.85" />
        <rect x="10" y="5" width="5" height="1" fill={screenColor} opacity="0.9" />
        <rect x="10" y="7" width="7" height="1" fill={screenColor} opacity="0.6" />
        <rect x="16" y="5" width="2" height="1" fill="#ffffff" opacity="0.7" />
        {/* Monitor Stand */}
        <rect x="13" y="10" width="2" height="2" fill="#334155" />
        <rect x="11" y="11" width="6" height="1" fill="#475569" />

        {/* Right Auxiliary Side Monitor */}
        <rect x="21" y="4" width="5" height="6" fill="#0f172a" />
        <rect x="22" y="5" width="3" height="4" fill="#09152b" />
        <rect x="22" y="6" width="2" height="1" fill={screenColor} opacity="0.85" />
        <rect x="22" y="8" width="3" height="1" fill={bezelColor} opacity="0.75" />
        <rect x="23" y="10" width="1" height="2" fill="#334155" />

        {/* Isometric Pixel Desk Surface */}
        <rect x="1" y="12" width="26" height="2" fill="#1e293b" />
        <rect x="2" y="12" width="24" height="1" fill="#334155" />
        {/* Glowing Neon Desk Edge Trim */}
        <rect x="2" y="13" width="24" height="1" fill={bezelColor} opacity="0.75" />

        {/* Keyboard & Holo-pad on Desk */}
        <rect x="10" y="12" width="6" height="1" fill={screenColor} opacity="0.8" />
        <rect x="18" y="12" width="2" height="1" fill="#38bdf8" opacity="0.8" />

        {/* Desk Legs / Side Panels */}
        <rect x="2" y="14" width="2" height="4" fill="#0f172a" />
        <rect x="4" y="14" width="1" height="3" fill="#1e293b" />
        <rect x="24" y="14" width="2" height="4" fill="#0f172a" />
        <rect x="23" y="14" width="1" height="3" fill="#1e293b" />
      </svg>

      {/* Workstation Label Tag */}
      <div className="mt-0.5 px-1.5 py-0.2 rounded bg-slate-950/80 border border-slate-800 text-[8px] font-mono text-slate-400 tracking-widest uppercase">
        TERM // {code}
      </div>
    </div>
  );
}
