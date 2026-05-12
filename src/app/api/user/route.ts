import { NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';

export async function POST(request: Request) {
  try {
    const { firebase_uid, email, full_name } = await request.json();
    
    // التحقق من عدم وجود المستخدم مسبقًا
    const existing = await sql`
      SELECT id FROM profiles WHERE firebase_uid = ${firebase_uid}
    `;
    
    if (existing.length === 0) {
      await sql`
        INSERT INTO profiles (firebase_uid, email, full_name)
        VALUES (${firebase_uid}, ${email}, ${full_name})
      `;
      return NextResponse.json({ created: true });
    }
    
    return NextResponse.json({ created: false, message: 'User already exists' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}