import React, { useState, useEffect } from 'react';
import { ActivityRail } from './ActivityRail';
import { StatusBar } from './StatusBar';
import { RepoExplorer } from '../explorer/RepoExplorer';
import { Project, ViewLayout } from '../../types';

interface AppShellProps {
  currentProject: Project | null;
  projects: Project[];
  header: React.ReactNode;
  sidebar: React.ReactNode;
  children: React.ReactNode;
  onUpdateRootDirectory: (newPath: string) => void;
  onOpenDirectoryFinder: () => void;
  onOpenColumnManager: () => void;
  isSaving: boolean;
  viewLayout: ViewLayout;
  exportUrl?: string;
}

export const AppShell: React.FC<AppShellProps> = ({
  currentProject,
  projects,
  header,
  sidebar,
  children,
  onUpdateRootDirectory,
  onOpenDirectoryFinder,
  onOpenColumnManager,
  isSaving,
  viewLayout,
  exportUrl,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isRepoDockOpen, setIsRepoDockOpen] = useState(false);

  // Keyboard shortcuts Cmd+B (sidebar) and Cmd+J (bottom code dock)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsSidebarOpen((prev) => !prev);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        setIsRepoDockOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const rootDir = currentProject?.rootDirectory || '.';
  const projectName = currentProject?.title || 'No Project';

  return (
    <div className="h-screen w-screen bg-[#0d0d0d] text-zinc-100 flex flex-col font-sans overflow-hidden select-none">
      {/* Top Header */}
      {header}

      {/* Middle Workspace: Activity Rail + Collapsible Sidebar + Main Viewport */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Leftmost Slim Activity Rail */}
        <ActivityRail
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          isRepoDockOpen={isRepoDockOpen}
          onToggleRepoDock={() => setIsRepoDockOpen((prev) => !prev)}
          onOpenColumnManager={onOpenColumnManager}
          onOpenDirectoryFinder={onOpenDirectoryFinder}
          exportUrl={exportUrl}
        />

        {/* Collapsible Primary Project Sidebar */}
        {isSidebarOpen && (
          <div className="w-64 shrink-0 h-full border-r border-white/[0.06] bg-[#111113] overflow-hidden flex flex-col transition-all">
            {sidebar}
          </div>
        )}

        {/* Main Content Area + Bottom Code Dock */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-[#0d0d0d]">
          {/* Main Viewport (Tasks & Features) */}
          <main className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            {children}
          </main>

          {/* Bottom Dock: CodeMirror Repository Explorer */}
          <RepoExplorer
            rootDirectory={rootDir}
            projectName={projectName}
            onUpdateRootDirectory={onUpdateRootDirectory}
            isOpen={isRepoDockOpen}
            onToggleOpen={() => setIsRepoDockOpen(false)}
          />
        </div>
      </div>

      {/* IDE Bottom Status Bar */}
      <StatusBar
        rootDirectory={rootDir}
        projectName={projectName}
        isSaving={isSaving}
        viewLayout={viewLayout}
        isRepoDockOpen={isRepoDockOpen}
        onToggleRepoDock={() => setIsRepoDockOpen((prev) => !prev)}
        onOpenDirectoryFinder={onOpenDirectoryFinder}
      />
    </div>
  );
};
