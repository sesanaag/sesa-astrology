import { NextRequest, NextResponse } from 'next/server';
import { scanMicroTimeline } from '@/lib/engine/micro';

export async function GET(request: NextRequest) {
  const dateParam = request.nextUrl.searchParams.get('date');
  const activityKey = request.nextUrl.searchParams.get('activity');
  const lat = parseFloat(request.nextUrl.searchParams.get('lat') || '51.6242');
  const lon = parseFloat(request.nextUrl.searchParams.get('lon') || '0.0604');

  if (!dateParam || !activityKey) return NextResponse.json({ error: "Missing parameters" }, { status: 400 });

  try {
    const result = await scanMicroTimeline(dateParam, activityKey, lat, lon);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
