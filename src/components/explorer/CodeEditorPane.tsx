import React, { useState, useEffect, useCallback, useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { oneDark } from '@codemirror/theme-one-dark';
import { javascript } from '@codemirror/lang-javascript';
import { json } from '@codemirror/lang-json';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { markdown } from '@codemirror/lang-markdown';
import { python } from '@codemirror/lang-python';
import {
  Save,
  Eye,
  Edit3,
  FileCode,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RotateCw,
} from 'lucide-react';
import { fsApi } from '../../services/fsApi';
import { FileNode } from '../../types';

interface CodeEditorPaneProps {
  selectedFile: FileNode | null;
  onFileSaved?: () => void;
}

export const CodeEditorPane: React.FC<CodeEditorPaneProps> = ({
  selectedFile,
  onFileSaved,
}) => {
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(true);
  const [copied, setCopied] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const isDirty = content !== originalContent;

  // Load file content when selectedFile changes
  const loadFileContent = useCallback(async (filePath: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fsApi.readFile(filePath);
      setContent(data.content);
      setOriginalContent(data.content);
    } catch (err: any) {
      setError(err.message || 'Failed to read file from disk');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedFile && !selectedFile.isDirectory) {
      loadFileContent(selectedFile.path);
    } else {
      setContent('');
      setOriginalContent('');
    }
  }, [selectedFile, loadFileContent]);

  // Save changes to disk
  const handleSave = useCallback(async () => {
    if (!selectedFile || selectedFile.isDirectory || saving) return;

    setSaving(true);
    setError(null);
    try {
      await fsApi.saveFile(selectedFile.path, content);
      setOriginalContent(content);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
      if (onFileSaved) onFileSaved();
    } catch (err: any) {
      setError(err.message || 'Failed to write file to disk');
    } finally {
      setSaving(false);
    }
  }, [selectedFile, content, saving, onFileSaved]);

  // Keyboard shortcut Ctrl+S / Cmd+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (isDirty && isEditMode) {
          handleSave();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave, isDirty, isEditMode]);

  // Copy code to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Determine CodeMirror extensions based on file extension
  const extensions = useMemo(() => {
    const ext = selectedFile?.extension?.toLowerCase() || '';
    const exts = [oneDark];

    if (ext === '.ts' || ext === '.tsx') {
      exts.push(javascript({ jsx: true, typescript: true }));
    } else if (ext === '.js' || ext === '.jsx' || ext === '.mjs' || ext === '.cjs') {
      exts.push(javascript({ jsx: true }));
    } else if (ext === '.json') {
      exts.push(json());
    } else if (ext === '.html') {
      exts.push(html());
    } else if (ext === '.css' || ext === '.scss' || ext === '.less') {
      exts.push(css());
    } else if (ext === '.md' || ext === '.markdown') {
      exts.push(markdown());
    } else if (ext === '.py') {
      exts.push(python());
    }

    return exts;
  }, [selectedFile?.extension]);

  if (!selectedFile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#0f0f11] text-zinc-500 font-mono text-xs select-none">
        <FileCode className="h-10 w-10 text-zinc-700 mb-3" />
        <p className="text-zinc-400 font-medium">No file selected</p>
        <p className="text-[11px] text-zinc-600 mt-1">
          Select any file from the directory tree on the left to view and edit its code.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0d0d0f] overflow-hidden">
      {/* Editor Top Navigation & Action Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06] bg-[#141416] select-none shrink-0">
        {/* Breadcrumb Path & Status */}
        <div className="flex items-center gap-2 min-w-0">
          <FileCode className="h-3.5 w-3.5 text-sky-400 shrink-0" />
          <span className="font-mono text-xs text-zinc-200 font-medium truncate">
            {selectedFile.relativePath || selectedFile.name}
          </span>

          {/* Dirty / Saved Pill */}
          {isDirty ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              Unsaved edits
            </span>
          ) : saveSuccess ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
              <Check className="h-3 w-3" />
              Saved to disk
            </span>
          ) : null}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* View / Edit Mode Switch */}
          <div className="flex items-center bg-white/[0.05] rounded-lg p-0.5 border border-white/[0.04]">
            <button
              onClick={() => setIsEditMode(false)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                !isEditMode
                  ? 'bg-white/[0.12] text-white shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Read-only View Mode"
            >
              <Eye className="h-3 w-3" />
              <span>View</span>
            </button>
            <button
              onClick={() => setIsEditMode(true)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                isEditMode
                  ? 'bg-sky-500/20 text-sky-300 shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Edit Mode (Cmd+S to save)"
            >
              <Edit3 className="h-3 w-3" />
              <span>Edit</span>
            </button>
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            title="Copy code to clipboard"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          </button>

          {/* Reload File */}
          <button
            onClick={() => loadFileContent(selectedFile.path)}
            disabled={loading}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            title="Reload from disk"
          >
            <RotateCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Save Button */}
          {isEditMode && (
            <button
              onClick={handleSave}
              disabled={!isDirty || saving}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all shadow-xs ${
                isDirty
                  ? 'bg-sky-500 hover:bg-sky-400 text-white cursor-pointer'
                  : 'bg-white/[0.04] text-zinc-500 cursor-not-allowed'
              }`}
              title="Save changes to disk (Ctrl+S / Cmd+S)"
            >
              <Save className={`h-3.5 w-3.5 ${saving ? 'animate-spin' : ''}`} />
              <span>{saving ? 'Saving...' : 'Save'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Error alert if any */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 border-b border-rose-500/20 text-rose-400 text-xs font-mono">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* CodeMirror Editor Area */}
      <div className="flex-1 overflow-auto bg-[#0d0d0f]">
        {loading ? (
          <div className="flex items-center justify-center h-full text-zinc-500 text-xs font-mono gap-2">
            <RotateCw className="h-4 w-4 animate-spin text-sky-400" />
            <span>Loading file content from disk...</span>
          </div>
        ) : (
          <CodeMirror
            value={content}
            height="100%"
            theme={oneDark}
            extensions={extensions}
            editable={isEditMode}
            readOnly={!isEditMode}
            onChange={(val) => setContent(val)}
            basicSetup={{
              lineNumbers: true,
              highlightActiveLineGutter: true,
              highlightSpecialChars: true,
              history: true,
              foldGutter: true,
              drawSelection: true,
              dropCursor: true,
              allowMultipleSelections: true,
              indentOnInput: true,
              syntaxHighlighting: true,
              bracketMatching: true,
              closeBrackets: true,
              autocompletion: true,
              rectangularSelection: true,
              crosshairCursor: true,
              highlightActiveLine: true,
              highlightSelectionMatches: true,
              closeBracketsKeymap: true,
              defaultKeymap: true,
              searchKeymap: true,
              historyKeymap: true,
              foldKeymap: true,
              completionKeymap: true,
              lintKeymap: true,
            }}
            className="text-xs font-mono h-full"
          />
        )}
      </div>

      {/* Editor Sub-Footer / Status Info */}
      <div className="flex items-center justify-between px-4 py-1 border-t border-white/[0.04] bg-[#111113] text-[10px] font-mono text-zinc-500 select-none shrink-0">
        <div className="flex items-center gap-3">
          <span>Mode: {isEditMode ? 'Edit (Writable)' : 'View (Read-Only)'}</span>
          <span>Syntax: {selectedFile.extension || 'Plain Text'}</span>
          <span>Lines: {content.split('\n').length}</span>
        </div>
        <div className="flex items-center gap-3">
          <span>UTF-8</span>
          <span>{isDirty ? '● Unsaved' : 'Saved'}</span>
        </div>
      </div>
    </div>
  );
};
