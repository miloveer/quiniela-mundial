import { Medal, Target, Trophy } from 'lucide-react';

function getRankBadge(index) {
  if (index === 0) {
    return '🥇';
  }

  if (index === 1) {
    return '🥈';
  }

  if (index === 2) {
    return '🥉';
  }

  return `#${index + 1}`;
}

function RankingCard({
  ranking = [],
  currentUserName,
  title = 'Ranking general',
  subtitle = 'Tabla acumulada',
}) {
  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm sm:rounded-[2rem] sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-emerald-700">{subtitle}</p>

          <h2 className="text-xl font-black text-slate-950 sm:text-2xl">{title}</h2>
        </div>

        <div className="rounded-2xl bg-amber-50 p-3 text-amber-600">
          <Trophy size={23} />
        </div>
      </div>

      {ranking.length === 0 ? (
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-sm font-black text-slate-700">
            Aún no hay ranking disponible.
          </p>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Cuando los participantes guarden pronósticos y existan resultados,
            la tabla se actualizará aquí.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {ranking.map((user, index) => {
            const isCurrentUser =
              user.name?.toLowerCase() === currentUserName?.toLowerCase();

            return (
              <article
                key={user.id || user.uid || user.name}
                className={`rounded-2xl border p-3 transition sm:p-4 ${
                  isCurrentUser
                    ? 'border-emerald-300 bg-emerald-50'
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-sm font-black sm:h-11 sm:w-11 ${
                        index === 0
                          ? 'bg-amber-400 text-slate-950'
                          : index === 1
                            ? 'bg-slate-300 text-slate-950'
                            : index === 2
                              ? 'bg-orange-300 text-slate-950'
                              : 'bg-white text-slate-500'
                      }`}
                    >
                      {getRankBadge(index)}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-black text-slate-950">
                        {user.name}
                      </p>

                      <p className="mt-1 text-xs font-bold text-slate-400">
                        {isCurrentUser ? 'Tú' : user.badge || 'Participante'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xl font-black text-slate-950 sm:text-2xl">
                      {user.points || 0}
</p>

                    <p className="text-xs font-bold text-slate-400">pts</p>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-1.5 sm:gap-2">
                  <div className="rounded-2xl bg-white p-2 text-center sm:p-3">
                    <div className="mb-1 flex justify-center text-emerald-600">
                      <Target size={16} />
                    </div>

                    <p className="text-sm font-black text-slate-950">
                      {user.resultHits || 0}
                    </p>

                    <p className="text-[10px] font-bold text-slate-400 sm:text-[11px]">
                      Aciertos
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white p-3 text-center">
                    <div className="mb-1 flex justify-center text-amber-600">
                      <Medal size={16} />
                    </div>

                    <p className="text-sm font-black text-slate-950">
                      {user.exactScores || 0}
                    </p>

                    <p className="text-[11px] font-bold text-slate-400">
                      Exactos
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white p-3 text-center">
                    <p className="mb-1 text-xs font-black text-violet-600">
                      1X2
                    </p>

                    <p className="text-sm font-black text-slate-950">
                      {user.predictionsCount || 0}
                    </p>

                    <p className="text-[11px] font-bold text-slate-400">
                      Jugados
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default RankingCard;