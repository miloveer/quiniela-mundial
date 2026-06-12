import { useState } from "react";
import {
  Check,
  Clock,
  Lock,
  MapPin,
  PencilLine,
  Trophy,
  X,
} from "lucide-react";
import {
  formatMatchDate,
  getLockMessage,
  isPredictionLocked,
} from "../utils/matchUtils";
import { calculatePredictionPoints } from "../utils/scoreUtils";
import { getTeamDisplayName, getTeamFlag } from "../utils/teamUtils";

function getMatchStatus({ hasPrediction, hasResult, isLocked, lockMessage }) {
  if (hasResult) {
    return {
      label: "Finalizado",
      classes: "bg-slate-950 text-white",
      icon: Trophy,
      message: "Resultado oficial cargado",
    };
  }

  if (isLocked) {
    return {
      label: "Cerrado",
      classes: "bg-rose-50 text-rose-600",
      icon: Lock,
      message: lockMessage,
    };
  }

  if (hasPrediction) {
    return {
      label: "Pronosticado",
      classes: "bg-violet-50 text-violet-700",
      icon: Check,
      message: "Puedes editar antes de que inicie",
    };
  }

  return {
    label: "Editable",
    classes: "bg-emerald-50 text-emerald-700",
    icon: PencilLine,
    message: "Disponible para capturar",
  };
}

function MatchCard({ match, onSavePrediction }) {
  const hasPrediction = Boolean(match.userPrediction);
  const hasResult = Boolean(match.result);
  const isLocked = match.isLocked || isPredictionLocked(match.date);
  const lockMessage = getLockMessage(match.date);
  const points = calculatePredictionPoints(match.userPrediction, match.result);
  const homeTeamFlag = getTeamFlag(match.homeTeam);
  const awayTeamFlag = getTeamFlag(match.awayTeam);
  const homeTeamName = getTeamDisplayName(match.homeTeam);
  const awayTeamName = getTeamDisplayName(match.awayTeam);

  const status = getMatchStatus({
    hasPrediction,
    hasResult,
    isLocked,
    lockMessage,
  });

  const StatusIcon = status.icon;

  const [isEditing, setIsEditing] = useState(false);
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");

  function handleStartEditing() {
    if (isLocked || hasResult) {
      alert(
        hasResult
          ? "Este partido ya tiene resultado oficial."
          : "Este partido ya está bloqueado.",
      );
      return;
    }

    setHomeScore(match.userPrediction?.homeScore ?? "");
    setAwayScore(match.userPrediction?.awayScore ?? "");
    setIsEditing(true);
  }

  function handleCancelEditing() {
    setHomeScore("");
    setAwayScore("");
    setIsEditing(false);
  }

  function handleSavePrediction() {
    if (isLocked || hasResult) {
      alert(
        hasResult
          ? "Este partido ya tiene resultado oficial."
          : "Este partido ya está bloqueado.",
      );
      setIsEditing(false);
      return;
    }

    if (homeScore === "" || awayScore === "") {
      alert("Debes capturar ambos marcadores.");
      return;
    }

    const parsedHomeScore = Number(homeScore);
    const parsedAwayScore = Number(awayScore);

    if (
      Number.isNaN(parsedHomeScore) ||
      Number.isNaN(parsedAwayScore) ||
      parsedHomeScore < 0 ||
      parsedAwayScore < 0
    ) {
      alert("Los marcadores deben ser números válidos mayores o iguales a 0.");
      return;
    }

    onSavePrediction(match.id, {
      homeScore: parsedHomeScore,
      awayScore: parsedAwayScore,
    });

    setIsEditing(false);
    setHomeScore("");
    setAwayScore("");
  }

  const cardClasses = hasResult
    ? "border-slate-950 bg-white"
    : hasPrediction
      ? "border-emerald-300 bg-emerald-50/40"
      : isLocked
        ? "border-rose-200 bg-rose-50/30"
        : "border-slate-200 bg-white";
  return (
    <article
      className={`rounded-[1.5rem] border border-slate-200 bg-white p-3 shadow-sm transition hover:shadow-lg sm:rounded-[1.8rem] sm:p-4 ${cardClasses}`}
    >
      <div className="mb-3 flex items-center justify-between rounded-2xl bg-white/80 px-3 py-2">
        <p className="text-xs font-black uppercase tracking-wider text-slate-500">
          {hasResult
            ? "Partido finalizado"
            : hasPrediction
              ? "Ya llenaste este partido"
              : isLocked
                ? "Partido cerrado"
                : "Pendiente por llenar"}
        </p>

        {hasPrediction && !hasResult && (
          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-black text-emerald-700">
            LISTO
          </span>
        )}
      </div>
      <div className="mb-3 flex flex-col gap-3 sm:mb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400 sm:text-xs">
            <Clock size={14} />
            {formatMatchDate(match.date)}
          </p>

          <p className="mt-1 flex min-w-0 items-center gap-1.5 text-[11px] font-semibold text-slate-400 sm:text-xs">
            <MapPin size={14} />
            <span className="truncate">{match.stadium}</span>
          </p>
        </div>

        <span
          className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black ${status.classes}`}
        >
          <StatusIcon size={14} />
          {status.label}
        </span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-2 sm:gap-3">
        <div className="space-y-1">
          <p className="text-2xl">{homeTeamFlag}</p>
          <p className="break-words text-sm font-black leading-tight text-slate-950 sm:text-base">
            {homeTeamName}
          </p>
        </div>

        <div className="flex items-center justify-center text-[11px] font-black text-slate-400">
          VS
        </div>

        <div className="space-y-1">
          <p className="text-2xl">{awayTeamFlag}</p>
          <p className="break-words text-sm font-black leading-tight text-slate-950 sm:text-base">
            {match.awayTeam}
          </p>
        </div>
      </div>

      <p className="mt-3 rounded-2xl bg-slate-50 p-3 text-xs font-bold leading-5 text-slate-500">
        {status.message}
      </p>

      {hasResult && (
        <div className="mt-3 rounded-2xl bg-slate-950 p-3 text-white">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-slate-400">
                Resultado oficial
              </p>

              <p className="mt-1 text-2xl font-black">
                {match.result.homeScore} - {match.result.awayScore}
              </p>
            </div>

            {hasPrediction && (
              <div className="rounded-2xl bg-white/10 px-3 py-2 text-right">
                <p className="text-xs font-bold text-slate-400">Tus puntos</p>
                <p className="text-xl font-black text-emerald-300">+{points}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-3 rounded-2xl bg-slate-50 p-3 sm:mt-4">
        {isEditing ? (
          <div>
            <p className="mb-3 text-xs font-bold text-slate-400">
              Captura tu marcador
            </p>

            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-3">
              <label className="block">
                <span className="mb-1 block truncate text-center text-[11px] font-black text-slate-400">
                  {homeTeamName}
                </span>

                <input
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={homeScore}
                  onChange={(event) => setHomeScore(event.target.value)}
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-3 text-center text-2xl font-black text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 sm:h-16 sm:text-3xl"
                  placeholder="0"
                />
              </label>

              <span className="pt-5 text-sm font-black text-slate-400">-</span>

              <label className="block">
                <span className="mb-1 block truncate text-center text-[11px] font-black text-slate-400">
                  {awayTeamName}
                </span>

                <input
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={awayScore}
                  onChange={(event) => setAwayScore(event.target.value)}
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-3 text-center text-2xl font-black text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 sm:h-16 sm:text-3xl"
                  placeholder="0"
                />
              </label>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleCancelEditing}
                className="flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-3 text-xs font-black text-slate-700 transition hover:bg-slate-50"
              >
                <X size={16} />
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleSavePrediction}
                className="flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-3 py-3 text-xs font-black text-white transition hover:bg-emerald-700"
              >
                <Check size={16} />
                Guardar
              </button>
            </div>
          </div>
        ) : hasPrediction ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400">Tu marcador</p>

              <p className="text-2xl font-black text-slate-950">
                {match.userPrediction.homeScore} -{" "}
                {match.userPrediction.awayScore}
              </p>

              {hasResult && (
                <p className="mt-1 text-xs font-black text-emerald-700">
                  +{points} pts
                </p>
              )}
            </div>

            <button
              type="button"
              disabled={isLocked || hasResult}
              onClick={handleStartEditing}
              className={`flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-xs font-black sm:w-auto ${
                isLocked || hasResult
                  ? "cursor-not-allowed bg-slate-200 text-slate-400"
                  : "bg-emerald-600 text-white hover:bg-emerald-700"
              }`}
            >
              {isLocked || hasResult ? (
                <Lock size={16} />
              ) : (
                <PencilLine size={16} />
              )}
              {isLocked || hasResult ? "Cerrado" : "Editar"}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400">Pendiente</p>

              <p className="text-sm font-bold text-slate-700">
                Aún no capturas este partido
              </p>
            </div>

            <button
              type="button"
              disabled={isLocked || hasResult}
              onClick={handleStartEditing}
              className={`min-h-11 w-full rounded-2xl px-4 py-3 text-xs font-black sm:w-auto ${
                isLocked || hasResult
                  ? "cursor-not-allowed bg-slate-200 text-slate-400"
                  : "bg-slate-950 text-white hover:bg-slate-800"
              }`}
            >
              {isLocked || hasResult ? "Cerrado" : "Llenar"}
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

export default MatchCard;
