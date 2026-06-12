import { getTeamFlag } from '../utils/teamUtils';

function GroupStandingsCard({ groupStandings = {} }) {
  const groupEntries = Object.entries(groupStandings);

  if (groupEntries.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
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

          <div className="overflow-x-auto">
            <table className="w-full min-w-[580px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-4 py-3">Equipo</th>
                  <th className="px-3 py-3 text-center">PJ</th>
                  <th className="px-3 py-3 text-center">G</th>
                  <th className="px-3 py-3 text-center">E</th>
                  <th className="px-3 py-3 text-center">P</th>
                  <th className="px-3 py-3 text-center">GF</th>
                  <th className="px-3 py-3 text-center">GC</th>
                  <th className="px-3 py-3 text-center">DG</th>
                  <th className="px-3 py-3 text-center">PTS</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {standings.map((team) => (
                  <tr key={team.teamName} className="text-slate-700">
                    <td className="px-4 py-3 font-black text-slate-950">
                      <span className="mr-2 text-lg">
                        {getTeamFlag(team.teamName)}
                      </span>
                      {team.teamName}
                    </td>
                    <td className="px-3 py-3 text-center font-bold">
                      {team.played}
                    </td>
                    <td className="px-3 py-3 text-center">{team.won}</td>
                    <td className="px-3 py-3 text-center">{team.drawn}</td>
                    <td className="px-3 py-3 text-center">{team.lost}</td>
                    <td className="px-3 py-3 text-center">{team.goalsFor}</td>
                    <td className="px-3 py-3 text-center">
                      {team.goalsAgainst}
                    </td>
                    <td className="px-3 py-3 text-center">
                      {team.goalDifference > 0
                        ? `+${team.goalDifference}`
                        : team.goalDifference}
                    </td>
                    <td className="px-3 py-3 text-center text-base font-black text-emerald-700">
                      {team.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      ))}
    </section>
  );
}

export default GroupStandingsCard;