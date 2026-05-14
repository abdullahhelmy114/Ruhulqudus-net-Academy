export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherUid = searchParams.get('teacherUid');

    if (!teacherUid) {
      return NextResponse.json({ error: 'Missing teacherUid' }, { status: 400 });
    }

    const sessions = await sql`
      SELECT l.id, l.title, l.scheduled_at, l.meeting_url, l.course_id, c.title as course_title
      FROM lessons l
      JOIN courses c ON l.course_id = c.id
      WHERE l.teacher_uid = ${teacherUid}
        AND l.type = 'zoom'
        AND l.status = 'approved'
        AND l.scheduled_at IS NOT NULL
      ORDER BY l.scheduled_at ASC
    `;

    return NextResponse.json({ sessions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}