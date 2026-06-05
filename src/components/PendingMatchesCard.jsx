import { AlertCircle, CalendarClock } from 'lucide-react';
import { formatMatchDate } from '../utils/matchUtils';

function PendingMatchesCard({ pendingMatches, onSelectStage }) {
  const hasPendingMatches = pendingMatches.length > 0;

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-emerald-700">
            Pendientes por llenar
          </p>
          <h2 className="text-2xl font-black text-slate-950">
            {pendingMatches.length} partidos
          </h2>
        </div>

        <div className="rounded-2xl bg-rose-50 p-3 text-rose-600">
          <AlertCircle size={23} />
        </div>
      </div>

      {!hasPendingMatches ? (
        <div className="rounded-2xl bg-emerald-50 p-4">
          <p className="text-sm font-black text-emerald-700">
            Todo listo. No tienes partidos pendientes.
          </p>
          <p className="mt-1 text-sm leading-6 text-emerald-700/80">
            Puedes sentarte a sufrir el marcador con tranquilidad.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {pendingMatches.slice(0, 4).map((match) => (
            <button
              key={match.id}
              type="button"
              onClick={() => onSelectStage(match.stageId)}
              className="w-full rounded-2xl bg-slate-50 p-3 text-left transition hover:bg-emerald-50"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-black text-slate-950">
                    {match.homeTeam} vs {match.awayTeam}
                  </p>

                  <p className="mt-1 flex items-center gap-1.5 text-xs font-bold text-slate-400">
                    <CalendarClock size={14} />
                    {formatMatchDate(match.date)}
                  </p>
                </div>

                <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-500">
                  Ir
                </span>
              </div>
            </button>
          ))}

          {pendingMatches.length > 4 && (
            <p className="text-center text-xs font-bold text-slate-400">
              +{pendingMatches.length - 4} pendientes más
            </p>
          )}
        </div>
      )}
    </section>
  );
}

export default PendingMatchesCard;