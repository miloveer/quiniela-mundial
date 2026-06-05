import {
  Crown,
  Gift,
  Medal,
  Sparkles,
  Trophy,
  UsersRound,
  Wallet,
} from 'lucide-react';

function getPrizeIcon(index) {
  if (index === 0) {
    return Trophy;
  }

  if (index === 1 || index === 2) {
    return Medal;
  }

  return Sparkles;
}

function formatMoney(amount) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

function PrizesCard({
  prizes = [],
  participantCount = 0,
  entryFee = 100,
  useDynamicPrize = false,
  ranking = [],
}) {
  const totalPrizePool = participantCount * entryFee;
  const provisionalWinner = ranking[0];

  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm sm:rounded-[2rem] sm:p-5">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-emerald-700">
            Premios de la quiniela
          </p>

          <h2 className="text-xl font-black text-slate-950 sm:text-2xl">
            {useDynamicPrize ? 'Ganador se lleva todo' : 'Premios configurados'}
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            {useDynamicPrize
              ? 'La bolsa se calcula automáticamente con la entrada y los participantes registrados.'
              : 'Los premios son definidos por el administrador de la liga.'}
          </p>
        </div>

        <div className="rounded-2xl bg-fuchsia-50 p-3 text-fuchsia-600">
          <Gift size={23} />
        </div>
      </div>

      {provisionalWinner && (
        <article className="mb-4 rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-3 sm:p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white">
              <Crown size={22} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-black uppercase tracking-wider text-emerald-700">
                Ganador provisional
              </p>

              <h3 className="mt-1 truncate text-lg font-black text-slate-950 sm:text-xl">
                {provisionalWinner.name}
              </h3>

              <p className="mt-1 text-sm font-bold text-slate-600">
                {provisionalWinner.points || 0} pts ·{' '}
                {provisionalWinner.exactScores || 0} exactos ·{' '}
                {provisionalWinner.resultHits || 0} aciertos
              </p>
            </div>
          </div>
        </article>
      )}

      {useDynamicPrize ? (
        <div className="space-y-4">
          <article className="overflow-hidden rounded-[1.5rem] bg-slate-950 p-4 text-white sm:rounded-[1.7rem] sm:p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-400 px-3 py-1 text-xs font-black text-slate-950">
                  <Crown size={15} />
                  Premio principal
                </div>

                <h3 className="text-3xl font-black sm:text-3xl">
                  {formatMoney(totalPrizePool)}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Bolsa estimada para el primer lugar.
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 p-3 text-emerald-300">
                <Wallet size={24} />
              </div>
            </div>

            <div className="mt-4 grid gap-2 sm:mt-5 sm:grid-cols-3 sm:gap-3">
              <div className="rounded-2xl bg-white/10 p-3 sm:p-4">
                <div className="mb-2 flex items-center gap-2 text-emerald-300">
                  <UsersRound size={18} />

                  <p className="text-xs font-black uppercase tracking-wider">
                    Participantes
                  </p>
                </div>

                <p className="text-2xl font-black">{participantCount}</p>
              </div>

              <div className="rounded-2xl bg-white/10 p-3 sm:p-4">
                <p className="text-xs font-black uppercase tracking-wider text-emerald-300">
                  Entrada
                </p>

                <p className="mt-2 text-2xl font-black">
                  {formatMoney(entryFee)}
                </p>
              </div>

              <div className="rounded-2xl bg-emerald-400 p-4 text-slate-950">
                <p className="text-xs font-black uppercase tracking-wider">
                  Cálculo
                </p>

                <p className="mt-2 text-lg font-black">
                  {participantCount} × {formatMoney(entryFee)}
                </p>
              </div>
            </div>
          </article>

          <div className="rounded-2xl bg-emerald-50 p-4">
            <p className="text-sm font-black text-emerald-700">
              Modalidad activa
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-600">
              El primer lugar recibe toda la bolsa estimada. No se reparten
              premios para segundo ni tercer lugar en esta modalidad.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {prizes.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-black text-slate-700">
                Aún no hay premios configurados.
              </p>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                El administrador puede configurar los premios de esta liga desde
                el panel admin.
              </p>
            </div>
          ) : (
            prizes.map((prize, index) => {
              const Icon = getPrizeIcon(index);
              const possibleWinner = ranking[index];

              return (
                <article
                  key={prize.id}
                  className={`rounded-2xl p-3 sm:p-4 ${
                    index === 0
                      ? 'bg-amber-50'
                      : index === prizes.length - 1
                        ? 'bg-fuchsia-50'
                        : 'bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl sm:h-11 sm:w-11 ${
                        index === 0
                          ? 'bg-amber-500 text-white'
                          : index === prizes.length - 1
                            ? 'bg-fuchsia-600 text-white'
                            : 'bg-white text-slate-700'
                      }`}
                    >
                      <Icon size={21} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm font-black text-emerald-700">
                          {prize.position}
                        </p>

                        <p className="text-sm font-black text-slate-950">
                          {prize.reward}
                        </p>
                      </div>

                      <h3 className="mt-1 font-black text-slate-950">
                        {prize.title}
                      </h3>

                      <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6">
                        {prize.description}
                      </p>

                      {possibleWinner && (
                        <p className="mt-3 rounded-2xl bg-white px-3 py-2 text-xs font-black text-slate-600">
                          Provisional:{' '}
                          <span className="text-slate-950">
                            {possibleWinner.name}
                          </span>{' '}
                          · {possibleWinner.points || 0} pts
                        </p>
                      )}
                    </div>
                  </div>
                </article>
              );
            })
          )}

          <p className="rounded-2xl bg-slate-50 p-3 text-xs font-bold leading-5 text-slate-500">
            Modalidad activa: premios configurados por el administrador.
          </p>
        </div>
      )}
    </section>
  );
}

export default PrizesCard;