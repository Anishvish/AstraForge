import React, { useState } from "react";
import { ShieldAlert, Play, CheckCircle, AlertTriangle } from "lucide-react";
import { useEditorStore } from "@/stores/editor";
import { reviewCode, type ReviewFinding } from "@/lib/tauri";

export function ReviewPanel() {
  const tabs = useEditorStore((s) => s.tabs);
  const activeTabId = useEditorStore((s) => s.activeTabId);
  const activeTab = tabs.find((t) => t.id === activeTabId);

  const [findings, setFindings] = useState<ReviewFinding[]>([]);
  const [loading, setLoading] = useState(false);

  const handleReview = async () => {
    if (!activeTab) return;
    setLoading(true);
    try {
      const res = await reviewCode(activeTab.content, activeTab.name);
      setFindings(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900 text-zinc-300 select-none">
      <div className="h-10 border-b border-zinc-850 px-3 flex items-center justify-between flex-shrink-0">
        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Security & Logic Audit</span>
        {activeTab && (
          <button
            onClick={handleReview}
            disabled={loading}
            className="p-1 hover:bg-zinc-800 rounded text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1 text-[10px] font-semibold uppercase"
          >
            <Play size={12} />
            <span>{loading ? "Reviewing..." : "Scan Tab"}</span>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
        {loading ? (
          <div className="text-center text-xs text-zinc-500 py-8 animate-pulse">Running security and quality checks...</div>
        ) : findings.length > 0 ? (
          findings.map((item, index) => (
            <div
              key={index}
              className={`border p-2.5 rounded-lg flex flex-col gap-1.5 ${
                item.severity === "critical"
                  ? "border-red-900/50 bg-red-950/20"
                  : item.severity === "warning"
                  ? "border-amber-900/50 bg-amber-950/20"
                  : "border-zinc-800 bg-zinc-950/30"
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                <AlertTriangle
                  size={14}
                  className={
                    item.severity === "critical"
                      ? "text-red-400"
                      : item.severity === "warning"
                      ? "text-amber-400"
                      : "text-zinc-400"
                  }
                />
                <span className="capitalize text-zinc-200">{item.category} Issue</span>
                <span className="text-[10px] text-zinc-500 ml-auto">Line {item.line_number}</span>
              </div>
              <p className="text-[11px] text-zinc-300 leading-relaxed">{item.message}</p>
              {item.suggestion && (
                <div className="text-[10px] text-zinc-400 font-mono bg-zinc-950/60 p-1.5 rounded leading-normal border border-zinc-850">
                  <span className="font-bold text-indigo-400">Suggestion:</span> {item.suggestion}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="h-48 flex flex-col items-center justify-center text-center p-4">
            <CheckCircle size={32} className="text-emerald-500/60 mb-2" />
            <span className="text-sm font-semibold text-zinc-300">Clean Tab Workspace</span>
            <p className="text-[11px] text-zinc-500 mt-1 max-w-[200px]">
              No active security issues or logic flaws identified. Scan this editor tab to begin.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
