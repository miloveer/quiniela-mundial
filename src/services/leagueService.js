import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

export function normalizeLeagueCode(leagueCode = '') {
  return leagueCode.trim().toUpperCase().replace(/\s+/g, '');
}

export async function getLeagueByCode(leagueCode) {
  const normalizedCode = validateLeagueCode(leagueCode);
  const leagueRef = doc(db, 'leagues', normalizedCode);
  const leagueSnapshot = await getDoc(leagueRef);

  if (!leagueSnapshot.exists()) {
    return null;
  }

  return {
    id: leagueSnapshot.id,
    ...leagueSnapshot.data(),
  };
}

function validateLeagueCode(leagueCode) {
  const normalizedCode = normalizeLeagueCode(leagueCode);

  if (!normalizedCode) {
    throw new Error('INVALID_LEAGUE_CODE');
  }

  if (normalizedCode.length < 4) {
    throw new Error('LEAGUE_CODE_TOO_SHORT');
  }

  if (normalizedCode.length > 16) {
    throw new Error('LEAGUE_CODE_TOO_LONG');
  }

  if (!/^[A-Z0-9_-]+$/.test(normalizedCode)) {
    throw new Error('INVALID_LEAGUE_CODE_FORMAT');
  }

  return normalizedCode;
}

function validatePrizeMode(prizeMode) {
  const validPrizeModes = ['fixed', 'winner_takes_all'];

  if (!validPrizeModes.includes(prizeMode)) {
    return 'fixed';
  }

  return prizeMode;
}

function validateEntryFee(entryFee) {
  const numericEntryFee = Number(entryFee);

  if (Number.isNaN(numericEntryFee) || numericEntryFee < 0) {
    return 0;
  }

  return numericEntryFee;
}

export async function getUserLeagues(userId) {
  const leaguesRef = collection(db, 'leagues');
  const leaguesQuery = query(
    leaguesRef,
    where('members', 'array-contains', userId)
  );

  const leaguesSnapshot = await getDocs(leaguesQuery);

  return leaguesSnapshot.docs.map((leagueDoc) => ({
    id: leagueDoc.id,
    ...leagueDoc.data(),
  }));
}

export async function createLeague({
  code,
  name,
  ownerId,
  ownerDisplayName = 'Administrador',
  ownerEmail = '',
  entryFee = 200,
  prizeMode = 'fixed',
}) {
  const normalizedCode = validateLeagueCode(code);
  const leagueRef = doc(collection(db, 'leagues'), normalizedCode);
  const leagueSnapshot = await getDoc(leagueRef);

  if (leagueSnapshot.exists()) {
    throw new Error('LEAGUE_ALREADY_EXISTS');
  }

const cleanName = name?.trim();

if (!cleanName) {
  throw new Error('INVALID_LEAGUE_NAME');
}

const numericEntryFee = validateEntryFee(entryFee);
const cleanPrizeMode = validatePrizeMode(prizeMode);

  const leagueData = {
    code: normalizedCode,
    name: cleanName,
    ownerId,
    members: [ownerId],
    entryFee: numericEntryFee,
    prizeMode: cleanPrizeMode,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(leagueRef, leagueData);

  await setDoc(doc(db, 'leagues', normalizedCode, 'members', ownerId), {
    userId: ownerId,
    displayName: ownerDisplayName || 'Administrador',
    email: ownerEmail || '',
    entryFee: numericEntryFee,
    role: 'owner',
    joinedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return {
    id: normalizedCode,
    ...leagueData,
  };
}

export async function joinLeague({
  leagueCode,
  userId,
  displayName = 'Usuario',
  email = '',
}) {
  const normalizedCode = validateLeagueCode(leagueCode);
  const leagueRef = doc(db, 'leagues', normalizedCode);
  const leagueSnapshot = await getDoc(leagueRef);

  if (!leagueSnapshot.exists()) {
    throw new Error('LEAGUE_NOT_FOUND');
  }

  const leagueData = leagueSnapshot.data();

  await updateDoc(leagueRef, {
    members: arrayUnion(userId),
    updatedAt: serverTimestamp(),
  });

  await setDoc(
    doc(db, 'leagues', normalizedCode, 'members', userId),
    {
      userId,
      displayName: displayName || 'Usuario',
      email: email || '',
      entryFee: Number(leagueData.entryFee) || 0,
      role: 'participant',
      joinedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    {
      merge: true,
    }
  );

  return {
    id: leagueSnapshot.id,
    ...leagueData,
    code: normalizedCode,
  };
}

export async function getLeagueMembers(leagueId) {
  const membersRef = collection(db, 'leagues', leagueId, 'members');
  const membersSnapshot = await getDocs(membersRef);

  return membersSnapshot.docs.map((memberDoc) => ({
    id: memberDoc.id,
    ...memberDoc.data(),
  }
));
}

export async function updateLeaguePrizeSettings({
  leagueId,
  entryFee,
  prizeMode,
}) {
  const leagueRef = doc(db, 'leagues', leagueId);

  const leagueData = {
  entryFee: validateEntryFee(entryFee),
  prizeMode: validatePrizeMode(prizeMode),
  updatedAt: serverTimestamp(),
};

  await setDoc(leagueRef, leagueData, {
    merge: true,
  });

  return leagueData;
}