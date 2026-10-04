import React, { useState, useEffect } from 'react';
import { StatusBar } from './StatusBar';
import { RepoExplorer } from '../explorer/RepoExplorer';
import { Project, ViewLayout } from '../../types';

interface AppShellProps {
  currentProject: Project | null;
  projects: Project[];
  activityRail: React.ReactNode;
  sidebar: React.ReactNode;
  header: React.ReactNode;
  children: React.ReactNode;
  onUpdateRootDirectory: (newPath: string) => void;
  onOpenDirectoryFinder: () => void;
  onOpenColumnManager: () => void;
  isSaving: boolean;
  viewLayout: ViewLayout;
  exportUrl?: string;
  isSidebarOpen?: boolean;
}

export const AppShell: React.FC<AppShellProps> = ({
  currentProject,
  projects: _projects,
  activityRail,
  sidebar,
  header,
  children,
  onUpdateRootDirectory,
  onOpenDirectoryFinder,
  onOpenColumnManager: _onOpenColumnManager,
  isSaving,
  viewLayout,
  exportUrl: _exportUrl,
  isSidebarOpen = true,
}) => {
  const [isRepoDockOpen, setIsRepoDockOpen] = useState(false);

  // Keyboard shortcut Cmd+J to toggle bottom code dock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') {
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
    <div className="h-screen w-screen bg-neutral-950 text-neutral-100 flex flex-row font-sans overflow-hidden select-none">
      {/* 1. Full-Height Activity Rail on Far Left */}
      {activityRail}

      {/* 2. Resizable Tree/Explorer Sidebar Panel */}
      {isSidebarOpen && sidebar}

      {/* 3. Main Workspace Area: Compact Header + Main Viewport + Bottom Dock + Status Bar */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 h-full bg-neutral-950">
        {/* Compact Header */}
        {header}

        {/* Viewport Content */}
        <main className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-6 w-full max-w-[1600px] mx-auto">
          {children}
        </main>

        {/* Bottom Dock: CodeMirror Repository Explorer */}
        <RepoExplorer
          rootDirectory={rootDir}
          projectName={projectName}
          onUpdateRootDirectory={onUpdateRootDirectory}
          isOpen={isRepoDockOpen || viewLayout === 'files'}
          onToggleOpen={() => setIsRepoDockOpen(false)}
        />

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
    </div>
  );
};
