/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Project, Feature, Task } from './types';
import { useProjectData } from './hooks/useProjectData';
import { AppShell } from './components/shell/AppShell';
import { Header } from './components/layout/Header';
import { ProjectSidebar } from './components/layout/ProjectSidebar';
import { ProjectOverview } from './components/project/ProjectOverview';
import { ProjectModal } from './components/common/ProjectModal';
import { FeatureModal } from './components/common/FeatureModal';
import { TaskModal } from './components/common/TaskModal';
import { ColumnManagerModal } from './components/common/ColumnManagerModal';
import { DirectoryPickerModal } from './components/common/DirectoryPickerModal';
import { Loader2 } from 'lucide-react';

export default function App() {
  const {
    projects,
    features,
    tasks,
    activeProject,
    activeProjectId,
    setActiveProjectId,
    viewLayout,
    setViewLayout,
    isLoading,
    isSaving,
    handleCreateOrUpdateProject,
    handleUpdateProjectDirectory,
    handleDeleteProject,
    handleCreateOrUpdateFeature,
    handleDeleteFeature,
    handleSaveTask,
    handleUpdateTaskStatus,
    handleToggleSubtask,
    handleAddSubtaskToTask,
    handleDeleteSubtaskFromTask,
    handleDeleteTask,
    handleSaveColumns,
    exportUrl,
  } = useProjectData();

  // Search filter query
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [isFeatureModalOpen, setIsFeatureModalOpen] = useState(false);
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [targetFeatureId, setTargetFeatureId] = useState<string>('');
  const [defaultTaskStatusId, setDefaultTaskStatusId] = useState<string>('pending');

  const [isColumnManagerOpen, setIsColumnManagerOpen] = useState(false);
  const [isDirectoryFinderOpen, setIsDirectoryFinderOpen] = useState(false);

  // Modal open handlers
  const handleOpenAddTask = (featureId: string, statusId?: string) => {
    setEditingTask(null);
    setTargetFeatureId(featureId);
    setDefaultTaskStatusId(statusId || activeProject?.columns[0]?.id || 'pending');
    setIsTaskModalOpen(true);
  };

  const handleOpenEditTask = (task: Task) => {
    setEditingTask(task);
    setTargetFeatureId(task.featureId);
    setDefaultTaskStatusId(task.statusId);
    setIsTaskModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center text-zinc-400">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-white" />
          <span className="text-xs font-mono">Loading data from projects.json...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <AppShell
        currentProject={activeProject}
        projects={projects}
        isSaving={isSaving}
        viewLayout={viewLayout}
        exportUrl={exportUrl}
        onUpdateRootDirectory={(newPath) => {
          if (activeProject) {
            handleUpdateProjectDirectory(activeProject.id, newPath);
          }
        }}
        onOpenDirectoryFinder={() => setIsDirectoryFinderOpen(true)}
        onOpenColumnManager={() => setIsColumnManagerOpen(true)}
        header={
          <Header
            currentProject={activeProject}
            projects={projects}
            onSelectProject={setActiveProjectId}
            viewLayout={viewLayout}
            onChangeViewLayout={setViewLayout}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onOpenNewProjectModal={() => {
              setEditingProject(null);
              setIsProjectModalOpen(true);
            }}
            onOpenColumnManager={() => setIsColumnManagerOpen(true)}
            onOpenDirectoryFinder={() => setIsDirectoryFinderOpen(true)}
            exportUrl={exportUrl}
            isSaving={isSaving}
          />
        }
        sidebar={
          <ProjectSidebar
            projects={projects}
            activeProjectId={activeProjectId}
            features={features}
            tasks={tasks}
            onSelectProject={setActiveProjectId}
            onOpenNewProjectModal={() => {
              setEditingProject(null);
              setIsProjectModalOpen(true);
            }}
            onEditProject={(proj) => {
              setEditingProject(proj);
              setIsProjectModalOpen(true);
            }}
            onDeleteProject={handleDeleteProject}
          />
        }
      >
        {activeProject ? (
          <ProjectOverview
            project={activeProject}
            features={features}
            tasks={tasks}
            viewLayout={viewLayout}
            onOpenNewFeatureModal={() => {
              setEditingFeature(null);
              setIsFeatureModalOpen(true);
            }}
            onOpenColumnManager={() => setIsColumnManagerOpen(true)}
            onOpenDirectoryFinder={() => setIsDirectoryFinderOpen(true)}
            onOpenRepoDock={() => {
              // Trigger dock open via keyboard event dispatch or ref
              const event = new KeyboardEvent('keydown', {
                key: 'j',
                ctrlKey: true,
                metaKey: true,
                bubbles: true,
              });
              window.dispatchEvent(event);
            }}
            onEditProject={(proj) => {
              setEditingProject(proj);
              setIsProjectModalOpen(true);
            }}
            onAddTask={handleOpenAddTask}
            onEditFeature={(feat) => {
              setEditingFeature(feat);
              setIsFeatureModalOpen(true);
            }}
            onDeleteFeature={handleDeleteFeature}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onToggleSubtask={handleToggleSubtask}
            onAddSubtaskToTask={handleAddSubtaskToTask}
            onDeleteSubtaskFromTask={handleDeleteSubtaskFromTask}
            onEditTask={handleOpenEditTask}
            onDeleteTask={handleDeleteTask}
            searchFilter={searchQuery}
          />
        ) : (
          <div className="text-center py-20 space-y-3">
            <h2 className="text-base font-semibold text-white">No active project</h2>
            <p className="text-xs text-zinc-400">
              Create a project to start organizing features, tracking tasks, and exploring code.
            </p>
            <button
              onClick={() => {
                setEditingProject(null);
                setIsProjectModalOpen(true);
              }}
              className="px-4 py-2 rounded-full bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-medium transition-all shadow-xs"
            >
              Create First Project
            </button>
          </div>
        )}
      </AppShell>

      {/* Common Modals */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => {
          setIsProjectModalOpen(false);
          setEditingProject(null);
        }}
        onSubmit={(title, desc, rootDir) =>
          handleCreateOrUpdateProject(title, desc, rootDir, editingProject)
        }
        initialProject={editingProject}
      />

      {activeProject && (
        <FeatureModal
          isOpen={isFeatureModalOpen}
          projectId={activeProject.id}
          onClose={() => {
            setIsFeatureModalOpen(false);
            setEditingFeature(null);
          }}
          onSubmit={(data) => handleCreateOrUpdateFeature(data, editingFeature)}
          initialFeature={editingFeature}
        />
      )}

      {activeProject && (
        <TaskModal
          isOpen={isTaskModalOpen}
          projectId={activeProject.id}
          featureId={targetFeatureId}
          defaultStatusId={defaultTaskStatusId}
          columns={activeProject.columns}
          onClose={() => {
            setIsTaskModalOpen(false);
            setEditingTask(null);
          }}
          onSubmit={(taskData) => handleSaveTask(taskData, editingTask)}
          initialTask={editingTask}
        />
      )}

      {activeProject && (
        <ColumnManagerModal
          isOpen={isColumnManagerOpen}
          columns={activeProject.columns}
          onClose={() => setIsColumnManagerOpen(false)}
          onSaveColumns={handleSaveColumns}
        />
      )}

      {/* Global System Directory Finder Modal */}
      {activeProject && (
        <DirectoryPickerModal
          isOpen={isDirectoryFinderOpen}
          initialDirectory={activeProject.rootDirectory || '.'}
          onClose={() => setIsDirectoryFinderOpen(false)}
          onSelectDirectory={(selectedPath) => {
            handleUpdateProjectDirectory(activeProject.id, selectedPath);
          }}
          title={`Link Local Directory for "${activeProject.title}"`}
        />
      )}
    </>
  );
}
