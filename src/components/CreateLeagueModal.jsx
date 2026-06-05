import { useState } from 'react';
import { Plus, X } from 'lucide-react';

function CreateLeagueModal({ isOpen, onClose, onCreateLeague }) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    entryFee: 200,
    prizeMode: 'fixed',
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) {
    return null;
  }

  function resetForm() {
    setFormData({
      name: '',
      code: '',
      entryFee: 200,
      prizeMode: 'fixed',
    });

    setErrorMessage('');
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const cleanName = formData.name.trim();
    const cleanCode = formData.code.trim().toUpperCase().replace(/\s+/g, '');
    const cleanEntryFee = Number(formData.entryFee);

    if (!cleanName) {
      setErrorMessage('Escribe el nombre de la liga.');
      return;
    }

    if (!cleanCode) {
      setErrorMessage('Escribe el código de invitación.');
      return;
    }

    if (cleanCode.length < 4) {
      setErrorMessage('El código debe tener al menos 4 caracteres.');
      return;
    }

    if (cleanCode.length > 16) {
      setErrorMessage('El código no debe superar 16 caracteres.');
      return;
    }

    if (!/^[A-Z0-9_-]+$/.test(cleanCode)) {
      setErrorMessage(
        'Usa solo letras, números, guion o guion bajo en el código.'
      );
      return;
    }

    if (Number.isNaN(cleanEntryFee) || cleanEntryFee < 0) {
      setErrorMessage('La entrada debe ser un número válido.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await onCreateLeague({
        name: cleanName,
        code: cleanCode,
        entryFee: cleanEntryFee,
        prizeMode: formData.prizeMode,
      });

      resetForm();
      onClose();
    } catch (error) {
      if (error.message === 'LEAGUE_ALREADY_EXISTS') {
        setErrorMessage('Ya existe una liga con ese código.');
      } else if (error.message === 'INVALID_LEAGUE_NAME') {
        setErrorMessage('Escribe un nombre válido para la liga.');
      } else if (error.message === 'INVALID_LEAGUE_CODE') {
        setErrorMessage('Escribe un código válido para la liga.');
      } else if (error.message === 'LEAGUE_CODE_TOO_SHORT') {
        setErrorMessage('El código debe tener al menos 4 caracteres.');
      } else if (error.message === 'LEAGUE_CODE_TOO_LONG') {
        setErrorMessage('El código no debe superar 16 caracteres.');
      } else if (error.message === 'INVALID_LEAGUE_CODE_FORMAT') {
        setErrorMessage(
          'Usa solo letras, números, guion o guion bajo en el código.'
        );
      } else {
        setErrorMessage('No se pudo crear la liga. Intenta nuevamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleClose() {
    if (isSubmitting) {
      return;
    }

    resetForm();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-4 backdrop-blur-sm sm:items-center">
      <section className="w-full max-w-md rounded-[2rem] bg-white p-5 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <Plus size={24} />
            </div>

            <div>
              <p className="text-sm font-bold text-emerald-700">Nueva liga</p>

              <h2 className="text-2xl font-black text-slate-950">
                Crear quiniela
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Define código, entrada y modalidad de premio.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="rounded-2xl border border-slate-200 bg-white p-2 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Cerrar modal"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-black text-slate-700">
                Nombre de la liga
              </span>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ej. Quiniela Mundial 2026"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-black text-slate-700">
                Código de invitación
              </span>

              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                placeholder="Ej. MUNDIAL26"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-black uppercase tracking-[0.18em] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-black text-slate-700">
                Entrada por participante
              </span>

              <input
                type="number"
                name="entryFee"
                min="0"
                value={formData.entryFee}
                onChange={handleChange}
                placeholder="Ej. 200"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-black text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-black text-slate-700">
                Modalidad de premio
              </span>

              <select
                name="prizeMode"
                value={formData.prizeMode}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-black text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              >
                <option value="fixed">Premios configurados</option>
                <option value="winner_takes_all">
                  Ganador se lleva todo
                </option>
              </select>
            </label>

            {formData.prizeMode === 'winner_takes_all' && (
              <div className="rounded-2xl bg-emerald-50 p-3 text-sm font-bold leading-6 text-emerald-700">
                La bolsa se calculará como: entrada × número de participantes.
                Ejemplo: 10 participantes × ${formData.entryFee || 0} = $
                {(Number(formData.entryFee) || 0) * 10}
              </div>
            )}
          </div>

          {errorMessage && (
            <div className="mt-4 rounded-2xl bg-rose-50 p-3 text-sm font-bold leading-6 text-rose-600">
              {errorMessage}
            </div>
          )}

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`rounded-2xl px-4 py-3 text-sm font-black text-white shadow-lg transition ${
                isSubmitting
                  ? 'cursor-not-allowed bg-slate-400 shadow-slate-200'
                  : 'bg-emerald-600 shadow-emerald-200 hover:bg-emerald-700'
              }`}
            >
              {isSubmitting ? 'Creando...' : 'Crear liga'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default CreateLeagueModal;