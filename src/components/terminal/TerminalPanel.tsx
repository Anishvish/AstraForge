import React, { useState } from "react";
import { Plus, X, Terminal as TermIcon, Play } from "lucide-react";
import { useTerminalStore } from "@/stores/terminal";
import { TerminalInstance } from "./TerminalInstance";

export function TerminalPanel() {
  const sessions = useTerminalStore((s) => s.sessions);
  const activeSessionId = useTerminalStore((s) => s.activeSessionId);
  const setActiveSession = useTerminalStore((s) => s.setActiveSession);
  const removeSession = useTerminalStore((s) => s.removeSession);
  const createSession = useTerminalStore((s) => s.createSession);

  React.useEffect(() => {
    if (sessions.length === 0) {
      createSession();
    }
  }, [sessions, createSession]);

  return (
    <div className="h-full flex flex-col bg-zinc-950 text-zinc-300">
      <div className="h-9 border-b border-zinc-850 flex items-center justify-between px-3 flex-shrink-0 bg-zinc-900 select-none">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {sessions.map((sess) => {
            const isActive = sess.id === activeSessionId;
            return (
              <div
                key={sess.id}
                onClick={() => setActiveSession(sess.id)}
                className={`h-7 px-3 flex items-center gap-2 rounded-t-md text-xs cursor-pointer border-t-[2px] transition ${
                  isActive
                    ? "bg-zinc-950 text-indigo-400 border-indigo-500 font-semibold"
                    : "border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/60"
                }`}
              >
                <TermIcon size={12} />
                <span>{sess.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSession(sess.id);
                  }}
                  className="hover:text-red-400 p-0.5 rounded"
                >
                  <X size={10} />
                </button>
              </div>
            );
          })}
          
          <button
            onClick={() => createSession()}
            className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-200 transition"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 relative bg-zinc-950">
        {sessions.map((sess) => (
          <div
            key={sess.id}
            className={`w-full h-full absolute inset-0 ${
              sess.id === activeSessionId ? "block" : "hidden"
            }`}
          >
            <TerminalInstance session={sess} />
          </div>
        ))}
      </div>
    </div>
  );
}
