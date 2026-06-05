import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

export async function createOrUpdateUserProfile(userData) {
  const userRef = doc(db, 'users', userData.uid);

  const profileData = {
    uid: userData.uid,
    displayName: userData.displayName || 'Usuario',
    email: userData.email || '',
    leagueCode: userData.leagueCode || null,
    activeLeagueId: userData.activeLeagueId || null,
    leagueName: userData.leagueName || null,
    updatedAt: serverTimestamp(),
  };

  await setDoc(
    userRef,
    {
      ...profileData,
      createdAt: serverTimestamp(),
    },
    {
      merge: true,
    }
  );

  return profileData;
}

export async function getUserProfile(uid) {
  const userRef = doc(db, 'users', uid);
  const userSnapshot = await getDoc(userRef);

  if (!userSnapshot.exists()) {
    return null;
  }

  return {
    id: userSnapshot.id,
    ...userSnapshot.data(),
  };
}

export async function getUsersProfiles() {
  const usersRef = collection(db, 'users');
  const usersSnapshot = await getDocs(usersRef);

  return usersSnapshot.docs.map((userDoc) => ({
    id: userDoc.id,
    ...userDoc.data(),
  }));
}

export async function getUsersProfilesByIds(userIds) {
  const uniqueUserIds = [...new Set(userIds.filter(Boolean))];

  const profiles = await Promise.all(
    uniqueUserIds.map(async (userId) => {
      const profile = await getUserProfile(userId);

      return profile;
    })
  );

  return profiles.filter(Boolean);
}

export async function updateUserLeagueData({
  uid,
  leagueCode,
  activeLeagueId,
  leagueName,
}) {
  const normalizedLeagueCode = leagueCode?.trim().toUpperCase() || null;
  const userRef = doc(db, 'users', uid);

  await setDoc(
    userRef,
    {
      leagueCode: normalizedLeagueCode,
      activeLeagueId: activeLeagueId || normalizedLeagueCode,
      leagueName: leagueName || null,
      updatedAt: serverTimestamp(),
    },
    {
      merge: true,
    }
  );

  return {
    leagueCode: normalizedLeagueCode,
    activeLeagueId: activeLeagueId || normalizedLeagueCode,
    leagueName: leagueName || null,
  };
}