import type { ReactNode } from "react";
import { AlertCircle, KeyRound, ShieldCheck } from "lucide-react";
import type { ThemeMode } from "../../domain/opita";
import { Badge } from "../ui/badge";
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
    <div data-theme={theme} className="min-h-screen bg-paper text-ink">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-6 px-4 py-4 md:px-6 md:py-6 lg:grid-cols-[0.92fr_1.08fr]">
        <section className="rounded-shell border border-line bg-panel p-5 shadow-panel md:p-6">
          <BrandLockup theme={theme} />
          <div className="mt-8 space-y-5">
            <div>
              <Badge tone="brand">Acceso seguro</Badge>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">{title}</h1>
              <p className="mt-3 max-w-xl text-sm text-muted md:text-base">{description}</p>
            </div>

            {status && (
              <div className="rounded-3xl border border-line bg-surface p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 text-brand-strong" />
                  <div>
                    <p className="font-semibold text-ink">{status.label}</p>
                    <p className="mt-1 text-sm text-muted">{status.detail}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid gap-3">
              <div className="rounded-3xl border border-line bg-surface p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 text-brand-strong" />
                  <div>
                    <p className="font-semibold text-ink">Tenant y rol resueltos por backend</p>
                    <p className="mt-1 text-sm text-muted">La sesion define visibilidad, contexto y vistas habilitadas. El selector manual queda solo para QA y Storybook.</p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-line bg-surface p-4">
                <div className="flex items-start gap-3">
                  <KeyRound className="mt-0.5 h-5 w-5 text-brand-strong" />
                  <div>
                    <p className="font-semibold text-ink">Credenciales demo del entorno stub</p>
                    <p className="mt-1 text-sm text-muted">Usa `tecnico@acme.opita.test`, `supervisor@acme.opita.test` o `admin@acme.opita.test` con clave `Demo1234!`.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-shell border border-line bg-panel p-5 shadow-soft md:p-6">{children}</section>
      </div>
    </div>
  );
}

