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

function getBearerToken(request) {
  const authHeader = request.headers.authorization || '';

  if (!authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.replace('Bearer ', '').trim();
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
    const error = new Error(
      data?.message || data?.error || 'No se pudo consultar football-data.org'
    );

    error.statusCode = response.status;
    throw error;
  }

  return data.matches || [];
}

async function validateLeagueMember({ request, db, leagueId }) {
  const token = getBearerToken(request);

  if (!token) {
    const error = new Error('No hay sesión activa');
    error.statusCode = 401;
    throw error;
  }

  const decodedToken = await admin.auth().verifyIdToken(token);

  const leagueRef = db.collection('leagues').doc(leagueId);
  const leagueDoc = await leagueRef.get();

  if (!leagueDoc.exists) {
    const error = new Error('La liga no existe');
    error.statusCode = 404;
    throw error;
  }

  const memberRef = leagueRef.collection('members').doc(decodedToken.uid);
  const memberDoc = await memberRef.get();

  const leagueData = leagueDoc.data();

  const isOwner = leagueData?.ownerId === decodedToken.uid;
  const isMember = memberDoc.exists;

  if (!isOwner && !isMember) {
    const error = new Error('No perteneces a esta liga');
    error.statusCode = 403;
    throw error;
  }

  return {
    leagueRef,
    userId: decodedToken.uid,
  };
}

async function checkSyncCooldown({ leagueRef }) {
  const leagueDoc = await leagueRef.get();
  const leagueData = leagueDoc.data();

  const lastSyncAt = leagueData?.lastFootballDataSyncAt?.toDate?.();

  if (!lastSyncAt) {
    return;
  }

  const now = Date.now();
  const lastSyncTime = lastSyncAt.getTime();

  const minutesSinceLastSync = (now - lastSyncTime) / 1000 / 60;

  if (minutesSinceLastSync < 5) {
    const error = new Error(
      `La liga ya fue actualizada hace poco. Intenta de nuevo en ${Math.ceil(
        5 - minutesSinceLastSync
      )} min.`
    );

    error.statusCode = 429;
    throw error;
  }
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

    if (match.result === null) {
      delete matchDataToSave.result;
    }

    batch.set(matchRef, matchDataToSave, { merge: true });
  });

  const leagueRef = db.collection('leagues').doc(leagueId);

  batch.set(
    leagueRef,
    {
      lastFootballDataSyncAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  await batch.commit();
}

export default async function handler(request, response) {
  try {
    if (request.method !== 'POST') {
      return response.status(405).json({
        ok: false,
        message: 'Método no permitido',
      });
    }

    const { leagueId } = request.body || {};

    if (!leagueId) {
      return response.status(400).json({
        ok: false,
        message: 'Falta leagueId',
      });
    }

    initializeFirebaseAdmin();

    const db = admin.firestore();

    const { leagueRef } = await validateLeagueMember({
      request,
      db,
      leagueId,
    });

    await checkSyncCooldown({ leagueRef });

    const apiMatches = await fetchWorldCupMatches();
    const normalizedMatches = apiMatches.map(normalizeMatch);

    await syncLeagueMatches({
      db,
      leagueId,
      normalizedMatches,
    });

    return response.status(200).json({
      ok: true,
      message: 'Resultados actualizados correctamente',
      matchesUpdated: normalizedMatches.length,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('MEMBER_SYNC_ERROR:', error);

    return response.status(error.statusCode || 500).json({
      ok: false,
      message: error.message || 'Error al actualizar resultados',
    });
  }
}