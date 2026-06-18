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
import UserComparisonCard from "../components/UserComparisonCard";
import PrizesCard from "../components/PrizesCard";
import AdminPanelCard from "../components/AdminPanelCard";
import ResultModal from "../components/ResultModal";
import CreateLeagueModal from "../components/CreateLeagueModal";
import UserLeaguesCard from "../components/UserLeaguesCard";
import PrizeEditorModal from "../components/PrizeEditorModal";
import LeaguePrizeSettingsModal from "../components/LeaguePrizeSettingsModal";
import PrizePreviewCard from "../components/PrizePreviewCard";
import StageProgressCard from "../components/StageProgressCard";
import StageRankingPreviewCard from "../components/StageRankingPreviewCard";
import GroupStandingsCard from "../components/GroupStandingsCard";

import { ensureSupabaseProfile } from "../services/supabaseProfileService";
import { syncFootballDataMatches } from "../services/footballDataSyncService";

import {
  createSupabaseLeague as createLeague,
  getSupabaseLeagueByCode as getLeagueByCode,
  getSupabaseLeagueMembers as getLeagueMembers,
  getSupabaseUserLeagues as getUserLeagues,
  joinSupabaseLeague as joinLeague,
  updateSupabaseLeaguePrizeSettings as updateLeaguePrizeSettings,
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
  getSupabaseLeaguePrizes as getLeaguePrizes,
  saveSupabaseLeaguePrizes as saveLeaguePrizes,
} from "../services/supabasePrizeService";

import {
  matches as initialMatches,
  prizes as initialPrizes,
  stages,
} from "../data/mockData";

import {
  buildRanking,
  buildRankingFromPredictions,
  buildStageRanking,
  buildUsersFromPredictions,
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

function cleanBaseMatches(matches = []) {
  return matches.map((match) => ({
    ...match,
    userPrediction: null,
    result: null,
  }));
}

function getPredictionScores(prediction = {}) {
  const rawHomeScore =
    prediction.homeScore ??
    prediction.home_score ??
    prediction.localScore ??
    prediction.home ??
    prediction.homeGoals;

  const rawAwayScore =
    prediction.awayScore ??
    prediction.away_score ??
    prediction.visitorScore ??
    prediction.away ??
    prediction.awayGoals;

  const homeScore = Number(rawHomeScore);
  const awayScore = Number(rawAwayScore);

  if (!Number.isFinite(homeScore) || !Number.isFinite(awayScore)) {
    return null;
  }

  return {
    homeScore,
    awayScore,
  };
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
  const [isPrizeEditorModalOpen, setIsPrizeEditorModalOpen] = useState(false);
  const [isPrizeSettingsModalOpen, setIsPrizeSettingsModalOpen] =
    useState(false);

  const [userLeagues, setUserLeagues] = useState([]);
  const [isLoadingLeagues, setIsLoadingLeagues] = useState(false);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);

  const [leaguePredictions, setLeaguePredictions] = useState([]);
  const [userProfiles, setUserProfiles] = useState([]);

  const [leaguePrizes, setLeaguePrizes] = useState(initialPrizes);
  const [isLoadingPrizes, setIsLoadingPrizes] = useState(false);

  const [leagueMembers, setLeagueMembers] = useState([]);

  const [isSyncingFootballData, setIsSyncingFootballData] = useState(false);

  const activeLeagueId = user?.activeLeagueId || user?.leagueCode || "default";
  const hasActiveLeague = Boolean(
    activeLeagueId && activeLeagueId !== "default",
  );
  const matchesStorageKey = getLeagueMatchesStorageKey(activeLeagueId);

  const safeUserLeagues = Array.isArray(userLeagues) ? userLeagues : [];
  const safeLeagueMembers = Array.isArray(leagueMembers) ? leagueMembers : [];

  const activeLeague = safeUserLeagues.find(
    (league) => league.id === activeLeagueId,
  );

  const activeLeagueMemberIds = activeLeague?.members || [];

  const isLeagueOwner = Boolean(
    user?.uid && activeLeague?.ownerId && user.uid === activeLeague.ownerId,
  );

  const totalLeagueMembers =
    safeLeagueMembers.length > 0
      ? safeLeagueMembers.length
      : activeLeagueMemberIds.length;

  const [matchesByLeague, setMatchesByLeague] = useState(() => ({
    [activeLeagueId]: getStorageItem(
      matchesStorageKey,
      cleanBaseMatches(initialMatches),
    ),
  }));

  const matches =
    matchesByLeague[activeLeagueId] ??
    getStorageItem(matchesStorageKey, cleanBaseMatches(initialMatches));

  const visibleMatches = hasActiveLeague ? matches : [];

  const activeStage = stages.find((stage) => stage.id === activeStageId);

  const stageMatches = useMemo(() => {
    return getStageMatches(visibleMatches, activeStageId);
  }, [visibleMatches, activeStageId]);

  const filteredStageMatches = useMemo(() => {
    const filteredByStatus = filterMatchesByStatus(
      stageMatches,
      activeMatchFilter,
    );

    const filteredBySearch = filterMatchesBySearch(
      filteredByStatus,
      matchSearchTerm,
    );

    return sortMatchesTodayFirst(filteredBySearch);
  }, [stageMatches, activeMatchFilter, matchSearchTerm]);

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
    if (
      activeStandingsGroup &&
      standingsGroupLabels.includes(activeStandingsGroup)
    ) {
      return activeStandingsGroup;
    }

    return standingsGroupLabels[0] || "";
  }, [activeStandingsGroup, standingsGroupLabels]);

  const safeActivePredictionsGroup = useMemo(() => {
    if (
      activePredictionsGroup &&
      standingsGroupLabels.includes(activePredictionsGroup)
    ) {
      return activePredictionsGroup;
    }

    return standingsGroupLabels[0] || "";
  }, [activePredictionsGroup, standingsGroupLabels]);

  const selectedGroupStandings = useMemo(() => {
    if (
      !safeActiveStandingsGroup ||
      !groupStandings[safeActiveStandingsGroup]
    ) {
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

    if (
      !safeActivePredictionsGroup ||
      !groupedStageMatches[safeActivePredictionsGroup]
    ) {
      return [];
    }

    return groupedStageMatches[safeActivePredictionsGroup];
  }, [
    isGroupStage,
    filteredStageMatches,
    groupedStageMatches,
    safeActivePredictionsGroup,
  ]);

  const matchFilterCounts = getMatchFilterCounts(stageMatches);
  const stageCompletedPredictions = getCompletedPredictions(stageMatches);
  const stagePendingMatches = getPendingMatches(stageMatches);
  const stageTotalMatches = stageMatches.length;

  const completedPredictions = getCompletedPredictions(visibleMatches);
  const pendingMatches = getPendingMatches(visibleMatches);
  const pendingMatchesList = sortMatchesByStatusAndDate(
    getPendingMatchesList(visibleMatches),
  );

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

  const memberPredictions =
    activeLeagueMemberIds.length > 0
      ? leaguePredictions.filter((prediction) =>
          activeLeagueMemberIds.includes(prediction.userId),
        )
      : leaguePredictions;

  const firestoreRanking = buildRankingFromPredictions({
    predictions: memberPredictions,
    matches: visibleMatches,
    currentUser: user,
    userProfiles,
  });

  const fallbackRanking = buildRanking(rankingUsers, visibleMatches);

  const ranking =
    hasActiveLeague && firestoreRanking.length > 0
      ? firestoreRanking
      : hasActiveLeague
        ? fallbackRanking
        : [];

  const firestoreComparisonUsers = buildUsersFromPredictions({
    predictions: memberPredictions,
    currentUser: user,
    userProfiles,
  });

  const comparisonUsers =
    hasActiveLeague && firestoreComparisonUsers.length > 0
      ? firestoreComparisonUsers
      : hasActiveLeague
        ? rankingUsers
        : [];

  const leagueAdminUsers =
    hasActiveLeague && userProfiles.length > 0
      ? userProfiles.map((profile) => {
          const profileId = profile.uid || profile.id;

          const userPredictions = memberPredictions.filter(
            (prediction) => prediction.userId === profileId,
          );

          const predictionsMap = userPredictions.reduce(
            (accumulator, predictionDoc) => {
              return {
                ...accumulator,
                [predictionDoc.matchId]: {
                  homeScore: Number(predictionDoc.homeScore),
                  awayScore: Number(predictionDoc.awayScore),
                },
              };
            },
            {},
          );

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

  const stageRanking =
    hasActiveLeague && firestoreRanking.length > 0
      ? buildRankingFromPredictions({
          predictions: memberPredictions,
          matches: getStageMatches(visibleMatches, activeStageId),
          currentUser: user,
          userProfiles,
        })
      : hasActiveLeague
        ? buildStageRanking(rankingUsers, visibleMatches, activeStageId)
        : [];

  function handleChangeSection(sectionId) {
    if (sectionId === "admin" && !isLeagueOwner) {
      setActiveSection("home");
      return;
    }

    setActiveSection(sectionId);
  }

  function applyUserPredictionsToMatches(
    matchesToApply = [],
    userPredictions = [],
  ) {
    const safeUserPredictions = Array.isArray(userPredictions)
      ? userPredictions
      : [];

    return matchesToApply.map((match) => {
      const userPrediction = safeUserPredictions.find(
        (prediction) => prediction.matchId === match.id,
      );

      return {
        ...match,
        userPrediction: userPrediction
  ? {
      homeScore: Number(
        userPrediction.prediction?.homeScore ?? userPrediction.homeScore
      ),
      awayScore: Number(
        userPrediction.prediction?.awayScore ?? userPrediction.awayScore
      ),
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

      const userHasActiveLeague =
        Boolean(user?.activeLeagueId) || Boolean(user?.leagueCode);

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

  async function loadLeaguePredictions() {
    if (!activeLeagueId || activeLeagueId === "default") {
      setLeaguePredictions([]);
      return;
    }

    try {
      const predictions = await getLeaguePredictions(activeLeagueId);
      setLeaguePredictions(predictions);
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

  async function loadLeaguePrizes() {
    if (!activeLeagueId || activeLeagueId === "default") {
      setLeaguePrizes(initialPrizes);
      return;
    }

    setIsLoadingPrizes(true);

    try {
      const prizesFromSupabase = await getLeaguePrizes(activeLeagueId);

      if (prizesFromSupabase.length > 0) {
        setLeaguePrizes(prizesFromSupabase);
        return;
      }

      setLeaguePrizes(initialPrizes);
    } catch (error) {
      console.error("Error cargando premios de la liga:", error);
      setLeaguePrizes(initialPrizes);
    } finally {
      setIsLoadingPrizes(false);
    }
  }

  async function loadLeagueMatches() {
    if (!activeLeagueId || activeLeagueId === "default") {
      const localMatches = getStorageItem(
        matchesStorageKey,
        cleanBaseMatches(initialMatches),
      );

      setMatchesByLeague((prevMatchesByLeague) => ({
        ...prevMatchesByLeague,
        [activeLeagueId]: localMatches,
      }));

      return;
    }

    setIsLoadingMatches(true);

    try {
      const supabaseMatches = await getLeagueMatches(activeLeagueId);

      const userPredictions = await getUserPredictions({
        leagueId: activeLeagueId,
        userId: user.uid,
      });

      if (supabaseMatches.length > 0) {
        const matchesWithPredictions = applyUserPredictionsToMatches(
          supabaseMatches,
          userPredictions,
        );

        setMatchesByLeague((prevMatchesByLeague) => ({
          ...prevMatchesByLeague,
          [activeLeagueId]: matchesWithPredictions,
        }));

        setStorageItem(matchesStorageKey, matchesWithPredictions);
        return;
      }

      const localMatches = getStorageItem(
        matchesStorageKey,
        cleanBaseMatches(initialMatches),
      );

      const localMatchesWithPredictions = applyUserPredictionsToMatches(
        localMatches,
        userPredictions,
      );

      setMatchesByLeague((prevMatchesByLeague) => ({
        ...prevMatchesByLeague,
        [activeLeagueId]: localMatchesWithPredictions,
      }));
    } catch (error) {
      console.error("Error cargando partidos desde Supabase:", error);

      const localMatches = getStorageItem(
        matchesStorageKey,
        cleanBaseMatches(initialMatches),
      );

      setMatchesByLeague((prevMatchesByLeague) => ({
        ...prevMatchesByLeague,
        [activeLeagueId]: localMatches,
      }));
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
      loadLeaguePrizes();
      loadLeagueMembers();
      setActiveMatchFilter("all");
      setMatchSearchTerm("");
    });
  }, [activeLeagueId, user?.uid]);

  useEffect(() => {
    queueMicrotask(() => {
      loadUserProfiles();
    });
  }, [activeLeagueId, safeLeagueMembers.length]);

  async function handleJoinLeague({ leagueCode }) {
    if (!user?.uid) {
      throw new Error("USER_NOT_AUTHENTICATED");
    }

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
    const league = await getLeagueByCode(leagueCode);
    return league;
  }

  async function handleCreateLeague({ name, code, entryFee, prizeMode }) {
    if (!user?.uid) {
      throw new Error("USER_NOT_AUTHENTICATED");
    }

    const league = await createLeague({
      name,
      code,
      ownerId: user.uid,
      ownerDisplayName: user.displayName,
      ownerEmail: user.email,
      entryFee,
      prizeMode,
    });

    onUpdateUser({
      leagueCode: league.code,
      activeLeagueId: league.id,
      leagueName: league.name,
    });

    setIsCreateLeagueModalOpen(false);

    await loadUserLeagues();
    await loadUserProfiles();
    await loadLeagueMembers();
  }

  async function handleSeedSupabaseMatches() {
    if (!isLeagueOwner) {
      alert("Solo el administrador puede cargar partidos.");
      return;
    }

    if (!activeLeagueId || activeLeagueId === "default") {
      alert("Primero selecciona o crea una liga.");
      return;
    }

    const confirmSeed = window.confirm(
      "Esto cargará los partidos base en Supabase para esta liga. No borra pronósticos ni resultados existentes. ¿Continuar?",
    );

    if (!confirmSeed) {
      return;
    }

    try {
      const baseMatches = cleanBaseMatches(initialMatches);

      const savedMatches = await saveSupabaseLeagueMatches({
        leagueId: activeLeagueId,
        matches: baseMatches,
      });

      setMatchesByLeague((prevMatchesByLeague) => ({
        ...prevMatchesByLeague,
        [activeLeagueId]: savedMatches,
      }));

      setStorageItem(matchesStorageKey, savedMatches);

      alert(`Partidos cargados correctamente: ${savedMatches.length}`);
    } catch (error) {
      console.error("Error cargando partidos base en Supabase:", error);
      alert(error.message || "No se pudieron cargar los partidos base.");
    }
  }

  async function handleSyncFootballDataMatches() {
    if (isSyncingFootballData) {
      return;
    }

    if (!isLeagueOwner) {
      alert("Solo el administrador puede sincronizar partidos.");
      return;
    }

    if (!activeLeagueId || activeLeagueId === "default") {
      alert("Primero selecciona o crea una liga.");
      return;
    }

    const lastSyncKey = `last-football-data-sync-${activeLeagueId}`;
    const lastSyncAt = Number(localStorage.getItem(lastSyncKey) || 0);
    const now = Date.now();
    const tenMinutes = 10 * 60 * 1000;

    if (lastSyncAt && now - lastSyncAt < tenMinutes) {
      const remainingMinutes = Math.ceil(
        (tenMinutes - (now - lastSyncAt)) / 60000,
      );

      alert(
        `Para proteger la cuota de la API, espera ${remainingMinutes} minuto(s) antes de volver a sincronizar.`,
      );

      return;
    }

    setIsSyncingFootballData(true);

    try {
      const result = await syncFootballDataMatches({
        leagueId: activeLeagueId,
      });

      localStorage.setItem(lastSyncKey, String(Date.now()));

      await loadLeagueMatches();
      await loadLeaguePredictions();

      if (result.total === 0) {
        alert(
          "La API respondió correctamente, pero aún no encontró partidos 2026.",
        );
        return;
      }

      alert(
        result.message ||
          `Sincronización completada:\n${result.total} partidos encontrados.\n${result.finishedMatches || 0} resultados oficiales actualizados.`,
      );
    } catch (error) {
      console.error("Error sincronizando football-data:", error);
      alert(
        error.message ||
          "No se pudieron sincronizar los partidos desde la API.",
      );
    } finally {
      setIsSyncingFootballData(false);
    }
  }

  async function handleSavePrizes(prizesToSave) {
    if (!isLeagueOwner) {
      alert("Solo el administrador puede editar premios.");
      return;
    }

    if (!activeLeagueId || activeLeagueId === "default") {
      alert("Primero selecciona o crea una liga.");
      return;
    }

    try {
      await saveLeaguePrizes({
        leagueId: activeLeagueId,
        prizes: prizesToSave,
      });

      await loadLeaguePrizes();
    } catch (error) {
      console.error("Error guardando premios:", error);
      alert("No se pudieron guardar los premios.");
    }
  }

  async function handleSavePrizeSettings({ entryFee, prizeMode }) {
    if (!isLeagueOwner) {
      alert("Solo el administrador puede editar reglas de premio.");
      return;
    }

    if (!activeLeagueId || activeLeagueId === "default") {
      alert("Primero selecciona o crea una liga.");
      return;
    }

    try {
      await updateLeaguePrizeSettings({
        leagueId: activeLeagueId,
        entryFee,
        prizeMode,
      });

      await loadUserLeagues();
      await loadLeagueMembers();
      await loadLeaguePrizes();

      alert("Reglas de premio actualizadas correctamente.");
    } catch (error) {
      console.error("Error guardando reglas de premio:", error);
      alert("No se pudieron guardar las reglas de premio.");
    }
  }

  function handleSelectLeague(league) {
    onUpdateUser({
      leagueCode: league.code,
      activeLeagueId: league.id,
      leagueName: league.name,
    });

    setActiveSection("home");
  }

  async function handleSavePrediction(matchId, prediction) {
    if (!user?.uid) {
      alert("Debes iniciar sesión para guardar pronósticos.");
      return;
    }

    if (!hasActiveLeague) {
      alert("Primero debes unirte a una liga.");
      return;
    }

    const predictionScores = getPredictionScores(prediction);

    if (!predictionScores) {
      alert("Captura un marcador válido.");
      return;
    }

    setMatchesByLeague((prevMatchesByLeague) => {
      const currentMatches =
        prevMatchesByLeague[activeLeagueId] ??
        getStorageItem(matchesStorageKey, cleanBaseMatches(initialMatches));

      const updatedMatches = currentMatches.map((match) => {
        if (match.id !== matchId) {
          return match;
        }

        return {
          ...match,
          userPrediction: predictionScores,
        };
      });

      setStorageItem(matchesStorageKey, updatedMatches);

      return {
        ...prevMatchesByLeague,
        [activeLeagueId]: updatedMatches,
      };
    });

    try {
      await savePrediction({
        leagueId: activeLeagueId,
        matchId,
        userId: user.uid,
        homeScore: predictionScores.homeScore,
        awayScore: predictionScores.awayScore,
      });

      await loadLeagueMatches();
      await loadLeaguePredictions();
      await loadUserProfiles();
    } catch (error) {
      console.error("Error guardando predicción en Supabase:", error);
      alert(
        "Tu pronóstico no pudo sincronizarse correctamente. Intenta nuevamente.",
      );
    }
  }

  async function handleSaveResult(matchId, result) {
    if (!isLeagueOwner) {
      alert("Solo el administrador puede actualizar resultados.");
      return;
    }

    setMatchesByLeague((prevMatchesByLeague) => {
      const currentMatches =
        prevMatchesByLeague[activeLeagueId] ??
        getStorageItem(matchesStorageKey, cleanBaseMatches(initialMatches));

      const updatedMatches = currentMatches.map((match) => {
        if (match.id !== matchId) {
          return match;
        }

        return {
          ...match,
          result,
        };
      });

      setStorageItem(matchesStorageKey, updatedMatches);

      return {
        ...prevMatchesByLeague,
        [activeLeagueId]: updatedMatches,
      };
    });

    if (!activeLeagueId || activeLeagueId === "default") {
      return;
    }

    try {
      await updateMatchResult({
        leagueId: activeLeagueId,
        matchId,
        result,
      });

      await loadLeagueMatches();
      await loadLeaguePredictions();
    } catch (error) {
      console.error("Error guardando resultado en Supabase:", error);
      alert(
        "El resultado no pudo sincronizarse correctamente. Intenta nuevamente.",
      );
    }
  }

  async function handleClearResult(matchId) {
    if (!isLeagueOwner) {
      alert("Solo el administrador puede quitar resultados.");
      return;
    }

    setMatchesByLeague((prevMatchesByLeague) => {
      const currentMatches =
        prevMatchesByLeague[activeLeagueId] ??
        getStorageItem(matchesStorageKey, cleanBaseMatches(initialMatches));

      const updatedMatches = currentMatches.map((match) => {
        if (match.id !== matchId) {
          return match;
        }

        return {
          ...match,
          result: null,
        };
      });

      setStorageItem(matchesStorageKey, updatedMatches);

      return {
        ...prevMatchesByLeague,
        [activeLeagueId]: updatedMatches,
      };
    });

    if (!activeLeagueId || activeLeagueId === "default") {
      return;
    }

    try {
      await updateMatchResult({
        leagueId: activeLeagueId,
        matchId,
        result: null,
      });

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
                <PrizePreviewCard
                  prizes={leaguePrizes}
                  participantCount={totalLeagueMembers}
                  entryFee={activeLeague?.entryFee || 200}
                  prizeMode={activeLeague?.prizeMode || "fixed"}
                  ranking={ranking}
                  onOpenPrizes={() => setActiveSection("prizes")}
                />

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
                                  100,
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
                                      100,
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

                      <select
                        value={safeActiveStandingsGroup}
                        onChange={(event) =>
                          setActiveStandingsGroup(event.target.value)
                        }
                        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-black text-slate-700 outline-none focus:border-emerald-400"
                      >
                        {standingsGroupLabels.map((groupLabel) => (
                          <option key={groupLabel} value={groupLabel}>
                            {groupLabel}
                          </option>
                        ))}
                      </select>
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

                      <div className="flex flex-col gap-2 sm:items-end">
                        <select
                          value={safeActivePredictionsGroup}
                          onChange={(event) =>
                            setActivePredictionsGroup(event.target.value)
                          }
                          className="rounded-2xl border border-white/10 bg-white px-4 py-2.5 text-sm font-black text-slate-950 outline-none"
                        >
                          {standingsGroupLabels.map((groupLabel) => (
                            <option key={groupLabel} value={groupLabel}>
                              {groupLabel}
                            </option>
                          ))}
                        </select>

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
              <PredictionHistoryCard matches={visibleMatches} />
            )}
          </>
        )}

        {activeSection === "compare" && (
          <>
            {!hasActiveLeague ? (
              <EmptyLeagueState
                onJoinLeague={() => setIsJoinLeagueModalOpen(true)}
                onCreateLeague={() => setIsCreateLeagueModalOpen(true)}
              />
            ) : (
              <UserComparisonCard
                users={comparisonUsers}
                matches={visibleMatches}
              />
            )}
          </>
        )}

        {activeSection === "prizes" && (
          <>
            {!hasActiveLeague ? (
              <EmptyLeagueState
                onJoinLeague={() => setIsJoinLeagueModalOpen(true)}
                onCreateLeague={() => setIsCreateLeagueModalOpen(true)}
              />
            ) : (
              <div className="space-y-4">
                {isLoadingPrizes && (
                  <section className="rounded-[2rem] border border-slate-200 bg-white/80 p-5 text-center shadow-sm">
                    <p className="text-sm font-black text-emerald-700">
                      Cargando premios de la liga...
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Cargando la información de premios para esta liga.
                    </p>
                  </section>
                )}

                <PrizesCard
                  prizes={leaguePrizes}
                  participantCount={totalLeagueMembers}
                  entryFee={activeLeague?.entryFee || 200}
                  useDynamicPrize={
                    activeLeague?.prizeMode === "winner_takes_all"
                  }
                  ranking={ranking}
                />
              </div>
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
              matches={visibleMatches}
              members={safeLeagueMembers}
              entryFee={activeLeague?.entryFee || 0}
              prizeMode={activeLeague?.prizeMode || "fixed"}
              isSyncingFootballData={isSyncingFootballData}
              onOpenResultModal={() => setIsResultModalOpen(true)}
              onOpenCreateLeagueModal={() => setIsCreateLeagueModalOpen(true)}
              onOpenPrizeEditorModal={() => setIsPrizeEditorModalOpen(true)}
              onOpenPrizeSettingsModal={() => setIsPrizeSettingsModalOpen(true)}
              onSyncFootballDataMatches={handleSyncFootballDataMatches}
              onSeedSupabaseMatches={handleSeedSupabaseMatches}
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

              <p>Los pronósticos se bloquean cuando inicia el partido.</p>
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

      <PrizeEditorModal
        key={`${activeLeagueId}-${isPrizeEditorModalOpen ? "open" : "closed"}`}
        isOpen={isPrizeEditorModalOpen}
        onClose={() => setIsPrizeEditorModalOpen(false)}
        prizes={leaguePrizes}
        onSavePrizes={handleSavePrizes}
      />

      <LeaguePrizeSettingsModal
        key={`${activeLeagueId}-${activeLeague?.entryFee}-${activeLeague?.prizeMode}`}
        isOpen={isPrizeSettingsModalOpen}
        onClose={() => setIsPrizeSettingsModalOpen(false)}
        entryFee={activeLeague?.entryFee || 200}
        prizeMode={activeLeague?.prizeMode || "fixed"}
        onSaveSettings={handleSavePrizeSettings}
      />
    </div>
  );
}

export default DashboardMock;
