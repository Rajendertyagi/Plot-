import React, { useState } from 'react';
import {
  Check,
  ChevronDown,
  Edit2,
  Trash2,
  ListTodo,
  FileCode,
  Sparkles,
  Copy,
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
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const currentColumn = columns.find((c) => c.id === task.statusId) || columns[0];
  const colorStyle = currentColumn ? COLOR_CLASSES[currentColumn.color] : COLOR_CLASSES.slate;
  const priorityStyle = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.medium;

  const totalSubtasks = task.subtasks.length;
  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;

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
      <div className="rounded-lg bg-neutral-900/90 border border-neutral-800/80 hover:border-neutral-700/80 p-3 shadow-xs hover:shadow-md transition-all space-y-2.5 group/card select-none">
        {/* Top Header: Priority Badge & Actions */}
        <div className="flex items-center justify-between gap-1">
          <span
            className={`font-mono text-[10px] font-medium uppercase px-1.5 py-0.5 rounded ${priorityStyle.color}`}
          >
            {priorityStyle.label}
          </span>

          <div className="flex items-center gap-1 opacity-70 group-hover/card:opacity-100 transition-opacity">
            {/* Quick Copy AI Prompt */}
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
                <span>{copiedPrompt ? 'Copied Prompt to Clipboard!' : 'Copy Prompt for AI Model'}</span>
              </TooltipContent>
            </Tooltip>

            {/* Edit Task */}
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

            {/* Delete Task */}
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

        {/* Title & Description */}
        <div className="space-y-1">
          <h4 className="text-xs font-medium text-neutral-100 leading-snug">
            {task.title}
          </h4>
          {task.description && (
            <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}
        </div>

        {/* Linked Code Files (Solo AI Builder Feature) */}
        {task.linkedFiles && task.linkedFiles.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-0.5">
            {task.linkedFiles.slice(0, 3).map((filePath, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-[10px] font-mono text-neutral-300 truncate max-w-[170px]"
                title={filePath}
              >
                <FileCode className="h-2.5 w-2.5 text-indigo-400 shrink-0" />
                <span className="truncate">{filePath}</span>
              </span>
            ))}
            {task.linkedFiles.length > 3 && (
              <span className="text-[10px] font-mono text-neutral-500 self-center">
                +{task.linkedFiles.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Subtasks Accordion Toggle */}
        {totalSubtasks > 0 && (
          <div className="space-y-1 pt-1 border-t border-neutral-800/60">
            <button
              onClick={() => setShowSubtasks(!showSubtasks)}
              className="flex items-center justify-between w-full text-[11px] font-mono text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <ListTodo className="h-3 w-3 text-indigo-400" />
                <span>
                  Checklist ({completedSubtasks}/{totalSubtasks})
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
              <div className="space-y-1 pt-1">
                {task.subtasks.map((sub) => (
                  <div
                    key={sub.id}
                    onClick={() => onToggleSubtask(task.id, sub.id)}
                    className="flex items-center gap-2 py-0.5 px-1 rounded hover:bg-neutral-800/50 cursor-pointer text-[11px]"
                  >
                    <div
                      className={`flex h-3.5 w-3.5 items-center justify-center rounded transition-colors shrink-0 ${
                        sub.completed
                          ? 'bg-emerald-500 text-black'
                          : 'border border-neutral-700'
                      }`}
                    >
                      {sub.completed && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                    </div>
                    <span
                      className={`truncate ${
                        sub.completed ? 'line-through text-neutral-500' : 'text-neutral-300'
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

        {/* Bottom Status Switcher Dropdown */}
        <div className="pt-1.5 border-t border-neutral-800/60">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={`w-full flex items-center justify-between px-2 py-1 rounded text-[11px] font-medium transition-colors border ${colorStyle.badge}`}
              >
                <div className="flex items-center gap-1.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${colorStyle.dot}`} />
                  <span className="truncate">{currentColumn.name}</span>
                </div>
                <ChevronDown className="h-3 w-3 opacity-60 shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
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
        </div>
      </div>
    </TooltipProvider>
  );
};
