import { BarChart3, CheckCircle2, Clock3 } from 'lucide-react';

function getStageProgress(matches, stageId) {
  const stageMatches = matches.filter((match) => match.stageId === stageId);
  const total = stageMatches.length;
  const completed = stageMatches.filter((match) => match.userPrediction).length;
  const pending = total - completed;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    total,
    completed,
    pending,
    percentage,
  };
}

function StageProgressCard({ stages = [], matches = [], onSelectStage }) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-emerald-700">
            Avance por etapa
          </p>

          <h2 className="text-2xl font-black text-slate-950">
            Progreso de pronósticos
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Revisa en qué etapa te faltan marcadores por capturar.
          </p>
        </div>

        <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
          <BarChart3 size={23} />
        </div>
      </div>

      <div className="space-y-3">
        {stages.map((stage) => {
          const progress = getStageProgress(matches, stage.id);

          return (
            <button
              key={stage.id}
              type="button"
              onClick={() => onSelectStage(stage.id)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-emerald-300 hover:bg-emerald-50"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="font-black text-slate-950">
                    {stage.fullName || stage.label}
                  </p>

                  <p className="mt-1 text-xs font-bold text-slate-400">
                    {progress.completed} de {progress.total} pronosticados
                  </p>
                </div>

                <div
                  className={`rounded-full px-3 py-1 text-xs font-black ${
                    progress.pending === 0 && progress.total > 0
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {progress.pending === 0 && progress.total > 0
                    ? 'Completo'
                    : `${progress.pending} pendientes`}
                </div>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-white">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>

              <div className="mt-3 flex items-center justify-between text-xs font-bold text-slate-400">
                <span className="flex items-center gap-1">
                  <CheckCircle2 size={14} />
                  {progress.completed} capturados
                </span>

                <span className="flex items-center gap-1">
                  <Clock3 size={14} />
                  {progress.percentage}%
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default StageProgressCard;