import { useState } from 'react';
import { getTeamDisplayName, getTeamFlag } from '../utils/teamUtils';
import { formatMatchDate } from '../utils/matchUtils';

function CompactMatchCard({ match, onSavePrediction }) {
  const [homeScore, setHomeScore] = useState(
    match.userPrediction?.homeScore ?? ''
  );

  const [awayScore, setAwayScore] = useState(
    match.userPrediction?.awayScore ?? ''
  );

  const hasPrediction = Boolean(match.userPrediction);
  const hasResult = Boolean(match.result);
  const isLocked = Boolean(match.isLocked);

  const homeName = getTeamDisplayName(match.homeTeam);
  const awayName = getTeamDisplayName(match.awayTeam);

  function handleSave() {
    if (homeScore === '' || awayScore === '') {
      alert('Captura ambos marcadores.');
      return;
    }

    onSavePrediction(match.id, {
      homeScore: Number(homeScore),
      awayScore: Number(awayScore),
    });
  }

  return (
    <article
      className={`rounded-2xl border p-2 shadow-sm ${
        hasResult
          ? 'border-slate-300 bg-slate-50'
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
              : hasPrediction
                ? 'bg-emerald-100 text-emerald-700'
                : isLocked
                  ? 'bg-rose-100 text-rose-700'
                  : 'bg-slate-100 text-slate-500'
          }`}
        >
          {hasResult
            ? 'Final'
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
            disabled={isLocked || hasResult}
            className="h-8 w-10 rounded-xl border border-slate-200 bg-white text-center text-xs font-black text-slate-950 outline-none focus:border-emerald-400 disabled:bg-slate-100 sm:w-12 sm:text-sm"
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
            disabled={isLocked || hasResult}
            className="h-8 w-10 rounded-xl border border-slate-200 bg-white text-center text-xs font-black text-slate-950 outline-none focus:border-emerald-400 disabled:bg-slate-100 sm:w-12 sm:text-sm"
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

        {!isLocked && !hasResult && (
          <button
            type="button"
            onClick={handleSave}
            className="rounded-xl bg-slate-950 px-2 py-1.5 text-[10px] font-black text-white transition hover:bg-slate-800 sm:px-3 sm:py-2 sm:text-[11px]"
          >
            Guardar
          </button>
        )}
      </div>
    </article>
  );
}

export default CompactMatchCard;