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

  const [showPrompt, setShowPrompt] = React.useState(false);
  const [selectedText, setSelectedText] = React.useState("");
  const [promptInput, setPromptInput] = React.useState("");
  const [refactoring, setRefactoring] = React.useState(false);
  const editorRef = React.useRef<any>(null);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      updateContent(activeTab.id, value);
    }
  };

  const handleInlinePromptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim() || refactoring) return;
    
    setRefactoring(true);
    try {
      const { aiChat } = await import("@/lib/tauri");
      const { useModelsStore } = await import("@/stores/models");
      const modelsStore = useModelsStore.getState();
      
      const response = await aiChat(
        [
          {
            id: "system",
            role: "system",
            content: "You are an inline code refactoring assistant. Correct the selected code block. Output code ONLY.",
            timestamp: Date.now(),
            model_id: null,
            tokens_used: null
          },
          {
            id: "user",
            role: "user",
            content: `Refactor request: ${promptInput}\n\nCode Block:\n\`\`\`\n${selectedText}\n\`\`\``,
            timestamp: Date.now(),
            model_id: null,
            tokens_used: null
          }
        ],
        modelsStore.activeModelId || "nvidia/llama-3.1-nemotron-70b-instruct",
        modelsStore.activeProviderId || "nvidia"
      );

      if (editorRef.current && response.content) {
        const selection = editorRef.current.getSelection();
        const range = new monaco.Range(
          selection.startLineNumber,
          selection.startColumn,
          selection.endLineNumber,
          selection.endColumn
        );
        const id = { major: 1, minor: 1 };
        const op = { identifier: id, range: range, text: response.content, forceMoveMarkers: true };
        editorRef.current.executeEdits("my-source", [op]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRefactoring(false);
      setShowPrompt(false);
      setPromptInput("");
    }
  };

  const [monaco, setMonacoInstance] = React.useState<any>(null);

  const handleEditorDidMount = (editor: any, monacoInstance: any) => {
    editorRef.current = editor;
    setMonacoInstance(monacoInstance);

    monacoInstance.editor.defineTheme("astraforge-dark", {
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

    // Add keybinding for inline AI prompt Ctrl+Shift+I
    editor.addCommand(monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyMod.Shift | monacoInstance.KeyCode.KeyI, () => {
      const selection = editor.getSelection();
      const text = editor.getModel().getValueInRange(selection);
      if (text) {
        setSelectedText(text);
        setShowPrompt(true);
      }
    });
  };

  return (
    <div className="w-full h-full bg-[#0c0c12] relative">
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

      {showPrompt && (
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 z-40 w-96 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl p-3 select-none">
          <form onSubmit={handleInlinePromptSubmit} className="flex flex-col gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Inline AI Refactor</span>
            <input
              type="text"
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder="e.g. Optimize, translate to typescript..."
              className="bg-zinc-950 border border-zinc-850 hover:border-zinc-700 focus:border-indigo-500 rounded px-2.5 py-1.5 text-xs outline-none text-zinc-200"
              autoFocus
            />
            <div className="flex justify-end gap-2 text-[10px] font-semibold">
              <button
                type="button"
                onClick={() => setShowPrompt(false)}
                className="px-2.5 py-1 rounded bg-zinc-800 text-zinc-400 hover:bg-zinc-750"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={refactoring}
                className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white shadow"
              >
                {refactoring ? "Refactoring..." : "Apply"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

