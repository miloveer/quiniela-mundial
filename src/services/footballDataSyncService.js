import { auth } from '../firebase/firebaseConfig';

export async function syncFootballDataMatches({ leagueId }) {
  const token = await auth.currentUser?.getIdToken();

  if (!token) {
    throw new Error('Necesitas iniciar sesión para actualizar partidos');
  }

  const response = await fetch('/api/sync-football-data-matches', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ leagueId }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || 'No se pudieron actualizar los partidos');
  }

  return data;
}

export async function memberSyncFootballDataMatches({ leagueId }) {
  const token = await auth.currentUser?.getIdToken();

  if (!token) {
    throw new Error('Necesitas iniciar sesión para actualizar resultados');
  }

  const response = await fetch('/api/member-sync-football-data-matches', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ leagueId }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || 'No se pudieron actualizar los resultados');
  }

  return data;
}