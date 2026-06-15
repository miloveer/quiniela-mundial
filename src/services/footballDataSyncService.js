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
    throw new Error(
      data?.message ||
        data?.error ||
        `No se pudieron actualizar los partidos. Código ${response.status}`
    );
  }

  return data;
}