import { useEffect, useMemo, useState } from "react";
import { KeyRound, Plus, Search, UsersRound } from "lucide-react";

import Header from "../components/Header";
import AppNavigation from "../components/AppNavigation";
import DashboardSummary from "../components/DashboardSummary";
import StageTabs from "../components/StageTabs";
import CompactMatchCard from "../components/CompactMatchCard";
import MatchFilters from "../components/MatchFilters";
import RankingCard from "../components/RankingCard";
import JoinLeagueModal from "../components/JoinLeagueModal";
import PendingMatchesCard from "../components/PendingMatchesCard";
import PredictionHistoryCard from "../components/PredictionHistoryCard";
import AdminPanelCard from "../components/AdminPanelCard";
import ResultModal from "../components/ResultModal";
import CreateLeagueModal from "../components/CreateLeagueModal";
import UserLeaguesCard from "../components/UserLeaguesCard";
import StageProgressCard from "../components/StageProgressCard";
import StageRankingPreviewCard from "../components/StageRankingPreviewCard";
import GroupStandingsCard from "../components/GroupStandingsCard";
import MatchPredictionsModal from "../components/MatchPredictionsModal";
import AdminManualPredictionModal from '../components/AdminManualPredictionModal';

import { ensureSupabaseProfile } from "../services/supabaseProfileService";
import { syncFootballDataMatches } from "../services/footballDataSyncService";

import {
  createSupabaseLeague as createLeague,
  getSupabaseLeagueByCode as getLeagueByCode,
  getSupabaseLeagueMembers as getLeagueMembers,
  getSupabaseUserLeagues as getUserLeagues,
  joinSupabaseLeague as joinLeague,
} from "../services/supabaseLeagueService";

import {
  getSupabaseLeaguePredictions as getLeaguePredictions,
  getSupabaseUserPredictions as getUserPredictions,
  saveSupabasePrediction as savePrediction,
} from "../services/supabasePredictionService";

import {
  getSupabaseLeagueMatches as getLeagueMatches,
  saveSupabaseLeagueMatches,
  updateSupabaseMatchResult as updateMatchResult,
} from "../services/supabaseMatchService";

import {
  saveSupabasePendingPrediction,
  getSupabasePendingPredictions,
  deleteSupabasePendingPrediction,
  claimSupabasePendingPredictionsForUser,
} from "../services/supabasePendingPredictionService";

import {
  matches as initialMatches,
  stages,
} from "../data/mockData";

import {
  buildRanking,
  buildRankingFromPredictions,
  buildStageRanking,
  calculateExactScores,
  calculateResultHits,
  calculateTotalPoints,
  getUserRankingPosition,
} from "../utils/scoreUtils";

import {
  getLeagueMatchesStorageKey,
  getStorageItem,
  setStorageItem,
} from "../utils/storageUtils";

import {
  buildGroupStandings,
  filterMatchesBySearch,
  filterMatchesByStatus,
  groupMatchesByGroup,
  getCompletedPredictions,
  getMatchFilterCounts,
  getPendingMatches,
  getPendingMatchesList,
  getStageMatches,
  sortMatchesByStatusAndDate,
} from "../utils/matchUtils";

const CURRENT_TOURNAMENT_STAGE = "round-32";

function cleanBaseMatches(matches = []) {
  return matches.map((match) => ({
    ...match,
    userPrediction: null,
    result: null,
  }));
}

function EmptyLeagueState({ onJoinLeague, onCreateLeague }) {
  return (
    <section className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white/80 p-5 text-center shadow-sm">
      <p className="text-sm font-bold text-emerald-700">Empieza tu quiniela</p>

      <h2 className="mt-1 text-2xl font-black text-slate-950">
        Aún no estás en una liga
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        Únete con un código de invitación o crea una liga para comenzar a cargar
        partidos, pronósticos y ranking.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={onJoinLeague}
          className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white transition hover:bg-slate-800"
        >
          Unirme a liga
        </button>

        <button
          type="button"
          onClick={onCreateLeague}
          className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-black text-white transition hover:bg-emerald-700"
        >
          Crear liga
        </button>
      </div>
    </section>
  );
}

function isStageBeforeCurrent(stageId, currentStageId, allStages) {
  const stageIndex = allStages.findIndex((stage) => stage.id === stageId);
  const currentIndex = allStages.findIndex(
    (stage) => stage.id === currentStageId
  );

  if (stageIndex === -1 || currentIndex === -1) {
    return false;
  }

  return stageIndex < currentIndex;
}

function filterMatchesForParticipant(matchesToFilter = [], allStages = []) {
  return matchesToFilter.filter((match) => {
    const isPastStage = isStageBeforeCurrent(
      match.stageId,
      CURRENT_TOURNAMENT_STAGE,
      allStages
    );

    if (isPastStage) {
      return Boolean(match.userPrediction);
    }

    return true;
  });
}

function getUserIdsWithGroupStagePredictions(predictions = [], matches = []) {
  const groupStageMatchIds = new Set(
    matches
      .filter((match) => match.stageId === "group-stage")
      .map((match) => match.id)
  );

  const userIdsWithGroupPredictions = new Set();

  predictions.forEach((predictionDoc) => {
    if (groupStageMatchIds.has(predictionDoc.matchId)) {
      userIdsWithGroupPredictions.add(predictionDoc.userId);
    }
  });

  return userIdsWithGroupPredictions;
}

function markLateJoinersInRanking(ranking = [], userIdsWithGroupPredictions) {
  return ranking.map((rankingUser) => {
    const userId = rankingUser.uid || rankingUser.id;
    const joinedLate = !userIdsWithGroupPredictions.has(userId);

    if (!joinedLate || rankingUser.badge === "Tú") {
      return rankingUser;
    }

    return {
      ...rankingUser,
      badge: "Se unió en 16vos",
    };
  });
}

function isSameLocalDay(dateA, dateB) {
  const firstDate = new Date(dateA);
  const secondDate = new Date(dateB);

  return (
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate()
  );
}

function getMatchDayStatus(matchDate) {
  const now = new Date();
  const matchLocalDate = new Date(matchDate);

  if (isSameLocalDay(matchLocalDate, now)) {
    return "today";
  }

  if (matchLocalDate.getTime() > now.getTime()) {
    return "upcoming";
  }

  return "past";
}

function sortMatchesTodayFirst(matchesToSort = []) {
  const priority = {
    today: 0,
    upcoming: 1,
    past: 2,
  };

  return [...matchesToSort].sort((firstMatch, secondMatch) => {
    const firstPriority = priority[getMatchDayStatus(firstMatch.date)];
    const secondPriority = priority[getMatchDayStatus(secondMatch.date)];

    if (firstPriority !== secondPriority) {
      return firstPriority - secondPriority;
    }

    return (
      new Date(firstMatch.date).getTime() - new Date(secondMatch.date).getTime()
    );
  });
}

function DashboardMock({ user, onLogout, onUpdateUser }) {
  const [activeSection, setActiveSection] = useState("home");
  const [activeStageId, setActiveStageId] = useState(stages[0].id);
  const [activeMatchFilter, setActiveMatchFilter] = useState("all");
  const [matchSearchTerm, setMatchSearchTerm] = useState("");
  const [activeStandingsGroup, setActiveStandingsGroup] = useState("");
  const [activePredictionsGroup, setActivePredictionsGroup] = useState("");

  const [isJoinLeagueModalOpen, setIsJoinLeagueModalOpen] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [isCreateLeagueModalOpen, setIsCreateLeagueModalOpen] = useState(false);
  const [selectedPredictionsMatch, setSelectedPredictionsMatch] = useState(null);
  
  const [isManualPredictionModalOpen, setIsManualPredictionModalOpen] = useState(false);

  const [userLeagues, setUserLeagues] = useState([]);
  const [isLoadingLeagues, setIsLoadingLeagues] = useState(false);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);

  const [leaguePredictions, setLeaguePredictions] = useState([]);
  const [userProfiles, setUserProfiles] = useState([]);

  const [leagueMembers, setLeagueMembers] = useState([]);
  const [pendingWhatsappPredictions, setPendingWhatsappPredictions] = useState([]);
  const [isLoadingPendingPredictions, setIsLoadingPendingPredictions] = useState(false);
  const [isSyncingFootballData, setIsSyncingFootballData] = useState(false);

  const activeLeagueId = user?.activeLeagueId || user?.leagueCode || "default";
  const hasActiveLeague = Boolean(activeLeagueId && activeLeagueId !== "default");
  const matchesStorageKey = getLeagueMatchesStorageKey(activeLeagueId);

  const safeUserLeagues = Array.isArray(userLeagues) ? userLeagues : [];
  const safeLeagueMembers = Array.isArray(leagueMembers) ? leagueMembers : [];

  const activeLeague = safeUserLeagues.find((league) => league.id === activeLeagueId);
  const activeLeagueMemberIds = activeLeague?.members || [];
  const isLeagueOwner = Boolean(user?.uid && activeLeague?.ownerId && user.uid === activeLeague.ownerId);

  const [matchesByLeague, setMatchesByLeague] = useState(() => ({
    [activeLeagueId]: getStorageItem(matchesStorageKey, cleanBaseMatches(initialMatches)),
  }));

  const matches = matchesByLeague[activeLeagueId] ?? getStorageItem(matchesStorageKey, cleanBaseMatches(initialMatches));
  const allLeagueMatches = hasActiveLeague ? matches : [];
  const visibleMatches = hasActiveLeague ? filterMatchesForParticipant(matches, stages) : [];

  const activeStage = stages.find((stage) => stage.id === activeStageId);

  const stageMatches = useMemo(() => {
    return getStageMatches(visibleMatches, activeStageId);
  }, [visibleMatches, activeStageId]);

  const filteredStageMatches = useMemo(() => {
    const filteredByStatus = filterMatchesByStatus(stageMatches, activeMatchFilter);
    const filteredBySearch = filterMatchesBySearch(filteredByStatus, matchSearchTerm);
    return sortMatchesTodayFirst(filteredBySearch);
  }, [stageMatches, activeMatchFilter, matchSearchTerm]);

  // LÓGICA DE BLOQUEO GLOBAL POR FASE
  const firstMatchOfActiveStage = useMemo(() => {
    if (!stageMatches || stageMatches.length === 0) return null;
    return stageMatches.reduce((earliest, current) => {
      return new Date(current.date).getTime() < new Date(earliest.date).getTime() ? current : earliest;
    });
  }, [stageMatches]);

  const isActiveStageGloballyLocked = useMemo(() => {
    if (!firstMatchOfActiveStage) return false;
    return new Date().getTime() >= new Date(firstMatchOfActiveStage.date).getTime();
  }, [firstMatchOfActiveStage]);

  const groupedStageMatches = useMemo(() => {
    return groupMatchesByGroup(filteredStageMatches);
  }, [filteredStageMatches]);

  const groupStandings = useMemo(() => {
    return buildGroupStandings(stageMatches);
  }, [stageMatches]);

  const standingsGroupLabels = useMemo(() => {
    return Object.keys(groupStandings);
  }, [groupStandings]);

  const safeActiveStandingsGroup = useMemo(() => {
    if (activeStandingsGroup && standingsGroupLabels.includes(activeStandingsGroup)) {
      return activeStandingsGroup;
    }
    return standingsGroupLabels[0] || "";
  }, [activeStandingsGroup, standingsGroupLabels]);

  const safeActivePredictionsGroup = useMemo(() => {
    if (activePredictionsGroup && standingsGroupLabels.includes(activePredictionsGroup)) {
      return activePredictionsGroup;
    }
    return standingsGroupLabels[0] || "";
  }, [activePredictionsGroup, standingsGroupLabels]);

  const selectedGroupStandings = useMemo(() => {
    if (!safeActiveStandingsGroup || !groupStandings[safeActiveStandingsGroup]) {
      return {};
    }
    return {
      [safeActiveStandingsGroup]: groupStandings[safeActiveStandingsGroup],
    };
  }, [safeActiveStandingsGroup, groupStandings]);

  const isGroupStage = activeStageId === "group-stage";

  const selectedGroupMatches = useMemo(() => {
    if (!isGroupStage) {
      return filteredStageMatches;
    }
    if (!safeActivePredictionsGroup || !groupedStageMatches[safeActivePredictionsGroup]) {
      return [];
    }
    return groupedStageMatches[safeActivePredictionsGroup];
  }, [isGroupStage, filteredStageMatches, groupedStageMatches, safeActivePredictionsGroup]);

  const matchFilterCounts = getMatchFilterCounts(stageMatches);
  const stageCompletedPredictions = getCompletedPredictions(stageMatches);
  const stagePendingMatches = getPendingMatches(stageMatches);
  const stageTotalMatches = stageMatches.length;

  const completedPredictions = getCompletedPredictions(visibleMatches);
  const pendingMatches = getPendingMatches(visibleMatches);
  const pendingMatchesList = sortMatchesByStatusAndDate(getPendingMatchesList(visibleMatches));

  const totalPoints = calculateTotalPoints(visibleMatches);
  const exactScores = calculateExactScores(visibleMatches);
  const resultHits = calculateResultHits(visibleMatches);

  const currentUserName = user?.displayName || "Invitado";

  const currentUserForRanking = {
    id: "current-user",
    uid: user?.uid || "current-user",
    name: currentUserName,
    badge: "Tú",
    predictions: visibleMatches.reduce((accumulator, match) => {
      if (!match.userPrediction) {
        return accumulator;
      }
      return {
        ...accumulator,
        [match.id]: match.userPrediction,
      };
    }, {}),
  };

  const rankingUsers = hasActiveLeague ? [currentUserForRanking] : [];

  const memberPredictions = activeLeagueMemberIds.length > 0
    ? leaguePredictions.filter((prediction) => activeLeagueMemberIds.includes(prediction.userId))
    : leaguePredictions;

  const firestoreRanking = buildRankingFromPredictions({
    predictions: memberPredictions,
    matches: allLeagueMatches,
    currentUser: user,
    userProfiles,
  });

  const fallbackRanking = buildRanking(rankingUsers, visibleMatches);

  const userIdsWithGroupStagePredictions = getUserIdsWithGroupStagePredictions(
    memberPredictions,
    allLeagueMatches
  );

  const ranking = hasActiveLeague && firestoreRanking.length > 0
    ? markLateJoinersInRanking(firestoreRanking, userIdsWithGroupStagePredictions)
    : hasActiveLeague
      ? fallbackRanking
      : [];

  const leagueAdminUsers = hasActiveLeague && userProfiles.length > 0
    ? userProfiles.map((profile) => {
        const profileId = profile.uid || profile.id;
        const userPredictions = memberPredictions.filter((prediction) => prediction.userId === profileId);
        const predictionsMap = userPredictions.reduce((accumulator, predictionDoc) => {
          return {
            ...accumulator,
            [predictionDoc.matchId]: {
              homeScore: Number(predictionDoc.homeScore),
              awayScore: Number(predictionDoc.awayScore),
            },
          };
        }, {});
        return {
          id: profileId,
          uid: profileId,
          name: profile.displayName || "Usuario",
          badge: profileId === user?.uid ? "Tú" : "Participante",
          predictions: predictionsMap,
        };
      })
    : hasActiveLeague
      ? [currentUserForRanking]
      : [];

  const currentUserPosition = getUserRankingPosition(ranking, currentUserName);

  const stageRanking = hasActiveLeague && firestoreRanking.length > 0
    ? buildRankingFromPredictions({
        predictions: memberPredictions,
        matches: getStageMatches(allLeagueMatches, activeStageId),
        currentUser: user,
        userProfiles,
      })
    : hasActiveLeague
      ? buildStageRanking(rankingUsers, allLeagueMatches, activeStageId)
      : [];

  function handleChangeSection(sectionId) {
    if (sectionId === "admin" && !isLeagueOwner) {
      setActiveSection("home");
      return;
    }
    setActiveSection(sectionId);
  }

  function applyUserPredictionsToMatches(matchesToApply = [], userPredictions = []) {
    const safeUserPredictions = Array.isArray(userPredictions) ? userPredictions : [];
    return matchesToApply.map((match) => {
      const userPrediction = safeUserPredictions.find((prediction) => prediction.matchId === match.id);
      return {
        ...match,
        userPrediction: userPrediction
          ? {
              homeScore: Number(userPrediction.prediction?.homeScore ?? userPrediction.homeScore),
              awayScore: Number(userPrediction.prediction?.awayScore ?? userPrediction.awayScore),
            }
          : match.userPrediction || null,
      };
    });
  }

  async function loadUserLeagues() {
    if (!user?.uid) {
      setUserLeagues([]);
      return;
    }
    setIsLoadingLeagues(true);
    try {
      const leagues = await getUserLeagues(user.uid);
      const safeLeagues = Array.isArray(leagues) ? leagues : [];
      setUserLeagues(safeLeagues);

      const userHasActiveLeague = Boolean(user?.activeLeagueId) || Boolean(user?.leagueCode);
      if (!userHasActiveLeague && safeLeagues.length > 0) {
        const firstLeague = safeLeagues[0];
        onUpdateUser({
          leagueCode: firstLeague.code,
          activeLeagueId: firstLeague.id,
          leagueName: firstLeague.name,
        });
      }
    } catch (error) {
      console.error("Error cargando ligas del usuario:", error);
      setUserLeagues([]);
    } finally {
      setIsLoadingLeagues(false);
    }
  }

  async function loadLeagueMembers() {
    if (!activeLeagueId || activeLeagueId === "default") {
      setLeagueMembers([]);
      return;
    }
    try {
      const members = await getLeagueMembers(activeLeagueId);
      setLeagueMembers(Array.isArray(members) ? members : []);
    } catch (error) {
      console.error("Error cargando miembros de la liga:", error);
      setLeagueMembers([]);
    }
  }

  async function loadPendingWhatsappPredictions() {
    if (!isLeagueOwner || !activeLeagueId || activeLeagueId === "default") {
      setPendingWhatsappPredictions([]);
      return;
    }
    setIsLoadingPendingPredictions(true);
    try {
      const pendingPredictions = await getSupabasePendingPredictions(activeLeagueId);
      setPendingWhatsappPredictions(pendingPredictions);
    } catch (error) {
      console.error("Error cargando pronósticos pendientes:", error);
      setPendingWhatsappPredictions([]);
    } finally {
      setIsLoadingPendingPredictions(false);
    }
  }

  async function loadLeaguePredictions() {
    if (!activeLeagueId || activeLeagueId === "default") {
      setLeaguePredictions([]);
      return;
    }
    try {
      const predictions = await getLeaguePredictions(activeLeagueId);
      setLeaguePredictions(Array.isArray(predictions) ? predictions : []);
    } catch (error) {
      console.error("Error cargando predicciones de la liga:", error);
      setLeaguePredictions([]);
    }
  }

  async function loadUserProfiles() {
    if (!activeLeagueId || activeLeagueId === "default") {
      setUserProfiles([]);
      return;
    }
    const profilesFromMembers = safeLeagueMembers.map((member) => ({
      id: member.uid || member.id,
      uid: member.uid || member.id,
      displayName: member.displayName || member.email || "Usuario",
      email: member.email || "",
    }));
    setUserProfiles(profilesFromMembers);
  }

  async function loadLeagueMatches() {
    if (!activeLeagueId || activeLeagueId === "default") {
      const localMatches = getStorageItem(matchesStorageKey, cleanBaseMatches(initialMatches));
      setMatchesByLeague((prev) => ({ ...prev, [activeLeagueId]: localMatches }));
      return;
    }
    setIsLoadingMatches(true);
    try {
      const supabaseMatches = await getLeagueMatches(activeLeagueId);
      const userPredictions = await getUserPredictions({ leagueId: activeLeagueId, userId: user.uid });

      if (supabaseMatches.length > 0) {
        const matchesWithPredictions = applyUserPredictionsToMatches(supabaseMatches, userPredictions);
        setMatchesByLeague((prev) => ({ ...prev, [activeLeagueId]: matchesWithPredictions }));
        setStorageItem(matchesStorageKey, matchesWithPredictions);
        return;
      }
      const localMatches = getStorageItem(matchesStorageKey, cleanBaseMatches(initialMatches));
      const localMatchesWithPredictions = applyUserPredictionsToMatches(localMatches, userPredictions);
      setMatchesByLeague((prev) => ({ ...prev, [activeLeagueId]: localMatchesWithPredictions }));
    } catch (error) {
      console.error("Error cargando partidos desde Supabase:", error);
      const localMatches = getStorageItem(matchesStorageKey, cleanBaseMatches(initialMatches));
      setMatchesByLeague((prev) => ({ ...prev, [activeLeagueId]: localMatches }));
    } finally {
      setIsLoadingMatches(false);
    }
  }

  useEffect(() => {
    queueMicrotask(async () => {
      if (user?.uid) {
        try {
          await ensureSupabaseProfile(user);
        } catch (error) {
          console.error("Error creando perfil en Supabase:", error);
        }
      }
      loadUserLeagues();
    });
  }, [user?.uid]);

  useEffect(() => {
    queueMicrotask(() => {
      loadLeagueMatches();
      loadLeaguePredictions();
      loadLeagueMembers();
      loadPendingWhatsappPredictions();
      setActiveMatchFilter("all");
      setMatchSearchTerm("");
      setSelectedPredictionsMatch(null);
    });
  }, [activeLeagueId, user?.uid]);

  useEffect(() => {
    queueMicrotask(() => {
      loadUserProfiles();
    });
  }, [activeLeagueId, safeLeagueMembers.length]);

  async function handleJoinLeague({ leagueCode }) {
    if (!user?.uid) throw new Error("USER_NOT_AUTHENTICATED");
    const league = await joinLeague({
      leagueCode,
      userId: user.uid,
      displayName: user.displayName,
      email: user.email,
    });
    onUpdateUser({
      leagueCode: league.code,
      activeLeagueId: league.id,
      leagueName: league.name,
    });
    setIsJoinLeagueModalOpen(false);
    await loadUserLeagues();
    await loadUserProfiles();
    await loadLeagueMembers();
  }

  async function handlePreviewLeague(leagueCode) {
    return await getLeagueByCode(leagueCode);
  }

  async function handleCreateLeague({ name, code, entryFee, prizeMode }) {
    if (!user?.uid) throw new Error("USER_NOT_AUTHENTICATED");
    const league = await createLeague({
      name, code, ownerId: user.uid, ownerDisplayName: user.displayName,
      ownerEmail: user.email, entryFee, prizeMode,
    });
    onUpdateUser({ leagueCode: league.code, activeLeagueId: league.id, leagueName: league.name });
    setIsCreateLeagueModalOpen(false);
    await loadUserLeagues();
    await loadUserProfiles();
    await loadLeagueMembers();
  }

  async function handleSeedSupabaseMatches() {
    if (!isLeagueOwner) return alert("Solo el administrador puede cargar partidos.");
    if (!activeLeagueId || activeLeagueId === "default") return alert("Primero selecciona o crea una liga.");
    const confirmSeed = window.confirm("Esto cargará los partidos base en Supabase. ¿Continuar?");
    if (!confirmSeed) return;

    try {
      const baseMatches = cleanBaseMatches(initialMatches);
      const savedMatches = await saveSupabaseLeagueMatches({ leagueId: activeLeagueId, matches: baseMatches });
      setMatchesByLeague((prev) => ({ ...prev, [activeLeagueId]: savedMatches }));
      setStorageItem(matchesStorageKey, savedMatches);
      alert(`Partidos cargados correctamente: ${savedMatches.length}`);
    } catch (error) {
      console.error("Error cargando partidos base en Supabase:", error);
      alert(error.message || "No se pudieron cargar los partidos base.");
    }
  }

  async function handleSaveWhatsappPrediction({ matchId, referenceName, homeScore, awayScore }) {
    if (!isLeagueOwner) return alert("Solo el administrador puede cargar pronósticos.");
    if (!activeLeagueId || activeLeagueId === "default") return alert("Primero selecciona o crea una liga.");
    if (!matchId || !referenceName?.trim()) return alert("Completa los datos.");

    try {
      await saveSupabasePendingPrediction({
        leagueId: activeLeagueId, matchId, referenceName: referenceName.trim(), homeScore, awayScore,
      });
      await loadPendingWhatsappPredictions();
      alert(`Pronóstico guardado para "${referenceName.trim()}".`);
    } catch (error) {
      console.error("Error guardando pronóstico:", error);
      alert("No se pudo guardar el pronóstico.");
    }
  }

  async function handleDeletePendingPrediction(pendingPredictionId) {
    if (!isLeagueOwner) return;
    if (!window.confirm("¿Borrar este pronóstico pendiente?")) return;
    try {
      await deleteSupabasePendingPrediction(pendingPredictionId);
      await loadPendingWhatsappPredictions();
    } catch (error) {
      console.error("Error borrando pronóstico:", error);
    }
  }

  async function handleClaimPendingPredictions({ referenceName, userId }) {
    if (!isLeagueOwner || !activeLeagueId || activeLeagueId === "default") return;
    if (!referenceName || !userId) return;

    try {
      const result = await claimSupabasePendingPredictionsForUser({ leagueId: activeLeagueId, referenceName, userId });
      await loadPendingWhatsappPredictions();
      await loadLeaguePredictions();
      await loadUserProfiles();
      alert(`${result.claimedCount} pronóstico(s) asignado(s) correctamente.`);
    } catch (error) {
      console.error("Error asignando:", error);
      alert("No se pudieron asignar los pronósticos.");
    }
  }

  async function handleSyncFootballDataMatches() {
    if (isSyncingFootballData || !isLeagueOwner || !activeLeagueId || activeLeagueId === "default") return;

    const lastSyncKey = `last-football-data-sync-${activeLeagueId}`;
    const lastSyncAt = Number(localStorage.getItem(lastSyncKey) || 0);
    const tenMinutes = 10 * 60 * 1000;

    if (lastSyncAt && Date.now() - lastSyncAt < tenMinutes) {
      const remaining = Math.ceil((tenMinutes - (Date.now() - lastSyncAt)) / 60000);
      return alert(`Espera ${remaining} minuto(s) para volver a sincronizar.`);
    }

    setIsSyncingFootballData(true);
    try {
      const result = await syncFootballDataMatches({ leagueId: activeLeagueId });
      localStorage.setItem(lastSyncKey, String(Date.now()));
      await loadLeagueMatches();
      await loadLeaguePredictions();
      alert(`Sincronización completada:\n${result.total} partidos encontrados.`);
    } catch (error) {
      console.error("Error sincronizando:", error);
      alert("No se pudieron sincronizar los partidos.");
    } finally {
      setIsSyncingFootballData(false);
    }
  }

  function handleSelectLeague(league) {
    onUpdateUser({ leagueCode: league.code, activeLeagueId: league.id, leagueName: league.name });
    setActiveSection("home");
  }

  function handleOpenMatchPredictions(match) {
    setSelectedPredictionsMatch(match);
  }

  async function handleSavePrediction(matchId, prediction) {
    if (!user?.uid) return alert("Debes iniciar sesión para guardar pronósticos.");
    if (!hasActiveLeague) return alert("Primero debes unirte a una liga.");
    if (activeLeague?.predictionsLocked) return alert("La quiniela ya fue cerrada.");

    // LÓGICA DE BLOQUEO DE USUARIOS PARA DIECISEISAVOS (SOLO ADMIN)
    const matchToUpdate = matches.find(m => m.id === matchId);
    if (matchToUpdate?.stageId === 'round-32') {
        alert("Los pronósticos de Dieciseisavos solo pueden ser capturados manualmente por el administrador.");
        return;
    }

    setMatchesByLeague((prev) => {
      const currentMatches = prev[activeLeagueId] ?? getStorageItem(matchesStorageKey, cleanBaseMatches(initialMatches));
      const updatedMatches = currentMatches.map((match) => match.id === matchId ? { ...match, userPrediction: prediction } : match);
      setStorageItem(matchesStorageKey, updatedMatches);
      return { ...prev, [activeLeagueId]: updatedMatches };
    });

    try {
      await savePrediction({
        leagueId: activeLeagueId, matchId, userId: user.uid,
        homeScore: Number(prediction.homeScore), awayScore: Number(prediction.awayScore),
      });
      await loadLeaguePredictions();
      await loadUserProfiles();
    } catch (error) {
      console.error("Error guardando predicción:", error);
      alert("Tu pronóstico no pudo sincronizarse correctamente.");
    }
  }
  
  async function handleSaveManualPrediction({ userId, matchId, homeScore, awayScore }) {
    if (!isLeagueOwner) return alert("Solo el administrador puede capturar pronósticos manuales.");
    try {
      await savePrediction({
        leagueId: activeLeagueId, matchId, userId,
        homeScore: Number(homeScore), awayScore: Number(awayScore),
      });
      await loadLeaguePredictions();
      await loadUserProfiles();
    } catch (error) {
      console.error("Error guardando predicción manual en Supabase:", error);
      throw error;
    }
  }

  async function handleSaveResult(matchId, result) {
    if (!isLeagueOwner) return alert("Solo el administrador puede actualizar resultados.");
    setMatchesByLeague((prev) => {
      const currentMatches = prev[activeLeagueId] ?? getStorageItem(matchesStorageKey, cleanBaseMatches(initialMatches));
      const updatedMatches = currentMatches.map((match) => match.id === matchId ? { ...match, result } : match);
      setStorageItem(matchesStorageKey, updatedMatches);
      return { ...prev, [activeLeagueId]: updatedMatches };
    });
    if (!activeLeagueId || activeLeagueId === "default") return;
    try {
      await updateMatchResult({ leagueId: activeLeagueId, matchId, result });
      await loadLeagueMatches();
      await loadLeaguePredictions();
    } catch (error) {
      console.error("Error guardando resultado:", error);
      alert("El resultado no pudo sincronizarse correctamente.");
    }
  }

  async function handleClearResult(matchId) {
    if (!isLeagueOwner) return alert("Solo el administrador puede quitar resultados.");
    setMatchesByLeague((prev) => {
      const currentMatches = prev[activeLeagueId] ?? getStorageItem(matchesStorageKey, cleanBaseMatches(initialMatches));
      const updatedMatches = currentMatches.map((match) => match.id === matchId ? { ...match, result: null } : match);
      setStorageItem(matchesStorageKey, updatedMatches);
      return { ...prev, [activeLeagueId]: updatedMatches };
    });
    if (!activeLeagueId || activeLeagueId === "default") return;
    try {
      await updateMatchResult({ leagueId: activeLeagueId, matchId, result: null });
      await loadLeagueMatches();
      await loadLeaguePredictions();
      alert("Resultado quitado correctamente.");
    } catch (error) {
      console.error("Error quitando resultado:", error);
      alert("No se pudo quitar el resultado.");
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dcfce7,transparent_32%),linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)]">
      <Header user={user} onLogout={onLogout} />

      <AppNavigation
        activeSection={activeSection}
        onChangeSection={handleChangeSection}
        showAdmin={isLeagueOwner}
      />

      <main className="mx-auto max-w-6xl px-4 pb-32 pt-5 md:pb-8 md:pt-8">
        {activeSection === "home" && (
          <div className="space-y-4">
            <section className="rounded-[1.5rem] border border-white/70 bg-white/80 p-4 shadow-xl shadow-slate-200/70 backdrop-blur sm:rounded-[2rem] sm:p-5">
              <p className="text-sm font-bold text-emerald-700">
                Dashboard principal
              </p>

              <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                    Tus pronósticos, {currentUserName}
                  </h2>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                    Captura marcadores, revisa pendientes y compite contra tu
                    liga. Aquí el ego futbolero sí se mide con datos.
                  </p>
                </div>

                {hasActiveLeague && (
                  <div className="w-fit rounded-2xl bg-emerald-600 px-4 py-3 text-white sm:w-auto">
                    <p className="text-xs font-bold uppercase tracking-widest text-emerald-100">
                      Puntos
                    </p>

                    <p className="text-2xl font-black">{totalPoints}</p>
                  </div>
                )}
              </div>
            </section>

            {!hasActiveLeague && (
              <EmptyLeagueState
                onJoinLeague={() => setIsJoinLeagueModalOpen(true)}
                onCreateLeague={() => setIsCreateLeagueModalOpen(true)}
              />
            )}

            {hasActiveLeague && (
              <DashboardSummary
                completed={completedPredictions}
                pending={pendingMatches}
                position={currentUserPosition}
                totalPoints={totalPoints}
                exactScores={exactScores}
                resultHits={resultHits}
              />
            )}

            <section className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm sm:rounded-[2rem] sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                    <UsersRound size={24} />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-emerald-700">
                      Liga actual
                    </p>

                    <h2 className="text-lg font-black text-slate-950 sm:text-xl">
                      {user?.leagueCode
                        ? user?.leagueName ||
                          `Código: ${user.leagueCode.toUpperCase()}`
                        : "Aún no estás en una liga"}
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      {user?.leagueCode
                        ? `Código: ${user.leagueCode.toUpperCase()}`
                        : "Puedes explorar el dashboard y unirte cuando tengas un código de invitación."}
                    </p>

                    {user?.leagueCode && (
                      <p className="mt-1 text-xs font-bold text-slate-400">
                        {isLeagueOwner
                          ? "Tienes permisos para administrar partidos y resultados."
                          : "Puedes capturar pronósticos y consultar rankings."}
                      </p>
                    )}
                  </div>
                </div>

                {user?.leagueCode ? (
                  <div className="flex flex-col gap-2 sm:items-end">
                    <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700">
                      <KeyRound size={18} />
                      Liga activa
                    </div>

                    <div
                      className={`rounded-2xl px-4 py-2 text-xs font-black ${
                        isLeagueOwner
                          ? "bg-slate-950 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {isLeagueOwner ? "Administrador" : "Participante"}
                    </div>

                    <div className="grid w-full gap-2 sm:w-auto sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => setIsJoinLeagueModalOpen(true)}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                      >
                        Unirme a otra
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsCreateLeagueModalOpen(true)}
                        className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-black text-white transition hover:bg-emerald-700"
                      >
                        Crear otra
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsJoinLeagueModalOpen(true)}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white transition hover:bg-slate-800"
                  >
                    <Plus size={18} />
                    Unirme a liga
                  </button>
                )}
              </div>
            </section>

            {hasActiveLeague && (
              <div className="grid gap-3 md:gap-4 lg:grid-cols-2">

                <PendingMatchesCard
                  pendingMatches={pendingMatchesList}
                  onSelectStage={(stageId) => {
                    setActiveStageId(stageId);
                    setActiveSection("matches");
                  }}
                />

                <StageProgressCard
                  stages={stages}
                  matches={visibleMatches}
                  onSelectStage={(stageId) => {
                    setActiveStageId(stageId);
                    setActiveSection("matches");
                  }}
                />

                <StageRankingPreviewCard
                  stages={stages}
                  matches={visibleMatches}
                  rankingUsers={rankingUsers}
                  memberPredictions={memberPredictions}
                  currentUser={user}
                  userProfiles={userProfiles}
                  activeLeagueId={activeLeagueId}
                  onSelectStage={(stageId) => {
                    setActiveStageId(stageId);
                    setActiveSection("ranking");
                  }}
                />

                <UserLeaguesCard
                  leagues={userLeagues}
                  activeLeagueId={user?.activeLeagueId}
                  isLoading={isLoadingLeagues}
                  onRefresh={loadUserLeagues}
                  onSelectLeague={handleSelectLeague}
                />

                <RankingCard
                  ranking={ranking}
                  currentUserName={currentUserName}
                  title="Ranking general"
                  subtitle="Tabla acumulada"
                />
              </div>
            )}
          </div>
        )}

        {activeSection === "matches" && (
          <>
            {!hasActiveLeague ? (
              <EmptyLeagueState
                onJoinLeague={() => setIsJoinLeagueModalOpen(true)}
                onCreateLeague={() => setIsCreateLeagueModalOpen(true)}
              />
            ) : (
              <section className="space-y-3">
                <section className="rounded-[1.5rem] border border-slate-200 bg-white/90 p-3 shadow-sm backdrop-blur">
                  <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-emerald-600">
                        Etapas
                      </p>

                      <h2 className="text-lg font-black text-slate-950">
                        {activeStage?.fullName}
                      </h2>
                    </div>
                  </div>

                  <StageTabs
                    stages={stages}
                    activeStageId={activeStageId}
                    onChangeStage={setActiveStageId}
                  />
                </section>

                <section className="grid gap-2 md:grid-cols-2">
                  <article className="rounded-[1.25rem] border border-slate-200 bg-white p-3 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-widest text-emerald-600">
                          Resumen de etapa
                        </p>

                        <h3 className="mt-1 truncate text-base font-black text-slate-950">
                          {activeStage?.fullName}
                        </h3>
                      </div>

                      <div className="rounded-2xl bg-slate-950 px-3 py-2 text-center text-white">
                        <p className="text-lg font-black">
                          {stageTotalMatches}
                        </p>
                        <p className="text-[9px] font-bold uppercase text-slate-400">
                          Partidos
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                      <div className="rounded-2xl bg-emerald-50 p-2">
                        <p className="text-lg font-black text-emerald-700">
                          {stageCompletedPredictions}
                        </p>
                        <p className="text-[10px] font-bold uppercase text-slate-400">
                          Llenos
                        </p>
                      </div>

                      <div className="rounded-2xl bg-rose-50 p-2">
                        <p className="text-lg font-black text-rose-600">
                          {stagePendingMatches}
                        </p>
                        <p className="text-[10px] font-bold uppercase text-slate-400">
                          Faltan
                        </p>
                      </div>
                    </div>
                  </article>

                  <article className="rounded-[1.25rem] border border-emerald-100 bg-emerald-50 p-3 shadow-sm">
                    <p className="text-[11px] font-black uppercase tracking-widest text-emerald-700">
                      Avance de tus pronósticos
                    </p>

                    <div className="mt-2 flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-2xl font-black text-slate-950">
                          {stageTotalMatches > 0
                            ? Math.round(
                                (stageCompletedPredictions /
                                  stageTotalMatches) *
                                  100
                              )
                            : 0}
                          %
                        </h3>

                        <p className="text-xs font-bold text-slate-500">
                          {stageCompletedPredictions} de {stageTotalMatches}{" "}
                          capturados
                        </p>
                      </div>

                      <div className="h-3 flex-1 overflow-hidden rounded-full bg-white">
                        <div
                          className="h-full rounded-full bg-emerald-600"
                          style={{
                            width: `${
                              stageTotalMatches > 0
                                ? Math.round(
                                    (stageCompletedPredictions /
                                      stageTotalMatches) *
                                      100
                                  )
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </article>
                </section>

                {isGroupStage && standingsGroupLabels.length > 0 && (
                  <section className="rounded-[1.25rem] border border-slate-200 bg-white p-3 shadow-sm">
                    <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-widest text-emerald-600">
                          Grupo seleccionado
                        </p>

                        <h3 className="text-lg font-black text-slate-950">
                          Tabla y partidos por grupo
                        </h3>
                      </div>

                      <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
                        {standingsGroupLabels.map((groupLabel) => {
                          const isActive = safeActiveStandingsGroup === groupLabel;

                          return (
                            <button
                              key={groupLabel}
                              type="button"
                              onClick={() => setActiveStandingsGroup(groupLabel)}
                              className={`shrink-0 rounded-2xl px-4 py-2 text-xs font-black transition ${
                                isActive
                                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-100"
                                  : "bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
                              }`}
                            >
                              {groupLabel}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <GroupStandingsCard
                      groupStandings={selectedGroupStandings}
                    />
                  </section>
                )}

                <section className="rounded-[1.25rem] border border-slate-200 bg-white p-3 shadow-sm">
                  <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-widest text-emerald-600">
                        Filtros rápidos
                      </p>

                      <h3 className="text-lg font-black text-slate-950">
                        Estado de partidos
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <Search size={16} className="text-slate-400" />

                      <input
                        type="search"
                        value={matchSearchTerm}
                        onChange={(event) =>
                          setMatchSearchTerm(event.target.value)
                        }
                        placeholder="Buscar..."
                        className="w-full bg-transparent text-xs font-bold text-slate-700 outline-none placeholder:text-slate-400 sm:w-52"
                      />
                    </div>
                  </div>

                  <MatchFilters
                    activeFilter={activeMatchFilter}
                    onChangeFilter={setActiveMatchFilter}
                    counts={matchFilterCounts}
                  />
                </section>

                {isLoadingMatches && (
                  <section className="rounded-[1.5rem] border border-slate-200 bg-white/80 p-5 text-center shadow-sm">
                    <p className="text-sm font-black text-emerald-700">
                      Cargando partidos de la liga...
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Preparando la información de tu liga.
                    </p>
                  </section>
                )}

                {!isLoadingMatches && isGroupStage ? (
                  <section className="rounded-[1.5rem] border border-slate-200 bg-white p-3 shadow-sm">
                    <div className="mb-3 flex flex-col gap-3 rounded-2xl bg-slate-950 px-4 py-3 text-white sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-emerald-300">
                          Tus pronósticos
                        </p>

                        <h3 className="text-lg font-black">
                          {safeActivePredictionsGroup}
                        </h3>

                        <p className="mt-1 text-xs font-bold text-slate-400">
                          Selecciona el grupo que quieres llenar o revisar.
                        </p>
                      </div>

                      <div className="flex w-full flex-col gap-2 sm:items-end">
                        <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
                          {standingsGroupLabels.map((groupLabel) => {
                            const isActive = safeActivePredictionsGroup === groupLabel;

                            return (
                              <button
                                key={groupLabel}
                                type="button"
                                onClick={() => setActivePredictionsGroup(groupLabel)}
                                className={`shrink-0 rounded-2xl px-4 py-2 text-xs font-black transition ${
                                  isActive
                                    ? "bg-white text-slate-950 shadow-lg shadow-black/10"
                                    : "bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white"
                                }`}
                              >
                                {groupLabel}
                              </button>
                            );
                          })}
                        </div>

                        <p className="rounded-full bg-white/10 px-3 py-1 text-xs font-black">
                          {selectedGroupMatches.length} partidos
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {selectedGroupMatches.map((match) => (
                        <CompactMatchCard
                          key={match.id}
                          match={match}
                          onSavePrediction={handleSavePrediction}
                          predictionsLocked={
                            Boolean(activeLeague?.predictionsLocked) || 
                            match.stageId === 'round-32' || 
                            (match.stageId !== 'group-stage' && isActiveStageGloballyLocked)
                          }
                          canViewLeaguePredictions={
                            Boolean(activeLeague?.predictionsLocked) || 
                            Boolean(match.result) || 
                            match.stageId === 'round-32' ||
                            (match.stageId !== 'group-stage' && isActiveStageGloballyLocked)
                          }
                          onViewMatchPredictions={() =>
                            handleOpenMatchPredictions(match)
                          }
                        />
                      ))}
                    </div>
                  </section>
                ) : (
                  <section className="grid grid-cols-2 gap-2">
                    {!isLoadingMatches &&
                      filteredStageMatches.map((match) => (
                        <CompactMatchCard
                          key={match.id}
                          match={match}
                          onSavePrediction={handleSavePrediction}
                          predictionsLocked={
                            Boolean(activeLeague?.predictionsLocked) || 
                            match.stageId === 'round-32' || 
                            (match.stageId !== 'group-stage' && isActiveStageGloballyLocked)
                          }
                          canViewLeaguePredictions={
                            Boolean(activeLeague?.predictionsLocked) || 
                            Boolean(match.result) || 
                            match.stageId === 'round-32' ||
                            (match.stageId !== 'group-stage' && isActiveStageGloballyLocked)
                          }
                          onViewMatchPredictions={() =>
                            handleOpenMatchPredictions(match)
                          }
                        />
                      ))}
                  </section>
                )}

                {!isLoadingMatches && filteredStageMatches.length === 0 && (
                  <section className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white/70 p-6 text-center">
                    <p className="text-lg font-black text-slate-950">
                      No hay partidos en este filtro
                    </p>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Cambia el filtro o selecciona otra etapa.
                    </p>
                  </section>
                )}
              </section>
            )}
          </>
        )}

        {activeSection === "ranking" && (
          <>
            {!hasActiveLeague ? (
              <EmptyLeagueState
                onJoinLeague={() => setIsJoinLeagueModalOpen(true)}
                onCreateLeague={() => setIsCreateLeagueModalOpen(true)}
              />
            ) : (
              <section className="space-y-4">
                <section className="grid gap-4 lg:grid-cols-2">
                  <RankingCard
                    ranking={ranking}
                    currentUserName={currentUserName}
                    title="Ranking general"
                    subtitle="Tabla acumulada"
                  />

                  <RankingCard
                    ranking={stageRanking}
                    currentUserName={currentUserName}
                    title={`Ranking ${activeStage?.label}`}
                    subtitle={activeStage?.fullName}
                  />
                </section>
              </section>
            )}
          </>
        )}

        {activeSection === "history" && (
          <>
            {!hasActiveLeague ? (
              <EmptyLeagueState
                onJoinLeague={() => setIsJoinLeagueModalOpen(true)}
                onCreateLeague={() => setIsCreateLeagueModalOpen(true)}
              />
            ) : (
              <PredictionHistoryCard
                matches={visibleMatches}
                userName={currentUserName}
                leagueName={
                  activeLeague?.name ||
                  user?.leagueName ||
                  user?.leagueCode ||
                  "Quinielazo"
                }
              />
            )}
          </>
        )}

        {activeSection === "admin" && isLeagueOwner && (
          <div className="space-y-4">
            <section className="rounded-[1.5rem] border border-white/70 bg-white/80 p-4 shadow-xl shadow-slate-200/70 backdrop-blur sm:rounded-[2rem] sm:p-5">
              <p className="text-sm font-bold text-emerald-700">
                Administración
              </p>

              <h2 className="mt-1 text-3xl font-black tracking-tight text-slate-950">
                Panel de {user?.leagueName || user?.leagueCode || "liga"}
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                Desde aquí puedes cargar partidos, revisar participantes y
                actualizar resultados oficiales de la quiniela.
              </p>
            </section>

            <AdminPanelCard
              users={leagueAdminUsers}
              matches={allLeagueMatches}
              members={safeLeagueMembers}
              isSyncingFootballData={isSyncingFootballData}
              pendingWhatsappPredictions={pendingWhatsappPredictions}
              isLoadingPendingPredictions={isLoadingPendingPredictions}
              onOpenResultModal={() => setIsResultModalOpen(true)}
              onOpenCreateLeagueModal={() => setIsCreateLeagueModalOpen(true)}
              onSyncFootballDataMatches={handleSyncFootballDataMatches}
              onSeedSupabaseMatches={handleSeedSupabaseMatches}
              onSaveWhatsappPrediction={handleSaveWhatsappPrediction}
              onDeletePendingPrediction={handleDeletePendingPrediction}
              onClaimPendingPredictions={handleClaimPendingPredictions}
              onOpenManualPredictionModal={() => setIsManualPredictionModalOpen(true)}
            />
          </div>
        )}

        {activeSection === "admin" && !isLeagueOwner && (
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 text-center shadow-sm">
            <p className="text-sm font-bold text-emerald-700">
              Acceso restringido
            </p>

            <h2 className="mt-2 text-2xl font-black text-slate-950">
              No eres administrador de esta liga
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Solo el creador de la liga puede cargar partidos, actualizar
              resultados y administrar la quiniela.
            </p>

            <button
              type="button"
              onClick={() => setActiveSection("home")}
              className="mt-5 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800"
            >
              Volver al inicio
            </button>
          </section>
        )}

        {hasActiveLeague && (
          <section className="mt-4 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm sm:rounded-[2rem] sm:p-5">
            <p className="text-sm font-bold text-emerald-700">Reglas rápidas</p>

            <h2 className="mt-1 text-xl font-black text-slate-950 sm:text-2xl">
              Puntuación
            </h2>

            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <p>
                <strong className="text-slate-950">+1 punto</strong> si aciertas
                ganador o empate.
              </p>

              <p>
                <strong className="text-slate-950">+2 puntos extra</strong> si
                aciertas marcador exacto.
              </p>

              <p>
                <strong className="text-slate-950">3 puntos total</strong> por
                marcador exacto.
              </p>

              <p>
                Los pronósticos se bloquean cuando inicia el partido o cuando la
                quiniela es cerrada por el administrador.
              </p>
            </div>
          </section>
        )}
      </main>

      <JoinLeagueModal
        isOpen={isJoinLeagueModalOpen}
        onClose={() => setIsJoinLeagueModalOpen(false)}
        onJoinLeague={handleJoinLeague}
        onPreviewLeague={handlePreviewLeague}
      />

      <ResultModal
        isOpen={isResultModalOpen}
        onClose={() => setIsResultModalOpen(false)}
        matches={visibleMatches}
        onSaveResult={handleSaveResult}
        onClearResult={handleClearResult}
      />

      <CreateLeagueModal
        isOpen={isCreateLeagueModalOpen}
        onClose={() => setIsCreateLeagueModalOpen(false)}
        onCreateLeague={handleCreateLeague}
      />

      <MatchPredictionsModal
        isOpen={Boolean(selectedPredictionsMatch)}
        onClose={() => setSelectedPredictionsMatch(null)}
        match={selectedPredictionsMatch}
        predictions={leaguePredictions}
        userProfiles={userProfiles}
        leagueMembers={safeLeagueMembers}
      />

      <AdminManualPredictionModal
        isOpen={isManualPredictionModalOpen}
        onClose={() => setIsManualPredictionModalOpen(false)}
        users={userProfiles}
        matches={allLeagueMatches}
        onSavePrediction={handleSaveManualPrediction}
      />
    </div>
  );
}

export default DashboardMock;