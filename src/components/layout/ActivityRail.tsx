import React from 'react';
import {
  FolderKanban,
  Plus,
  LayoutGrid,
  FolderTree,
  FileCode,
  Sparkles,
  HardDrive,
  Layers,
  Check,
  ChevronRight,
  Settings,
  FolderSearch,
} from 'lucide-react';
import { Project, ViewLayout } from '../../types';
import { Button } from '../ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Separator } from '../ui/separator';

interface ActivityRailProps {
  projects: Project[];
  activeProjectId?: string;
  onSelectProject: (id: string) => void;
  onOpenCreateProject: () => void;
  onOpenFolderFinder?: () => void;
  viewLayout: ViewLayout;
  onChangeViewLayout: (view: ViewLayout) => void;
  onOpenSettings?: () => void;
}

export const ActivityRail: React.FC<ActivityRailProps> = ({
  projects,
  activeProjectId,
  onSelectProject,
  onOpenCreateProject,
  onOpenFolderFinder,
  viewLayout,
  onChangeViewLayout,
  onOpenSettings,
}) => {
  const activeProject = projects.find((p) => p.id === activeProjectId);

  return (
    <TooltipProvider delayDuration={200}>
      <aside className="w-[52px] h-full flex flex-col items-center py-3 bg-neutral-950 border-r border-neutral-800/80 select-none shrink-0 z-30">
        {/* App Logo */}
        <div className="mb-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-9 h-9 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 hover:bg-indigo-600/30 transition-colors cursor-pointer">
                <FolderKanban className="w-5 h-5" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              <span className="font-semibold text-white">ProjectFlow</span>
              <p className="text-[10px] text-neutral-400">Solo Human + AI Workspace</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <Separator className="w-6 mb-3 bg-neutral-800" />

        {/* Project Switcher Dropdown */}
        <div className="mb-2">
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-9 h-9 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-900 border border-transparent hover:border-neutral-800"
                  >
                    <Layers className="w-4 h-4 text-indigo-400" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="right">
                <span>Switch Project</span>
                <p className="text-[10px] text-neutral-400">
                  {activeProject ? activeProject.title : 'No active project'}
                </p>
              </TooltipContent>
            </Tooltip>

            <DropdownMenuContent side="right" align="start" className="w-64">
              <div className="px-2 py-1.5 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                Your Projects ({projects.length})
              </div>
              <DropdownMenuSeparator />
              <div className="max-h-60 overflow-y-auto">
                {projects.map((p) => (
                  <DropdownMenuItem
                    key={p.id}
                    onClick={() => onSelectProject(p.id)}
                    className="flex items-center justify-between text-xs py-2"
                  >
                    <span className="truncate pr-2 font-medium">
                      {p.title}
                    </span>
                    {p.id === activeProjectId && (
                      <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    )}
                  </DropdownMenuItem>
                ))}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onOpenFolderFinder}
                className="text-xs text-sky-400 hover:text-sky-300 font-medium py-2 cursor-pointer"
              >
                <FolderSearch className="w-3.5 h-3.5 mr-1.5 text-sky-400" />
                Open Project Folder (Finder)...
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onOpenCreateProject}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium py-2 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Create Blank Project...
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Quick Open Folder from Finder Button */}
        <div className="mb-1.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onOpenFolderFinder}
                className="w-8 h-8 rounded-lg text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 border border-sky-500/20 hover:border-sky-500/40"
              >
                <FolderSearch className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <span className="font-medium text-white">Open Project Folder</span>
              <p className="text-[10px] text-neutral-400">Browse repository with Finder</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Create Blank Project Button */}
        <div className="mb-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={onOpenCreateProject}
                className="w-8 h-8 rounded-lg bg-neutral-900/60 border-dashed border-neutral-700 hover:border-indigo-500 text-neutral-400 hover:text-white hover:bg-indigo-600/10"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <span className="font-medium text-white">Create Blank Project</span>
              <p className="text-[10px] text-neutral-400">Manual project setup</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <Separator className="w-6 mb-3 bg-neutral-800" />

        {/* View Switchers */}
        <div className="flex flex-col gap-1.5 w-full items-center">
          {/* Kanban Board View */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={viewLayout === 'board' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => onChangeViewLayout('board')}
                className={`w-9 h-9 rounded-lg transition-all ${
                  viewLayout === 'board'
                    ? 'bg-neutral-800 text-indigo-400 shadow-xs border border-neutral-700'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <span>Kanban Board</span>
              <p className="text-[10px] text-neutral-400">Card flow view</p>
            </TooltipContent>
          </Tooltip>

          {/* Tree View */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={viewLayout === 'tree' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => onChangeViewLayout('tree')}
                className={`w-9 h-9 rounded-lg transition-all ${
                  viewLayout === 'tree'
                    ? 'bg-neutral-800 text-indigo-400 shadow-xs border border-neutral-700'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <FolderTree className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <span>Feature Tree</span>
              <p className="text-[10px] text-neutral-400">Hierarchical breakdown</p>
            </TooltipContent>
          </Tooltip>

          {/* Code Files Explorer View */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={viewLayout === 'files' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => onChangeViewLayout('files')}
                className={`w-9 h-9 rounded-lg transition-all ${
                  viewLayout === 'files'
                    ? 'bg-neutral-800 text-indigo-400 shadow-xs border border-neutral-700'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <FileCode className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <span>Codebase Explorer</span>
              <p className="text-[10px] text-neutral-400">Linked source code & editor</p>
            </TooltipContent>
          </Tooltip>

          {/* AI Prompts View */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={viewLayout === 'ai' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => onChangeViewLayout('ai')}
                className={`w-9 h-9 rounded-lg transition-all ${
                  viewLayout === 'ai'
                    ? 'bg-neutral-800 text-indigo-400 shadow-xs border border-neutral-700'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Sparkles className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <span>AI Prompt Generator</span>
              <p className="text-[10px] text-neutral-400">Task-to-prompt console</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Bottom Rail Actions */}
        <div className="mt-auto flex flex-col items-center gap-2">
          {/* Storage Indicator */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-emerald-400/80 hover:text-emerald-300 transition-colors">
                <HardDrive className="w-4 h-4" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              <span className="font-semibold text-emerald-400">Portable Storage</span>
              <p className="text-[10px] text-neutral-400">Saved locally in ./data/projects.json</p>
            </TooltipContent>
          </Tooltip>

          {onOpenSettings && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onOpenSettings}
                  className="w-8 h-8 rounded-lg text-neutral-500 hover:text-neutral-300"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <span>Workspace Settings</span>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
};
