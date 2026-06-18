import React, { useState } from "react";
import { useTerminalStore, type TerminalSession } from "@/stores/terminal";
import { runCommand } from "@/lib/tauri";
import { Wand2, AlertCircle } from "lucide-react";
import { useUIStore } from "@/stores/ui";
import { useChatStore } from "@/stores/chat";

interface TerminalInstanceProps {
  session: TerminalSession;
}

export function TerminalInstance({ session }: TerminalInstanceProps) {
  const addLine = useTerminalStore((s) => s.addLine);
  const setSidebarPanel = useUIStore((s) => s.setSidebarPanel);
  const createConversation = useChatStore((s) => s.createConversation);
  const sendMessage = useChatStore((s) => s.sendMessage);

  const [input, setInput] = useState("");
  const [debugging, setDebugging] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    addLine(session.id, "input", `$ ${input}`);
    const cmd = input;
    setInput("");

    try {
      const output = await runCommand(cmd, session.cwd || undefined);
      if (output.stdout) {
        addLine(session.id, "output", output.stdout);
      }
      if (output.stderr) {
        addLine(session.id, "error", output.stderr);
      }
    } catch (err) {
      addLine(session.id, "error", `Failed to run command: ${err}`);
    }
  };

  const hasErrors = session.lines.some((l) => l.type === "error");

  const handleDebugErrors = async () => {
    const errorLines = session.lines
      .filter((l) => l.type === "error")
      .map((l) => l.content)
      .join("\n");
      
    if (!errorLines) return;
    setDebugging(true);

    try {
      setSidebarPanel("chat");
      const convId = createConversation("Terminal Diagnostic");
      useChatStore.getState().setActiveConversation(convId);
      await sendMessage(
        `I encountered the following build or command execution errors in my terminal:\n\n\`\`\`\n${errorLines}\n\`\`\`\n\nPlease diagnose this error and suggest a fix.`
      );
    } catch (err) {
      console.error("Failed to trigger diagnostics:", err);
    } finally {
      setDebugging(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-300 font-mono text-xs relative">
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1 select-text pb-12">
        {session.lines.map((line) => (
          <div
            key={line.id}
            className={`whitespace-pre-wrap ${
              line.type === "input"
                ? "text-indigo-400 font-semibold"
                : line.type === "error"
                ? "text-red-400"
                : line.type === "system"
                ? "text-zinc-500 italic"
                : "text-zinc-300"
            }`}
          >
            {line.content}
          </div>
        ))}
      </div>

      {hasErrors && (
        <div className="absolute bottom-10 right-4 bg-zinc-900 border border-red-500/30 rounded-lg p-2 flex items-center gap-2 shadow-2xl z-20 animate-fade-in select-none">
          <AlertCircle size={14} className="text-red-400" />
          <span className="text-[10px] text-zinc-300 font-sans">Errors detected in output</span>
          <button
            onClick={handleDebugErrors}
            disabled={debugging}
            className="flex items-center gap-1 bg-red-950/40 hover:bg-red-900/40 border border-red-500/50 hover:border-red-400 rounded px-2 py-0.5 text-[9px] font-bold text-red-200 transition cursor-pointer"
          >
            <Wand2 size={10} />
            <span>{debugging ? "Diagnosing..." : "Debug with AI"}</span>
          </button>
        </div>
      )}

      <form onSubmit={handleSend} className="h-8 border-t border-zinc-900 bg-zinc-950 flex items-center px-3 gap-2 flex-shrink-0">
        <span className="text-indigo-400 font-bold select-none">$</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-transparent outline-none border-none text-zinc-200 placeholder-zinc-700 text-xs"
          placeholder="Type command and press Enter..."
          autoFocus
        />
      </form>
    </div>
  );
}
