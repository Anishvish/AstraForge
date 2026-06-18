import { create } from 'zustand';
import { generateId } from '@/lib/utils';
import type { ChatMessage, AiResponse } from '@/lib/tauri';
import * as tauri from '@/lib/tauri';
import { useModelsStore } from '@/stores/models';

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  modelId: string | null;
}

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  isStreaming: boolean;
  streamingContent: string;

  createConversation: (title?: string) => string;
  deleteConversation: (id: string) => void;
  setActiveConversation: (id: string | null) => void;
  addMessage: (conversationId: string, message: ChatMessage) => void;
  sendMessage: (content: string) => Promise<void>;
  setStreamingContent: (content: string) => void;
  clearStreaming: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  isStreaming: false,
  streamingContent: '',

  createConversation: (title) => {
    const id = generateId();
    const modelsStore = useModelsStore.getState();
    const conversation: Conversation = {
      id,
      title: title ?? 'New Chat',
      messages: [],
      createdAt: Date.now(),
      modelId: modelsStore.activeModelId,
    };

    set((state) => ({
      conversations: [conversation, ...state.conversations],
      activeConversationId: id,
    }));

    return id;
  },

  deleteConversation: (id) => {
    set((state) => {
      const newConversations = state.conversations.filter((c) => c.id !== id);
      const newActiveId =
        state.activeConversationId === id
          ? newConversations.length > 0
            ? newConversations[0].id
            : null
          : state.activeConversationId;
      return { conversations: newConversations, activeConversationId: newActiveId };
    });
  },

  setActiveConversation: (id) => set({ activeConversationId: id }),

  addMessage: (conversationId, message) => {
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId
          ? { ...c, messages: [...c.messages, message] }
          : c,
      ),
    }));
  },

  sendMessage: async (content) => {
    const { activeConversationId, conversations } = get();
    let convId = activeConversationId;

    if (!convId) {
      convId = get().createConversation(content.slice(0, 50));
    }

    const modelsStore = useModelsStore.getState();
    const modelId = modelsStore.activeModelId;
    const providerId = modelsStore.activeProviderId;

    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: Date.now(),
      model_id: modelId,
      tokens_used: null,
    };

    get().addMessage(convId, userMessage);
    set({ isStreaming: true, streamingContent: '' });

    try {
      const conversation = get().conversations.find((c) => c.id === convId);
      if (!conversation || !modelId || !providerId) {
        throw new Error('No model or provider configured');
      }

      const response: AiResponse = await tauri.aiChat(
        conversation.messages,
        modelId,
        providerId,
      );

      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: response.content,
        timestamp: Date.now(),
        model_id: response.model,
        tokens_used: response.tokens_used,
      };

      get().addMessage(convId, assistantMessage);

      if (conversation.messages.length === 1) {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === convId ? { ...c, title: content.slice(0, 50) } : c,
          ),
        }));
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      const errorMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: `Error: ${err instanceof Error ? err.message : 'Failed to get response. Make sure an AI provider is configured.'}`,
        timestamp: Date.now(),
        model_id: null,
        tokens_used: null,
      };
      get().addMessage(convId, errorMessage);
    } finally {
      set({ isStreaming: false, streamingContent: '' });
    }
  },

  setStreamingContent: (content) => set({ streamingContent: content }),

  clearStreaming: () => set({ isStreaming: false, streamingContent: '' }),
}));
