import { Medal, Target, Trophy } from 'lucide-react';

function getRankBadge(index) {
  if (index === 0) return '🥇';
  if (index === 1) return '🥈';
  if (index === 2) return '🥉';

  return index + 1;
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

          <h2 className="text-xl font-black text-slate-950 sm:text-2xl">
            {title}
          </h2>
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
        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <div className="grid grid-cols-[42px_1fr_54px_54px_54px] bg-slate-950 px-3 py-3 text-[10px] font-black uppercase tracking-wider text-slate-300 sm:grid-cols-[52px_1fr_70px_70px_70px] sm:text-xs">
            <div>#</div>
            <div>Participante</div>
            <div className="text-center">Pts</div>
            <div className="text-center">Exactos</div>
            <div className="text-center">Aciertos</div>
          </div>

          <div className="max-h-[520px] overflow-y-auto divide-y divide-slate-100">
            {ranking.map((user, index) => {
              const isCurrentUser =
                user.name?.toLowerCase() === currentUserName?.toLowerCase();

              return (
                <article
                  key={user.id || user.uid || user.name}
                  className={`grid grid-cols-[42px_1fr_54px_54px_54px] items-center px-3 py-3 text-sm sm:grid-cols-[52px_1fr_70px_70px_70px] ${
                    isCurrentUser ? 'bg-emerald-50' : 'bg-white'
                  }`}
                >
                  <div className="font-black text-slate-700">
                    {getRankBadge(index)}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate font-black text-slate-950">
                      {user.name}
                    </p>

                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:text-xs">
                      {isCurrentUser ? 'Tú' : user.badge || 'Participante'}
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-base font-black text-emerald-700 sm:text-lg">
                      {user.points || 0}
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-1 text-center font-black text-slate-700">
                    <Medal size={14} className="hidden text-amber-600 sm:block" />
                    {user.exactScores || 0}
                  </div>

                  <div className="flex items-center justify-center gap-1 text-center font-black text-slate-700">
                    <Target
                      size={14}
                      className="hidden text-violet-600 sm:block"
                    />
                    {user.resultHits || 0}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

export default RankingCard;