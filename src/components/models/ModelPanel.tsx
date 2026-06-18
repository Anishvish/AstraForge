import React from "react";
import { Check, Settings, Save, Cpu } from "lucide-react";
import { useModelsStore } from "@/stores/models";

export function ModelPanel() {
  const providers = useModelsStore((s) => s.providers);
  const activeProviderId = useModelsStore((s) => s.activeProviderId);
  const activeModelId = useModelsStore((s) => s.activeModelId);
  
  const refreshProviders = useModelsStore((s) => s.refreshProviders);
  const setActiveProvider = useModelsStore((s) => s.setActiveProvider);
  const setActiveModel = useModelsStore((s) => s.setActiveModel);

  React.useEffect(() => {
    refreshProviders();
  }, [refreshProviders]);

  return (
    <div className="flex flex-col h-full text-zinc-300 select-none bg-zinc-900">
      <div className="h-10 border-b border-zinc-850 px-3 flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Models & APIs</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">AI Providers</span>
          
          <div className="grid gap-2">
            {[
              { id: "nvidia", name: "NVIDIA NIM", type: "nvidia", url: "https://integrate.api.nvidia.com" },
              { id: "ollama", name: "Ollama (Local)", type: "ollama", url: "http://localhost:11434" },
              { id: "openai", name: "OpenAI Compatible", type: "openai", url: "" }
            ].map((prov) => {
              const isActive = activeProviderId === prov.id;
              return (
                <div
                  key={prov.id}
                  onClick={() => setActiveProvider(prov.id)}
                  className={`border rounded-lg p-3 cursor-pointer transition flex items-center justify-between ${
                    isActive
                      ? "border-indigo-500 bg-indigo-950/20"
                      : "border-zinc-850 bg-zinc-950/30 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-semibold text-zinc-200">{prov.name}</span>
                    <span className="text-[10px] text-zinc-500">{prov.url || "Custom endpoint"}</span>
                  </div>
                  {isActive && <Check size={14} className="text-indigo-400" />}
                </div>
              );
            })}
          </div>
        </div>

        {activeProviderId && (
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Active Model</span>
            <div className="grid gap-2">
              {[
                { id: "meta/llama-3-70b-instruct", name: "Llama 3 70B Instruct" },
                { id: "nvidia/llama-3.1-nemotron-70b-instruct", name: "Nemotron 70B Instruct" },
                { id: "mistralai/mixtral-8x7b-instruct", name: "Mixtral 8x7B" }
              ].map((model) => {
                const isModelActive = activeModelId === model.id;
                return (
                  <div
                    key={model.id}
                    onClick={() => setActiveModel(model.id)}
                    className={`border rounded-lg p-2.5 cursor-pointer transition flex items-center justify-between ${
                      isModelActive
                        ? "border-indigo-500 bg-indigo-950/20"
                        : "border-zinc-850 bg-zinc-950/30 hover:border-zinc-700"
                    }`}
                  >
                    <div className="flex items-center gap-2 text-xs">
                      <Cpu size={13} className="text-zinc-500" />
                      <span className="font-medium text-zinc-300">{model.name}</span>
                    </div>
                    {isModelActive && <Check size={14} className="text-indigo-400" />}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
