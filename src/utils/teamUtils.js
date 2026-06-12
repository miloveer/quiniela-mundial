const TEAM_FLAGS = {
  // Norteamérica
  mexico: '🇲🇽',
  'united states': '🇺🇸',
  usa: '🇺🇸',
  'united states of america': '🇺🇸',
  canada: '🇨🇦',

  // Sudamérica
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

  // Europa
  spain: '🇪🇸',
  france: '🇫🇷',
  germany: '🇩🇪',
  england: '🏴',
  scotland: '🏴',
  wales: '🏴',
  portugal: '🇵🇹',
  italy: '🇮🇹',
  netherlands: '🇳🇱',
  holland: '🇳🇱',
  belgium: '🇧🇪',
  croatia: '🇭🇷',
  switzerland: '🇨🇭',
  denmark: '🇩🇰',
  serbia: '🇷🇸',
  poland: '🇵🇱',
  austria: '🇦🇹',
  hungary: '🇭🇺',
  romania: '🇷🇴',
  ukraine: '🇺🇦',
  turkey: '🇹🇷',
  türkiye: '🇹🇷',
  czechia: '🇨🇿',
  'czech republic': '🇨🇿',
  slovakia: '🇸🇰',
  slovenia: '🇸🇮',
  norway: '🇳🇴',
  sweden: '🇸🇪',
  finland: '🇫🇮',
  ireland: '🇮🇪',
  'republic of ireland': '🇮🇪',
  greece: '🇬🇷',

  // Asia
  japan: '🇯🇵',
  'south korea': '🇰🇷',
  korea: '🇰🇷',
  australia: '🇦🇺',
  iran: '🇮🇷',
  'saudi arabia': '🇸🇦',
  qatar: '🇶🇦',
  iraq: '🇮🇶',
  jordan: '🇯🇴',
  uzbekistan: '🇺🇿',
  china: '🇨🇳',
  indonesia: '🇮🇩',
  thailand: '🇹🇭',
  vietnam: '🇻🇳',
  'united arab emirates': '🇦🇪',
  uae: '🇦🇪',
  oman: '🇴🇲',
  bahrain: '🇧🇭',
  kuwait: '🇰🇼',

  // África
  morocco: '🇲🇦',
  senegal: '🇸🇳',
  ghana: '🇬🇭',
  nigeria: '🇳🇬',
  cameroon: '🇨🇲',
  tunisia: '🇹🇳',
  egypt: '🇪🇬',
  algeria: '🇩🇿',
  mali: '🇲🇱',
  ivory: '🇨🇮',
  'ivory coast': '🇨🇮',
  "cote d'ivoire": '🇨🇮',
  'côte d’ivoire': '🇨🇮',
  'south africa': '🇿🇦',
  zambia: '🇿🇲',
  angola: '🇦🇴',
  congo: '🇨🇩',
  'dr congo': '🇨🇩',
  'democratic republic of congo': '🇨🇩',
  gabon: '🇬🇦',
  guinea: '🇬🇳',
  'equatorial guinea': '🇬🇶',
  cape: '🇨🇻',
  'cape verde': '🇨🇻',

  // Concacaf / Caribe / Centroamérica
  costa: '🇨🇷',
  'costa rica': '🇨🇷',
  panama: '🇵🇦',
  honduras: '🇭🇳',
  jamaica: '🇯🇲',
  'el salvador': '🇸🇻',
  guatemala: '🇬🇹',
  haiti: '🇭🇹',
  curaçao: '🇨🇼',
  curacao: '🇨🇼',
  'trinidad and tobago': '🇹🇹',
  'dominican republic': '🇩🇴',

  // Oceanía
  'new zealand': '🇳🇿',
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

  if (TEAM_FLAGS[normalizedTeamName]) {
    return TEAM_FLAGS[normalizedTeamName];
  }

  const matchedKey = Object.keys(TEAM_FLAGS).find((teamKey) => {
    return (
      normalizedTeamName === teamKey ||
      normalizedTeamName.includes(teamKey) ||
      teamKey.includes(normalizedTeamName)
    );
  });

  return matchedKey ? TEAM_FLAGS[matchedKey] : '🏳️';
}