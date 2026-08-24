"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CallButton({ leadId }: { leadId: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function callCustomer() {
    setBusy(true);
    setError("");

    try {
      const response = await fetch(`/api/leads/${leadId}/call`, {
        method: "POST",
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Unable to queue call");
      }

      router.refresh();
    } catch (e: any) {
      setError(e.message || "Unable to queue call");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={callCustomer}
        disabled={busy}
      >
        {busy ? "Queuing call..." : "Call customer"}
      </button>

      {error && <p className="error">{error}</p>}
    </div>
  );
}
