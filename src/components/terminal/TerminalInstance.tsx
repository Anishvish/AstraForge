import React, { useState, useRef, useEffect } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";

import { useTerminalStore, type TerminalSession } from "@/stores/terminal";
import { runCommand } from "@/lib/tauri";

interface TerminalInstanceProps {
  session: TerminalSession;
}

export function TerminalInstance({ session }: TerminalInstanceProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const addLine = useTerminalStore((s) => s.addLine);

  const [input, setInput] = useState("");

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

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-300 font-mono text-xs">
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1 select-text">
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
