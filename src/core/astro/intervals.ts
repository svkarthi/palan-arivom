export type Interval = { start: number; end: number };

/** Sorted, non-overlapping union of the intervals. */
export function mergeIntervals(items: Interval[]): Interval[] {
  const sorted = items.filter((i) => i.end > i.start).sort((a, b) => a.start - b.start);
  const out: Interval[] = [];
  for (const item of sorted) {
    const last = out[out.length - 1];
    if (last && item.start <= last.end) last.end = Math.max(last.end, item.end);
    else out.push({ ...item });
  }
  return out;
}

/** The parts of `base` not covered by any interval in `holes`. */
export function subtractIntervals(base: Interval[], holes: Interval[]): Interval[] {
  const cut = mergeIntervals(holes);
  const result: Interval[] = [];
  for (const b of mergeIntervals(base)) {
    let cursor = b.start;
    for (const h of cut) {
      if (h.end <= cursor || h.start >= b.end) continue;
      if (h.start > cursor) result.push({ start: cursor, end: h.start });
      cursor = Math.max(cursor, h.end);
    }
    if (cursor < b.end) result.push({ start: cursor, end: b.end });
  }
  return result;
}
