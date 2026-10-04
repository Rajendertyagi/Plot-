import { Feature, Task, Subtask, TaskPriority } from '../../types';

export type TreeNodeKind = 'feature' | 'task' | 'file' | 'subtask';

export type TreeSortMode = 'smart' | 'alphabetical' | 'status';

export interface TreeNode {
  id: string;
  label: string;
  kind: TreeNodeKind;
  level: number;
  parentId?: string;
  data?: Feature | Task | Subtask | { filePath: string; taskId: string };
  children?: TreeNode[];
  isDone?: boolean;
  priority?: TaskPriority;
  statusColor?: string;
  statusName?: string;
  badge?: string;
  hasChildren: boolean;
}

export interface TreeSelection {
  nodeId: string | null;
  kind: TreeNodeKind | null;
}
