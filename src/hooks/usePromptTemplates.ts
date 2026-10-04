import { useState, useEffect, useCallback, useRef } from 'react';
import { PromptTemplate } from '../types';
import { apiService } from '../services/api';

const DEFAULT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'tpl-impl-plan',
    title: 'Full Implementation Plan',
    category: 'Implementation',
    description: 'Inspect codebase, evaluate patterns, and propose a concise plan before writing code',
    content: 'Please inspect the relevant codebase files, check for existing patterns, formulate a concise implementation plan, and verify all imports and typings before generating code.',
    createdAt: new Date().toISOString().split('T')[0],
    isBuiltIn: true,
  },
  {
    id: 'tpl-code-review',
    title: 'Code Review & Security Audit',
    category: 'Review',
    description: 'Audit code for edge cases, null checks, security vulnerabilities, and typing standards',
    content: 'Review the proposed code changes for: 1) Strict TypeScript types without any shortcuts, 2) Proper null/undefined checks, 3) Token/credential leak prevention, 4) Performance & rendering overhead.',
    createdAt: new Date().toISOString().split('T')[0],
    isBuiltIn: true,
  },
  {
    id: 'tpl-unit-tests',
    title: 'Unit & Integration Tests',
    category: 'Testing',
    description: 'Generate comprehensive test cases covering positive and edge paths',
    content: 'Generate complete unit and integration tests covering the acceptance criteria checklist, edge cases, error conditions, and mocks for external services.',
    createdAt: new Date().toISOString().split('T')[0],
    isBuiltIn: true,
  },
  {
    id: 'tpl-bugfix',
    title: 'Bugfix & Root Cause Diagnosis',
    category: 'Debugging',
    description: 'Diagnose failure points and apply minimal robust fixes',
    content: 'Analyze the error stack trace, diagnose the root cause, identify affected files, and apply a minimal, non-breaking fix with regression guards.',
    createdAt: new Date().toISOString().split('T')[0],
    isBuiltIn: true,
  },
  {
    id: 'tpl-refactor',
    title: 'Clean Modular Refactor',
    category: 'Architecture',
    description: 'Decompose monolithic files into single-responsibility modules and pure utilities',
    content: 'Refactor this component into decoupled single-responsibility modules with explicit TypeScript interfaces, pure utility functions, and zero circular dependencies.',
    createdAt: new Date().toISOString().split('T')[0],
    isBuiltIn: true,
  },
];

export function usePromptTemplates() {
  const [templates, setTemplates] = useState<PromptTemplate[]>(DEFAULT_TEMPLATES);
  const [isLoading, setIsLoading] = useState(true);
  const isInitialLoaded = useRef(false);

  // Fetch prompts on mount
  useEffect(() => {
    let isMounted = true;
    async function load() {
      setIsLoading(true);
      const data = await apiService.fetchPrompts();
      if (isMounted && data && Array.isArray(data) && data.length > 0) {
        setTemplates(data);
      }
      if (isMounted) {
        setIsLoading(false);
        isInitialLoaded.current = true;
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  // Save changes to disk
  const saveToDisk = useCallback(async (newTemplates: PromptTemplate[]) => {
    if (!isInitialLoaded.current) return;
    await apiService.savePrompts(newTemplates);
  }, []);

  const handleAddTemplate = (data: Omit<PromptTemplate, 'id' | 'createdAt'>) => {
    const newTemplate: PromptTemplate = {
      id: `tpl-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      ...data,
    };
    setTemplates((prev) => {
      const updated = [newTemplate, ...prev];
      saveToDisk(updated);
      return updated;
    });
  };

  const handleUpdateTemplate = (updated: PromptTemplate) => {
    setTemplates((prev) => {
      const next = prev.map((t) => (t.id === updated.id ? updated : t));
      saveToDisk(next);
      return next;
    });
  };

  const handleDeleteTemplate = (templateId: string) => {
    setTemplates((prev) => {
      const next = prev.filter((t) => t.id !== templateId);
      saveToDisk(next);
      return next;
    });
  };

  const handleResetToDefaults = () => {
    setTemplates(DEFAULT_TEMPLATES);
    saveToDisk(DEFAULT_TEMPLATES);
  };

  return {
    templates,
    isLoading,
    handleAddTemplate,
    handleUpdateTemplate,
    handleDeleteTemplate,
    handleResetToDefaults,
    exportUrl: apiService.getPromptsExportUrl(),
  };
}
