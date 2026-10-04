import React, { useState } from 'react';
import {
  Folder,
  FolderOpen,
  FileCode,
  FileText,
  FileJson,
  FileSpreadsheet,
  File,
  ChevronRight,
  ChevronDown,
  Search,
  RotateCw,
  Plus,
  FilePlus,
  FolderPlus,
} from 'lucide-react';
import { FileNode } from '../../types';

interface FileTreeProps {
  tree: FileNode[];
  selectedFilePath: string | null;
  onSelectFile: (file: FileNode) => void;
  onRefresh: () => void;
  rootPath: string;
  onCreateItem?: (parentDir: string, isDirectory: boolean) => void;
}

function getFileIcon(extension?: string) {
  const ext = extension?.toLowerCase();
  switch (ext) {
    case '.ts':
    case '.tsx':
    case '.js':
    case '.jsx':
      return <FileCode className="h-3.5 w-3.5 text-sky-400 shrink-0" />;
    case '.json':
      return <FileJson className="h-3.5 w-3.5 text-amber-400 shrink-0" />;
    case '.css':
    case '.scss':
    case '.html':
      return <FileCode className="h-3.5 w-3.5 text-teal-400 shrink-0" />;
    case '.md':
    case '.txt':
      return <FileText className="h-3.5 w-3.5 text-zinc-300 shrink-0" />;
    case '.py':
      return <FileCode className="h-3.5 w-3.5 text-emerald-400 shrink-0" />;
    case '.csv':
      return <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400 shrink-0" />;
    default:
      return <File className="h-3.5 w-3.5 text-zinc-400 shrink-0" />;
  }
}

function formatBytes(bytes?: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

interface TreeNodeProps {
  node: FileNode;
  selectedFilePath: string | null;
  onSelectFile: (file: FileNode) => void;
  depth?: number;
  filterText: string;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  node,
  selectedFilePath,
  onSelectFile,
  depth = 0,
  filterText,
}) => {
  const [isOpen, setIsOpen] = useState(depth === 0);

  // If node matches filter or any child matches filter
  const matchesSelf = node.name.toLowerCase().includes(filterText.toLowerCase());
  const hasMatchingChildren = (n: FileNode): boolean => {
    if (!n.children) return false;
    return n.children.some(
      (child) =>
        child.name.toLowerCase().includes(filterText.toLowerCase()) ||
        hasMatchingChildren(child)
    );
  };

  const matchesFilter = !filterText || matchesSelf || hasMatchingChildren(node);
  if (!matchesFilter) return null;

  // Auto-expand folder if filtering
  const effectiveIsOpen = filterText ? true : isOpen;

  if (node.isDirectory) {
    return (
      <div className="select-none">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          style={{ paddingLeft: `${depth * 14 + 8}px` }}
          className="w-full flex items-center gap-1.5 py-1 pr-2 text-xs text-zinc-300 hover:text-white hover:bg-white/[0.04] transition-colors rounded-sm group text-left"
        >
          {effectiveIsOpen ? (
            <ChevronDown className="h-3 w-3 text-zinc-500 group-hover:text-zinc-300 shrink-0" />
          ) : (
            <ChevronRight className="h-3 w-3 text-zinc-500 group-hover:text-zinc-300 shrink-0" />
          )}
          {effectiveIsOpen ? (
            <FolderOpen className="h-3.5 w-3.5 text-amber-300/80 shrink-0" />
          ) : (
            <Folder className="h-3.5 w-3.5 text-amber-400/70 shrink-0" />
          )}
          <span className="truncate font-mono text-[11px] font-medium">{node.name}</span>
        </button>

        {effectiveIsOpen && node.children && (
          <div className="border-l border-white/[0.06] ml-3.5">
            {node.children.map((child) => (
              <TreeNode
                key={child.path}
                node={child}
                selectedFilePath={selectedFilePath}
                onSelectFile={onSelectFile}
                depth={depth + 1}
                filterText={filterText}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  const isSelected = selectedFilePath === node.path;

  return (
    <button
      type="button"
      onClick={() => onSelectFile(node)}
      style={{ paddingLeft: `${depth * 14 + 18}px` }}
      className={`w-full flex items-center justify-between py-1 pr-2 text-xs transition-colors rounded-sm group text-left ${
        isSelected
          ? 'bg-sky-500/15 text-sky-200 font-medium'
          : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
      }`}
    >
      <div className="flex items-center gap-1.5 truncate">
        {getFileIcon(node.extension)}
        <span className="truncate font-mono text-[11px]">{node.name}</span>
      </div>
      <span className="text-[10px] font-mono text-zinc-600 group-hover:text-zinc-500 shrink-0 ml-1">
        {formatBytes(node.size)}
      </span>
    </button>
  );
};

export const FileTree: React.FC<FileTreeProps> = ({
  tree,
  selectedFilePath,
  onSelectFile,
  onRefresh,
  rootPath,
}) => {
  const [filterText, setFilterText] = useState('');

  return (
    <div className="flex flex-col h-full bg-[#111113] border-r border-white/[0.06] select-none">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.06] bg-white/[0.02]">
        <div className="flex items-center gap-1.5 min-w-0">
          <Folder className="h-3.5 w-3.5 text-sky-400 shrink-0" />
          <span className="text-xs font-semibold text-zinc-200 uppercase tracking-wider text-[10px]">
            Files & Folders
          </span>
        </div>
        <button
          onClick={onRefresh}
          className="p-1 rounded-sm text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.05] transition-colors"
          title="Reload tree from disk"
        >
          <RotateCw className="h-3 w-3" />
        </button>
      </div>

      {/* Filter Search */}
      <div className="p-2 border-b border-white/[0.04]">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-500" />
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Search files..."
            className="w-full pl-7 pr-2 py-1 rounded bg-black/30 border border-white/[0.06] text-[11px] font-mono text-zinc-200 placeholder:text-zinc-600 focus:outline-hidden focus:border-white/20"
          />
        </div>
      </div>

      {/* Scrollable Tree View */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-1.5 space-y-0.5">
        {tree.length === 0 ? (
          <div className="py-8 text-center text-[11px] text-zinc-500 font-mono">
            No files found in directory.
          </div>
        ) : (
          tree.map((node) => (
            <TreeNode
              key={node.path}
              node={node}
              selectedFilePath={selectedFilePath}
              onSelectFile={onSelectFile}
              filterText={filterText}
            />
          ))
        )}
      </div>

      {/* Directory summary at bottom of tree */}
      <div className="px-3 py-1.5 border-t border-white/[0.04] bg-white/[0.01] text-[10px] font-mono text-zinc-500 truncate" title={rootPath}>
        root: {rootPath}
      </div>
    </div>
  );
};
