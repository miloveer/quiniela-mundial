import { auth } from '../firebase/firebaseConfig';

export async function syncFootballDataMatches({ leagueId }) {
  const token = await auth.currentUser?.getIdToken();

  if (!token) {
    throw new Error('MISSING_AUTH_TOKEN');
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
    throw new Error(data?.message || data?.error || 'SYNC_FOOTBALL_DATA_FAILED');
  }

  return data;
}