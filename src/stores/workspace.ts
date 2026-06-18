import { create } from 'zustand';
import type { FileTreeNode } from '@/lib/tauri';
import { getFileTree } from '@/lib/tauri';

interface WorkspaceState {
  projectPath: string | null;
  fileTree: FileTreeNode | null;
  selectedFile: string | null;
  expandedDirs: Set<string>;
  isLoading: boolean;

  setProjectPath: (path: string | null) => void;
  refreshFileTree: () => Promise<void>;
  toggleDir: (path: string) => void;
  selectFile: (path: string | null) => void;
  openProject: () => Promise<void>;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  projectPath: null,
  fileTree: null,
  selectedFile: null,
  expandedDirs: new Set<string>(),
  isLoading: false,

  setProjectPath: (path) => {
    set({ projectPath: path, fileTree: null, selectedFile: null, expandedDirs: new Set() });
    if (path) {
      get().refreshFileTree();
    }
  },

  refreshFileTree: async () => {
    const { projectPath } = get();
    if (!projectPath) return;

    set({ isLoading: true });
    try {
      const tree = await getFileTree(projectPath);
      set({ fileTree: tree, isLoading: false });
    } catch (err) {
      console.error('Failed to load file tree:', err);
      set({ isLoading: false });
    }
  },

  toggleDir: (path) => {
    set((state) => {
      const next = new Set(state.expandedDirs);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return { expandedDirs: next };
    });
  },

  selectFile: (path) => {
    set({ selectedFile: path });
  },

  openProject: async () => {
    try {
      const { open } = await import('@tauri-apps/plugin-dialog');
      const selected = await open({ directory: true, multiple: false, title: 'Open Project Folder' });
      if (selected && typeof selected === 'string') {
        get().setProjectPath(selected);
      }
    } catch (err) {
      console.error('Failed to open project dialog:', err);
    }
  },
}));
