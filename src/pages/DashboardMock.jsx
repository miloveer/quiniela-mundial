import { useEffect, useMemo, useState } from 'react';
import { KeyRound, Plus, UsersRound } from 'lucide-react';

import Header from '../components/Header';
import AppNavigation from '../components/AppNavigation';
import DashboardSummary from '../components/DashboardSummary';
import StageTabs from '../components/StageTabs';
import MatchCard from '../components/MatchCard';
import MatchFilters from '../components/MatchFilters';
import RankingCard from '../components/RankingCard';
import JoinLeagueModal from '../components/JoinLeagueModal';
import PendingMatchesCard from '../components/PendingMatchesCard';
import PredictionHistoryCard from '../components/PredictionHistoryCard';
import UserComparisonCard from '../components/UserComparisonCard';
import PrizesCard from '../components/PrizesCard';
import AdminPanelCard from '../components/AdminPanelCard';
import ResultModal from '../components/ResultModal';
import CreateLeagueModal from '../components/CreateLeagueModal';
import UserLeaguesCard from '../components/UserLeaguesCard';
import PrizeEditorModal from '../components/PrizeEditorModal';
import LeaguePrizeSettingsModal from '../components/LeaguePrizeSettingsModal';
import PrizePreviewCard from '../components/PrizePreviewCard';
import StageProgressCard from '../components/StageProgressCard';
import StageStatsBanner from '../components/StageStatsBanner';
import StageRankingPreviewCard from '../components/StageRankingPreviewCard';

import { getUsersProfilesByIds } from '../services/userService';

import {
  createLeague,
  getLeagueByCode,
  getLeagueMembers,
  getUserLeagues,
  joinLeague,
  updateLeaguePrizeSettings,
} from '../services/leagueService';

import {
  getLeaguePredictions,
  getUserPredictions,
  savePrediction,
} from '../services/predictionService';

import {
  getLeagueMatches,
  seedLeagueMatches,
  updateMatchResult,
} from '../services/matchService';

import {
  getLeaguePrizes,
  saveLeaguePrizes,
} from '../services/prizeService';

import {
  matches as initialMatches,
  prizes as initialPrizes,
  stages,
  users,
} from '../data/mockData';

import {
  buildRanking,
  buildRankingFromPredictions,
  buildStageRanking,
  buildUsersFromPredictions,
  calculateExactScores,
  calculateResultHits,
  calculateTotalPoints,
  getUserRankingPosition,
} from '../utils/scoreUtils';

import {
  getLeagueMatchesStorageKey,
  getStorageItem,
  setStorageItem,
} from '../utils/storageUtils';

import {
  filterMatchesByStatus,
  getCompletedPredictions,
  getMatchFilterCounts,
  getPendingMatches,
  getPendingMatchesList,
  getStageMatches,
  sortMatchesByStatusAndDate,
} from '../utils/matchUtils';

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
      <p className="text-sm font-bold text-emerald-700">
        Empieza tu quiniela
      </p>

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

function DashboardMock({ user, onLogout, onUpdateUser }) {
  const [activeSection, setActiveSection] = useState('home');
  const [activeStageId, setActiveStageId] = useState(stages[0].id);
  const [activeMatchFilter, setActiveMatchFilter] = useState('all');

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

  const activeLeagueId = user?.activeLeagueId || user?.leagueCode || 'default';
  const hasActiveLeague = Boolean(
    user?.leagueCode && activeLeagueId !== 'default'
  );
  const matchesStorageKey = getLeagueMatchesStorageKey(activeLeagueId);

  const safeUserLeagues = Array.isArray(userLeagues) ? userLeagues : [];
  const safeLeagueMembers = Array.isArray(leagueMembers) ? leagueMembers : [];

  const activeLeague = safeUserLeagues.find(
    (league) => league.id === activeLeagueId
  );

  const activeLeagueMemberIds = activeLeague?.members || [];

  const isLeagueOwner = Boolean(
    user?.uid && activeLeague?.ownerId && user.uid === activeLeague.ownerId
  );

  const totalLeagueMembers =
    safeLeagueMembers.length > 0
      ? safeLeagueMembers.length
      : activeLeagueMemberIds.length;

  const [matchesByLeague, setMatchesByLeague] = useState(() => ({
    [activeLeagueId]: getStorageItem(
      matchesStorageKey,
      cleanBaseMatches(initialMatches)
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
    const filteredMatches = filterMatchesByStatus(
      stageMatches,
      activeMatchFilter
    );

    return sortMatchesByStatusAndDate(filteredMatches);
  }, [stageMatches, activeMatchFilter]);

  const matchFilterCounts = getMatchFilterCounts(stageMatches);

  const completedPredictions = getCompletedPredictions(visibleMatches);
  const pendingMatches = getPendingMatches(visibleMatches);
  const pendingMatchesList = sortMatchesByStatusAndDate(
    getPendingMatchesList(visibleMatches)
  );
  const totalPoints = calculateTotalPoints(visibleMatches);
  const exactScores = calculateExactScores(visibleMatches);
  const resultHits = calculateResultHits(visibleMatches);

  const currentUserName = user?.displayName || 'Invitado';

  const currentUserForRanking = {
    id: 'current-user',
    uid: user?.uid || 'current-user',
    name: currentUserName,
    badge: 'Tú',
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

  const mockUsersWithoutCurrentUser = users.filter(
    (mockUser) =>
      mockUser.name.toLowerCase() !== currentUserName.toLowerCase()
  );

  const rankingUsers = [currentUserForRanking, ...mockUsersWithoutCurrentUser];

  const memberPredictions =
    activeLeagueMemberIds.length > 0
      ? leaguePredictions.filter((prediction) =>
          activeLeagueMemberIds.includes(prediction.userId)
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
            (prediction) => prediction.userId === profileId
          );

          const predictionsMap = userPredictions.reduce(
            (accumulator, predictionDoc) => {
              return {
                ...accumulator,
                [predictionDoc.matchId]: predictionDoc.prediction,
              };
            },
            {}
          );

          return {
            id: profileId,
            uid: profileId,
            name: profile.displayName || 'Usuario',
            badge: profileId === user?.uid ? 'Tú' : 'Participante',
            predictions: predictionsMap,
          };
        })
      : rankingUsers;

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
    if (sectionId === 'admin' && !isLeagueOwner) {
      setActiveSection('home');
      return;
    }

    setActiveSection(sectionId);
  }

  function applyUserPredictionsToMatches(matchesToUpdate, userPredictions) {
    return matchesToUpdate.map((match) => {
      const prediction = userPredictions.find(
        (userPrediction) => userPrediction.matchId === match.id
      );

      if (!prediction) {
        return {
          ...match,
          userPrediction: null,
        };
      }

      return {
        ...match,
        userPrediction: prediction.prediction,
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
      setUserLeagues(leagues);
    } catch (error) {
      console.error('Error cargando ligas del usuario:', error);
      setUserLeagues([]);
    } finally {
      setIsLoadingLeagues(false);
    }
  }

  async function loadLeagueMembers() {
    if (!activeLeagueId || activeLeagueId === 'default') {
      setLeagueMembers([]);
      return;
    }

    try {
      const members = await getLeagueMembers(activeLeagueId);
      setLeagueMembers(Array.isArray(members) ? members : []);
    } catch (error) {
      console.error('Error cargando miembros de la liga:', error);
      setLeagueMembers([]);
    }
  }

  async function loadLeaguePredictions() {
    if (!activeLeagueId || activeLeagueId === 'default') {
      setLeaguePredictions([]);
      return;
    }

    try {
      const predictions = await getLeaguePredictions(activeLeagueId);
      setLeaguePredictions(predictions);
    } catch (error) {
      console.error('Error cargando predicciones de la liga:', error);
      setLeaguePredictions([]);
    }
  }

  async function loadUserProfiles() {
    if (!activeLeagueId || activeLeagueId === 'default') {
      setUserProfiles([]);
      return;
    }

    if (activeLeagueMemberIds.length === 0) {
      setUserProfiles([]);
      return;
    }

    try {
      const profiles = await getUsersProfilesByIds(activeLeagueMemberIds);
      setUserProfiles(profiles);
    } catch (error) {
      console.error('Error cargando perfiles de miembros:', error);
      setUserProfiles([]);
    }
  }

  async function loadLeaguePrizes() {
    if (!activeLeagueId || activeLeagueId === 'default') {
      setLeaguePrizes(initialPrizes);
      return;
    }

    setIsLoadingPrizes(true);

    try {
      const firestorePrizes = await getLeaguePrizes(activeLeagueId);

      if (firestorePrizes.length > 0) {
        setLeaguePrizes(firestorePrizes);
        return;
      }

      setLeaguePrizes(initialPrizes);
    } catch (error) {
      console.error('Error cargando premios de la liga:', error);
      setLeaguePrizes(initialPrizes);
    } finally {
      setIsLoadingPrizes(false);
    }
  }

  async function loadLeagueMatches() {
    if (!activeLeagueId || activeLeagueId === 'default') {
      const localMatches = getStorageItem(
        matchesStorageKey,
        cleanBaseMatches(initialMatches)
      );

      setMatchesByLeague((prevMatchesByLeague) => ({
        ...prevMatchesByLeague,
        [activeLeagueId]: localMatches,
      }));

      return;
    }

    setIsLoadingMatches(true);

    try {
      const firestoreMatches = await getLeagueMatches(activeLeagueId);

      const userPredictions = user?.uid
        ? await getUserPredictions({
            leagueId: activeLeagueId,
            userId: user.uid,
          })
        : [];

      if (firestoreMatches.length > 0) {
        const matchesWithPredictions = applyUserPredictionsToMatches(
          firestoreMatches,
          userPredictions
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
        cleanBaseMatches(initialMatches)
      );

      const localMatchesWithPredictions = applyUserPredictionsToMatches(
        localMatches,
        userPredictions
      );

      setMatchesByLeague((prevMatchesByLeague) => ({
        ...prevMatchesByLeague,
        [activeLeagueId]: localMatchesWithPredictions,
      }));
    } catch (error) {
      console.error('Error cargando partidos desde Firestore:', error);

      const localMatches = getStorageItem(
        matchesStorageKey,
        cleanBaseMatches(initialMatches)
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
    queueMicrotask(() => {
      loadUserLeagues();
    });
  }, [user?.uid]);

  useEffect(() => {
    queueMicrotask(() => {
      loadLeagueMatches();
      loadLeaguePredictions();
      loadLeaguePrizes();
      loadLeagueMembers();
      setActiveMatchFilter('all');
    });
  }, [activeLeagueId, user?.uid]);

  useEffect(() => {
    queueMicrotask(() => {
      loadUserProfiles();
    });
  }, [activeLeagueId, activeLeagueMemberIds.join('|')]);

  async function handleJoinLeague({ leagueCode }) {
    if (!user?.uid) {
      throw new Error('USER_NOT_AUTHENTICATED');
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
      throw new Error('USER_NOT_AUTHENTICATED');
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

    await loadUserLeagues();
    await loadUserProfiles();
    await loadLeagueMembers();
  }

  async function handleLoadBaseSchedule() {
    if (!isLeagueOwner) {
      alert('Solo el administrador puede cargar partidos.');
      return;
    }

    if (!activeLeagueId || activeLeagueId === 'default') {
      alert('Primero selecciona o crea una liga.');
      return;
    }

    try {
      await seedLeagueMatches({
        leagueId: activeLeagueId,
        matches: cleanBaseMatches(matches),
      });

      await loadLeagueMatches();
      await loadLeaguePredictions();

      alert('Partidos del Mundial cargados correctamente.');
    } catch (error) {
      console.error('Error cargando calendario base:', error);
      alert(
        'No se pudieron cargar los partidos del Mundial. Intenta nuevamente.'
      );
    }
  }

  async function handleSavePrizes(prizesToSave) {
    if (!isLeagueOwner) {
      alert('Solo el administrador puede editar premios.');
      return;
    }

    if (!activeLeagueId || activeLeagueId === 'default') {
      alert('Primero selecciona o crea una liga.');
      return;
    }

    try {
      await saveLeaguePrizes({
        leagueId: activeLeagueId,
        prizes: prizesToSave,
      });

      await loadLeaguePrizes();
    } catch (error) {
      console.error('Error guardando premios:', error);
      alert('No se pudieron guardar los premios.');
    }
  }

  async function handleSavePrizeSettings({ entryFee, prizeMode }) {
    if (!isLeagueOwner) {
      alert('Solo el administrador puede editar reglas de premio.');
      return;
    }

    if (!activeLeagueId || activeLeagueId === 'default') {
      alert('Primero selecciona o crea una liga.');
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

      alert('Reglas de premio actualizadas correctamente.');
    } catch (error) {
      console.error('Error guardando reglas de premio:', error);
      alert('No se pudieron guardar las reglas de premio.');
    }
  }

  function handleSelectLeague(league) {
    onUpdateUser({
      leagueCode: league.code,
      activeLeagueId: league.id,
      leagueName: league.name,
    });

    setActiveSection('home');
  }

  async function handleSavePrediction(matchId, prediction) {
    if (!user?.uid) {
      alert('Debes iniciar sesión para guardar pronósticos.');
      return;
    }

    if (!hasActiveLeague) {
      alert('Primero debes unirte a una liga.');
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
          userPrediction: prediction,
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
        userId: user.uid,
        matchId,
        prediction,
      });

      await loadLeaguePredictions();
      await loadUserProfiles();
    } catch (error) {
      console.error('Error guardando predicción en Firestore:', error);
      alert(
        'Tu pronóstico no pudo sincronizarse correctamente. Intenta nuevamente.'
      );
    }
  }

  async function handleSaveResult(matchId, result) {
    if (!isLeagueOwner) {
      alert('Solo el administrador puede actualizar resultados.');
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

    if (!activeLeagueId || activeLeagueId === 'default') {
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
      console.error('Error guardando resultado en Firestore:', error);
      alert(
        'El resultado no pudo sincronizarse correctamente. Intenta nuevamente.'
      );
    }
  }

  async function handleClearResult(matchId) {
    if (!isLeagueOwner) {
      alert('Solo el administrador puede quitar resultados.');
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

    if (!activeLeagueId || activeLeagueId === 'default') {
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

      alert('Resultado quitado correctamente.');
    } catch (error) {
      console.error('Error quitando resultado:', error);
      alert('No se pudo quitar el resultado.');
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
        {activeSection === 'home' && (
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
                        : 'Aún no estás en una liga'}
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      {user?.leagueCode
                        ? `Código: ${user.leagueCode.toUpperCase()}`
                        : 'Puedes explorar el dashboard y unirte cuando tengas un código de invitación.'}
                    </p>

                    {user?.leagueCode && (
                      <p className="mt-1 text-xs font-bold text-slate-400">
                        {isLeagueOwner
                          ? 'Tienes permisos para administrar partidos y resultados.'
                          : 'Puedes capturar pronósticos y consultar rankings.'}
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
                          ? 'bg-slate-950 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {isLeagueOwner ? 'Administrador' : 'Participante'}
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
                  prizeMode={activeLeague?.prizeMode || 'fixed'}
                  ranking={ranking}
                  onOpenPrizes={() => setActiveSection('prizes')}
                />

                <PendingMatchesCard
                  pendingMatches={pendingMatchesList}
                  onSelectStage={(stageId) => {
                    setActiveStageId(stageId);
                    setActiveSection('matches');
                  }}
                />

                <StageProgressCard
                  stages={stages}
                  matches={visibleMatches}
                  onSelectStage={(stageId) => {
                    setActiveStageId(stageId);
                    setActiveSection('matches');
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
                    setActiveSection('ranking');
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

        {activeSection === 'matches' && (
          <>
            {!hasActiveLeague ? (
              <EmptyLeagueState
                onJoinLeague={() => setIsJoinLeagueModalOpen(true)}
                onCreateLeague={() => setIsCreateLeagueModalOpen(true)}
              />
            ) : (
              <section className="space-y-4">
                <div className="rounded-[2rem] border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur">
                  <div className="mb-4">
                    <p className="text-sm font-bold text-emerald-700">
                      Navegación por etapas
                    </p>

                    <h2 className="text-2xl font-black text-slate-950">
                      {activeStage?.fullName}
                    </h2>
                  </div>

                  <StageTabs
                    stages={stages}
                    activeStageId={activeStageId}
                    onChangeStage={setActiveStageId}
                  />
                </div>

                <StageStatsBanner stage={activeStage} matches={stageMatches} />

                <div className="rounded-[2rem] border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur">
                  <div className="mb-4">
                    <p className="text-sm font-bold text-emerald-700">
                      Filtros rápidos
                    </p>

                    <h2 className="text-2xl font-black text-slate-950">
                      Estado de pronósticos
                    </h2>
                  </div>

                  <MatchFilters
                    activeFilter={activeMatchFilter}
                    onChangeFilter={setActiveMatchFilter}
                    counts={matchFilterCounts}
                  />
                </div>

                {isLoadingMatches && (
                  <section className="rounded-[2rem] border border-slate-200 bg-white/80 p-5 text-center shadow-sm">
                    <p className="text-sm font-black text-emerald-700">
                      Cargando partidos de la liga...
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Preparando la información de tu liga.
                    </p>
                  </section>
                )}

                <section className="grid gap-3 md:grid-cols-2">
                  {!isLoadingMatches &&
                    filteredStageMatches.map((match) => (
                      <MatchCard
                        key={match.id}
                        match={match}
                        onSavePrediction={handleSavePrediction}
                      />
                    ))}
                </section>

                {!isLoadingMatches && filteredStageMatches.length === 0 && (
                  <section className="rounded-[2rem] border border-dashed border-slate-300 bg-white/70 p-6 text-center">
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

        {activeSection === 'ranking' && (
          <>
            {!hasActiveLeague ? (
              <EmptyLeagueState
                onJoinLeague={() => setIsJoinLeagueModalOpen(true)}
                onCreateLeague={() => setIsCreateLeagueModalOpen(true)}
              />
            ) : (
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
            )}
          </>
        )}

        {activeSection === 'history' && (
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

        {activeSection === 'compare' && (
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

        {activeSection === 'prizes' && (
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
                    activeLeague?.prizeMode === 'winner_takes_all'
                  }
                  ranking={ranking}
                />
              </div>
            )}
          </>
        )}

        {activeSection === 'admin' && isLeagueOwner && (
          <div className="space-y-4">
            <section className="rounded-[1.5rem] border border-white/70 bg-white/80 p-4 shadow-xl shadow-slate-200/70 backdrop-blur sm:rounded-[2rem] sm:p-5">
              <p className="text-sm font-bold text-emerald-700">
                Administración
              </p>

              <h2 className="mt-1 text-3xl font-black tracking-tight text-slate-950">
                Panel de {user?.leagueName || user?.leagueCode || 'liga'}
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
              prizeMode={activeLeague?.prizeMode || 'fixed'}
              onOpenResultModal={() => setIsResultModalOpen(true)}
              onOpenCreateLeagueModal={() => setIsCreateLeagueModalOpen(true)}
              onOpenPrizeEditorModal={() => setIsPrizeEditorModalOpen(true)}
              onOpenPrizeSettingsModal={() => setIsPrizeSettingsModalOpen(true)}
              onSeedMatches={handleLoadBaseSchedule}
            />
          </div>
        )}

        {activeSection === 'admin' && !isLeagueOwner && (
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
              onClick={() => setActiveSection('home')}
              className="mt-5 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800"
            >
              Volver al inicio
            </button>
          </section>
        )}

        {hasActiveLeague && (
          <section className="mt-4 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm sm:rounded-[2rem] sm:p-5">
            <p className="text-sm font-bold text-emerald-700">
              Reglas rápidas
            </p>

            <h2 className="mt-1 text-xl font-black text-slate-950 sm:text-2xl">
              Puntuación
            </h2>

            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <p>
                <strong className="text-slate-950">+1 punto</strong> si
                aciertas ganador o empate.
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
        key={`${activeLeagueId}-${isPrizeEditorModalOpen ? 'open' : 'closed'}`}
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
        prizeMode={activeLeague?.prizeMode || 'fixed'}
        onSaveSettings={handleSavePrizeSettings}
      />
    </div>
  );
}

export default DashboardMock;