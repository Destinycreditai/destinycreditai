import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../../../lib/database';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { enabled } = await request.json();
    const result = await pool.query(
      'UPDATE feature_toggles SET enabled = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [enabled, params.id]
    );
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to toggle feature' }, { status: 500 });
  }
}