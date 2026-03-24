import type { ThemeMode } from "../../domain/opita";
import { cn } from "../../lib/utils";

interface BrandLockupProps {
  theme: ThemeMode;
  className?: string;
}

export function BrandLockup({ theme, className }: BrandLockupProps) {
  const logoSrc = theme === "dark" ? "/brand/flow-grid-primary-dark.svg" : "/brand/flow-grid-primary.svg";

  return (
    <div className={cn("flex w-fit items-center gap-3", className)}>
      <img src={logoSrc} alt="Opita Sync" className="h-9 w-auto shrink-0" />
      <div className="min-w-0">
        <p className="text-sm font-semibold tracking-[-0.02em] text-ink">Opita Sync</p>
        <p className="text-[10px] uppercase tracking-[0.16em] text-subtle">Workspace operativo</p>
      </div>
    </div>
  );
}
