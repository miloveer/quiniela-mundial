import { X } from 'lucide-react';
import { formatMatchDate } from '../utils/matchUtils';
import { getTeamDisplayName, getTeamFlag } from '../utils/teamUtils';

function getPredictionMatchId(prediction) {
  return String(
    prediction?.matchId ??
      prediction?.match_id ??
      prediction?.match?.id ??
      ''
  );
}

function getPredictionUserId(prediction) {
  return String(
    prediction?.userId ??
      prediction?.user_id ??
      prediction?.uid ??
      prediction?.user?.id ??
      ''
  );
}

function getPredictionScore(prediction) {
  const rawHomeScore =
    prediction?.prediction?.homeScore ??
    prediction?.prediction?.home_score ??
    prediction?.homeScore ??
    prediction?.home_score ??
    prediction?.home;

  const rawAwayScore =
    prediction?.prediction?.awayScore ??
    prediction?.prediction?.away_score ??
    prediction?.awayScore ??
    prediction?.away_score ??
    prediction?.away;

  const homeScore = Number(rawHomeScore);
  const awayScore = Number(rawAwayScore);

  if (!Number.isFinite(homeScore) || !Number.isFinite(awayScore)) {
    return null;
  }

  return {
    homeScore,
    awayScore,
  };
}

function getProfileName({ prediction, userProfiles = [], leagueMembers = [] }) {
  const userId = getPredictionUserId(prediction);

  const profile = userProfiles.find((item) => {
    const profileId = String(
      item?.uid ?? item?.id ?? item?.userId ?? item?.user_id ?? ''
    );

    return profileId === userId;
  });

  const member = leagueMembers.find((item) => {
    const memberId = String(
      item?.uid ?? item?.id ?? item?.userId ?? item?.user_id ?? ''
    );

    return memberId === userId;
  });

  return (
    profile?.displayName ||
    profile?.display_name ||
    profile?.name ||
    profile?.email ||
    member?.displayName ||
    member?.display_name ||
    member?.name ||
    member?.email ||
    userId ||
    'Participante'
  );
}

function MatchPredictionsModal({
  isOpen,
  onClose,
  match,
  predictions = [],
  userProfiles = [],
  leagueMembers = [],
}) {
  if (!isOpen || !match) {
    return null;
  }

  const safePredictions = Array.isArray(predictions) ? predictions : [];
  const selectedMatchId = String(match.id);

  const homeName = getTeamDisplayName(match.homeTeam);
  const awayName = getTeamDisplayName(match.awayTeam);

  const matchPredictions = safePredictions
    .filter((prediction) => {
      return getPredictionMatchId(prediction) === selectedMatchId;
    })
    .map((prediction) => ({
      prediction,
      score: getPredictionScore(prediction),
      participantName: getProfileName({
        prediction,
        userProfiles,
        leagueMembers,
      }),
    }))
    .filter((item) => item.score)
    .sort((firstItem, secondItem) =>
      firstItem.participantName.localeCompare(secondItem.participantName)
    );

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-4 backdrop-blur-sm sm:items-center">
      <section className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] bg-white p-5 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-emerald-700">
              Pronósticos del partido
            </p>

            <h2 className="mt-1 text-2xl font-black text-slate-950">
              <span className="mr-1">{getTeamFlag(match.homeTeam)}</span>
              {homeName}
              <span className="mx-2 text-slate-400">vs</span>
              <span className="mr-1">{getTeamFlag(match.awayTeam)}</span>
              {awayName}
            </h2>

            <p className="mt-1 text-sm font-bold text-slate-400">
              {formatMatchDate(match.date)}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 bg-white p-2 text-slate-500 transition hover:bg-slate-50"
            aria-label="Cerrar modal"
          >
            <X size={20} />
          </button>
        </div>

        {match.result && (
          <div className="mb-4 rounded-2xl bg-slate-950 px-4 py-3 text-white">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">
              Resultado oficial
            </p>

            <p className="mt-1 text-xl font-black">
              {match.result.homeScore} - {match.result.awayScore}
            </p>
          </div>
        )}

        <div className="mb-4 rounded-2xl bg-emerald-50 px-4 py-3">
          <p className="text-xs font-black uppercase tracking-widest text-emerald-700">
            Total de pronósticos encontrados
          </p>

          <p className="mt-1 text-xl font-black text-slate-950">
            {matchPredictions.length}
          </p>
        </div>

        {matchPredictions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
            <p className="text-sm font-black text-slate-700">
              No se encontraron pronósticos para este partido.
            </p>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              Revisa que el partido tenga el mismo ID que los pronósticos
              guardados en Supabase.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {matchPredictions.map(({ prediction, score, participantName }) => (
              <article
                key={`${getPredictionUserId(prediction)}-${getPredictionMatchId(
                  prediction
                )}`}
                className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-slate-950">
                    {participantName}
                  </p>

                  <p className="mt-1 text-xs font-bold text-slate-400">
                    Pronóstico registrado
                  </p>
                </div>

                <div className="rounded-2xl bg-emerald-50 px-4 py-2 text-center">
                  <p className="text-lg font-black text-emerald-700">
                    {score.homeScore} - {score.awayScore}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default MatchPredictionsModal;