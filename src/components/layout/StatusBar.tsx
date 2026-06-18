import { GitBranch, Cpu, Wifi, WifiOff } from "lucide-react";
import { useWorkspaceStore } from "@/stores/workspace";
import { useGitStore } from "@/stores/git";
import { useEditorStore } from "@/stores/editor";
import { useModelsStore } from "@/stores/models";

export function StatusBar() {
  const projectPath = useWorkspaceStore((s) => s.projectPath);
  const currentBranch = useGitStore((s) => s.currentBranch);
  const cursorPosition = useEditorStore((s) => s.cursorPosition);
  const activeModelId = useModelsStore((s) => s.activeModelId);

  return (
    <div className="h-6 bg-indigo-950 border-t border-indigo-900 text-zinc-300 px-3 flex items-center justify-between text-[11px] font-medium select-none">
      <div className="flex items-center gap-4">
        {projectPath && (
          <div className="flex items-center gap-1 hover:text-white cursor-pointer">
            <GitBranch size={12} className="text-indigo-400" />
            <span>{currentBranch}</span>
          </div>
        )}
        <div className="text-zinc-400">Ready</div>
      </div>

      <div className="flex items-center gap-4">
        {activeModelId && (
          <div className="flex items-center gap-1 text-indigo-300">
            <Cpu size={12} />
            <span>{activeModelId}</span>
          </div>
        )}

        <div className="flex items-center gap-1.5 text-zinc-400">
          <span>Ln {cursorPosition.line}, Col {cursorPosition.column}</span>
        </div>

        <div className="flex items-center gap-1 text-emerald-400">
          <Wifi size={12} />
          <span>Connected</span>
        </div>
      </div>
    </div>
  );
}
