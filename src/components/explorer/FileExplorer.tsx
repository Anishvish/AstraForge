import React from "react";
import { FolderPlus, FilePlus, RotateCw, ChevronRight } from "lucide-react";
import { useWorkspaceStore } from "@/stores/workspace";
import { FileTreeItem } from "./FileTreeItem";

export function FileExplorer() {
  const fileTree = useWorkspaceStore((s) => s.fileTree);
  const projectPath = useWorkspaceStore((s) => s.projectPath);
  const openProject = useWorkspaceStore((s) => s.openProject);
  const refreshFileTree = useWorkspaceStore((s) => s.refreshFileTree);

  return (
    <div className="flex flex-col h-full select-none text-zinc-300">
      <div className="h-10 border-b border-zinc-850 px-3 flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Explorer</span>
        {projectPath && (
          <div className="flex items-center gap-1">
            <button onClick={() => {}} className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-200 transition" title="New File">
              <FilePlus size={14} />
            </button>
            <button onClick={() => {}} className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-200 transition" title="New Folder">
              <FolderPlus size={14} />
            </button>
            <button onClick={refreshFileTree} className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-200 transition" title="Refresh">
              <RotateCw size={14} />
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-1">
        {projectPath && fileTree ? (
          <FileTreeItem item={fileTree} depth={0} />
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-4 text-center gap-3">
            <p className="text-xs text-zinc-500">You have not yet opened a folder.</p>
            <button
              onClick={openProject}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded text-xs font-medium transition shadow-md"
            >
              Open Folder
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
