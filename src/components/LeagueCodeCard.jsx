import { KeyRound, UsersRound } from 'lucide-react';

function LeagueCodeCard() {
  return (
    <section className="rounded-4xl bg-slate-950 p-5 text-white shadow-xl shadow-slate-300">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-sm font-bold text-emerald-300">
            <UsersRound size={17} />
            Liga privada
          </p>
          <h2 className="mt-2 text-2xl font-black">Únete con código</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Solo entra quien tenga invitación. Control familiar, cero colados.
          </p>
        </div>

        <div className="rounded-2xl bg-white/10 p-3">
          <KeyRound size={24} />
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        <input
          type="text"
          placeholder="MUNDIAL26"
          className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-bold uppercase tracking-widest text-white outline-none placeholder:text-slate-400 focus:border-emerald-400"
        />

        <button className="rounded-2xl bg-white px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-emerald-100">
          Unirme
        </button>
      </div>
    </section>
  );
}

export default LeagueCodeCard;