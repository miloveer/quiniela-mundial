import { Trophy, Medal } from 'lucide-react';
import { buildRanking, buildRankingFromPredictions } from '../utils/scoreUtils';
import { getStagesMatches } from '../utils/matchUtils';

function getRankIcon(index) {
  if (index === 0) {
    return '🥇';
  }

  if (index === 1) {
    return '🥈';
  }

  if (index === 2) {
    return '🥉';
  }

  return `#${index + 1}`;
}

function StageRankingPreviewCard({
  stageGroups = [],
  matches = [],
  rankingUsers = [],
  memberPredictions = [],
  currentUser,
  userProfiles = [],
  activeLeagueId = 'default',
  onSelectStage,
}) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-emerald-700">
            Ranking por etapa
          </p>

          <h2 className="text-2xl font-black text-slate-950">
            Líderes por ronda
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Consulta quién va liderando cada fase de la quiniela.
          </p>
        </div>

        <div className="rounded-2xl bg-amber-50 p-3 text-amber-600">
          <Trophy size={23} />
        </div>
      </div>

      <div className="space-y-3">
        {stageGroups.map((group) => {
          const groupMatches = getStagesMatches(matches, group.stageIds);

          const groupRanking =
            activeLeagueId !== 'default' && memberPredictions.length > 0
              ? buildRankingFromPredictions({
                  predictions: memberPredictions,
                  matches: groupMatches,
                  currentUser,
                  userProfiles,
                })
              : buildRanking(rankingUsers, groupMatches);

          const topUsers = groupRanking.slice(0, 3);

          return (
            <button
              key={group.id}
              type="button"
              onClick={() => onSelectStage(group.id)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-emerald-300 hover:bg-emerald-50"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="font-black text-slate-950">
                    {group.fullName || group.label}
                  </p>

                  <p className="mt-1 text-xs font-bold text-slate-400">
                    Top 3 provisional
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-2 text-amber-600">
                  <Medal size={18} />
                </div>
              </div>

              {topUsers.length === 0 ? (
                <p className="rounded-2xl bg-white p-3 text-sm font-bold text-slate-500">
                  Aún no hay ranking para esta etapa.
                </p>
              ) : (
                <div className="space-y-2">
                  {topUsers.map((user, index) => (
                    <div
                      key={user.id || user.uid || user.name}
                      className="flex items-center justify-between rounded-2xl bg-white px-3 py-2"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="text-sm font-black">
                          {getRankIcon(index)}
                        </span>

                        <p className="truncate text-sm font-black text-slate-950">
                          {user.name}
                        </p>
                      </div>

                      <p className="text-sm font-black text-emerald-700">
                        {user.points || 0} pts
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default StageRankingPreviewCard;
