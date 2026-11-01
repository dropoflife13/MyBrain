'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

/**
 * Global Next.js App Router Template (`app/template.tsx`).
 * Re-mounts on every route navigation and wraps the page content in
 * Framer Motion <AnimatePresence mode="wait"> for a smooth 300ms
 * cinematic fade-in and slight scale-up transition (`opacity: 0 -> 1`, `scale: 0.98 -> 1`).
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{
          duration: 0.3,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="w-full min-h-screen"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

