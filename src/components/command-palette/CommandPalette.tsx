import React, { useState, useEffect } from "react";
import { Search, FileCode, GitBranch, Cpu, Terminal as TermIcon } from "lucide-react";
import { useUIStore } from "@/stores/ui";
import { useWorkspaceStore } from "@/stores/workspace";
import { useEditorStore } from "@/stores/editor";

export function CommandPalette() {
  const showCommandPalette = useUIStore((s) => s.showCommandPalette);
  const toggleCommandPalette = useUIStore((s) => s.toggleCommandPalette);
  
  const projectPath = useWorkspaceStore((s) => s.projectPath);
  const fileTree = useWorkspaceStore((s) => s.fileTree);
  const openFile = useEditorStore((s) => s.openFile);

  const [input, setInput] = useState("");
  const [flatFiles, setFlatFiles] = useState<{ name: string; path: string }[]>([]);

  // Collect all files from the workspace tree into a flat list for searching
  useEffect(() => {
    if (!fileTree) return;
    const files: { name: string; path: string }[] = [];
    const traverse = (node: any) => {
      if (!node.is_dir) {
        files.push({ name: node.name, path: node.path });
      } else if (node.children) {
        node.children.forEach(traverse);
      }
    };
    traverse(fileTree);
    setFlatFiles(files);
  }, [fileTree]);

  if (!showCommandPalette) return null;

  const filteredFiles = flatFiles.filter(
    (f) =>
      f.name.toLowerCase().includes(input.toLowerCase()) ||
      f.path.toLowerCase().includes(input.toLowerCase())
  ).slice(0, 8);

  const handleSelectFile = (file: { name: string; path: string }) => {
    openFile(file.path, file.name);
    toggleCommandPalette();
    setInput("");
  };

  return (
    <div
      onClick={toggleCommandPalette}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-24"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl flex flex-col overflow-hidden text-zinc-300 font-sans select-none"
      >
        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-zinc-800">
          <Search size={16} className="text-zinc-500" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a file name or command..."
            className="flex-1 bg-transparent border-none outline-none text-xs text-zinc-200 placeholder-zinc-500"
            autoFocus
          />
        </div>

        <div className="flex-1 overflow-y-auto max-h-[300px] p-2 flex flex-col gap-1">
          {filteredFiles.length > 0 ? (
            filteredFiles.map((file) => (
              <div
                key={file.path}
                onClick={() => handleSelectFile(file)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-zinc-800/80 cursor-pointer transition text-xs text-zinc-300 hover:text-white"
              >
                <FileCode size={14} className="text-indigo-400" />
                <div className="flex flex-col truncate">
                  <span className="font-medium">{file.name}</span>
                  <span className="text-[10px] text-zinc-500 truncate">{file.path}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-xs text-zinc-650">
              No matching files or commands found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
