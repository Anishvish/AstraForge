import { create } from 'zustand';
import type { GitStatus, GitBranch, GitCommit } from '@/lib/tauri';
import * as tauri from '@/lib/tauri';

interface GitState {
  status: GitStatus | null;
  branches: GitBranch[];
  currentBranch: string;
  commitHistory: GitCommit[];
  isLoading: boolean;

  refreshStatus: (projectPath: string) => Promise<void>;
  refreshBranches: (projectPath: string) => Promise<void>;
  stageFiles: (projectPath: string, files: string[]) => Promise<void>;
  unstageFiles: (projectPath: string, files: string[]) => Promise<void>;
  commit: (projectPath: string, message: string) => Promise<void>;
  refreshHistory: (projectPath: string) => Promise<void>;
}

export const useGitStore = create<GitState>((set, get) => ({
  status: null,
  branches: [],
  currentBranch: 'main',
  commitHistory: [],
  isLoading: false,

  refreshStatus: async (projectPath) => {
    set({ isLoading: true });
    try {
      const status = await tauri.gitStatus(projectPath);
      set({ status, currentBranch: status.branch, isLoading: false });
    } catch (err) {
      console.error('Failed to refresh git status:', err);
      set({ isLoading: false });
    }
  },

  refreshBranches: async (projectPath) => {
    try {
      const branches = await tauri.gitBranches(projectPath);
      set({ branches });
    } catch (err) {
      console.error('Failed to refresh branches:', err);
    }
  },

  stageFiles: async (projectPath, files) => {
    try {
      await tauri.gitStage(projectPath, files);
      await get().refreshStatus(projectPath);
    } catch (err) {
      console.error('Failed to stage files:', err);
    }
  },

  unstageFiles: async (projectPath, files) => {
    try {
      await tauri.gitUnstage(projectPath, files);
      await get().refreshStatus(projectPath);
    } catch (err) {
      console.error('Failed to unstage files:', err);
    }
  },

  commit: async (projectPath, message) => {
    try {
      await tauri.gitCommit(projectPath, message);
      await get().refreshStatus(projectPath);
      await get().refreshHistory(projectPath);
    } catch (err) {
      console.error('Failed to commit:', err);
    }
  },

  refreshHistory: async (projectPath) => {
    try {
      const commitHistory = await tauri.gitLog(projectPath, 50);
      set({ commitHistory });
    } catch (err) {
      console.error('Failed to refresh history:', err);
    }
  },
}));
