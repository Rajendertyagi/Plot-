import { AppDataPayload, PromptTemplate } from '../types';
import { isTauriDesktop, invokeDesktopCommand } from './environment';
import { initialProjectsData, initialPromptsData } from '../data/initialData';

const STORAGE_KEY = 'projectflow_data_v1';
const PROMPTS_STORAGE_KEY = 'projectflow_prompts_v1';

export const apiService = {
  /**
   * Fetch all application data.
   * Priority order:
   * 1. Desktop Mode: native Tauri IPC (`load_project_data`) -> writes/reads ./data/projects.json
   * 2. Web Server Mode: Axum REST API (`GET /api/data`)
   * 3. Static/Offline Mode: browser localStorage (seeded with default bundled data)
   */
  async fetchData(): Promise<AppDataPayload | null> {
    // 1. Desktop Mode (Native Tauri)
    if (isTauriDesktop()) {
      try {
        const data = await invokeDesktopCommand<AppDataPayload>('load_project_data');
        if (data && data.projects) {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          } catch {}
          return data;
        }
      } catch (err) {
        console.warn('Native desktop data load failed, checking fallback:', err);
      }
    }

    // 2. Web Server Mode (Axum REST API /api/data)
    try {
      const res = await fetch('/api/data', {
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const data = (await res.json()) as AppDataPayload;
        if (data && Array.isArray(data.projects) && data.projects.length > 0) {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          } catch {}
          return data;
        }
      }
    } catch {
      // Server not reachable (static offline preview), fall through to localStorage
    }

    // 3. Web Mode (Browser LocalStorage with seed fallback)
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          return JSON.parse(stored) as AppDataPayload;
        } catch {
          // If JSON parse fails, fall through to initial data
        }
      }

      // Initialize with bundled default seed data
      const defaultData = initialProjectsData as unknown as AppDataPayload;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
      } catch {}
      return defaultData;
    } catch (error) {
      console.warn('Could not read from localStorage, using default seed:', error);
      return initialProjectsData as unknown as AppDataPayload;
    }
  },

  /**
   * Save state payload.
   * - In Desktop mode: writes to ./data/projects.json next to .exe via native Rust IPC
   * - In Web Server mode: posts to /api/data
   * - Always updates local cache in localStorage
   */
  async saveData(payload: AppDataPayload): Promise<boolean> {
    // 1. Save to local browser cache
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.error('LocalStorage write error', e);
    }

    // 2. Desktop Mode (Tauri Rust IPC)
    if (isTauriDesktop()) {
      try {
        const result = await invokeDesktopCommand<boolean>('save_project_data', { payload });
        return result ?? true;
      } catch (err) {
        console.warn('Desktop native save failed:', err);
      }
    }

    // 3. Web Server Mode (Axum REST API)
    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        return true;
      }
    } catch {
      // Ignored if purely offline static mode
    }

    return true;
  },

  /**
   * Get direct download URL for the projects.json file as a client-side Blob URL
   */
  getExportUrl(): string {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) || JSON.stringify(initialProjectsData, null, 2);
      const blob = new Blob([stored], { type: 'application/json' });
      return URL.createObjectURL(blob);
    } catch {
      return '#';
    }
  },

  /**
   * Fetch all global prompt templates
   */
  async fetchPrompts(): Promise<PromptTemplate[]> {
    // 1. Check Web Server API
    try {
      const res = await fetch('/api/prompts', {
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const templates = (await res.json()) as PromptTemplate[];
        if (Array.isArray(templates) && templates.length > 0) {
          try {
            localStorage.setItem(PROMPTS_STORAGE_KEY, JSON.stringify(templates));
          } catch {}
          return templates;
        }
      }
    } catch {
      // Fallback
    }

    // 2. LocalStorage cache
    try {
      const stored = localStorage.getItem(PROMPTS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as PromptTemplate[];
      }
      const initial = initialPromptsData as unknown as PromptTemplate[];
      try {
        localStorage.setItem(PROMPTS_STORAGE_KEY, JSON.stringify(initial));
      } catch {}
      return initial;
    } catch (error) {
      console.warn('Could not fetch prompts, using default seed:', error);
      return initialPromptsData as unknown as PromptTemplate[];
    }
  },

  /**
   * Save prompt templates
   */
  async savePrompts(templates: PromptTemplate[]): Promise<boolean> {
    try {
      localStorage.setItem(PROMPTS_STORAGE_KEY, JSON.stringify(templates));
    } catch (error) {
      console.error('Failed to save prompts to storage:', error);
    }

    // Push to Web Server API if available
    try {
      await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templates),
      });
    } catch {
      // Ignore network errors in offline mode
    }

    return true;
  },

  /**
   * Get direct download URL for the prompts.json file as a client-side Blob URL
   */
  getPromptsExportUrl(): string {
    try {
      const stored = localStorage.getItem(PROMPTS_STORAGE_KEY) || JSON.stringify(initialPromptsData, null, 2);
      const blob = new Blob([stored], { type: 'application/json' });
      return URL.createObjectURL(blob);
    } catch {
      return '#';
    }
  },
};
