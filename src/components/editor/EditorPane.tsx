import React from "react";
import { useEditorStore } from "@/stores/editor";
import { EditorTabs } from "./EditorTabs";
import { MonacoEditor } from "./MonacoEditor";
import { WelcomeTab } from "./WelcomeTab";
import { EditorBreadcrumb } from "./EditorBreadcrumb";

export function EditorPane() {
  const tabs = useEditorStore((s) => s.tabs);
  const activeTabId = useEditorStore((s) => s.activeTabId);

  const hasTabs = tabs.length > 0 && activeTabId !== null;
  const activeTab = tabs.find((t) => t.id === activeTabId);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-zinc-900">
      {hasTabs ? (
        <>
          <EditorTabs />
          <EditorBreadcrumb filePath={activeTab?.path || null} />
          <div className="flex-1 overflow-hidden relative">
            <MonacoEditor />
          </div>
        </>
      ) : (
        <WelcomeTab />
      )}
    </div>

  );
}
