export function formatMatchDate(dateValue) {
  const date = new Date(dateValue);

  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function normalizeSearchText(value = '') {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
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

export function filterMatchesBySearch(matches = [], searchTerm = '') {
  const normalizedSearchTerm = normalizeSearchText(searchTerm);

  if (!normalizedSearchTerm) {
    return matches;
  }

  return matches.filter((match) => {
    const searchableText = normalizeSearchText(
      [
        match.homeTeam,
        match.awayTeam,
        match.stadium,
        match.group,
        match.groupName,
        match.stage,
        match.stageId,
      ]
        .filter(Boolean)
        .join(' ')
    );

    return searchableText.includes(normalizedSearchTerm);
  });
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

export function getMatchGroupLabel(match = {}) {
  const rawGroup =
    match.groupName ||
    match.group ||
    match.groupLabel ||
    match.round ||
    match.stageName ||
    '';

  if (!rawGroup) {
    return 'Grupo sin asignar';
  }

  const cleanGroup = rawGroup.toString().replace(/_/g, ' ').trim();

  const groupLetterMatch = cleanGroup.match(/group\s+([a-z])/i);

  if (groupLetterMatch?.[1]) {
    return `Grupo ${groupLetterMatch[1].toUpperCase()}`;
  }

  if (/^GROUP_[A-Z]$/i.test(rawGroup)) {
    return `Grupo ${rawGroup.split('_')[1].toUpperCase()}`;
  }

  return cleanGroup;
}

export function groupMatchesByGroup(matches = []) {
  return matches.reduce((accumulator, match) => {
    const groupLabel = getMatchGroupLabel(match);

    if (!accumulator[groupLabel]) {
      accumulator[groupLabel] = [];
    }

    accumulator[groupLabel].push(match);

    return accumulator;
  }, {});
}

function createEmptyTeamStanding(teamName) {
  return {
    teamName,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
  };
}

export function buildGroupStandings(matches = []) {
  const groupedMatches = groupMatchesByGroup(matches);

  return Object.entries(groupedMatches).reduce(
    (accumulator, [groupLabel, groupMatches]) => {
      const standingsMap = {};

      groupMatches.forEach((match) => {
        if (!standingsMap[match.homeTeam]) {
          standingsMap[match.homeTeam] = createEmptyTeamStanding(match.homeTeam);
        }

        if (!standingsMap[match.awayTeam]) {
          standingsMap[match.awayTeam] = createEmptyTeamStanding(match.awayTeam);
        }

        if (!match.result) {
          return;
        }

        const homeScore = Number(match.result.homeScore ?? 0);
        const awayScore = Number(match.result.awayScore ?? 0);

        const homeStanding = standingsMap[match.homeTeam];
        const awayStanding = standingsMap[match.awayTeam];

        homeStanding.played += 1;
        awayStanding.played += 1;

        homeStanding.goalsFor += homeScore;
        homeStanding.goalsAgainst += awayScore;

        awayStanding.goalsFor += awayScore;
        awayStanding.goalsAgainst += homeScore;

        if (homeScore > awayScore) {
          homeStanding.won += 1;
          homeStanding.points += 3;
          awayStanding.lost += 1;
        } else if (awayScore > homeScore) {
          awayStanding.won += 1;
          awayStanding.points += 3;
          homeStanding.lost += 1;
        } else {
          homeStanding.drawn += 1;
          awayStanding.drawn += 1;
          homeStanding.points += 1;
          awayStanding.points += 1;
        }

        homeStanding.goalDifference =
          homeStanding.goalsFor - homeStanding.goalsAgainst;
        awayStanding.goalDifference =
          awayStanding.goalsFor - awayStanding.goalsAgainst;
      });

      accumulator[groupLabel] = Object.values(standingsMap).sort((teamA, teamB) => {
        if (teamB.points !== teamA.points) {
          return teamB.points - teamA.points;
        }

        if (teamB.goalDifference !== teamA.goalDifference) {
          return teamB.goalDifference - teamA.goalDifference;
        }

        if (teamB.goalsFor !== teamA.goalsFor) {
          return teamB.goalsFor - teamA.goalsFor;
        }

        return teamA.teamName.localeCompare(teamB.teamName);
      });

      return accumulator;
    },
    {}
  );
}