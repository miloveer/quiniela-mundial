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

// Códigos ISO-3166 (o de región para las selecciones del Reino Unido) que
// usa flagcdn.com para servir la imagen real de la bandera de cada equipo.
const TEAM_ISO_CODES = {
  mexico: 'mx',
  'united states': 'us',
  usa: 'us',
  'united states of america': 'us',
  canada: 'ca',

  argentina: 'ar',
  brazil: 'br',
  brasil: 'br',
  uruguay: 'uy',
  colombia: 'co',
  ecuador: 'ec',
  chile: 'cl',
  peru: 'pe',
  paraguay: 'py',
  bolivia: 'bo',
  venezuela: 've',

  spain: 'es',
  france: 'fr',
  germany: 'de',
  england: 'gb-eng',
  scotland: 'gb-sct',
  wales: 'gb-wls',
  portugal: 'pt',
  italy: 'it',
  netherlands: 'nl',
  holland: 'nl',
  belgium: 'be',
  croatia: 'hr',
  switzerland: 'ch',
  denmark: 'dk',
  serbia: 'rs',
  poland: 'pl',
  austria: 'at',
  hungary: 'hu',
  romania: 'ro',
  ukraine: 'ua',
  turkey: 'tr',
  türkiye: 'tr',
  czechia: 'cz',
  'czech republic': 'cz',
  slovakia: 'sk',
  slovenia: 'si',
  norway: 'no',
  sweden: 'se',
  finland: 'fi',
  ireland: 'ie',
  'republic of ireland': 'ie',
  greece: 'gr',
  'bosnia and herzegovina': 'ba',
  'bosnia-herzegovina': 'ba',
  bosnia: 'ba',

  japan: 'jp',
  'south korea': 'kr',
  'korea republic': 'kr',
  korea: 'kr',
  australia: 'au',
  iran: 'ir',
  'ir iran': 'ir',
  'saudi arabia': 'sa',
  qatar: 'qa',
  iraq: 'iq',
  jordan: 'jo',
  uzbekistan: 'uz',
  china: 'cn',
  indonesia: 'id',
  thailand: 'th',
  vietnam: 'vn',
  'united arab emirates': 'ae',
  uae: 'ae',
  oman: 'om',
  bahrain: 'bh',
  kuwait: 'kw',

  morocco: 'ma',
  senegal: 'sn',
  ghana: 'gh',
  nigeria: 'ng',
  cameroon: 'cm',
  tunisia: 'tn',
  egypt: 'eg',
  algeria: 'dz',
  mali: 'ml',
  ivory: 'ci',
  'ivory coast': 'ci',
  "cote d'ivoire": 'ci',
  'cote divoire': 'ci',
  'south africa': 'za',
  zambia: 'zm',
  angola: 'ao',
  congo: 'cg',
  'dr congo': 'cd',
  'democratic republic of congo': 'cd',
  gabon: 'ga',
  guinea: 'gn',
  'equatorial guinea': 'gq',
  cape: 'cv',
  'cape verde': 'cv',

  'costa rica': 'cr',
  panama: 'pa',
  honduras: 'hn',
  jamaica: 'jm',
  'el salvador': 'sv',
  guatemala: 'gt',
  haiti: 'ht',
  curaçao: 'cw',
  curacao: 'cw',
  'trinidad and tobago': 'tt',
  'dominican republic': 'do',

  'new zealand': 'nz',
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

// Índice de búsqueda: registra tanto el nombre en inglés (clave original)
// como su traducción al español, apuntando ambos a la MISMA clave canónica.
// Así "Marruecos" o "Morocco" (o "morocco." con acentos/mayúsculas) resuelven
// al mismo equipo, sin importar en qué idioma se haya escrito en Supabase.
const TEAM_LOOKUP_INDEX = {};

Object.keys(TEAM_FLAGS).forEach((key) => {
  TEAM_LOOKUP_INDEX[normalizeTeamName(key)] = key;
});

Object.entries(TEAM_TRANSLATIONS).forEach(([key, spanishName]) => {
  TEAM_LOOKUP_INDEX[normalizeTeamName(key)] = key;
  TEAM_LOOKUP_INDEX[normalizeTeamName(spanishName)] = key;
});

function findTeamKey(teamName = '') {
  const normalizedTeamName = normalizeTeamName(teamName);

  if (TEAM_LOOKUP_INDEX[normalizedTeamName]) {
    return TEAM_LOOKUP_INDEX[normalizedTeamName];
  }

  const matchedIndexKey = Object.keys(TEAM_LOOKUP_INDEX).find((indexKey) => {
    return (
      normalizedTeamName === indexKey ||
      normalizedTeamName.includes(indexKey) ||
      indexKey.includes(normalizedTeamName)
    );
  });

  return matchedIndexKey ? TEAM_LOOKUP_INDEX[matchedIndexKey] : undefined;
}

// Emoji de bandera (se usa como respaldo si la imagen real no carga,
// o si el equipo aún no está definido, p. ej. "Por definir").
export function getTeamFlag(teamName = '') {
  const teamKey = findTeamKey(teamName);

  return teamKey ? TEAM_FLAGS[teamKey] || '🏳️' : '🏳️';
}

export function getTeamDisplayName(teamName = '') {
  const teamKey = findTeamKey(teamName);

  return teamKey ? TEAM_TRANSLATIONS[teamKey] || teamName : teamName;
}

// URL de la bandera real (PNG) desde flagcdn.com. Regresa null si el
// equipo todavía no está definido (p. ej. "Por definir"), para que el
// componente que la use pueda mostrar un respaldo.
// size acepta: w20, w40, w80, w160, w320, w640, w1280, w2560
export function getTeamFlagUrl(teamName = '', size = 'w80') {
  const teamKey = findTeamKey(teamName);
  const isoCode = teamKey ? TEAM_ISO_CODES[teamKey] : null;

  if (!isoCode) {
    return null;
  }

  return `https://flagcdn.com/${size}/${isoCode}.png`;
}
