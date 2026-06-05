export function getMatchOutcome(homeScore, awayScore) {
  if (homeScore > awayScore) {
    return 'home';
  }

  if (awayScore > homeScore) {
    return 'away';
  }

  return 'draw';
}

export function getScoreOutcome(score) {
  if (!score) {
    return null;
  }

  return getMatchOutcome(score.homeScore, score.awayScore);
}

// Puente para compatibilidad con código anterior.
// Si en algún lado todavía se llama getMatchWinner(), ya no truena.
export function getMatchWinner(score) {
  return getScoreOutcome(score);
}

export function calculatePredictionPoints(prediction, result) {
  if (!prediction || !result) {
    return 0;
  }

  const predictedOutcome = getScoreOutcome(prediction);
  const realOutcome = getScoreOutcome(result);

  const guessedOutcome = predictedOutcome === realOutcome;

  const guessedExactScore =
    prediction.homeScore === result.homeScore &&
    prediction.awayScore === result.awayScore;

  if (guessedExactScore) {
    return 3;
  }

  if (guessedOutcome) {
    return 1;
  }

  return 0;
}

export function calculateTotalPoints(matches = []) {
  return matches.reduce((total, match) => {
    return total + calculatePredictionPoints(match.userPrediction, match.result);
  }, 0);
}

export function calculateExactScores(matches = []) {
  return matches.filter((match) => {
    if (!match.userPrediction || !match.result) {
      return false;
    }

    return (
      match.userPrediction.homeScore === match.result.homeScore &&
      match.userPrediction.awayScore === match.result.awayScore
    );
  }).length;
}

export function calculateResultHits(matches = []) {
  return matches.filter((match) => {
    if (!match.userPrediction || !match.result) {
      return false;
    }

    return getScoreOutcome(match.userPrediction) === getScoreOutcome(match.result);
  }).length;
}

export function calculateUserStats(user, matches = []) {
  const stats = matches.reduce(
    (accumulator, match) => {
      const prediction = user.predictions?.[match.id] ?? null;
      const points = calculatePredictionPoints(prediction, match.result);

      if (prediction) {
        accumulator.predictionsCount += 1;
        accumulator.completedPredictions += 1;
      }

      if (prediction && match.result) {
        const isExactScore =
          prediction.homeScore === match.result.homeScore &&
          prediction.awayScore === match.result.awayScore;

        const isResultHit =
          getScoreOutcome(prediction) === getScoreOutcome(match.result);

        if (isExactScore) {
          accumulator.exactScores += 1;
        }

        if (isResultHit) {
          accumulator.resultHits += 1;
        }
      }

      accumulator.points += points;

      return accumulator;
    },
    {
      points: 0,
      exactScores: 0,
      resultHits: 0,
      predictionsCount: 0,
      completedPredictions: 0,
    }
  );

  return {
    ...user,
    points: stats.points,
    exactScores: stats.exactScores,
    resultHits: stats.resultHits,
    predictionsCount: stats.predictionsCount,
    completedPredictions: stats.completedPredictions,
  };
}

export function buildRanking(users = [], matches = []) {
  return users
    .map((user) => calculateUserStats(user, matches))
    .sort((firstUser, secondUser) => {
      if (secondUser.points !== firstUser.points) {
        return secondUser.points - firstUser.points;
      }

      if (secondUser.exactScores !== firstUser.exactScores) {
        return secondUser.exactScores - firstUser.exactScores;
      }

      if (secondUser.resultHits !== firstUser.resultHits) {
        return secondUser.resultHits - firstUser.resultHits;
      }

      return (firstUser.name || '').localeCompare(secondUser.name || '');
    })
    .map((user, index) => ({
      ...user,
      position: index + 1,
    }));
}

export function getUserRankingPosition(ranking = [], userName) {
  const user = ranking.find((rankingUser) => {
    return rankingUser.name?.toLowerCase() === userName?.toLowerCase();
  });

  return user?.position ?? '-';
}

export function buildStageRanking(users = [], matches = [], stageId) {
  const stageMatches = matches.filter((match) => match.stageId === stageId);

  return buildRanking(users, stageMatches);
}

export function buildRankingFromPredictions({
  predictions = [],
  matches = [],
  currentUser,
  userProfiles = [],
}) {
  const usersMap = predictions.reduce((accumulator, predictionDoc) => {
    const userId = predictionDoc.userId;

    if (!userId) {
      return accumulator;
    }

    const userProfile = userProfiles.find((profile) => {
      return profile.uid === userId || profile.id === userId;
    });

    const displayName =
      userId === currentUser?.uid
        ? currentUser?.displayName || userProfile?.displayName || 'Tú'
        : userProfile?.displayName || `Usuario ${userId.slice(0, 6)}`;

    if (!accumulator[userId]) {
      accumulator[userId] = {
        id: userId,
        uid: userId,
        name: displayName,
        badge: userId === currentUser?.uid ? 'Tú' : 'Participante',
        points: 0,
        exactScores: 0,
        resultHits: 0,
        predictionsCount: 0,
        completedPredictions: 0,
      };
    }

    const match = matches.find((currentMatch) => {
      return currentMatch.id === predictionDoc.matchId;
    });

    const prediction = predictionDoc.prediction;
    const points = calculatePredictionPoints(prediction, match?.result);

    accumulator[userId].points += points;

    if (prediction) {
      accumulator[userId].predictionsCount += 1;
      accumulator[userId].completedPredictions += 1;
    }

    if (match?.result && prediction) {
      const exactScore =
        prediction.homeScore === match.result.homeScore &&
        prediction.awayScore === match.result.awayScore;

      const predictionWinner = getMatchWinner(prediction);
      const resultWinner = getMatchWinner(match.result);

      if (exactScore) {
        accumulator[userId].exactScores += 1;
      }

      if (predictionWinner === resultWinner) {
        accumulator[userId].resultHits += 1;
      }
    }

    return accumulator;
  }, {});

  return Object.values(usersMap)
    .sort((userA, userB) => {
      if (userB.points !== userA.points) {
        return userB.points - userA.points;
      }

      if (userB.exactScores !== userA.exactScores) {
        return userB.exactScores - userA.exactScores;
      }

      if (userB.resultHits !== userA.resultHits) {
        return userB.resultHits - userA.resultHits;
      }

      return (userA.name || '').localeCompare(userB.name || '');
    })
    .map((user, index) => ({
      ...user,
      position: index + 1,
    }));
}

export function buildUsersFromPredictions({
  predictions = [],
  currentUser,
  userProfiles = [],
}) {
  const usersMap = predictions.reduce((accumulator, predictionDoc) => {
    const userId = predictionDoc.userId;

    if (!userId) {
      return accumulator;
    }

    const userProfile = userProfiles.find((profile) => {
      return profile.uid === userId || profile.id === userId;
    });

    const displayName =
      userId === currentUser?.uid
        ? currentUser?.displayName || userProfile?.displayName || 'Tú'
        : userProfile?.displayName || `Usuario ${userId.slice(0, 6)}`;

    if (!accumulator[userId]) {
      accumulator[userId] = {
        id: userId,
        uid: userId,
        name: displayName,
        badge: userId === currentUser?.uid ? 'Tú' : 'Participante',
        predictions: {},
      };
    }

    accumulator[userId].predictions[predictionDoc.matchId] =
      predictionDoc.prediction;

    return accumulator;
  }, {});

  return Object.values(usersMap);
}