export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { status, meetingUrl, meetingId } = await request.json();
    const lessonId = params.id;

    if (!lessonId || !status) {
      return NextResponse.json({ error: 'Missing lesson ID or status' }, { status: 400 });
    }

    if (status !== 'approved' && status !== 'rejected') {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const result = await sql`
      UPDATE lessons
      SET 
        status = ${status},
        meeting_url = ${meetingUrl || null},
        meeting_id = ${meetingId || null},
        reviewed_at = NOW()
      WHERE id = ${lessonId}
      RETURNING id, title, status, meeting_url, meeting_id
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    return NextResponse.json({ lesson: result[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}