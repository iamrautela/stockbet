export type HistoricalSeries = {
  closes: number[];
  timestamps: number[];
  symbol: string;
  range: string;
  source: string;
};

/**
 * Daily closes from `/api/historical` (Yahoo via server). Same-origin or Vite proxy in dev.
 */
export async function fetchHistoricalCloses(
  symbol: string,
  range: '3mo' | '6mo' | '1y' | '2y' | '5y' = '1y'
): Promise<HistoricalSeries | null> {
  try {
    const res = await fetch(
      `/api/historical?${new URLSearchParams({ symbol, range })}`,
      { signal: AbortSignal.timeout(20000) }
    );
    if (!res.ok) return null;
    const j = (await res.json()) as HistoricalSeries;
    if (!j.closes?.length) return null;
    return j;
  } catch {
    return null;
  }
}
