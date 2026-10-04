import { useState, useEffect, useCallback, useRef } from 'react';
import { Project, Feature, Task, StatusColumn, ViewLayout, Subtask, AppDataPayload } from '../types';
import { apiService } from '../services/api';

export function useProjectData() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>('');
  const [viewLayout, setViewLayout] = useState<ViewLayout>('tree');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const isInitialLoaded = useRef(false);

  // Load initial data from disk JSON API
  useEffect(() => {
    let isMounted = true;
    async function load() {
      setIsLoading(true);
      const data = await apiService.fetchData();
      if (isMounted && data) {
        setProjects(data.projects || []);
        setFeatures(data.features || []);
        setTasks(data.tasks || []);
        if (data.activeProjectId) {
          setActiveProjectId(data.activeProjectId);
        } else if (data.projects && data.projects.length > 0) {
          setActiveProjectId(data.projects[0].id);
        }
        if (data.viewLayout) {
          setViewLayout(data.viewLayout);
        }
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

  // Save changes to disk JSON whenever data changes
  const saveToDisk = useCallback(
    async (payload: AppDataPayload) => {
      if (!isInitialLoaded.current) return;
      setIsSaving(true);
      await apiService.saveData(payload);
      setIsSaving(false);
      setLastSaved(new Date());
    },
    []
  );

  // Debounced auto-save effect
  useEffect(() => {
    if (!isInitialLoaded.current) return;

    const timer = setTimeout(() => {
      saveToDisk({
        projects,
        features,
        tasks,
        activeProjectId,
        viewLayout,
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [projects, features, tasks, activeProjectId, viewLayout, saveToDisk]);

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0] || null;

  // Project Actions
  const handleCreateOrUpdateProject = (
    title: string,
    description: string,
    rootDirectory?: string,
    editingProject?: Project | null
  ) => {
    if (editingProject && editingProject.id && editingProject.id.trim() !== '') {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === editingProject.id
            ? { ...p, title, description, rootDirectory: rootDirectory !== undefined ? rootDirectory : p.rootDirectory }
            : p
        )
      );
    } else {
      const defaultCols: StatusColumn[] = [
        { id: 'pending', name: 'Pending', color: 'sky' },
        { id: 'holding', name: 'Holding', color: 'amber' },
        { id: 'bug', name: 'Bug', color: 'rose' },
        { id: 'done', name: 'Done', color: 'emerald', isDone: true },
      ];
      const newProj: Project = {
        id: `proj-${Date.now()}`,
        title: title || 'New Project',
        description: description || '',
        columns: defaultCols,
        createdAt: new Date().toISOString().split('T')[0],
        rootDirectory: rootDirectory || '.',
      };
      setProjects((prev) => [newProj, ...prev]);
      setActiveProjectId(newProj.id);
    }
  };

  const handleAddProjectFromDirectory = (directoryPath: string) => {
    const cleanPath = directoryPath.trim() || '.';
    const folderName = cleanPath.replace(/[/\\]+$/, '').split(/[/\\]/).pop() || 'New Project';

    // If existing project matches this directory, switch to it
    const existing = projects.find((p) => p.rootDirectory === cleanPath);
    if (existing) {
      setActiveProjectId(existing.id);
      return existing;
    }

    const defaultCols: StatusColumn[] = [
      { id: 'pending', name: 'Pending', color: 'sky' },
      { id: 'holding', name: 'Holding', color: 'amber' },
      { id: 'bug', name: 'Bug', color: 'rose' },
      { id: 'done', name: 'Done', color: 'emerald', isDone: true },
    ];
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      title: folderName,
      description: `Project repository linked to ${cleanPath}`,
      columns: defaultCols,
      createdAt: new Date().toISOString().split('T')[0],
      rootDirectory: cleanPath,
    };
    setProjects((prev) => [newProj, ...prev]);
    setActiveProjectId(newProj.id);
    return newProj;
  };

  const handleUpdateProjectDirectory = (projectId: string, directoryPath: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, rootDirectory: directoryPath } : p))
    );
  };

  const handleDeleteProject = (projectId: string) => {
    if (projects.length <= 1) {
      alert('You cannot delete the only remaining project.');
      return;
    }
    if (confirm('Are you sure you want to delete this project and all its features and tasks?')) {
      const remaining = projects.filter((p) => p.id !== projectId);
      setProjects(remaining);
      setFeatures((prev) => prev.filter((f) => f.projectId !== projectId));
      setTasks((prev) => prev.filter((t) => t.projectId !== projectId));
      if (activeProjectId === projectId) {
        setActiveProjectId(remaining[0]?.id || '');
      }
    }
  };

  // Feature Actions
  const handleCreateOrUpdateFeature = (
    data: {
      title: string;
      description: string;
      tags?: string[];
      lead?: string;
      targetDate?: string;
    },
    editingFeature?: Feature | null
  ) => {
    if (!activeProject) return;

    if (editingFeature) {
      setFeatures((prev) =>
        prev.map((f) =>
          f.id === editingFeature.id
            ? {
                ...f,
                title: data.title,
                description: data.description,
                tags: data.tags,
                lead: data.lead,
                targetDate: data.targetDate,
              }
            : f
        )
      );
    } else {
      const newFeature: Feature = {
        id: `feat-${Date.now()}`,
        projectId: activeProject.id,
        title: data.title,
        description: data.description,
        tags: data.tags,
        lead: data.lead,
        targetDate: data.targetDate,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setFeatures((prev) => [...prev, newFeature]);
    }
  };

  const handleDeleteFeature = (featureId: string) => {
    if (confirm('Are you sure you want to delete this feature and its tasks?')) {
      setFeatures((prev) => prev.filter((f) => f.id !== featureId));
      setTasks((prev) => prev.filter((t) => t.featureId !== featureId));
    }
  };

  // Task Actions
  const handleSaveTask = (
    taskData: Omit<Task, 'id' | 'createdAt'>,
    editingTask?: Task | null
  ) => {
    if (editingTask) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === editingTask.id
            ? {
                ...t,
                ...taskData,
              }
            : t
        )
      );
    } else {
      const newTask: Task = {
        id: `task-${Date.now()}`,
        createdAt: new Date().toISOString().split('T')[0],
        ...taskData,
      };
      setTasks((prev) => [newTask, ...prev]);
    }
  };

  const handleUpdateTaskStatus = (taskId: string, newStatusId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, statusId: newStatusId } : t))
    );
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          subtasks: t.subtasks.map((s) =>
            s.id === subtaskId ? { ...s, completed: !s.completed } : s
          ),
        };
      })
    );
  };

  const handleAddSubtaskToTask = (taskId: string, title: string) => {
    const newSub: Subtask = {
      id: `sub-${Date.now()}`,
      title,
      completed: false,
    };
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, subtasks: [...t.subtasks, newSub] } : t))
    );
  };

  const handleDeleteSubtaskFromTask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          subtasks: t.subtasks.filter((s) => s.id !== subtaskId),
        };
      })
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleSaveColumns = (newColumns: StatusColumn[]) => {
    if (!activeProject) return;

    setProjects((prev) =>
      prev.map((p) => (p.id === activeProject.id ? { ...p, columns: newColumns } : p))
    );

    const validColIds = newColumns.map((c) => c.id);
    const fallbackColId = newColumns[0]?.id || 'pending';
    setTasks((prev) =>
      prev.map((t) => {
        if (t.projectId === activeProject.id && !validColIds.includes(t.statusId)) {
          return { ...t, statusId: fallbackColId };
        }
        return t;
      })
    );
  };

  return {
    projects,
    features,
    tasks,
    activeProject,
    activeProjectId,
    setActiveProjectId,
    viewLayout,
    setViewLayout,
    isLoading,
    isSaving,
    lastSaved,
    handleCreateOrUpdateProject,
    handleAddProjectFromDirectory,
    handleUpdateProjectDirectory,
    handleDeleteProject,
    handleCreateOrUpdateFeature,
    handleDeleteFeature,
    handleSaveTask,
    handleUpdateTaskStatus,
    handleToggleSubtask,
    handleAddSubtaskToTask,
    handleDeleteSubtaskFromTask,
    handleDeleteTask,
    handleSaveColumns,
    exportUrl: apiService.getExportUrl(),
  };
}
