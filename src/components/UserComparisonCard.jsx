import { useMemo, useState } from 'react';
import { Medal, Scale, Swords, Target, Trophy } from 'lucide-react';
import {
  calculatePredictionPoints,
  getScoreOutcome,
} from '../utils/scoreUtils';

function formatPrediction(prediction) {
  if (!prediction) {
    return 'Sin pronóstico';
  }

  return `${prediction.homeScore} - ${prediction.awayScore}`;
}

function formatResult(result) {
  if (!result) {
    return 'Pendiente';
  }

  return `${result.homeScore} - ${result.awayScore}`;
}

function getComparisonLabel(userAPoints, userBPoints, userAName, userBName) {
  if (userAPoints > userBPoints) {
    return `Gana ${userAName}`;
  }

  if (userBPoints > userAPoints) {
    return `Gana ${userBName}`;
  }

  return 'Empate';
}

function calculateUserComparisonStats(user, matches = []) {
  return matches.reduce(
    (accumulator, match) => {
      const prediction = user?.predictions?.[match.id];

      if (!prediction) {
        return accumulator;
      }

      const points = calculatePredictionPoints(prediction, match.result);

      accumulator.points += points;
      accumulator.predictionsCount += 1;

      if (match.result) {
        const exactScore =
          prediction.homeScore === match.result.homeScore &&
          prediction.awayScore === match.result.awayScore;

        const resultHit =
          getScoreOutcome(prediction) === getScoreOutcome(match.result);

        if (exactScore) {
          accumulator.exactScores += 1;
        }

        if (resultHit) {
          accumulator.resultHits += 1;
        }
      }

      return accumulator;
    },
    {
      points: 0,
      exactScores: 0,
      resultHits: 0,
      predictionsCount: 0,
    }
  );
}

function StatCard({ icon: Icon, label, value, iconClassName }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-2.5 text-center sm:p-3">
      <div className={`mb-1 flex justify-center ${iconClassName}`}>
        <Icon size={17} />
      </div>

      <p className="text-[11px] font-bold text-slate-400 sm:text-xs">
        {label}
      </p>

      <p className="mt-1 text-sm font-black text-slate-950">
        {value}
      </p>
    </div>
  );
}

function UserComparisonCard({ users = [], matches = [] }) {
  const defaultUserA = users[0]?.id ?? '';
  const defaultUserB = users[1]?.id ?? users[0]?.id ?? '';

  const [userAId, setUserAId] = useState(defaultUserA);
  const [userBId, setUserBId] = useState(defaultUserB);

  const userA = users.find((user) => user.id === userAId) ?? users[0];
  const userB =
    users.find((user) => user.id === userBId) ?? users[1] ?? users[0];

  const userAStats = useMemo(() => {
    return calculateUserComparisonStats(userA, matches);
  }, [userA, matches]);

  const userBStats = useMemo(() => {
    return calculateUserComparisonStats(userB, matches);
  }, [userB, matches]);

  const comparedMatches = useMemo(() => {
    return matches.filter((match) => {
      const userAPrediction = userA?.predictions?.[match.id];
      const userBPrediction = userB?.predictions?.[match.id];

      return userAPrediction || userBPrediction;
    });
  }, [matches, userA, userB]);

  if (users.length < 2) {
    return (
      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm sm:rounded-[2rem] sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-emerald-700">
              Comparación directa
            </p>

            <h2 className="text-xl font-black text-slate-950 sm:text-2xl">
              Usuario vs usuario
            </h2>
          </div>

          <div className="rounded-2xl bg-violet-50 p-3 text-violet-600">
            <Swords size={23} />
          </div>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-sm font-black text-slate-700">
            Aún no hay suficientes usuarios para comparar.
          </p>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Cuando al menos dos participantes guarden pronósticos, podrás
            compararlos aquí.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm sm:rounded-[2rem] sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-emerald-700">
            Comparación directa
          </p>

          <h2 className="text-xl font-black text-slate-950 sm:text-2xl">
            Usuario vs usuario
          </h2>
        </div>

        <div className="rounded-2xl bg-violet-50 p-3 text-violet-600">
          <Swords size={23} />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-xs font-black text-slate-500">
            Usuario A
          </span>

          <select
            value={userA?.id ?? ''}
            onChange={(event) => setUserAId(event.target.value)}
            className="min-h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-black text-slate-800 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          >
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-black text-slate-500">
            Usuario B
          </span>

          <select
            value={userB?.id ?? ''}
            onChange={(event) => setUserBId(event.target.value)}
            className="min-h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-black text-slate-800 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          >
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-2xl bg-slate-950 p-3 text-white sm:gap-3 sm:p-4">
        <div className="min-w-0">
          <p className="truncate text-xs font-black sm:text-sm">
            {userA?.name}
          </p>

          <p className="mt-1 text-2xl font-black sm:text-3xl">
            {userAStats.points}
          </p>

          <p className="text-[11px] font-bold text-slate-400 sm:text-xs">
            pts
          </p>
        </div>

        <div className="rounded-2xl bg-white/10 p-2 sm:p-3">
          <Scale size={21} />
        </div>

        <div className="min-w-0 text-right">
          <p className="truncate text-xs font-black sm:text-sm">
            {userB?.name}
          </p>

          <p className="mt-1 text-2xl font-black sm:text-3xl">
            {userBStats.points}
          </p>

          <p className="text-[11px] font-bold text-slate-400 sm:text-xs">
            pts
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 sm:mt-4 sm:gap-3">
        <StatCard
          icon={Target}
          label="Aciertos"
          value={`${userAStats.resultHits} - ${userBStats.resultHits}`}
          iconClassName="text-emerald-600"
        />

        <StatCard
          icon={Medal}
          label="Exactos"
          value={`${userAStats.exactScores} - ${userBStats.exactScores}`}
          iconClassName="text-amber-600"
        />

        <StatCard
          icon={Trophy}
          label="Jugados"
          value={`${userAStats.predictionsCount} - ${userBStats.predictionsCount}`}
          iconClassName="text-violet-600"
        />
      </div>

      <div className="mt-4 space-y-3">
        {comparedMatches.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-black text-slate-700">
              No hay pronósticos para comparar.
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Estos usuarios todavía no tienen pronósticos capturados.
            </p>
          </div>
        ) : (
          comparedMatches.map((match) => {
            const userAPrediction = userA?.predictions?.[match.id];
            const userBPrediction = userB?.predictions?.[match.id];

            const userAPoints = calculatePredictionPoints(
              userAPrediction,
              match.result
            );

            const userBPoints = calculatePredictionPoints(
              userBPrediction,
              match.result
            );

            return (
              <article
                key={match.id}
                className="rounded-2xl bg-slate-50 p-3"
              >
                <div className="mb-3">
                  <p className="break-words text-sm font-black leading-tight text-slate-950 sm:text-base">
                    {match.homeTeam} vs {match.awayTeam}
                  </p>

                  <p className="mt-1 text-[11px] font-bold text-slate-400 sm:text-xs">
                    Resultado: {formatResult(match.result)}
                  </p>
                </div>

                <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-2 sm:gap-3">
                  <div className="rounded-2xl bg-white p-2.5 sm:p-3">
                    <p className="truncate text-[11px] font-bold text-slate-400 sm:text-xs">
                      {userA?.name}
                    </p>

                    <p className="text-base font-black text-slate-950 sm:text-lg">
                      {formatPrediction(userAPrediction)}
                    </p>

                    <p className="mt-1 text-[11px] font-black text-emerald-700 sm:text-xs">
                      +{userAPoints} pts
                    </p>
                  </div>

                  <span className="flex items-center text-[11px] font-black text-slate-400 sm:text-xs">
                    VS
                  </span>

                  <div className="rounded-2xl bg-white p-2.5 text-right sm:p-3">
                    <p className="truncate text-[11px] font-bold text-slate-400 sm:text-xs">
                      {userB?.name}
                    </p>

                    <p className="text-base font-black text-slate-950 sm:text-lg">
                      {formatPrediction(userBPrediction)}
                    </p>

                    <p className="mt-1 text-[11px] font-black text-emerald-700 sm:text-xs">
                      +{userBPoints} pts
                    </p>
                  </div>
                </div>

                {match.result && (
                  <p className="mt-3 rounded-full bg-white px-3 py-1 text-center text-[11px] font-black text-slate-500 sm:text-xs">
                    {getComparisonLabel(
                      userAPoints,
                      userBPoints,
                      userA?.name,
                      userB?.name
                    )}
                  </p>
                )}
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}

export default UserComparisonCard;