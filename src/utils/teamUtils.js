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
  england: '🇬🇧',
  scotland: 'SCO',
  wales: 'WAL',
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
  'bosnia and herzegovina': '🇧🇦',
'bosnia-herzegovina': '🇧🇦',
bosnia: '🇧🇦',

  // Asia
  japan: '🇯🇵',
  'south korea': '🇰🇷',
  'korea republic': '🇰🇷',
  korea: '🇰🇷',
  australia: '🇦🇺',
  iran: '🇮🇷',
  'ir iran': '🇮🇷',
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
  'cote divoire': '🇨🇮',
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

const TEAM_TRANSLATIONS = {
  // Norteamérica
  mexico: 'México',
  'united states': 'Estados Unidos',
  usa: 'Estados Unidos',
  'united states of america': 'Estados Unidos',
  canada: 'Canadá',

  // Sudamérica
  argentina: 'Argentina',
  brazil: 'Brasil',
  brasil: 'Brasil',
  uruguay: 'Uruguay',
  colombia: 'Colombia',
  ecuador: 'Ecuador',
  chile: 'Chile',
  peru: 'Perú',
  paraguay: 'Paraguay',
  bolivia: 'Bolivia',
  venezuela: 'Venezuela',

  // Europa
  spain: 'España',
  france: 'Francia',
  germany: 'Alemania',
  england: 'Inglaterra',
  scotland: 'Escocia',
  wales: 'Gales',
  portugal: 'Portugal',
  italy: 'Italia',
  netherlands: 'Países Bajos',
  holland: 'Países Bajos',
  belgium: 'Bélgica',
  croatia: 'Croacia',
  switzerland: 'Suiza',
  denmark: 'Dinamarca',
  serbia: 'Serbia',
  poland: 'Polonia',
  austria: 'Austria',
  hungary: 'Hungría',
  romania: 'Rumania',
  ukraine: 'Ucrania',
  turkey: 'Turquía',
  türkiye: 'Turquía',
  czechia: 'República Checa',
  'czech republic': 'República Checa',
  slovakia: 'Eslovaquia',
  slovenia: 'Eslovenia',
  norway: 'Noruega',
  sweden: 'Suecia',
  finland: 'Finlandia',
  ireland: 'Irlanda',
  'republic of ireland': 'Irlanda',
  greece: 'Grecia',
  'bosnia and herzegovina': 'Bosnia y Herzegovina',
'bosnia-herzegovina': 'Bosnia y Herzegovina',
bosnia: 'Bosnia y Herzegovina',

  // Asia
  japan: 'Japón',
  'south korea': 'Corea del Sur',
  'korea republic': 'Corea del Sur',
  korea: 'Corea del Sur',
  australia: 'Australia',
  iran: 'Irán',
  'ir iran': 'Irán',
  'saudi arabia': 'Arabia Saudita',
  qatar: 'Catar',
  iraq: 'Irak',
  jordan: 'Jordania',
  uzbekistan: 'Uzbekistán',
  china: 'China',
  indonesia: 'Indonesia',
  thailand: 'Tailandia',
  vietnam: 'Vietnam',
  'united arab emirates': 'Emiratos Árabes Unidos',
  uae: 'Emiratos Árabes Unidos',
  oman: 'Omán',
  bahrain: 'Baréin',
  kuwait: 'Kuwait',

  // África
  morocco: 'Marruecos',
  senegal: 'Senegal',
  ghana: 'Ghana',
  nigeria: 'Nigeria',
  cameroon: 'Camerún',
  tunisia: 'Túnez',
  egypt: 'Egipto',
  algeria: 'Argelia',
  mali: 'Malí',
  ivory: 'Costa de Marfil',
  'ivory coast': 'Costa de Marfil',
  "cote d'ivoire": 'Costa de Marfil',
  'cote divoire': 'Costa de Marfil',
  'south africa': 'Sudáfrica',
  zambia: 'Zambia',
  angola: 'Angola',
  congo: 'Congo',
  'dr congo': 'RD Congo',
  'democratic republic of congo': 'RD Congo',
  gabon: 'Gabón',
  guinea: 'Guinea',
  'equatorial guinea': 'Guinea Ecuatorial',
  cape: 'Cabo Verde',
  'cape verde': 'Cabo Verde',

  // Concacaf / Caribe / Centroamérica
  'costa rica': 'Costa Rica',
  panama: 'Panamá',
  honduras: 'Honduras',
  jamaica: 'Jamaica',
  'el salvador': 'El Salvador',
  guatemala: 'Guatemala',
  haiti: 'Haití',
  curaçao: 'Curazao',
  curacao: 'Curazao',
  'trinidad and tobago': 'Trinidad y Tobago',
  'dominican republic': 'República Dominicana',

  // Oceanía
  'new zealand': 'Nueva Zelanda',
};

export function normalizeTeamName(teamName = '') {
  return teamName
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’']/g, '')
    .replace(/\./g, '');
}

function findTeamKey(teamName = '') {
  const normalizedTeamName = normalizeTeamName(teamName);

  if (TEAM_FLAGS[normalizedTeamName] || TEAM_TRANSLATIONS[normalizedTeamName]) {
    return normalizedTeamName;
  }

  return Object.keys({
    ...TEAM_FLAGS,
    ...TEAM_TRANSLATIONS,
  }).find((teamKey) => {
    const normalizedTeamKey = normalizeTeamName(teamKey);

    return (
      normalizedTeamName === normalizedTeamKey ||
      normalizedTeamName.includes(normalizedTeamKey) ||
      normalizedTeamKey.includes(normalizedTeamName)
    );
  });
}

export function getTeamFlag(teamName = '') {
  const teamKey = findTeamKey(teamName);

  return teamKey ? TEAM_FLAGS[teamKey] || '🏳️' : '🏳️';
}

export function getTeamDisplayName(teamName = '') {
  const teamKey = findTeamKey(teamName);

  return teamKey ? TEAM_TRANSLATIONS[teamKey] || teamName : teamName;
}