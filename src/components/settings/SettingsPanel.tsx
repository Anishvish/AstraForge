import React from "react";
import { Settings, Sliders, Shield, Keyboard, Info } from "lucide-react";

export function SettingsPanel() {
  return (
    <div className="flex flex-col h-full bg-zinc-900 text-zinc-300 select-none">
      <div className="h-10 border-b border-zinc-850 px-3 flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Settings</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          {[
            { label: "Preferences", desc: "Configure theme, fonts, auto-save settings", icon: <Sliders size={15} /> },
            { label: "AI & Gateways", desc: "Manage API keys and local Ollama integrations", icon: <Settings size={15} /> },
            { label: "Security & Sandbox", desc: "Set tool execution constraints and permissions", icon: <Shield size={15} /> },
            { label: "Keyboard Shortcuts", desc: "Customize keybinds and shortcuts map", icon: <Keyboard size={15} /> },
            { label: "About", desc: "AstraForge Engine v0.1.0", icon: <Info size={15} /> }
          ].map((item) => (
            <div
              key={item.label}
              className="p-3 bg-zinc-950/40 border border-zinc-850 hover:border-zinc-700 rounded-lg cursor-pointer transition flex gap-3"
            >
              <div className="text-indigo-400 mt-0.5">{item.icon}</div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-200">{item.label}</span>
                <span className="text-[10px] text-zinc-500 mt-0.5 leading-relaxed">{item.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
