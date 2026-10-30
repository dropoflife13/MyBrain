'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  BookOpen,
  Check,
  Compass,
  Cpu,
  FileCode2,
  FolderGit2,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Terminal,
  X,
  Zap,
} from 'lucide-react';
import { BrainDocNode } from '../lib/brain-parser';
import { Badge } from './ui/badge';

export interface CommandItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'agent' | 'domain-rule' | 'identity' | 'heuristic' | 'navigation';
  badge: string;
  icon: React.ReactNode;
  nodeRef?: BrainDocNode;
  href?: string;
  action?: () => void;
  keywords: string[];
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: BrainDocNode[];
  onSelectNode?: (node: BrainDocNode) => void;
  onNavigate?: (href: string) => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
  nodes,
  onSelectNode,
  onNavigate,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const prevActiveElementRef = useRef<HTMLElement | null>(null);

  // Rule GR-04: 150ms debounce on search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 150);
    return () => clearTimeout(handler);
  }, [query]);

  // Focus preservation (UX-07)
  useEffect(() => {
    if (isOpen) {
      prevActiveElementRef.current = document.activeElement as HTMLElement | null;
      setQuery('');
      setDebouncedQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      prevActiveElementRef.current?.focus();
    }
  }, [isOpen]);

  // Build searchable index from nodes and navigation targets
  const catalog = useMemo<CommandItem[]>(() => {
    const items: CommandItem[] = [];

    // 1. Navigation items
    items.push({
      id: 'nav-console',
      title: 'Open 3D Synaptic Console',
      subtitle: 'Interactive 360-node procedural constellation & gatekeeper matrix',
      category: 'navigation',
      badge: 'NAV • CONSOLE',
      icon: <Cpu className="w-4 h-4 text-cyan-400" />,
      href: '/console',
      keywords: ['console', '3d', 'graph', 'nodes', 'constellation', 'mind'],
    });

    items.push({
      id: 'nav-landing',
      title: 'Return to Landing Overview',
      subtitle: 'Cinematic desktop showcase & architectural overview',
      category: 'navigation',
      badge: 'NAV • HOME',
      icon: <Compass className="w-4 h-4 text-cyan-400" />,
      href: '/',
      keywords: ['landing', 'home', 'overview', 'cortex'],
    });

    items.push({
      id: 'nav-start',
      title: 'Initiation Protocol (Beginner Setup)',
      subtitle: '5-step beginner setup guide for forking and configuring your vault',
      category: 'navigation',
      badge: 'NAV • GUIDE',
      icon: <BookOpen className="w-4 h-4 text-cyan-400" />,
      href: '/start',
      keywords: ['start', 'guide', 'initiation', 'beginner', 'setup', 'template', 'zip'],
    });

    items.push({
      id: 'nav-agents',
      title: '8-Agent Execution Suite Directory',
      subtitle: 'Specification directory for PM, UX, GR, SD, IR, DB, SEC, RS',
      category: 'navigation',
      badge: 'NAV • AGENTS',
      icon: <FolderGit2 className="w-4 h-4 text-cyan-400" />,
      href: '/agents',
      keywords: ['agents', 'suite', 'directory', 'specs', 'gatekeepers'],
    });

    items.push({
      id: 'nav-assess',
      title: 'Launcher L-01 Self-Assessment Quiz',
      subtitle: 'Interactive diagnostic quiz to generate your personal markdown rules',
      category: 'navigation',
      badge: 'NAV • ASSESS',
      icon: <Sparkles className="w-4 h-4 text-amber-400" />,
      href: '/assess',
      keywords: ['assess', 'quiz', 'test', 'l-01', 'launcher', 'elicitation', 'blank'],
    });

    // 2. Map nodes (Agents + Document Nodes + Synapses)
    const seenNodeIds = new Set<string>();

    for (const node of nodes) {
      if (!node.id || node.id === 'hub') continue;

      const cleanId = String(node.id).split('::')[0];
      const isAgent = node.group === 1 || node.category === 'agent';
      const isSynapse = node.category === 'synapse';

      let cat: CommandItem['category'] = 'domain-rule';
      let icon = <FileCode2 className="w-4 h-4 text-cyan-400" />;
      let badge = 'RULE';

      if (isAgent) {
        cat = 'agent';
        icon = <ShieldCheck className="w-4 h-4 text-[#00ffff]" />;
        badge = `GATE • ${node.agentCode ?? 'AGENT'}`;
      } else if (node.category === 'identity') {
        cat = 'identity';
        icon = <Sparkles className="w-4 h-4 text-amber-400" />;
        badge = 'IDENTITY';
      } else if (node.category === 'heuristic') {
        cat = 'heuristic';
        icon = <Zap className="w-4 h-4 text-purple-400" />;
        badge = 'HEURISTIC';
      }

      // If it's a synapse with an individual rule ID
      if (isSynapse) {
        const ruleIdMatch = node.id.match(/^([A-Z]{1,4}-\d+)/);
        const ruleId = ruleIdMatch ? ruleIdMatch[1] : cleanId;

        if (!seenNodeIds.has(ruleId)) {
          seenNodeIds.add(ruleId);
          items.push({
            id: `rule-${node.id}`,
            title: `${ruleId} — ${node.name.replace(/^[A-Z]{1,4}-\d+\s*—\s*/, '')}`,
            subtitle: node.description || 'Procedural rule invariant in the Cortex vault',
            category: cat,
            badge: ruleId,
            icon,
            nodeRef: node,
            keywords: [ruleId, node.name, node.description, cat],
          });
        }
      } else if (!seenNodeIds.has(node.id)) {
        seenNodeIds.add(node.id);
        items.push({
          id: `doc-${node.id}`,
          title: node.name,
          subtitle: node.description || `${node.category} document in the Cortex vault`,
          category: cat,
          badge,
          icon,
          nodeRef: node,
          keywords: [cleanId, node.name, node.description, node.category],
        });
      }
    }

    return items;
  }, [nodes]);

  // Filter items matching debounced query
  const filteredItems = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) {
      // Default initial view: top agents + navigation + notable rules
      return catalog.slice(0, 12);
    }

    return catalog
      .filter((item) => {
        if (item.title.toLowerCase().includes(q)) return true;
        if (item.subtitle.toLowerCase().includes(q)) return true;
        if (item.badge.toLowerCase().includes(q)) return true;
        return item.keywords.some((k) => k.toLowerCase().includes(q));
      })
      .slice(0, 15);
  }, [catalog, debouncedQuery]);

  // Keep selected index in bounds
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredItems]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(filteredItems.length, 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev - 1 < 0 ? Math.max(filteredItems.length - 1, 0) : prev - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const current = filteredItems[selectedIndex];
      if (current) {
        handleExecute(current);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  const handleExecute = (item: CommandItem) => {
    onClose();
    if (item.nodeRef && onSelectNode) {
      onSelectNode(item.nodeRef);
    } else if (item.href && onNavigate) {
      onNavigate(item.href);
    } else if (item.href) {
      window.location.href = item.href;
    } else if (item.action) {
      item.action();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="cmd-palette-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-20 sm:pt-28 px-4 bg-black/60 dark:bg-black/80 backdrop-blur-md select-none"
        >
          <motion.div
            key="cmd-palette-modal"
            initial={{ opacity: 0, scale: 0.95, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -12 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl rounded-2xl bg-white/95 dark:bg-[#09090b]/95 border border-slate-300 dark:border-white/15 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col backdrop-blur-2xl text-slate-900 dark:text-zinc-100 font-mono"
            role="combobox"
            aria-expanded="true"
            aria-haspopup="listbox"
          >
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-zinc-950/50">
              <Search className="w-5 h-5 text-cyan-600 dark:text-[#00ffff] shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search rules (CS-01, UI-07, DB-05), agents, heuristics, or commands..."
                className="flex-1 bg-transparent border-0 outline-none text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 font-mono"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="p-1 rounded hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-400 dark:text-zinc-500 transition-colors cursor-pointer"
                  title="Clear input"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-zinc-500 border border-slate-200 dark:border-white/10 rounded px-1.5 py-0.5 bg-slate-100 dark:bg-zinc-900">
                <span>ESC</span>
              </div>
            </div>

            {/* Results List */}
            <div
              ref={listRef}
              role="listbox"
              className="max-h-[380px] overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-white/[0.04]"
            >
              {filteredItems.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 dark:text-zinc-500 space-y-2">
                  <Terminal className="w-7 h-7 mx-auto text-slate-300 dark:text-zinc-600" />
                  <p>No rules, agents, or commands matching &ldquo;{debouncedQuery}&rdquo;</p>
                  <p className="text-[11px] text-slate-400 dark:text-zinc-600">
                    Try searching by ID (e.g. <span className="text-cyan-500">CS-01</span>, <span className="text-cyan-500">UI-07</span>, <span className="text-cyan-500">DB-05</span>) or keyword.
                  </p>
                </div>
              ) : (
                filteredItems.map((item, index) => {
                  const isSelected = index === selectedIndex;
                  return (
                    <div
                      key={item.id}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleExecute(item)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`group flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-500/10 dark:bg-[#00ffff]/15 border border-cyan-500/30 dark:border-cyan-400/40 text-slate-950 dark:text-white shadow-sm'
                          : 'hover:bg-slate-100 dark:hover:bg-white/[0.04] text-slate-700 dark:text-zinc-300 border border-transparent'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div
                          className={`mt-0.5 p-1.5 rounded-lg shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-cyan-500/20 dark:bg-cyan-400/20 text-cyan-600 dark:text-[#00ffff]'
                              : 'bg-slate-100 dark:bg-zinc-900 text-slate-400 dark:text-zinc-400'
                          }`}
                        >
                          {item.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold truncate text-slate-900 dark:text-white">
                              {item.title}
                            </span>
                            <Badge
                              variant="outline"
                              className={`text-[9px] px-1.5 py-0 font-mono shrink-0 ${
                                isSelected
                                  ? 'border-cyan-500/40 text-cyan-700 dark:text-[#00ffff]'
                                  : 'border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400'
                              }`}
                            >
                              {item.badge}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                            {item.subtitle}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 text-[10px] text-slate-400 dark:text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>Select</span>
                        <ArrowRight className="w-3 h-3 text-cyan-600 dark:text-[#00ffff]" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Telemetry */}
            <div className="px-4 py-2 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-zinc-950/80 flex items-center justify-between text-[10px] text-slate-500 dark:text-zinc-500">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-zinc-800 border border-slate-300 dark:border-white/10">↑</kbd>
                  <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-zinc-800 border border-slate-300 dark:border-white/10">↓</kbd>
                  <span>navigate</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-zinc-800 border border-slate-300 dark:border-white/10">↵</kbd>
                  <span>select / fly to node</span>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>{catalog.length} Invariants Indexed</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

