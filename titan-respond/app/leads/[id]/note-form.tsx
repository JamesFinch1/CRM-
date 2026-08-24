'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NoteForm({ leadId }: { leadId: string }) {
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function submitNote(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const trimmed = note.trim();
    if (!trimmed) return;

    setBusy(true);
    setError('');

    try {
      const response = await fetch(`/api/leads/${leadId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ note: trimmed }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || 'Unable to save note');
      }

      setNote('');
      router.refresh();
    } catch (e: any) {
      setError(e.message || 'Unable to save note');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submitNote}>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Add a note about this lead..."
        rows={4}
        maxLength={4000}
      />

      {error && <p className="error">{error}</p>}

      <button
        type="submit"
        className="primary"
        disabled={busy || !note.trim()}
      >
        {busy ? 'Saving…' : 'Add note'}
      </button>
    </form>
  );
}
