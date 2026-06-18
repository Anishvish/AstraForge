import React, { useState } from "react";
import { GitBranch, GitCommit, RefreshCw, Check } from "lucide-react";
import { useWorkspaceStore } from "@/stores/workspace";
import { useGitStore } from "@/stores/git";

export function GitPanel() {
  const projectPath = useWorkspaceStore((s) => s.projectPath);
  const status = useGitStore((s) => s.status);
  const refreshStatus = useGitStore((s) => s.refreshStatus);
  const currentBranch = useGitStore((s) => s.currentBranch);
  const commit = useGitStore((s) => s.commit);

  const [message, setMessage] = useState("");

  const handleCommit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectPath || !message.trim()) return;
    await commit(projectPath, message);
    setMessage("");
  };

  const handleRefresh = () => {
    if (projectPath) {
      refreshStatus(projectPath);
    }
  };

  React.useEffect(() => {
    if (projectPath) {
      refreshStatus(projectPath);
    }
  }, [projectPath, refreshStatus]);

  return (
    <div className="flex flex-col h-full text-zinc-300 select-none">
      <div className="h-10 border-b border-zinc-850 px-3 flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Source Control</span>
        <button
          onClick={handleRefresh}
          className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-200 transition"
          title="Refresh Git Status"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      <div className="p-3 flex items-center gap-2 text-xs border-b border-zinc-850 bg-zinc-900/30">
        <GitBranch size={16} className="text-indigo-400" />
        <span className="font-semibold text-zinc-200">{currentBranch}</span>
      </div>

      <form onSubmit={handleCommit} className="p-3 flex flex-col gap-2 border-b border-zinc-850">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Commit message... (Ctrl+Enter to commit)"
          className="bg-zinc-950 border border-zinc-850 hover:border-zinc-700 focus:border-indigo-500 rounded p-2 text-xs outline-none text-zinc-200 min-h-[60px] resize-y"
        />
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-500 text-white rounded py-1.5 text-xs font-semibold transition cursor-pointer shadow flex items-center justify-center gap-1.5"
        >
          <GitCommit size={14} />
          <span>Commit</span>
        </button>
      </form>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4">
        {status?.staged && status.staged.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Staged Changes</span>
            {status.staged.map((file) => (
              <div key={file.path} className="flex justify-between items-center text-xs text-emerald-400 hover:bg-zinc-800/40 p-1.5 rounded transition">
                <span className="truncate flex-1">{file.path}</span>
                <span className="text-[10px] uppercase font-bold px-1 bg-emerald-950 border border-emerald-900 rounded select-none">
                  {file.status}
                </span>
              </div>
            ))}
          </div>
        )}

        {status?.unstaged && status.unstaged.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Changes</span>
            {status.unstaged.map((file) => (
              <div key={file.path} className="flex justify-between items-center text-xs text-amber-400 hover:bg-zinc-800/40 p-1.5 rounded transition">
                <span className="truncate flex-1">{file.path}</span>
                <span className="text-[10px] uppercase font-bold px-1 bg-amber-950/40 border border-amber-900/60 rounded select-none">
                  {file.status}
                </span>
              </div>
            ))}
          </div>
        )}

        {(!status || (status.staged.length === 0 && status.unstaged.length === 0)) && (
          <div className="h-32 flex flex-col items-center justify-center text-center p-4">
            <Check size={24} className="text-zinc-600 mb-1" />
            <p className="text-xs text-zinc-500">No modifications tracked.</p>
          </div>
        )}
      </div>
    </div>
  );
}
