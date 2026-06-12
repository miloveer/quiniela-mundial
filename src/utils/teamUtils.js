const TEAM_FLAGS = {
  mexico: '🇲🇽',
  méxico: '🇲🇽',
  canada: '🇨🇦',
  'united states': '🇺🇸',
  usa: '🇺🇸',
  argentina: '🇦🇷',
  brazil: '🇧🇷',
  brasil: '🇧🇷',
  uruguay: '🇺🇾',
  colombia: '🇨🇴',
  ecuador: '🇪🇨',
  chile: '🇨🇱',
  peru: '🇵🇪',
  paraguay: '🇵🇾',
  bolivia: '🇧🇴',
  venezuela: '🇻🇪',

  spain: '🇪🇸',
  españa: '🇪🇸',
  france: '🇫🇷',
  francia: '🇫🇷',
  germany: '🇩🇪',
  alemania: '🇩🇪',
  england: '🏴',
  inglaterra: '🏴',
  portugal: '🇵🇹',
  italy: '🇮🇹',
  italia: '🇮🇹',
  netherlands: '🇳🇱',
  'países bajos': '🇳🇱',
  belgium: '🇧🇪',
  bélgica: '🇧🇪',
  croatia: '🇭🇷',
  croacia: '🇭🇷',
  switzerland: '🇨🇭',
  suiza: '🇨🇭',
  denmark: '🇩🇰',
  dinamarca: '🇩🇰',
  serbia: '🇷🇸',
  poland: '🇵🇱',
  polonia: '🇵🇱',

  japan: '🇯🇵',
  japón: '🇯🇵',
  korea: '🇰🇷',
  'south korea': '🇰🇷',
  'corea del sur': '🇰🇷',
  australia: '🇦🇺',
  iran: '🇮🇷',
  'saudi arabia': '🇸🇦',
  'arabia saudita': '🇸🇦',
  qatar: '🇶🇦',

  morocco: '🇲🇦',
  marruecos: '🇲🇦',
  senegal: '🇸🇳',
  ghana: '🇬🇭',
  nigeria: '🇳🇬',
  cameroon: '🇨🇲',
  camerún: '🇨🇲',
  tunisia: '🇹🇳',
  túnez: '🇹🇳',
  egypt: '🇪🇬',
  egipto: '🇪🇬',
};

export function normalizeTeamName(teamName = '') {
  return teamName
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function getTeamFlag(teamName = '') {
  const normalizedTeamName = normalizeTeamName(teamName);

  return (
    TEAM_FLAGS[normalizedTeamName] ||
    TEAM_FLAGS[teamName.toString().trim().toLowerCase()] ||
    '🏳️'
  );
}