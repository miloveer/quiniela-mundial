export function formatMatchDate(dateValue) {
  const date = new Date(dateValue);

  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function getPendingMatches(matches = []) {
  return matches.filter((match) => !match.userPrediction).length;
}

export function getPendingMatchesList(matches = []) {
  return matches.filter((match) => !match.userPrediction);
}

export function getCompletedPredictions(matches = []) {
  return matches.filter((match) => Boolean(match.userPrediction)).length;
}

export function getStageMatches(matches = [], stageId) {
  return matches.filter((match) => match.stageId === stageId);
}

export function getMinutesBeforeMatch(matchDate) {
  const now = new Date();
  const date = new Date(matchDate);

  const differenceInMilliseconds = date.getTime() - now.getTime();

  return Math.floor(differenceInMilliseconds / 1000 / 60);
}

export function isPredictionLocked(matchDate) {
  const now = new Date();
  const date = new Date(matchDate);

  return now.getTime() >= date.getTime();
}

export function getLockMessage(matchDate) {
  const isLocked = isPredictionLocked(matchDate);

  if (isLocked) {
    return 'El partido ya inició';
  }

  return 'Editable';
}

export function getMatchStatus(match) {
  const hasPrediction = Boolean(match.userPrediction);
  const hasResult = Boolean(match.result);
  const isLocked = match.isLocked || isPredictionLocked(match.date);

  if (hasResult) {
    return 'finished';
  }

  if (isLocked) {
    return 'locked';
  }

  if (hasPrediction) {
    return 'predicted';
  }

  return 'pending';
}

export function filterMatchesByStatus(matches = [], status = 'all') {
  if (status === 'all') {
    return matches;
  }

  return matches.filter((match) => getMatchStatus(match) === status);
}

export function getMatchFilterCounts(matches = []) {
  return matches.reduce(
    (accumulator, match) => {
      const status = getMatchStatus(match);

      return {
        ...accumulator,
        all: accumulator.all + 1,
        [status]: accumulator[status] + 1,
      };
    },
    {
      all: 0,
      pending: 0,
      predicted: 0,
      locked: 0,
      finished: 0,
    }
  );
}

export function getMatchStatusPriority(match) {
  const status = getMatchStatus(match);

  const priorities = {
    pending: 1,
    predicted: 2,
    locked: 3,
    finished: 4,
  };

  return priorities[status] || 99;
}

export function sortMatchesByStatusAndDate(matches = []) {
  return [...matches].sort((matchA, matchB) => {
    const priorityA = getMatchStatusPriority(matchA);
    const priorityB = getMatchStatusPriority(matchB);

    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    return new Date(matchA.date).getTime() - new Date(matchB.date).getTime();
  });
}