import React, { useState, useEffect, useCallback } from 'react';
import {
  FolderGit2,
  FolderSearch,
  Maximize2,
  Minimize2,
  ChevronDown,
  ChevronUp,
  RotateCw,
  X,
  Code2,
  AlertCircle,
} from 'lucide-react';
import { FileTree } from './FileTree';
import { CodeEditorPane } from './CodeEditorPane';
import { DirectoryPickerModal } from '../common/DirectoryPickerModal';
import { fsApi } from '../../services/fsApi';
import { FileNode } from '../../types';

interface RepoExplorerProps {
  rootDirectory: string;
  projectName: string;
  onUpdateRootDirectory: (newPath: string) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export const RepoExplorer: React.FC<RepoExplorerProps> = ({
  rootDirectory,
  projectName,
  onUpdateRootDirectory,
  isOpen,
  onToggleOpen,
}) => {
  const [tree, setTree] = useState<FileNode[]>([]);
  const [effectiveRoot, setEffectiveRoot] = useState(rootDirectory || '.');
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFinderOpen, setIsFinderOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  // Load directory tree
  const loadTree = useCallback(async (dirPath: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fsApi.fetchFileTree(dirPath);
      setTree(data.tree);
      setEffectiveRoot(data.rootPath);
    } catch (err: any) {
      setError(err.message || 'Failed to read repository directory tree');
      setTree([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadTree(rootDirectory || '.');
    }
  }, [isOpen, rootDirectory, loadTree]);

  if (!isOpen) return null;

  return (
    <div
      className={`border-t border-white/[0.08] bg-[#111113] flex flex-col transition-all duration-200 shadow-2xl z-30 ${
        isMaximized
          ? 'fixed inset-0 top-12 z-40 h-[calc(100vh-48px)]'
          : 'h-[440px] max-h-[75vh]'
      }`}
    >
      {/* Dock Bar / Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06] bg-[#161618] select-none shrink-0">
        {/* Left: Project & Directory Information */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-6 w-6 rounded-md bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <Code2 className="h-3.5 w-3.5" />
          </div>
          <div className="flex items-center gap-2 truncate">
            <span className="text-xs font-semibold text-white truncate">
              {projectName} Repository
            </span>
            <span className="text-zinc-600">•</span>
            <span
              className="text-[11px] font-mono text-zinc-400 hover:text-white cursor-pointer truncate max-w-xs transition-colors"
              onClick={() => setIsFinderOpen(true)}
              title="Click to change directory"
            >
              {effectiveRoot}
            </span>
          </div>

          <button
            onClick={() => setIsFinderOpen(true)}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 hover:text-white transition-colors"
            title="Browse and select another directory"
          >
            <FolderSearch className="h-3 w-3 text-sky-400" />
            <span>Change Dir</span>
          </button>
        </div>

        {/* Right: Window Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => loadTree(effectiveRoot)}
            disabled={loading}
            className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            title="Refresh File Tree"
          >
            <RotateCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            title={isMaximized ? 'Restore dock height' : 'Maximize code workspace'}
          >
            {isMaximized ? (
              <Minimize2 className="h-3.5 w-3.5" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" />
            )}
          </button>

          <button
            onClick={onToggleOpen}
            className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            title="Close code workspace (Cmd+J)"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Dual-Pane Body */}
      {error ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3 bg-[#0d0d0f]">
          <div className="p-3 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div className="max-w-md space-y-1">
            <p className="text-xs font-semibold text-rose-300">Cannot load directory</p>
            <p className="text-[11px] font-mono text-zinc-400">{error}</p>
          </div>
          <button
            onClick={() => setIsFinderOpen(true)}
            className="px-4 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] text-xs font-medium text-white transition-colors"
          >
            Pick a valid directory...
          </button>
        </div>
      ) : (
        <div className="flex-1 flex overflow-hidden">
          {/* Left Pane: File Tree (280px width) */}
          <div className="w-72 shrink-0 h-full">
            <FileTree
              tree={tree}
              selectedFilePath={selectedFile?.path || null}
              onSelectFile={(file) => setSelectedFile(file)}
              onRefresh={() => loadTree(effectiveRoot)}
              rootPath={effectiveRoot}
            />
          </div>

          {/* Right Pane: CodeMirror Editor */}
          <div className="flex-1 h-full min-w-0">
            <CodeEditorPane
              selectedFile={selectedFile}
              onFileSaved={() => loadTree(effectiveRoot)}
            />
          </div>
        </div>
      )}

      {/* Directory Finder Modal */}
      <DirectoryPickerModal
        isOpen={isFinderOpen}
        initialDirectory={effectiveRoot}
        onClose={() => setIsFinderOpen(false)}
        onSelectDirectory={(selectedPath) => {
          setEffectiveRoot(selectedPath);
          onUpdateRootDirectory(selectedPath);
          loadTree(selectedPath);
        }}
        title="Change Repository Directory"
      />
    </div>
  );
};
