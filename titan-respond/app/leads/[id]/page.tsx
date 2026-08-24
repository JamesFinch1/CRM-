import { redirect } from "next/navigation";
import { getSessionUser } from "../../lib/auth";
import { q } from "../../lib/db";
import Link from "next/link";
import NoteForm from "./note-form";
import StatusControl from "./status-control";
import CallButton from "./call-button";
type Lead = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  service: string | null;
  source: string;
  status: string;
  estimated_value_pence: number | null;
  consent_basis: string | null;
  notes: string | null;
  created_at: string;
  last_contact_at: string | null;
  appointment_at: string | null;
};

type Activity = {
  id: string;
  type: string;
  description: string;
  created_at: string;
};
export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  const { id } = await params;

  const result = await q<Lead>(
    `
      SELECT
        l.id,
        l.name,
        l.phone,
        l.email,
        l.service,
        l.source,
        l.status,
        l.estimated_value_pence,
        l.consent_basis,
        l.notes,
        l.created_at,
        l.last_contact_at,
        (
          SELECT MIN(a.starts_at)
          FROM appointments a
          WHERE a.lead_id = l.id
            AND a.status = 'booked'
            AND a.starts_at >= NOW()
        ) AS appointment_at
      FROM leads l
      WHERE l.id = $1
        AND l.organization_id = $2
      LIMIT 1
    `,
    [id, user.organizationId]
  );

  const lead = result.rows[0];

  const activityResult = await q<Activity>(
  `
    SELECT
      id,
      action AS type,
      COALESCE(metadata->>'description', action) AS description,
      created_at
    FROM audit_log
    WHERE organization_id = $1
      AND entity_type = 'lead'
      AND entity_id = $2
    ORDER BY created_at DESC
    LIMIT 50
  `,
  [user.organizationId, id]
);

const activities = activityResult.rows;
  
  if (!lead) {
    return (
      <main>
        <section className="panel">
          <h1>Lead not found</h1>
          <p className="hint">
            This lead does not exist or you do not have access to it.
          </p>
          <Link href="/">← Back to CRM</Link>
        </section>
      </main>
    );
  }

  const estimatedValue =
    lead.estimated_value_pence == null
      ? null
      : lead.estimated_value_pence / 100;

  return (
    <main>
      <header>
        <div>
          <span className="eyebrow">TITAN DIGITAL</span>
          <h1>{lead.name}</h1>
          <p>Lead details</p>
        </div>

        <div className="headerActions">
          <Link href="/" className="badge">
            ← Back to CRM
          </Link>
        </div>
      </header>

      <section className="panel">
        <div className="panelHead">
          <div>
            <span className="eyebrow">CUSTOMER</span>
            <h2>{lead.name}</h2>
          </div>

          <span className="badge">
            {lead.status.replaceAll("_", " ")}
          </span>
        </div>

        <div className="features">
          <article>
  <h4>Phone</h4>
  <p>{lead.phone}</p>
  <CallButton leadId={lead.id} />
</article>

          <article>
            <h4>Email</h4>
            <p>{lead.email || "Not provided"}</p>
          </article>

          <article>
            <h4>Service requested</h4>
            <p>{lead.service || "Not provided"}</p>
          </article>

          <article>
            <h4>Lead source</h4>
            <p>{lead.source}</p>
          </article>

          <article>
            <h4>Estimated value</h4>
            <p>
              {estimatedValue == null
                ? "Not provided"
                : `£${estimatedValue.toLocaleString("en-GB")}`}
            </p>
          </article>

          <article>
  <h4>Status</h4>
  <StatusControl
    leadId={lead.id}
    currentStatus={lead.status}
  />
</article>

          <article>
            <h4>Contact basis</h4>
            <p>
              {lead.consent_basis
                ? lead.consent_basis.replaceAll("_", " ")
                : "Not recorded"}
            </p>
          </article>

          <article>
            <h4>Created</h4>
            <p>{new Date(lead.created_at).toLocaleString("en-GB")}</p>
          </article>

          <article>
            <h4>Last contact</h4>
            <p>
              {lead.last_contact_at
                ? new Date(lead.last_contact_at).toLocaleString("en-GB")
                : "No contact yet"}
            </p>
          </article>

          <article>
            <h4>Appointment</h4>
            <p>
              {lead.appointment_at
                ? new Date(lead.appointment_at).toLocaleString("en-GB")
                : "No booking yet"}
            </p>
          </article>
        </div>
      </section>

      <section className="panel">
  <div className="panelHead">
    <div>
      <span className="eyebrow">NOTES</span>
      <h2>Lead notes</h2>
    </div>
  </div>

  <NoteForm leadId={lead.id} />

  <div style={{ marginTop: "24px", whiteSpace: "pre-wrap" }}>
    <p>{lead.notes || "No notes recorded yet."}</p>
  </div>
</section>

      <section className="panel">
        <div className="panelHead">
          <div>
            <span className="eyebrow">ACTIVITY</span>
            <h2>Lead history</h2>
          </div>
        </div>

        {activities.length === 0 ? (
  <p className="hint">No activity recorded yet.</p>
) : (
  <div className="features">
        {activities.map((activity) => {
      const activityLabels: Record<string, string> = {
        "lead.create": "Lead created",
        "lead.status": "Status changed",
        "lead.note_added": "Note added",
        "lead.call_queued": "Call queued",
      };

      const label =
        activityLabels[activity.type] ||
        activity.type.replaceAll("_", " ").replaceAll(".", " ");

      return (
        <article key={activity.id}>
          <h4>{label}</h4>
          <p>
            {activity.description === activity.type
              ? label
              : activity.description}
          </p>
          <small>
            {new Date(activity.created_at).toLocaleString("en-GB")}
          </small>
        </article>
      );
    })}
  </div>
)}
      </section>
    </main>
  );
}
