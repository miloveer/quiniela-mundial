import { Crown, Gift, Trophy, UsersRound, Wallet } from 'lucide-react';

function formatMoney(amount) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

function PrizePreviewCard({
  prizes = [],
  participantCount = 0,
  entryFee = 0,
  prizeMode = 'fixed',
  ranking = [],
  onOpenPrizes,
}) {
  const isWinnerTakesAll = prizeMode === 'winner_takes_all';
  const totalPrizePool = participantCount * entryFee;
  const provisionalWinner = ranking[0];
  const firstPrize = prizes[0];

  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm sm:rounded-[2rem] sm:p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-emerald-700">
            Premio actual
          </p>

          <h2 className="text-xl font-black text-slate-950 sm:text-2xl">
            {isWinnerTakesAll ? 'Ganador se lleva todo' : 'Premios configurados'}
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            {isWinnerTakesAll
              ? 'La bolsa se calcula con participantes registrados.'
              : 'Premios definidos por el administrador.'}
          </p>
        </div>

        <div className="rounded-2xl bg-fuchsia-50 p-3 text-fuchsia-600">
          <Gift size={23} />
        </div>
      </div>

      <div className="rounded-[1.5rem] bg-slate-950 p-4 text-white">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-400 px-3 py-1 text-xs font-black text-slate-950">
              {isWinnerTakesAll ? <Wallet size={15} /> : <Trophy size={15} />}
              {isWinnerTakesAll ? 'Bolsa estimada' : 'Primer premio'}
            </div>

            <p className="text-2xl font-black sm:text-3xl">
              {isWinnerTakesAll
                ? formatMoney(totalPrizePool)
                : firstPrize?.reward || 'Sin premio definido'}
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-300">
              {isWinnerTakesAll
                ? `${participantCount} participantes × ${formatMoney(entryFee)}`
                : firstPrize?.title || 'Configura premios desde Admin.'}
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 p-3 text-emerald-300">
            <UsersRound size={22} />
          </div>
        </div>
      </div>

      {provisionalWinner ? (
        <div className="mt-4 rounded-2xl bg-emerald-50 p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-emerald-600 p-2 text-white">
              <Crown size={20} />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-wider text-emerald-700">
                Ganador provisional
              </p>

              <p className="mt-1 truncate text-lg font-black text-slate-950">
                {provisionalWinner.name}
              </p>

              <p className="mt-1 text-xs font-bold text-slate-500">
                {provisionalWinner.points || 0} pts ·{' '}
                {provisionalWinner.exactScores || 0} exactos ·{' '}
                {provisionalWinner.resultHits || 0} aciertos
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-2xl bg-slate-50 p-4">
          <p className="text-sm font-black text-slate-700">
            Aún no hay ganador provisional.
          </p>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Cuando existan pronósticos y resultados, aparecerá aquí.
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={onOpenPrizes}
        className="mt-4 min-h-11 w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white transition hover:bg-slate-800"
      >
        Ver detalle de premios
      </button>
    </section>
  );
}

export default PrizePreviewCard;