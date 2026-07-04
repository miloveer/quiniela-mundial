import { useState, useMemo } from 'react';
import { X, Save } from 'lucide-react';
import { getTeamDisplayName } from '../utils/teamUtils';
import { isKnockoutStage } from '../utils/matchUtils';
import TeamFlag from './TeamFlag';

function AdminManualPredictionModal({
  isOpen,
  onClose,
  users = [],
  matches = [],
  onSavePrediction,
}) {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estado para guardar múltiples pronósticos antes de enviarlos
  const [predictions, setPredictions] = useState({});

  // Filtramos solo los partidos de 16vos (única fase que el admin sigue
  // capturando manualmente; de 8vos en adelante cada quien llena lo suyo)
  const round32Matches = useMemo(() =>
    matches.filter(m => m.stageId === 'round-32'),
  [matches]);

  if (!isOpen) return null;

  const handleScoreChange = (matchId, field, value) => {
    setPredictions(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [field]: value,
      }
    }));
  };

  const handleAdvancesChange = (matchId, team) => {
    setPredictions(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        advancesTeam: team,
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUserId) return;

    setIsSubmitting(true);
    try {
      // Recorremos el objeto de predicciones y guardamos solo las que tienen datos
      for (const [matchId, scores] of Object.entries(predictions)) {
        if (scores.homeScore !== '' && scores.awayScore !== '' && scores.homeScore !== undefined && scores.awayScore !== undefined) {
          const isDraw = Number(scores.homeScore) === Number(scores.awayScore);
          const match = round32Matches.find((m) => m.id === matchId);
          const knockout = match ? isKnockoutStage(match.stageId) : true;

          if (knockout && isDraw && !scores.advancesTeam) {
            alert('Falta elegir quién avanza en un empate de al menos un partido.');
            setIsSubmitting(false);
            return;
          }

          await onSavePrediction({
            userId: selectedUserId,
            matchId,
            homeScore: Number(scores.homeScore),
            awayScore: Number(scores.awayScore),
            advancesTeam: knockout && isDraw ? scores.advancesTeam : null,
          });
        }
      }
      setPredictions({}); // Limpiar estado
      alert('¡Todos los pronósticos de 16vos fueron guardados!');
      onClose(); // Cerramos al terminar
    } catch (error) {
      console.error(error);
      alert('Error al guardar los pronósticos.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <section className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-[2rem] bg-white p-5 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-emerald-700">Administrador</p>
            <h2 className="text-xl font-black text-slate-950">Llenado Masivo 16vos</h2>
          </div>
          <button onClick={onClose} className="rounded-2xl border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50">
            <X size={20} />
          </button>
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-bold text-slate-700">Seleccionar Participante</label>
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:border-emerald-500"
          >
            <option value="">-- Elige al jugador --</option>
            {users.map(u => (
              <option key={u.uid} value={u.uid}>{u.displayName}</option>
            ))}
          </select>
        </div>

        {selectedUserId && (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
              {round32Matches.map((match) => {
                const homeScore = predictions[match.id]?.homeScore ?? '';
                const awayScore = predictions[match.id]?.awayScore ?? '';
                const advancesTeam = predictions[match.id]?.advancesTeam ?? '';
                const isDraftDraw = homeScore !== '' && awayScore !== '' && Number(homeScore) === Number(awayScore);

                return (
                  <div key={match.id} className="border-b pb-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="w-1/2 flex items-center gap-2 min-w-0">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-full ring-1 ring-white shadow-sm">
                          <TeamFlag teamName={match.homeTeam} size="w40" imgClassName="h-full w-full object-cover" emojiClassName="text-sm" />
                        </span>
                        <span className="text-xs font-bold truncate">{getTeamDisplayName(match.homeTeam)} vs {getTeamDisplayName(match.awayTeam)}</span>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <input
                          type="number"
                          inputMode="decimal"
                          pattern="[0-9]*"
                          className="w-12 border border-slate-300 rounded-lg p-1 text-center font-bold"
                          placeholder="0"
                          value={homeScore}
                          onChange={(e) => handleScoreChange(match.id, 'homeScore', e.target.value)}
                        />

                        <input
                          type="number"
                          inputMode="decimal"
                          pattern="[0-9]*"
                          className="w-12 border border-slate-300 rounded-lg p-1 text-center font-bold"
                          placeholder="0"
                          value={awayScore}
                          onChange={(e) => handleScoreChange(match.id, 'awayScore', e.target.value)}
                        />
                      </div>
                    </div>

                    {isDraftDraw && (
                      <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50 p-2">
                        <p className="mb-1.5 text-[10px] font-black text-amber-700">Empate: ¿quién avanza?</p>
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleAdvancesChange(match.id, 'home')}
                            className={`truncate rounded-lg px-2 py-1.5 text-[10px] font-black transition ${advancesTeam === 'home' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
                          >
                            {getTeamDisplayName(match.homeTeam)}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAdvancesChange(match.id, 'away')}
                            className={`truncate rounded-lg px-2 py-1.5 text-[10px] font-black transition ${advancesTeam === 'away' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
                          >
                            {getTeamDisplayName(match.awayTeam)}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 p-3 font-black text-white transition hover:bg-emerald-700 disabled:opacity-50"
            >
              <Save size={20} />
              {isSubmitting ? 'Guardando...' : 'Guardar todos los pronósticos'}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}

export default AdminManualPredictionModal;
