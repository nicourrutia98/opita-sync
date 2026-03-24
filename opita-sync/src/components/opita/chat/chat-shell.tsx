import type { ReactNode } from "react";
import { cn } from "../../../lib/utils";

export function ChatShell({
  header,
  messages,
  composer,
  sidebar,
  newMessagesIndicator,
  messageContainerRef,
  onScroll
}: {
  header: ReactNode;
  messages: ReactNode;
  composer: ReactNode;
  sidebar: ReactNode;
  newMessagesIndicator?: ReactNode;
  messageContainerRef: React.RefObject<HTMLDivElement | null>;
  onScroll: () => void;
}) {
  return (
    <section className="flex h-full min-h-0 flex-1 flex-col gap-4">
      <div className="grid h-full min-h-0 flex-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px] xl:grid-rows-[minmax(0,1fr)]">
        <div className="min-h-0 h-full overflow-hidden rounded-[28px] border border-line/90 bg-panel/98 shadow-[0_18px_42px_rgba(15,23,42,0.07)]">
          <div className="flex h-full min-h-0 flex-col overflow-hidden">
            {header}
            <div className="relative min-h-0 flex-1 overflow-hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.42)_0%,rgba(255,255,255,0)_22%)]">
              <div
                ref={messageContainerRef}
                className={cn("scrollbar-opita flex h-full min-h-0 flex-col overflow-y-auto overscroll-contain")}
                onScroll={onScroll}
              >
                {messages}
              </div>
              {newMessagesIndicator}
            </div>
            {composer}
          </div>
        </div>
        <div className="flex min-h-0 h-full flex-col overflow-hidden">{sidebar}</div>
      </div>
    </section>
  );
}
