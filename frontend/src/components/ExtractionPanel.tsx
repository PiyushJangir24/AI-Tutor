import { useAppStore } from '../store/useAppStore';

export function ExtractionPanel() {
  const { session, setTeachingStyle, setEmotionalState, setMasteryLevel, orchestrate } = useAppStore();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <div className="small">Session</div>
        <div className="badge">{session.sessionId.slice(0, 8)}</div>
      </div>
      <div className="kv">
        <label>Teaching Style</label>
        <select value={session.teachingStyle} onChange={(e) => setTeachingStyle(e.target.value as any)}>
          <option value="socratic">Socratic</option>
          <option value="directive">Directive</option>
          <option value="exploratory">Exploratory</option>
        </select>
      </div>
      <div className="kv">
        <label>Emotional State</label>
        <select value={session.emotionalState} onChange={(e) => setEmotionalState(e.target.value as any)}>
          <option value="engaged">Engaged</option>
          <option value="neutral">Neutral</option>
          <option value="frustrated">Frustrated</option>
        </select>
      </div>
      <div className="kv">
        <label>Mastery Level</label>
        <input type="number" min={1} max={10} value={session.masteryLevel}
          onChange={(e) => setMasteryLevel(Number(e.target.value))} />
      </div>
      <div className="row">
        <button className="btn" onClick={() => orchestrate('chat')}>Analyze Context</button>
      </div>
      <div className="small">The extractor infers tool inputs from messages.</div>
    </div>
  );
}
