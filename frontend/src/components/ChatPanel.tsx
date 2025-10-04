import { FormEvent, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';

export function ChatPanel() {
  const { session, addMessage, extractParameters } = useAppStore();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const content = inputRef.current?.value?.trim();
    if (!content) return;
    addMessage({ role: 'user', content });
    inputRef.current!.value = '';
    await extractParameters(content);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="chat-log">
        {session.history.map((m, idx) => (
          <div key={idx} className={`message ${m.role}`}>
            {m.content}
          </div>
        ))}
      </div>
      <form className="form" onSubmit={onSubmit}>
        <textarea ref={inputRef} rows={2} placeholder="Type a message..." style={{ flex: 1 }} />
        <button className="btn primary" type="submit">Send</button>
      </form>
    </div>
  );
}
