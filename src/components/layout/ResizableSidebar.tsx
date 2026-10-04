import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Folder,
  Search,
  MoreVertical,
  Edit2,
  X,
  FolderSearch,
  Plus,
} from 'lucide-react';
import { Project, Feature, Task } from '../../types';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { TooltipProvider } from '../ui/tooltip';
import { TreeView } from '../tree';

interface ResizableSidebarProps {
  project: Project | null;
  features: Feature[];
  tasks: Task[];
  activeFeatureId: string | null;
  onSelectFeature: (featureId: string | null) => void;
  onSelectTask?: (taskId: string) => void;
  onOpenNewFeatureModal: () => void;
  onEditFeature: (feature: Feature) => void;
  onDeleteFeature: (featureId: string) => void;
  onEditProject?: (project: Project) => void;
  onOpenFolderFinder?: () => void;
  onOpenCreateProject?: () => void;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

const MIN_WIDTH = 250;
const MAX_WIDTH = 580;
const DEFAULT_WIDTH = 300;

export const ResizableSidebar: React.FC<ResizableSidebarProps> = ({
  project,
  features,
  tasks,
  activeFeatureId,
  onSelectFeature,
  onSelectTask,
  onOpenNewFeatureModal,
  onEditFeature,
  onDeleteFeature,
  onEditProject,
  onOpenFolderFinder,
  onOpenCreateProject,
  onToggleSubtask,
  searchQuery,
  onSearchChange,
}) => {
  const [width, setWidth] = useState<number>(() => {
    const saved = localStorage.getItem('projectflow_sidebar_width');
    return saved ? Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, parseInt(saved, 10))) : DEFAULT_WIDTH;
  });
  const [isResizing, setIsResizing] = useState(false);

  const isResizingRef = useRef(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Global keyboard shortcut ('/' or 'Cmd+F' / 'Ctrl+F') to focus search box
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        if (e.key === 'Escape' && e.target === searchInputRef.current) {
          onSearchChange('');
          searchInputRef.current?.blur();
        }
        return;
      }

      if (e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'f')) {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSearchChange]);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizingRef.current = true;
    setIsResizing(true);

    const startX = e.clientX;
    const startWidth = width;

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!isResizingRef.current) return;
      const delta = moveEvent.clientX - startX;
      const newWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, startWidth + delta));
      setWidth(newWidth);
    };

    const onMouseUp = () => {
      isResizingRef.current = false;
      setIsResizing(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, [width]);

  // Double-click splitter to toggle between standard and wide
  const handleSplitterDoubleClick = () => {
    setWidth((prev) => (prev > 340 ? DEFAULT_WIDTH : 440));
  };

  useEffect(() => {
    localStorage.setItem('projectflow_sidebar_width', width.toString());
  }, [width]);

  // Fast matching preview count
  const query = searchQuery.trim().toLowerCase();
  const projectTasks = tasks.filter((t) => t.projectId === project?.id);
  const projectFeatures = features.filter((f) => f.projectId === project?.id);

  const matchingCount = query
    ? projectTasks.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query) ||
          t.linkedFiles?.some((f) => f.toLowerCase().includes(query)) ||
          t.subtasks?.some((s) => s.title.toLowerCase().includes(query))
      ).length +
      projectFeatures.filter((f) => f.title.toLowerCase().includes(query)).length
    : 0;

  return (
    <TooltipProvider delayDuration={250}>
      <aside
        style={{ width: `${width}px` }}
        className="relative h-full flex flex-col bg-neutral-900/60 border-r border-neutral-800/80 shrink-0 select-none overflow-hidden transition-[width] duration-75"
      >
        {/* 1. Topmost Full-Width Unified Search Box (h-11 matching header) */}
        <div className="h-11 w-full bg-neutral-950 border-b border-neutral-800/80 px-3 flex items-center gap-2 shrink-0 select-none">
          <Search className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search tree, tasks, files... (/)"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                onSearchChange('');
                searchInputRef.current?.blur();
              }
            }}
            className="flex-1 h-full bg-transparent border-0 text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-0 min-w-0"
          />

          {/* Right Controls: Match Count, Clear (X), or '/' Shortcut */}
          {searchQuery ? (
            <div className="flex items-center gap-1.5 shrink-0">
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded border tabular-nums ${
                  matchingCount > 0
                    ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-500'
                }`}
                title={`${matchingCount} matches`}
              >
                {matchingCount} {matchingCount === 1 ? 'match' : 'matches'}
              </span>

              <button
                type="button"
                onClick={() => {
                  onSearchChange('');
                  searchInputRef.current?.focus();
                }}
                className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                title="Clear search (Esc)"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <kbd className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-[10px] font-mono text-neutral-500 shrink-0 pointer-events-none">
              /
            </kbd>
          )}
        </div>

        {/* 2. Project Context Row: Placed directly below the topmost search bar */}
        <div className="px-3 py-2 bg-neutral-900/40 border-b border-neutral-800/70 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Folder className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <div className="min-w-0 flex-1">
              <h3 className="text-xs font-semibold text-neutral-100 truncate" title={project?.title || 'No Project'}>
                {project?.title || 'Select a Project'}
              </h3>
              {project?.rootDirectory && (
                <p className="text-[10px] text-neutral-400 font-mono truncate" title={project.rootDirectory}>
                  {project.rootDirectory}
                </p>
              )}
            </div>
          </div>

          {project && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" className="h-6 w-6 text-neutral-400 hover:text-white shrink-0">
                  <MoreVertical className="w-3.5 h-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                {onEditProject && (
                  <DropdownMenuItem onClick={() => onEditProject(project)} className="text-xs cursor-pointer">
                    <Edit2 className="w-3.5 h-3.5 mr-2" />
                    Edit Project Settings
                  </DropdownMenuItem>
                )}
                {onOpenFolderFinder && (
                  <DropdownMenuItem onClick={onOpenFolderFinder} className="text-xs text-sky-400 hover:text-sky-300 cursor-pointer">
                    <FolderSearch className="w-3.5 h-3.5 mr-2 text-sky-400" />
                    Open Folder in Finder...
                  </DropdownMenuItem>
                )}
                {onOpenCreateProject && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onOpenCreateProject} className="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer">
                      <Plus className="w-3.5 h-3.5 mr-2" />
                      New Blank Project...
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* 3. Modular Hierarchical Tree View with Linked Elements */}
        <TreeView
          project={project}
          features={features}
          tasks={tasks}
          activeFeatureId={activeFeatureId}
          onSelectFeature={onSelectFeature}
          onSelectTask={onSelectTask}
          onOpenNewFeatureModal={onOpenNewFeatureModal}
          onEditFeature={onEditFeature}
          onDeleteFeature={onDeleteFeature}
          onToggleSubtask={onToggleSubtask}
          searchQuery={searchQuery}
        />

        {/* 4. Draggable Splitter Handle on Right Border */}
        <div
          onMouseDown={startResizing}
          onDoubleClick={handleSplitterDoubleClick}
          className={`absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-indigo-500/60 active:bg-indigo-500 transition-colors z-20 ${
            isResizing ? 'bg-indigo-500' : 'bg-transparent'
          }`}
          title="Drag to resize sidebar (Double-click to reset)"
        />
      </aside>
    </TooltipProvider>
  );
};
