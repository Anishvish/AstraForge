import React from "react";
import { Sparkles, Terminal as TermIcon, FileCode, FolderOpen } from "lucide-react";
import { useWorkspaceStore } from "@/stores/workspace";
import { useUIStore } from "@/stores/ui";

export function WelcomeTab() {
  const openProject = useWorkspaceStore((s) => s.openProject);
  const toggleTerminal = useUIStore((s) => s.toggleTerminal);

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 bg-zinc-950 text-zinc-300 gap-8">
      <div className="flex flex-col items-center gap-2 select-none text-center">
        <div className="text-3xl font-extrabold tracking-wider bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
          ASTRAFORGE
        </div>
        <p className="text-sm text-zinc-500">The Autonomous AI Development Environment</p>
      </div>

      <div className="grid grid-cols-2 gap-4 max-w-md w-full">
        <button
          onClick={openProject}
          className="flex flex-col items-center justify-center gap-3 p-5 rounded-lg border border-zinc-850 hover:border-indigo-500 hover:bg-zinc-900/40 text-zinc-300 transition duration-200 cursor-pointer shadow-lg"
        >
          <FolderOpen size={24} className="text-indigo-400" />
          <div className="flex flex-col text-center">
            <span className="text-sm font-semibold">Open Folder</span>
            <span className="text-[11px] text-zinc-500 mt-1">Open a local workspace directory</span>
          </div>
        </button>

        <button
          onClick={toggleTerminal}
          className="flex flex-col items-center justify-center gap-3 p-5 rounded-lg border border-zinc-850 hover:border-indigo-500 hover:bg-zinc-900/40 text-zinc-300 transition duration-200 cursor-pointer shadow-lg"
        >
          <TermIcon size={24} className="text-indigo-400" />
          <div className="flex flex-col text-center">
            <span className="text-sm font-semibold">Open Terminal</span>
            <span className="text-[11px] text-zinc-500 mt-1">Spawn a terminal shell shell</span>
          </div>
        </button>
      </div>

      <div className="flex flex-col gap-2 max-w-md w-full border-t border-zinc-900 pt-6 text-xs text-zinc-500">
        <div className="flex justify-between items-center px-2">
          <span>Search Commands</span>
          <kbd className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded font-semibold text-[10px]">Ctrl + K</kbd>
        </div>
        <div className="flex justify-between items-center px-2">
          <span>Toggle Sidebar</span>
          <kbd className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded font-semibold text-[10px]">Ctrl + B</kbd>
        </div>
        <div className="flex justify-between items-center px-2">
          <span>Toggle Terminal</span>
          <kbd className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded font-semibold text-[10px]">Ctrl + `</kbd>
        </div>
      </div>
    </div>
  );
}
