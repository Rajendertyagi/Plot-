import React, { useState, useEffect } from 'react';
import { X, CheckSquare, Plus, Trash2, Check } from 'lucide-react';
import { Task, StatusColumn, Subtask, TaskPriority } from '../../types';

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
  const [assignee, setAssignee] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description);
      setStatusId(initialTask.statusId);
      setPriority(initialTask.priority);
      setAssignee(initialTask.assignee);
      setDueDate(initialTask.dueDate || '');
      setSubtasks(initialTask.subtasks || []);
    } else {
      setTitle('');
      setDescription('');
      setStatusId(defaultStatusId || columns[0]?.id || 'pending');
      setPriority('medium');
      setAssignee('Alex Mercer');
      setDueDate(new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0]);
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

    onSubmit({
      projectId,
      featureId,
      title: title.trim(),
      description: description.trim(),
      statusId,
      priority,
      assignee: assignee.trim() || 'Unassigned',
      dueDate,
      subtasks,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl bg-[#18181b] border border-white/10 p-6 shadow-2xl shadow-black/90 space-y-5 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-white/[0.08] flex items-center justify-center">
              <CheckSquare className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-base font-semibold text-white">
              {initialTask ? 'Edit Task' : 'Add New Task'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">
              Task Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Implement WebAuthn registration endpoint"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-9 rounded-xl border border-transparent bg-white/[0.05] focus:bg-white/[0.08] px-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">
              Notes & Technical Context
            </label>
            <textarea
              rows={2}
              placeholder="Context, requirements, acceptance details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-transparent bg-white/[0.05] focus:bg-white/[0.08] p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">
                Workflow Status Column
              </label>
              <select
                value={statusId}
                onChange={(e) => setStatusId(e.target.value)}
                className="w-full h-9 rounded-xl border border-transparent bg-[#1c1c1f] px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
              >
                {columns.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.name} {col.isDone ? '(Counts as Done)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full h-9 rounded-xl border border-transparent bg-[#1c1c1f] px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">
                Assignee
              </label>
              <input
                type="text"
                placeholder="e.g., Alex Mercer"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="w-full h-9 rounded-xl border border-transparent bg-white/[0.05] focus:bg-white/[0.08] px-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">
                Target Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full h-9 rounded-xl border border-transparent bg-white/[0.05] focus:bg-white/[0.08] px-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
              />
            </div>
          </div>

          {/* Subtasks Section */}
          <div className="space-y-2 pt-2 border-t border-white/[0.06]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-zinc-300">
                Subtask Checklist ({subtasks.length})
              </label>
            </div>

            {/* List of subtasks */}
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {subtasks.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between gap-2.5 py-1.5 px-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors"
                >
                  <div
                    onClick={() => handleToggleSubtask(sub.id)}
                    className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0"
                  >
                    <div
                      className={`flex h-4 w-4 items-center justify-center rounded-full transition-colors shrink-0 ${
                        sub.completed
                          ? 'bg-emerald-500 text-black'
                          : 'border border-zinc-600'
                      }`}
                    >
                      {sub.completed && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                    </div>
                    <span
                      className={`text-xs truncate ${
                        sub.completed ? 'line-through text-zinc-500' : 'text-zinc-200'
                      }`}
                    >
                      {sub.title}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteSubtask(sub.id)}
                    className="text-zinc-500 hover:text-rose-400 p-1 rounded-md"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add subtask input */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="Add checklist subtask..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                className="flex-1 h-8 rounded-xl border border-transparent bg-white/[0.05] focus:bg-white/[0.08] px-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="flex items-center gap-1 h-8 px-3 rounded-full bg-white/[0.08] hover:bg-white/[0.14] text-zinc-200 text-xs font-medium transition-colors shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-full bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-medium transition-all shadow-xs"
            >
              {initialTask ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
