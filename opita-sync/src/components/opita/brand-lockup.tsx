import type { ThemeMode } from "../../domain/opita";
import { cn } from "../../lib/utils";

interface BrandLockupProps {
  theme: ThemeMode;
  className?: string;
}

export function BrandLockup({ theme, className }: BrandLockupProps) {
  const logoSrc = theme === "dark" ? "/brand/flow-grid-primary-dark.svg" : "/brand/flow-grid-primary.svg";
  const markSrc = theme === "dark" ? "/brand/flow-grid-mark-dark.svg" : "/brand/flow-grid-mark.svg";

  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-center", className)}>
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-line bg-surface shadow-soft">
          <img src="/brand/opita-sync-app-icon.svg" alt="" aria-hidden="true" className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <img src={logoSrc} alt="Opita Sync" className="h-8 w-auto sm:h-9" />
          <p className="max-w-md text-sm text-muted">Flow Grid v3 como lockup principal y app icon compacto para shell, favicon y runtime.</p>
        </div>
      </div>
      <div className="inline-flex items-center gap-2 self-start rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-subtle">
        <img src={markSrc} alt="" aria-hidden="true" className="h-4 w-4" />
        Flow Grid v3
      </div>
    </div>
  );
}
