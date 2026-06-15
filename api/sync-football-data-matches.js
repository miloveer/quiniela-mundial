import process from "node:process";
import admin from "firebase-admin";

function getServiceAccount() {
  const rawServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!rawServiceAccount) {
    throw new Error("MISSING_FIREBASE_SERVICE_ACCOUNT_KEY");
  }

  const serviceAccount = JSON.parse(rawServiceAccount);

  return {
    ...serviceAccount,
    private_key: serviceAccount.private_key?.replace(/\\n/g, "\n"),
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

function normalizeStage(stage = "") {
  const cleanStage = stage.toString().trim().toLowerCase().replace(/_/g, " ");

  if (cleanStage.includes("group")) {
    return "group-stage";
  }

  if (
    cleanStage.includes("last 32") ||
    cleanStage.includes("round of 32") ||
    cleanStage.includes("round 32")
  ) {
    return "round-32";
  }

  if (
    cleanStage.includes("last 16") ||
    cleanStage.includes("round of 16") ||
    cleanStage.includes("round 16")
  ) {
    return "round-16";
  }

  if (cleanStage.includes("quarter final") || cleanStage.includes("quarter")) {
    return "quarter-finals";
  }

  if (cleanStage.includes("semi final") || cleanStage.includes("semi")) {
    return "semi-finals";
  }

  if (cleanStage.includes("third place") || cleanStage.includes("third")) {
    return "third-place";
  }

  if (cleanStage === "final" || cleanStage.includes("final")) {
    return "finals";
  }

  return "group-stage";
}

function getTeamName(team) {
  return team?.name || team?.shortName || team?.tla || "Por definir";
}

function normalizeMatch(match) {
  const isFinished = match.status === "FINISHED";
  const normalizedStage = normalizeStage(match.stage);

  return {
    id: `football-data-${match.id}`,
    externalId: String(match.id),

    // Guardamos ambos:
    // stage = etapa original de la API
    // stageId = etapa normalizada para tu app
    stage: match.stage || "UNKNOWN_STAGE",
    stageId: normalizedStage,

    group: match.group || match.stage || "Grupo sin asignar",
    groupName: match.group || match.stage || "Grupo sin asignar",

    homeTeam: getTeamName(match.homeTeam),
    awayTeam: getTeamName(match.awayTeam),
    date: match.utcDate,
    stadium: match.venue || "Por definir",
    isLocked: new Date(match.utcDate).getTime() <= Date.now(),

    result: isFinished
      ? {
          homeScore: Number(match.score?.fullTime?.home ?? 0),
          awayScore: Number(match.score?.fullTime?.away ?? 0),
        }
      : null,

    source: "football-data",
    status: match.status,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };
}

async function fetchWorldCupMatches() {
  if (!process.env.FOOTBALL_DATA_TOKEN) {
    throw new Error("MISSING_FOOTBALL_DATA_TOKEN");
  }

  const response = await fetch(
    "https://api.football-data.org/v4/competitions/WC/matches?season=2026",
    {
      headers: {
        "X-Auth-Token": process.env.FOOTBALL_DATA_TOKEN,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message || data?.error || `FOOTBALL_DATA_ERROR_${response.status}`
    );
  }

  return Array.isArray(data.matches) ? data.matches : [];
}

function getBearerToken(request) {
  const authorizationHeader =
    request.headers.authorization || request.headers.Authorization || "";

  if (!authorizationHeader.startsWith("Bearer ")) {
    return null;
  }

  return authorizationHeader.replace("Bearer ", "").trim();
}

async function validateLeagueOwner({ request, db, leagueId }) {
  const token = getBearerToken(request);

  if (!token) {
    const error = new Error("MISSING_AUTH_TOKEN");
    error.statusCode = 401;
    throw error;
  }

  const decodedToken = await admin.auth().verifyIdToken(token);

  const leagueRef = db.collection("leagues").doc(leagueId);
  const leagueSnapshot = await leagueRef.get();

  if (!leagueSnapshot.exists) {
    const error = new Error("LEAGUE_NOT_FOUND");
    error.statusCode = 404;
    throw error;
  }

  const league = leagueSnapshot.data();

  if (league.ownerId !== decodedToken.uid) {
    const error = new Error("NOT_LEAGUE_OWNER");
    error.statusCode = 403;
    throw error;
  }

  return {
    uid: decodedToken.uid,
    league,
  };
}

function hasResultChanged(currentResult, newResult) {
  // Si la API no trae resultado, NO cambiamos nada.
  // Esto protege resultados manuales existentes.
  if (!newResult) {
    return false;
  }

  if (!currentResult) {
    return true;
  }

  return (
    Number(currentResult.homeScore) !== Number(newResult.homeScore) ||
    Number(currentResult.awayScore) !== Number(newResult.awayScore)
  );
}

function hasMatchChanged(currentMatch = {}, newMatch = {}) {
  // Si no existe en Firestore, sí se debe crear.
  if (!currentMatch.id) {
    return true;
  }

  const fieldsToCompare = [
    "externalId",
    "stage",
    "stageId",
    "group",
    "groupName",
    "homeTeam",
    "awayTeam",
    "date",
    "stadium",
    "isLocked",
    "source",
    "status",
  ];

  const basicFieldChanged = fieldsToCompare.some((field) => {
    return currentMatch[field] !== newMatch[field];
  });

  if (basicFieldChanged) {
    return true;
  }

  return hasResultChanged(currentMatch.result, newMatch.result);
}

async function syncLeagueMatches({ db, leagueId, normalizedMatches }) {
  const leagueRef = db.collection("leagues").doc(leagueId);
  const matchesCollectionRef = leagueRef.collection("matches");

  const existingMatchesSnapshot = await matchesCollectionRef.get();

  const existingMatchesMap = existingMatchesSnapshot.docs.reduce(
    (accumulator, doc) => {
      return {
        ...accumulator,
        [doc.id]: doc.data(),
      };
    },
    {}
  );

  const batch = db.batch();

  let changedMatches = 0;
  let createdMatches = 0;
  let updatedMatches = 0;

  normalizedMatches.forEach((match) => {
    const currentMatch = existingMatchesMap[match.id];

    if (!hasMatchChanged(currentMatch, match)) {
      return;
    }

    const matchRef = matchesCollectionRef.doc(match.id);

    const matchDataToSave = {
      ...match,
      userPrediction: admin.firestore.FieldValue.delete(),
    };

    // Si la API aún no tiene resultado, no borramos el resultado existente.
    if (match.result === null) {
      delete matchDataToSave.result;
    }

    batch.set(matchRef, matchDataToSave, {
      merge: true,
    });

    changedMatches += 1;

    if (!currentMatch) {
      createdMatches += 1;
    } else {
      updatedMatches += 1;
    }
  });

  batch.set(
    leagueRef,
    {
      lastFootballDataSyncAt: admin.firestore.FieldValue.serverTimestamp(),
      lastFootballDataSyncChangedMatches: changedMatches,
      lastFootballDataSyncCreatedMatches: createdMatches,
      lastFootballDataSyncUpdatedMatches: updatedMatches,
    },
    {
      merge: true,
    }
  );

  await batch.commit();

  return {
    changedMatches,
    createdMatches,
    updatedMatches,
  };
}

export default async function handler(request, response) {
  try {
    if (request.method !== "POST") {
      return response.status(405).json({
        ok: false,
        error: "METHOD_NOT_ALLOWED",
      });
    }

    const { leagueId } = request.body || {};

    if (!leagueId) {
      return response.status(400).json({
        ok: false,
        error: "MISSING_LEAGUE_ID",
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
        changedMatches: 0,
        createdMatches: 0,
        updatedMatches: 0,
        finishedMatches: 0,
        pendingMatches: 0,
        message: "NO_MATCHES_FOUND",
      });
    }

    const { changedMatches, createdMatches, updatedMatches } =
      await syncLeagueMatches({
        db,
        leagueId,
        normalizedMatches,
      });

    const finishedMatches = normalizedMatches.filter((match) => {
      return match.result !== null;
    }).length;

    return response.status(200).json({
      ok: true,
      total: normalizedMatches.length,
      changedMatches,
      createdMatches,
      updatedMatches,
      finishedMatches,
      pendingMatches: normalizedMatches.length - finishedMatches,
      message:
        changedMatches > 0
          ? `Sincronización completada. Se actualizaron ${changedMatches} partidos.`
          : "Sincronización revisada. No hubo cambios nuevos.",
    });
  } catch (error) {
    console.error("SYNC_FOOTBALL_DATA_FAILED:", error);

    return response.status(error.statusCode || 500).json({
      ok: false,
      error: "SYNC_FOOTBALL_DATA_FAILED",
      message: error.message,
    });
  }
}