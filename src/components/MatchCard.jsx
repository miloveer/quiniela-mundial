import { useState } from "react";
import { Check, Clock, Eye, Lock, MapPin, PencilLine, Trophy, X } from "lucide-react";
import { formatMatchDate, getLockMessage, isPredictionLocked, isKnockoutStage } from "../utils/matchUtils";
import { calculatePredictionPoints } from "../utils/scoreUtils";
import { getTeamDisplayName } from "../utils/teamUtils";
import TeamFlag from "./TeamFlag";

function getMatchStatus({ hasPrediction, hasResult, isLocked, lockMessage }) {
  if (hasResult) return { label: "Finalizado", classes: "bg-slate-950 text-white", icon: Trophy, message: "Resultado oficial cargado" };
  if (isLocked) return { label: "Cerrado", classes: "bg-rose-50 text-rose-600", icon: Lock, message: lockMessage };
  if (hasPrediction) return { label: "Pronosticado", classes: "bg-violet-50 text-violet-700", icon: Check, message: "Puedes editar antes de que inicie" };
  return { label: "Editable", classes: "bg-emerald-50 text-emerald-700", icon: PencilLine, message: "Disponible para capturar" };
}

function MatchCard({ match, users = [], allPredictions = [], onSavePrediction, compact = false }) {
  const knockout = isKnockoutStage(match.stageId);
  const hasPrediction = Boolean(match.userPrediction);
  const hasResult = Boolean(match.result);
  const isLocked = match.isLocked || isPredictionLocked(match.date);
  const lockMessage = getLockMessage(match.date);
  const points = calculatePredictionPoints(match.userPrediction, match.result, { isKnockoutStage: knockout });
  const homeTeamName = getTeamDisplayName(match.homeTeam);
  const awayTeamName = getTeamDisplayName(match.awayTeam);

  const status = getMatchStatus({ hasPrediction, hasResult, isLocked, lockMessage });
  const StatusIcon = status.icon;

  const [isEditing, setIsEditing] = useState(false);
  const [showAllPredictions, setShowAllPredictions] = useState(false);
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");
  const [advancesTeam, setAdvancesTeam] = useState("");

  const isDraftDraw =
    homeScore !== "" && awayScore !== "" && Number(homeScore) === Number(awayScore);

  function handleStartEditing() {
    if (isLocked || hasResult) {
      alert(hasResult ? "Este partido ya tiene resultado oficial." : "Este partido ya está bloqueado.");
      return;
    }
    setHomeScore(match.userPrediction?.homeScore ?? "");
    setAwayScore(match.userPrediction?.awayScore ?? "");
    setAdvancesTeam(match.userPrediction?.advancesTeam ?? "");
    setIsEditing(true);
  }

  function handleCancelEditing() {
    setHomeScore("");
    setAwayScore("");
    setAdvancesTeam("");
    setIsEditing(false);
  }

  function handleSavePrediction() {
    if (isLocked || hasResult) {
      alert(hasResult ? "Partido oficializado." : "Partido bloqueado.");
      setIsEditing(false);
      return;
    }
    if (homeScore === "" || awayScore === "") {
      alert("Captura ambos marcadores.");
      return;
    }
    const parsedHomeScore = Number(homeScore);
    const parsedAwayScore = Number(awayScore);
    if (Number.isNaN(parsedHomeScore) || Number.isNaN(parsedAwayScore) || parsedHomeScore < 0 || parsedAwayScore < 0) {
      alert("Marcadores inválidos.");
      return;
    }

    const isDraw = parsedHomeScore === parsedAwayScore;
    if (knockout && isDraw && !advancesTeam) {
      alert("Es empate: selecciona quién avanza.");
      return;
    }

    onSavePrediction(match.id, {
      homeScore: parsedHomeScore,
      awayScore: parsedAwayScore,
      advancesTeam: knockout && isDraw ? advancesTeam : null,
    });
    setIsEditing(false);
    setHomeScore("");
    setAwayScore("");
    setAdvancesTeam("");
  }

  const cardClasses = hasResult ? "border-slate-950 bg-white" : hasPrediction ? "border-emerald-300 bg-emerald-50/40" : isLocked ? "border-rose-200 bg-rose-50/30" : "border-slate-200 bg-white";

  // Tamaños: ambos modos son compactos, el bracket (compact=true) es un poco más chico aún
  const paddingClasses = compact ? "p-1.5 sm:p-2" : "p-2 sm:p-2.5";
  const radiusClasses = compact ? "rounded-[1rem] sm:rounded-[1.1rem]" : "rounded-[1.2rem] sm:rounded-[1.3rem]";
  const flagWrapClasses = compact ? "h-8 w-8 sm:h-9 sm:w-9" : "h-11 w-11 sm:h-12 sm:w-12";
  const flagEmojiClasses = compact ? "text-base sm:text-lg" : "text-xl sm:text-2xl";
  const teamNameClasses = compact ? "text-[9px] sm:text-[10px]" : "text-[10px] sm:text-xs";

  const advancingTeamLabel = (team) => (team === "home" ? homeTeamName : team === "away" ? awayTeamName : null);

  return (
    <article className={`border border-slate-200 bg-white ${paddingClasses} ${radiusClasses} shadow-sm transition hover:shadow-lg ${cardClasses}`}>
      <div className="mb-2 flex items-center justify-between rounded-2xl bg-white/80 px-2.5 py-1.5">
        <p className={`font-black uppercase tracking-wider text-slate-500 ${compact ? "text-[10px]" : "text-xs"}`}>
          {hasResult ? "Finalizado" : hasPrediction ? "Ya llenado" : isLocked ? "Cerrado" : "Pendiente"}
        </p>
        <div className="flex items-center gap-2">
          {hasPrediction && !hasResult && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-black text-emerald-700">LISTO</span>}
          <button type="button" onClick={() => setShowAllPredictions((prev) => !prev)} className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-black text-slate-600 transition hover:bg-slate-200">
            <Eye size={11} />
            {showAllPredictions ? "Ocultar" : "Ver todos"}
          </button>
        </div>
      </div>

      {!compact && (
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide text-slate-400 sm:text-[10px]"><Clock size={11} />{formatMatchDate(match.date)}</p>
            <p className="mt-0.5 flex min-w-0 items-center gap-1 text-[9px] font-semibold text-slate-400 sm:text-[10px]"><MapPin size={11} /><span className="truncate">{match.stadium}</span></p>
          </div>
          <span className={`inline-flex w-fit shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black ${status.classes}`}><StatusIcon size={11} />{status.label}</span>
        </div>
      )}

      {compact && (
        <div className="mb-2 flex items-center justify-between">
          <p className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide text-slate-400"><Clock size={11} />{formatMatchDate(match.date)}</p>
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black ${status.classes}`}><StatusIcon size={11} />{status.label}</span>
        </div>
      )}

      {/* BANDERAS REALES */}
      <div className={`grid grid-cols-[1fr_auto_1fr] items-center ${compact ? "gap-1.5" : "gap-2 sm:gap-3"}`}>
        <div className="flex flex-col items-center text-center space-y-1.5">
          <div className={`flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-slate-100 to-slate-200 shadow-md ring-2 ring-white ${flagWrapClasses}`}>
            <TeamFlag
              teamName={match.homeTeam}
              size="w80"
              imgClassName="h-full w-full object-cover"
              emojiClassName={`${flagEmojiClasses} scale-125 transform`}
            />
          </div>
          <p className={`break-words font-black leading-tight text-slate-950 ${teamNameClasses}`}>{homeTeamName}</p>
        </div>
        <div className="text-[10px] font-black text-slate-300 px-1">VS</div>
        <div className="flex flex-col items-center text-center space-y-1.5">
          <div className={`flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-slate-100 to-slate-200 shadow-md ring-2 ring-white ${flagWrapClasses}`}>
            <TeamFlag
              teamName={match.awayTeam}
              size="w80"
              imgClassName="h-full w-full object-cover"
              emojiClassName={`${flagEmojiClasses} scale-125 transform`}
            />
          </div>
          <p className={`break-words font-black leading-tight text-slate-950 ${teamNameClasses}`}>{awayTeamName}</p>
        </div>
      </div>

      {!compact && (
        <p className="mt-2 rounded-xl bg-slate-50 p-2 text-[10px] font-bold leading-4 text-slate-500">{status.message}</p>
      )}

      {hasResult && (
        <div className="mt-2 rounded-xl bg-slate-950 p-2 text-white">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-[9px] font-bold text-slate-400">Resultado</p>
              <p className={`mt-0.5 font-black ${compact ? "text-sm" : "text-base"}`}>{match.result.homeScore} - {match.result.awayScore}</p>
              {match.result.homeScore === match.result.awayScore && match.result.advancesTeam && (
                <p className="mt-0.5 text-[9px] font-bold text-emerald-300">
                  Avanzó: {advancingTeamLabel(match.result.advancesTeam)}
                </p>
              )}
            </div>
            {hasPrediction && (
              <div className="rounded-xl bg-white/10 px-2 py-1 text-right">
                <p className="text-[8px] font-bold text-slate-400">Puntos</p>
                <p className="text-sm font-black text-emerald-300">+{points}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* REJILLA COMPACTA PARA VER LOS PRONÓSTICOS DE TODOS */}
      {showAllPredictions && (
        <div className="mt-1.5 rounded-xl border border-slate-100 bg-slate-100/70 p-1.5">
          <div className="mb-1.5 flex items-center justify-between border-b border-slate-200/60 pb-1">
            <span className="text-[8px] font-black uppercase tracking-wider text-emerald-800">Pronósticos</span>
            <span className="text-[7px] font-bold text-slate-400">{homeTeamName.split(" ")[0]} vs {awayTeamName.split(" ")[0]}</span>
          </div>
          <div className={`grid gap-1 ${compact ? "grid-cols-1" : "grid-cols-2"}`}>
            {users.map((user) => {
              const userId = user.uid || user.id;
              const pred = allPredictions.find((p) => p.userId === userId && p.matchId === match.id);
              return (
                <div key={userId} className="flex items-center justify-between rounded-md border border-white bg-white px-1.5 py-0.5 shadow-sm">
                  <span className="truncate text-[9px] font-black text-slate-800 pr-1 max-w-[70px] sm:max-w-[100px]">{user.displayName || user.name}</span>
                  <div className="flex-shrink-0">
                    {pred ? (
                      <span className="inline-flex h-4 items-center justify-center rounded bg-emerald-600 px-1 font-mono text-[9px] font-black text-white shadow-sm">
                        {pred.homeScore}-{pred.awayScore}
                      </span>
                    ) : (
                      <span className="inline-flex h-4 items-center justify-center rounded bg-slate-100 px-1 font-sans text-[8px] font-bold text-slate-400">-</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-2 rounded-xl bg-slate-50 p-2">
        {isEditing ? (
          <div>
            <p className="mb-1.5 text-[9px] font-bold text-slate-400">Captura tu marcador</p>
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-1.5">
              <label className="block">
                <span className="mb-0.5 block truncate text-center text-[9px] font-black text-slate-400">{homeTeamName}</span>
                <input type="number" min="0" inputMode="numeric" pattern="[0-9]*" value={homeScore} onChange={(event) => setHomeScore(event.target.value)} className="h-9 w-full rounded-xl border border-slate-200 bg-white px-1 text-center text-base font-black text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" placeholder="0" />
              </label>
              <span className="pt-3.5 text-sm font-black text-slate-400">-</span>
              <label className="block">
                <span className="mb-0.5 block truncate text-center text-[9px] font-black text-slate-400">{awayTeamName}</span>
                <input type="number" min="0" inputMode="numeric" pattern="[0-9]*" value={awayScore} onChange={(event) => setAwayScore(event.target.value)} className="h-9 w-full rounded-xl border border-slate-200 bg-white px-1 text-center text-base font-black text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" placeholder="0" />
              </label>
            </div>

            {knockout && isDraftDraw && (
              <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50 p-2">
                <p className="mb-1.5 text-[9px] font-black text-amber-700">Es empate: ¿quién avanza?</p>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setAdvancesTeam("home")}
                    className={`truncate rounded-lg px-2 py-1.5 text-[9px] font-black transition ${advancesTeam === "home" ? "bg-emerald-600 text-white" : "bg-white text-slate-600 border border-slate-200"}`}
                  >
                    {homeTeamName}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdvancesTeam("away")}
                    className={`truncate rounded-lg px-2 py-1.5 text-[9px] font-black transition ${advancesTeam === "away" ? "bg-emerald-600 text-white" : "bg-white text-slate-600 border border-slate-200"}`}
                  >
                    {awayTeamName}
                  </button>
                </div>
              </div>
            )}

            <div className="mt-1.5 grid grid-cols-2 gap-1.5">
              <button type="button" onClick={handleCancelEditing} className="flex min-h-8 items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-[9px] font-black text-slate-700 transition hover:bg-slate-50"><X size={12} />Cancelar</button>
              <button type="button" onClick={handleSavePrediction} className="flex min-h-8 items-center justify-center gap-1 rounded-xl bg-emerald-600 px-2 py-1.5 text-[9px] font-black text-white transition hover:bg-emerald-700"><Check size={12} />Guardar</button>
            </div>
          </div>
        ) : hasPrediction ? (
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-[9px] font-bold text-slate-400">Tu marcador</p>
              <p className="text-base font-black text-slate-950">{match.userPrediction.homeScore} - {match.userPrediction.awayScore}</p>
              {match.userPrediction.homeScore === match.userPrediction.awayScore && match.userPrediction.advancesTeam && (
                <p className="text-[9px] font-bold text-emerald-600">
                  Avanza: {advancingTeamLabel(match.userPrediction.advancesTeam)}
                </p>
              )}
            </div>
            <button type="button" disabled={isLocked || hasResult} onClick={handleStartEditing} className={`flex min-h-8 shrink-0 items-center justify-center gap-1 rounded-xl px-2 py-1.5 text-[9px] font-black ${isLocked || hasResult ? "cursor-not-allowed bg-slate-200 text-slate-400" : "bg-emerald-600 text-white hover:bg-emerald-700"}`}>
              {isLocked || hasResult ? <Lock size={12} /> : <PencilLine size={12} />}
              {isLocked || hasResult ? "Cerrado" : "Editar"}
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-[9px] font-bold text-slate-400">Pendiente</p>
              <p className="text-[10px] font-bold text-slate-700">Aún no capturas</p>
            </div>
            <button type="button" disabled={isLocked || hasResult} onClick={handleStartEditing} className={`min-h-8 shrink-0 rounded-xl px-2 py-1.5 text-[9px] font-black ${isLocked || hasResult ? "cursor-not-allowed bg-slate-200 text-slate-400" : "bg-slate-950 text-white hover:bg-slate-800"}`}>
              {isLocked || hasResult ? "Cerrado" : "Llenar"}
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

export default MatchCard;
