import type { ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import type { ThemeMode } from "../../domain/opita";
import { BrandLockup } from "./brand-lockup";

interface AuthShellProps {
  theme: ThemeMode;
  title: string;
  description: string;
  status?: {
    tone: "warning" | "danger" | "brand";
    label: string;
    detail: string;
  } | null;
  children: ReactNode;
}

export function AuthShell({ theme, title, description, status, children }: AuthShellProps) {
  return (
    <div
      data-theme={theme}
      className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(75,169,221,0.12),_transparent_32%),linear-gradient(180deg,rgba(247,249,252,0.98)_0%,rgba(240,244,248,0.96)_100%)] text-ink"
    >
      <div className="mx-auto flex min-h-screen max-w-[1440px] items-center justify-center px-4 py-8 md:px-6">
        <section className="w-full max-w-[520px] rounded-[34px] border border-line/90 bg-panel/95 p-6 shadow-[0_26px_70px_rgba(15,23,42,0.12)] backdrop-blur md:p-8">
          <div className="space-y-6">
            <div className="space-y-4">
              <BrandLockup theme={theme} />
              <div>
                <h1 className="text-[2rem] font-semibold tracking-[-0.03em] text-ink md:text-[2.35rem]">{title}</h1>
                <p className="mt-2 text-sm leading-6 text-muted md:text-[15px]">{description}</p>
              </div>
            </div>

            {status && (
              <div className="rounded-[24px] border border-line/80 bg-surface/90 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-brand-strong" />
                  <div>
                    <p className="font-semibold text-ink">{status.label}</p>
                    <p className="mt-1 text-sm leading-6 text-muted">{status.detail}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-[28px] border border-line/80 bg-surface/70 p-4 md:p-5">{children}</div>
          </div>
        </section>
      </div>
    </div>
  );
}

