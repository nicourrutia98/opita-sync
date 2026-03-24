import { ArrowDown } from "lucide-react";
import { Button } from "../../ui/button";

export function NewMessagesIndicator({ visible, onClick }: { visible: boolean; onClick: () => void }) {
  if (!visible) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-28 flex justify-center">
      <Button type="button" size="sm" className="pointer-events-auto gap-2 rounded-full px-4 shadow-[0_12px_24px_rgba(15,23,42,0.12)]" onClick={onClick}>
        <ArrowDown className="h-4 w-4" />
        Volver abajo
      </Button>
    </div>
  );
}
