import { AppDataPayload } from '../types';
import { isTauriDesktop, invokeDesktopCommand } from './environment';

const API_BASE = '/api/data';
const BACKUP_STORAGE_KEY = 'projectflow_offline_backup_v1';

export const apiService = {
  /**
   * Fetch all application data.
   * - In Desktop mode: reads from isolated ./data/projects.json via native Rust IPC
   * - In Web mode: reads from /api/data on port 4000
   */
  async fetchData(): Promise<AppDataPayload | null> {
    // 1. Try Desktop Mode (Native Tauri)
    if (isTauriDesktop()) {
      try {
        const data = await invokeDesktopCommand<AppDataPayload>('load_project_data');
        if (data) {
          localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(data));
          return data;
        }
      } catch (err) {
        console.warn('Native desktop data load failed, checking web API fallback:', err);
      }
    }

    // 2. Web Mode (Fetch via REST API)
    try {
      const response = await fetch(API_BASE, {
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      const data: AppDataPayload = await response.json();
      localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(data));
      return data;
    } catch (error) {
      console.warn('Could not fetch from server API, falling back to cached snapshot:', error);
      const cached = localStorage.getItem(BACKUP_STORAGE_KEY);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch {
          return null;
        }
      }
      return null;
    }
  },

  /**
   * Atomically save state payload to disk.
   * - In Desktop mode: writes to ./data/projects.json next to .exe via native Rust IPC
   * - In Web mode: writes to /api/data on port 4000
   */
  async saveData(payload: AppDataPayload): Promise<boolean> {
    // Immediate local cache
    try {
      localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.error('LocalStorage write error', e);
    }

    // 1. Desktop Mode
    if (isTauriDesktop()) {
      try {
        const result = await invokeDesktopCommand<boolean>('save_project_data', { payload });
        return result ?? true;
      } catch (err) {
        console.warn('Desktop native save failed, trying web fallback:', err);
      }
    }

    // 2. Web Mode
    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return response.ok;
    } catch (error) {
      console.error('Failed to write JSON payload to server disk:', error);
      return false;
    }
  },

  /**
   * Get direct download URL for the projects.json file
   */
  getExportUrl(): string {
    return '/api/data/export';
  },

  /**
   * Fetch all global prompt templates from data/prompts.json
   */
  async fetchPrompts(): Promise<import('../types').PromptTemplate[]> {
    try {
      const response = await fetch('/api/prompts', {
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.warn('Could not fetch prompts from server API:', error);
      return [];
    }
  },

  /**
   * Save prompt templates to data/prompts.json
   */
  async savePrompts(templates: import('../types').PromptTemplate[]): Promise<boolean> {
    try {
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templates),
      });
      return response.ok;
    } catch (error) {
      console.error('Failed to save prompts to server disk:', error);
      return false;
    }
  },

  /**
   * Get direct download URL for the prompts.json file
   */
  getPromptsExportUrl(): string {
    return '/api/prompts/export';
  },
};

