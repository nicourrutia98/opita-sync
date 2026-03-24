import { PauseCircle, PlayCircle, StopCircle } from "lucide-react";
import { Button } from "../../ui/button";

export function TTSControls({
  canPlay,
  isActive,
  onPlay,
  onStop
}: {
  canPlay: boolean;
  isActive: boolean;
  onPlay: () => void;
  onStop: () => void;
}) {
  if (!canPlay) {
    return null;
  }

  return isActive ? (
    <Button type="button" variant="ghost" size="sm" className="gap-2 px-2" onClick={onStop} aria-label="Detener lectura del mensaje">
      <StopCircle className="h-4 w-4" />
      Detener
    </Button>
  ) : (
    <Button type="button" variant="ghost" size="sm" className="gap-2 px-2" onClick={onPlay} aria-label="Reproducir mensaje del asistente">
      <PlayCircle className="h-4 w-4" />
      Escuchar
    </Button>
  );
}
