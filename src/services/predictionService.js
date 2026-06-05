import {
  collection,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

export function getPredictionDocumentId({ userId, matchId }) {
  return `${userId}_${matchId}`;
}

export async function savePrediction({
  leagueId,
  userId,
  matchId,
  prediction,
}) {
  const predictionId = getPredictionDocumentId({
    userId,
    matchId,
  });

  const predictionRef = doc(
    db,
    'leagues',
    leagueId,
    'predictions',
    predictionId
  );

  const predictionData = {
    userId,
    matchId,
    prediction,
    updatedAt: serverTimestamp(),
  };

  await setDoc(predictionRef, predictionData, {
    merge: true,
  });

  return {
    id: predictionId,
    ...predictionData,
  };
}

export async function getLeaguePredictions(leagueId) {
  const predictionsRef = collection(db, 'leagues', leagueId, 'predictions');
  const predictionsSnapshot = await getDocs(predictionsRef);

  return predictionsSnapshot.docs.map((predictionDoc) => ({
    id: predictionDoc.id,
    ...predictionDoc.data(),
  }));
}

export async function getUserPredictions({ leagueId, userId }) {
  const allPredictions = await getLeaguePredictions(leagueId);

  return allPredictions.filter(
    (prediction) => prediction.userId === userId
  );
}