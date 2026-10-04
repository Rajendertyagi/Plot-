import React, { useState, useEffect } from 'react';
import {
  X,
  Folder,
  FolderOpen,
  ArrowUp,
  RotateCw,
  Check,
  HardDrive,
  FolderGit2,
  AlertCircle,
  Search,
} from 'lucide-react';
import { fsApi } from '../../services/fsApi';
import { BrowseDirectoryResult } from '../../types';

interface DirectoryPickerModalProps {
  isOpen: boolean;
  initialDirectory?: string;
  onClose: () => void;
  onSelectDirectory: (selectedPath: string) => void;
  title?: string;
}

export const DirectoryPickerModal: React.FC<DirectoryPickerModalProps> = ({
  isOpen,
  initialDirectory,
  onClose,
  onSelectDirectory,
  title = 'Select Project Directory',
}) => {
  const [currentPath, setCurrentPath] = useState(initialDirectory || '');
  const [pathInput, setPathInput] = useState(initialDirectory || '');
  const [browseData, setBrowseData] = useState<BrowseDirectoryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterText, setFilterText] = useState('');

  const loadDirectory = async (targetDir?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fsApi.browseDirectory(targetDir);
      setBrowseData(data);
      setCurrentPath(data.currentPath);
      setPathInput(data.currentPath);
    } catch (err: any) {
      setError(err.message || 'Failed to open directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadDirectory(initialDirectory || undefined);
      setFilterText('');
    }
  }, [isOpen, initialDirectory]);

  if (!isOpen) return null;

  const handleNavigateUp = () => {
    if (browseData?.parentPath) {
      loadDirectory(browseData.parentPath);
    }
  };

  const handleSelectSubdir = (dirName: string) => {
    if (!currentPath) return;
    const separator = currentPath.endsWith('/') || currentPath.endsWith('\\') ? '' : '/';
    const nextPath = `${currentPath}${separator}${dirName}`;
    loadDirectory(nextPath);
  };

  const handleManualPathSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pathInput.trim()) {
      loadDirectory(pathInput.trim());
    }
  };

  const handleConfirm = () => {
    if (currentPath) {
      onSelectDirectory(currentPath);
      onClose();
    }
  };

  const filteredDirs = (browseData?.directories || []).filter((d) =>
    d.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-[#141414] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <FolderGit2 className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white tracking-tight">{title}</h2>
              <p className="text-xs text-zinc-400">
                Browse or enter a local repository folder to link with this project
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Path Bar & Quick Bookmarks */}
        <div className="p-4 space-y-3 bg-[#111111] border-b border-white/[0.06]">
          {/* Path Form Input */}
          <form onSubmit={handleManualPathSubmit} className="flex items-center gap-2">
            <div className="relative flex-1">
              <HardDrive className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
              <input
                type="text"
                value={pathInput}
                onChange={(e) => setPathInput(e.target.value)}
                placeholder="/path/to/your/project"
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-black/40 border border-white/[0.08] text-xs font-mono text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden focus:border-white/30 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] text-zinc-200 text-xs font-medium transition-colors"
            >
              Go
            </button>
          </form>

          {/* Navigation Controls & Bookmarks */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleNavigateUp}
                disabled={!browseData?.parentPath || loading}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                title="Go up to parent directory"
              >
                <ArrowUp className="h-3.5 w-3.5" />
                <span>Up</span>
              </button>
              <button
                type="button"
                onClick={() => loadDirectory(currentPath)}
                disabled={loading}
                className="p-1 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 transition-colors"
                title="Refresh folder contents"
              >
                <RotateCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Quick shortcuts */}
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
              <span>Quick:</span>
              <button
                type="button"
                onClick={() => loadDirectory('.')}
                className="px-2 py-0.5 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white"
              >
                Workspace Root
              </button>
              <button
                type="button"
                onClick={() => loadDirectory('/workspace')}
                className="px-2 py-0.5 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white"
              >
                /workspace
              </button>
            </div>
          </div>
        </div>

        {/* Directory Explorer Pane */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[220px]">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Directory Filter */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Filter subfolders..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-black/20 border border-white/[0.05] text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-hidden focus:border-white/20"
            />
          </div>

          {/* Subdirectories Grid/List */}
          <div className="space-y-1">
            <div className="text-[11px] font-mono text-zinc-500 px-1">
              Subdirectories in: <span className="text-zinc-300">{currentPath}</span>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-zinc-500 flex items-center justify-center gap-2">
                <RotateCw className="h-3.5 w-3.5 animate-spin" />
                <span>Reading directory contents...</span>
              </div>
            ) : filteredDirs.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-500 border border-dashed border-white/[0.06] rounded-xl">
                No matching subdirectories found
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-[240px] overflow-y-auto p-1">
                {filteredDirs.map((dirName) => {
                  const separator = currentPath.endsWith('/') || currentPath.endsWith('\\') ? '' : '/';
                  const fullSubdirPath = `${currentPath}${separator}${dirName}`;
                  return (
                    <div
                      key={dirName}
                      className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.07] border border-white/[0.03] hover:border-white/[0.1] text-left transition-colors group"
                    >
                      <button
                        type="button"
                        onClick={() => handleSelectSubdir(dirName)}
                        className="flex items-center gap-2 flex-1 min-w-0 text-left"
                        title={`Open folder ${dirName}`}
                      >
                        <Folder className="h-4 w-4 text-sky-400 shrink-0 group-hover:scale-105 transition-transform" />
                        <span className="text-xs text-zinc-300 group-hover:text-white truncate">
                          {dirName}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectDirectory(fullSubdirPath);
                          onClose();
                        }}
                        className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/[0.08] hover:bg-white text-zinc-300 hover:text-black transition-colors shrink-0"
                        title={`Select "${dirName}" as project folder`}
                      >
                        Select
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-white/[0.06] bg-[#111111]">
          <div className="text-[11px] font-mono text-zinc-400 truncate max-w-sm">
            Selected: <span className="text-sky-300">{currentPath || 'None'}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!currentPath || loading}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-semibold shadow-xs disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Select Current Folder</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
