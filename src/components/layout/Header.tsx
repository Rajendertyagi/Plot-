import React, { useState } from 'react';
import {
  FolderKanban,
  Search,
  Plus,
  SlidersHorizontal,
  ChevronDown,
  ListTree,
  LayoutGrid,
  Download,
} from 'lucide-react';
import { Project, ViewLayout } from '../../types';

interface HeaderProps {
  currentProject: Project | null;
  projects: Project[];
  onSelectProject: (projectId: string) => void;
  viewLayout: ViewLayout;
  onChangeViewLayout: (layout: ViewLayout) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenNewProjectModal: () => void;
  onOpenColumnManager: () => void;
  exportUrl?: string;
  isSaving?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentProject,
  projects,
  onSelectProject,
  viewLayout,
  onChangeViewLayout,
  searchQuery,
  onSearchChange,
  onOpenNewProjectModal,
  onOpenColumnManager,
  exportUrl,
  isSaving,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#121214] border-b border-white/[0.04] shadow-sm shadow-black/40">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6">
        {/* Left: Brand & Project Selector */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-xl bg-white flex items-center justify-center shadow-xs">
              <FolderKanban className="h-4 w-4 text-black" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-white hidden sm:inline-block">
              ProjectFlow
            </span>
          </div>

          <div className="h-4 w-px bg-white/[0.08] hidden sm:block" />

          {/* Quick Project Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.08] text-xs font-medium text-white transition-colors"
            >
              <span className="truncate max-w-[140px] sm:max-w-[200px]">
                {currentProject ? currentProject.title : 'Select Project'}
              </span>
              <ChevronDown className="h-3 w-3 text-zinc-400" />
            </button>

            {isDropdownOpen && (
              <div className="absolute left-0 top-full mt-1.5 z-50 w-64 rounded-2xl border border-white/10 bg-[#1c1c1f] p-1.5 shadow-2xl shadow-black/80 space-y-0.5 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                  Switch Active Project
                </div>
                {projects.map((proj) => (
                  <button
                    key={proj.id}
                    onClick={() => {
                      onSelectProject(proj.id);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs text-left transition-colors ${
                      currentProject?.id === proj.id
                        ? 'bg-white/10 text-white font-medium'
                        : 'text-zinc-300 hover:bg-white/[0.05] hover:text-white'
                    }`}
                  >
                    <span className="truncate">{proj.title}</span>
                    <span className="text-[10px] font-mono text-zinc-400">
                      {proj.columns.length} cols
                    </span>
                  </button>
                ))}

                <div className="pt-1 mt-1 border-t border-white/[0.06]">
                  <button
                    onClick={() => {
                      onOpenNewProjectModal();
                      setIsDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 text-left font-medium"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Create New Project</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center: Search Field */}
        <div className="flex-1 max-w-xs sm:max-w-md mx-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search features, tasks, subtasks..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full h-8 pl-8 pr-3 text-xs bg-white/[0.05] hover:bg-white/[0.07] focus:bg-white/[0.09] text-white placeholder-zinc-500 rounded-full border border-transparent focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
            />
          </div>
        </div>

        {/* Right: View Toggles & Actions */}
        <div className="flex items-center gap-2">
          {/* Layout switcher: Sleek pill toggle */}
          <div className="flex items-center bg-white/[0.05] rounded-full p-0.5 border border-white/[0.04]">
            <button
              onClick={() => onChangeViewLayout('tree')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                viewLayout === 'tree'
                  ? 'bg-white text-zinc-950 shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Tree List View"
            >
              <ListTree className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Tree List</span>
            </button>
            <button
              onClick={() => onChangeViewLayout('board')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                viewLayout === 'board'
                  ? 'bg-white text-zinc-950 shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Board View"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Board</span>
            </button>
          </div>

          {/* Saving Status Indicator */}
          {isSaving && (
            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono bg-white/[0.05] text-zinc-400">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>Saving...</span>
            </span>
          )}

          {/* Export JSON Database */}
          {exportUrl && (
            <a
              href={exportUrl}
              download="projects.json"
              className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors"
              title="Download JSON Database"
            >
              <Download className="h-4 w-4" />
            </a>
          )}

          {/* Quick Configure Columns */}
          <button
            onClick={onOpenColumnManager}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors"
            title="Configure Status Columns"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>

          {/* New Project Button */}
          <button
            onClick={onOpenNewProjectModal}
            className="flex items-center gap-1 h-8 px-3.5 rounded-full bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-medium transition-all shadow-xs"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">New Project</span>
          </button>
        </div>
      </div>
    </header>
  );
};
