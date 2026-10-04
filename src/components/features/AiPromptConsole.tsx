import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  CheckCheck,
  Code2,
  BookTemplate,
  Plus,
  Trash2,
  Edit3,
  Download,
  Save,
  Check,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import { Project, Feature, Task, PromptTemplate, PromptCategory } from '../../types';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { usePromptTemplates } from '../../hooks/usePromptTemplates';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface AiPromptConsoleProps {
  project: Project;
  features: Feature[];
  tasks: Task[];
  searchFilter?: string;
  onUpdateTaskPrompt?: (taskId: string, aiPromptContext: string) => void;
}

const CATEGORIES: PromptCategory[] = [
  'Implementation',
  'Review',
  'Testing',
  'Debugging',
  'Architecture',
  'General',
];

export const AiPromptConsole: React.FC<AiPromptConsoleProps> = ({
  project,
  features,
  tasks,
  searchFilter = '',
  onUpdateTaskPrompt,
}) => {
  const {
    templates,
    handleAddTemplate,
    handleUpdateTemplate,
    handleDeleteTemplate,
    handleResetToDefaults,
    exportUrl,
  } = usePromptTemplates();

  const [activeTab, setActiveTab] = useState<'synthesizer' | 'library'>('synthesizer');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Filter tasks by query
  const q = searchFilter.trim().toLowerCase();
  const projectTasks = tasks.filter((t) => {
    if (t.projectId !== project.id) return false;
    if (!q) return true;
    return (
      t.title.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q) ||
      t.linkedFiles?.some((f) => f.toLowerCase().includes(q))
    );
  });

  const [selectedTaskId, setSelectedTaskId] = useState<string>(
    projectTasks[0]?.id || ''
  );
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedTemplateId, setCopiedTemplateId] = useState<string | null>(null);

  const selectedTask = projectTasks.find((t) => t.id === selectedTaskId) || projectTasks[0];
  const parentFeature = features.find((f) => f.id === selectedTask?.featureId);

  // Inline prompt context editing for active task
  const [taskPromptDraft, setTaskPromptDraft] = useState<string>(
    selectedTask?.aiPromptContext || ''
  );
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSavedRecently, setIsSavedRecently] = useState(false);

  // Sync draft when selectedTask changes
  React.useEffect(() => {
    if (selectedTask) {
      setTaskPromptDraft(selectedTask.aiPromptContext || '');
      setHasUnsavedChanges(false);
    }
  }, [selectedTask?.id, selectedTask?.aiPromptContext]);

  // Modal state for creating/editing templates in library
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PromptTemplate | null>(null);
  const [modalTitle, setModalTitle] = useState('');
  const [modalCategory, setModalCategory] = useState<PromptCategory>('Implementation');
  const [modalDescription, setModalDescription] = useState('');
  const [modalContent, setModalContent] = useState('');

  const openCreateTemplateModal = () => {
    setEditingTemplate(null);
    setModalTitle('');
    setModalCategory('Implementation');
    setModalDescription('');
    setModalContent('');
    setIsTemplateModalOpen(true);
  };

  const openEditTemplateModal = (tpl: PromptTemplate) => {
    setEditingTemplate(tpl);
    setModalTitle(tpl.title);
    setModalCategory(tpl.category);
    setModalDescription(tpl.description || '');
    setModalContent(tpl.content);
    setIsTemplateModalOpen(true);
  };

  const handleSaveModalTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalTitle.trim() || !modalContent.trim()) return;

    if (editingTemplate) {
      handleUpdateTemplate({
        ...editingTemplate,
        title: modalTitle.trim(),
        category: modalCategory,
        description: modalDescription.trim(),
        content: modalContent.trim(),
      });
    } else {
      handleAddTemplate({
        title: modalTitle.trim(),
        category: modalCategory,
        description: modalDescription.trim(),
        content: modalContent.trim(),
      });
    }

    setIsTemplateModalOpen(false);
  };

  const handleInsertTemplateIntoDraft = (content: string) => {
    setTaskPromptDraft((prev) => {
      const cleanPrev = prev.trim();
      const updated = cleanPrev ? `${cleanPrev}\n\n${content}` : content;
      setHasUnsavedChanges(true);
      return updated;
    });
  };

  const handleSavePromptToTask = () => {
    if (!selectedTask || !onUpdateTaskPrompt) return;
    onUpdateTaskPrompt(selectedTask.id, taskPromptDraft.trim());
    setHasUnsavedChanges(false);
    setIsSavedRecently(true);
    setTimeout(() => setIsSavedRecently(false), 2000);
  };

  // Synthesize prompt preview dynamically
  const generatedPrompt = selectedTask
    ? [
        `You are a senior software engineer assisting with a coding task for the project "${project.title}".`,
        '',
        `### Feature Context: ${parentFeature?.title || 'General'}`,
        parentFeature?.description ? `*Feature Scope:* ${parentFeature.description}` : '',
        '',
        `### Task: ${selectedTask.title}`,
        selectedTask.description ? `**Objective:**\n${selectedTask.description}` : '',
        '',
        taskPromptDraft.trim()
          ? `**Specific AI Instructions & Requirements:**\n${taskPromptDraft.trim()}\n`
          : '',
        selectedTask.linkedFiles && selectedTask.linkedFiles.length > 0
          ? `**Relevant Codebase Files:**\n${selectedTask.linkedFiles
              .map((f) => `- \`${f}\``)
              .join('\n')}\n`
          : '',
        selectedTask.subtasks && selectedTask.subtasks.length > 0
          ? `**Acceptance Criteria Checklist:**\n${selectedTask.subtasks
              .map((s) => `- [${s.completed ? 'x' : ' '}] ${s.title}`)
              .join('\n')}\n`
          : '',
        'Please inspect the relevant files, formulate a concise implementation plan, and provide complete, working code changes.',
      ]
        .filter(Boolean)
        .join('\n')
    : 'Select a task to generate an AI prompt.';

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(generatedPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleCopyTemplateContent = (tpl: PromptTemplate) => {
    navigator.clipboard.writeText(tpl.content);
    setCopiedTemplateId(tpl.id);
    setTimeout(() => setCopiedTemplateId(null), 2000);
  };

  const filteredTemplates = templates.filter((tpl) => {
    if (selectedCategory === 'All') return true;
    return tpl.category === selectedCategory;
  });

  return (
    <div className="h-[calc(100vh-130px)] flex flex-col gap-3">
      {/* Top Console Navigation Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-neutral-900/60 border border-neutral-800/80 rounded-lg shrink-0">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('synthesizer')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'synthesizer'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Task Prompt Synthesizer</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('library')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'library'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
            }`}
          >
            <BookTemplate className="w-3.5 h-3.5" />
            <span>Prompt Templates Library</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-950/60 text-indigo-300">
              {templates.length}
            </span>
          </button>
        </div>

        {/* Global actions */}
        <div className="flex items-center gap-2">
          {activeTab === 'library' && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetToDefaults}
                className="h-7 text-xs text-neutral-400 hover:text-neutral-200"
                title="Reset built-in templates to default"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Defaults
              </Button>

              <a
                href={exportUrl}
                download="prompts.json"
                className="inline-flex items-center gap-1 h-7 px-2.5 rounded text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
                title="Download data/prompts.json"
              >
                <Download className="w-3 h-3" />
                <span>Export prompts.json</span>
              </a>

              <Button
                size="sm"
                onClick={openCreateTemplateModal}
                className="h-7 text-xs bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                <Plus className="w-3 h-3 mr-1" />
                New Template
              </Button>
            </>
          )}

          {activeTab === 'synthesizer' && (
            <Button
              size="sm"
              onClick={handleCopyPrompt}
              className="h-7 text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm"
            >
              {copiedPrompt ? (
                <>
                  <CheckCheck className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                  Copied Prompt!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1" />
                  Copy Markdown Prompt
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'synthesizer' ? (
        <div className="flex-1 flex flex-col sm:flex-row gap-3 min-h-0 overflow-hidden">
          {/* Left: Task Selector */}
          <div className="w-full sm:w-72 rounded-xl bg-neutral-900/60 border border-neutral-800/80 flex flex-col shrink-0 overflow-hidden">
            <div className="p-2.5 border-b border-neutral-800/80 flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-200">Select Task</span>
              <span className="text-[10px] font-mono text-neutral-500 tabular-nums">
                {projectTasks.length} tasks
              </span>
            </div>

            <ScrollArea className="flex-1 p-2">
              <div className="space-y-1">
                {projectTasks.length === 0 ? (
                  <div className="p-4 text-center text-xs text-neutral-500">
                    No tasks found.
                  </div>
                ) : (
                  projectTasks.map((t) => {
                    const isSelected = t.id === selectedTaskId;
                    const feat = features.find((f) => f.id === t.featureId);

                    return (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTaskId(t.id)}
                        className={`p-2 rounded-lg text-xs cursor-pointer transition-colors space-y-1 ${
                          isSelected
                            ? 'bg-indigo-600/20 border border-indigo-500/40 text-neutral-100 font-medium'
                            : 'text-neutral-400 hover:bg-neutral-800/40 hover:text-neutral-200'
                        }`}
                      >
                        <div className="truncate">{t.title}</div>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-500">
                          <span className="truncate max-w-[100px]">{feat?.title}</span>
                          {t.linkedFiles && t.linkedFiles.length > 0 && (
                            <>
                              <span>·</span>
                              <span>{t.linkedFiles.length} files</span>
                            </>
                          )}
                          {t.aiPromptContext && (
                            <>
                              <span>·</span>
                              <span className="text-indigo-400 font-semibold">Prompt</span>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Right: Split view of Inline Editor + Prompt Preview */}
          <div className="flex-1 rounded-xl bg-neutral-900/60 border border-neutral-800/80 flex flex-col min-h-0 overflow-hidden">
            {/* Top Toolbar for current task */}
            <div className="p-2.5 border-b border-neutral-800/80 flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <Code2 className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="text-xs font-semibold text-neutral-200 truncate">
                  {selectedTask?.title || 'No Task Selected'}
                </span>
                {parentFeature && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 truncate hidden md:inline">
                    {parentFeature.title}
                  </span>
                )}
              </div>

              {/* Template Applier Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs border-indigo-500/30 text-indigo-300 hover:text-indigo-100 hover:bg-indigo-950/60"
                  >
                    <BookTemplate className="w-3.5 h-3.5 mr-1" />
                    Insert Template
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 max-h-60 overflow-y-auto">
                  <div className="px-2 py-1 text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">
                    Prompt Templates (prompts.json)
                  </div>
                  {templates.map((tpl) => (
                    <DropdownMenuItem
                      key={tpl.id}
                      onClick={() => handleInsertTemplateIntoDraft(tpl.content)}
                      className="text-xs flex flex-col items-start gap-0.5 cursor-pointer"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-medium text-neutral-200">{tpl.title}</span>
                        <span className="text-[9px] px-1 rounded bg-neutral-800 text-neutral-400">
                          {tpl.category}
                        </span>
                      </div>
                      {tpl.description && (
                        <span className="text-[10px] text-neutral-400 line-clamp-1">
                          {tpl.description}
                        </span>
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Save Task Prompt Button */}
              {onUpdateTaskPrompt && (
                <Button
                  size="sm"
                  onClick={handleSavePromptToTask}
                  disabled={!hasUnsavedChanges && !isSavedRecently}
                  className={`h-7 text-xs ${
                    hasUnsavedChanges
                      ? 'bg-amber-600 hover:bg-amber-500 text-white animate-pulse'
                      : isSavedRecently
                      ? 'bg-emerald-600 text-white'
                      : 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  {isSavedRecently ? (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1 text-emerald-300" />
                      Saved to projects.json
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5 mr-1" />
                      {hasUnsavedChanges ? 'Save Prompt to Task' : 'Saved'}
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Split Content: Top Editable Prompt Context / Bottom Assembled Markdown */}
            <div className="flex-1 flex flex-col md:flex-row min-h-0 divide-y md:divide-y-0 md:divide-x divide-neutral-800/80 overflow-hidden">
              {/* Left pane: Editable AI Prompt Context */}
              <div className="flex-1 flex flex-col min-h-0 bg-neutral-950/40 p-3 overflow-hidden">
                <div className="flex items-center justify-between pb-1.5 text-xs text-neutral-400">
                  <span className="font-medium text-neutral-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    Task Prompt Context & Instructions
                  </span>
                  <span className="text-[10px] text-neutral-500">
                    Saved in projects.json per task
                  </span>
                </div>
                <textarea
                  value={taskPromptDraft}
                  onChange={(e) => {
                    setTaskPromptDraft(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  placeholder="Enter specific AI instructions, requirements, edge cases, or insert a reusable prompt template from the library above..."
                  className="flex-1 w-full p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-mono text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              {/* Right pane: Synthesized Live Markdown Preview */}
              <div className="flex-1 flex flex-col min-h-0 bg-neutral-900/30 p-3 overflow-hidden">
                <div className="flex items-center justify-between pb-1.5 text-xs text-neutral-400">
                  <span className="font-medium text-neutral-300">
                    Synthesized AI Prompt Preview
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyPrompt}
                    className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    Copy
                  </button>
                </div>
                <ScrollArea className="flex-1 rounded-lg bg-neutral-950/80 border border-neutral-800/80 p-3">
                  <pre className="font-mono text-[11px] text-neutral-300 whitespace-pre-wrap leading-relaxed select-text">
                    {generatedPrompt}
                  </pre>
                </ScrollArea>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Prompt Templates Library Tab (data/prompts.json) */
        <div className="flex-1 flex flex-col min-h-0 rounded-xl bg-neutral-900/60 border border-neutral-800/80 p-3 space-y-3 overflow-hidden">
          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0">
            <button
              type="button"
              onClick={() => setSelectedCategory('All')}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                selectedCategory === 'All'
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'bg-neutral-800/80 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              All Categories ({templates.length})
            </button>
            {CATEGORIES.map((cat) => {
              const count = templates.filter((t) => t.category === cat).length;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded text-xs transition-colors flex items-center gap-1.5 ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white font-medium'
                      : 'bg-neutral-800/80 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <span>{cat}</span>
                  <span className="text-[10px] font-mono text-neutral-400">{count}</span>
                </button>
              );
            })}
          </div>

          {/* Templates Grid */}
          <ScrollArea className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pr-2">
              {filteredTemplates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="rounded-lg bg-neutral-950/70 border border-neutral-800/80 p-3.5 flex flex-col justify-between space-y-2.5 hover:border-neutral-700 transition-colors"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-semibold text-neutral-100">{tpl.title}</h4>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-indigo-300 shrink-0">
                        {tpl.category}
                      </span>
                    </div>
                    {tpl.description && (
                      <p className="text-[11px] text-neutral-400 line-clamp-2">
                        {tpl.description}
                      </p>
                    )}
                  </div>

                  <div className="rounded bg-neutral-900/80 border border-neutral-800/60 p-2 text-[10px] font-mono text-neutral-300 max-h-24 overflow-y-auto whitespace-pre-wrap select-text">
                    {tpl.content}
                  </div>

                  {/* Actions footer */}
                  <div className="flex items-center justify-between pt-1 border-t border-neutral-800/60 text-xs">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditTemplateModal(tpl)}
                        className="h-6 px-1.5 text-neutral-400 hover:text-white"
                        title="Edit template"
                      >
                        <Edit3 className="w-3 h-3" />
                      </Button>
                      {!tpl.isBuiltIn && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTemplate(tpl.id)}
                          className="h-6 px-1.5 text-neutral-500 hover:text-rose-400"
                          title="Delete template"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleCopyTemplateContent(tpl)}
                      className="h-6 text-[10px] px-2"
                    >
                      {copiedTemplateId === tpl.id ? (
                        <>
                          <Check className="w-3 h-3 mr-1 text-emerald-400" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 mr-1" />
                          Copy Template
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Template Create / Edit Modal Dialog */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-lg p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <h3 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
                <BookTemplate className="w-4 h-4 text-indigo-400" />
                {editingTemplate ? 'Edit Prompt Template' : 'Create Global Prompt Template'}
              </h3>
              <button
                type="button"
                onClick={() => setIsTemplateModalOpen(false)}
                className="text-neutral-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveModalTemplate} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-300">
                    Template Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={modalTitle}
                    onChange={(e) => setModalTitle(e.target.value)}
                    placeholder="e.g. End-to-End Test Generator"
                    className="w-full h-8 px-2.5 text-xs bg-neutral-950 border border-neutral-800 rounded text-neutral-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-300">Category</label>
                  <select
                    value={modalCategory}
                    onChange={(e) => setModalCategory(e.target.value as PromptCategory)}
                    className="w-full h-8 px-2.5 text-xs bg-neutral-950 border border-neutral-800 rounded text-neutral-100 focus:outline-none focus:border-indigo-500"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className="bg-neutral-900 text-neutral-100">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-300">Short Description</label>
                <input
                  type="text"
                  value={modalDescription}
                  onChange={(e) => setModalDescription(e.target.value)}
                  placeholder="When to use this prompt..."
                  className="w-full h-8 px-2.5 text-xs bg-neutral-950 border border-neutral-800 rounded text-neutral-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-300">
                  Prompt Content & Rules <span className="text-rose-400">*</span>
                </label>
                <textarea
                  required
                  rows={6}
                  value={modalContent}
                  onChange={(e) => setModalContent(e.target.value)}
                  placeholder="Enter the template instructions, constraints, or step-by-step rules..."
                  className="w-full p-2.5 text-xs font-mono bg-neutral-950 border border-neutral-800 rounded text-neutral-100 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsTemplateModalOpen(false)}
                  className="text-neutral-400 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  {editingTemplate ? 'Save Template' : 'Create Template'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
