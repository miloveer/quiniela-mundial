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
    userPrediction: {
      homeScore: 2,
      awayScore: 1,
    },
    result: {
      homeScore: 2,
      awayScore: 1,
    },
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
    result: {
      homeScore: 1,
      awayScore: 1,
    },
    isLocked: false,
  },
  {
    id: 'match-003',
    stageId: 'group-stage',
    homeTeam: 'Brasil',
    awayTeam: 'España',
    date: '2026-06-13T18:00:00',
    stadium: 'SoFi Stadium',
    userPrediction: {
      homeScore: 1,
      awayScore: 1,
    },
    result: {
      homeScore: 2,
      awayScore: 2,
    },
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

export const ranking = [
  {
    id: 'user-001',
    name: 'Milo',
    points: 18,
    exactScores: 4,
    badge: 'Líder',
  },
  {
    id: 'user-002',
    name: 'Carlos',
    points: 15,
    exactScores: 3,
    badge: 'Constante',
  },
  {
    id: 'user-003',
    name: 'Ana',
    points: 12,
    exactScores: 2,
    badge: 'Sorpresa',
  },
  {
    id: 'user-004',
    name: 'Luis',
    points: 9,
    exactScores: 1,
    badge: 'En remontada',
  },
];
export const users = [
  {
    id: 'user-001',
    name: 'Milo',
    badge: 'Líder',
    predictions: {
      'match-001': {
        homeScore: 2,
        awayScore: 1,
      },
      'match-002': {
        homeScore: 1,
        awayScore: 1,
      },
      'match-003': {
        homeScore: 1,
        awayScore: 1,
      },
    },
  },
  {
    id: 'user-002',
    name: 'Carlos',
    badge: 'Constante',
    predictions: {
      'match-001': {
        homeScore: 1,
        awayScore: 0,
      },
      'match-002': {
        homeScore: 2,
        awayScore: 1,
      },
      'match-003': {
        homeScore: 2,
        awayScore: 2,
      },
    },
  },
  {
    id: 'user-003',
    name: 'Ana',
    badge: 'Sorpresa',
    predictions: {
      'match-001': {
        homeScore: 0,
        awayScore: 2,
      },
      'match-002': {
        homeScore: 1,
        awayScore: 1,
      },
      'match-003': {
        homeScore: 3,
        awayScore: 1,
      },
    },
  },
  {
    id: 'user-004',
    name: 'Luis',
    badge: 'En remontada',
    predictions: {
      'match-001': {
        homeScore: 2,
        awayScore: 1,
      },
      'match-002': {
        homeScore: 0,
        awayScore: 0,
      },
      'match-003': {
        homeScore: 2,
        awayScore: 2,
      },
    },
  },
];
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