import React from 'react';
import {
  Plus,
  SlidersHorizontal,
  Edit2,
  Calendar,
  Layers,
  ListTodo,
  HardDrive,
  FolderGit2,
} from 'lucide-react';
import { Project, Feature, Task, ViewLayout } from '../../types';
import { COLOR_CLASSES } from '../../utils/helpers';
import { FeatureSection } from '../features/FeatureSection';

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
  onOpenRepoDock?: () => void;
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
  onOpenRepoDock,
}) => {
  const projectFeatures = features.filter((f) => f.projectId === project.id);
  const projectTasks = tasks.filter((t) => t.projectId === project.id);

  const doneColIds = project.columns.filter((c) => c.isDone).map((c) => c.id);
  const completedTasks = projectTasks.filter((t) => doneColIds.includes(t.statusId)).length;
  const progressPercent =
    projectTasks.length > 0 ? Math.round((completedTasks / projectTasks.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Project Banner & Scope Block: Flat, Sleek, Borderless with Soft Ambient Depth */}
      <div className="rounded-2xl bg-[#17171a]/95 p-6 sm:p-7 shadow-xl shadow-black/35 border border-white/[0.04] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white truncate">
                {project.title}
              </h1>
              <button
                onClick={() => onEditProject(project)}
                className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors shrink-0"
                title="Edit Project Scope"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-3xl font-normal">
              {project.description}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-zinc-400 font-mono">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                <span>Created {project.createdAt}</span>
              </span>
              <span className="text-zinc-600">·</span>
              <span className="flex items-center gap-1.5 text-zinc-300">
                <Layers className="h-3.5 w-3.5 text-indigo-400" />
                <span>{projectFeatures.length} Features / Functions</span>
              </span>
              <span className="text-zinc-600">·</span>
              <span className="flex items-center gap-1.5 text-zinc-300">
                <ListTodo className="h-3.5 w-3.5 text-zinc-400" />
                <span>{projectTasks.length} Total Tasks</span>
              </span>
              {project.rootDirectory && (
                <>
                  <span className="text-zinc-600">·</span>
                  <button
                    onClick={onOpenDirectoryFinder}
                    className="flex items-center gap-1.5 text-sky-400 hover:text-sky-300 transition-colors"
                    title="Click to change linked repository directory"
                  >
                    <HardDrive className="h-3.5 w-3.5" />
                    <span>{project.rootDirectory}</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Primary Action Buttons: Sleek ChatGPT-style pills */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {onOpenRepoDock && (
              <button
                onClick={onOpenRepoDock}
                className="flex items-center gap-1.5 h-8 px-3.5 rounded-full bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/20 text-xs font-medium transition-all shadow-xs"
                title="Open CodeMirror Repository Explorer"
              >
                <FolderGit2 className="h-3.5 w-3.5 text-sky-400" />
                <span>Code Explorer</span>
              </button>
            )}

            <button
              onClick={onOpenColumnManager}
              className="flex items-center gap-1.5 h-8 px-3.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-zinc-200 text-xs font-medium transition-all shadow-xs"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-zinc-400" />
              <span>Configure Columns</span>
            </button>

            <button
              onClick={onOpenNewFeatureModal}
              className="flex items-center gap-1.5 h-8 px-4 rounded-full bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-medium transition-all shadow-sm"
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Add Feature / Function</span>
            </button>
          </div>
        </div>

        {/* Global Project Progress Bar & Status Counts */}
        <div className="pt-4 border-t border-white/[0.04] space-y-2.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex flex-wrap items-center gap-3 text-zinc-300">
              <span className="text-zinc-400 font-medium">Pipeline:</span>
              {project.columns.map((col) => {
                const count = projectTasks.filter((t) => t.statusId === col.id).length;
                const colStyle = COLOR_CLASSES[col.color];
                return (
                  <span key={col.id} className="flex items-center gap-1.5 text-[11px]">
                    <span className={`h-1.5 w-1.5 rounded-full ${colStyle.dot}`} />
                    <span className="text-zinc-400">{col.name}:</span>
                    <strong className="text-white font-medium">{count}</strong>
                  </span>
                );
              })}
            </div>

            <span className="text-zinc-200 font-semibold tabular-nums">
              {completedTasks}/{projectTasks.length} Done ({progressPercent}%)
            </span>
          </div>

          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                progressPercent === 100
                  ? 'bg-emerald-500 shadow-[0_0_10px_rgba(52,211,153,0.5)]'
                  : 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Features & Functions Section List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Features & Functional Specifications
            </h2>
            <span className="text-xs font-mono text-zinc-500">
              ({projectFeatures.length})
            </span>
          </div>

          <button
            onClick={onOpenNewFeatureModal}
            className="flex items-center gap-1 text-xs text-zinc-300 hover:text-white font-medium transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Feature</span>
          </button>
        </div>

        {projectFeatures.length === 0 ? (
          <div className="rounded-2xl bg-[#17171a]/50 p-12 text-center space-y-3 shadow-sm">
            <Layers className="h-8 w-8 text-zinc-600 mx-auto" />
            <h3 className="text-sm font-semibold text-zinc-200">
              No features or functions added yet
            </h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Add your first technical feature or function with a detailed description to begin tracking tasks.
            </p>
            <button
              onClick={onOpenNewFeatureModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-medium transition-all shadow-sm"
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Add First Feature</span>
            </button>
          </div>
        ) : (
          projectFeatures.map((feat) => (
            <FeatureSection
              key={feat.id}
              feature={feat}
              tasks={tasks}
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
          ))
        )}
      </div>
    </div>
  );
};
