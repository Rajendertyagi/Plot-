import { AppDataPayload } from '../types';

const API_BASE = '/api/data';
const BACKUP_STORAGE_KEY = 'projectflow_offline_backup_v1';

export const apiService = {
  /**
   * Fetch all application data from the server-backed JSON file on disk
   */
  async fetchData(): Promise<AppDataPayload | null> {
    try {
      const response = await fetch(API_BASE, {
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      const data: AppDataPayload = await response.json();
      // Cache local copy for offline resilience
      localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(data));
      return data;
    } catch (error) {
      console.warn('Could not fetch from server API, falling back to cached disk snapshot:', error);
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
   * Atomically save the entire state payload directly to data/projects.json on disk
   */
  async saveData(payload: AppDataPayload): Promise<boolean> {
    // Immediate local cache
    try {
      localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.error('LocalStorage write error', e);
    }

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
};
