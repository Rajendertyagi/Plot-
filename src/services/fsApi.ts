import { FileNode, BrowseDirectoryResult } from '../types';
import { isTauriDesktop, invokeDesktopCommand } from './environment';

// Default virtual workspace files for web browser preview mode
const VIRTUAL_FS_STORAGE_KEY = 'projectflow_virtual_fs_v1';

const DEFAULT_VIRTUAL_FILES: Record<string, string> = {
  'package.json': JSON.stringify(
    {
      name: 'my-project',
      version: '1.0.0',
      private: true,
      scripts: {
        dev: 'vite',
        build: 'vite build',
      },
      dependencies: {
        react: '^19.0.0',
      },
    },
    null,
    2
  ),
  'README.md': '# Project Documentation\n\nWelcome to your project workspace! You can inspect, edit, and organize project tasks directly in ProjectFlow.',
  'src/App.tsx': `export default function App() {\n  return (\n    <main className="min-h-screen bg-neutral-950 text-white p-8">\n      <h1 className="text-2xl font-bold">Hello World</h1>\n    </main>\n  );\n}\n`,
  'src/index.css': `@import "tailwindcss";\n`,
};

function getVirtualFileStore(): Record<string, string> {
  try {
    const raw = localStorage.getItem(VIRTUAL_FS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { ...DEFAULT_VIRTUAL_FILES };
}

function saveVirtualFileStore(store: Record<string, string>) {
  try {
    localStorage.setItem(VIRTUAL_FS_STORAGE_KEY, JSON.stringify(store));
  } catch {}
}

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
        console.warn('Desktop browse_directory failed:', err);
      }
    }

    // Web fallback: virtual directory navigation
    const current = dir || '/workspace';
    return {
      exists: true,
      currentPath: current,
      parentPath: current === '/workspace' ? null : '/workspace',
      directories: ['src', 'public', 'docs', 'tests', 'data'],
    };
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
        console.warn('Desktop read_tree failed:', err);
      }
    }

    // Web fallback: build tree from virtual files
    const store = getVirtualFileStore();
    const rootPath = root || '/workspace';
    const tree: FileNode[] = [
      {
        name: 'package.json',
        path: `${rootPath}/package.json`,
        relativePath: 'package.json',
        isDirectory: false,
        size: store['package.json']?.length || 120,
        extension: '.json',
      },
      {
        name: 'README.md',
        path: `${rootPath}/README.md`,
        relativePath: 'README.md',
        isDirectory: false,
        size: store['README.md']?.length || 150,
        extension: '.md',
      },
      {
        name: 'src',
        path: `${rootPath}/src`,
        relativePath: 'src',
        isDirectory: true,
        children: [
          {
            name: 'App.tsx',
            path: `${rootPath}/src/App.tsx`,
            relativePath: 'src/App.tsx',
            isDirectory: false,
            size: store['src/App.tsx']?.length || 200,
            extension: '.tsx',
          },
          {
            name: 'index.css',
            path: `${rootPath}/src/index.css`,
            relativePath: 'src/index.css',
            isDirectory: false,
            size: store['src/index.css']?.length || 30,
            extension: '.css',
          },
        ],
      },
    ];

    return { rootPath, tree };
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
        console.warn('Desktop read_file failed:', err);
      }
    }

    // Web fallback: virtual file read
    const store = getVirtualFileStore();
    // Normalize path by stripping /workspace/ prefix if present
    const normalizedKey = filePath.replace(/^\/?(workspace\/)?/, '');
    const content = store[normalizedKey] ?? store[filePath] ?? `// File: ${filePath}\n`;
    const ext = filePath.includes('.') ? `.${filePath.split('.').pop()?.toLowerCase()}` : '';

    return {
      filePath,
      content,
      size: content.length,
      extension: ext,
      modifiedAt: new Date().toISOString(),
    };
  },

  /**
   * Write updated file content to disk / virtual store
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
        console.warn('Desktop write_file failed:', err);
      }
    }

    // Web fallback: save in virtual file store
    const store = getVirtualFileStore();
    const normalizedKey = filePath.replace(/^\/?(workspace\/)?/, '');
    store[normalizedKey] = content;
    saveVirtualFileStore(store);

    return {
      success: true,
      filePath,
      size: content.length,
      savedAt: new Date().toISOString(),
    };
  },

  /**
   * Create a new file or directory
   */
  async createItem(targetPath: string, isDirectory: boolean): Promise<boolean> {
    if (isTauriDesktop()) {
      try {
        const result = await invokeDesktopCommand<boolean>('create_item', { targetPath, isDirectory });
        if (result !== null) return result;
      } catch (err) {
        console.warn('Desktop create_item failed:', err);
      }
    }

    if (!isDirectory) {
      const store = getVirtualFileStore();
      const normalizedKey = targetPath.replace(/^\/?(workspace\/)?/, '');
      store[normalizedKey] = '';
      saveVirtualFileStore(store);
    }
    return true;
  },
};

