import {
  BarChart3,
  ClipboardList,
  History,
  Home,
  ShieldCheck,
} from 'lucide-react';

const navigationItems = [
  {
    id: 'home',
    label: 'Inicio',
    shortLabel: 'Inicio',
    icon: Home,
  },
  {
    id: 'matches',
    label: 'Partidos',
    shortLabel: 'Partidos',
    icon: ClipboardList,
  },
  {
    id: 'ranking',
    label: 'Ranking',
    shortLabel: 'Ranking',
    icon: BarChart3,
  },
  {
    id: 'history',
    label: 'Historial',
    shortLabel: 'Historial',
    icon: History,
  },
  {
    id: 'admin',
    label: 'Admin',
    shortLabel: 'Admin',
    icon: ShieldCheck,
  },
];

function AppNavigation({ activeSection, onChangeSection, showAdmin = true }) {
  const visibleNavigationItems = showAdmin
    ? navigationItems
    : navigationItems.filter((item) => item.id !== 'admin');

  return (
    <>
      {/* Desktop / tablet navigation */}
      <nav className="sticky top-[69px] z-20 hidden border-b border-slate-200 bg-slate-50/90 px-4 py-3 backdrop-blur-xl md:block">
        <div className="mx-auto max-w-6xl overflow-x-auto">
          <div className="flex min-w-max gap-2">
            {visibleNavigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.id === activeSection;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onChangeSection(item.id)}
                  className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-black transition ${
                    isActive
                      ? 'bg-slate-950 text-white shadow-lg shadow-slate-300'
                      : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon size={17} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile bottom navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 shadow-[0_-10px_30px_rgba(15,23,42,0.12)] backdrop-blur-xl md:hidden">
        <div
          className={`grid gap-1 ${
            visibleNavigationItems.length >= 7
              ? 'grid-cols-7'
              : visibleNavigationItems.length === 6
                ? 'grid-cols-6'
                : 'grid-cols-5'
          }`}
        >
          {visibleNavigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === activeSection;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChangeSection(item.id)}
                className={`flex min-w-0 flex-col items-center justify-center rounded-2xl px-1 py-2 text-[10px] font-black transition ${
                  isActive
                    ? 'bg-slate-950 text-white'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <Icon size={18} />

                <span className="mt-1 max-w-full truncate">
                  {item.shortLabel}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}

export default AppNavigation;