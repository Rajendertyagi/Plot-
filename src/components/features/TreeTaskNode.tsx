import React, { useState } from 'react';
import {
  ChevronDown,
  Check,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Sparkles,
  FileCode,
  CheckCheck,
} from 'lucide-react';
import { Task, StatusColumn } from '../../types';
import { COLOR_CLASSES, PRIORITY_STYLES } from '../../utils/helpers';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

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
  const [newSubtaskInput, setNewSubtaskInput] = useState('');
  const [copiedPrompt, setCopiedPrompt] = useState(false);

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

  const handleCopyPrompt = (e: React.MouseEvent) => {
    e.stopPropagation();
    const promptText = [
      `### Task: ${task.title}`,
      task.description ? `\n**Objective:**\n${task.description}` : '',
      task.aiPromptContext ? `\n**AI Instructions:**\n${task.aiPromptContext}` : '',
      task.linkedFiles && task.linkedFiles.length > 0
        ? `\n**Target Files:**\n${task.linkedFiles.map((f) => `- \`${f}\``).join('\n')}`
        : '',
      task.subtasks.length > 0
        ? `\n**Acceptance Steps:**\n${task.subtasks
            .map((s) => `- [${s.completed ? 'x' : ' '}] ${s.title}`)
            .join('\n')}`
        : '',
    ]
      .filter(Boolean)
      .join('\n');

    navigator.clipboard.writeText(promptText);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="group relative pl-3.5 my-2 transition-all">
        {/* Subtle hairline guide */}
        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-neutral-800 group-hover:bg-neutral-700 transition-colors rounded-full" />

        {/* Main Task Row Container */}
        <div className="rounded-lg bg-neutral-900/80 hover:bg-neutral-900 border border-neutral-800/80 p-3 shadow-xs hover:shadow-md transition-all space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            {/* Left: Chevron, Title & Description */}
            <div className="flex items-start gap-2.5 flex-1 min-w-0">
              <button
                type="button"
                onClick={() => setIsSubtasksExpanded(!isSubtasksExpanded)}
                className="mt-0.5 p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors shrink-0"
                title="Toggle Checklist"
              >
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    isSubtasksExpanded ? '' : '-rotate-90'
                  }`}
                />
              </button>

              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-xs font-medium text-neutral-100 leading-snug">
                    {task.title}
                  </h4>

                  {/* Checklist count badge */}
                  {totalSubtasks > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsSubtasksExpanded(!isSubtasksExpanded)}
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono bg-neutral-800 text-neutral-300 hover:bg-neutral-700 transition-colors"
                    >
                      <CheckCircle2 className="h-3 w-3 text-indigo-400" />
                      <span>
                        {completedSubtasks}/{totalSubtasks}
                      </span>
                    </button>
                  )}

                  {/* Linked Files on Tree Row */}
                  {task.linkedFiles && task.linkedFiles.length > 0 && (
                    <div className="flex items-center gap-1">
                      {task.linkedFiles.slice(0, 2).map((filePath, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-[10px] font-mono text-neutral-400 truncate max-w-[130px]"
                          title={filePath}
                        >
                          <FileCode className="h-2.5 w-2.5 text-indigo-400 shrink-0" />
                          <span className="truncate">{filePath}</span>
                        </span>
                      ))}
                      {task.linkedFiles.length > 2 && (
                        <span className="text-[10px] font-mono text-neutral-500">
                          +{task.linkedFiles.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {task.description && (
                  <p className="text-[11px] text-neutral-400 leading-relaxed font-normal">
                    {task.description}
                  </p>
                )}
              </div>
            </div>

            {/* Right: Status Dropdown, Priority & Actions */}
            <div className="flex flex-wrap items-center gap-2 sm:self-center shrink-0 pl-7 sm:pl-0">
              {/* Priority Indicator */}
              <span
                className={`font-mono text-[10px] uppercase px-1.5 py-0.5 rounded ${priorityStyle.color}`}
              >
                {priorityStyle.label}
              </span>

              {/* Status Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-mono font-medium transition-colors border ${colorStyle.badge}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${colorStyle.dot}`} />
                    <span>{currentColumn.name}</span>
                    <ChevronDown className="h-3 w-3 opacity-60" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  {columns.map((col) => {
                    const cStyle = COLOR_CLASSES[col.color];
                    const isSelected = col.id === task.statusId;
                    return (
                      <DropdownMenuItem
                        key={col.id}
                        onClick={() => onUpdateStatus(task.id, col.id)}
                        className="flex items-center justify-between text-xs py-1.5"
                      >
                        <div className="flex items-center gap-2">
                          <span className={`h-1.5 w-1.5 rounded-full ${cStyle.dot}`} />
                          <span>{col.name}</span>
                        </div>
                        {isSelected && <Check className="h-3 w-3 text-indigo-400" />}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Actions */}
              <div className="flex items-center gap-1 border-l border-neutral-800 pl-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={handleCopyPrompt}
                      className="h-6 w-6 text-neutral-400 hover:text-indigo-400"
                    >
                      {copiedPrompt ? (
                        <CheckCheck className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <Sparkles className="h-3 w-3" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <span>{copiedPrompt ? 'Copied Prompt!' : 'Copy AI Prompt'}</span>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onEditTask(task)}
                      className="h-6 w-6 text-neutral-400 hover:text-white"
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <span>Edit Task</span>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onDeleteTask(task.id)}
                      className="h-6 w-6 text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <span>Delete Task</span>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>

          {/* Subtasks: Flat Checklist */}
          {isSubtasksExpanded && (
            <div className="mt-2 pt-2 border-t border-neutral-800/80 pl-3 sm:pl-6 space-y-1.5">
              <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-medium flex items-center justify-between py-0.5">
                <span>Acceptance Steps</span>
                <span className="tabular-nums">
                  {completedSubtasks}/{totalSubtasks} completed
                </span>
              </div>

              {/* Subtask Items */}
              <div className="space-y-1">
                {task.subtasks.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between gap-2.5 py-1 px-2 rounded hover:bg-neutral-800/50 transition-colors group/sub"
                  >
                    <div
                      onClick={() => onToggleSubtask(task.id, sub.id)}
                      className="flex items-center gap-2 cursor-pointer flex-1 min-w-0 select-none text-xs"
                    >
                      <div
                        className={`flex h-3.5 w-3.5 items-center justify-center rounded transition-all shrink-0 ${
                          sub.completed
                            ? 'bg-emerald-500 text-black shadow-xs'
                            : 'border border-neutral-600 bg-transparent group-hover/sub:border-neutral-400'
                        }`}
                      >
                        {sub.completed && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                      </div>
                      <span
                        className={`truncate ${
                          sub.completed ? 'line-through text-neutral-500' : 'text-neutral-200'
                        }`}
                      >
                        {sub.title}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onDeleteSubtask(task.id, sub.id)}
                      className="text-neutral-500 hover:text-rose-400 p-1 rounded opacity-40 group-hover/sub:opacity-100 transition-opacity"
                      title="Remove check"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Inline Add Subtask Input */}
              <form onSubmit={handleCreateSubtask} className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Add acceptance check..."
                  value={newSubtaskInput}
                  onChange={(e) => setNewSubtaskInput(e.target.value)}
                  className="flex-1 h-7 rounded border border-neutral-800 bg-neutral-950 px-2.5 text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-indigo-500 transition-all"
                />
                <Button
                  type="submit"
                  variant="secondary"
                  size="sm"
                  className="h-7 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};
