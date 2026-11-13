# zambezisport-ocean

[English](README.md) | **Português**

Pequenos utilitários TypeScript sem dependências para trabalho de campo no mar
e desporto náutico — levantamentos de conservação, decisões de corrida —
da [**Zambezisport**](https://github.com/Zambezisport) —
[zambezisport.com](https://zambezisport.com).

| ficheiro | o que é |
|---|---|
| [`degree-heating.ts`](degree-heating.ts) | Degree Heating Weeks — acumulação de stress térmico de branqueamento de corais (método NOAA Coral Reef Watch) |
| [`wave-spectrum.ts`](wave-spectrum.ts) | Espectro de ondas Pierson–Moskowitz → altura significativa, período de pico, estado do mar Douglas, operacionalidade de embarcações |
| [`tides.ts`](tides.ts) | Previsão harmónica de marés a partir de constituintes — planeamento de levantamentos, acesso a mangais, janelas de lançamento |
| [`drift.ts`](drift.ts) | Trajetórias de deriva superficial / leeway de objetos flutuantes sob vento + corrente |

```ts
import { degreeHeatingWeeks } from "./degree-heating"
import { waveClimate } from "./wave-spectrum"

degreeHeatingWeeks({ sstSeriesC: sstSemanal, thresholdC: 29.5 })
// → { dhw: 4.6, alert: "alert-1", … }

waveClimate(14) // → { hsM: 2.9, tpS: 11.0, sea: { state: 5, workable: false } }
```

Estimativas de planeamento — seguir sempre as previsões locais e o juízo de
segurança. Licença MIT.
