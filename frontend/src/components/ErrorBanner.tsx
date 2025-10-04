import { memo } from 'react';

export const ErrorBanner = memo(function ErrorBanner({ error, onClose }: { error: { status: number; message: string }; onClose: () => void }) {
  const label =
    error.status === 400 ? 'Bad Request' :
    error.status === 401 ? 'Unauthorized' :
    error.status === 404 ? 'Not Found' :
    error.status === 429 ? 'Rate Limited' :
    'Server Error';

  return (
    <div className="error">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div>
          <strong>{label}</strong>: {error.message}
        </div>
        <button className="btn" onClick={onClose}>Dismiss</button>
      </div>
    </div>
  );
});
