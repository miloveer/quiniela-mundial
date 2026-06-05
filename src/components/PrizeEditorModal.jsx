import { useState } from 'react';
import { Gift, Save, X } from 'lucide-react';

const defaultPrizeRows = [
  {
    id: 'prize-001',
    position: '1er lugar',
    title: 'Campeón de la quiniela',
    reward: '$1,000 MXN',
    description: 'Premio principal para quien termine en primer lugar.',
  },
  {
    id: 'prize-002',
    position: '2do lugar',
    title: 'Subcampeón',
    reward: '$500 MXN',
    description: 'Premio para el segundo mejor puntaje.',
  },
  {
    id: 'prize-003',
    position: '3er lugar',
    title: 'Tercer lugar',
    reward: '$250 MXN',
    description: 'Premio de consolación competitiva.',
  },
];

function normalizePrizeRows(prizes = []) {
  if (!Array.isArray(prizes) || prizes.length === 0) {
    return defaultPrizeRows;
  }

  return prizes.map((prize, index) => ({
    id: prize.id || `prize-${String(index + 1).padStart(3, '0')}`,
    position: prize.position || `${index + 1}° lugar`,
    title: prize.title || '',
    reward: prize.reward || '',
    description: prize.description || '',
  }));
}

function PrizeEditorModal({ isOpen, onClose, prizes = [], onSavePrizes }) {
  const [rows, setRows] = useState(() => normalizePrizeRows(prizes));
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) {
    return null;
  }

  function handleChangePrize(index, field, value) {
    setRows((prevRows) =>
      prevRows.map((row, rowIndex) => {
        if (rowIndex !== index) {
          return row;
        }

        return {
          ...row,
          [field]: value,
        };
      })
    );
  }

  function handleAddPrize() {
    const nextNumber = rows.length + 1;

    setRows((prevRows) => [
      ...prevRows,
      {
        id: `prize-${String(nextNumber).padStart(3, '0')}`,
        position: `${nextNumber}° lugar`,
        title: '',
        reward: '',
        description: '',
      },
    ]);
  }

  function handleRemovePrize(index) {
    if (rows.length <= 1) {
      setErrorMessage('Debe existir al menos un premio.');
      return;
    }

    setRows((prevRows) => prevRows.filter((_, rowIndex) => rowIndex !== index));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const hasEmptyFields = rows.some((row) => {
      return (
        !row.position.trim() ||
        !row.title.trim() ||
        !row.reward.trim() ||
        !row.description.trim()
      );
    });

    if (hasEmptyFields) {
      setErrorMessage('Completa todos los campos de cada premio.');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');

    try {
      await onSavePrizes(rows);
      onClose();
    } catch (error) {
      console.error('Error guardando premios:', error);
      setErrorMessage('No se pudieron guardar los premios.');
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
      <section className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] bg-white p-5 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-fuchsia-50 text-fuchsia-600">
              <Gift size={24} />
            </div>

            <div>
              <p className="text-sm font-bold text-emerald-700">
                Configuración de premios
              </p>

              <h2 className="text-2xl font-black text-slate-950">
                Editar premios de la liga
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Define posición, nombre, recompensa y descripción de cada premio.
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
            {rows.map((row, index) => (
              <article
                key={row.id}
                className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-black text-slate-700">
                    Premio #{index + 1}
                  </p>

                  <button
                    type="button"
                    onClick={() => handleRemovePrize(index)}
                    className="rounded-full bg-white px-3 py-1 text-xs font-black text-rose-600 transition hover:bg-rose-50"
                  >
                    Quitar
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-black text-slate-500">
                      Posición
                    </span>

                    <input
                      type="text"
                      value={row.position}
                      onChange={(event) =>
                        handleChangePrize(index, 'position', event.target.value)
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                      placeholder="Ej. 1er lugar"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-xs font-black text-slate-500">
                      Recompensa
                    </span>

                    <input
                      type="text"
                      value={row.reward}
                      onChange={(event) =>
                        handleChangePrize(index, 'reward', event.target.value)
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                      placeholder="Ej. $1,000 MXN"
                    />
                  </label>

                  <label className="block sm:col-span-2">
                    <span className="mb-1.5 block text-xs font-black text-slate-500">
                      Título
                    </span>

                    <input
                      type="text"
                      value={row.title}
                      onChange={(event) =>
                        handleChangePrize(index, 'title', event.target.value)
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                      placeholder="Ej. Campeón de la quiniela"
                    />
                  </label>

                  <label className="block sm:col-span-2">
                    <span className="mb-1.5 block text-xs font-black text-slate-500">
                      Descripción
                    </span>

                    <textarea
                      value={row.description}
                      onChange={(event) =>
                        handleChangePrize(
                          index,
                          'description',
                          event.target.value
                        )
                      }
                      rows={2}
                      className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                      placeholder="Describe el premio"
                    />
                  </label>
                </div>
              </article>
            ))}
          </div>

          {errorMessage && (
            <div className="mt-4 rounded-2xl bg-rose-50 p-3 text-sm font-bold leading-6 text-rose-600">
              {errorMessage}
            </div>
          )}

          <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
            <button
              type="button"
              onClick={handleAddPrize}
              disabled={isSaving}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Agregar premio
            </button>

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
              {isSaving ? 'Guardando...' : 'Guardar premios'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default PrizeEditorModal;