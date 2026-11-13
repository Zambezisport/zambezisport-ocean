/**
 * wave-spectrum.ts — Pierson–Moskowitz spectrum for a fully developed sea.
 *
 * The same spectral family real-time ocean renderers (FFT wave fields)
 * discretise — here used for conservation work: wave climate at a site,
 * survey-boat operability, sediment and larval transport estimates.
 *
 * Parameterised by wind speed U10 (m/s at 10 m). Fully developed seas only —
 * for fetch-limited or partially developed seas use JONSWAP instead.
 */

const G = 9.80665;
const ALPHA = 8.1e-3; // Phillips constant
const TWO_PI_4 = (2 * Math.PI) ** 4;

/** Spectral density S(f) in m²·s at frequency f (Hz) for wind U10. */
export function spectrumDensity(fHz: number, u10Mps: number): number {
  if (fHz <= 0) return 0;
  const f0 = G / (2 * Math.PI * u10Mps * 1.026); // PM peak frequency
  return (
    (ALPHA * G ** 2) / (TWO_PI_4 * fHz ** 5) *
    Math.exp(-1.25 * (f0 / fHz) ** 4)
  );
}

/** Significant wave height Hs (m) for a fully developed sea. */
export function significantWaveHeightM(u10Mps: number): number {
  return (0.22 * u10Mps ** 2) / G;
}

/** Spectral peak period Tp (s). */
export function peakPeriodS(u10Mps: number): number {
  return (7.7 * u10Mps) / G;
}

export type DouglasSeaState = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

const SEA_STATE: Array<{ maxHs: number; state: DouglasSeaState; name: string }> = [
  { maxHs: 0.0, state: 0, name: "calm (glassy)" },
  { maxHs: 0.1, state: 1, name: "calm (rippled)" },
  { maxHs: 0.5, state: 2, name: "smooth" },
  { maxHs: 1.25, state: 3, name: "slight" },
  { maxHs: 2.5, state: 4, name: "moderate" },
  { maxHs: 4.0, state: 5, name: "rough" },
  { maxHs: 6.0, state: 6, name: "very rough" },
  { maxHs: 9.0, state: 7, name: "high" },
  { maxHs: 14.0, state: 8, name: "very high" },
  { maxHs: Infinity, state: 9, name: "phenomenal" },
];

export interface SeaState {
  state: DouglasSeaState;
  name: string;
  /** Rough small-vessel workability verdict for survey/dive ops. */
  workable: boolean;
}

export function douglasSeaState(hsM: number): SeaState {
  const s = SEA_STATE.find((s) => hsM <= s.maxHs)!;
  return { state: s.state, name: s.name, workable: s.state <= 4 };
}

/** One-call summary: wind → wave climate + whether survey boats can work. */
export function waveClimate(u10Mps: number) {
  const hs = significantWaveHeightM(u10Mps);
  return {
    hsM: Math.round(hs * 100) / 100,
    tpS: Math.round(peakPeriodS(u10Mps) * 10) / 10,
    sea: douglasSeaState(hs),
  };
}
