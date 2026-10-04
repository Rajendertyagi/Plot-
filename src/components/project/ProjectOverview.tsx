import React from 'react';
import {
  Plus,
  SlidersHorizontal,
  Edit2,
  Layers,
  ListTodo,
  HardDrive,
} from 'lucide-react';
import { Project, Feature, Task, ViewLayout } from '../../types';
import { FeatureSection } from '../features/FeatureSection';
import { Button } from '../ui/button';

interface ProjectOverviewProps {
  project: Project;
  features: Feature[];
  tasks: Task[];
  viewLayout: ViewLayout;
  onOpenNewFeatureModal: () => void;
  onOpenColumnManager: () => void;
  onEditProject: (project: Project) => void;
  onAddTask: (featureId: string, statusId?: string) => void;
  onEditFeature: (feature: Feature) => void;
  onDeleteFeature: (featureId: string) => void;
  onUpdateTaskStatus: (taskId: string, newStatusId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onAddSubtaskToTask: (taskId: string, title: string) => void;
  onDeleteSubtaskFromTask: (taskId: string, subtaskId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  searchFilter: string;
  onOpenDirectoryFinder?: () => void;
}

export const ProjectOverview: React.FC<ProjectOverviewProps> = ({
  project,
  features,
  tasks,
  viewLayout,
  onOpenNewFeatureModal,
  onOpenColumnManager,
  onEditProject,
  onAddTask,
  onEditFeature,
  onDeleteFeature,
  onUpdateTaskStatus,
  onToggleSubtask,
  onAddSubtaskToTask,
  onDeleteSubtaskFromTask,
  onEditTask,
  onDeleteTask,
  searchFilter,
  onOpenDirectoryFinder,
}) => {
  const projectFeatures = features.filter((f) => f.projectId === project.id);
  const projectTasks = tasks.filter((t) => t.projectId === project.id);

  const doneColIds = project.columns.filter((c) => c.isDone).map((c) => c.id);
  const completedTasks = projectTasks.filter((t) => doneColIds.includes(t.statusId)).length;
  const progressPercent =
    projectTasks.length > 0 ? Math.round((completedTasks / projectTasks.length) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Compact Project Control Bar (No tall description block!) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-2.5 rounded-lg bg-neutral-900/60 border border-neutral-800/80">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <h2 className="text-sm font-semibold text-neutral-100 truncate" title={project.title}>
              {project.title}
            </h2>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onEditProject(project)}
              className="h-6 w-6 text-neutral-400 hover:text-white"
              title="Edit Project"
            >
              <Edit2 className="h-3 w-3" />
            </Button>
          </div>

          <span className="text-neutral-700 hidden sm:inline">·</span>

          {/* Quick Metrics */}
          <div className="flex items-center gap-2.5 text-xs text-neutral-400 font-mono">
            <span className="flex items-center gap-1.5 text-neutral-300">
              <Layers className="h-3 w-3 text-indigo-400" />
              <span>{projectFeatures.length} features</span>
            </span>
            <span className="text-neutral-700">·</span>
            <span className="flex items-center gap-1.5 text-neutral-300">
              <ListTodo className="h-3 w-3 text-indigo-400" />
              <span>
                {completedTasks}/{projectTasks.length} tasks ({progressPercent}%)
              </span>
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {project.rootDirectory && onOpenDirectoryFinder && (
            <button
              type="button"
              onClick={onOpenDirectoryFinder}
              className="hidden lg:flex items-center gap-1 px-2 py-1 rounded bg-neutral-950 border border-neutral-800 text-[11px] font-mono text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              <HardDrive className="h-3 w-3 text-sky-400" />
              <span className="truncate max-w-[140px]">{project.rootDirectory}</span>
            </button>
          )}

          <Button
            size="sm"
            onClick={onOpenNewFeatureModal}
            className="bg-indigo-600 hover:bg-indigo-500 text-white h-7 text-xs"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Feature
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onOpenColumnManager}
            className="h-7 text-xs border-neutral-700"
          >
            <SlidersHorizontal className="h-3 w-3 mr-1" />
            Columns
          </Button>
        </div>
      </div>

      {/* Feature Sections List */}
      {projectFeatures.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-800/80 p-10 text-center space-y-3">
          <Layers className="h-8 w-8 text-neutral-600 mx-auto" />
          <h4 className="text-sm font-semibold text-neutral-200">No Features in this Project</h4>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            Break down this project into feature groups to start planning tasks and code changes.
          </p>
          <Button
            size="sm"
            onClick={onOpenNewFeatureModal}
            className="bg-indigo-600 hover:bg-indigo-500 text-white"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Create First Feature
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {projectFeatures.map((feat) => (
            <FeatureSection
              key={feat.id}
              feature={feat}
              tasks={projectTasks}
              columns={project.columns}
              viewLayout={viewLayout}
              onAddTask={onAddTask}
              onEditFeature={onEditFeature}
              onDeleteFeature={onDeleteFeature}
              onUpdateTaskStatus={onUpdateTaskStatus}
              onToggleSubtask={onToggleSubtask}
              onAddSubtaskToTask={onAddSubtaskToTask}
              onDeleteSubtaskFromTask={onDeleteSubtaskFromTask}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
              searchFilter={searchFilter}
            />
          ))}
        </div>
      )}
    </div>
  );
};
