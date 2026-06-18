import React, { useState, useEffect } from "react";
import { Puzzle, Plus, Play, ShieldAlert, Check } from "lucide-react";
import { connectMcpServer, listMcpServers, type McpServerInfo } from "@/lib/tauri";

export function McpPanel() {
  const [servers, setServers] = useState<McpServerInfo[]>([]);
  const [name, setName] = useState("");
  const [command, setCommand] = useState("");
  const [args, setArgs] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchServers = async () => {
    try {
      const list = await listMcpServers();
      setServers(list);
    } catch (err) {
      console.error(err);
    }
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !command.trim()) return;

    setLoading(true);
    try {
      const parsedArgs = args.trim() ? args.split(",").map((a) => a.trim()) : [];
      await connectMcpServer(name, command, parsedArgs);
      setName("");
      setCommand("");
      setArgs("");
      fetchServers();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServers();
  }, []);

  return (
    <div className="flex flex-col h-full bg-zinc-900 text-zinc-300 select-none">
      <div className="h-10 border-b border-zinc-850 px-3 flex items-center justify-between flex-shrink-0">
        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">MCP Plugins</span>
      </div>

      <form onSubmit={handleConnect} className="p-3 border-b border-zinc-850 flex flex-col gap-2.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Connect Server</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Server name (e.g. Memory)..."
          className="bg-zinc-950 border border-zinc-850 hover:border-zinc-700 focus:border-indigo-500 rounded px-2.5 py-1.5 text-xs outline-none text-zinc-200"
        />
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="Command (e.g. npx, python)..."
          className="bg-zinc-950 border border-zinc-850 hover:border-zinc-700 focus:border-indigo-500 rounded px-2.5 py-1.5 text-xs outline-none text-zinc-200"
        />
        <input
          type="text"
          value={args}
          onChange={(e) => setArgs(e.target.value)}
          placeholder="Args comma-separated (e.g. -y, memory-server)..."
          className="bg-zinc-950 border border-zinc-850 hover:border-zinc-700 focus:border-indigo-500 rounded px-2.5 py-1.5 text-xs outline-none text-zinc-200"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 text-white rounded py-1.5 text-xs font-semibold transition cursor-pointer shadow flex items-center justify-center gap-1.5"
        >
          <Plus size={14} />
          <span>{loading ? "Connecting..." : "Add Plugin"}</span>
        </button>
      </form>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Active Connections</span>
        {servers.length > 0 ? (
          servers.map((srv) => (
            <div
              key={srv.name}
              className="border border-zinc-850 bg-zinc-950/40 p-2.5 rounded-lg flex items-center justify-between"
            >
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-xs font-semibold text-zinc-200 truncate">{srv.name}</span>
                <span className="text-[10px] text-zinc-500 truncate">{srv.command} {srv.args.join(" ")}</span>
              </div>
              <span className="text-[10px] font-semibold text-emerald-400 capitalize px-2 py-0.5 rounded-full bg-emerald-950/20 border border-emerald-900/50">
                {srv.status}
              </span>
            </div>
          ))
        ) : (
          <div className="h-32 flex flex-col items-center justify-center text-center p-4">
            <Puzzle size={24} className="text-zinc-600 mb-1" />
            <p className="text-xs text-zinc-500">No external MCP plugins connected.</p>
          </div>
        )}
      </div>
    </div>
  );
}
