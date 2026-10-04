import React from 'react';
import {
  SlidersHorizontal,
  Download,
  Folder,
  ChevronRight,
  HardDrive,
} from 'lucide-react';
import { Project, ViewLayout } from '../../types';
import { Button } from '../ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

interface CompactHeaderProps {
  currentProject: Project | null;
  viewLayout: ViewLayout;
  onOpenColumnManager: () => void;
  onOpenDirectoryFinder?: () => void;
  exportUrl?: string;
  isSaving?: boolean;
}

export const CompactHeader: React.FC<CompactHeaderProps> = ({
  currentProject,
  viewLayout,
  onOpenColumnManager,
  onOpenDirectoryFinder,
  exportUrl,
  isSaving,
}) => {
  const viewLabels: Record<ViewLayout, string> = {
    board: 'Kanban Board',
    tree: 'Feature Tree',
    files: 'Codebase Explorer',
    ai: 'AI Prompts',
  };

  return (
    <TooltipProvider delayDuration={250}>
      <header className="h-11 bg-neutral-950 border-b border-neutral-800/80 px-4 flex items-center justify-between gap-3 shrink-0 select-none z-20">
        {/* Left: Compact Breadcrumbs (Project / View) */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-medium min-w-0">
            <Folder className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span
              className="text-neutral-200 font-semibold truncate max-w-[200px] sm:max-w-[320px]"
              title={currentProject?.title || 'No Project Selected'}
            >
              {currentProject ? currentProject.title : 'Select a Project'}
            </span>

            <ChevronRight className="w-3 h-3 text-neutral-600 shrink-0" />

            <span className="text-neutral-400 font-normal truncate">
              {viewLabels[viewLayout] || 'Workspace'}
            </span>
          </div>

          {currentProject?.rootDirectory && onOpenDirectoryFinder && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={onOpenDirectoryFinder}
                  className="hidden md:flex items-center gap-1 px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-[10px] font-mono text-neutral-400 hover:text-neutral-200 hover:border-neutral-700 transition-colors truncate max-w-[220px]"
                >
                  <HardDrive className="w-2.5 h-2.5 text-sky-400 shrink-0" />
                  <span className="truncate">{currentProject.rootDirectory}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <span>Linked Workspace Path</span>
                <p className="text-[10px] text-neutral-400">{currentProject.rootDirectory}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Right: Actions (Export, Saving Status, Column Manager) */}
        <div className="flex items-center gap-1.5 shrink-0">
          {isSaving && (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Saving...
            </span>
          )}

          {/* Export JSON Database */}
          {exportUrl && (
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href={exportUrl}
                  download="projects.json"
                  className="inline-flex items-center justify-center h-7 w-7 rounded text-neutral-400 hover:text-white hover:bg-neutral-900 border border-transparent hover:border-neutral-800 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                </a>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <span>Export Local Database (projects.json)</span>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Column Manager */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onOpenColumnManager}
                className="h-7 w-7 text-neutral-400 hover:text-white"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <span>Manage Kanban Columns</span>
            </TooltipContent>
          </Tooltip>
        </div>
      </header>
    </TooltipProvider>
  );
};
