import { CheckCircle2, Clock3, Lock, ListFilter, Trophy } from 'lucide-react';

const filters = [
  {
    id: 'all',
    label: 'Todos',
    icon: ListFilter,
  },
  {
    id: 'pending',
    label: 'Pendientes',
    icon: Clock3,
  },
  {
    id: 'predicted',
    label: 'Pronosticados',
    icon: CheckCircle2,
  },
  {
    id: 'locked',
    label: 'Cerrados',
    icon: Lock,
  },
  {
    id: 'finished',
    label: 'Finalizados',
    icon: Trophy,
  },
];

function MatchFilters({ activeFilter, onChangeFilter, counts = {} }) {
  return (
    <div className="grid gap-2 sm:grid-cols-5">
      {filters.map((filter) => {
        const Icon = filter.icon;
        const isActive = activeFilter === filter.id;

        return (
          <button
            key={filter.id}
            type="button"
            onClick={() => onChangeFilter(filter.id)}
            className={`rounded-2xl border px-3 py-3 text-left transition ${
              isActive
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Icon size={17} />

                <span className="text-xs font-black">
                  {filter.label}
                </span>
              </div>

              <span
                className={`rounded-full px-2 py-0.5 text-xs font-black ${
                  isActive
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {counts[filter.id] || 0}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default MatchFilters;