import { useMemo, useState } from 'react';
import { Check, Search, Trophy, X } from 'lucide-react';
import { formatMatchDate } from '../utils/matchUtils';

function ResultModal({
  isOpen,
  onClose,
  matches = [],
  onSaveResult,
  onClearResult,
}) {
  const [searchText, setSearchText] = useState('');
  const [selectedMatchId, setSelectedMatchId] = useState('');
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const filteredMatches = useMemo(() => {
    const cleanSearch = searchText.trim().toLowerCase();

    if (!cleanSearch) {
      return matches;
    }

    return matches.filter((match) => {
      return (
        match.homeTeam.toLowerCase().includes(cleanSearch) ||
        match.awayTeam.toLowerCase().includes(cleanSearch) ||
        match.stadium.toLowerCase().includes(cleanSearch)
      );
    });
  }, [matches, searchText]);

  const selectedMatch = matches.find((match) => match.id === selectedMatchId);

  if (!isOpen) {
    return null;
  }

  function handleSelectMatch(match) {
    setSelectedMatchId(match.id);
    setHomeScore(match.result?.homeScore ?? '');
    setAwayScore(match.result?.awayScore ?? '');
    setErrorMessage('');
  }

  function handleSaveResult() {
    if (!selectedMatch) {
      setErrorMessage('Selecciona un partido.');
      return;
    }

    if (homeScore === '' || awayScore === '') {
      setErrorMessage('Captura ambos marcadores.');
      return;
    }

    const parsedHomeScore = Number(homeScore);
    const parsedAwayScore = Number(awayScore);

    if (
      Number.isNaN(parsedHomeScore) ||
      Number.isNaN(parsedAwayScore) ||
      parsedHomeScore < 0 ||
      parsedAwayScore < 0
    ) {
      setErrorMessage('Los marcadores deben ser números válidos mayores o iguales a 0.');
      return;
    }

    onSaveResult(selectedMatch.id, {
      homeScore: parsedHomeScore,
      awayScore: parsedAwayScore,
    });

    setErrorMessage('');
    setSelectedMatchId('');
    setHomeScore('');
    setAwayScore('');
  }

  function handleClearSelectedResult() {
  if (!selectedMatch) {
    setErrorMessage('Selecciona un partido.');
    return;
  }

  if (!selectedMatch.result) {
    setErrorMessage('Este partido todavía no tiene resultado oficial.');
    return;
  }

  const confirmClear = window.confirm(
    '¿Seguro que quieres quitar el resultado oficial de este partido?'
  );

  if (!confirmClear) {
    return;
  }

  onClearResult(selectedMatch.id);

  setErrorMessage('');
  setSelectedMatchId('');
  setHomeScore('');
  setAwayScore('');
}

  function handleClose() {
    setSearchText('');
    setSelectedMatchId('');
    setHomeScore('');
    setAwayScore('');
    setErrorMessage('');
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-4 backdrop-blur-sm sm:items-center">
      <section className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] bg-white p-5 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <Trophy size={24} />
            </div>

            <div>
              <p className="text-sm font-bold text-emerald-700">
                Resultados oficiales
              </p>

              <h2 className="text-2xl font-black text-slate-950">
                Actualizar marcador final
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Selecciona un partido, captura el resultado y el ranking se actualizará.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="rounded-2xl border border-slate-200 bg-white p-2 text-slate-500 transition hover:bg-slate-50"
            aria-label="Cerrar modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-[1.5rem] bg-slate-50 p-4">
            <label className="mb-4 block">
              <span className="mb-1.5 block text-xs font-black text-slate-500">
                Buscar partido
              </span>

              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2.5">
                <Search size={18} className="text-slate-400" />

                <input
                  type="text"
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  placeholder="Buscar por equipo o sede"
                  className="w-full bg-transparent text-sm font-bold text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>
            </label>

            <div className="space-y-3">
              {filteredMatches.length === 0 ? (
                <div className="rounded-2xl bg-white p-4">
                  <p className="text-sm font-black text-slate-700">
                    No hay partidos con ese filtro.
                  </p>
                </div>
              ) : (
                filteredMatches.map((match) => {
                  const isSelected = selectedMatchId === match.id;
                  const hasResult = Boolean(match.result);

                  return (
                    <button
                      key={match.id}
                      type="button"
                      onClick={() => handleSelectMatch(match)}
                      className={`w-full rounded-2xl border p-4 text-left transition ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-slate-200 bg-white hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-black text-slate-950">
                            {match.homeTeam} vs {match.awayTeam}
                          </p>

                          <p className="mt-1 text-xs font-bold text-slate-400">
                            {formatMatchDate(match.date)} · {match.stadium}
                          </p>
                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-black ${
                            hasResult
                              ? 'bg-slate-950 text-white'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {hasResult ? 'Con resultado' : 'Pendiente'}
                        </span>
                      </div>

                      {hasResult && (
                        <p className="mt-2 text-sm font-black text-emerald-700">
                          Resultado: {match.result.homeScore} - {match.result.awayScore}
                        </p>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-slate-200 bg-white p-4">
            <p className="text-sm font-bold text-emerald-700">
              Marcador oficial
            </p>

            {selectedMatch ? (
              <>
                <h3 className="mt-1 text-xl font-black text-slate-950">
                  {selectedMatch.homeTeam} vs {selectedMatch.awayTeam}
                </h3>

                <p className="mt-1 text-xs font-bold text-slate-400">
                  {formatMatchDate(selectedMatch.date)}
                </p>

                <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                  <label className="block">
                    <span className="mb-1.5 block text-center text-xs font-black text-slate-500">
                      {selectedMatch.homeTeam}
                    </span>

                    <input
                      type="number"
                      min="0"
                      value={homeScore}
                      onChange={(event) => setHomeScore(event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-center text-2xl font-black text-slate-950 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                      placeholder="0"
                    />
                  </label>

                  <span className="pt-6 text-sm font-black text-slate-400">
                    -
                  </span>

                  <label className="block">
                    <span className="mb-1.5 block text-center text-xs font-black text-slate-500">
                      {selectedMatch.awayTeam}
                    </span>

                    <input
                      type="number"
                      min="0"
                      value={awayScore}
                      onChange={(event) => setAwayScore(event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-center text-2xl font-black text-slate-950 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                      placeholder="0"
                    />
                  </label>
                </div>

                {errorMessage && (
                  <div className="mt-4 rounded-2xl bg-rose-50 p-3 text-sm font-bold leading-6 text-rose-600">
                    {errorMessage}
                  </div>
                )}

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
  <button
    type="button"
    onClick={handleSaveResult}
    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-700"
  >
    <Check size={18} />
    Guardar resultado
  </button>

  <button
    type="button"
    onClick={handleClearSelectedResult}
    disabled={!selectedMatch?.result}
    className={`flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black transition ${
      selectedMatch?.result
        ? 'bg-rose-600 text-white hover:bg-rose-700'
        : 'cursor-not-allowed bg-slate-200 text-slate-400'
    }`}
  >
    <X size={18} />
    Quitar resultado
  </button>
</div>
              </>
            ) : (
              <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-black text-slate-700">
                  Selecciona un partido.
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Al guardar el resultado oficial, se calcularán los puntos de los usuarios.
                </p>
              </div>
            )}
          </section>
        </div>
      </section>
    </div>
  );
}

export default ResultModal;