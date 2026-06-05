const STORAGE_KEYS = {
  USER: 'quiniela_user',
  MATCHES: 'quiniela_matches',
};

export function getLeagueMatchesStorageKey(leagueId) {
  if (!leagueId) {
    return STORAGE_KEYS.MATCHES;
  }

  return `${STORAGE_KEYS.MATCHES}_${leagueId}`;
}

export function getStorageItem(key, fallbackValue) {
  try {
    const storedValue = localStorage.getItem(key);

    if (!storedValue) {
      return fallbackValue;
    }

    return JSON.parse(storedValue);
  } catch (error) {
    console.error(`Error leyendo localStorage key: ${key}`, error);
    return fallbackValue;
  }
}

export function setStorageItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error guardando localStorage key: ${key}`, error);
  }
}

export function removeStorageItem(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error eliminando localStorage key: ${key}`, error);
  }
}

export function clearQuinielaStorage() {
  removeStorageItem(STORAGE_KEYS.USER);
  removeStorageItem(STORAGE_KEYS.MATCHES);
}

export { STORAGE_KEYS };