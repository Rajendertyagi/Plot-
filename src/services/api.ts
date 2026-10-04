import { AppDataPayload, PromptTemplate } from '../types';
import { isTauriDesktop, invokeDesktopCommand } from './environment';
import initialProjectsData from '../../data/projects.json';
import initialPromptsData from '../../data/prompts.json';

const STORAGE_KEY = 'projectflow_data_v1';
const PROMPTS_STORAGE_KEY = 'projectflow_prompts_v1';

export const apiService = {
  /**
   * Fetch all application data.
   * - In Desktop mode: reads from isolated ./data/projects.json via native Rust IPC
   * - In Web mode: reads from localStorage (seeded with default data on first run)
   */
  async fetchData(): Promise<AppDataPayload | null> {
    // 1. Desktop Mode (Native Tauri)
    if (isTauriDesktop()) {
      try {
        const data = await invokeDesktopCommand<AppDataPayload>('load_project_data');
        if (data) {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          } catch {}
          return data;
        }
      } catch (err) {
        console.warn('Native desktop data load failed, falling back to local snapshot:', err);
      }
    }

    // 2. Web Mode (Browser LocalStorage with seed fallback)
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
   * - In Web mode: writes to localStorage
   */
  async saveData(payload: AppDataPayload): Promise<boolean> {
    // 1. Save to local browser storage
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
      return true;
    } catch (error) {
      console.error('Failed to save prompts to storage:', error);
      return false;
    }
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


