import React from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useUIStore } from "@/stores/ui";
import { FileExplorer } from "../explorer/FileExplorer";
import { EditorPane } from "../editor/EditorPane";
import { TerminalPanel } from "../terminal/TerminalPanel";
import { GitPanel } from "../git/GitPanel";
import { ChatPanel } from "../chat/ChatPanel";
import { ModelPanel } from "../models/ModelPanel";
import { SettingsPanel } from "../settings/SettingsPanel";

export function PanelContainer() {
  const showSidebar = useUIStore((s) => s.showSidebar);
  const sidebarPanel = useUIStore((s) => s.sidebarPanel);
  const showTerminal = useUIStore((s) => s.showTerminal);
  const showRightPanel = useUIStore((s) => s.showRightPanel);
  const rightPanelContent = useUIStore((s) => s.rightPanelContent);

  const renderSidebarContent = () => {
    switch (sidebarPanel) {
      case "explorer":
        return <FileExplorer />;
      case "git":
        return <GitPanel />;
      case "chat":
        return <ChatPanel />;
      case "settings":
        return <SettingsPanel />;
      default:
        return (
          <div className="p-4 text-zinc-500 text-xs">
            Panel: {sidebarPanel}
          </div>
        );
    }
  };

  const renderRightPanelContent = () => {
    switch (rightPanelContent) {
      case "models":
        return <ModelPanel />;
      default:
        return <ChatPanel />;
    }
  };

  return (
    <PanelGroup direction="horizontal" className="h-full w-full">
      {/* Left Sidebar Panel */}
      {showSidebar && (
        <>
          <Panel defaultSize={20} minSize={15} maxSize={40} className="bg-zinc-900 border-r border-zinc-850 flex flex-col h-full">
            {renderSidebarContent()}
          </Panel>
          <PanelResizeHandle className="w-[3px] bg-zinc-800 hover:bg-indigo-500 transition-colors duration-200 cursor-col-resize" />
        </>
      )}

      {/* Main Area: Editor + Terminal */}
      <Panel className="flex flex-col h-full bg-zinc-950">
        <PanelGroup direction="vertical">
          <Panel defaultSize={70} minSize={30}>
            <EditorPane />
          </Panel>
          
          {showTerminal && (
            <>
              <PanelResizeHandle className="h-[3px] bg-zinc-800 hover:bg-indigo-500 transition-colors duration-200 cursor-row-resize" />
              <Panel defaultSize={30} minSize={15}>
                <TerminalPanel />
              </Panel>
            </>
          )}
        </PanelGroup>
      </Panel>

      {/* Right Assistant/Model Panel */}
      {showRightPanel && (
        <>
          <PanelResizeHandle className="w-[3px] bg-zinc-800 hover:bg-indigo-500 transition-colors duration-200 cursor-col-resize" />
          <Panel defaultSize={25} minSize={20} maxSize={50} className="bg-zinc-900 border-l border-zinc-850 flex flex-col h-full">
            {renderRightPanelContent()}
          </Panel>
        </>
      )}
    </PanelGroup>
  );
}
