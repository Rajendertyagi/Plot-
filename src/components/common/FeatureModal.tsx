import React, { useState, useEffect } from 'react';
import { X, Layers, Tag } from 'lucide-react';
import { Feature } from '../../types';
import { Button } from '../ui/button';

interface FeatureModalProps {
  isOpen: boolean;
  projectId: string;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description: string;
    tags?: string[];
  }) => void;
  initialFeature?: Feature | null;
}

export const FeatureModal: React.FC<FeatureModalProps> = ({
  isOpen,
  projectId: _projectId,
  onClose,
  onSubmit,
  initialFeature,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagsStr, setTagsStr] = useState('');

  useEffect(() => {
    if (initialFeature) {
      setTitle(initialFeature.title);
      setDescription(initialFeature.description);
      setTagsStr(initialFeature.tags ? initialFeature.tags.join(', ') : '');
    } else {
      setTitle('');
      setDescription('');
      setTagsStr('');
    }
  }, [initialFeature, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const tags = tagsStr
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      tags: tags.length > 0 ? tags : undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-neutral-100">
              {initialFeature ? 'Edit Feature Group' : 'Add Feature Group'}
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
          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-300">
              Feature Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Authentication & OAuth Integration"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-8 px-3 text-xs bg-neutral-950 border border-neutral-800 rounded focus:border-indigo-500 text-neutral-100 placeholder:text-neutral-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-300">
              Description & Scope
            </label>
            <textarea
              rows={3}
              placeholder="What this feature covers, technical goals or acceptance rules..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 text-xs bg-neutral-950 border border-neutral-800 rounded focus:border-indigo-500 text-neutral-100 placeholder:text-neutral-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-neutral-400" />
              Tags / Keywords (comma-separated)
            </label>
            <input
              type="text"
              placeholder="auth, api, database"
              value={tagsStr}
              onChange={(e) => setTagsStr(e.target.value)}
              className="w-full h-8 px-3 text-xs bg-neutral-950 border border-neutral-800 rounded focus:border-indigo-500 text-neutral-100 placeholder:text-neutral-500 focus:outline-none"
            />
          </div>

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
              {initialFeature ? 'Save Changes' : 'Create Feature'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
