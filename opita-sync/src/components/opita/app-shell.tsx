import * as React from "react";
import { LayoutGrid, LogOut, Moon, SunMedium } from "lucide-react";
import { actorViews, type Role, type ThemeMode, type ViewKey, viewLabels } from "../../domain/opita";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { BrandLockup } from "./brand-lockup";
import caseIcon from "../../../opita-sync-visual-closure/icons/svg/20/opita-sync-icon-case-20.svg";
import conversationIcon from "../../../opita-sync-visual-closure/icons/svg/20/opita-sync-icon-conversation-20.svg";
import settingsIcon from "../../../opita-sync-visual-closure/icons/svg/20/opita-sync-icon-settings-20.svg";
import trackStatusIcon from "../../../opita-sync-visual-closure/icons/svg/20/opita-sync-icon-track-status-20.svg";

const iconMap: Record<ViewKey, { type: "svg" | "component"; value: string | React.ComponentType<{ className?: string }> }> = {
  inicio: { type: "component", value: LayoutGrid },
  chat: { type: "svg", value: conversationIcon },
  casos: { type: "svg", value: caseIcon },
  detalle: { type: "svg", value: trackStatusIcon },
  configuracion: { type: "svg", value: settingsIcon }
};

interface AppShellProps {
  role: Role;
  view: ViewKey;
  theme: ThemeMode;
  availableViews: ViewKey[];
  roles: Array<{ id: Role; label: string; description: string }>;
  userName: string;
  tenantName: string;
  showRoleSwitcher?: boolean;
  onRoleChange: (role: Role) => void;
  onViewChange: (view: ViewKey) => void;
  onThemeChange: (theme: ThemeMode) => void;
  onSignOut: () => void;
  children: React.ReactNode;
}

export function AppShell({
  role,
  view,
  theme,
  availableViews,
  roles,
  userName,
  tenantName,
  showRoleSwitcher = false,
  onRoleChange,
  onViewChange,
  onThemeChange,
  onSignOut,
  children
}: AppShellProps) {
  const isDark = theme === "dark";

  return (
    <div data-theme={theme} className="min-h-screen bg-paper text-ink">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 pb-28 pt-4 md:px-6 md:pb-8 md:pt-6">
        <header className="rounded-shell border border-line bg-panel p-4 shadow-panel md:p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-4">
              <BrandLockup theme={theme} />
              <div>
                <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Operaciones gobernadas listas para movil</h1>
                <p className="mt-2 max-w-2xl text-sm text-muted md:text-base">
                  Chat, casos, bitacora, borradores y gobierno en una sola experiencia mobile-first para roles operativos.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-end gap-2">
                <div className="rounded-3xl border border-line bg-surface px-4 py-3 text-right">
                  <p className="text-sm font-semibold text-ink">{userName}</p>
                  <p className="mt-1 text-xs text-muted">{tenantName}</p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onThemeChange(isDark ? "light" : "dark")}
                  aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
                  className="gap-2"
                >
                  {isDark ? <SunMedium className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  {isDark ? "Modo claro" : "Modo oscuro"}
                </Button>
                <Button variant="ghost" size="sm" onClick={onSignOut} className="gap-2">
                  <LogOut className="h-4 w-4" />
                  Cerrar sesion
                </Button>
              </div>

              {showRoleSwitcher && (
                <div className="grid gap-2 sm:grid-cols-2">
                  {roles.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onRoleChange(item.id);
                        onViewChange(actorViews[item.id][0]);
                      }}
                      className={cn(
                        "rounded-3xl border px-4 py-3 text-left transition",
                        role === item.id ? "border-brand bg-brand text-white" : "border-line bg-panel text-ink hover:border-brand-soft hover:bg-surface"
                      )}
                    >
                      <span className="block text-sm font-semibold">{item.label}</span>
                      <span className={cn("mt-1 block text-xs", role === item.id ? "text-white/80" : "text-muted")}>{item.description}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="mt-5 grid gap-5 md:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="hidden rounded-shell border border-line bg-panel p-4 shadow-soft md:block">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-muted">Navegacion</p>
            <nav className="space-y-2">
              {availableViews.map((item) => {
                const icon = iconMap[item];
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => onViewChange(item)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm transition",
                      view === item ? "bg-brand text-white" : "bg-surface text-subtle hover:bg-paper"
                    )}
                  >
                    {icon.type === "svg" ? (
                      <img alt="" aria-hidden="true" src={icon.value as string} className="h-4 w-4" />
                    ) : (
                      React.createElement(icon.value as React.ComponentType<{ className?: string }>, { className: "h-4 w-4" })
                    )}
                    {viewLabels[item]}
                  </button>
                );
              })}
            </nav>
          </aside>

          <main>{children}</main>
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-panel/95 px-4 py-3 backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-4 gap-2">
          {availableViews.slice(0, 4).map((item) => {
            const icon = iconMap[item];
            return (
              <button
                key={item}
                type="button"
                onClick={() => onViewChange(item)}
                className={cn(
                  "flex flex-col items-center justify-center rounded-2xl px-2 py-2 text-[11px] font-medium",
                  view === item ? "bg-brand text-white" : "text-muted hover:bg-surface"
                )}
              >
                {icon.type === "svg" ? (
                  <img alt="" aria-hidden="true" src={icon.value as string} className="mb-1 h-4 w-4" />
                ) : (
                  React.createElement(icon.value as React.ComponentType<{ className?: string }>, { className: "mb-1 h-4 w-4" })
                )}
                {viewLabels[item]}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
