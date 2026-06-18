import {
  CheckCircle2,
  ClipboardList,
  Coins,
  PlusCircle,
  Settings2,
  Trophy,
  UploadCloud,
  UsersRound,
  WalletCards,
  XCircle,
} from 'lucide-react';

function formatMoney(amount) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

function getCompletedPredictionsByUser(user, matches) {
  return matches.filter((match) => user?.predictions?.[match.id]).length;
}

function getPendingPredictionsByUser(user, matches) {
  return matches.length - getCompletedPredictionsByUser(user, matches);
}

function AdminPanelCard({
  users,
  matches,
  members,
  entryFee,
  prizeMode,
  isSyncingFootballData = false,
  onOpenResultModal,
  onOpenCreateLeagueModal,
  onOpenPrizeEditorModal,
  onOpenPrizeSettingsModal,
  onSyncFootballDataMatches,
  onSeedSupabaseMatches,
}) {
  const totalMatches = matches.length;
  const totalMembers = members.length;
  const estimatedPool = totalMembers * entryFee;

  const usersWithoutCompletedPredictions = users.filter((user) => {
    return getCompletedPredictionsByUser(user, matches) < totalMatches;
  });

  const usersCompleted = users.filter((user) => {
    return getCompletedPredictionsByUser(user, matches) === totalMatches;
  });

  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-slate-950 p-4 text-white shadow-sm sm:rounded-[2rem] sm:p-5">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-emerald-300">
            Panel administrador
          </p>

          <h2 className="text-xl font-black sm:text-2xl">
            Control de quiniela
          </h2>

          <p className="mt-1 text-xs leading-5 text-slate-400 sm:text-sm sm:leading-6">
            Revisa participantes, partidos pendientes, premios y resultados.
          </p>
        </div>

        <div className="rounded-2xl bg-white/10 p-3 text-emerald-300">
          <ClipboardList size={24} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <article className="rounded-2xl bg-white/10 p-3 sm:p-4">
          <div className="mb-2 flex items-center gap-2 text-emerald-300">
            <UsersRound size={18} />

            <p className="text-xs font-black uppercase tracking-wider">
              Participantes
            </p>
          </div>

          <p className="text-2xl font-black sm:text-3xl">{totalMembers}</p>

          <p className="mt-1 text-xs font-bold text-slate-400">
            Miembros registrados
          </p>
        </article>

        <article className="rounded-2xl bg-white/10 p-3 sm:p-4">
          <div className="mb-2 flex items-center gap-2 text-emerald-300">
            <CheckCircle2 size={18} />

            <p className="text-xs font-black uppercase tracking-wider">
              Al corriente
            </p>
          </div>

          <p className="text-2xl font-black sm:text-3xl">
            {usersCompleted.length}
          </p>

          <p className="mt-1 text-xs font-bold text-slate-400">
            Con todos los pronósticos
          </p>
        </article>

        <article className="rounded-2xl bg-white/10 p-3 sm:p-4">
          <div className="mb-2 flex items-center gap-2 text-amber-300">
            <XCircle size={18} />

            <p className="text-xs font-black uppercase tracking-wider">
              Pendientes
            </p>
          </div>

          <p className="text-2xl font-black sm:text-3xl">
            {usersWithoutCompletedPredictions.length}
          </p>

          <p className="mt-1 text-xs font-bold text-slate-400">
            Les faltan pronósticos
          </p>
        </article>

        <article className="rounded-2xl bg-white/10 p-3 sm:p-4">
          <div className="mb-2 flex items-center gap-2 text-fuchsia-300">
            <Trophy size={18} />

            <p className="text-xs font-black uppercase tracking-wider">
              Partidos
            </p>
          </div>

          <p className="text-2xl font-black sm:text-3xl">{totalMatches}</p>

          <p className="mt-1 text-xs font-bold text-slate-400">
            En la liga activa
          </p>
        </article>
      </div>

      <div className="mt-5 rounded-[1.5rem] bg-white/10 p-4">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-emerald-300">Bolsa estimada</p>

            <h3 className="mt-1 text-xl font-black">Premio de la liga</h3>

            <p className="mt-1 text-sm leading-6 text-slate-400">
              Entrada por participante: {formatMoney(entryFee)}
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 p-3 text-emerald-300">
            <WalletCards size={22} />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-slate-950/60 p-4">
            <p className="text-xs font-black uppercase tracking-wider text-slate-400">
              Participantes
            </p>

            <p className="mt-2 text-2xl font-black">{totalMembers}</p>
          </div>

          <div className="rounded-2xl bg-slate-950/60 p-4">
            <p className="text-xs font-black uppercase tracking-wider text-slate-400">
              Entrada
            </p>

            <p className="mt-2 text-2xl font-black">{formatMoney(entryFee)}</p>
          </div>

          <div className="rounded-2xl bg-emerald-400 p-4 text-slate-950">
            <p className="text-xs font-black uppercase tracking-wider">Bolsa</p>

            <p className="mt-2 text-2xl font-black">
              {formatMoney(estimatedPool)}
            </p>
          </div>
        </div>

        <div className="mt-3 rounded-2xl bg-white/10 p-3">
          <p className="text-sm font-black text-white">
            Modalidad:{' '}
            {prizeMode === 'winner_takes_all'
              ? 'ganador se lleva todo'
              : 'premios configurados'}
          </p>

          {prizeMode === 'winner_takes_all' && (
            <p className="mt-1 text-xs font-bold text-slate-400">
              La bolsa se calcula con participantes registrados × entrada.
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-2 sm:gap-3">
        <button
          type="button"
          onClick={onOpenCreateLeagueModal}
          className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-emerald-300"
        >
          <PlusCircle size={18} />
          Crear nueva liga
        </button>

        <button
  type="button"
  onClick={onSyncFootballDataMatches}
  disabled={isSyncingFootballData}
  className={`rounded-2xl px-4 py-3 text-sm font-black transition ${
    isSyncingFootballData
      ? 'cursor-not-allowed bg-slate-200 text-slate-400'
      : 'bg-emerald-600 text-white hover:bg-emerald-700'
  }`}
>
  {isSyncingFootballData
    ? 'Sincronizando...'
    : 'Sincronizar partidos desde API'}
</button>
{onSeedSupabaseMatches && (
  <button
    type="button"
    onClick={onSeedSupabaseMatches}
    className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700 transition hover:bg-emerald-100"
  >
    Cargar partidos del mundial
  </button>
)}

        <button
          type="button"
          onClick={onSeedSupabaseMatches}
          className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-amber-300 px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-amber-200"
        >
          <UploadCloud size={18} />
          Cargar calendario base
        </button>

        {prizeMode === 'fixed' && (
          <button
            type="button"
            onClick={onOpenPrizeEditorModal}
            className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-violet-300 px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-violet-200"
          >
            <Coins size={18} />
            Editar premios
          </button>
        )}

        <button
          type="button"
          onClick={onOpenPrizeSettingsModal}
          className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-200"
        >
          <Settings2 size={18} />
          Editar reglas de premio
        </button>

        <button
          type="button"
          onClick={onOpenResultModal}
          className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-emerald-100"
        >
          <Trophy size={18} />
          Actualizar resultados manualmente
        </button>
      </div>

      <div className="mt-5 rounded-[1.5rem] bg-white p-4 text-slate-950">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-emerald-700">Participantes</p>

            <h3 className="text-xl font-black">Usuarios registrados</h3>
          </div>

          <div className="rounded-2xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-500">
            {members.length} miembros
          </div>
        </div>

        {prizeMode === 'winner_takes_all' && (
          <div className="mb-4 rounded-2xl bg-emerald-50 p-4">
            <p className="text-sm font-black text-emerald-700">
              Modalidad automática activa
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-600">
              En “Ganador se lleva todo” no se editan premios individuales. La
              bolsa se calcula con participantes registrados × entrada por
              participante. Para cambiar esto, usa “Editar reglas de premio”.
            </p>
          </div>
        )}

        {members.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-black text-slate-700">
              Aún no hay miembros registrados en esta liga.
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Cuando los usuarios se unan con el código, aparecerán aquí.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {members.map((member) => (
              <article
                key={member.userId || member.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate font-black text-slate-950">
                      {member.displayName || 'Usuario'}
                    </p>

                    <p className="mt-1 truncate text-xs font-bold text-slate-400">
                      {member.email || 'Sin correo registrado'}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-black text-slate-500 sm:px-3 sm:text-xs">
                        Entrada: {formatMoney(member.entryFee || entryFee)}
                      </span>

                      <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-black text-slate-500 sm:px-3 sm:text-xs">
                        {member.role === 'owner'
                          ? 'Administrador'
                          : 'Participante'}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="mt-5 rounded-[1.5rem] bg-white p-4 text-slate-950">
        <div className="mb-4">
          <p className="text-sm font-bold text-emerald-700">
            Pronósticos pendientes
          </p>

          <h3 className="text-xl font-black">Seguimiento por usuario</h3>
        </div>

        {users.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-black text-slate-700">
              No hay usuarios para revisar.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((user) => {
              const completed = getCompletedPredictionsByUser(user, matches);
              const pending = getPendingPredictionsByUser(user, matches);

              return (
                <article
                  key={user.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-black text-slate-950">{user.name}</p>

                      <p className="mt-1 text-xs font-bold text-slate-400">
                        {completed} capturados / {pending} pendientes
                      </p>
                    </div>

                    <div
                      className={`rounded-full px-3 py-1 text-xs font-black ${
                        pending === 0
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {pending === 0 ? 'Al corriente' : 'Pendiente'}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default AdminPanelCard;