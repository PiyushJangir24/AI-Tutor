import { useEffect } from 'react';
import { ChatPanel } from './components/ChatPanel';
import { ExtractionPanel } from './components/ExtractionPanel';
import { OrchestrationPanel } from './components/OrchestrationPanel';
import { HiddenTracePanel } from './components/HiddenTracePanel';
import { ErrorBanner } from './components/ErrorBanner';
import { useAppStore } from './store/useAppStore';

export default function App() {
  const { hiddenTraceEnabled, lastError, clearError, loadSessionFromStorage } = useAppStore();

  useEffect(() => {
    loadSessionFromStorage();
  }, [loadSessionFromStorage]);

  return (
    <div className="container">
      <aside className="sidebar">
        <div className="header">
          <div className="row">
            <span className="badge">Hybrid Agent Tutor</span>
          </div>
        </div>
        <div className="section">
          <ExtractionPanel />
        </div>
        <div className="section">
          <OrchestrationPanel />
        </div>
      </aside>
      <main className="main">
        <div className="header">
          <div className="row" style={{ gap: 12 }}>
            <button
              className={`btn ${hiddenTraceEnabled ? 'warn' : ''}`}
              onClick={() => useAppStore.getState().toggleHiddenTrace()}
              title="Toggle Hidden Reasoning Trace"
            >
              {hiddenTraceEnabled ? 'Hidden Trace: ON' : 'Hidden Trace: OFF'}
            </button>
          </div>
        </div>
        {lastError && (
          <div className="section">
            <ErrorBanner error={lastError} onClose={clearError} />
          </div>
        )}
        <ChatPanel />
        {hiddenTraceEnabled && (
          <div className="section">
            <HiddenTracePanel />
          </div>
        )}
      </main>
    </div>
  );
}
