import React, { useState } from 'react';
import {
  Calendar,
  User,
  Check,
  ChevronDown,
  Edit2,
  Trash2,
  ListTodo,
} from 'lucide-react';
import { Task, StatusColumn } from '../../types';
import { COLOR_CLASSES, PRIORITY_STYLES } from '../../utils/helpers';

interface TaskCardProps {
  task: Task;
  columns: StatusColumn[];
  onUpdateStatus: (taskId: string, newStatusId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  columns,
  onUpdateStatus,
  onToggleSubtask,
  onEditTask,
  onDeleteTask,
}) => {
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  const currentColumn = columns.find((c) => c.id === task.statusId) || columns[0];
  const colorStyle = currentColumn ? COLOR_CLASSES[currentColumn.color] : COLOR_CLASSES.slate;
  const priorityStyle = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.medium;

  const totalSubtasks = task.subtasks.length;
  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;

  return (
    <div className="rounded-xl bg-[#26262a]/90 hover:bg-[#26262a] p-3.5 shadow-md shadow-black/25 hover:shadow-xl transition-all space-y-3 group/card">
      {/* Top Header: Priority Badge & Actions */}
      <div className="flex items-center justify-between">
        <span
          className={`font-mono text-[10px] uppercase px-2 py-0.5 rounded-full ${priorityStyle.color}`}
        >
          {priorityStyle.label}
        </span>

        <div className="flex items-center gap-1 opacity-60 group-hover/card:opacity-100 transition-opacity">
          <button
            onClick={() => onEditTask(task)}
            className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            title="Edit Task"
          >
            <Edit2 className="h-3 w-3" />
          </button>
          <button
            onClick={() => onDeleteTask(task.id)}
            className="p-1 rounded-md text-zinc-400 hover:text-rose-400 hover:bg-rose-500/20 transition-colors"
            title="Delete Task"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Title & Description */}
      <div className="space-y-1">
        <h4 className="text-xs font-semibold text-zinc-100 leading-snug">
          {task.title}
        </h4>
        {task.description && (
          <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed font-normal">
            {task.description}
          </p>
        )}
      </div>

      {/* Subtasks Accordion Toggle */}
      {totalSubtasks > 0 && (
        <div className="space-y-1.5 pt-1">
          <button
            onClick={() => setShowSubtasks(!showSubtasks)}
            className="flex items-center justify-between w-full text-[11px] font-mono text-zinc-400 hover:text-white transition-colors"
          >
            <div className="flex items-center gap-1.5">
              <ListTodo className="h-3 w-3 text-indigo-400" />
              <span>
                Subtasks ({completedSubtasks}/{totalSubtasks})
              </span>
            </div>
            <ChevronDown
              className={`h-3 w-3 transition-transform ${
                showSubtasks ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Subtask checklist */}
          {showSubtasks && (
            <div className="space-y-1 pt-1 border-t border-white/[0.04]">
              {task.subtasks.map((sub) => (
                <div
                  key={sub.id}
                  onClick={() => onToggleSubtask(task.id, sub.id)}
                  className="flex items-center gap-2 py-0.5 px-1 rounded-md hover:bg-white/[0.04] cursor-pointer text-[11px]"
                >
                  <div
                    className={`flex h-3.5 w-3.5 items-center justify-center rounded-full transition-colors shrink-0 ${
                      sub.completed
                        ? 'bg-emerald-500 text-black'
                        : 'border border-zinc-600'
                    }`}
                  >
                    {sub.completed && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                  </div>
                  <span
                    className={`truncate ${
                      sub.completed ? 'line-through text-zinc-500' : 'text-zinc-300'
                    }`}
                  >
                    {sub.title}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bottom Footer: Assignee, Due Date & Status Switcher */}
      <div className="flex items-center justify-between pt-2 border-t border-white/[0.04] text-[11px] text-zinc-400 font-mono">
        <div className="flex items-center gap-1.5">
          <User className="h-3 w-3 text-zinc-500" />
          <span className="truncate max-w-[85px]">{task.assignee}</span>
        </div>

        {task.dueDate && (
          <div className="flex items-center gap-1 text-[10px]">
            <Calendar className="h-3 w-3 text-zinc-500" />
            <span>{task.dueDate}</span>
          </div>
        )}
      </div>

      {/* Status Pill Switcher */}
      <div className="relative pt-1">
        <button
          onClick={() => setIsChangingStatus(!isChangingStatus)}
          className={`w-full flex items-center justify-between px-2.5 py-1 rounded-full text-[11px] font-mono font-medium transition-colors ${colorStyle.badge}`}
        >
          <div className="flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${colorStyle.dot}`} />
            <span>{currentColumn.name}</span>
          </div>
          <ChevronDown className="h-3 w-3 opacity-70" />
        </button>

        {isChangingStatus && (
          <div className="absolute left-0 right-0 bottom-full mb-1 z-20 rounded-xl border border-white/10 bg-[#1c1c1f] p-1 shadow-2xl shadow-black/80 space-y-0.5">
            {columns.map((col) => {
              const cStyle = COLOR_CLASSES[col.color];
              const isSelected = col.id === task.statusId;
              return (
                <button
                  key={col.id}
                  onClick={() => {
                    onUpdateStatus(task.id, col.id);
                    setIsChangingStatus(false);
                  }}
                  className={`w-full flex items-center justify-between px-2 py-1 rounded-lg text-xs text-left transition-colors ${
                    isSelected
                      ? 'bg-white/10 text-white font-medium'
                      : 'text-zinc-300 hover:bg-white/[0.06] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`h-1.5 w-1.5 rounded-full ${cStyle.dot}`} />
                    <span>{col.name}</span>
                  </div>
                  {isSelected && <Check className="h-3 w-3 text-white" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
