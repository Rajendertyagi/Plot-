export type ColumnColor =
  | 'emerald'
  | 'amber'
  | 'rose'
  | 'sky'
  | 'indigo'
  | 'purple'
  | 'teal'
  | 'slate';

export interface StatusColumn {
  id: string;
  name: string;
  color: ColumnColor;
  isDone?: boolean;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  projectId: string;
  featureId: string;
  title: string;
  description: string;
  statusId: string; // references StatusColumn.id
  priority: TaskPriority;
  aiPromptContext?: string; // AI instructions, prompt draft or requirements
  linkedFiles?: string[]; // Codebase paths relevant to task (e.g. src/App.tsx)
  subtasks: Subtask[];
  createdAt: string;
  // Legacy optional fields for backwards compatibility with existing saved data
  assignee?: string;
  dueDate?: string;
}

export interface Feature {
  id: string;
  projectId: string;
  title: string;
  description: string;
  tags?: string[];
  createdAt: string;
  // Legacy optional fields for backwards compatibility
  lead?: string;
  targetDate?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  columns: StatusColumn[];
  createdAt: string;
  rootDirectory?: string;
}

export type ViewLayout = 'board' | 'tree' | 'files' | 'ai';

export interface AppDataPayload {
  projects: Project[];
  features: Feature[];
  tasks: Task[];
  viewLayout?: ViewLayout;
  activeProjectId?: string;
}

export interface FileNode {
  name: string;
  path: string;
  relativePath: string;
  isDirectory: boolean;
  size?: number;
  extension?: string;
  children?: FileNode[];
}

export interface BrowseDirectoryResult {
  currentPath: string;
  parentPath: string | null;
  directories: string[];
  exists: boolean;
}
