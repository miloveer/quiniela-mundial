export async function syncFootballDataMatches({ leagueId }) {
  const response = await fetch('/api/sync-football-data-matches', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      leagueId,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || 'SYNC_FOOTBALL_DATA_FAILED');
  }

  return data;
}