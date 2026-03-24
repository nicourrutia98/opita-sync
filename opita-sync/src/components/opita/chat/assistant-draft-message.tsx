import type { ChatMessage } from "../../../domain/opita";
import type { RunStatusViewModel } from "../../../hooks/use-run-status";
import { InlineRunStatus } from "./inline-run-status";
import { MessageItem } from "./message-item";

export function AssistantDraftMessage({
  message,
  status,
  onToggleStatus
}: {
  message: ChatMessage;
  status?: RunStatusViewModel;
  onToggleStatus?: () => void;
}) {
  return (
    <div className="space-y-3">
      {status ? <InlineRunStatus status={status} onToggle={onToggleStatus} /> : null}
      <MessageItem message={message} />
    </div>
  );
}
