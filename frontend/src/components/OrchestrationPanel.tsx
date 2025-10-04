import { useAppStore } from '../store/useAppStore';

export function OrchestrationPanel() {
  const { orchestrate, hiddenTraceEnabled } = useAppStore();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="small">Tool Orchestration</div>
      <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
        <button className="btn" onClick={() => orchestrate('note_maker', hiddenTraceEnabled)}>Run Note Maker</button>
        <button className="btn" onClick={() => orchestrate('flashcard_generator', hiddenTraceEnabled)}>Run Flashcard Generator</button>
      </div>
      <div className="small">Calls backend via Middleware API; responses normalized.</div>
    </div>
  );
}
