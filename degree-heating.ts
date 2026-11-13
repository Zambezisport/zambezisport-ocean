/**
 * degree-heating.ts — Degree Heating Weeks (DHW), the standard coral-bleaching
 * thermal-stress metric used by NOAA Coral Reef Watch.
 *
 * For each week: HotSpot = SST − bleaching threshold (usually the maximum
 * monthly mean climatology, MMM). Positive HotSpots accumulate:
 * DHW = Σ(HotSpot) / 7 over a rolling 12-week window.
 * Alert levels: <4 watch · 4–8 bleaching likely · ≥8 severe bleaching likely.
 */

export interface DhwInput {
  /** Weekly mean sea-surface temperatures, °C, oldest → newest. */
  sstSeriesC: number[];
  /** Bleaching threshold (climatological MMM + 1 °C is the NOAA convention). */
  thresholdC: number;
}

export type BleachingAlert = "none" | "watch" | "alert-1" | "alert-2";

export interface DhwResult {
  /** Accumulated degree-heating weeks at the end of the series. */
  dhw: number;
  alert: BleachingAlert;
  /** Per-week positive anomalies (°C·week), aligned to sstSeriesC. */
  hotSpots: number[];
  /** Peak DHW across the whole window — useful for season summaries. */
  peakDhw: number;
}

const WINDOW_WEEKS = 12;

export function degreeHeatingWeeks({ sstSeriesC, thresholdC }: DhwInput): DhwResult {
  const hotSpots = sstSeriesC.map((sst) => Math.max(0, sst - thresholdC));
  let peak = 0;
  let current = 0;
  for (let i = 0; i < hotSpots.length; i++) {
    const start = Math.max(0, i - WINDOW_WEEKS + 1);
    const window = hotSpots.slice(start, i + 1);
    current = window.reduce((a, b) => a + b, 0) / 7; // °C·weeks → weeks
    if (current > peak) peak = current;
  }
  const dhw = Math.round(current * 10) / 10;
  return { dhw, alert: alertLevel(dhw), hotSpots, peakDhw: Math.round(peak * 10) / 10 };
}

export function alertLevel(dhw: number): BleachingAlert {
  if (dhw >= 8) return "alert-2";
  if (dhw >= 4) return "alert-1";
  if (dhw > 0) return "watch";
  return "none";
}

export const ALERT_MEANING: Record<BleachingAlert, string> = {
  none: "No thermal stress accumulated.",
  watch: "Warming underway — monitor weekly; no bleaching expected yet.",
  "alert-1": "Bleaching likely on sensitive reefs — increase survey cadence.",
  "alert-2": "Severe, widespread bleaching likely — priority response; document impacts.",
};
