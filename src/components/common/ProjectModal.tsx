import React, { useState, useEffect } from 'react';
import { X, FolderKanban, FolderSearch, HardDrive } from 'lucide-react';
import { Project } from '../../types';
import { DirectoryPickerModal } from './DirectoryPickerModal';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, description: string, rootDirectory?: string) => void;
  initialProject?: Project | null;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialProject,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rootDirectory, setRootDirectory] = useState('.');
  const [isFinderOpen, setIsFinderOpen] = useState(false);

  useEffect(() => {
    if (initialProject) {
      setTitle(initialProject.title);
      setDescription(initialProject.description);
      setRootDirectory(initialProject.rootDirectory || '.');
    } else {
      setTitle('');
      setDescription('');
      setRootDirectory('.');
    }
  }, [initialProject, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit(title.trim(), description.trim(), rootDirectory.trim() || '.');
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
        <div className="w-full max-w-md rounded-2xl bg-[#18181b] border border-white/10 p-6 shadow-2xl shadow-black/90 space-y-5 animate-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-white/[0.08] flex items-center justify-center">
                <FolderKanban className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-base font-semibold text-white">
                {initialProject ? 'Edit Project' : 'Create New Project'}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">
                Project Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Mobile Customer App v2"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-9 rounded-xl border border-transparent bg-white/[0.05] focus:bg-white/[0.08] px-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">
                Description & Objective
              </label>
              <textarea
                rows={3}
                placeholder="High-level goals, target deliverables, architecture overview..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-transparent bg-white/[0.05] focus:bg-white/[0.08] p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all resize-none"
              />
            </div>

            {/* Local Repository Directory with Finder */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-zinc-300">
                  Local Repository Directory
                </label>
                <span className="text-[10px] text-zinc-500 font-mono">Linked Path</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <HardDrive className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                  <input
                    type="text"
                    value={rootDirectory}
                    onChange={(e) => setRootDirectory(e.target.value)}
                    placeholder="e.g. /workspace or ."
                    className="w-full h-9 rounded-xl pl-8 pr-3 text-xs font-mono border border-transparent bg-white/[0.05] focus:bg-white/[0.08] text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setIsFinderOpen(true)}
                  className="flex items-center gap-1.5 h-9 px-3 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-xs font-medium text-zinc-200 transition-colors shrink-0"
                  title="Open Directory Finder"
                >
                  <FolderSearch className="h-3.5 w-3.5 text-sky-400" />
                  <span>Browse...</span>
                </button>
              </div>
              <p className="text-[11px] text-zinc-400">
                Points the bottom CodeMirror explorer to browse and edit this project's real code files.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/[0.06]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-full text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-full bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-medium transition-all shadow-xs"
              >
                {initialProject ? 'Save Changes' : 'Create Project'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <DirectoryPickerModal
        isOpen={isFinderOpen}
        initialDirectory={rootDirectory}
        onClose={() => setIsFinderOpen(false)}
        onSelectDirectory={(selectedPath) => {
          setRootDirectory(selectedPath);
          if (!title.trim() || title === 'New Project') {
            const folderName = selectedPath.replace(/[/\\]+$/, '').split(/[/\\]/).pop();
            if (folderName && folderName !== '.' && folderName !== '..') {
              setTitle(folderName);
            }
          }
        }}
        title="Locate Project Repository Directory"
      />
    </>
  );
};
