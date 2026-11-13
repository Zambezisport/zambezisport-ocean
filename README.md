# zambezisport-ocean

**English** | [Português](README.pt.md)

Small dependency-free TypeScript utilities for ocean field work and water
sport — conservation surveys, race-day sea calls — from
[**Zambezisport**](https://github.com/Zambezisport) —
[zambezisport.com](https://zambezisport.com).

| file | what it is |
|---|---|
| [`degree-heating.ts`](degree-heating.ts) | Degree Heating Weeks — coral-bleaching thermal stress accumulation (NOAA Coral Reef Watch method) |
| [`wave-spectrum.ts`](wave-spectrum.ts) | Pierson–Moskowitz wave spectrum → significant height, peak period, Douglas sea state, survey-boat workability |
| [`tides.ts`](tides.ts) | Harmonic tide prediction from constituents — plan beach surveys, mangrove access, launch windows |
| [`drift.ts`](drift.ts) | Surface drift / leeway trajectories for floating objects under wind + current forcing |

```ts
import { degreeHeatingWeeks } from "./degree-heating"
import { waveClimate } from "./wave-spectrum"
import { tideHeightM, extrema } from "./tides"

// Coral thermal-stress check over a season of weekly SSTs:
degreeHeatingWeeks({ sstSeriesC: weeklySst, thresholdC: 29.5 })
// → { dhw: 4.6, alert: "alert-1", … }  bleaching likely on sensitive reefs

// Can the survey boat work tomorrow's wind?
waveClimate(14) // → { hsM: 2.9, tpS: 11.0, sea: { state: 5, name: "rough", workable: false } }
```

`wave-spectrum.ts` uses the same spectral family real-time ocean renderers
discretise — here pointed at field work instead of pixels.

Estimates are planning aids — always defer to local forecasts and safety
judgment. MIT licensed.
