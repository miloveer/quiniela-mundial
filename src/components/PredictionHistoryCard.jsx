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

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function getDateKey(matchDate) {
  const date = new Date(matchDate);

  return date.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

function getDateLabel(matchDate) {
  const date = new Date(matchDate);

  return date.toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function groupMatchesByDay(matches = []) {
  const sortedMatches = [...matches].sort((firstMatch, secondMatch) => {
    return new Date(firstMatch.date).getTime() - new Date(secondMatch.date).getTime();
  });

  const groupsMap = new Map();

  sortedMatches.forEach((match) => {
    const key = getDateKey(match.date);

    if (!groupsMap.has(key)) {
      groupsMap.set(key, {
        key,
        label: getDateLabel(match.date),
        matches: [],
      });
    }

    groupsMap.get(key).matches.push(match);
  });

  return Array.from(groupsMap.values());
}

function openPredictionsPdf({
  matchesWithPrediction,
  userName,
  leagueName,
  totalPoints,
  exactScores,
  resultHits,
}) {
  const groupedMatches = groupMatchesByDay(matchesWithPrediction);

  const content = groupedMatches
    .map((group) => {
      const rows = group.matches
        .map((match) => {
          const points = calculatePredictionPoints(
            match.userPrediction,
            match.result
          );

          const homeName = getTeamDisplayName(match.homeTeam);
          const awayName = getTeamDisplayName(match.awayTeam);

          return `
            <article class="match-card">
              <div>
                <p class="teams">
                  ${escapeHtml(homeName)}
                  <span>vs</span>
                  ${escapeHtml(awayName)}
                </p>
                <p class="meta">${escapeHtml(formatMatchDate(match.date))}</p>
              </div>

              <div class="score-box">
                <p class="score-label">Mi pronóstico</p>
                <p class="score">${escapeHtml(match.userPrediction.homeScore)} - ${escapeHtml(match.userPrediction.awayScore)}</p>
              </div>

              <div class="score-box secondary">
                <p class="score-label">Oficial</p>
                <p class="score">
                  ${
                    match.result
                      ? `${escapeHtml(match.result.homeScore)} - ${escapeHtml(match.result.awayScore)}`
                      : '—'
                  }
                </p>
              </div>

              <div class="points">
                +${points}
              </div>
            </article>
          `;
        })
        .join('');

      return `
        <section class="day-section">
          <h2>${escapeHtml(group.label)}</h2>
          ${rows}
        </section>
      `;
    })
    .join('');

  const html = `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Mis pronósticos - Quinielazo</title>

        <style>
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            padding: 32px;
            font-family: Arial, sans-serif;
            color: #0f172a;
            background: #f8fafc;
          }

          .page {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            border-radius: 24px;
            padding: 28px;
            border: 1px solid #e2e8f0;
          }

          .header {
            border-radius: 22px;
            padding: 24px;
            color: white;
            background: linear-gradient(135deg, #0f172a, #059669);
          }

          .brand {
            margin: 0;
            font-size: 13px;
            font-weight: 900;
            letter-spacing: 2px;
            text-transform: uppercase;
            color: #bbf7d0;
          }

          h1 {
            margin: 8px 0 0;
            font-size: 32px;
            line-height: 1.1;
          }

          .subtitle {
            margin: 8px 0 0;
            font-size: 14px;
            color: #d1fae5;
          }

          .summary {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            margin-top: 18px;
          }

          .summary-card {
            border-radius: 18px;
            padding: 14px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
          }

          .summary-card p {
            margin: 0;
          }

          .summary-label {
            font-size: 10px;
            color: #64748b;
            text-transform: uppercase;
            font-weight: 900;
            letter-spacing: 1px;
          }

          .summary-value {
            margin-top: 4px !important;
            font-size: 24px;
            font-weight: 900;
          }

          .day-section {
            margin-top: 28px;
          }

          .day-section h2 {
            margin: 0 0 12px;
            font-size: 18px;
            text-transform: capitalize;
          }

          .match-card {
            display: grid;
            grid-template-columns: 1fr 120px 100px 60px;
            gap: 12px;
            align-items: center;
            padding: 14px;
            border-radius: 18px;
            border: 1px solid #e2e8f0;
            margin-bottom: 10px;
            page-break-inside: avoid;
          }

          .teams {
            margin: 0;
            font-size: 15px;
            font-weight: 900;
          }

          .teams span {
            color: #94a3b8;
            margin: 0 6px;
          }

          .meta {
            margin: 4px 0 0;
            font-size: 11px;
            color: #64748b;
            font-weight: 700;
          }

          .score-box {
            text-align: center;
            border-radius: 16px;
            background: #ecfdf5;
            padding: 10px;
          }

          .score-box.secondary {
            background: #f1f5f9;
          }

          .score-label {
            margin: 0;
            font-size: 9px;
            color: #64748b;
            font-weight: 900;
            text-transform: uppercase;
          }

          .score {
            margin: 4px 0 0;
            font-size: 18px;
            font-weight: 900;
          }

          .points {
            text-align: center;
            border-radius: 16px;
            background: #0f172a;
            color: white;
            padding: 12px;
            font-size: 16px;
            font-weight: 900;
          }

          @media print {
            body {
              background: white;
              padding: 0;
            }

            .page {
              border: none;
              border-radius: 0;
            }
          }
        </style>
      </head>

      <body>
        <main class="page">
          <section class="header">
            <p class="brand">Quinielazo</p>
            <h1>Pronósticos de ${escapeHtml(userName)}</h1>
            <p class="subtitle">Liga: ${escapeHtml(leagueName)}</p>
          </section>

          <section class="summary">
            <article class="summary-card">
              <p class="summary-label">Partidos</p>
              <p class="summary-value">${matchesWithPrediction.length}</p>
            </article>

            <article class="summary-card">
              <p class="summary-label">Puntos</p>
              <p class="summary-value">${totalPoints}</p>
            </article>

            <article class="summary-card">
              <p class="summary-label">Exactos</p>
              <p class="summary-value">${exactScores}</p>
            </article>

            <article class="summary-card">
              <p class="summary-label">Aciertos</p>
              <p class="summary-value">${resultHits}</p>
            </article>
          </section>

          ${content}
        </main>

        <script>
          window.onload = function () {
            window.focus();
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  const printWindow = window.open('', '_blank', 'width=1000,height=800');

  if (!printWindow) {
    alert('Permite las ventanas emergentes para generar el PDF.');
    return;
  }

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}

function PredictionHistoryCard({
  matches = [],
  userName = 'Usuario',
  leagueName = 'Liga',
}) {
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

  const groupedMatchesWithPrediction = groupMatchesByDay(matchesWithPrediction);

  function handleDownloadHistoryPdf() {
    openPredictionsPdf({
      matchesWithPrediction,
      userName,
      leagueName,
      totalPoints,
      exactScores,
      resultHits,
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
              Consulta tus marcadores capturados por día, resultados oficiales y
              puntos obtenidos.
            </p>
          </div>

          <div className="rounded-2xl bg-violet-50 p-3 text-violet-600">
            <History size={23} />
          </div>
        </div>

        {matchesWithPrediction.length > 0 && (
          <button
            type="button"
            onClick={handleDownloadHistoryPdf}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white transition hover:bg-slate-800 sm:w-fit"
          >
            <Download size={17} />
            Descargar PDF de mis pronósticos
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
        <section className="space-y-4">
          {groupedMatchesWithPrediction.map((group) => (
            <section
              key={group.key}
              className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm"
            >
              <div className="bg-slate-950 px-3 py-3 text-xs font-black uppercase tracking-wider text-slate-300">
                {group.label}
              </div>

              <div className="divide-y divide-slate-100">
                {group.matches.map((match) => {
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
                          <span className="mr-1">
                            {getTeamFlag(match.homeTeam)}
                          </span>
                          {homeName}
                          <span className="mx-1 text-slate-400">vs</span>
                          <span className="mr-1">
                            {getTeamFlag(match.awayTeam)}
                          </span>
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
          ))}
        </section>
      )}
    </section>
  );
}

export default PredictionHistoryCard;