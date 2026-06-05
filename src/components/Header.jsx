import { LogOut, Trophy } from 'lucide-react';

function getShortName(displayName = '') {
  const cleanName = displayName.trim();

  if (!cleanName) {
    return 'Invitado';
  }

  const [firstName] = cleanName.split(' ');

  return firstName || cleanName;
}

function Header({ user, onLogout }) {
  const displayName = user?.displayName || 'Familia League';
  const shortName = getShortName(displayName);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2.5 md:py-3">
        <div className="flex min-w-0 items-center gap-2.5 md:gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-200 md:h-11 md:w-11">
            <Trophy size={21} />
          </div>

          <div className="min-w-0">
            <p className="truncate text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700 md:text-xs md:tracking-[0.18em]">
              Quiniela Mundial
            </p>

            <h1 className="truncate text-base font-black leading-tight text-slate-950 md:text-lg">
              <span className="md:hidden">{shortName}</span>
              <span className="hidden md:inline">{displayName}</span>
            </h1>
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-2 rounded-2xl bg-slate-950 px-3 py-2 text-xs font-black text-white shadow-sm transition hover:bg-slate-800 md:px-4 md:py-2.5 md:text-sm"
          title="Cerrar sesión"
        >
          <LogOut size={17} />

          <span className="hidden sm:inline">Salir</span>
        </button>
      </div>
    </header>
  );
}

export default Header;