import React, { useState } from 'react';
import {
  ChevronDown,
  Plus,
  Edit2,
  Trash2,
  ListTodo,
  Tag,
} from 'lucide-react';
import { Feature, Task, StatusColumn, ViewLayout } from '../../types';
import { COLOR_CLASSES } from '../../utils/helpers';
import { TaskCard } from './TaskCard';
import { TreeTaskNode } from './TreeTaskNode';
import { Button } from '../ui/button';

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
    const subMatch = t.subtasks.some((s) => s.title.toLowerCase().includes(q));
    const fileMatch = t.linkedFiles?.some((f) => f.toLowerCase().includes(q));
    return titleMatch || descMatch || subMatch || fileMatch;
  });

  const doneColIds = columns.filter((c) => c.isDone).map((c) => c.id);
  const completedTasks = featureTasks.filter((t) => doneColIds.includes(t.statusId)).length;
  const progressPercent =
    featureTasks.length > 0 ? Math.round((completedTasks / featureTasks.length) * 100) : 0;

  return (
    <div className="rounded-xl bg-neutral-900/60 hover:bg-neutral-900/80 p-4 sm:p-5 shadow-sm border border-neutral-800/80 transition-all space-y-3">
      {/* Feature Header Block */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2.5 pb-3 border-b border-neutral-800/80">
        <div className="space-y-1 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              title="Expand/Collapse Feature"
            >
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${
                  isExpanded ? '' : '-rotate-90'
                }`}
              />
            </button>
            <h3 className="text-sm font-semibold text-neutral-100 tracking-tight truncate">
              {feature.title}
            </h3>
          </div>

          {/* Feature Scope & Metadata (No Lead, No Target Date) */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400 pl-7 font-mono">
            <span className="flex items-center gap-1.5 text-neutral-300">
              <ListTodo className="h-3 w-3 text-indigo-400" />
              <span>
                {completedTasks}/{featureTasks.length} Completed ({progressPercent}%)
              </span>
            </span>

            {feature.tags && feature.tags.length > 0 && (
              <>
                <span className="text-neutral-700">·</span>
                <div className="flex items-center gap-1">
                  {feature.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-1.5 py-0.5 rounded bg-neutral-800 text-[10px] text-neutral-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

          {feature.description && (
            <p className="text-xs text-neutral-400 pl-7 pt-1 leading-relaxed">
              {feature.description}
            </p>
          )}
        </div>

        {/* Feature Actions */}
        <div className="flex items-center gap-1.5 pl-7 sm:pl-0 shrink-0">
          <Button
            size="sm"
            onClick={() => onAddTask(feature.id)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white h-7 text-xs"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Task
          </Button>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onEditFeature(feature)}
            className="h-7 w-7 text-neutral-400 hover:text-white"
            title="Edit Feature"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onDeleteFeature(feature.id)}
            className="h-7 w-7 text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10"
            title="Delete Feature"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Feature Content (Kanban Columns or Tree List) */}
      {isExpanded && (
        <div className="pt-1">
          {viewLayout === 'board' ? (
            /* Board View: Workflow Columns */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {columns.map((column) => {
                const colTasks = featureTasks.filter((t) => t.statusId === column.id);
                const colorStyle = COLOR_CLASSES[column.color];

                return (
                  <div
                    key={column.id}
                    className="flex flex-col rounded-lg bg-neutral-950/60 border border-neutral-800/80 p-3 min-h-[140px]"
                  >
                    {/* Column Header */}
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-800/60">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${colorStyle.dot}`} />
                        <span className="text-xs font-medium text-neutral-200 truncate">
                          {column.name}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-500 tabular-nums">
                          ({colTasks.length})
                        </span>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onAddTask(feature.id, column.id)}
                        className="h-5 w-5 text-neutral-400 hover:text-white"
                        title={`Add task to ${column.name}`}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Column Tasks */}
                    <div className="flex-1 space-y-2">
                      {colTasks.length === 0 ? (
                        <div className="h-20 flex items-center justify-center border border-dashed border-neutral-800/60 rounded text-[11px] text-neutral-500">
                          Empty
                        </div>
                      ) : (
                        colTasks.map((task) => (
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
          ) : (
            /* Tree View: Hierarchical Task List */
            <div className="space-y-1 pl-1">
              {featureTasks.length === 0 ? (
                <div className="p-4 text-center border border-dashed border-neutral-800/60 rounded text-xs text-neutral-500">
                  No tasks in this feature yet.
                </div>
              ) : (
                featureTasks.map((task) => (
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
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
