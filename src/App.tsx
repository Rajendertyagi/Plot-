/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Project, Feature, Task } from './types';
import { useProjectData } from './hooks/useProjectData';
import { AppShell } from './components/shell/AppShell';
import { ActivityRail } from './components/layout/ActivityRail';
import { ResizableSidebar } from './components/layout/ResizableSidebar';
import { CompactHeader } from './components/layout/CompactHeader';
import { ProjectOverview } from './components/project/ProjectOverview';
import { AiPromptConsole } from './components/features/AiPromptConsole';
import { ProjectModal } from './components/common/ProjectModal';
import { FeatureModal } from './components/common/FeatureModal';
import { TaskModal } from './components/common/TaskModal';
import { ColumnManagerModal } from './components/common/ColumnManagerModal';
import { DirectoryPickerModal } from './components/common/DirectoryPickerModal';
import { Loader2 } from 'lucide-react';
import { Button } from './components/ui/button';

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

  // Active feature filter for focused sidebar navigation
  const [activeFeatureId, setActiveFeatureId] = useState<string | null>(null);

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
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-neutral-400">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
          <span className="text-xs font-mono">Loading data from projects.json...</span>
        </div>
      </div>
    );
  }

  // Filter features if a specific feature is selected in sidebar
  const visibleFeatures = activeFeatureId
    ? features.filter((f) => f.id === activeFeatureId)
    : features;

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
        activityRail={
          <ActivityRail
            projects={projects}
            activeProjectId={activeProjectId}
            onSelectProject={setActiveProjectId}
            onOpenCreateProject={() => {
              setEditingProject(null);
              setIsProjectModalOpen(true);
            }}
            viewLayout={viewLayout}
            onChangeViewLayout={setViewLayout}
          />
        }
        sidebar={
          <ResizableSidebar
            project={activeProject}
            features={features}
            tasks={tasks}
            activeFeatureId={activeFeatureId}
            onSelectFeature={setActiveFeatureId}
            onSelectTask={(taskId) => {
              const task = tasks.find((t) => t.id === taskId);
              if (task) handleOpenEditTask(task);
            }}
            onOpenNewFeatureModal={() => {
              setEditingFeature(null);
              setIsFeatureModalOpen(true);
            }}
            onEditFeature={(feat) => {
              setEditingFeature(feat);
              setIsFeatureModalOpen(true);
            }}
            onDeleteFeature={handleDeleteFeature}
            onEditProject={(proj) => {
              setEditingProject(proj);
              setIsProjectModalOpen(true);
            }}
            onToggleSubtask={handleToggleSubtask}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        }
        header={
          <CompactHeader
            currentProject={activeProject}
            viewLayout={viewLayout}
            onOpenColumnManager={() => setIsColumnManagerOpen(true)}
            onOpenDirectoryFinder={() => setIsDirectoryFinderOpen(true)}
            exportUrl={exportUrl}
            isSaving={isSaving}
          />
        }
      >
        {activeProject ? (
          viewLayout === 'ai' ? (
            <AiPromptConsole
              project={activeProject}
              features={features}
              tasks={tasks}
              searchFilter={searchQuery}
            />
          ) : (
            <ProjectOverview
              project={activeProject}
              features={visibleFeatures}
              tasks={tasks}
              viewLayout={viewLayout}
              onOpenNewFeatureModal={() => {
                setEditingFeature(null);
                setIsFeatureModalOpen(true);
              }}
              onOpenColumnManager={() => setIsColumnManagerOpen(true)}
              onOpenDirectoryFinder={() => setIsDirectoryFinderOpen(true)}
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
          )
        ) : (
          <div className="text-center py-20 space-y-3">
            <h2 className="text-base font-semibold text-neutral-100">No active project</h2>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              Create a project to start planning features and generating AI-ready tasks.
            </p>
            <Button
              onClick={() => {
                setEditingProject(null);
                setIsProjectModalOpen(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              Create First Project
            </Button>
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
