import React, { useState, useEffect } from 'react';
import { X, Layers } from 'lucide-react';
import { Feature } from '../../types';

interface FeatureModalProps {
  isOpen: boolean;
  projectId: string;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description: string;
    lead: string;
    targetDate: string;
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
  const [lead, setLead] = useState('');
  const [targetDate, setTargetDate] = useState('');

  useEffect(() => {
    if (initialFeature) {
      setTitle(initialFeature.title);
      setDescription(initialFeature.description);
      setLead(initialFeature.lead || '');
      setTargetDate(initialFeature.targetDate || '');
    } else {
      setTitle('');
      setDescription('');
      setLead('');
      setTargetDate('');
    }
  }, [initialFeature, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      lead: lead.trim(),
      targetDate: targetDate.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl bg-[#18181b] border border-white/10 p-6 shadow-2xl shadow-black/90 space-y-5 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-white/[0.08] flex items-center justify-center">
              <Layers className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-base font-semibold text-white">
              {initialFeature ? 'Edit Feature / Function' : 'Add Feature / Function'}
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
              Feature / Function Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Biometric & Magic Link Authentication Flow"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-9 rounded-xl border border-transparent bg-white/[0.05] focus:bg-white/[0.08] px-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">
              Detailed Technical Description & Scope
            </label>
            <textarea
              rows={4}
              required
              placeholder="Describe the functional requirements, API endpoints, technical acceptance criteria, or design specifications..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-transparent bg-white/[0.05] focus:bg-white/[0.08] p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">
                Feature Lead / Owner
              </label>
              <input
                type="text"
                placeholder="e.g., Alex Mercer"
                value={lead}
                onChange={(e) => setLead(e.target.value)}
                className="w-full h-9 rounded-xl border border-transparent bg-white/[0.05] focus:bg-white/[0.08] px-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">
                Target Delivery Date
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full h-9 rounded-xl border border-transparent bg-white/[0.05] focus:bg-white/[0.08] px-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
              />
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
              {initialFeature ? 'Save Changes' : 'Create Feature'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
