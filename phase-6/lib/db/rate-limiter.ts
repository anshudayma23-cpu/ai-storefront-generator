import { supabaseAdmin } from './client';

export interface RateLimitResult {
  limited: boolean;
  count: number;
  retryAfterSeconds?: number;
}

const MAX_GENERATIONS_PER_HOUR = 10;
const ONE_HOUR_MS = 60 * 60 * 1000;

export async function checkRateLimit(ip: string): Promise<RateLimitResult> {
  const cleanIp = ip.trim() || '127.0.0.1';
  const now = new Date();

  try {
    const { data: record, error } = await supabaseAdmin
      .from('rate_limits')
      .select('*')
      .eq('ip', cleanIp)
      .single();

    if (error && error.code !== 'PGRST116') {
      // If table doesn't exist or DB unreachable, fail open to avoid blocking creators
      return { limited: false, count: 1 };
    }

    if (!record) {
      // First time IP record
      await supabaseAdmin.from('rate_limits').insert({
        ip: cleanIp,
        count: 1,
        window_start: now.toISOString(),
      });
      return { limited: false, count: 1 };
    }

    const windowStart = new Date(record.window_start).getTime();
    const elapsedMs = now.getTime() - windowStart;

    if (elapsedMs > ONE_HOUR_MS) {
      // Reset window
      await supabaseAdmin
        .from('rate_limits')
        .update({
          count: 1,
          window_start: now.toISOString(),
        })
        .eq('ip', cleanIp);
      return { limited: false, count: 1 };
    }

    if (record.count >= MAX_GENERATIONS_PER_HOUR) {
      const remainingSeconds = Math.ceil((ONE_HOUR_MS - elapsedMs) / 1000);
      return {
        limited: true,
        count: record.count,
        retryAfterSeconds: remainingSeconds,
      };
    }

    // Increment count
    const nextCount = record.count + 1;
    await supabaseAdmin
      .from('rate_limits')
      .update({ count: nextCount })
      .eq('ip', cleanIp);

    return { limited: false, count: nextCount };
  } catch (err) {
    return { limited: false, count: 1 };
  }
}
