import { FileNode, BrowseDirectoryResult } from '../types';
import { isTauriDesktop, invokeDesktopCommand } from './environment';

export const fsApi = {
  /**
   * Browse directories on the host machine for directory finder modal
   */
  async browseDirectory(dir?: string): Promise<BrowseDirectoryResult> {
    if (isTauriDesktop()) {
      try {
        const result = await invokeDesktopCommand<BrowseDirectoryResult>('browse_directory', { dir });
        if (result) return result;
      } catch (err) {
        console.warn('Desktop browse_directory failed, trying web fallback:', err);
      }
    }

    const url = dir ? `/api/fs/browse?dir=${encodeURIComponent(dir)}` : '/api/fs/browse';
    const res = await fetch(url);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || `HTTP error ${res.status}`);
    }
    return res.json();
  },

  /**
   * Get recursive file tree of the specified root folder
   */
  async fetchFileTree(root?: string): Promise<{ rootPath: string; tree: FileNode[] }> {
    if (isTauriDesktop()) {
      try {
        const result = await invokeDesktopCommand<{ rootPath: string; tree: FileNode[] }>('read_tree', { root });
        if (result) return result;
      } catch (err) {
        console.warn('Desktop read_tree failed, trying web fallback:', err);
      }
    }

    const url = root ? `/api/fs/tree?root=${encodeURIComponent(root)}` : '/api/fs/tree';
    const res = await fetch(url);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || `HTTP error ${res.status}`);
    }
    return res.json();
  },

  /**
   * Read raw text content of a file for CodeMirror editor
   */
  async readFile(filePath: string): Promise<{
    filePath: string;
    content: string;
    size: number;
    extension: string;
    modifiedAt: string;
  }> {
    if (isTauriDesktop()) {
      try {
        const result = await invokeDesktopCommand<{
          filePath: string;
          content: string;
          size: number;
          extension: string;
          modifiedAt: string;
        }>('read_file', { filePath });
        if (result) return result;
      } catch (err) {
        console.warn('Desktop read_file failed, trying web fallback:', err);
      }
    }

    const res = await fetch(`/api/fs/read?file=${encodeURIComponent(filePath)}`);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || `HTTP error ${res.status}`);
    }
    return res.json();
  },

  /**
   * Write updated file content to disk
   */
  async saveFile(
    filePath: string,
    content: string
  ): Promise<{ success: boolean; filePath: string; size: number; savedAt: string }> {
    if (isTauriDesktop()) {
      try {
        const result = await invokeDesktopCommand<{
          success: boolean;
          filePath: string;
          size: number;
          savedAt: string;
        }>('write_file', { filePath, content });
        if (result) return result;
      } catch (err) {
        console.warn('Desktop write_file failed, trying web fallback:', err);
      }
    }

    const res = await fetch('/api/fs/write', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filePath, content }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || `HTTP error ${res.status}`);
    }
    return res.json();
  },

  /**
   * Create a new file or directory on disk
   */
  async createItem(targetPath: string, isDirectory: boolean): Promise<boolean> {
    if (isTauriDesktop()) {
      try {
        const result = await invokeDesktopCommand<boolean>('create_item', { targetPath, isDirectory });
        if (result !== null) return result;
      } catch (err) {
        console.warn('Desktop create_item failed, trying web fallback:', err);
      }
    }

    const res = await fetch('/api/fs/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetPath, isDirectory }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || `HTTP error ${res.status}`);
    }
    return true;
  },
};
