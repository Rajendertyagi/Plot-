import React, { useState, useEffect } from 'react';
import { X, CheckSquare, Plus, Trash2, Check, Sparkles, FileCode } from 'lucide-react';
import { Task, StatusColumn, Subtask, TaskPriority } from '../../types';
import { Button } from '../ui/button';

interface TaskModalProps {
  isOpen: boolean;
  projectId: string;
  featureId: string;
  defaultStatusId: string;
  columns: StatusColumn[];
  onClose: () => void;
  onSubmit: (taskData: Omit<Task, 'id' | 'createdAt'>) => void;
  initialTask?: Task | null;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  projectId,
  featureId,
  defaultStatusId,
  columns,
  onClose,
  onSubmit,
  initialTask,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [statusId, setStatusId] = useState(defaultStatusId);
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [aiPromptContext, setAiPromptContext] = useState('');
  const [linkedFilesStr, setLinkedFilesStr] = useState('');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description);
      setStatusId(initialTask.statusId);
      setPriority(initialTask.priority);
      setAiPromptContext(initialTask.aiPromptContext || '');
      setLinkedFilesStr(initialTask.linkedFiles ? initialTask.linkedFiles.join(', ') : '');
      setSubtasks(initialTask.subtasks || []);
    } else {
      setTitle('');
      setDescription('');
      setStatusId(defaultStatusId || columns[0]?.id || 'pending');
      setPriority('medium');
      setAiPromptContext('');
      setLinkedFilesStr('');
      setSubtasks([]);
    }
  }, [initialTask, defaultStatusId, columns, isOpen]);

  if (!isOpen) return null;

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    const newSub: Subtask = {
      id: `sub-${Date.now()}`,
      title: newSubtaskTitle.trim(),
      completed: false,
    };
    setSubtasks([...subtasks, newSub]);
    setNewSubtaskTitle('');
  };

  const handleToggleSubtask = (id: string) => {
    setSubtasks(
      subtasks.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s))
    );
  };

  const handleDeleteSubtask = (id: string) => {
    setSubtasks(subtasks.filter((s) => s.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const files = linkedFilesStr
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean);

    onSubmit({
      projectId,
      featureId,
      title: title.trim(),
      description: description.trim(),
      statusId,
      priority,
      aiPromptContext: aiPromptContext.trim() || undefined,
      linkedFiles: files.length > 0 ? files : undefined,
      subtasks,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-neutral-100">
              {initialTask ? 'Edit Task' : 'New Solo Task'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Task Title */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-300">
              Task Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement resizable activity rail"
              className="w-full h-8 px-3 text-xs bg-neutral-950 border border-neutral-800 rounded focus:border-indigo-500 text-neutral-100 placeholder:text-neutral-500 focus:outline-none"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-300">
              Description & Objective
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What needs to be accomplished in this task..."
              className="w-full p-2.5 text-xs bg-neutral-950 border border-neutral-800 rounded focus:border-indigo-500 text-neutral-100 placeholder:text-neutral-500 focus:outline-none"
            />
          </div>

          {/* AI Prompt Context (Solo AI Builder Field) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                AI Prompt Context & Instructions
              </label>
              <span className="text-[10px] text-neutral-500">Ready to copy to LLM</span>
            </div>
            <textarea
              rows={3}
              value={aiPromptContext}
              onChange={(e) => setAiPromptContext(e.target.value)}
              placeholder="Prompt instructions, code snippets, or rules for your AI assistant..."
              className="w-full p-2.5 text-xs font-mono bg-neutral-950/80 border border-indigo-500/20 rounded focus:border-indigo-500 text-neutral-200 placeholder:text-neutral-600 focus:outline-none"
            />
          </div>

          {/* Linked Codebase Files */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5 text-neutral-400" />
              Linked Codebase Files (comma separated)
            </label>
            <input
              type="text"
              value={linkedFilesStr}
              onChange={(e) => setLinkedFilesStr(e.target.value)}
              placeholder="src/components/Header.tsx, src/types/index.ts"
              className="w-full h-8 px-3 text-xs font-mono bg-neutral-950 border border-neutral-800 rounded focus:border-indigo-500 text-neutral-200 placeholder:text-neutral-600 focus:outline-none"
            />
          </div>

          {/* Two-column layout: Status & Priority (No Assignee, No Due Date) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-neutral-300">Kanban Status</label>
              <select
                value={statusId}
                onChange={(e) => setStatusId(e.target.value)}
                className="w-full h-8 px-2.5 text-xs bg-neutral-950 border border-neutral-800 rounded focus:border-indigo-500 text-neutral-100 focus:outline-none"
              >
                {columns.map((c) => (
                  <option key={c.id} value={c.id} className="bg-neutral-900 text-neutral-100">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-neutral-300">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full h-8 px-2.5 text-xs bg-neutral-950 border border-neutral-800 rounded focus:border-indigo-500 text-neutral-100 focus:outline-none"
              >
                <option value="low" className="bg-neutral-900 text-neutral-100">Low</option>
                <option value="medium" className="bg-neutral-900 text-neutral-100">Medium</option>
                <option value="high" className="bg-neutral-900 text-neutral-100">High</option>
                <option value="urgent" className="bg-neutral-900 text-neutral-100">Urgent</option>
              </select>
            </div>
          </div>

          {/* Checklist / Subtasks */}
          <div className="space-y-2 pt-2 border-t border-neutral-800">
            <label className="text-xs font-medium text-neutral-300">Acceptance Steps</label>

            <div className="flex gap-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                placeholder="Add acceptance check or step..."
                className="flex-1 h-7 px-2.5 text-xs bg-neutral-950 border border-neutral-800 rounded focus:border-indigo-500 text-neutral-100 placeholder:text-neutral-500 focus:outline-none"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleAddSubtask}
                className="h-7 text-xs"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add
              </Button>
            </div>

            {subtasks.length > 0 && (
              <div className="space-y-1 max-h-36 overflow-y-auto pt-1">
                {subtasks.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between gap-2 p-1.5 rounded bg-neutral-950/60 border border-neutral-800/80 text-xs"
                  >
                    <div
                      onClick={() => handleToggleSubtask(s.id)}
                      className="flex items-center gap-2 cursor-pointer min-w-0 flex-1"
                    >
                      <div
                        className={`h-3.5 w-3.5 rounded flex items-center justify-center transition-colors shrink-0 ${
                          s.completed ? 'bg-emerald-500 text-black' : 'border border-neutral-600'
                        }`}
                      >
                        {s.completed && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                      </div>
                      <span
                        className={`truncate ${
                          s.completed ? 'line-through text-neutral-500' : 'text-neutral-200'
                        }`}
                      >
                        {s.title}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteSubtask(s.id)}
                      className="text-neutral-500 hover:text-rose-400 p-0.5"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-neutral-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              {initialTask ? 'Save Changes' : 'Create Task'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
