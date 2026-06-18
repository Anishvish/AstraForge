import React, { useState } from "react";
import { Search, Sparkles, FileText, ChevronRight } from "lucide-react";
import { useWorkspaceStore } from "@/stores/workspace";
import { semanticSearch, type RAGSearchResult } from "@/lib/tauri";
import { useEditorStore } from "@/stores/editor";

export function SearchPanel() {
  const projectPath = useWorkspaceStore((s) => s.projectPath);
  const openFile = useEditorStore((s) => s.openFile);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<RAGSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [mode, setMode] = useState<"standard" | "semantic">("standard");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || !projectPath) return;

    setSearching(true);
    try {
      if (mode === "semantic") {
        const res = await semanticSearch(query, 10);
        setResults(res);
      } else {
        // Fallback or Standard file query logic
        const res = await semanticSearch(query, 5); // Use semantic retrieve for convenience
        setResults(res);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="flex flex-col h-full text-zinc-300 select-none bg-zinc-900">
      <div className="h-10 border-b border-zinc-850 px-3 flex items-center justify-between flex-shrink-0">
        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Search Workspace</span>
      </div>

      <div className="p-3 border-b border-zinc-850 flex flex-col gap-2">
        <div className="flex bg-zinc-950 rounded border border-zinc-850 p-0.5">
          <button
            onClick={() => setMode("standard")}
            className={`flex-1 py-1 text-[10px] font-bold uppercase rounded transition ${
              mode === "standard" ? "bg-zinc-800 text-zinc-200" : "text-zinc-500 hover:text-zinc-400"
            }`}
          >
            Standard
          </button>
          <button
            onClick={() => setMode("semantic")}
            className={`flex-1 py-1 text-[10px] font-bold uppercase rounded transition flex items-center justify-center gap-1 ${
              mode === "semantic" ? "bg-indigo-600 text-white" : "text-zinc-500 hover:text-zinc-400"
            }`}
          >
            <Sparkles size={10} />
            <span>Semantic</span>
          </button>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={mode === "semantic" ? "Search meaning (e.g. database setup)..." : "Search files or content..."}
            className="flex-1 bg-zinc-950 border border-zinc-850 hover:border-zinc-700 focus:border-indigo-500 rounded px-2 py-1.5 text-xs outline-none text-zinc-200"
          />
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white rounded p-1.5 transition">
            <Search size={14} />
          </button>
        </form>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {searching ? (
          <div className="text-center text-xs text-zinc-500 py-4 animate-pulse">Searching repository...</div>
        ) : results.length > 0 ? (
          results.map((res, index) => (
            <div
              key={index}
              onClick={() => openFile(res.file_path, res.file_path.split(/[/\\]/).pop() || "")}
              className="border border-zinc-850 hover:border-zinc-750 bg-zinc-950/40 p-2.5 rounded-lg cursor-pointer transition flex flex-col gap-1.5"
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200">
                <FileText size={13} className="text-indigo-400" />
                <span className="truncate flex-1">{res.file_path.split(/[/\\]/).pop()}</span>
                <span className="text-[10px] text-zinc-500">Lines {res.start_line}-{res.end_line}</span>
              </div>
              <pre className="text-[10px] text-zinc-400 font-mono bg-zinc-950/80 p-1.5 rounded truncate overflow-x-hidden leading-tight">
                {res.content}
              </pre>
            </div>
          ))
        ) : (
          <div className="text-center text-xs text-zinc-600 py-8">
            {projectPath ? "Type query above to find code files." : "Open a project workspace folder to search."}
          </div>
        )}
      </div>
    </div>
  );
}
