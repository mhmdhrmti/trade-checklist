import { NextResponse } from 'next/server';
import { tradePayloadSchema } from '@/lib/schema';
import { appendTrade, SheetsError } from '@/lib/sheets/googleSheets';
import type { ApiErrorCode, ApiResponse } from '@/types/trade';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const STATUS: Record<ApiErrorCode, number> = {
  invalid_payload: 400,
  sheets_not_configured: 503,
  sheets_forbidden: 502,
  sheets_not_found: 502,
  sheets_error: 502,
};

const fail = (error: ApiErrorCode) =>
  NextResponse.json<ApiResponse>(
    { ok: false, error },
    { status: STATUS[error], headers: { 'Cache-Control': 'no-store' } },
  );

/** Receives a finished trade and appends it to the Google Sheet. Nothing is stored locally. */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail('invalid_payload');
  }

  const parsed = tradePayloadSchema.safeParse(body);
  if (!parsed.success) return fail('invalid_payload');

  try {
    await appendTrade(parsed.data);
    return NextResponse.json<ApiResponse>({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const code = error instanceof SheetsError ? error.code : 'sheets_error';
    // Log the reason server-side only; never echo upstream details (or any credential) to the client.
    console.error('[api/trades]', code, error instanceof Error ? error.message : error);
    return fail(code);
  }
}
