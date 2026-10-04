import React from 'react';
import {
  ChevronRight,
  ChevronDown,
  FolderTree,
  FileCode,
  CheckSquare,
  Square,
  MoreVertical,
  Edit2,
  Trash2,
  Copy,
  Check,
} from 'lucide-react';
import { TreeNode, TreeSelection } from './types';
import { Feature, Task, Subtask } from '../../types';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface TreeNodeItemProps {
  node: TreeNode;
  expandedMap: Record<string, boolean>;
  onToggleExpand: (id: string) => void;
  selection: TreeSelection;
  onSelectNode: (node: TreeNode) => void;
  onEditFeature?: (feature: Feature) => void;
  onDeleteFeature?: (featureId: string) => void;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
}

export const TreeNodeItem: React.FC<TreeNodeItemProps> = ({
  node,
  expandedMap,
  onToggleExpand,
  selection,
  onSelectNode,
  onEditFeature,
  onDeleteFeature,
  onToggleSubtask,
}) => {
  const isExpanded = !!expandedMap[node.id];
  const isSelected = selection.nodeId === node.id;
  const [copiedFile, setCopiedFile] = React.useState(false);

  const handleCopyFile = (e: React.MouseEvent, path: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(path);
    setCopiedFile(true);
    setTimeout(() => setCopiedFile(false), 1500);
  };

  const renderNodeIcon = () => {
    switch (node.kind) {
      case 'feature':
        return <FolderTree className="w-3.5 h-3.5 text-indigo-400 shrink-0" />;
      case 'task':
        return (
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: node.statusColor || '#6366f1' }}
          />
        );
      case 'file':
        return <FileCode className="w-3.5 h-3.5 text-sky-400 shrink-0" />;
      case 'subtask':
        return node.isDone ? (
          <CheckSquare className="w-3 h-3 text-emerald-400 shrink-0" />
        ) : (
          <Square className="w-3 h-3 text-neutral-500 shrink-0" />
        );
      default:
        return null;
    }
  };

  return (
    <div className="select-none group/node">
      {/* Node Row */}
      <div
        onClick={() => onSelectNode(node)}
        className={`flex items-center justify-between gap-1.5 px-2 py-1 rounded text-xs cursor-pointer transition-colors ${
          isSelected
            ? 'bg-indigo-600/20 text-indigo-200 font-medium border border-indigo-500/30'
            : 'text-neutral-300 hover:bg-neutral-800/60 hover:text-neutral-100'
        }`}
      >
        {/* Left side: Expander chevron, icon, label */}
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {node.hasChildren ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand(node.id);
              }}
              className="p-0.5 rounded hover:bg-neutral-700/60 text-neutral-400 hover:text-neutral-200 shrink-0"
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </button>
          ) : (
            <span className="w-4 shrink-0" />
          )}

          {renderNodeIcon()}

          <span
            className={`truncate flex-1 font-mono text-[11px] ${
              node.kind === 'feature'
                ? 'font-sans text-xs font-medium text-neutral-100'
                : node.kind === 'file'
                ? 'text-sky-300/90 text-[10px]'
                : node.kind === 'subtask' && node.isDone
                ? 'line-through text-neutral-500'
                : node.isDone
                ? 'line-through text-neutral-500'
                : 'text-neutral-300'
            }`}
            title={node.label}
          >
            {node.label}
          </span>
        </div>

        {/* Right side: Priority badges, counters, actions */}
        <div className="flex items-center gap-1 shrink-0">
          {node.priority && node.priority === 'high' && (
            <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 uppercase">
              High
            </span>
          )}

          {node.badge && (
            <span className="text-[10px] font-mono text-neutral-500 tabular-nums">
              {node.badge}
            </span>
          )}

          {/* Copy path action for file nodes */}
          {node.kind === 'file' && (
            <button
              type="button"
              onClick={(e) =>
                handleCopyFile(e, (node.data as { filePath: string }).filePath)
              }
              className="p-1 rounded opacity-0 group-hover/node:opacity-100 text-neutral-400 hover:text-white transition-opacity"
              title="Copy file path"
            >
              {copiedFile ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
          )}

          {/* Subtask interactive quick toggle */}
          {node.kind === 'subtask' && onToggleSubtask && node.parentId && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleSubtask(node.parentId!, (node.data as Subtask).id);
              }}
              className="p-0.5 rounded opacity-0 group-hover/node:opacity-100 text-neutral-400 hover:text-white transition-opacity text-[10px] font-mono"
            >
              {node.isDone ? 'Undo' : 'Done'}
            </button>
          )}

          {/* Feature 3-dots actions menu */}
          {node.kind === 'feature' && onEditFeature && onDeleteFeature && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="h-5 w-5 opacity-0 group-hover/node:opacity-100 text-neutral-400 hover:text-white"
                >
                  <MoreVertical className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuItem
                  onClick={() => onEditFeature(node.data as Feature)}
                  className="text-xs"
                >
                  <Edit2 className="w-3.5 h-3.5 mr-2" />
                  Edit Feature
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDeleteFeature(node.id)}
                  className="text-xs text-rose-400 hover:text-rose-300"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Children Container with Visual Indentation Guide Rail */}
      {node.hasChildren && isExpanded && node.children && node.children.length > 0 && (
        <div className="border-l border-neutral-800/80 hover:border-neutral-700 ml-3.5 pl-2 my-0.5 space-y-0.5 transition-colors">
          {node.children.map((child) => (
            <TreeNodeItem
              key={child.id}
              node={child}
              expandedMap={expandedMap}
              onToggleExpand={onToggleExpand}
              selection={selection}
              onSelectNode={onSelectNode}
              onEditFeature={onEditFeature}
              onDeleteFeature={onDeleteFeature}
              onToggleSubtask={onToggleSubtask}
            />
          ))}
        </div>
      )}
    </div>
  );
};
