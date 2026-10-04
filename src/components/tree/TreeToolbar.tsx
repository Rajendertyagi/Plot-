import React from 'react';
import {
  ArrowDownUp,
  ChevronsDown,
  ChevronsUp,
  Plus,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { TreeSortMode } from './types';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

interface TreeToolbarProps {
  sortMode: TreeSortMode;
  onSortModeChange: (mode: TreeSortMode) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onOpenNewFeatureModal: () => void;
  featureCount: number;
}

export const TreeToolbar: React.FC<TreeToolbarProps> = ({
  sortMode,
  onSortModeChange,
  onExpandAll,
  onCollapseAll,
  onOpenNewFeatureModal,
  featureCount: _featureCount,
}) => {
  const sortLabels: Record<TreeSortMode, string> = {
    smart: 'Smart (Priority)',
    alphabetical: 'Alphabetical (A-Z)',
    status: 'Status Flow',
  };

  return (
    <div className="px-3 py-1.5 border-b border-neutral-800/60 bg-neutral-900/30 flex items-center justify-between gap-1 text-[11px] shrink-0">
      {/* Left: Sort Mode Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-1.5 px-1.5 py-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors max-w-[150px] truncate"
            title="Sort Tree Items"
          >
            <ArrowDownUp className="w-3 h-3 text-indigo-400 shrink-0" />
            <span className="truncate font-medium">{sortLabels[sortMode]}</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <div className="px-2 py-1 text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">
            Sort Tree Hierarchy
          </div>
          <DropdownMenuItem
            onClick={() => onSortModeChange('smart')}
            className={`text-xs flex items-center justify-between ${
              sortMode === 'smart' ? 'text-indigo-400 font-medium' : ''
            }`}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Smart (Priority & Active)</span>
            </div>
            {sortMode === 'smart' && <CheckCircle2 className="w-3.5 h-3.5" />}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onSortModeChange('status')}
            className={`text-xs flex items-center justify-between ${
              sortMode === 'status' ? 'text-indigo-400 font-medium' : ''
            }`}
          >
            <span>Kanban Status Flow</span>
            {sortMode === 'status' && <CheckCircle2 className="w-3.5 h-3.5" />}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onSortModeChange('alphabetical')}
            className={`text-xs flex items-center justify-between ${
              sortMode === 'alphabetical' ? 'text-indigo-400 font-medium' : ''
            }`}
          >
            <span>Alphabetical (A-Z)</span>
            {sortMode === 'alphabetical' && <CheckCircle2 className="w-3.5 h-3.5" />}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Right Controls: Expand All, Collapse All, Add Feature */}
      <div className="flex items-center gap-0.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onExpandAll}
              className="h-6 w-6 text-neutral-400 hover:text-white"
            >
              <ChevronsDown className="w-3 h-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Expand All</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onCollapseAll}
              className="h-6 w-6 text-neutral-400 hover:text-white"
            >
              <ChevronsUp className="w-3 h-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Collapse All</TooltipContent>
        </Tooltip>

        <span className="w-px h-3 bg-neutral-800 mx-0.5" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onOpenNewFeatureModal}
              className="h-6 w-6 text-neutral-400 hover:text-indigo-400"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Add Feature</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};
