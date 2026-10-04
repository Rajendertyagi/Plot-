import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  CheckCheck,
  FileCode,
  CheckCircle2,
  FolderTree,
  Send,
  Code2,
} from 'lucide-react';
import { Project, Feature, Task } from '../../types';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';

interface AiPromptConsoleProps {
  project: Project;
  features: Feature[];
  tasks: Task[];
  searchFilter?: string;
}

export const AiPromptConsole: React.FC<AiPromptConsoleProps> = ({
  project,
  features,
  tasks,
  searchFilter = '',
}) => {
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
  const [copied, setCopied] = useState(false);

  const selectedTask = projectTasks.find((t) => t.id === selectedTaskId) || projectTasks[0];
  const parentFeature = features.find((f) => f.id === selectedTask?.featureId);

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
        selectedTask.aiPromptContext
          ? `**Specific AI Instructions & Requirements:**\n${selectedTask.aiPromptContext}\n`
          : '',
        selectedTask.linkedFiles && selectedTask.linkedFiles.length > 0
          ? `**Relevant Codebase Files:**\n${selectedTask.linkedFiles
              .map((f) => `- \`${f}\``)
              .join('\n')}\n`
          : '',
        selectedTask.subtasks.length > 0
          ? `**Acceptance Criteria Checklist:**\n${selectedTask.subtasks
              .map((s) => `- [${s.completed ? 'x' : ' '}] ${s.title}`)
              .join('\n')}\n`
          : '',
        'Please inspect the relevant files, formulate a concise implementation plan, and provide complete, working code changes.',
      ]
        .filter(Boolean)
        .join('\n')
    : 'Select a task to generate an AI prompt.';

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-[calc(100vh-130px)] flex flex-col sm:flex-row gap-4">
      {/* Left: Task Selector */}
      <div className="w-full sm:w-80 rounded-xl bg-neutral-900/60 border border-neutral-800/80 flex flex-col shrink-0 overflow-hidden">
        <div className="p-3 border-b border-neutral-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-semibold text-neutral-200">
              Task Prompt Catalog
            </span>
          </div>
          <span className="text-[10px] font-mono text-neutral-500 tabular-nums">
            {projectTasks.length} tasks
          </span>
        </div>

        <ScrollArea className="flex-1 p-2">
          <div className="space-y-1">
            {projectTasks.map((t) => {
              const isSelected = t.id === selectedTaskId;
              const feat = features.find((f) => f.id === t.featureId);

              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTaskId(t.id)}
                  className={`p-2.5 rounded-lg text-xs cursor-pointer transition-colors space-y-1 ${
                    isSelected
                      ? 'bg-indigo-600/15 border border-indigo-500/40 text-neutral-100'
                      : 'text-neutral-400 hover:bg-neutral-800/40 hover:text-neutral-200'
                  }`}
                >
                  <div className="font-medium truncate">{t.title}</div>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-500">
                    <span className="truncate max-w-[120px]">{feat?.title}</span>
                    {t.linkedFiles && t.linkedFiles.length > 0 && (
                      <>
                        <span>·</span>
                        <span>{t.linkedFiles.length} files</span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Right: Prompt Preview & Copy Console */}
      <div className="flex-1 rounded-xl bg-neutral-900/60 border border-neutral-800/80 flex flex-col overflow-hidden">
        <div className="p-3 border-b border-neutral-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Code2 className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="text-xs font-semibold text-neutral-200 truncate">
              {selectedTask ? selectedTask.title : 'Generated AI Prompt'}
            </span>
          </div>

          <Button
            size="sm"
            onClick={handleCopy}
            className="bg-indigo-600 hover:bg-indigo-500 text-white h-7 text-xs"
          >
            {copied ? (
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
        </div>

        <ScrollArea className="flex-1 p-4">
          <pre className="font-mono text-xs text-neutral-300 whitespace-pre-wrap leading-relaxed select-text">
            {generatedPrompt}
          </pre>
        </ScrollArea>
      </div>
    </div>
  );
};
