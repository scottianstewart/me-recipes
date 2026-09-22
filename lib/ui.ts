/** Deterministic sticker colour (t0..t5) for a tag or title. */
export function colorClass(key: string): string {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return `t${h % 6}`;
}

/** Combine prep + cook into one friendly total, e.g. "45 min". */
export function totalTime(prep: string, cook: string): string {
  const mins = (s: string) => {
    const m = s.match(/(\d+)\s*(h|hr|hour)/i);
    const n = s.match(/(\d+)\s*(m|min)/i);
    let t = 0;
    if (m) t += parseInt(m[1]) * 60;
    if (n) t += parseInt(n[1]);
    if (!m && !n) {
      const bare = s.match(/^\s*(\d+)\s*$/);
      if (bare) t += parseInt(bare[1]);
    }
    return t;
  };
  const total = mins(prep) + mins(cook);
  if (total === 0) return prep || cook || "";
  if (total < 60) return `${total} min`;
  const h = Math.floor(total / 60);
  const r = total % 60;
  return r ? `${h} hr ${r} min` : `${h} hr`;
}
