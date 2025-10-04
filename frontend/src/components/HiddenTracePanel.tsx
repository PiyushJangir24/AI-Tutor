import { useAppStore } from '../store/useAppStore';

export function HiddenTracePanel() {
  const { latestTrace } = useAppStore();
  if (!latestTrace?.length) return <div className="small">No trace available.</div>;
  return (
    <div>
      <div className="small" style={{ marginBottom: 8 }}>Hidden Reasoning Trace</div>
      <ol style={{ margin: 0, paddingLeft: 18 }}>
        {latestTrace.map((step, i) => (
          <li key={i} className="small">{step}</li>
        ))}
      </ol>
    </div>
  );
}
