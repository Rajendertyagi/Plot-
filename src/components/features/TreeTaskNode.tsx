import React, { useState } from 'react';
import {
  ChevronDown,
  Check,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  User,
  CheckCircle2,
} from 'lucide-react';
import { Task, StatusColumn } from '../../types';
import { COLOR_CLASSES, PRIORITY_STYLES } from '../../utils/helpers';

interface TreeTaskNodeProps {
  task: Task;
  columns: StatusColumn[];
  onUpdateStatus: (taskId: string, newStatusId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onAddSubtask: (taskId: string, title: string) => void;
  onDeleteSubtask: (taskId: string, subtaskId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export const TreeTaskNode: React.FC<TreeTaskNodeProps> = ({
  task,
  columns,
  onUpdateStatus,
  onToggleSubtask,
  onAddSubtask,
  onDeleteSubtask,
  onEditTask,
  onDeleteTask,
}) => {
  const [isSubtasksExpanded, setIsSubtasksExpanded] = useState(true);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [newSubtaskInput, setNewSubtaskInput] = useState('');

  const currentColumn = columns.find((c) => c.id === task.statusId) || columns[0];
  const colorStyle = currentColumn ? COLOR_CLASSES[currentColumn.color] : COLOR_CLASSES.slate;
  const priorityStyle = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.medium;

  const totalSubtasks = task.subtasks.length;
  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;

  const handleCreateSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskInput.trim()) return;
    onAddSubtask(task.id, newSubtaskInput.trim());
    setNewSubtaskInput('');
  };

  return (
    <div className="group relative pl-3.5 my-2 transition-all">
      {/* Subtle hairline guide */}
      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-white/[0.04] group-hover:bg-white/[0.12] transition-colors rounded-full" />

      {/* Main Task Row Container: Flat, Sleek, Borderless with Soft Depth */}
      <div className="rounded-xl bg-[#1f1f23]/60 hover:bg-[#1f1f23] p-3 sm:p-3.5 shadow-md shadow-black/20 hover:shadow-lg hover:shadow-black/35 transition-all space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          {/* Left: Chevron, Title & Description */}
          <div className="flex items-start gap-2.5 flex-1 min-w-0">
            <button
              onClick={() => setIsSubtasksExpanded(!isSubtasksExpanded)}
              className="mt-0.5 p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors shrink-0"
              title="Toggle Subtasks"
            >
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${
                  isSubtasksExpanded ? '' : '-rotate-90'
                }`}
              />
            </button>

            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h4 className="text-sm font-medium text-zinc-100 leading-snug">
                  {task.title}
                </h4>

                {/* Subtask count badge */}
                {totalSubtasks > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsSubtasksExpanded(!isSubtasksExpanded)}
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono bg-white/[0.06] text-zinc-300 hover:bg-white/[0.1] transition-colors"
                  >
                    <CheckCircle2 className="h-3 w-3 text-indigo-400" />
                    <span>
                      {completedSubtasks}/{totalSubtasks}
                    </span>
                  </button>
                )}
              </div>

              {task.description && (
                <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                  {task.description}
                </p>
              )}
            </div>
          </div>

          {/* Right: Status Pill, Priority, Assignee, Due Date & Actions */}
          <div className="flex flex-wrap items-center gap-2 sm:self-center shrink-0 pl-7 sm:pl-0">
            {/* Priority Indicator */}
            <span
              className={`font-mono text-[10px] uppercase px-2 py-0.5 rounded-full ${priorityStyle.color}`}
            >
              {priorityStyle.label}
            </span>

            {/* Assignee */}
            <span className="flex items-center gap-1.5 text-xs text-zinc-300 font-mono">
              <User className="h-3 w-3 text-zinc-500" />
              <span>{task.assignee}</span>
            </span>

            {/* Due Date */}
            {task.dueDate && (
              <span className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
                <Calendar className="h-3 w-3 text-zinc-500" />
                <span>{task.dueDate}</span>
              </span>
            )}

            {/* Direct Workflow Status Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium transition-all shadow-xs ${colorStyle.badge}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${colorStyle.dot}`} />
                <span>{currentColumn.name}</span>
                <ChevronDown className="h-3 w-3 ml-0.5 opacity-70" />
              </button>

              {isStatusDropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 z-30 w-44 rounded-xl border border-white/10 bg-[#1c1c1f] p-1.5 shadow-2xl shadow-black/80 space-y-0.5 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                    Change Status
                  </div>
                  {columns.map((col) => {
                    const cStyle = COLOR_CLASSES[col.color];
                    const isSelected = col.id === task.statusId;
                    return (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => {
                          onUpdateStatus(task.id, col.id);
                          setIsStatusDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-left transition-colors ${
                          isSelected
                            ? 'bg-white/10 text-white font-medium'
                            : 'text-zinc-300 hover:bg-white/[0.06] hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`h-1.5 w-1.5 rounded-full ${cStyle.dot}`} />
                          <span>{col.name}</span>
                        </div>
                        {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1 border-l border-white/[0.06] pl-2">
              <button
                onClick={() => onEditTask(task)}
                className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                title="Edit Task"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => onDeleteTask(task.id)}
                className="p-1 rounded-md text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Delete Task"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Subtasks: Flat, De-Boxed Checklist */}
        {isSubtasksExpanded && (
          <div className="mt-2 pt-2 border-t border-white/[0.04] pl-3 sm:pl-6 space-y-1.5">
            <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-medium flex items-center justify-between py-0.5">
              <span>Subtasks & Acceptance</span>
              <span className="tabular-nums">
                {completedSubtasks}/{totalSubtasks} completed
              </span>
            </div>

            {/* De-boxed Subtask Items */}
            <div className="space-y-1">
              {task.subtasks.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between gap-2.5 py-1 px-2 rounded-lg hover:bg-white/[0.03] transition-colors group/sub"
                >
                  <div
                    onClick={() => onToggleSubtask(task.id, sub.id)}
                    className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0 select-none text-xs"
                  >
                    {/* Sleek Circular Checkbox */}
                    <div
                      className={`flex h-4 w-4 items-center justify-center rounded-full transition-all shrink-0 ${
                        sub.completed
                          ? 'bg-emerald-500 text-black shadow-xs'
                          : 'border border-zinc-600 bg-transparent group-hover/sub:border-zinc-400'
                      }`}
                    >
                      {sub.completed && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                    </div>
                    <span
                      className={`truncate ${
                        sub.completed ? 'line-through text-zinc-500' : 'text-zinc-200'
                      }`}
                    >
                      {sub.title}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDeleteSubtask(task.id, sub.id)}
                    className="text-zinc-500 hover:text-rose-400 p-1 rounded-md opacity-40 group-hover/sub:opacity-100 transition-opacity"
                    title="Remove subtask"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* Sleek Inline Add Subtask Input */}
            <form onSubmit={handleCreateSubtask} className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="Add subtask..."
                value={newSubtaskInput}
                onChange={(e) => setNewSubtaskInput(e.target.value)}
                className="flex-1 h-7 rounded-lg border border-transparent bg-white/[0.05] focus:bg-white/[0.08] px-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
              />
              <button
                type="submit"
                className="flex items-center gap-1 h-7 px-2.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] text-zinc-200 text-xs font-medium transition-colors shrink-0"
              >
                <Plus className="h-3 w-3" />
                <span>Add</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
