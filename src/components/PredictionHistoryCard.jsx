import { Clock3, History, Medal, Target, Trophy } from 'lucide-react';
import {
  calculatePredictionPoints,
  getScoreOutcome,
} from '../utils/scoreUtils';
import { formatMatchDate } from '../utils/matchUtils';

function getPointLabel(points) {
  if (points === 3) {
    return 'Marcador exacto';
  }

  if (points === 1) {
    return 'Acierto de resultado';
  }

  return 'Sin puntos';
}

function getPointClasses(points) {
  if (points === 3) {
    return 'bg-amber-50 text-amber-700';
  }

  if (points === 1) {
    return 'bg-emerald-50 text-emerald-700';
  }

  return 'bg-slate-100 text-slate-500';
}

function SummaryCard({ icon: Icon, label, value, className = '' }) {
  return (
    <article className="rounded-[1.25rem] bg-white p-3 shadow-sm sm:rounded-2xl sm:p-4">
      <div className={`mb-2 flex items-center gap-2 ${className}`}>
        <Icon size={17} />

        <p className="text-[11px] font-black uppercase tracking-wider sm:text-xs">
          {label}
        </p>
      </div>

      <p className="text-2xl font-black text-slate-950 sm:text-3xl">
        {value}
      </p>
    </article>
  );
}

function PredictionHistoryCard({ matches = [] }) {
  const matchesWithPrediction = matches.filter((match) => match.userPrediction);

  const completedMatches = matchesWithPrediction.filter((match) => match.result);

  const pendingResultMatches = matchesWithPrediction.filter(
    (match) => !match.result
  );

  const totalPoints = matchesWithPrediction.reduce((total, match) => {
    return total + calculatePredictionPoints(match.userPrediction, match.result);
  }, 0);

  const exactScores = completedMatches.filter((match) => {
    return (
      match.userPrediction.homeScore === match.result.homeScore &&
      match.userPrediction.awayScore === match.result.awayScore
    );
  }).length;

  const resultHits = completedMatches.filter((match) => {
    return (
      getScoreOutcome(match.userPrediction) === getScoreOutcome(match.result)
    );
  }).length;

  return (
    <section className="space-y-4">
      <section className="rounded-[1.5rem] border border-white/70 bg-white/80 p-4 shadow-xl shadow-slate-200/70 backdrop-blur sm:rounded-[2rem] sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-bold text-emerald-700">Historial</p>

            <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
              Tus pronósticos
            </h2>

            <p className="mt-2 max-w-xl text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6">
              Revisa tus marcadores capturados, resultados oficiales y puntos
              obtenidos.
            </p>
          </div>

          <div className="rounded-2xl bg-violet-50 p-3 text-violet-600">
            <History size={23} />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard
          icon={Trophy}
          label="Puntos"
          value={totalPoints}
          className="text-emerald-600"
        />

        <SummaryCard
          icon={Medal}
          label="Exactos"
          value={exactScores}
          className="text-amber-600"
        />

        <SummaryCard
          icon={Target}
          label="Aciertos"
          value={resultHits}
          className="text-violet-600"
        />

        <SummaryCard
          icon={Clock3}
          label="Pendientes"
          value={pendingResultMatches.length}
          className="text-slate-500"
        />
      </div>

      {matchesWithPrediction.length === 0 ? (
        <section className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white/70 p-5 text-center sm:rounded-[2rem] sm:p-6">
          <p className="text-lg font-black text-slate-950">
            Aún no tienes pronósticos
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Ve a la sección de partidos y captura tus marcadores.
          </p>
        </section>
      ) : (
        <section className="space-y-3">
          {matchesWithPrediction.map((match) => {
            const points = calculatePredictionPoints(
              match.userPrediction,
              match.result
            );

            const hasResult = Boolean(match.result);

            return (
              <article
                key={match.id}
                className="rounded-[1.35rem] border border-slate-200 bg-white p-3 shadow-sm sm:rounded-[1.5rem] sm:p-4"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="break-words text-sm font-black leading-tight text-slate-950 sm:text-base">
                      {match.homeTeam} vs {match.awayTeam}
                    </p>

                    <p className="mt-1 text-[11px] font-bold leading-5 text-slate-400 sm:text-xs">
                      {formatMatchDate(match.date)} · {match.stadium}
                    </p>
                  </div>

                  <span
                    className={`inline-flex w-fit rounded-full px-3 py-1 text-[11px] font-black sm:text-xs ${
                      hasResult
                        ? getPointClasses(points)
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {hasResult ? getPointLabel(points) : 'Resultado pendiente'}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-[1fr_1fr_auto] gap-2">
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <p className="text-[11px] font-bold text-slate-400 sm:text-xs">
                      Tu marcador
                    </p>

                    <p className="mt-1 text-lg font-black text-slate-950 sm:text-xl">
                      {match.userPrediction.homeScore} -{' '}
                      {match.userPrediction.awayScore}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-3">
                    <p className="text-[11px] font-bold text-slate-400 sm:text-xs">
                      Oficial
                    </p>

                    <p className="mt-1 text-lg font-black text-slate-950 sm:text-xl">
                      {hasResult
                        ? `${match.result.homeScore} - ${match.result.awayScore}`
                        : '—'}
                    </p>
                  </div>

                  <div className="flex min-w-[68px] flex-col justify-center rounded-2xl bg-slate-950 p-3 text-center text-white">
                    <p className="text-[10px] font-bold text-slate-400 sm:text-xs">
                      Pts
                    </p>

                    <p className="mt-1 text-lg font-black sm:text-xl">
                      +{points}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </section>
  );
}

export default PredictionHistoryCard;