import React from 'react';
import {
  FolderKanban,
  Plus,
  MoreVertical,
  CheckCircle2,
  Trash2,
  Edit2,
  ListTodo,
  HardDrive,
} from 'lucide-react';
import { Project, Feature, Task } from '../../types';

interface ProjectSidebarProps {
  projects: Project[];
  activeProjectId: string;
  features: Feature[];
  tasks: Task[];
  onSelectProject: (projectId: string) => void;
  onOpenNewProjectModal: () => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
}

export const ProjectSidebar: React.FC<ProjectSidebarProps> = ({
  projects,
  activeProjectId,
  features,
  tasks,
  onSelectProject,
  onOpenNewProjectModal,
  onEditProject,
  onDeleteProject,
}) => {
  const [activeMenuId, setActiveMenuId] = React.useState<string | null>(null);

  return (
    <aside className="w-64 sm:w-72 bg-[#121214] border-r border-white/[0.04] flex flex-col shrink-0">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-white/[0.04] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderKanban className="h-4 w-4 text-zinc-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
            Projects
          </span>
          <span className="text-xs font-mono text-zinc-500">
            ({projects.length})
          </span>
        </div>

        <button
          onClick={onOpenNewProjectModal}
          className="flex items-center gap-1 h-7 px-3 rounded-full bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-medium transition-all shadow-xs"
          title="Create New Project"
        >
          <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
          <span>New</span>
        </button>
      </div>

      {/* Projects List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {projects.map((proj) => {
          const isActive = proj.id === activeProjectId;
          const projFeatures = features.filter((f) => f.projectId === proj.id);
          const projTasks = tasks.filter((t) => t.projectId === proj.id);

          const doneColIds = proj.columns.filter((c) => c.isDone).map((c) => c.id);
          const completedTasks = projTasks.filter((t) => doneColIds.includes(t.statusId)).length;
          const progressPercent =
            projTasks.length > 0 ? Math.round((completedTasks / projTasks.length) * 100) : 0;

          return (
            <div
              key={proj.id}
              className={`group relative rounded-xl p-3 cursor-pointer transition-all ${
                isActive
                  ? 'bg-white/[0.08] text-white shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
              }`}
              onClick={() => onSelectProject(proj.id)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1 space-y-1">
                  <h4 className="text-xs font-semibold truncate leading-tight">
                    {proj.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono">
                    <span>{projFeatures.length} feats</span>
                    <span>·</span>
                    <span>{projTasks.length} tasks</span>
                  </div>
                  {proj.rootDirectory && (
                    <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-500 truncate pt-0.5">
                      <HardDrive className="h-2.5 w-2.5 text-sky-400/80 shrink-0" />
                      <span className="truncate">{proj.rootDirectory}</span>
                    </div>
                  )}
                </div>

                {/* More options button */}
                <div className="relative shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuId(activeMenuId === proj.id ? null : proj.id);
                    }}
                    className="p-1 rounded-md text-zinc-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="h-3.5 w-3.5" />
                  </button>

                  {/* Context popup menu */}
                  {activeMenuId === proj.id && (
                    <div
                      className="absolute right-0 top-full mt-1 z-30 w-36 rounded-xl border border-white/10 bg-[#1c1c1f] p-1 shadow-2xl shadow-black/80 space-y-0.5 text-xs animate-in fade-in zoom-in-95 duration-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => {
                          onEditProject(proj);
                          setActiveMenuId(null);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-white/[0.06] text-left"
                      >
                        <Edit2 className="h-3 w-3" />
                        <span>Edit Scope</span>
                      </button>
                      <button
                        onClick={() => {
                          onDeleteProject(proj.id);
                          setActiveMenuId(null);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 text-left"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Mini completion bar */}
              <div className="mt-2.5 flex items-center gap-2">
                <div className="h-1 flex-1 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      progressPercent === 100 ? 'bg-emerald-400' : 'bg-indigo-400'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="font-mono text-[10px] text-zinc-400 tabular-nums">
                  {progressPercent}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sidebar Footer info */}
      <div className="p-3 border-t border-white/[0.04] text-[11px] text-zinc-500 font-mono flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-zinc-400">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          <span>Local Sync Active</span>
        </span>
        <span className="text-zinc-500">v2.1</span>
      </div>
    </aside>
  );
};
