import { Mail, Smartphone, UserRound } from 'lucide-react';

function LoginCard() {
  return (
    <section className="rounded-4xl border border-white/70 bg-white p-5 shadow-xl shadow-slate-200/70">
      <div className="mb-5">
        <p className="text-sm font-bold text-emerald-700">Acceso privado</p>
        <h2 className="mt-1 text-2xl font-black text-slate-950">
          Entra a tu quiniela
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Inicia sesión con correo o teléfono. En esta fase solo es visual;
          Firebase entra después, sin drama corporativo.
        </p>
      </div>

      <div className="space-y-3">
        <label className="block">
          <span className="mb-1.5 flex items-center gap-2 text-sm font-bold text-slate-700">
            <UserRound size={16} />
            Nombre visible
          </span>
          <input
            type="text"
            placeholder="Ej. Milo"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 flex items-center gap-2 text-sm font-bold text-slate-700">
            <Mail size={16} />
            Correo
          </span>
          <input
            type="email"
            placeholder="correo@ejemplo.com"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 flex items-center gap-2 text-sm font-bold text-slate-700">
            <Smartphone size={16} />
            Teléfono
          </span>
          <input
            type="tel"
            placeholder="55 1234 5678"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
          />
        </label>
      </div>

      <button className="mt-5 w-full rounded-2xl bg-emerald-600 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-700">
        Continuar
      </button>
    </section>
  );
}

export default LoginCard;