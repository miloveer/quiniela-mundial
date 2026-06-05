import { useState } from 'react';
import { CheckCircle2, KeyRound, X } from 'lucide-react';

function formatMoney(amount) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

function JoinLeagueModal({ isOpen, onClose, onJoinLeague, onPreviewLeague }) {
  const [leagueCode, setLeagueCode] = useState('');
  const [leaguePreview, setLeaguePreview] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  if (!isOpen) {
    return null;
  }

  const estimatedParticipants = leaguePreview?.members?.length || 0;
  const entryFee = Number(leaguePreview?.entryFee || 0);
  const estimatedPrizePool = estimatedParticipants * entryFee;

  async function handlePreviewLeague() {
    const cleanCode = leagueCode.trim().toUpperCase();

    if (!cleanCode) {
      setErrorMessage('Escribe un código de liga.');
      return;
    }

    setIsPreviewLoading(true);
    setErrorMessage('');
    setLeaguePreview(null);


    try {
      const league = await onPreviewLeague(cleanCode);

      if (!league) {
        setErrorMessage('No existe una liga con ese código.');
        return;
      }

      setLeaguePreview(league);
    } catch {
      setErrorMessage('No se pudo consultar la liga. Intenta de nuevo.');
    } finally {
      setIsPreviewLoading(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const cleanCode = leagueCode.trim().toUpperCase();

    if (!cleanCode) {
      setErrorMessage('Escribe un código de liga.');
      return;
    }

    if (!leaguePreview) {
      await handlePreviewLeague();
      return;
    }
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await onJoinLeague({
        leagueCode: cleanCode,
      });

      setLeagueCode('');
      setLeaguePreview(null);
      onClose();
    } catch (error) {
      if (error.message === 'LEAGUE_NOT_FOUND') {
        setErrorMessage('No existe una liga con ese código.');
      } else if (error.message === 'ENTRY_FEE_NOT_ACCEPTED') {
        setErrorMessage('Debes aceptar la entrada para unirte a esta liga.');
      } else {
        setErrorMessage('No se pudo unir a la liga. Intenta de nuevo.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleClose() {
    if (isSubmitting || isPreviewLoading) {
      return;
    }

    setErrorMessage('');
    setLeagueCode('');
    setLeaguePreview(null);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-4 backdrop-blur-sm sm:items-center">
      <section className="w-full max-w-md rounded-[2rem] bg-white p-5 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <KeyRound size={24} />
            </div>

            <div>
              <p className="text-sm font-bold text-emerald-700">
                Unirse a liga
              </p>

              <h2 className="text-2xl font-black text-slate-950">
                Ingresa tu código
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Consulta la liga, revisa la entrada y confirma si estás de
                acuerdo.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting || isPreviewLoading}
            className="rounded-2xl border border-slate-200 bg-white p-2 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Cerrar modal"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-1.5 block text-sm font-black text-slate-700">
              Código de invitación
            </span>

            <input
              type="text"
              value={leagueCode}
              onChange={(event) => {
                setLeagueCode(event.target.value);
                setLeaguePreview(null);
              }}
              placeholder="Ej. MUNDIAL26"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-black uppercase tracking-[0.18em] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              autoFocus
            />
          </label>

          <button
            type="button"
            onClick={handlePreviewLeague}
            disabled={isPreviewLoading || isSubmitting}
            className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPreviewLoading ? 'Consultando...' : 'Consultar liga'}
          </button>

          {leaguePreview && (
            <section className="mt-4 rounded-2xl bg-slate-50 p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-emerald-100 p-2 text-emerald-700">
                  <CheckCircle2 size={21} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-black uppercase tracking-wider text-emerald-700">
                    Liga encontrada
                  </p>

                  <h3 className="mt-1 font-black text-slate-950">
                    {leaguePreview.name}
                  </h3>

                  <p className="mt-1 text-sm font-bold text-slate-500">
                    Código: {leaguePreview.code}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white p-3">
                  <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Entrada
                  </p>
                  <p className="mt-1 text-xl font-black text-slate-950">
                    {formatMoney(entryFee)}
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-3">
                  <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Participantes actuales
                  </p>
                  <p className="mt-1 text-xl font-black text-slate-950">
                    {estimatedParticipants}
                  </p>
                </div>
              </div>

              {leaguePreview.prizeMode === 'winner_takes_all' && (
                <div className="mt-3 rounded-2xl bg-slate-950 p-4 text-white">
                  <p className="text-xs font-black uppercase tracking-wider text-emerald-300">
                    Modalidad
                  </p>

                  <h4 className="mt-1 text-lg font-black">
                    Ganador se lleva todo
                  </h4>

                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Bolsa estimada actual:{' '}
                    <strong className="text-white">
                      {formatMoney(estimatedPrizePool)}
                    </strong>
                  </p>

                  <p className="mt-1 text-xs font-bold text-slate-400">
                    Ejemplo: si entran 10 participantes con entrada de{' '}
                    {formatMoney(entryFee)}, el ganador se lleva{' '}
                    {formatMoney(entryFee * 10)}.
                  </p>
                </div>
              )}

              {leaguePreview.prizeMode !== 'winner_takes_all' && (
                <div className="mt-3 rounded-2xl bg-white p-3">
                  <p className="text-sm font-black text-slate-700">
                    Modalidad: premios configurados
                  </p>
                  <p className="mt-1 text-xs font-bold leading-5 text-slate-500">
                    Los premios serán definidos por el administrador de la liga.
                  </p>
                </div>
              )}
            </section>
          )}

          {errorMessage && (
            <div className="mt-4 rounded-2xl bg-rose-50 p-3 text-sm font-bold leading-6 text-rose-600">
              {errorMessage}
            </div>
          )}

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting || isPreviewLoading}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting || isPreviewLoading}
              className={`rounded-2xl px-4 py-3 text-sm font-black text-white shadow-lg transition ${
                isSubmitting || isPreviewLoading
                  ? 'cursor-not-allowed bg-slate-400 shadow-slate-200'
                  : 'bg-emerald-600 shadow-emerald-200 hover:bg-emerald-700'
              }`}
            >
              {isSubmitting
                ? 'Uniendo...'
                : leaguePreview
                  ? 'Unirme a la liga'
                  : 'Consultar'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default JoinLeagueModal;