import { getTeamDisplayName, getTeamFlag } from '../utils/teamUtils';

function GroupStandingsCard({ groupStandings = {} }) {
  const groupEntries = Object.entries(groupStandings);

  if (groupEntries.length === 0) {
    return null;
  }

  return (
    <section className="grid gap-4 lg:grid-cols-2">
      {groupEntries.map(([groupLabel, standings]) => (
        <article
          key={groupLabel}
          className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm"
        >
          <div className="border-b border-slate-100 bg-slate-950 px-4 py-3 text-white">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-300">
              Tabla de posiciones
            </p>

            <h3 className="text-lg font-black">{groupLabel}</h3>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[520px] table-fixed text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-400 sm:text-xs">
                <tr>
                  <th className="w-[190px] px-3 py-3">Equipo</th>
                  <th className="w-[42px] px-2 py-3 text-center">PJ</th>
                  <th className="w-[42px] px-2 py-3 text-center">G</th>
                  <th className="w-[42px] px-2 py-3 text-center">E</th>
                  <th className="w-[42px] px-2 py-3 text-center">P</th>
                  <th className="w-[42px] px-2 py-3 text-center">GF</th>
                  <th className="w-[42px] px-2 py-3 text-center">GC</th>
                  <th className="w-[42px] px-2 py-3 text-center">DG</th>
                  <th className="w-[50px] px-2 py-3 text-center">PTS</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {standings.map((team, index) => {
                  const displayName = getTeamDisplayName(team.teamName);

                  return (
                    <tr key={team.teamName} className="text-slate-700">
                      <td className="px-3 py-3 font-black text-slate-950">
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="text-lg">
                            {getTeamFlag(team.teamName)}
                          </span>

                          <div className="min-w-0">
                            <p className="truncate">{displayName}</p>

                            {index < 2 && (
                              <p className="mt-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-600">
                                Clasifica
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-2 py-3 text-center font-bold">
                        {team.played}
                      </td>

                      <td className="px-2 py-3 text-center">{team.won}</td>

                      <td className="px-2 py-3 text-center">{team.drawn}</td>

                      <td className="px-2 py-3 text-center">{team.lost}</td>

                      <td className="px-2 py-3 text-center">
                        {team.goalsFor}
                      </td>

                      <td className="px-2 py-3 text-center">
                        {team.goalsAgainst}
                      </td>

                      <td className="px-2 py-3 text-center">
                        {team.goalDifference > 0
                          ? `+${team.goalDifference}`
                          : team.goalDifference}
                      </td>

                      <td className="px-2 py-3 text-center text-base font-black text-emerald-700">
                        {team.points}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </article>
      ))}
    </section>
  );
}

export default GroupStandingsCard;