'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export interface TooltipProps {
  content: React.ReactNode;
  side?: 'right' | 'bottom';
  /** Hover delay in ms before the tooltip appears. */
  delay?: number;
  className?: string;
  children: React.ReactNode;
}

/**
 * Vercel-style tooltip. Opens on hover and keyboard focus, fades in with a
 * slight slide. Never uses the native `title` attribute.
 */
export function Tooltip({ content, side = 'bottom', delay = 120, className, children }: TooltipProps) {
  const [open, setOpen] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const id = React.useId();

  const show = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(true), delay);
  };
  const hide = () => {
    if (timer.current) clearTimeout(timer.current);
    setOpen(false);
  };

  React.useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  const isRight = side === 'right';
  const position = isRight
    ? 'left-full top-1/2 -translate-y-1/2 ml-3'
    : 'top-full left-1/2 -translate-x-1/2 mt-2';

  return (
    <span
      className={`relative inline-flex ${className ?? ''}`}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      aria-describedby={open ? id : undefined}
    >
      {children}
      <AnimatePresence>
        {open && (
          <motion.span
            id={id}
            role="tooltip"
            initial={{ opacity: 0, y: isRight ? 0 : 4, x: isRight ? -4 : 0 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: isRight ? 0 : 4, x: isRight ? -4 : 0 }}
            transition={{ duration: 0.14, ease: 'easeOut' }}
            className={`pointer-events-none absolute z-[300] whitespace-nowrap rounded-md border border-white/10 bg-[#111111] px-2.5 py-1.5 text-xs font-medium text-gray-200 shadow-xl ${position}`}
          >
            {content}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

export default Tooltip;

