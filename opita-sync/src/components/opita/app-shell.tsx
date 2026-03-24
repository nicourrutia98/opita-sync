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
  showRoleSwitcher = false,
  onRoleChange,
  onViewChange,
  onThemeChange,
  onSignOut,
  children
}: AppShellProps) {
  const isDark = theme === "dark";
  const roleMeta = roles.find((item) => item.id === role);
  const isChat = view === "chat";
  const navCount = Math.min(4, availableViews.length);
  const mobileMainRef = React.useRef<HTMLElement | null>(null);
  const desktopViews = React.useMemo(() => {
    const priority: Record<ViewKey, number> = {
      chat: 0,
      inicio: 1,
      casos: 2,
      detalle: 3,
      configuracion: 4
    };

    return [...availableViews].sort((left, right) => priority[left] - priority[right]);
  }, [availableViews]);

  React.useEffect(() => {
    if (!mobileMainRef.current) {
      return;
    }
    mobileMainRef.current.scrollTop = 0;
  }, [view]);

  return (
    <div data-theme={theme} className="min-h-screen overflow-hidden bg-paper text-ink md:overflow-visible">
      <div className="mx-auto flex min-h-[100dvh] max-w-[1600px] flex-col px-4 pb-4 pt-4 md:min-h-screen md:px-6 md:pb-4 md:pt-3">
        <header className="rounded-[24px] border border-line/90 bg-panel/95 p-3 shadow-[0_18px_46px_rgba(15,23,42,0.07)] md:p-3">
          <div className="flex items-start justify-between gap-3 md:hidden">
            <div className="space-y-3">
              <BrandLockup theme={theme} />
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-subtle">{viewLabels[view]}</p>
                <p className="mt-1 text-sm text-muted">{roleMeta?.label}</p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onThemeChange(isDark ? "light" : "dark")}
                aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
                className="gap-2"
              >
                {isDark ? <SunMedium className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {isDark ? "Claro" : "Oscuro"}
              </Button>
              <Button variant="ghost" size="sm" onClick={onSignOut} className="gap-2">
                <LogOut className="h-4 w-4" />
                Salir
              </Button>
            </div>
          </div>

          <details className="mt-3 rounded-[28px] border border-line/80 bg-surface/80 p-4 text-sm text-muted md:hidden">
            <summary className="cursor-pointer list-none">
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-subtle">Cuenta activa</p>
              <p className="mt-2 font-semibold text-ink">{userName}</p>
            </summary>
            <div className="mt-3 space-y-2">
              <p className="text-subtle">{roleMeta?.label}</p>
              <p>{roleMeta?.description}</p>
            </div>
          </details>

          <div className="hidden md:flex md:items-center md:justify-between md:gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <BrandLockup theme={theme} />
              <nav className="flex flex-wrap gap-2">
                {desktopViews.map((item) => {
                  const icon = iconMap[item];
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => onViewChange(item)}
                      className={cn(
                        "flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-medium transition",
                        view === item ? "bg-ink text-panel shadow-[0_12px_24px_rgba(15,23,42,0.16)]" : "border border-line bg-panel text-subtle hover:bg-surface"
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
            </div>

            <div className="flex shrink-0 items-center justify-end gap-2">
              <div className="rounded-2xl border border-line bg-surface px-3 py-2 text-xs uppercase tracking-[0.14em] text-subtle">
                {roleMeta?.label}
              </div>
              <div className="rounded-2xl border border-line bg-surface px-3 py-2 text-xs text-muted">{userName}</div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onThemeChange(isDark ? "light" : "dark")}
                aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
                className="px-3"
              >
                {isDark ? <SunMedium className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="sm" onClick={onSignOut} className="gap-2">
                <LogOut className="h-4 w-4" />
                Cerrar sesion
              </Button>
            </div>
          </div>

          <div className="mt-3 hidden md:flex md:items-center md:justify-end">
            {showRoleSwitcher && (
              <div className="flex flex-wrap justify-end gap-2">
                {roles.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onRoleChange(item.id);
                      onViewChange(actorViews[item.id][0]);
                    }}
                    className={cn(
                      "rounded-2xl border px-3 py-2 text-sm transition",
                      role === item.id ? "border-brand bg-brand text-white" : "border-line bg-panel text-ink hover:border-brand-soft hover:bg-surface"
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </header>

        <div className="mt-4 flex flex-1 flex-col overflow-hidden md:hidden">
          <main
            ref={mobileMainRef}
            className={cn("flex-1 pb-24", isChat ? "flex flex-col overflow-hidden" : "overflow-y-auto")}
          >
            {children}
          </main>
        </div>

        <div className="mt-4 hidden min-h-0 flex-1 md:flex">
          <main className="min-h-0 flex-1 overflow-hidden">{children}</main>
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line/90 bg-panel/95 px-4 py-3 backdrop-blur md:hidden">
        <div className={cn("mx-auto grid max-w-lg gap-2", navCount === 3 ? "grid-cols-3" : "grid-cols-4")}>
          {availableViews.slice(0, navCount).map((item) => {
            const icon = iconMap[item];
            return (
              <button
                key={item}
                type="button"
                onClick={() => onViewChange(item)}
                className={cn(
                  "flex flex-col items-center justify-center rounded-2xl px-2 py-2 text-[11px] font-medium",
                  view === item ? "bg-ink text-panel" : "text-muted hover:bg-surface"
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
