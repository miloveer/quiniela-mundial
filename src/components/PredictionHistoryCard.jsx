import { Download, History, Medal, Target, Trophy } from 'lucide-react';
import {
  calculatePredictionPoints,
  getScoreOutcome,
} from '../utils/scoreUtils';
import { formatMatchDate } from '../utils/matchUtils';
import { getTeamDisplayName, getTeamFlag } from '../utils/teamUtils';

function getPointLabel(points) {
  if (points === 3) return 'Exacto';
  if (points === 1) return 'Acierto';

  return 'Sin puntos';
}

function getPointClasses(points) {
  if (points === 3) return 'bg-amber-50 text-amber-700';
  if (points === 1) return 'bg-emerald-50 text-emerald-700';

  return 'bg-slate-100 text-slate-500';
}

function SummaryPill({ icon: Icon, label, value, className = '' }) {
  return (
    <article className="rounded-2xl bg-white p-3 shadow-sm">
      <div className={`mb-1 flex items-center gap-1.5 ${className}`}>
        <Icon size={15} />

        <p className="text-[10px] font-black uppercase tracking-wider">
          {label}
        </p>
      </div>

      <p className="text-xl font-black text-slate-950">{value}</p>
    </article>
  );
}

function escapeCsvValue(value) {
  const safeValue = value ?? '';

  return `"${safeValue.toString().replace(/"/g, '""')}"`;
}

function downloadCsvFile({ filename, rows }) {
  const csvContent = rows
    .map((row) => row.map(escapeCsvValue).join(','))
    .join('\n');

  const blob = new Blob([`\uFEFF${csvContent}`], {
    type: 'text/csv;charset=utf-8;',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

function PredictionHistoryCard({ matches = [] }) {
  const matchesWithPrediction = matches.filter((match) => match.userPrediction);

  const completedMatches = matchesWithPrediction.filter((match) => match.result);

  const pendingResultMatches = matchesWithPrediction.filter(
    (match) => !match.result
  );

  const totalPoints = matchesWithPrediction.reduce((total, match) => {
    return total + calculatePredictionPoints(match.userPrediction, match.result);
  }, 0);

  const exactScores = completedMatches.filter((match) => {
    return (
      match.userPrediction.homeScore === match.result.homeScore &&
      match.userPrediction.awayScore === match.result.awayScore
    );
  }).length;

  const resultHits = completedMatches.filter((match) => {
    return (
      getScoreOutcome(match.userPrediction) === getScoreOutcome(match.result)
    );
  }).length;

  function handleDownloadHistory() {
    const rows = [
      [
        'Fecha',
        'Etapa',
        'Grupo',
        'Local',
        'Visitante',
        'Pronostico Local',
        'Pronostico Visitante',
        'Resultado Local',
        'Resultado Visitante',
        'Puntos',
        'Estatus',
      ],
      ...matchesWithPrediction.map((match) => {
        const points = calculatePredictionPoints(
          match.userPrediction,
          match.result
        );

        return [
          formatMatchDate(match.date),
          match.stageId || '',
          match.groupName || match.group || '',
          getTeamDisplayName(match.homeTeam),
          getTeamDisplayName(match.awayTeam),
          match.userPrediction?.homeScore ?? '',
          match.userPrediction?.awayScore ?? '',
          match.result?.homeScore ?? '',
          match.result?.awayScore ?? '',
          points,
          match.result ? getPointLabel(points) : 'Resultado pendiente',
        ];
      }),
    ];

    downloadCsvFile({
      filename: 'mis-pronosticos-quiniela.csv',
      rows,
    });
  }

  return (
    <section className="space-y-4">
      <section className="rounded-[1.5rem] border border-white/70 bg-white/80 p-4 shadow-xl shadow-slate-200/70 backdrop-blur sm:rounded-[2rem] sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-bold text-emerald-700">Historial</p>

            <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
              Tus pronósticos
            </h2>

            <p className="mt-2 max-w-xl text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6">
              Consulta tus marcadores capturados, resultados oficiales y puntos
              obtenidos.
            </p>
          </div>

          <div className="rounded-2xl bg-violet-50 p-3 text-violet-600">
            <History size={23} />
          </div>
        </div>

        {matchesWithPrediction.length > 0 && (
          <button
            type="button"
            onClick={handleDownloadHistory}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white transition hover:bg-slate-800 sm:w-fit"
          >
            <Download size={17} />
            Descargar mis pronósticos
          </button>
        )}
      </section>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryPill
          icon={Trophy}
          label="Puntos"
          value={totalPoints}
          className="text-emerald-600"
        />

        <SummaryPill
          icon={Medal}
          label="Exactos"
          value={exactScores}
          className="text-amber-600"
        />

        <SummaryPill
          icon={Target}
          label="Aciertos"
          value={resultHits}
          className="text-violet-600"
        />

        <SummaryPill
          icon={History}
          label="Pendientes"
          value={pendingResultMatches.length}
          className="text-slate-500"
        />
      </div>

      {matchesWithPrediction.length === 0 ? (
        <section className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white/70 p-5 text-center sm:rounded-[2rem] sm:p-6">
          <p className="text-lg font-black text-slate-950">
            Aún no tienes pronósticos
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Ve a la sección de partidos y captura tus marcadores.
          </p>
        </section>
      ) : (
        <section className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm">
          <div className="bg-slate-950 px-3 py-3 text-xs font-black uppercase tracking-wider text-slate-300">
            Historial compacto
          </div>

          <div className="max-h-[620px] overflow-y-auto divide-y divide-slate-100">
            {matchesWithPrediction.map((match) => {
              const points = calculatePredictionPoints(
                match.userPrediction,
                match.result
              );

              const hasResult = Boolean(match.result);
              const homeName = getTeamDisplayName(match.homeTeam);
              const awayName = getTeamDisplayName(match.awayTeam);

              return (
                <article
                  key={match.id}
                  className="grid gap-3 px-3 py-3 sm:grid-cols-[1fr_auto_auto] sm:items-center"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-slate-950">
                      <span className="mr-1">{getTeamFlag(match.homeTeam)}</span>
                      {homeName}
                      <span className="mx-1 text-slate-400">vs</span>
                      <span className="mr-1">{getTeamFlag(match.awayTeam)}</span>
                      {awayName}
                    </p>

                    <p className="mt-1 truncate text-[11px] font-bold text-slate-400">
                      {formatMatchDate(match.date)} ·{' '}
                      {match.groupName || match.group || match.stageId || ''}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center sm:w-[190px]">
                    <div className="rounded-2xl bg-slate-50 px-3 py-2">
                      <p className="text-[10px] font-bold uppercase text-slate-400">
                        Tú
                      </p>

                      <p className="text-sm font-black text-slate-950">
                        {match.userPrediction.homeScore} -{' '}
                        {match.userPrediction.awayScore}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 px-3 py-2">
                      <p className="text-[10px] font-bold uppercase text-slate-400">
                        Oficial
                      </p>

                      <p className="text-sm font-black text-slate-950">
                        {hasResult
                          ? `${match.result.homeScore} - ${match.result.awayScore}`
                          : '—'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 sm:w-[150px] sm:justify-end">
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-black ${
                        hasResult
                          ? getPointClasses(points)
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {hasResult ? getPointLabel(points) : 'Pendiente'}
                    </span>

                    <span className="rounded-2xl bg-slate-950 px-3 py-2 text-sm font-black text-white">
                      +{points}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </section>
  );
}

export default PredictionHistoryCard;