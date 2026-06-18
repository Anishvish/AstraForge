import * as React from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Minus, Square, X, FolderOpen, Terminal as TermIcon } from "lucide-react";
import { useWorkspaceStore } from "@/stores/workspace";
import { useUIStore } from "@/stores/ui";

export function TitleBar() {
  const projectPath = useWorkspaceStore((s) => s.projectPath);
  const openProject = useWorkspaceStore((s) => s.openProject);
  const toggleTerminal = useUIStore((s) => s.toggleTerminal);
  
  const projectName = projectPath ? projectPath.split(/[/\\]/).pop() : "No Project Open";

  const handleMinimize = async () => {
    try {
      const win = getCurrentWindow();
      await win.minimize();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMaximize = async () => {
    try {
      const win = getCurrentWindow();
      if (await win.isMaximized()) {
        await win.unmaximize();
      } else {
        await win.maximize();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleClose = async () => {
    try {
      const win = getCurrentWindow();
      await win.close();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      data-tauri-drag-region
      className="h-9 bg-zinc-950 border-b border-zinc-850 flex items-center justify-between px-3 select-none text-zinc-400 text-xs font-medium"
    >
      <div className="flex items-center gap-2" data-tauri-drag-region>
        <span className="font-bold text-indigo-400 tracking-wider">ASTRAFORGE</span>
        <span className="text-zinc-600">|</span>
        <span className="text-zinc-300 font-semibold">{projectName}</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={openProject}
          className="hover:bg-zinc-800 p-1 rounded transition text-zinc-300 flex items-center gap-1.5"
          title="Open Folder"
        >
          <FolderOpen size={13} />
          <span>Open Folder</span>
        </button>
        <button
          onClick={toggleTerminal}
          className="hover:bg-zinc-800 p-1 rounded transition text-zinc-300 flex items-center gap-1.5"
          title="Toggle Terminal"
        >
          <TermIcon size={13} />
          <span>Terminal</span>
        </button>
      </div>

      <div className="flex items-center">
        <button
          onClick={handleMinimize}
          className="hover:bg-zinc-800 h-9 w-10 flex items-center justify-center transition"
        >
          <Minus size={14} />
        </button>
        <button
          onClick={handleMaximize}
          className="hover:bg-zinc-800 h-9 w-10 flex items-center justify-center transition"
        >
          <Square size={12} />
        </button>
        <button
          onClick={handleClose}
          className="hover:bg-red-600 hover:text-white h-9 w-10 flex items-center justify-center transition"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
