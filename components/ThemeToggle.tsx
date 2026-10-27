'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle({ className }: { className?: string }) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={`w-9 h-9 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center ${className || ''}`}
      />
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`w-9 h-9 rounded-xl border transition-all flex items-center justify-center cursor-pointer shadow-lg backdrop-blur-xl ${
        isDark
          ? 'bg-[#09090b]/85 border-white/15 text-yellow-300 hover:text-yellow-200 hover:border-yellow-400/40 hover:bg-zinc-900'
          : 'bg-white/90 border-slate-300/80 text-slate-700 hover:text-slate-950 hover:border-slate-400 hover:bg-slate-100 shadow-slate-200/50'
      } ${className || ''}`}
      aria-label="Toggle theme"
      title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 transition-transform hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-slate-800 transition-transform hover:-rotate-12" />
      )}
    </button>
  );
}

