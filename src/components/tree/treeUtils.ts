import { Project, Feature, Task } from '../../types';
import { TreeNode, TreeSortMode } from './types';

const PRIORITY_WEIGHT: Record<string, number> = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1,
};

export function buildProjectTree(
  project: Project | null,
  features: Feature[],
  tasks: Task[],
  sortMode: TreeSortMode = 'smart',
  searchQuery: string = ''
): { rootNodes: TreeNode[]; totalMatches: number } {
  if (!project) {
    return { rootNodes: [], totalMatches: 0 };
  }

  const query = searchQuery.trim().toLowerCase();
  const projectFeatures = features.filter((f) => f.projectId === project.id);
  const projectTasks = tasks.filter((t) => t.projectId === project.id);

  // Helper map for column info and column index
  const columnMap = new Map(project.columns.map((c) => [c.id, c]));
  const columnIndexMap = new Map(project.columns.map((c, idx) => [c.id, idx]));

  let matchCounter = 0;

  const featureNodes: TreeNode[] = projectFeatures
    .map((feature) => {
      const featTasks = projectTasks.filter((t) => t.featureId === feature.id);

      // Sort tasks based on sortMode
      const sortedTasks = [...featTasks].sort((a, b) => {
        if (sortMode === 'smart') {
          // In Progress or unfinished tasks first, then by priority
          const colA = columnMap.get(a.statusId);
          const colB = columnMap.get(b.statusId);
          const doneA = colA?.isDone ? 1 : 0;
          const doneB = colB?.isDone ? 1 : 0;
          if (doneA !== doneB) return doneA - doneB;

          // Priority comparison (Urgent > High > Medium > Low)
          const pA = PRIORITY_WEIGHT[a.priority] || 0;
          const pB = PRIORITY_WEIGHT[b.priority] || 0;
          if (pA !== pB) return pB - pA;

          return (b.createdAt || '').localeCompare(a.createdAt || '');
        }

        if (sortMode === 'alphabetical') {
          return a.title.localeCompare(b.title);
        }

        if (sortMode === 'status') {
          const idxA = columnIndexMap.get(a.statusId) ?? 999;
          const idxB = columnIndexMap.get(b.statusId) ?? 999;
          if (idxA !== idxB) return idxA - idxB;
          return (b.createdAt || '').localeCompare(a.createdAt || '');
        }

        return (b.createdAt || '').localeCompare(a.createdAt || '');
      });

      // Map tasks to TreeNode
      const taskNodes: TreeNode[] = sortedTasks
        .map((task) => {
          const column = columnMap.get(task.statusId);
          const isDone = column?.isDone ?? false;

          // Linked Code File sub-nodes
          const fileNodes: TreeNode[] = (task.linkedFiles || []).map((filePath, idx) => {
            const fileMatches = query ? filePath.toLowerCase().includes(query) : true;
            if (query && fileMatches) matchCounter++;

            return {
              id: `${task.id}-file-${idx}`,
              label: filePath,
              kind: 'file' as const,
              level: 2,
              parentId: task.id,
              data: { filePath, taskId: task.id },
              hasChildren: false,
            };
          });

          // Subtask checklist sub-nodes
          const subtaskNodes: TreeNode[] = (task.subtasks || []).map((subtask) => {
            const subtaskMatches = query ? subtask.title.toLowerCase().includes(query) : true;
            if (query && subtaskMatches) matchCounter++;

            return {
              id: subtask.id,
              label: subtask.title,
              kind: 'subtask' as const,
              level: 2,
              parentId: task.id,
              data: subtask,
              isDone: subtask.completed,
              hasChildren: false,
            };
          });

          const taskChildren: TreeNode[] = [...fileNodes, ...subtaskNodes];

          const taskMatches =
            !query ||
            task.title.toLowerCase().includes(query) ||
            task.description?.toLowerCase().includes(query) ||
            fileNodes.some((f) => f.label.toLowerCase().includes(query)) ||
            subtaskNodes.some((s) => s.label.toLowerCase().includes(query));

          if (query && taskMatches) {
            matchCounter++;
          }

          const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
          const subtaskBadge =
            task.subtasks.length > 0 ? `${completedSubtasks}/${task.subtasks.length}` : undefined;

          return {
            id: task.id,
            label: task.title,
            kind: 'task' as const,
            level: 1,
            parentId: feature.id,
            data: task,
            children: taskChildren,
            hasChildren: taskChildren.length > 0,
            isDone,
            priority: task.priority,
            statusColor: column?.color ? undefined : '#6366f1',
            statusName: column?.name || 'Todo',
            badge: subtaskBadge,
            taskMatches,
          };
        })
        .filter((t) => {
          if (!query) return true;
          return t.taskMatches;
        });

      const featureTitleMatches = query ? feature.title.toLowerCase().includes(query) : true;
      if (query && featureTitleMatches) matchCounter++;

      const doneTasksCount = featTasks.filter((t) => {
        const col = columnMap.get(t.statusId);
        return col?.isDone;
      }).length;

      return {
        id: feature.id,
        label: feature.title,
        kind: 'feature' as const,
        level: 0,
        data: feature,
        children: taskNodes,
        hasChildren: taskNodes.length > 0,
        badge: `${doneTasksCount}/${featTasks.length}`,
        featureMatches: featureTitleMatches || taskNodes.length > 0,
      };
    })
    .filter((f) => {
      if (!query) return true;
      return f.featureMatches;
    });

  // Sort feature nodes
  const sortedFeatures = [...featureNodes].sort((a, b) => {
    if (sortMode === 'alphabetical') {
      return a.label.localeCompare(b.label);
    }
    return 0;
  });

  return { rootNodes: sortedFeatures, totalMatches: matchCounter };
}
