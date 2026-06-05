import { useState } from 'react';
import { Save, Settings2, X } from 'lucide-react';

function LeaguePrizeSettingsModal({
  isOpen,
  onClose,
  entryFee = 200,
  prizeMode = 'fixed',
  onSaveSettings,
}) {
  const [formData, setFormData] = useState(() => ({
    entryFee,
    prizeMode,
  }));

  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) {
    return null;
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

    const cleanEntryFee = Number(formData.entryFee);

    if (Number.isNaN(cleanEntryFee) || cleanEntryFee < 0) {
      setErrorMessage('La entrada debe ser un número válido.');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');

    try {
      await onSaveSettings({
        entryFee: cleanEntryFee,
        prizeMode: formData.prizeMode,
      });

      onClose();
    } catch (error) {
      console.error('Error guardando reglas de premio:', error);
      setErrorMessage('No se pudieron guardar las reglas.');
    } finally {
      setIsSaving(false);
    }
  }

  function handleClose() {
    if (isSaving) {
      return;
    }

    setErrorMessage('');
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-4 backdrop-blur-sm sm:items-center">
      <section className="w-full max-w-md rounded-[2rem] bg-white p-5 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <Settings2 size={24} />
            </div>

            <div>
              <p className="text-sm font-bold text-emerald-700">
                Reglas de premio
              </p>

              <h2 className="text-2xl font-black text-slate-950">
                Editar modalidad
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Define cómo se calcularán los premios de esta liga.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isSaving}
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
                Entrada por participante
              </span>

              <input
                type="number"
                name="entryFee"
                min="0"
                value={formData.entryFee}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-black text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                placeholder="Ej. 200"
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

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-black text-slate-700">
                Vista previa
              </p>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                {formData.prizeMode === 'winner_takes_all'
                  ? `La bolsa se calculará multiplicando participantes por $${Number(
                      formData.entryFee || 0
                    ).toLocaleString('es-MX')}.`
                  : 'Se usarán los premios configurados manualmente por el administrador.'}
              </p>
            </div>
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
              disabled={isSaving}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black text-white shadow-lg transition ${
                isSaving
                  ? 'cursor-not-allowed bg-slate-400 shadow-slate-200'
                  : 'bg-emerald-600 shadow-emerald-200 hover:bg-emerald-700'
              }`}
            >
              <Save size={18} />
              {isSaving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default LeaguePrizeSettingsModal;