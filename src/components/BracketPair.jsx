import MatchCard from "./MatchCard";
import TeamFlag from "./TeamFlag";
import { getTeamDisplayName } from "../utils/teamUtils";

function getMatchWinner(match) {
  if (!match || !match.result) return null;

  const { homeScore, awayScore, advancesTeam } = match.result;

  if (homeScore > awayScore) {
    return { team: match.homeTeam, name: getTeamDisplayName(match.homeTeam) };
  }

  if (awayScore > homeScore) {
    return { team: match.awayTeam, name: getTeamDisplayName(match.awayTeam) };
  }

  // Empate: el avance lo definió el administrador al cargar el resultado.
  if (advancesTeam === "home") {
    return { team: match.homeTeam, name: getTeamDisplayName(match.homeTeam) };
  }

  if (advancesTeam === "away") {
    return { team: match.awayTeam, name: getTeamDisplayName(match.awayTeam) };
  }

  return null;
}

function WinnerSlot({ winner }) {
  if (!winner) {
    return <span className="text-[9px] font-bold text-slate-300">Por definir</span>;
  }

  return (
    <span className="flex items-center gap-1 text-[10px] font-black text-slate-950">
      <span className="flex h-4 w-4 shrink-0 items-center justify-center overflow-hidden rounded-full ring-1 ring-white shadow-sm">
        <TeamFlag teamName={winner.team} size="w40" imgClassName="h-full w-full object-cover" emojiClassName="text-xs" />
      </span>
      <span className="truncate max-w-[70px] sm:max-w-[90px]">{winner.name}</span>
    </span>
  );
}

function BracketPair({ match1, match2, pairIndex, users, allPredictions, onSavePrediction, leaguePredictionsLocked = false }) {
  const winner1 = getMatchWinner(match1);
  const winner2 = getMatchWinner(match2);

  return (
    <div className="flex items-stretch mb-3 relative w-max">
      {/* Columna de Partidos */}
      <div className="flex flex-col gap-1.5 w-[62vw] max-w-[230px] z-10 shrink-0">
        {match1 && (
          <MatchCard
            match={match1}
            users={users}
            allPredictions={allPredictions}
            onSavePrediction={onSavePrediction}
            leaguePredictionsLocked={leaguePredictionsLocked}
            compact
          />
        )}
        {match2 && (
          <MatchCard
            match={match2}
            users={users}
            allPredictions={allPredictions}
            onSavePrediction={onSavePrediction}
            leaguePredictionsLocked={leaguePredictionsLocked}
            compact
          />
        )}
      </div>

      {/* Líneas Conectoras de la Llave (Bracket) */}
      {match1 && match2 && (
        <div className="w-8 sm:w-12 lg:w-16 relative shrink-0 mx-1.5">
          {/* La línea 'C' que une los dos partidos */}
          <div className="absolute top-[25%] bottom-[25%] left-0 right-0 border-r-[3px] border-y-[3px] border-slate-300 rounded-r-xl"></div>
          {/* La línea que apunta a la siguiente fase */}
          <div className="absolute top-1/2 right-[-0.75rem] sm:right-[-1rem] w-3 sm:w-4 border-t-[3px] border-slate-300"></div>
        </div>
      )}

      {/* Cajón de Siguiente Fase, con el equipo ganador si ya hay resultado */}
      {match1 && match2 && (
        <div className="flex flex-col justify-center ml-1.5 sm:ml-3 shrink-0 pr-3">
          <div className="flex flex-col items-center justify-center gap-1 h-16 w-20 sm:w-28 bg-slate-50 border-2 border-slate-200 border-dashed rounded-2xl px-1.5 text-center shadow-sm">
            <WinnerSlot winner={winner1} />
            <div className="h-px w-full bg-slate-200" />
            <WinnerSlot winner={winner2} />
          </div>
        </div>
      )}
    </div>
  );
}

export default BracketPair;
