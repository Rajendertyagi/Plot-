/**
 * Environment detection and runtime mode helper.
 * Supports dual-mode:
 * - 'desktop': Running inside Tauri v2 native portable window (Zero Node/Bun needed on client).
 * - 'web': Running in web browser (Port 4000 or local dev server).
 */

export type AppRuntimeMode = 'desktop' | 'web';

export function isTauriDesktop(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(
    (window as any).__TAURI_INTERNALS__ ||
    (window as any).__TAURI__ ||
    (window as any).__TAURI_METADATA__
  );
}

export function getAppRuntimeMode(): AppRuntimeMode {
  return isTauriDesktop() ? 'desktop' : 'web';
}

/**
 * Safe invoke helper for Tauri commands.
 * Falls back to null if Tauri is not present.
 */
export async function invokeDesktopCommand<T>(cmd: string, args?: Record<string, any>): Promise<T | null> {
  if (!isTauriDesktop()) return null;
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    return await invoke<T>(cmd, args);
  } catch (error) {
    console.warn(`Desktop command "${cmd}" failed:`, error);
    throw error;
  }
}
