import { create } from 'zustand';
import { generateId, getLanguageFromExtension } from '@/lib/utils';
import { readFileContent, writeFileContent } from '@/lib/tauri';

export interface EditorTab {
  id: string;
  path: string;
  name: string;
  language: string;
  content: string;
  isDirty: boolean;
  isPreview: boolean;
}

interface EditorState {
  tabs: EditorTab[];
  activeTabId: string | null;
  splitDirection: 'horizontal' | 'vertical' | null;
  cursorPosition: { line: number; column: number };

  openFile: (path: string, name: string) => Promise<void>;
  closeTab: (id: string) => void;
  closeAllTabs: () => void;
  closeOtherTabs: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateContent: (id: string, content: string) => void;
  markDirty: (id: string) => void;
  markClean: (id: string) => void;
  saveFile: (id?: string) => Promise<void>;
  setCursorPosition: (line: number, column: number) => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  tabs: [],
  activeTabId: null,
  splitDirection: null,
  cursorPosition: { line: 1, column: 1 },

  openFile: async (path, name) => {
    const { tabs } = get();
    const existing = tabs.find((t) => t.path === path);

    if (existing) {
      set({ activeTabId: existing.id });
      if (existing.isPreview) {
        set({
          tabs: tabs.map((t) => (t.id === existing.id ? { ...t, isPreview: false } : t)),
        });
      }
      return;
    }

    try {
      const content = await readFileContent(path);
      const language = getLanguageFromExtension(name);
      const id = generateId();

      const previewTab = tabs.find((t) => t.isPreview);
      let newTabs: EditorTab[];

      if (previewTab) {
        newTabs = tabs.map((t) =>
          t.id === previewTab.id
            ? { id, path, name, language, content, isDirty: false, isPreview: true }
            : t,
        );
      } else {
        newTabs = [
          ...tabs,
          { id, path, name, language, content, isDirty: false, isPreview: true },
        ];
      }

      set({ tabs: newTabs, activeTabId: id });
    } catch (err) {
      console.error('Failed to open file:', err);
    }
  },

  closeTab: (id) => {
    const { tabs, activeTabId } = get();
    const index = tabs.findIndex((t) => t.id === id);
    const newTabs = tabs.filter((t) => t.id !== id);

    let newActiveId: string | null = null;
    if (activeTabId === id) {
      if (newTabs.length > 0) {
        const newIndex = Math.min(index, newTabs.length - 1);
        newActiveId = newTabs[newIndex].id;
      }
    } else {
      newActiveId = activeTabId;
    }

    set({ tabs: newTabs, activeTabId: newActiveId });
  },

  closeAllTabs: () => {
    set({ tabs: [], activeTabId: null });
  },

  closeOtherTabs: (id) => {
    const { tabs } = get();
    set({
      tabs: tabs.filter((t) => t.id === id),
      activeTabId: id,
    });
  },

  setActiveTab: (id) => {
    const { tabs } = get();
    set({
      activeTabId: id,
      tabs: tabs.map((t) => (t.id === id ? { ...t, isPreview: false } : t)),
    });
  },

  updateContent: (id, content) => {
    set((state) => ({
      tabs: state.tabs.map((t) =>
        t.id === id ? { ...t, content, isDirty: true } : t,
      ),
    }));
  },

  markDirty: (id) => {
    set((state) => ({
      tabs: state.tabs.map((t) => (t.id === id ? { ...t, isDirty: true } : t)),
    }));
  },

  markClean: (id) => {
    set((state) => ({
      tabs: state.tabs.map((t) => (t.id === id ? { ...t, isDirty: false } : t)),
    }));
  },

  saveFile: async (id) => {
    const { tabs, activeTabId } = get();
    const tabId = id ?? activeTabId;
    if (!tabId) return;

    const tab = tabs.find((t) => t.id === tabId);
    if (!tab || !tab.isDirty) return;

    try {
      await writeFileContent(tab.path, tab.content);
      get().markClean(tabId);
    } catch (err) {
      console.error('Failed to save file:', err);
    }
  },

  setCursorPosition: (line, column) => {
    set({ cursorPosition: { line, column } });
  },
}));
