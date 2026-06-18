import { create } from 'zustand';
import type { ProviderConfig, ModelInfo } from '@/lib/tauri';
import * as tauri from '@/lib/tauri';
import { generateId } from '@/lib/utils';

interface ModelsState {
  providers: ProviderConfig[];
  activeProviderId: string | null;
  activeModelId: string | null;
  availableModels: ModelInfo[];
  isLoading: boolean;

  refreshProviders: () => Promise<void>;
  setActiveProvider: (id: string | null) => void;
  setActiveModel: (id: string | null) => void;
  addProvider: (provider: Omit<ProviderConfig, 'id' | 'models'>) => void;
  updateProvider: (id: string, updates: Partial<ProviderConfig>) => void;
  removeProvider: (id: string) => void;
  refreshModels: (providerId: string) => Promise<void>;
}

export const useModelsStore = create<ModelsState>((set, get) => ({
  providers: [],
  activeProviderId: null,
  activeModelId: null,
  availableModels: [],
  isLoading: false,

  refreshProviders: async () => {
    set({ isLoading: true });
    try {
      const providers = await tauri.getProviderConfigs();
      set({ providers, isLoading: false });
    } catch (err) {
      console.error('Failed to refresh providers:', err);
      set({ isLoading: false });
    }
  },

  setActiveProvider: (id) => {
    set({ activeProviderId: id });
    if (id) {
      get().refreshModels(id);
    }
  },

  setActiveModel: (id) => set({ activeModelId: id }),

  addProvider: (provider) => {
    const newProvider: ProviderConfig = {
      ...provider,
      id: generateId(),
      models: [],
    };
    set((state) => ({
      providers: [...state.providers, newProvider],
    }));
    tauri.saveProviderConfig(newProvider).catch(console.error);
  },

  updateProvider: (id, updates) => {
    set((state) => {
      const providers = state.providers.map((p) =>
        p.id === id ? { ...p, ...updates } : p,
      );
      const updated = providers.find((p) => p.id === id);
      if (updated) {
        tauri.saveProviderConfig(updated).catch(console.error);
      }
      return { providers };
    });
  },

  removeProvider: (id) => {
    set((state) => ({
      providers: state.providers.filter((p) => p.id !== id),
      activeProviderId: state.activeProviderId === id ? null : state.activeProviderId,
    }));
  },

  refreshModels: async (providerId) => {
    set({ isLoading: true });
    try {
      const models = await tauri.aiListModels(providerId);
      set((state) => ({
        availableModels: models,
        providers: state.providers.map((p) =>
          p.id === providerId ? { ...p, models } : p,
        ),
        isLoading: false,
      }));
    } catch (err) {
      console.error('Failed to refresh models:', err);
      set({ isLoading: false });
    }
  },
}));
