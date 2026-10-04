import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Check,
  SlidersHorizontal,
} from 'lucide-react';
import { StatusColumn, ColumnColor } from '../../types';
import { COLOR_CLASSES } from '../../utils/helpers';

interface ColumnManagerModalProps {
  isOpen: boolean;
  columns: StatusColumn[];
  onClose: () => void;
  onSaveColumns: (newColumns: StatusColumn[]) => void;
}

const AVAILABLE_COLORS: ColumnColor[] = [
  'emerald',
  'sky',
  'amber',
  'rose',
  'purple',
  'teal',
  'indigo',
  'slate',
];

export const ColumnManagerModal: React.FC<ColumnManagerModalProps> = ({
  isOpen,
  columns,
  onClose,
  onSaveColumns,
}) => {
  const [cols, setCols] = useState<StatusColumn[]>([]);
  const [newColName, setNewColName] = useState('');
  const [newColColor, setNewColColor] = useState<ColumnColor>('sky');
  const [newColIsDone, setNewColIsDone] = useState(false);

  useEffect(() => {
    if (columns) {
      setCols(JSON.parse(JSON.stringify(columns)));
    }
  }, [columns, isOpen]);

  if (!isOpen) return null;

  const handleAddColumn = () => {
    if (!newColName.trim()) return;
    const newCol: StatusColumn = {
      id: `col-${Date.now()}`,
      name: newColName.trim(),
      color: newColColor,
      isDone: newColIsDone,
    };
    setCols([...cols, newCol]);
    setNewColName('');
    setNewColColor('sky');
    setNewColIsDone(false);
  };

  const handleDeleteColumn = (id: string) => {
    if (cols.length <= 1) {
      alert('You must have at least one workflow column.');
      return;
    }
    setCols(cols.filter((c) => c.id !== id));
  };

  const handleMoveColumn = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= cols.length) return;
    const updated = [...cols];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setCols(updated);
  };

  const handleToggleIsDone = (id: string) => {
    setCols(
      cols.map((c) => (c.id === id ? { ...c, isDone: !c.isDone } : c))
    );
  };

  const handleSave = () => {
    onSaveColumns(cols);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl bg-[#18181b] border border-white/10 p-6 shadow-2xl shadow-black/90 space-y-5 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-white/[0.08] flex items-center justify-center">
              <SlidersHorizontal className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                Configure Workflow Columns
              </h3>
              <p className="text-xs text-zinc-400">
                Customize workflow stages (Pending, Holding, Bug, Done, etc.)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Existing Columns List */}
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {cols.map((col, index) => {
            const colStyle = COLOR_CLASSES[col.color];
            return (
              <div
                key={col.id}
                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.05] transition-colors"
              >
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <span className={`h-2.5 w-2.5 rounded-full ${colStyle.dot}`} />
                  <span className="text-xs font-medium text-white truncate">
                    {col.name}
                  </span>
                  {col.isDone && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/15 text-emerald-300">
                      Counts as Completed
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleIsDone(col.id)}
                    className={`px-2 py-1 rounded-full text-[10px] font-mono transition-colors ${
                      col.isDone
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-white/[0.06] text-zinc-400 hover:text-zinc-200'
                    }`}
                    title="Toggle if tasks in this column count toward completion %"
                  >
                    {col.isDone ? 'Done Stage' : 'Mark Done'}
                  </button>

                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => handleMoveColumn(index, 'up')}
                    className="p-1 text-zinc-400 hover:text-white disabled:opacity-30 rounded-md"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    disabled={index === cols.length - 1}
                    onClick={() => handleMoveColumn(index, 'down')}
                    className="p-1 text-zinc-400 hover:text-white disabled:opacity-30 rounded-md"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteColumn(col.id)}
                    className="p-1 text-zinc-400 hover:text-rose-400 rounded-md"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add New Column Form */}
        <div className="p-3.5 rounded-xl bg-white/[0.025] space-y-3">
          <div className="text-xs font-semibold text-zinc-300">
            Add Custom Column
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              placeholder="e.g., Code Review, QA Verification..."
              value={newColName}
              onChange={(e) => setNewColName(e.target.value)}
              className="flex-1 h-8 rounded-xl border border-transparent bg-white/[0.05] focus:bg-white/[0.08] px-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
            />

            <button
              type="button"
              onClick={handleAddColumn}
              className="flex items-center justify-center gap-1 h-8 px-3.5 rounded-full bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-medium transition-all shadow-xs"
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Add Column</span>
            </button>
          </div>

          {/* Color Chooser */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-zinc-400">Badge Color Accent:</label>
            <div className="flex flex-wrap items-center gap-2">
              {AVAILABLE_COLORS.map((color) => {
                const isSelected = newColColor === color;
                const cStyle = COLOR_CLASSES[color];
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewColColor(color)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono transition-all ${
                      isSelected
                        ? 'ring-2 ring-white ' + cStyle.badge
                        : cStyle.badge + ' opacity-70 hover:opacity-100'
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${cStyle.dot}`} />
                    <span className="capitalize">{color}</span>
                    {isSelected && <Check className="h-3 w-3" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Is Done Checkbox */}
          <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={newColIsDone}
              onChange={(e) => setNewColIsDone(e.target.checked)}
              className="rounded bg-zinc-800 border-zinc-700 text-emerald-500 focus:ring-emerald-500/20"
            />
            <span>This column represents completed work (counts toward 100% progress)</span>
          </label>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/[0.06]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-full bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-medium transition-all shadow-xs"
          >
            Apply Columns
          </button>
        </div>
      </div>
    </div>
  );
};
