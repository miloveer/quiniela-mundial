import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

export async function getLeagueMatches(leagueId) {
  const matchesRef = collection(db, 'leagues', leagueId, 'matches');
  const matchesQuery = query(matchesRef, orderBy('date', 'asc'));
  const matchesSnapshot = await getDocs(matchesQuery);

  return matchesSnapshot.docs.map((matchDoc) => ({
    id: matchDoc.id,
    ...matchDoc.data(),
  }));
}

export async function createOrUpdateMatch({ leagueId, match }) {
  const matchRef = doc(db, 'leagues', leagueId, 'matches', match.id);

  const matchData = {
    ...match,
    updatedAt: serverTimestamp(),
  };

  await setDoc(matchRef, matchData, {
    merge: true,
  });

  return {
    id: match.id,
    ...matchData,
  };
}

export async function seedLeagueMatches({ leagueId, matches }) {
  const operations = matches.map((match) =>
    createOrUpdateMatch({
      leagueId,
      match,
    })
  );

  await Promise.all(operations);

  return matches;
}

export async function updateMatchResult({ leagueId, matchId, result }) {
  const matchRef = doc(db, 'leagues', leagueId, 'matches', matchId);

  await setDoc(
    matchRef,
    {
      result,
      updatedAt: serverTimestamp(),
    },
    {
      merge: true,
    }
  );

  return {
    matchId,
    result,
  };
}