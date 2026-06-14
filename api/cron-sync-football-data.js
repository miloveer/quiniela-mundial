import process from 'node:process';
import admin from 'firebase-admin';

function getServiceAccount() {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY no está configurada');
  }

  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

  if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
  }

  return serviceAccount;
}

function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return;
  }

  admin.initializeApp({
    credential: admin.credential.cert(getServiceAccount()),
  });
}

function normalizeStage(stage = '') {
  const cleanStage = stage
    .toString()
    .trim()
    .toLowerCase()
    .replace(/_/g, ' ');

  if (cleanStage.includes('group')) return 'group-stage';

  if (
    cleanStage.includes('last 32') ||
    cleanStage.includes('round of 32') ||
    cleanStage.includes('round 32')
  ) {
    return 'round-32';
  }

  if (
    cleanStage.includes('last 16') ||
    cleanStage.includes('round of 16') ||
    cleanStage.includes('round 16')
  ) {
    return 'round-16';
  }

  if (cleanStage.includes('quarter')) return 'quarter-finals';

  if (cleanStage.includes('semi')) return 'semi-finals';

  if (cleanStage.includes('third')) return 'third-place';

  if (cleanStage === 'final' || cleanStage.includes('final')) return 'finals';

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
    stage: match.stage || 'UNKNOWN_STAGE',
    stageId: normalizeStage(match.stage),
    group: match.group || match.stage || 'Grupo sin asignar',
    groupName: match.group || match.stage || 'Grupo sin asignar',
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
    throw new Error('FOOTBALL_DATA_TOKEN no está configurado');
  }

  const response = await fetch(
    'https://api.football-data.org/v4/competitions/WC/matches?season=2026',
    {
      headers: {
        'X-Auth-Token': process.env.FOOTBALL_DATA_TOKEN,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message || data?.error || 'No se pudo consultar football-data.org'
    );
  }

  return data.matches || [];
}

async function getLeaguesToSync(db) {
  const snapshot = await db.collection('leagues').get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

async function syncLeagueMatches({ db, leagueId, normalizedMatches }) {
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

    // Importante:
    // Si la API todavía no tiene resultado, NO borramos un resultado manual existente.
    if (match.result === null) {
      delete matchDataToSave.result;
    }

    batch.set(matchRef, matchDataToSave, { merge: true });
  });

  await batch.commit();
}

export default async function handler(request, response) {
  try {
    if (request.method !== 'GET') {
      return response.status(405).json({
        ok: false,
        message: 'Método no permitido',
      });
    }

    const authHeader = request.headers.authorization;

    if (
      !process.env.CRON_SECRET ||
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return response.status(401).json({
        ok: false,
        message: 'No autorizado',
      });
    }

    initializeFirebaseAdmin();

    const db = admin.firestore();
    const apiMatches = await fetchWorldCupMatches();

    const normalizedMatches = apiMatches.map(normalizeMatch);
    const leagues = await getLeaguesToSync(db);

    for (const league of leagues) {
      await syncLeagueMatches({
        db,
        leagueId: league.id,
        normalizedMatches,
      });
    }

    return response.status(200).json({
      ok: true,
      message: 'Partidos actualizados automáticamente',
      leaguesUpdated: leagues.length,
      matchesUpdatedPerLeague: normalizedMatches.length,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('CRON_SYNC_ERROR:', error);

    return response.status(500).json({
      ok: false,
      message: error.message || 'Error al actualizar partidos automáticamente',
    });
  }
}