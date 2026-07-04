import { useEffect, useState } from "react";
import { getTeamFlag, getTeamFlagUrl } from "../utils/teamUtils";

/**
 * Pinta la bandera real de un equipo (imagen), con respaldo automático a
 * emoji si la imagen no carga o si el equipo aún no está definido
 * (p. ej. "Por definir" en llaves que dependen de un resultado previo).
 */
function TeamFlag({ teamName, size = "w80", imgClassName = "", emojiClassName = "" }) {
  const flagUrl = getTeamFlagUrl(teamName, size);
  const emojiFallback = getTeamFlag(teamName);
  const [hasError, setHasError] = useState(false);

  // Si cambia el equipo, reseteamos el estado de error para volver a intentar la imagen.
  useEffect(() => {
    setHasError(false);
  }, [flagUrl]);

  if (!flagUrl || hasError) {
    return <span className={emojiClassName}>{emojiFallback}</span>;
  }

  return (
    <img
      src={flagUrl}
      alt={teamName}
      loading="lazy"
      draggable="false"
      className={imgClassName}
      onError={() => setHasError(true)}
    />
  );
}

export default TeamFlag;
