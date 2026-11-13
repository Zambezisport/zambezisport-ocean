/**
 * drift.ts — surface drift / leeway for floating objects.
 *
 * A floating object (debris, a lost buoy, a hatchling slick, a person in the
 * water) moves with the surface current plus a wind-driven "leeway" fraction.
 * Integrates a simple Euler trajectory over wind/current time series.
 *
 * Typical leeway: debris ~1–4 % of wind + downwind-slip; persons in water
 * ~1–3 %. Not a SAR tool — planning aid only.
 */

export interface Vec {
  /** m/s toward the east. */
  u: number;
  /** m/s toward the north. */
  v: number;
}

export interface DriftForcing {
  /** Time of this forcing step, ms epoch. */
  t: number;
  wind: Vec;
  current: Vec;
}

export interface DriftInput {
  start: { lat: number; lon: number; t: number };
  forcing: DriftForcing[];
  /** Fraction of wind vector added to drift, e.g. 0.03 = 3 %. */
  leewayPct: number;
  /** Extra downwind-slip m/s (object sails off the wind line). Default 0. */
  downwindSlipMps?: number;
}

const EARTH_M = 6.371e6;
const DEG = Math.PI / 180;

export function driftTrack(input: DriftInput): Array<{ lat: number; lon: number; t: number }> {
  const { leewayPct, downwindSlipMps = 0 } = input;
  const track = [{ ...input.start }];

  for (let i = 1; i < input.forcing.length; i++) {
    const f = input.forcing[i];
    const dtS = (f.t - input.forcing[i - 1].t) / 1000;
    if (dtS <= 0) continue;

    const windMag = Math.hypot(f.wind.u, f.wind.v);
    const slipU = windMag > 0 ? (downwindSlipMps * f.wind.u) / windMag : 0;
    const slipV = windMag > 0 ? (downwindSlipMps * f.wind.v) / windMag : 0;

    const velU = f.current.u + leewayPct * f.wind.u + slipU;
    const velV = f.current.v + leewayPct * f.wind.v + slipV;

    const prev = track[track.length - 1];
    const dLat = (velV * dtS) / EARTH_M / DEG;
    const dLon = (velU * dtS) / (EARTH_M * Math.cos(prev.lat * DEG)) / DEG;
    track.push({ lat: prev.lat + dLat, lon: prev.lon + dLon, t: f.t });
  }
  return track;
}

/** Total straight-line displacement of a track, km. */
export function trackDisplacementKm(track: Array<{ lat: number; lon: number }>): number {
  if (track.length < 2) return 0;
  const a = track[0];
  const b = track[track.length - 1];
  const dLat = (b.lat - a.lat) * DEG;
  const dLon = (b.lon - a.lon) * DEG;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * DEG) * Math.cos(b.lat * DEG) * Math.sin(dLon / 2) ** 2;
  return (2 * EARTH_M * Math.asin(Math.sqrt(h))) / 1000;
}
