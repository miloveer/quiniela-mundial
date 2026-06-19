import { useState } from 'react';
import { Eye } from 'lucide-react';
import { getTeamDisplayName, getTeamFlag } from '../utils/teamUtils';
import { formatMatchDate } from '../utils/matchUtils';

function CompactMatchCard({
  match,
  onSavePrediction,
  predictionsLocked = false,
  canViewLeaguePredictions = false,
  onViewMatchPredictions,
}) {
  const [homeScore, setHomeScore] = useState(
    match.userPrediction?.homeScore ?? ''
  );

  const [awayScore, setAwayScore] = useState(
    match.userPrediction?.awayScore ?? ''
  );

  const hasPrediction = Boolean(match.userPrediction);
  const hasResult = Boolean(match.result);
  const isLocked = Boolean(match.isLocked);
  const isPredictionBlocked = predictionsLocked || isLocked || hasResult;

  const homeName = getTeamDisplayName(match.homeTeam);
  const awayName = getTeamDisplayName(match.awayTeam);

  function handleSave() {
    if (predictionsLocked) {
      alert('La quiniela ya fue cerrada. Ya no se pueden editar pronósticos.');
      return;
    }

    if (isLocked || hasResult) {
      alert('Este partido ya está cerrado.');
      return;
    }

    if (homeScore === '' || awayScore === '') {
      alert('Captura ambos marcadores.');
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
      alert('Los marcadores deben ser números válidos mayores o iguales a 0.');
      return;
    }

    onSavePrediction(match.id, {
      homeScore: parsedHomeScore,
      awayScore: parsedAwayScore,
    });
  }

  return (
    <article
      className={`rounded-2xl border p-2 shadow-sm ${
        hasResult
          ? 'border-slate-300 bg-slate-50'
          : predictionsLocked
            ? 'border-slate-300 bg-slate-100'
            : hasPrediction
              ? 'border-emerald-200 bg-emerald-50/60'
              : 'border-slate-200 bg-white'
      }`}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="truncate text-[11px] font-black uppercase tracking-wider text-slate-400">
          {formatMatchDate(match.date)}
        </p>

        <span
          className={`rounded-full px-2 py-1 text-[10px] font-black ${
            hasResult
              ? 'bg-slate-950 text-white'
              : predictionsLocked
                ? 'bg-slate-200 text-slate-600'
                : hasPrediction
                  ? 'bg-emerald-100 text-emerald-700'
                  : isLocked
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-slate-100 text-slate-500'
          }`}
        >
          {hasResult
            ? 'Final'
            : predictionsLocked
              ? 'Quiniela cerrada'
              : hasPrediction
                ? 'Listo'
                : isLocked
                  ? 'Cerrado'
                  : 'Pendiente'}
        </span>
      </div>

      <div className="space-y-2">
        <div className="grid grid-cols-[1fr_48px] items-center gap-2">
          <p className="truncate text-sm font-black text-slate-950">
            <span className="mr-1">{getTeamFlag(match.homeTeam)}</span>
            {homeName}
          </p>

          <input
            type="number"
            min="0"
            value={homeScore}
            onChange={(event) => setHomeScore(event.target.value)}
            disabled={isPredictionBlocked}
            className="h-8 w-10 rounded-xl border border-slate-200 bg-white text-center text-xs font-black text-slate-950 outline-none focus:border-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 sm:w-12 sm:text-sm"
          />
        </div>

        <div className="grid grid-cols-[1fr_48px] items-center gap-2">
          <p className="truncate text-[11px] font-black text-slate-950 sm:text-sm">
            <span className="mr-1">{getTeamFlag(match.awayTeam)}</span>
            {awayName}
          </p>

          <input
            type="number"
            min="0"
            value={awayScore}
            onChange={(event) => setAwayScore(event.target.value)}
            disabled={isPredictionBlocked}
            className="h-8 w-10 rounded-xl border border-slate-200 bg-white text-center text-xs font-black text-slate-950 outline-none focus:border-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 sm:w-12 sm:text-sm"
          />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase text-slate-400">
            Tu pronóstico
          </p>

          <p className="text-xs font-black text-slate-700">
            {hasPrediction
              ? `${match.userPrediction.homeScore} - ${match.userPrediction.awayScore}`
              : 'Sin capturar'}

            {hasResult &&
              ` · Oficial ${match.result.homeScore} - ${match.result.awayScore}`}
          </p>
        </div>

        {!isPredictionBlocked && (
          <button
            type="button"
            onClick={handleSave}
            className="rounded-xl bg-slate-950 px-2 py-1.5 text-[10px] font-black text-white transition hover:bg-slate-800 sm:px-3 sm:py-2 sm:text-[11px]"
          >
            Guardar
          </button>
        )}
      </div>

      {canViewLeaguePredictions && (
  <button
    type="button"
    onClick={onViewMatchPredictions}
    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-[11px] font-black uppercase tracking-wide text-emerald-700 transition hover:bg-emerald-50"
  >
    <Eye size={14} />
    Ver pronósticos de todos
  </button>
)}

      {predictionsLocked && !hasResult && (
        <div className="mt-3 rounded-xl bg-white px-3 py-2 text-center text-[10px] font-black uppercase tracking-wide text-slate-500">
          La quiniela ya fue cerrada
        </div>
      )}
    </article>
  );
}

export default CompactMatchCard;