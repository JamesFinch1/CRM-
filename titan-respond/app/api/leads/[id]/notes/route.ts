import { NextResponse } from "next/server";
import { getSessionUser } from "../../../../lib/auth";
import { q } from "../../../../lib/db";
import { audit } from "../../../../lib/audit";
export async function POST(
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const note = String(body.note || "").trim();

  if (!note) {
    return NextResponse.json(
      { error: "Note is required" },
      { status: 400 }
    );
  }

  const result = await q(
    `
      UPDATE leads
      SET notes = CASE
        WHEN notes IS NULL OR notes = '' THEN $1
        ELSE notes || E'\n\n' || $1
      END
      WHERE id = $2
        AND organization_id = $3
      RETURNING id, notes
    `,
    [note, id, user.organizationId]
  );

  if (result.rows.length === 0) {
    return NextResponse.json(
      { error: "Lead not found" },
      { status: 404 }
    );
  }

await audit(
  user.organizationId,
  user.id,
  "lead.note_added",
  "lead",
  id,
  { description: "Note added to lead" }
);
  
  return NextResponse.json({
    ok: true,
    notes: result.rows[0].notes
  });
}
