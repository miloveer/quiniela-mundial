import process from 'node:process';
import admin from 'firebase-admin';

function getServiceAccount() {
  const rawServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!rawServiceAccount) {
    throw new Error('MISSING_FIREBASE_SERVICE_ACCOUNT_KEY');
  }

  const serviceAccount = JSON.parse(rawServiceAccount);

  return {
    ...serviceAccount,
    private_key: serviceAccount.private_key?.replace(/\\n/g, '\n'),
  };
}

function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const serviceAccount = getServiceAccount();

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
  if (!process.env.FOOTBALL_DATA_TOKEN) {
    throw new Error('MISSING_FOOTBALL_DATA_TOKEN');
  }

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

function getBearerToken(request) {
  const authorizationHeader =
    request.headers.authorization || request.headers.Authorization || '';

  if (!authorizationHeader.startsWith('Bearer ')) {
    return null;
  }

  return authorizationHeader.replace('Bearer ', '').trim();
}

async function validateLeagueOwner({ request, db, leagueId }) {
  const token = getBearerToken(request);

  if (!token) {
    const error = new Error('MISSING_AUTH_TOKEN');
    error.statusCode = 401;
    throw error;
  }

  const decodedToken = await admin.auth().verifyIdToken(token);

  const leagueRef = db.collection('leagues').doc(leagueId);
  const leagueSnapshot = await leagueRef.get();

  if (!leagueSnapshot.exists) {
    const error = new Error('LEAGUE_NOT_FOUND');
    error.statusCode = 404;
    throw error;
  }

  const league = leagueSnapshot.data();

  if (league.ownerId !== decodedToken.uid) {
    const error = new Error('NOT_LEAGUE_OWNER');
    error.statusCode = 403;
    throw error;
  }

  return {
    uid: decodedToken.uid,
    league,
  };
}

export default async function handler(request, response) {
  try {
    if (request.method !== 'POST') {
      return response.status(405).json({
        ok: false,
        error: 'METHOD_NOT_ALLOWED',
      });
    }

    const { leagueId } = request.body || {};

    if (!leagueId) {
      return response.status(400).json({
        ok: false,
        error: 'MISSING_LEAGUE_ID',
      });
    }

    initializeFirebaseAdmin();

    const db = admin.firestore();

    await validateLeagueOwner({
      request,
      db,
      leagueId,
    });

    const apiMatches = await fetchWorldCupMatches();
    const normalizedMatches = apiMatches.map(normalizeMatch);

    if (normalizedMatches.length === 0) {
      return response.status(200).json({
        ok: true,
        total: 0,
        finishedMatches: 0,
        pendingMatches: 0,
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

      const matchDataToSave = {
        ...match,
        userPrediction: admin.firestore.FieldValue.delete(),
      };

      if (match.result === null) {
        delete matchDataToSave.result;
      }

      batch.set(matchRef, matchDataToSave, {
        merge: true,
      });
    });

    await batch.commit();

    const finishedMatches = normalizedMatches.filter((match) => {
      return match.result !== null;
    }).length;

    return response.status(200).json({
      ok: true,
      total: normalizedMatches.length,
      finishedMatches,
      pendingMatches: normalizedMatches.length - finishedMatches,
    });
  } catch (error) {
    console.error('SYNC_FOOTBALL_DATA_FAILED:', error);

    return response.status(error.statusCode || 500).json({
      ok: false,
      error: 'SYNC_FOOTBALL_DATA_FAILED',
      message: error.message,
    });
  }
}