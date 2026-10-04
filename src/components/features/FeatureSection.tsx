import React, { useState } from 'react';
import {
  ChevronDown,
  Plus,
  Edit2,
  Trash2,
  User,
  Calendar,
  ListTodo,
} from 'lucide-react';
import { Feature, Task, StatusColumn, ViewLayout } from '../../types';
import { COLOR_CLASSES } from '../../utils/helpers';
import { TaskCard } from './TaskCard';
import { TreeTaskNode } from './TreeTaskNode';

interface FeatureSectionProps {
  feature: Feature;
  tasks: Task[];
  columns: StatusColumn[];
  viewLayout: ViewLayout;
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
}

export const FeatureSection: React.FC<FeatureSectionProps> = ({
  feature,
  tasks,
  columns,
  viewLayout,
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
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Filter tasks belonging to this feature matching search
  const featureTasks = tasks.filter((t) => {
    if (t.featureId !== feature.id) return false;
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    const titleMatch = t.title.toLowerCase().includes(q);
    const descMatch = t.description.toLowerCase().includes(q);
    const assigneeMatch = t.assignee.toLowerCase().includes(q);
    const subMatch = t.subtasks.some((s) => s.title.toLowerCase().includes(q));
    return titleMatch || descMatch || assigneeMatch || subMatch;
  });

  const doneColIds = columns.filter((c) => c.isDone).map((c) => c.id);
  const completedTasks = featureTasks.filter((t) => doneColIds.includes(t.statusId)).length;
  const progressPercent =
    featureTasks.length > 0 ? Math.round((completedTasks / featureTasks.length) * 100) : 0;

  return (
    <div className="rounded-2xl bg-[#17171a]/90 hover:bg-[#17171a] p-5 sm:p-6 shadow-xl shadow-black/25 border border-white/[0.04] transition-all space-y-4">
      {/* Feature Header Block */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 pb-3 border-b border-white/[0.04]">
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
              title="Expand/Collapse Feature Section"
            >
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${
                  isExpanded ? '' : '-rotate-90'
                }`}
              />
            </button>
            <h3 className="text-base font-semibold text-white tracking-tight truncate">
              {feature.title}
            </h3>
          </div>

          {/* Feature Owner & Meta */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-zinc-400 pl-7 font-mono">
            {feature.lead && (
              <span className="flex items-center gap-1.5 text-zinc-300">
                <User className="h-3 w-3 text-indigo-400" />
                <span>Lead: {feature.lead}</span>
              </span>
            )}
            {feature.targetDate && (
              <>
                <span className="text-zinc-600">·</span>
                <span className="flex items-center gap-1.5 text-zinc-400">
                  <Calendar className="h-3 w-3 text-zinc-500" />
                  <span>Target: {feature.targetDate}</span>
                </span>
              </>
            )}
            <span className="text-zinc-600">·</span>
            <span className="flex items-center gap-1.5 text-zinc-300">
              <ListTodo className="h-3 w-3 text-zinc-400" />
              <span>
                {completedTasks}/{featureTasks.length} Done ({progressPercent}%)
              </span>
            </span>
          </div>
        </div>

        {/* Feature Actions */}
        <div className="flex items-center gap-2 pl-7 sm:pl-0 shrink-0">
          <button
            onClick={() => onAddTask(feature.id)}
            className="flex items-center gap-1.5 h-8 px-3.5 rounded-full bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-medium transition-all shadow-sm"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>Add Task</span>
          </button>

          <button
            onClick={() => onEditFeature(feature)}
            className="p-2 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-zinc-400 hover:text-white transition-colors"
            title="Edit Feature"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={() => onDeleteFeature(feature.id)}
            className="p-2 rounded-full bg-white/[0.06] hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 transition-colors"
            title="Delete Feature"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Feature Detailed Description: De-Boxed, Sleek Editorial Block */}
      {feature.description && (
        <div className="rounded-xl bg-white/[0.025] hover:bg-white/[0.04] p-3.5 text-xs text-zinc-300 leading-relaxed font-normal transition-colors">
          <div className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-400 mb-1">
            Function Scope & Specifications
          </div>
          <p className="whitespace-pre-line">{feature.description}</p>
        </div>
      )}

      {/* Tasks & Subtasks Area */}
      {isExpanded && (
        <div className="pt-1">
          {viewLayout === 'tree' ? (
            /* First-Class Hierarchical Tree List */
            <div className="space-y-1">
              {featureTasks.length === 0 ? (
                <div className="py-7 text-center text-xs text-zinc-400 rounded-xl bg-white/[0.015]">
                  No tasks added to this feature yet. Click &quot;Add Task&quot; above to create one.
                </div>
              ) : (
                <div className="space-y-1">
                  {featureTasks.map((task) => (
                    <TreeTaskNode
                      key={task.id}
                      task={task}
                      columns={columns}
                      onUpdateStatus={onUpdateTaskStatus}
                      onToggleSubtask={onToggleSubtask}
                      onAddSubtask={onAddSubtaskToTask}
                      onDeleteSubtask={onDeleteSubtaskFromTask}
                      onEditTask={onEditTask}
                      onDeleteTask={onDeleteTask}
                    />
                  ))}
                </div>
              )}

              {/* Quick inline "+ Add task under this feature" row */}
              <div className="pt-2 pl-3.5">
                <button
                  onClick={() => onAddTask(feature.id)}
                  className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white font-medium py-1 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add another task to {feature.title}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Multi-Column Kanban Board */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 items-start">
              {columns.map((column) => {
                const columnTasks = featureTasks.filter((t) => t.statusId === column.id);
                const colStyle = COLOR_CLASSES[column.color];

                return (
                  <div
                    key={column.id}
                    className="rounded-xl bg-[#1f1f23]/60 p-3 space-y-3 shadow-md shadow-black/20"
                  >
                    {/* Column Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-white/[0.04]">
                      <div className="flex items-center gap-1.5">
                        <span className={`h-2 w-2 rounded-full ${colStyle.dot}`} />
                        <span className="text-xs font-semibold text-zinc-200">
                          {column.name}
                        </span>
                        <span className="font-mono text-[10px] text-zinc-400 tabular-nums">
                          ({columnTasks.length})
                        </span>
                      </div>

                      <button
                        onClick={() => onAddTask(feature.id, column.id)}
                        className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                        title={`Add task directly to ${column.name}`}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Task Cards List */}
                    <div className="space-y-2.5 min-h-[90px]">
                      {columnTasks.length === 0 ? (
                        <div className="py-6 text-center text-[11px] text-zinc-400 rounded-lg bg-white/[0.01]">
                          No {column.name.toLowerCase()} tasks
                        </div>
                      ) : (
                        columnTasks.map((task) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            columns={columns}
                            onUpdateStatus={onUpdateTaskStatus}
                            onToggleSubtask={onToggleSubtask}
                            onEditTask={onEditTask}
                            onDeleteTask={onDeleteTask}
                          />
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
