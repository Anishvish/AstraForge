import React from "react";
import { DiffEditor as MonacoDiff } from "@monaco-editor/react";

interface DiffEditorProps {
  original: string;
  modified: string;
  language: string;
}

export function DiffEditor({ original, modified, language }: DiffEditorProps) {
  return (
    <div className="w-full h-full bg-[#0c0c12]">
      <MonacoDiff
        height="100%"
        theme="vs-dark"
        language={language}
        original={original}
        modified={modified}
        options={{
          renderSideBySide: true,
          readOnly: true,
          fontSize: 12,
          fontFamily: "'JetBrains Mono', monospace",
        }}
      />
    </div>
  );
}
