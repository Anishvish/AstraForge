import React from "react";
import Editor from "@monaco-editor/react";
import { useEditorStore } from "@/stores/editor";

export function MonacoEditor() {
  const tabs = useEditorStore((s) => s.tabs);
  const activeTabId = useEditorStore((s) => s.activeTabId);
  const updateContent = useEditorStore((s) => s.updateContent);
  const setCursorPosition = useEditorStore((s) => s.setCursorPosition);

  const activeTab = tabs.find((t) => t.id === activeTabId);

  if (!activeTab) return null;

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      updateContent(activeTab.id, value);
    }
  };

  const handleEditorDidMount = (editor: any, monaco: any) => {
    // Register custom dark theme matching deep space aesthetic
    monaco.editor.defineTheme("astraforge-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "6272a4", fontStyle: "italic" },
        { token: "keyword", foreground: "ff79c6" },
        { token: "string", foreground: "f1fa8c" },
        { token: "number", foreground: "bd93f9" },
        { token: "regexp", foreground: "ffb86c" },
        { token: "type", foreground: "8be9fd", fontStyle: "italic" },
        { token: "class", foreground: "50fa7b" },
        { token: "function", foreground: "50fa7b" },
      ],
      colors: {
        "editor.background": "#0c0c12",
        "editor.foreground": "#f8f8f2",
        "editor.lineHighlightBackground": "#181824",
        "editorCursor.foreground": "#818cf8",
        "editor.selectionBackground": "#44475a55",
      },
    });

    editor.onDidChangeCursorPosition((e: any) => {
      setCursorPosition(e.position.lineNumber, e.position.column);
    });
  };

  return (
    <div className="w-full h-full bg-[#0c0c12]">
      <Editor
        height="100%"
        theme="astraforge-dark"
        language={activeTab.language}
        value={activeTab.content}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        options={{
          fontSize: 13,
          fontFamily: "'JetBrains Mono', monospace",
          minimap: { enabled: true },
          automaticLayout: true,
          padding: { top: 8 },
        }}
      />
    </div>
  );
}
