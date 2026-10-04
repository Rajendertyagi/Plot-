import React, { useState, useEffect, useMemo } from 'react';
import { Layers } from 'lucide-react';
import { Project, Feature, Task } from '../../types';
import { TreeNode, TreeSelection, TreeSortMode } from './types';
import { buildProjectTree } from './treeUtils';
import { TreeNodeItem } from './TreeNodeItem';
import { TreeToolbar } from './TreeToolbar';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';

interface TreeViewProps {
  project: Project | null;
  features: Feature[];
  tasks: Task[];
  activeFeatureId: string | null;
  onSelectFeature: (featureId: string | null) => void;
  onSelectTask?: (taskId: string) => void;
  onOpenNewFeatureModal: () => void;
  onEditFeature: (feature: Feature) => void;
  onDeleteFeature: (featureId: string) => void;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
  searchQuery: string;
}

export const TreeView: React.FC<TreeViewProps> = ({
  project,
  features,
  tasks,
  activeFeatureId,
  onSelectFeature,
  onSelectTask,
  onOpenNewFeatureModal,
  onEditFeature,
  onDeleteFeature,
  onToggleSubtask,
  searchQuery,
}) => {
  const [sortMode, setSortMode] = useState<TreeSortMode>('smart');
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});
  const [selection, setSelection] = useState<TreeSelection>({
    nodeId: activeFeatureId,
    kind: activeFeatureId ? 'feature' : null,
  });

  // Build tree data using the pure treeUtils builder
  const { rootNodes } = useMemo(() => {
    return buildProjectTree(project, features, tasks, sortMode, searchQuery);
  }, [project, features, tasks, sortMode, searchQuery]);

  // When searching, auto-expand nodes that match so results are immediately visible
  useEffect(() => {
    if (searchQuery.trim()) {
      const autoExpanded: Record<string, boolean> = {};
      const expandAllRecursive = (nodes: TreeNode[]) => {
        for (const n of nodes) {
          autoExpanded[n.id] = true;
          if (n.children && n.children.length > 0) {
            expandAllRecursive(n.children);
          }
        }
      };
      expandAllRecursive(rootNodes);
      setExpandedMap(autoExpanded);
    }
  }, [searchQuery, rootNodes]);

  // Keep selection synced with activeFeatureId if updated externally
  useEffect(() => {
    if (activeFeatureId !== selection.nodeId) {
      setSelection({
        nodeId: activeFeatureId,
        kind: activeFeatureId ? 'feature' : null,
      });
    }
  }, [activeFeatureId]);

  const toggleExpand = (id: string) => {
    setExpandedMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleExpandAll = () => {
    const allExpanded: Record<string, boolean> = {};
    const expandRec = (nodes: TreeNode[]) => {
      for (const n of nodes) {
        allExpanded[n.id] = true;
        if (n.children) expandRec(n.children);
      }
    };
    expandRec(rootNodes);
    setExpandedMap(allExpanded);
  };

  const handleCollapseAll = () => {
    setExpandedMap({});
  };

  const handleSelectNode = (node: TreeNode) => {
    setSelection({ nodeId: node.id, kind: node.kind });

    if (node.kind === 'feature') {
      onSelectFeature(node.id);
    } else if (node.kind === 'task') {
      if (onSelectTask) {
        onSelectTask(node.id);
      }
      // If task has a parent feature, focus that feature context as well
      if (node.parentId) {
        onSelectFeature(node.parentId);
      }
    } else if (node.kind === 'file' || node.kind === 'subtask') {
      // Find parent task and feature
      if (node.parentId && onSelectTask) {
        onSelectTask(node.parentId);
      }
    }
  };

  const handleSelectAllRoot = () => {
    setSelection({ nodeId: null, kind: null });
    onSelectFeature(null);
  };

  const projectTasks = tasks.filter((t) => t.projectId === project?.id);

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Tree Toolbar: Sort & Expand controls */}
      <TreeToolbar
        sortMode={sortMode}
        onSortModeChange={setSortMode}
        onExpandAll={handleExpandAll}
        onCollapseAll={handleCollapseAll}
        onOpenNewFeatureModal={onOpenNewFeatureModal}
        featureCount={features.length}
      />

      {/* Hierarchical Scroll Area */}
      <ScrollArea className="flex-1 w-full">
        <div className="p-2 space-y-1">
          {/* "All Features & Tasks" root row */}
          <div
            onClick={handleSelectAllRoot}
            className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs cursor-pointer transition-colors ${
              selection.nodeId === null
                ? 'bg-neutral-800 text-neutral-100 font-medium'
                : 'text-neutral-400 hover:bg-neutral-800/40 hover:text-neutral-200'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Layers className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="truncate">All Features & Tasks</span>
            </div>
            <span className="text-[10px] font-mono text-neutral-500 tabular-nums">
              {projectTasks.length}
            </span>
          </div>

          <Separator className="my-1.5 bg-neutral-800/60" />

          {/* Root Feature Nodes */}
          {rootNodes.length === 0 ? (
            <div className="px-3 py-8 text-center text-xs text-neutral-500">
              {searchQuery
                ? `No items match "${searchQuery}"`
                : project
                ? 'No features or tasks created yet.'
                : 'Please select a project.'}
            </div>
          ) : (
            <div className="space-y-0.5">
              {rootNodes.map((node) => (
                <TreeNodeItem
                  key={node.id}
                  node={node}
                  expandedMap={expandedMap}
                  onToggleExpand={toggleExpand}
                  selection={selection}
                  onSelectNode={handleSelectNode}
                  onEditFeature={onEditFeature}
                  onDeleteFeature={onDeleteFeature}
                  onToggleSubtask={onToggleSubtask}
                />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
