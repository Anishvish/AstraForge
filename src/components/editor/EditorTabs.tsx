import React from "react";
import { X, FileCode } from "lucide-react";
import { useEditorStore } from "@/stores/editor";

export function EditorTabs() {
  const tabs = useEditorStore((s) => s.tabs);
  const activeTabId = useEditorStore((s) => s.activeTabId);
  const setActiveTab = useEditorStore((s) => s.setActiveTab);
  const closeTab = useEditorStore((s) => s.closeTab);

  if (tabs.length === 0) return null;

  return (
    <div className="h-9 bg-zinc-950 border-b border-zinc-850 flex items-center overflow-x-auto select-none no-scrollbar">
      {tabs.map((tab) => {
        const isActive = activeTabId === tab.id;
        return (
          <div
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`h-full px-3 flex items-center gap-1.5 border-r border-zinc-850 text-xs font-medium cursor-pointer transition relative group ${
              isActive
                ? "bg-zinc-900 text-indigo-400 font-semibold"
                : "bg-zinc-950 text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200"
            }`}
          >
            {isActive && (
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-indigo-500" />
            )}
            <FileCode size={14} className={isActive ? "text-indigo-400" : "text-zinc-500"} />
            <span className="truncate max-w-[120px]">{tab.name}</span>
            {tab.isDirty && (
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full flex-shrink-0" />
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.id);
              }}
              className="p-0.5 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 opacity-0 group-hover:opacity-100 transition duration-150"
            >
              <X size={12} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
