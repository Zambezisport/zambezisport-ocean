/**
 * tides.ts — harmonic tide prediction from constituents.
 *
 * h(t) = z0 + Σ Aᵢ·cos(ωᵢ·t − φᵢ)
 *
 * Feed it constituents for a station (from an admiralty table or a global
 * model such as FES/TPXO) and predict height at any time — useful for
 * timing beach surveys, mangrove access, and launch/recovery windows.
 */

export interface Constituent {
  /** e.g. "M2", "S2", "K1", "O1", "N2", "M4" */
  name: string;
  /** Amplitude, m. */
  amplitudeM: number;
  /** Phase lag at station, degrees. */
  phaseDeg: number;
}

/** Angular speeds, degrees per solar hour, for the common constituents. */
export const SPEED_DEG_PER_HOUR: Record<string, number> = {
  M2: 28.984104,
  S2: 30.0,
  N2: 28.43973,
  K2: 30.082137,
  K1: 15.041069,
  O1: 13.943035,
  P1: 14.958931,
  M4: 57.96821,
  MSf: 1.015896,
};

const MS_PER_HOUR = 3.6e6;
const DEG = Math.PI / 180;

/**
 * Predicted water level (m above chart datum) at `time`.
 * `epochHours` is the constituents' phase reference in hours since Unix epoch
 * (default 0 — phases already relative to t=0; adjust if your source differs).
 */
export function tideHeightM(
  meanLevelM: number,
  constituents: Constituent[],
  time: Date | number,
): number {
  const hours = (typeof time === "number" ? time : time.getTime()) / MS_PER_HOUR;
  return (
    meanLevelM +
    constituents.reduce((h, c) => {
      const speed = SPEED_DEG_PER_HOUR[c.name];
      if (speed == null) throw new Error(`unknown constituent "${c.name}"`);
      return h + c.amplitudeM * Math.cos((speed * hours - c.phaseDeg) * DEG);
    }, 0)
  );
}

export interface TideExtremum {
  time: Date;
  heightM: number;
  kind: "high" | "low";
}

/**
 * Scan a window for high/low extrema — step granularity controls resolution
 * (default 10 min, refine by calling again around the result if needed).
 */
export function extrema(
  meanLevelM: number,
  constituents: Constituent[],
  from: Date,
  to: Date,
  stepMin = 10,
): TideExtremum[] {
  const found: TideExtremum[] = [];
  let prev = tideHeightM(meanLevelM, constituents, from.getTime() - stepMin * 60e3);
  let cur = tideHeightM(meanLevelM, constituents, from);

  for (let t = from.getTime() + stepMin * 60e3; t <= to.getTime(); t += stepMin * 60e3) {
    const next = tideHeightM(meanLevelM, constituents, t);
    if (cur > prev && cur > next)
      found.push({ time: new Date(t - stepMin * 60e3), heightM: cur, kind: "high" });
    if (cur < prev && cur < next)
      found.push({ time: new Date(t - stepMin * 60e3), heightM: cur, kind: "low" });
    prev = cur;
    cur = next;
  }
  return found;
}
