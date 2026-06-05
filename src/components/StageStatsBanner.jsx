import { CheckCircle2, Clock3, ListChecks, Lock, Trophy } from 'lucide-react';
import { getMatchStatus } from '../utils/matchUtils';

function getStageStats(matches = []) {
  return matches.reduce(
    (accumulator, match) => {
      const status = getMatchStatus(match);

      accumulator.total += 1;
      accumulator[status] += 1;

      return accumulator;
    },
    {
      total: 0,
      pending: 0,
      predicted: 0,
      locked: 0,
      finished: 0,
    }
  );
}

function StatPill({ icon: Icon, label, value }) {
  return (
    <article className="rounded-2xl bg-white p-3 shadow-sm">
      <div className="mb-1 flex items-center gap-2 text-emerald-700">
        <Icon size={16} />
        <p className="text-xs font-black uppercase tracking-wider">{label}</p>
      </div>

      <p className="text-2xl font-black text-slate-950">{value}</p>
    </article>
  );
}

function StageStatsBanner({ stage, matches = [] }) {
  const stats = getStageStats(matches);

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-slate-950 p-5 text-white shadow-sm">
      <div className="mb-4">
        <p className="text-sm font-bold text-emerald-300">
          Resumen de etapa
        </p>

        <h2 className="mt-1 text-2xl font-black">
          {stage?.fullName || stage?.label || 'Etapa'}
        </h2>

        <p className="mt-1 text-sm leading-6 text-slate-400">
          Estado general de tus pronósticos en esta ronda.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-5">
        <StatPill icon={ListChecks} label="Total" value={stats.total} />
        <StatPill icon={Clock3} label="Pendientes" value={stats.pending} />
        <StatPill icon={CheckCircle2} label="Pronosticados" value={stats.predicted} />
        <StatPill icon={Lock} label="Cerrados" value={stats.locked} />
        <StatPill icon={Trophy} label="Finalizados" value={stats.finished} />
      </div>
    </section>
  );
}

export default StageStatsBanner;