import { useState } from 'react';
import { X, Save } from 'lucide-react';
import { getTeamDisplayName, getTeamFlag } from '../utils/teamUtils';
import { formatMatchDate } from '../utils/matchUtils';

function AdminManualPredictionModal({
  isOpen,
  onClose,
  users = [],
  matches = [],
  onSavePrediction,
}) {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedMatchId, setSelectedMatchId] = useState('');
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUserId || !selectedMatchId || homeScore === '' || awayScore === '') return;
    
    setIsSubmitting(true);
    try {
      await onSavePrediction({
        userId: selectedUserId,
        matchId: selectedMatchId,
        homeScore: Number(homeScore),
        awayScore: Number(awayScore),
      });
      // Limpiar formulario para seguir capturando rápido
      setHomeScore('');
      setAwayScore('');
      setSelectedMatchId('');
      alert('¡Pronóstico guardado con éxito!');
    } catch (error) {
      console.error(error);
      alert('Error al guardar el pronóstico. Revisa la consola o los permisos de Supabase.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedMatch = matches.find((m) => String(m.id) === selectedMatchId);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-4 backdrop-blur-sm sm:items-center">
      <section className="w-full max-w-md rounded-[2rem] bg-white p-5 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-emerald-700">Modo Administrador</p>
            <h2 className="mt-1 text-xl font-black text-slate-950">Capturar Pronóstico</h2>
          </div>
          <button onClick={onClose} className="rounded-2xl border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-bold text-slate-700">Seleccionar Participante</label>
            <select
              required
              className="w-full rounded-xl border border-slate-300 p-3 text-sm"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
            >
              <option value="">-- Elige un usuario --</option>
              {users.map((u) => (
                <option key={u.userId || u.id} value={u.userId || u.id}>
                  {u.displayName || u.name || u.email || 'Usuario'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-bold text-slate-700">Seleccionar Partido</label>
            <select
              required
              className="w-full rounded-xl border border-slate-300 p-3 text-sm"
              value={selectedMatchId}
              onChange={(e) => setSelectedMatchId(e.target.value)}
            >
              <option value="">-- Elige un partido --</option>
              {matches.map((m) => (
                <option key={m.id} value={m.id}>
                  {getTeamDisplayName(m.homeTeam)} vs {getTeamDisplayName(m.awayTeam)} - {formatMatchDate(m.date)}
                </option>
              ))}
            </select>
          </div>

          {selectedMatch && (
            <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-4">
              <div className="text-center">
                <span className="text-2xl block">{getTeamFlag(selectedMatch.homeTeam)}</span>
                <p className="text-xs font-bold truncate max-w-[80px]">{getTeamDisplayName(selectedMatch.homeTeam)}</p>
                <input
                  type="number"
                  min="0"
                  required
                  value={homeScore}
                  onChange={(e) => setHomeScore(e.target.value)}
                  className="mt-2 w-16 rounded-lg border border-slate-300 p-2 text-center font-black"
                />
              </div>
              <span className="text-xl font-black text-slate-400">VS</span>
              <div className="text-center">
                <span className="text-2xl block">{getTeamFlag(selectedMatch.awayTeam)}</span>
                <p className="text-xs font-bold truncate max-w-[80px]">{getTeamDisplayName(selectedMatch.awayTeam)}</p>
                <input
                  type="number"
                  min="0"
                  required
                  value={awayScore}
                  onChange={(e) => setAwayScore(e.target.value)}
                  className="mt-2 w-16 rounded-lg border border-slate-300 p-2 text-center font-black"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 p-3 font-black text-slate-950 transition hover:bg-emerald-300 disabled:opacity-50"
          >
            <Save size={20} />
            {isSubmitting ? 'Guardando...' : 'Guardar Pronóstico'}
          </button>
        </form>
      </section>
    </div>
  );
}

export default AdminManualPredictionModal;