const hits = new Map<string, number[]>();

const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  const cutoff = now - windowMs;
  for (const [key, timestamps] of hits) {
    const recent = timestamps.filter((t) => t > cutoff);
    if (recent.length === 0) {
      hits.delete(key);
    } else {
      hits.set(key, recent);
    }
  }
}

export function rateLimit(
  ip: string,
  limit: number,
  windowMs: number
): { limited: false } | { limited: true; retryAfter: number } {
  cleanup(windowMs);

  const now = Date.now();
  const cutoff = now - windowMs;
  const key = `${ip}:${limit}:${windowMs}`;

  const timestamps = hits.get(key) ?? [];
  const recent = timestamps.filter((t) => t > cutoff);

  if (recent.length >= limit) {
    const oldest = recent[0];
    const retryAfter = Math.ceil((oldest + windowMs - now) / 1000);
    return { limited: true, retryAfter };
  }

  recent.push(now);
  hits.set(key, recent);
  return { limited: false };
}
