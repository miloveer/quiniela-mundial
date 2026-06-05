import { useState } from 'react';
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Trophy,
  UserRound,
  UsersRound,
} from 'lucide-react';
import { loginWithEmail, registerWithEmail } from '../services/authService';

function getFriendlyAuthError(error) {
  const code = error?.code;

  if (code === 'auth/email-already-in-use') {
    return 'Ese correo ya está registrado. Intenta iniciar sesión.';
  }

  if (code === 'auth/invalid-email') {
    return 'El correo no tiene un formato válido.';
  }

  if (code === 'auth/weak-password') {
    return 'La contraseña es muy débil. Usa al menos 6 caracteres.';
  }

  if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
    return 'Correo o contraseña incorrectos.';
  }

  if (code === 'auth/wrong-password') {
    return 'La contraseña es incorrecta.';
  }

  if (code === 'auth/operation-not-allowed') {
    return 'El acceso con correo/contraseña no está activado en Firebase.';
  }

  return 'Ocurrió un error al autenticar. Revisa tus datos e intenta de nuevo.';
}

function LoginPage({ onLogin }) {
  const [authMode, setAuthMode] = useState('register');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    leagueCode: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');

  const isRegisterMode = authMode === 'register';

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  }

  function validateForm() {
    if (isRegisterMode && !formData.displayName.trim()) {
      return 'Escribe tu nombre visible.';
    }

    if (!formData.email.trim()) {
      return 'Escribe tu correo.';
    }

    if (!formData.password.trim()) {
      return 'Escribe tu contraseña.';
    }

    if (formData.password.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres.';
    }

    return '';
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setAuthError(validationError);
      return;
    }

    setIsSubmitting(true);
    setAuthError('');

    try {
      const firebaseUser = isRegisterMode
        ? await registerWithEmail({
            email: formData.email.trim(),
            password: formData.password,
            displayName: formData.displayName.trim(),
          })
        : await loginWithEmail({
            email: formData.email.trim(),
            password: formData.password,
          });

      const userData = {
        uid: firebaseUser.uid,
        displayName:
          firebaseUser.displayName || formData.displayName.trim() || 'Usuario',
        email: firebaseUser.email,
        emailOrPhone: firebaseUser.email,
        leagueCode: formData.leagueCode.trim() || null,
      };

      onLogin(userData);
    } catch (error) {
      setAuthError(getFriendlyAuthError(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#bbf7d0,transparent_34%),linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] px-4 py-6">
      <section className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl flex-col justify-center">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <section className="order-2 lg:order-1">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-4 py-2 text-sm font-black text-emerald-700 shadow-sm backdrop-blur">
              <Trophy size={18} />
              Quiniela Mundial 2026
            </div>

            <h1 className="max-w-2xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Compite con tu familia y presume tus pronósticos.
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              Registra marcadores, revisa rankings, compara resultados y entra
              a ligas privadas con código de invitación.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <article className="rounded-[1.5rem] border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                  <ShieldCheck size={22} />
                </div>
                <h2 className="font-black text-slate-950">Cuenta real</h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Registro e inicio de sesión con Firebase.
                </p>
              </article>

              <article className="rounded-[1.5rem] border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                  <LockKeyhole size={22} />
                </div>
                <h2 className="font-black text-slate-950">Liga privada</h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Puedes entrar con código o unirte después.
                </p>
              </article>

              <article className="rounded-[1.5rem] border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                  <UsersRound size={22} />
                </div>
                <h2 className="font-black text-slate-950">Ranking</h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Puntos, historial y comparación entre usuarios.
                </p>
              </article>
            </div>
          </section>

          <section className="order-1 lg:order-2">
            <form
              onSubmit={handleSubmit}
              className="mx-auto w-full max-w-md rounded-[2rem] border border-white/80 bg-white/90 p-5 shadow-2xl shadow-slate-300/70 backdrop-blur sm:p-6"
            >
              <div className="mb-5 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-slate-950 text-white shadow-lg shadow-slate-300">
                  <Trophy size={32} />
                </div>

                <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-700">
                  Acceso privado
                </p>

                <h2 className="mt-2 text-3xl font-black text-slate-950">
                  {isRegisterMode ? 'Crear cuenta' : 'Iniciar sesión'}
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {isRegisterMode
                    ? 'Regístrate con correo y contraseña para entrar a tu quiniela.'
                    : 'Ingresa con tu correo y contraseña registrados.'}
                </p>
              </div>

              <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setAuthError('');
                  }}
                  className={`rounded-xl px-4 py-2.5 text-sm font-black transition ${
                    isRegisterMode
                      ? 'bg-white text-slate-950 shadow-sm'
                      : 'text-slate-500'
                  }`}
                >
                  Registro
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setAuthError('');
                  }}
                  className={`rounded-xl px-4 py-2.5 text-sm font-black transition ${
                    !isRegisterMode
                      ? 'bg-white text-slate-950 shadow-sm'
                      : 'text-slate-500'
                  }`}
                >
                  Login
                </button>
              </div>

              <div className="space-y-4">
                {isRegisterMode && (
                  <label className="block">
                    <span className="mb-1.5 flex items-center gap-2 text-sm font-black text-slate-700">
                      <UserRound size={16} />
                      Nombre visible
                    </span>

                    <input
                      type="text"
                      name="displayName"
                      value={formData.displayName}
                      onChange={handleChange}
                      placeholder="Ej. Milo"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                    />
                  </label>
                )}

                <label className="block">
                  <span className="mb-1.5 flex items-center gap-2 text-sm font-black text-slate-700">
                    <Mail size={16} />
                    Correo
                  </span>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="correo@ejemplo.com"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 flex items-center gap-2 text-sm font-black text-slate-700">
                    <LockKeyhole size={16} />
                    Contraseña
                  </span>

                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-12 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl bg-white p-1.5 text-slate-400"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </label>

                {isRegisterMode && (
                  <label className="block">
                    <span className="mb-1.5 flex items-center gap-2 text-sm font-black text-slate-700">
                      <LockKeyhole size={16} />
                      Código de liga opcional
                    </span>

                    <input
                      type="text"
                      name="leagueCode"
                      value={formData.leagueCode}
                      onChange={handleChange}
                      placeholder="Ej. MUNDIAL26"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-black uppercase tracking-[0.18em] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                    />
                  </label>
                )}
              </div>

              {authError && (
                <div className="mt-5 rounded-2xl bg-rose-50 p-3 text-sm font-bold leading-6 text-rose-600">
                  {authError}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`mt-6 flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-black text-white shadow-lg transition ${
                  isSubmitting
                    ? 'cursor-not-allowed bg-slate-400 shadow-slate-200'
                    : 'bg-emerald-600 shadow-emerald-200 hover:-translate-y-0.5 hover:bg-emerald-700'
                }`}
              >
                {isSubmitting
                  ? 'Procesando...'
                  : isRegisterMode
                    ? 'Crear cuenta'
                    : 'Entrar'}
                {!isSubmitting && <ArrowRight size={18} />}
              </button>

              <p className="mt-4 text-center text-xs font-semibold leading-5 text-slate-400">
                Autenticación conectada a Firebase. Los datos de quiniela aún
                siguen en modo local/mock.
              </p>
            </form>
          </section>
        </div>
      </section>
    </main>
  );
}

export default LoginPage;