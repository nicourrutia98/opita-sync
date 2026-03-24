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
      className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,118,110,0.14),_transparent_34%),linear-gradient(180deg,rgba(248,250,252,0.98)_0%,rgba(240,244,248,0.94)_100%)] text-ink"
    >
      <div className="mx-auto flex min-h-screen max-w-[1440px] items-center justify-center px-4 py-10 md:px-6 md:py-12">
        <section className="w-full max-w-[480px] rounded-[32px] border border-white/70 bg-panel/92 p-6 shadow-[0_28px_80px_rgba(15,23,42,0.14)] backdrop-blur-xl md:p-9">
          <div className="space-y-8">
            <div className="space-y-5">
              <BrandLockup theme={theme} className="gap-3.5" />
              <div className="space-y-2">
                <h1 className="text-[2rem] font-semibold tracking-[-0.04em] text-ink md:text-[2.5rem]">{title}</h1>
                <p className="max-w-[32rem] text-sm leading-6 text-muted md:text-[15px]">{description}</p>
              </div>
            </div>

            {status && (
              <div className="rounded-[22px] border border-line/80 bg-surface/85 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-brand-strong" />
                  <div>
                    <p className="font-semibold text-ink">{status.label}</p>
                    <p className="mt-1 text-sm leading-6 text-muted">{status.detail}</p>
                  </div>
                </div>
              </div>
            )}

            <div>{children}</div>
          </div>
        </section>
      </div>
    </div>
  );
}

