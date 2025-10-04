import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '../api/client';
import type { SessionState } from '../api/types';

export type ChatMessage = { role: 'user' | 'assistant'; content: string };

interface AppState {
  session: SessionState;
  hiddenTraceEnabled: boolean;
  lastError: { status: number; message: string } | null;
  latestTrace: string[];

  setTeachingStyle(style: SessionState['teachingStyle']): void;
  setEmotionalState(state: SessionState['emotionalState']): void;
  setMasteryLevel(level: number): void;
  addMessage(message: ChatMessage): void;

  extractParameters(message: string): Promise<void>;
  orchestrate(tool: 'note_maker' | 'flashcard_generator' | 'chat', includeTrace?: boolean): Promise<void>;

  toggleHiddenTrace(): void;
  clearError(): void;
  loadSessionFromStorage(): void;
}

const initialSession: SessionState = {
  sessionId: crypto.randomUUID(),
  teachingStyle: 'socratic',
  emotionalState: 'neutral',
  masteryLevel: 5,
  history: []
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      session: initialSession,
      hiddenTraceEnabled: false,
      lastError: null,
      latestTrace: [],

      setTeachingStyle: (style) => set((s) => ({ session: { ...s.session, teachingStyle: style } })),
      setEmotionalState: (state) => set((s) => ({ session: { ...s.session, emotionalState: state } })),
      setMasteryLevel: (level) => set((s) => ({ session: { ...s.session, masteryLevel: Math.max(1, Math.min(10, Math.round(level))) } })),
      addMessage: (message) => set((s) => ({ session: { ...s.session, history: [...s.session.history, message] } })),

      extractParameters: async (message: string) => {
        try {
          const { session } = get();
          const res = await apiClient.extract({
            message,
            context: {
              sessionId: session.sessionId,
              teachingStyle: session.teachingStyle,
              emotionalState: session.emotionalState,
              masteryLevel: session.masteryLevel
            }
          });
          set({ latestTrace: res.trace || [] });
          // Optimistically append assistant note about inferred params
          set((s) => ({
            session: {
              ...s.session,
              history: [
                ...s.session.history,
                { role: 'assistant', content: `Intent: ${res.intent}${res.tool ? `; Tool: ${res.tool}` : ''}` }
              ]
            }
          }));
        } catch (e: any) {
          set({ lastError: { status: e.status || 500, message: e.message || 'Unknown error' } });
        }
      },

      orchestrate: async (tool, includeTrace = get().hiddenTraceEnabled) => {
        try {
          const { session } = get();
          const res = await apiClient.orchestrate({
            tool,
            parameters: {},
            sessionId: session.sessionId,
            includeTrace
          });
          set({ latestTrace: res.trace || [] });
          // Show normalized results
          const text = res.normalized.text || JSON.stringify(res.normalized.items || res.result, null, 2);
          set((s) => ({ session: { ...s.session, history: [...s.session.history, { role: 'assistant', content: text }] } }));
        } catch (e: any) {
          set({ lastError: { status: e.status || 500, message: e.message || 'Unknown error' } });
        }
      },

      toggleHiddenTrace: () => set((s) => ({ hiddenTraceEnabled: !s.hiddenTraceEnabled })),
      clearError: () => set({ lastError: null }),
      loadSessionFromStorage: () => void 0
    }),
    {
      name: 'ai-tutor-ui',
      partialize: (s) => ({ session: s.session, hiddenTraceEnabled: s.hiddenTraceEnabled })
    }
  )
);
