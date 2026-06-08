export const stages = [
  {
    id: 'group-stage',
    label: 'Grupos',
    fullName: 'Fase de grupos',
  },
  {
    id: 'round-32',
    label: '16vos',
    fullName: 'Dieciseisavos',
  },
  {
    id: 'round-16',
    label: '8vos',
    fullName: 'Octavos de final',
  },
  {
    id: 'quarter-finals',
    label: '4tos',
    fullName: 'Cuartos de final',
  },
  {
    id: 'semi-finals',
    label: 'Semis',
    fullName: 'Semifinales',
  },
  {
    id: 'finals',
    label: 'Finales',
    fullName: 'Final + tercer lugar',
  },
];

export const matches = [
  {
    id: 'match-001',
    stageId: 'group-stage',
    homeTeam: 'México',
    awayTeam: 'Alemania',
    date: '2026-06-11T19:00:00',
    stadium: 'Estadio Azteca',
    userPrediction: null,
    result: null,
    isLocked: false,
  },
  {
    id: 'match-002',
    stageId: 'group-stage',
    homeTeam: 'Argentina',
    awayTeam: 'Francia',
    date: '2026-06-12T16:00:00',
    stadium: 'MetLife Stadium',
    userPrediction: null,
    result: null,
    isLocked: false,
  },
  {
    id: 'match-003',
    stageId: 'group-stage',
    homeTeam: 'Brasil',
    awayTeam: 'España',
    date: '2026-06-13T18:00:00',
    stadium: 'SoFi Stadium',
    userPrediction: null,
    result: null,
    isLocked: false,
  },
  {
    id: 'match-004',
    stageId: 'round-32',
    homeTeam: '1A',
    awayTeam: '2B',
    date: '2026-06-28T15:00:00',
    stadium: 'Por definir',
    userPrediction: null,
    result: null,
    isLocked: false,
  },
];

export const ranking = [];

export const users = [];

export const prizes = [
  {
    id: 'prize-001',
    position: '1er lugar',
    title: 'Campeón de la quiniela',
    description: 'Premio principal definido por el administrador.',
    reward: '$1,000 MXN',
  },
  {
    id: 'prize-002',
    position: '2do lugar',
    title: 'Subcampeón',
    description: 'Premio para quien quede en segundo lugar.',
    reward: '$500 MXN',
  },
  {
    id: 'prize-003',
    position: '3er lugar',
    title: 'Tercer lugar',
    description: 'Premio de consolación elegante, no migajas.',
    reward: '$250 MXN',
  },
  {
    id: 'prize-004',
    position: 'Premio especial',
    title: 'Más marcadores exactos',
    description: 'Para quien acierte más marcadores exactos durante el torneo.',
    reward: 'Cena / botana / premio sorpresa',
  },
];