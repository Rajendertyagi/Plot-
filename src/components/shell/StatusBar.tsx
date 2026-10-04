import {
  FolderGit2,
  CheckCircle2,
  HardDrive,
  Code2,
  ChevronUp,
  ChevronDown,
  Monitor,
  Globe,
} from 'lucide-react';
import { ViewLayout } from '../../types';
import { getAppRuntimeMode } from '../../services/environment';

interface StatusBarProps {
  rootDirectory: string;
  projectName: string;
  isSaving: boolean;
  viewLayout: ViewLayout;
  isRepoDockOpen: boolean;
  onToggleRepoDock: () => void;
  onOpenDirectoryFinder: () => void;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  rootDirectory,
  projectName,
  isSaving,
  viewLayout,
  isRepoDockOpen,
  onToggleRepoDock,
  onOpenDirectoryFinder,
}) => {
  const runtimeMode = getAppRuntimeMode();

  return (
    <footer className="h-6 shrink-0 bg-[#0a0a0c] border-t border-white/[0.06] px-3 flex items-center justify-between text-[11px] font-mono text-zinc-400 select-none z-20">
      {/* Left items: Directory and Project */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenDirectoryFinder}
          className="flex items-center gap-1.5 hover:text-white transition-colors truncate"
          title="Click to change project directory"
        >
          <HardDrive className="h-3 w-3 text-sky-400 shrink-0" />
          <span className="truncate max-w-xs">{rootDirectory || '.'}</span>
        </button>

        <span className="text-zinc-600 hidden sm:inline">•</span>

        <span className="text-zinc-300 hidden sm:inline truncate">
          {projectName}
        </span>
      </div>

      {/* Right items: Runtime Mode, Save status, View mode, Dock toggle */}
      <div className="flex items-center gap-4">
        {/* Runtime Mode Badge */}
        <div
          className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${
            runtimeMode === 'desktop'
              ? 'bg-purple-950/40 border-purple-500/30 text-purple-300'
              : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
          }`}
          title={
            runtimeMode === 'desktop'
              ? 'Running in 100% Self-Contained Desktop Mode (Zero AppData)'
              : 'Running in Web Mode (Port 4000)'
          }
        >
          {runtimeMode === 'desktop' ? (
            <>
              <Monitor className="h-2.5 w-2.5 text-purple-400" />
              <span>Desktop (Portable)</span>
            </>
          ) : (
            <>
              <Globe className="h-2.5 w-2.5 text-emerald-400" />
              <span>Web Mode :4000</span>
            </>
          )}
        </div>

        <span className="text-zinc-600 hidden sm:inline">•</span>

        {/* Disk Save status */}
        <div className="flex items-center gap-1.5">
          {isSaving ? (
            <>
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-amber-400 text-[10px]">Saving to disk...</span>
            </>
          ) : (
            <>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span className="text-zinc-400 text-[10px]">Disk Synced</span>
            </>
          )}
        </div>

        <span className="text-zinc-600 hidden md:inline">•</span>

        <span className="text-zinc-500 uppercase text-[10px] hidden md:inline">
          {viewLayout} View
        </span>

        {/* Code Explorer Dock Toggle Button */}
        <button
          onClick={onToggleRepoDock}
          className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors text-[10px] ${
            isRepoDockOpen
              ? 'bg-sky-500/20 text-sky-300'
              : 'hover:bg-white/[0.06] hover:text-white'
          }`}
          title="Toggle CodeMirror Repo Explorer (Cmd+J)"
        >
          <Code2 className="h-3 w-3 text-sky-400" />
          <span>Code Explorer</span>
          {isRepoDockOpen ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronUp className="h-3 w-3" />
          )}
        </button>
      </div>
    </footer>
  );
};
