import {
  CheckCircle2,
  ClipboardList,
  Lock,
  MessageCircle,
  PlusCircle,
  Trophy,
  Unlock,
  UploadCloud,
  Keyboard,
  UserCheck,
  UsersRound,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';

function getCompletedPredictionsByUser(user, matches) {
  return matches.filter((match) => user?.predictions?.[match.id]).length;
}

function getPendingPredictionsByUser(user, matches) {
  return matches.length - getCompletedPredictionsByUser(user, matches);
}

function groupPendingPredictionsByReferenceName(pendingPredictions = []) {
  const groups = pendingPredictions.reduce((accumulator, pendingPrediction) => {
    const key = pendingPrediction.referenceName;

    if (!accumulator[key]) {
      accumulator[key] = [];
    }

    accumulator[key].push(pendingPrediction);

    return accumulator;
  }, {});

  return Object.entries(groups).map(([referenceName, predictions]) => ({
    referenceName,
    predictions,
    isClaimed: predictions.every((prediction) => prediction.claimedBy),
  }));
}

function AdminPanelCard({
  users,
  matches,
  members,
  isSyncingFootballData = false,
  pendingWhatsappPredictions = [],
  isLoadingPendingPredictions = false,
  predictionsLocked = false,
  isTogglingPredictionsLock = false,
  onOpenResultModal,
  onOpenCreateLeagueModal,
  onSyncFootballDataMatches,
  onSeedSupabaseMatches,
  onSaveWhatsappPrediction,
  onDeletePendingPrediction,
  onClaimPendingPredictions,
  onOpenManualPredictionModal,
  onTogglePredictionsLock,
}) {
  const [whatsappMatchId, setWhatsappMatchId] = useState('');
  const [whatsappReferenceName, setWhatsappReferenceName] = useState('');
  const [whatsappHomeScore, setWhatsappHomeScore] = useState('');
  const [whatsappAwayScore, setWhatsappAwayScore] = useState('');
  const [claimSelections, setClaimSelections] = useState({});

  const totalMatches = matches.length;
  const totalMembers = members.length;

  const usersWithoutCompletedPredictions = users.filter((user) => {
    return getCompletedPredictionsByUser(user, matches) < totalMatches;
  });

  const usersCompleted = users.filter((user) => {
    return getCompletedPredictionsByUser(user, matches) === totalMatches;
  });

  const groupedPendingPredictions = groupPendingPredictionsByReferenceName(
    pendingWhatsappPredictions
  );

  const unclaimedGroups = groupedPendingPredictions.filter(
    (group) => !group.isClaimed
  );

  function handleWhatsappFormSubmit(event) {
    event.preventDefault();

    if (!whatsappMatchId || !whatsappReferenceName.trim()) {
      return;
    }

    onSaveWhatsappPrediction({
      matchId: whatsappMatchId,
      referenceName: whatsappReferenceName,
      homeScore: whatsappHomeScore === '' ? 0 : Number(whatsappHomeScore),
      awayScore: whatsappAwayScore === '' ? 0 : Number(whatsappAwayScore),
    });

    // Mantiene el nombre y el partido para capturar varios pronósticos
    // de la misma persona uno tras otro sin tener que re-escribir el nombre.
    setWhatsappHomeScore('');
    setWhatsappAwayScore('');
  }

  function handleClaimSubmit(referenceName) {
    const selectedUserId = claimSelections[referenceName];

    if (!selectedUserId) {
      return;
    }

    onClaimPendingPredictions({
      referenceName,
      userId: selectedUserId,
    });
  }

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

      {/* SWITCH: abrir/cerrar pronósticos de toda la liga */}
      <div
        className={`mb-5 flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between ${
          predictionsLocked
            ? 'border-rose-400/40 bg-rose-500/10'
            : 'border-emerald-400/40 bg-emerald-500/10'
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`rounded-2xl p-2 ${
              predictionsLocked
                ? 'bg-rose-400/20 text-rose-300'
                : 'bg-emerald-400/20 text-emerald-300'
            }`}
          >
            {predictionsLocked ? <Lock size={20} /> : <Unlock size={20} />}
          </div>

          <div>
            <p className="text-sm font-black">
              {predictionsLocked ? 'Quiniela cerrada' : 'Quiniela abierta'}
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-300">
              {predictionsLocked
                ? 'Nadie puede guardar pronósticos nuevos mientras esté cerrada.'
                : 'Los participantes pueden seguir capturando sus pronósticos.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={!predictionsLocked}
          disabled={isTogglingPredictionsLock}
          onClick={onTogglePredictionsLock}
          className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full transition disabled:cursor-not-allowed disabled:opacity-60 ${
            predictionsLocked ? 'bg-slate-700' : 'bg-emerald-400'
          }`}
        >
          <span
            className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition ${
              predictionsLocked ? 'translate-x-1' : 'translate-x-7'
            }`}
          />
        </button>
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
        {/* --- NUEVO BOTÓN PARA PRONÓSTICOS MANUALES --- */}
        <button
          type="button"
          onClick={onOpenManualPredictionModal}
          className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-indigo-300 px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-indigo-200"
        >
          <Keyboard size={18} />
          Capturar pronósticos por usuario
        </button>
        {/* --------------------------------------------- */}
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
          className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-black text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSyncingFootballData ? 'Sincronizando...' : 'Sincronizar partidos'}
        </button>

        <button
          type="button"
          onClick={onSeedSupabaseMatches}
          className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-amber-300 px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-amber-200"
        >
          <UploadCloud size={18} />
          Cargar calendario base
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
        <div className="mb-4 flex items-start gap-3">
          <div className="rounded-2xl bg-emerald-50 p-2 text-emerald-700">
            <MessageCircle size={20} />
          </div>

          <div>
            <p className="text-sm font-bold text-emerald-700">
              Pronósticos por WhatsApp
            </p>

            <h3 className="text-xl font-black">
              Cargar pronóstico de alguien que aún no se une
            </h3>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Úsalo cuando alguien te mande su pronóstico por WhatsApp antes
              de loguearse. Escribe su nombre tal como lo vas a reconocer
              después, para poder asignárselo cuando ya esté en la liga.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleWhatsappFormSubmit}
          className="grid gap-3 sm:grid-cols-2"
        >
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-500">
              Nombre de la persona
            </span>

            <input
              type="text"
              value={whatsappReferenceName}
              onChange={(event) =>
                setWhatsappReferenceName(event.target.value)
              }
              placeholder="Ej. Juan Pérez"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
            />
          </label>

          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-500">
              Partido
            </span>

            <select
              value={whatsappMatchId}
              onChange={(event) => setWhatsappMatchId(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
            >
              <option value="">Selecciona un partido</option>

              {matches.map((match) => (
                <option key={match.id} value={match.id}>
                  {match.homeTeam} vs {match.awayTeam}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-500">
              Marcador local
            </span>

            <input
              type="number"
              min="0"
              value={whatsappHomeScore}
              onChange={(event) => setWhatsappHomeScore(event.target.value)}
              placeholder="0"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-500">
              Marcador visitante
            </span>

            <input
              type="number"
              min="0"
              value={whatsappAwayScore}
              onChange={(event) => setWhatsappAwayScore(event.target.value)}
              placeholder="0"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
            />
          </label>

          <button
            type="submit"
            className="sm:col-span-2 flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-black text-white transition hover:bg-emerald-700"
          >
            <MessageCircle size={18} />
            Guardar pronóstico
          </button>
        </form>
      </div>

      <div className="mt-5 rounded-[1.5rem] bg-white p-4 text-slate-950">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-amber-50 p-2 text-amber-600">
              <UserCheck size={20} />
            </div>

            <div>
              <p className="text-sm font-bold text-emerald-700">
                Pronósticos sin asignar
              </p>

              <h3 className="text-xl font-black">
                Asigna cada nombre a su cuenta real
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Cuando la persona ya se haya unido con su código, selecciónala
                aquí para que sus pronósticos por WhatsApp pasen a contar en
                el ranking.
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-500">
            {unclaimedGroups.length} sin asignar
          </div>
        </div>

        {isLoadingPendingPredictions ? (
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-black text-slate-700">
              Cargando pronósticos por WhatsApp...
            </p>
          </div>
        ) : unclaimedGroups.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-black text-slate-700">
              No hay pronósticos pendientes por asignar.
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Los que cargues arriba aparecerán aquí hasta que los asignes a
              un participante.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {unclaimedGroups.map((group) => (
              <article
                key={group.referenceName}
                className="rounded-2xl border border-amber-200 bg-amber-50 p-3 sm:p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate font-black text-slate-950">
                      {group.referenceName}
                    </p>

                    <p className="mt-1 text-xs font-bold text-slate-500">
                      {group.predictions.length} pronóstico(s) por WhatsApp
                    </p>

                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {group.predictions.map((prediction) => (
                        <span
                          key={prediction.id}
                          className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600"
                        >
                          {prediction.homeScore}-{prediction.awayScore}
                          <button
                            type="button"
                            onClick={() =>
                              onDeletePendingPrediction(prediction.id)
                            }
                            title="Borrar este pronóstico"
                            className="text-rose-500 transition hover:text-rose-700"
                          >
                            <XCircle size={13} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                    <select
                      value={claimSelections[group.referenceName] || ''}
                      onChange={(event) =>
                        setClaimSelections((previousSelections) => ({
                          ...previousSelections,
                          [group.referenceName]: event.target.value,
                        }))
                      }
                      className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-emerald-500"
                    >
                      <option value="">Asignar a...</option>

                      {members.map((member) => (
                        <option
                          key={member.uid || member.id}
                          value={member.uid || member.id}
                        >
                          {member.displayName || 'Usuario'}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => handleClaimSubmit(group.referenceName)}
                      disabled={!claimSelections[group.referenceName]}
                      className="rounded-2xl bg-slate-950 px-4 py-2.5 text-xs font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Confirmar
                    </button>
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
