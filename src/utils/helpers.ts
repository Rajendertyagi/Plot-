import { StatusColumn, ColumnColor } from '../types';

export const COLOR_CLASSES: Record<
  ColumnColor,
  {
    badge: string;
    dot: string;
    text: string;
    border: string;
    glow: string;
  }
> = {
  emerald: {
    badge: 'bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25',
    dot: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]',
    text: 'text-emerald-300',
    border: 'border-emerald-500/20',
    glow: 'rgba(52, 211, 153, 0.15)',
  },
  sky: {
    badge: 'bg-sky-500/15 text-sky-300 hover:bg-sky-500/25',
    dot: 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.6)]',
    text: 'text-sky-300',
    border: 'border-sky-500/20',
    glow: 'rgba(56, 189, 248, 0.15)',
  },
  amber: {
    badge: 'bg-amber-500/15 text-amber-300 hover:bg-amber-500/25',
    dot: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]',
    text: 'text-amber-300',
    border: 'border-amber-500/20',
    glow: 'rgba(251, 191, 36, 0.15)',
  },
  rose: {
    badge: 'bg-rose-500/15 text-rose-300 hover:bg-rose-500/25',
    dot: 'bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.6)]',
    text: 'text-rose-300',
    border: 'border-rose-500/20',
    glow: 'rgba(251, 113, 133, 0.15)',
  },
  purple: {
    badge: 'bg-purple-500/15 text-purple-300 hover:bg-purple-500/25',
    dot: 'bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.6)]',
    text: 'text-purple-300',
    border: 'border-purple-500/20',
    glow: 'rgba(192, 132, 252, 0.15)',
  },
  teal: {
    badge: 'bg-teal-500/15 text-teal-300 hover:bg-teal-500/25',
    dot: 'bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.6)]',
    text: 'text-teal-300',
    border: 'border-teal-500/20',
    glow: 'rgba(45, 212, 191, 0.15)',
  },
  indigo: {
    badge: 'bg-indigo-500/15 text-indigo-300 hover:bg-indigo-500/25',
    dot: 'bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.6)]',
    text: 'text-indigo-300',
    border: 'border-indigo-500/20',
    glow: 'rgba(129, 140, 248, 0.15)',
  },
  slate: {
    badge: 'bg-zinc-500/15 text-zinc-300 hover:bg-zinc-500/25',
    dot: 'bg-zinc-400',
    text: 'text-zinc-300',
    border: 'border-zinc-500/20',
    glow: 'rgba(161, 161, 170, 0.15)',
  },
};

export const PRIORITY_STYLES: Record<string, { label: string; color: string }> = {
  urgent: {
    label: 'Urgent',
    color: 'bg-rose-500/15 text-rose-300 font-medium',
  },
  high: {
    label: 'High',
    color: 'bg-orange-500/15 text-orange-300 font-medium',
  },
  medium: {
    label: 'Med',
    color: 'bg-zinc-800 text-zinc-300 font-medium',
  },
  low: {
    label: 'Low',
    color: 'bg-zinc-800/60 text-zinc-400 font-normal',
  },
};
