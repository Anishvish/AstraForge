import React, { useState } from "react";
import { Send, Bot, User, RefreshCw } from "lucide-react";
import { useChatStore } from "@/stores/chat";
import { useModelsStore } from "@/stores/models";

export function ChatPanel() {
  const conversations = useChatStore((s) => s.conversations);
  const activeConversationId = useChatStore((s) => s.activeConversationId);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const isStreaming = useChatStore((s) => s.isStreaming);
  
  const activeConv = conversations.find((c) => c.id === activeConversationId);

  const [input, setInput] = useState("");

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    const msg = input;
    setInput("");
    await sendMessage(msg);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900 text-zinc-300">
      <div className="h-10 border-b border-zinc-850 px-3 flex items-center justify-between flex-shrink-0 bg-zinc-900 select-none">
        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">AI Assistant</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 select-text">
        {activeConv?.messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-[85%] ${
              msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
            }`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-white ${
              msg.role === "user" ? "bg-indigo-600" : "bg-purple-600"
            }`}>
              {msg.role === "user" ? <User size={13} /> : <Bot size={13} />}
            </div>

            <div className={`rounded-lg p-2.5 text-xs leading-relaxed ${
              msg.role === "user"
                ? "bg-indigo-600/10 text-zinc-200 border border-indigo-500/20"
                : "bg-zinc-950/50 text-zinc-300 border border-zinc-850"
            }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {isStreaming && (
          <div className="flex gap-3 mr-auto max-w-[85%]">
            <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-white">
              <Bot size={13} />
            </div>
            <div className="bg-zinc-950/50 text-zinc-400 border border-zinc-850 rounded-lg p-2.5 text-xs flex items-center gap-1.5 animate-pulse">
              <RefreshCw size={12} className="animate-spin" />
              <span>Thinking...</span>
            </div>
          </div>
        )}

        {(!activeConv || activeConv.messages.length === 0) && (
          <div className="h-64 flex flex-col items-center justify-center text-center p-4">
            <Bot size={32} className="text-indigo-400/60 mb-2 animate-bounce" />
            <span className="text-sm font-semibold text-zinc-300">AstraForge Copilot</span>
            <p className="text-[11px] text-zinc-500 max-w-[200px] mt-1.5 leading-relaxed">
              Ask questions about your project, write new code, or request help with refactoring.
            </p>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-3 border-t border-zinc-850 bg-zinc-900 flex-shrink-0 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isStreaming}
          placeholder="Ask AI anything..."
          className="flex-1 bg-zinc-950 border border-zinc-850 hover:border-zinc-700 focus:border-indigo-500 rounded px-3 py-1.5 text-xs outline-none text-zinc-200"
        />
        <button
          type="submit"
          disabled={isStreaming}
          className="bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 text-white rounded p-1.5 transition cursor-pointer shadow"
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}
