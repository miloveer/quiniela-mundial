import {
  CheckCircle2,
  Medal,
  Target,
  Trophy,
  TrendingUp,
} from 'lucide-react';

function SummaryCard({ icon: Icon, label, value, helper }) {
  return (
    <article className="rounded-[1.25rem] border border-slate-200 bg-white p-3 shadow-sm sm:rounded-[1.5rem] sm:p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
          <Icon size={21} />
        </div>

        <p className="text-xl font-black text-slate-950 sm:text-2xl">{value}</p>
      </div>

      <p className="text-sm font-black text-slate-800">{label}</p>

      {helper && (
        <p className="mt-1 text-xs font-bold leading-5 text-slate-400">
          {helper}
        </p>
      )}
    </article>
  );
}

function DashboardSummary({
  completed = 0,
  pending = 0,
  position = '-',
  totalPoints = 0,
  exactScores = 0,
  resultHits = 0,
}) {
  return (
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-3">
      <SummaryCard
        icon={Trophy}
        label="Puntos"
        value={totalPoints}
        helper="Total acumulado con resultados oficiales."
      />

      <SummaryCard
        icon={TrendingUp}
        label="Posición"
        value={position}
        helper="Lugar actual dentro del ranking."
      />

      <SummaryCard
        icon={CheckCircle2}
        label="Pronósticos"
        value={completed}
        helper={`${pending} partidos pendientes por llenar.`}
      />

      <SummaryCard
        icon={Medal}
        label="Marcadores exactos"
        value={exactScores}
        helper="Valen 3 puntos cada uno."
      />

      <SummaryCard
        icon={Target}
        label="Aciertos"
        value={resultHits}
        helper="Ganador o empate correcto."
      />

      <SummaryCard
        icon={CheckCircle2}
        label="Pendientes"
        value={pending}
        helper="Partidos todavía sin pronóstico."
      />
    </section>
  );
}

export default DashboardSummary;