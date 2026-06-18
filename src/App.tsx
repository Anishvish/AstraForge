import React from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WorkspaceLayout } from "./components/layout/WorkspaceLayout";
import { CommandPalette } from "./components/command-palette/CommandPalette";
import { useKeyboardShortcuts } from "./hooks/use-keyboard-shortcuts";

export default function App() {
  // Setup global keyboard shortcuts
  useKeyboardShortcuts();

  return (
    <TooltipProvider>
      <WorkspaceLayout />
      <CommandPalette />
    </TooltipProvider>
  );
}

