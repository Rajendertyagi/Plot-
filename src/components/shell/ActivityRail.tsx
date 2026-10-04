import React from 'react';
import {
  ListTodo,
  FolderGit2,
  SlidersHorizontal,
  Download,
  PanelLeftClose,
  PanelLeftOpen,
  FolderSearch,
} from 'lucide-react';

interface ActivityRailProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  isRepoDockOpen: boolean;
  onToggleRepoDock: () => void;
  onOpenColumnManager: () => void;
  onOpenDirectoryFinder: () => void;
  exportUrl?: string;
}

export const ActivityRail: React.FC<ActivityRailProps> = ({
  isSidebarOpen,
  onToggleSidebar,
  isRepoDockOpen,
  onToggleRepoDock,
  onOpenColumnManager,
  onOpenDirectoryFinder,
  exportUrl,
}) => {
  return (
    <aside className="w-12 shrink-0 bg-[#0c0c0e] border-r border-white/[0.06] flex flex-col items-center justify-between py-3 select-none z-20">
      {/* Top Navigation Icons */}
      <div className="flex flex-col items-center gap-2">
        {/* Toggle Sidebar */}
        <button
          onClick={onToggleSidebar}
          className={`h-9 w-9 rounded-xl flex items-center justify-center transition-colors ${
            isSidebarOpen
              ? 'text-white hover:bg-white/[0.08]'
              : 'text-zinc-500 hover:text-white hover:bg-white/[0.06]'
          }`}
          title="Toggle Project Sidebar (Cmd+B)"
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="h-4 w-4" />
          ) : (
            <PanelLeftOpen className="h-4 w-4" />
          )}
        </button>

        <div className="w-5 h-px bg-white/[0.08] my-1" />

        {/* Tasks & Features Rail Button */}
        <button
          onClick={() => {
            if (isRepoDockOpen) onToggleRepoDock();
          }}
          className={`h-9 w-9 rounded-xl flex items-center justify-center transition-colors ${
            !isRepoDockOpen
              ? 'bg-white/[0.1] text-white shadow-xs'
              : 'text-zinc-500 hover:text-white hover:bg-white/[0.06]'
          }`}
          title="Task Roadmap & Features"
        >
          <ListTodo className="h-4 w-4" />
        </button>

        {/* Code Repository Dock Button */}
        <button
          onClick={onToggleRepoDock}
          className={`h-9 w-9 rounded-xl flex items-center justify-center transition-colors ${
            isRepoDockOpen
              ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
              : 'text-zinc-500 hover:text-white hover:bg-white/[0.06]'
          }`}
          title="Repository CodeMirror Explorer (Cmd+J)"
        >
          <FolderGit2 className="h-4 w-4" />
        </button>

        {/* Directory Finder Modal Trigger */}
        <button
          onClick={onOpenDirectoryFinder}
          className="h-9 w-9 rounded-xl flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-colors"
          title="Browse & Locate System Directory"
        >
          <FolderSearch className="h-4 w-4" />
        </button>
      </div>

      {/* Bottom Utility Icons */}
      <div className="flex flex-col items-center gap-2">
        {/* Export JSON */}
        {exportUrl && (
          <a
            href={exportUrl}
            download="projects.json"
            className="h-9 w-9 rounded-xl flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-colors"
            title="Download JSON Database"
          >
            <Download className="h-4 w-4" />
          </a>
        )}

        {/* Column & Status Settings */}
        <button
          onClick={onOpenColumnManager}
          className="h-9 w-9 rounded-xl flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-colors"
          title="Status Columns Configuration"
        >
          <SlidersHorizontal className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
};
