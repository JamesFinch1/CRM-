'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const statuses = [
  'new',
  'queued',
  'calling',
  'qualified',
  'booked',
  'won',
  'lost',
  'do_not_contact',
];

export default function StatusControl({
  leadId,
  currentStatus,
}: {
  leadId: string;
  currentStatus: string;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function updateStatus(nextStatus: string) {
    setStatus(nextStatus);
    setBusy(true);
    setError('');

    try {
      const response = await fetch(`/api/leads/${leadId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || 'Unable to update status');
      }

      router.refresh();
    } catch (e: any) {
      setStatus(currentStatus);
      setError(e.message || 'Unable to update status');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <select
        value={status}
        onChange={(e) => updateStatus(e.target.value)}
        disabled={busy}
      >
        {statuses.map((item) => (
          <option key={item} value={item}>
            {item.replaceAll('_', ' ')}
          </option>
        ))}
      </select>

      {error && <p className="error">{error}</p>}
    </div>
  );
}
