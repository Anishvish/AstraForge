import { create } from 'zustand';
import { generateId } from '@/lib/utils';

export type SidebarPanel = 'explorer' | 'search' | 'git' | 'agents' | 'settings' | 'chat' | 'review';

export type RightPanelContent = 'chat' | 'agents' | 'models';

export interface AppNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message?: string;
  duration?: number;
  timestamp: number;
}

interface UIState {
  theme: 'dark' | 'light';
  sidebarPanel: SidebarPanel;
  showCommandPalette: boolean;
  showTerminal: boolean;
  showRightPanel: boolean;
  showSidebar: boolean;
  rightPanelContent: RightPanelContent;
  notifications: AppNotification[];

  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
  setSidebarPanel: (panel: SidebarPanel) => void;
  toggleCommandPalette: () => void;
  toggleTerminal: () => void;
  toggleRightPanel: () => void;
  toggleSidebar: () => void;
  setRightPanelContent: (content: RightPanelContent) => void;
  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  theme: 'dark',
  sidebarPanel: 'explorer',
  showCommandPalette: false,
  showTerminal: false,
  showRightPanel: false,
  showSidebar: true,
  rightPanelContent: 'chat',
  notifications: [],

  toggleTheme: () => {
    set((state) => {
      const newTheme = state.theme === 'dark' ? 'light' : 'dark';
      const root = document.documentElement;
      root.classList.remove('dark', 'light');
      root.classList.add(newTheme);
      return { theme: newTheme };
    });
  },

  setTheme: (theme) => {
    const root = document.documentElement;
    root.classList.remove('dark', 'light');
    root.classList.add(theme);
    set({ theme });
  },

  setSidebarPanel: (panel) => set({ sidebarPanel: panel, showSidebar: true }),

  toggleCommandPalette: () =>
    set((state) => ({ showCommandPalette: !state.showCommandPalette })),

  toggleTerminal: () => set((state) => ({ showTerminal: !state.showTerminal })),

  toggleRightPanel: () =>
    set((state) => ({ showRightPanel: !state.showRightPanel })),

  toggleSidebar: () => set((state) => ({ showSidebar: !state.showSidebar })),

  setRightPanelContent: (content) =>
    set({ rightPanelContent: content, showRightPanel: true }),

  addNotification: (notification) => {
    const id = generateId();
    const newNotification: AppNotification = {
      ...notification,
      id,
      timestamp: Date.now(),
    };
    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }));

    const duration = notification.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      }, duration);
    }
  },

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}));
