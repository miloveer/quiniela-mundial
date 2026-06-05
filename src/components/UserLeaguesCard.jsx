import { RefreshCcw, Trophy, UsersRound } from 'lucide-react';

function UserLeaguesCard({
  leagues,
  activeLeagueId,
  isLoading,
  onRefresh,
  onSelectLeague,
}) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-emerald-700">Mis ligas</p>
          <h2 className="text-2xl font-black text-slate-950">
            Cambiar quiniela
          </h2>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          title="Actualizar ligas"
        >
          <RefreshCcw size={20} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {isLoading ? (
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-sm font-black text-slate-700">
            Cargando tus ligas...
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Estamos consultando Firestore.
          </p>
        </div>
      ) : leagues.length === 0 ? (
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-sm font-black text-slate-700">
            Aún no perteneces a ninguna liga.
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Únete con un código o crea una desde el panel admin.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {leagues.map((league) => {
            const isActive = league.id === activeLeagueId;

            return (
              <article
                key={league.id}
                className={`rounded-2xl p-4 ${
                  isActive ? 'bg-emerald-50' : 'bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                        isActive
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white text-slate-600'
                      }`}
                    >
                      {isActive ? <Trophy size={21} /> : <UsersRound size={21} />}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-black text-slate-950">
                        {league.name}
                      </p>
                      <p className="mt-1 text-xs font-bold text-slate-400">
                        Código: {league.code}
                      </p>
                      <p className="mt-1 text-xs font-bold text-slate-400">
                        {league.members?.length || 0} miembros
                      </p>
                    </div>
                  </div>

                  {isActive ? (
                    <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-black text-white">
                      Activa
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onSelectLeague(league)}
                      className="rounded-full bg-slate-950 px-3 py-1 text-xs font-black text-white transition hover:bg-slate-800"
                    >
                      Usar
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default UserLeaguesCard;