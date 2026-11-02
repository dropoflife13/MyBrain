'use client';

import React from 'react';
import { motion } from 'framer-motion';

const monoLabel = 'font-mono text-xs uppercase tracking-widest';

const STATS = [
  { value: '29', label: 'Domains' },
  { value: '200+', label: 'Synaptic nodes' },
  { value: '80%', label: 'Token cost reduction (target)' },
];

/** Build an SVG polyline "points" string from y-values spread across a 400x160 plot. */
function toPoints(values: number[], max: number): string {
  const step = 400 / (values.length - 1);
  return values.map((v, i) => `${(i * step).toFixed(1)},${(160 - (v / max) * 150 - 5).toFixed(1)}`).join(' ');
}

interface ChartProps {
  title: string;
  caption: string;
  values: number[];
  max: number;
  mode: 'line' | 'bars';
  xLabels: string[];
}

function Chart({ title, caption, values, max, mode, xLabels }: ChartProps) {
  const points = toPoints(values, max);
  const barW = 400 / values.length;

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-baseline justify-between mb-5">
        <h3 className={`${monoLabel} text-slate-900 dark:text-white`}>{title}</h3>
        <span className={`${monoLabel} text-slate-400 dark:text-zinc-500 !text-[10px]`}>{caption}</span>
      </div>

      <svg viewBox="0 0 400 180" className="w-full h-auto overflow-visible" fill="none" aria-hidden="true">
        {/* grid */}
        {[0, 1, 2, 3].map((i) => (
          <line
            key={i}
            x1={0}
            x2={400}
            y1={5 + i * 50}
            y2={5 + i * 50}
            strokeWidth={0.5}
            className="stroke-slate-200 dark:stroke-white/10"
          />
        ))}

        {mode === 'line' ? (
          <>
            <motion.polyline
              points={points}
              strokeWidth={1.25}
              strokeLinejoin="round"
              strokeLinecap="round"
              className="stroke-slate-900 dark:stroke-white"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.8, ease: 'easeOut' }}
            />
            {points.split(' ').map((p, i) => {
              const [cx, cy] = p.split(',');
              return (
                <circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r={i === values.length - 1 ? 3.5 : 1.75}
                  className={
                    i === values.length - 1
                      ? 'fill-cyan-500 dark:fill-cyan-300'
                      : 'fill-slate-900 dark:fill-white'
                  }
                />
              );
            })}
          </>
        ) : (
          values.map((v, i) => {
            const h = (v / max) * 150;
            return (
              <motion.rect
                key={i}
                x={i * barW + barW * 0.3}
                width={barW * 0.4}
                y={155 - h}
                height={h}
                className={
                  i === values.length - 1
                    ? 'fill-cyan-500 dark:fill-cyan-300'
                    : 'fill-slate-300 dark:fill-white/30'
                }
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.08, ease: 'easeOut' }}
                style={{ transformBox: 'fill-box', transformOrigin: 'bottom' }}
              />
            );
          })
        )}

        {/* x labels */}
        {xLabels.map((l, i) => (
          <text
            key={l}
            x={mode === 'bars' ? i * (400 / (xLabels.length)) + barW * 0.5 : (i * 400) / (xLabels.length - 1)}
            y={176}
            textAnchor={mode === 'bars' ? 'middle' : i === 0 ? 'start' : i === xLabels.length - 1 ? 'end' : 'middle'}
            fontSize={9}
            className="font-mono fill-slate-400 dark:fill-zinc-500"
          >
            {l}
          </text>
        ))}
      </svg>
    </div>
  );
}

export default function MinimalistData() {
  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-black">
      {/* Big numbers */}
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-white/10">
        {STATS.map((s, i) => (
          <motion.div
            key={s.label}
            className="p-8 md:p-10"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <div className="text-7xl md:text-8xl font-black tracking-tighter text-slate-950 dark:text-white leading-none">
              {s.value}
            </div>
            <div className={`${monoLabel} mt-4 text-slate-500 dark:text-zinc-400`}>{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-white/10 border-t border-slate-200 dark:border-white/10">
        <Chart
          title="Token Cost Optimization"
          caption="[ SIMULATED TELEMETRY ]"
          mode="line"
          values={[100, 82, 66, 48, 34, 24, 18]}
          max={100}
          xLabels={['T3 only', 'Tiered', 'Local-first']}
        />
        <Chart
          title="Knowledge Expansion"
          caption="[ SIMULATED TELEMETRY ]"
          mode="bars"
          values={[4, 6, 8, 11, 14, 22, 29]}
          max={29}
          xLabels={['v1', 'v2', 'v3', 'v4', 'v5', 'v6', 'v7']}
        />
      </div>
    </div>
  );
}

