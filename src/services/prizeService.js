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

export async function getLeaguePrizes(leagueId) {
  const prizesRef = collection(db, 'leagues', leagueId, 'prizes');
  const prizesQuery = query(prizesRef, orderBy('order', 'asc'));
  const prizesSnapshot = await getDocs(prizesQuery);

  return prizesSnapshot.docs.map((prizeDoc) => ({
    id: prizeDoc.id,
    ...prizeDoc.data(),
  }));
}

export async function createOrUpdatePrize({ leagueId, prize }) {
  const prizeRef = doc(db, 'leagues', leagueId, 'prizes', prize.id);

  const prizeData = {
    ...prize,
    updatedAt: serverTimestamp(),
  };

  await setDoc(prizeRef, prizeData, {
    merge: true,
  });

  return {
    id: prize.id,
    ...prizeData,
  };
}

export async function seedLeaguePrizes({ leagueId, prizes }) {
  const operations = prizes.map((prize, index) =>
    createOrUpdatePrize({
      leagueId,
      prize: {
        ...prize,
        order: index + 1,
      },
    })
  );

  await Promise.all(operations);

  return prizes;
}

export async function saveLeaguePrizes({ leagueId, prizes }) {
  const normalizedPrizes = prizes.map((prize, index) => ({
    id: prize.id || `prize-${index + 1}`,
    position: prize.position || `${index + 1}° lugar`,
    title: prize.title || '',
    reward: prize.reward || '',
    description: prize.description || '',
    order: index + 1,
  }));

  const operations = normalizedPrizes.map((prize) =>
    createOrUpdatePrize({
      leagueId,
      prize,
    })
  );

  await Promise.all(operations);

  return normalizedPrizes;
}