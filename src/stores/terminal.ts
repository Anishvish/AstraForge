import { create } from 'zustand';
import { generateId } from '@/lib/utils';
import type { TerminalSessionInfo } from '@/lib/tauri';

interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'system';
  content: string;
  timestamp: number;
}

export interface TerminalSession extends TerminalSessionInfo {
  lines: TerminalLine[];
  cwd: string;
}

interface TerminalState {
  sessions: TerminalSession[];
  activeSessionId: string | null;

  createSession: (name?: string, cwd?: string) => string;
  removeSession: (id: string) => void;
  setActiveSession: (id: string) => void;
  addLine: (sessionId: string, type: TerminalLine['type'], content: string) => void;
  setCwd: (sessionId: string, cwd: string) => void;
}

export const useTerminalStore = create<TerminalState>((set, get) => ({
  sessions: [],
  activeSessionId: null,

  createSession: (name, cwd) => {
    const id = generateId();
    const sessionCount = get().sessions.length + 1;
    const session: TerminalSession = {
      id,
      name: name ?? `Terminal ${sessionCount}`,
      is_active: true,
      lines: [
        {
          id: generateId(),
          type: 'system',
          content: `AstraForge Terminal — Session started`,
          timestamp: Date.now(),
        },
      ],
      cwd: cwd ?? '',
    };

    set((state) => ({
      sessions: [...state.sessions, session],
      activeSessionId: id,
    }));

    return id;
  },

  removeSession: (id) => {
    set((state) => {
      const newSessions = state.sessions.filter((s) => s.id !== id);
      let newActiveId = state.activeSessionId;
      if (state.activeSessionId === id) {
        newActiveId = newSessions.length > 0 ? newSessions[newSessions.length - 1].id : null;
      }
      return { sessions: newSessions, activeSessionId: newActiveId };
    });
  },

  setActiveSession: (id) => {
    set({ activeSessionId: id });
  },

  addLine: (sessionId, type, content) => {
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              lines: [
                ...s.lines,
                { id: generateId(), type, content, timestamp: Date.now() },
              ],
            }
          : s,
      ),
    }));
  },

  setCwd: (sessionId, cwd) => {
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === sessionId ? { ...s, cwd } : s,
      ),
    }));
  },
}));
