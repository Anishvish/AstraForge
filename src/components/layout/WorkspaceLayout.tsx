import React from "react";
import { Sidebar } from "./Sidebar";
import { TitleBar } from "./TitleBar";
import { StatusBar } from "./StatusBar";
import { PanelContainer } from "./PanelContainer";

export function WorkspaceLayout() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      <TitleBar />
      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <PanelContainer />
        </div>
      </div>
      <StatusBar />
    </div>
  );
}
