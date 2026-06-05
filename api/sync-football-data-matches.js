/* eslint-env node */
/* global process */
import admin from 'firebase-admin';

function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  );

  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

function normalizeStage(stage = '') {
  const cleanStage = stage.toLowerCase();

  if (cleanStage.includes('group')) {
    return 'group-stage';
  }

  if (cleanStage.includes('last 32') || cleanStage.includes('round of 32')) {
    return 'round-32';
  }

  if (cleanStage.includes('last 16') || cleanStage.includes('round of 16')) {
    return 'round-16';
  }

  if (cleanStage.includes('quarter')) {
    return 'quarter-finals';
  }

  if (cleanStage.includes('semi')) {
    return 'semi-finals';
  }

  if (cleanStage.includes('third') || cleanStage.includes('final')) {
    return 'finals';
  }

  return 'group-stage';
}

function getTeamName(team) {
  return team?.name || team?.shortName || team?.tla || 'Por definir';
}

function normalizeMatch(match) {
  const isFinished = match.status === 'FINISHED';

  return {
    id: `football-data-${match.id}`,
    externalId: String(match.id),
    stageId: normalizeStage(match.stage),
    homeTeam: getTeamName(match.homeTeam),
    awayTeam: getTeamName(match.awayTeam),
    date: match.utcDate,
    stadium: match.venue || 'Por definir',
    isLocked: new Date(match.utcDate).getTime() <= Date.now(),
    result: isFinished
      ? {
          homeScore: Number(match.score?.fullTime?.home ?? 0),
          awayScore: Number(match.score?.fullTime?.away ?? 0),
        }
      : null,
    source: 'football-data',
    status: match.status,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };
}

async function fetchWorldCupMatches() {
  const response = await fetch(
    'https://api.football-data.org/v4/competitions/WC/matches?season=2026',
    {
      headers: {
        'X-Auth-Token': process.env.FOOTBALL_DATA_TOKEN,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`FOOTBALL_DATA_ERROR_${response.status}`);
  }

  const data = await response.json();

  return Array.isArray(data.matches) ? data.matches : [];
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({
      error: 'METHOD_NOT_ALLOWED',
    });
  }

  try {
    const { leagueId } = request.body || {};

    if (!leagueId) {
      return response.status(400).json({
        error: 'MISSING_LEAGUE_ID',
      });
    }

    if (!process.env.FOOTBALL_DATA_TOKEN) {
      return response.status(500).json({
        error: 'MISSING_FOOTBALL_DATA_TOKEN',
      });
    }

    if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      return response.status(500).json({
        error: 'MISSING_FIREBASE_SERVICE_ACCOUNT_KEY',
      });
    }

    initializeFirebaseAdmin();

    const db = admin.firestore();
    const apiMatches = await fetchWorldCupMatches();
    const normalizedMatches = apiMatches.map(normalizeMatch);

    if (normalizedMatches.length === 0) {
      return response.status(200).json({
        ok: true,
        total: 0,
        message: 'NO_MATCHES_FOUND',
      });
    }

    const batch = db.batch();

    normalizedMatches.forEach((match) => {
      const matchRef = db
        .collection('leagues')
        .doc(leagueId)
        .collection('matches')
        .doc(match.id);

      batch.set(
        matchRef,
        {
          ...match,
          userPrediction: admin.firestore.FieldValue.delete(),
        },
        {
          merge: true,
        }
      );
    });

    await batch.commit();

    return response.status(200).json({
      ok: true,
      total: normalizedMatches.length,
    });
  } catch (error) {
    console.error('Error sincronizando football-data:', error);

    return response.status(500).json({
      error: 'SYNC_FOOTBALL_DATA_FAILED',
      message: error.message,
    });
  }
}