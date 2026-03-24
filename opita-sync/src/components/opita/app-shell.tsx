import * as React from "react";
import { LayoutGrid, LogOut, Moon, SunMedium } from "lucide-react";
import { actorViews, type Role, type ThemeMode, type ViewKey, viewLabels } from "../../domain/opita";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { BrandLockup } from "./brand-lockup";

type AppNavIconProps = { className?: string };

function ConversationNavIcon({ className }: AppNavIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.625" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="4" y="5" width="16" height="12" rx="4" ry="4" />
      <line x1="8" y1="17" x2="7" y2="20" />
      <line x1="10" y1="17" x2="7" y2="20" />
    </svg>
  );
}

function CaseNavIcon({ className }: AppNavIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.625" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="6" y="4" width="12" height="16" rx="3" ry="3" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="9" y1="12" x2="15" y2="12" />
      <line x1="9" y1="16" x2="13" y2="16" />
    </svg>
  );
}

function DetailNavIcon({ className }: AppNavIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.625" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="7" cy="17" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="17" cy="7" r="2" />
      <line x1="8.5" y1="15.5" x2="10.5" y2="13.5" />
      <line x1="13.5" y1="10.5" x2="15.5" y2="8.5" />
    </svg>
  );
}

function SettingsNavIcon({ className }: AppNavIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.625" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="3.5" />
      <line x1="12" y1="3" x2="12" y2="6" />
      <line x1="12" y1="18" x2="12" y2="21" />
      <line x1="3" y1="12" x2="6" y2="12" />
      <line x1="18" y1="12" x2="21" y2="12" />
      <line x1="5.5" y1="5.5" x2="7.5" y2="7.5" />
      <line x1="16.5" y1="16.5" x2="18.5" y2="18.5" />
      <line x1="5.5" y1="18.5" x2="7.5" y2="16.5" />
      <line x1="16.5" y1="7.5" x2="18.5" y2="5.5" />
    </svg>
  );
}

const iconMap: Record<ViewKey, React.ComponentType<{ className?: string }>> = {
  inicio: LayoutGrid,
  chat: ConversationNavIcon,
  casos: CaseNavIcon,
  detalle: DetailNavIcon,
  configuracion: SettingsNavIcon
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
                  const Icon = iconMap[item];
                  const active = view === item;

                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => onViewChange(item)}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
                        active
                          ? "border-ink bg-ink text-panel shadow-[0_12px_24px_rgba(15,23,42,0.16)]"
                          : "border-line bg-panel text-ink hover:border-line/90 hover:bg-surface hover:text-ink"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0 text-current" />
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
                Cerrar sesión
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
                      "rounded-2xl border px-3 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
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

        <div className={cn("mt-4 flex min-h-0 flex-1 flex-col overflow-hidden md:hidden", isChat && "pb-24")}>
          <main
            ref={mobileMainRef}
            className={cn(
              "min-h-0 flex-1",
              isChat ? "flex min-h-0 flex-1 flex-col overflow-hidden" : "overflow-y-auto pb-24"
            )}
          >
            {children}
          </main>
        </div>

        <div className="mt-4 hidden min-h-0 flex-1 overflow-hidden md:flex">
          <main className={cn("min-h-0 flex-1", isChat ? "flex min-h-0 flex-1 flex-col overflow-hidden" : "overflow-hidden")}>{children}</main>
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line/90 bg-panel/95 px-4 py-3 backdrop-blur md:hidden">
        <div className={cn("mx-auto grid max-w-lg gap-2", navCount === 3 ? "grid-cols-3" : "grid-cols-4")}>
          {availableViews.slice(0, navCount).map((item) => {
            const Icon = iconMap[item];
            const active = view === item;

            return (
              <button
                key={item}
                type="button"
                onClick={() => onViewChange(item)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center justify-center rounded-2xl border border-transparent px-2 py-2 text-[11px] font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
                  active ? "bg-ink text-panel shadow-[0_8px_20px_rgba(15,23,42,0.14)]" : "text-ink hover:bg-surface"
                )}
              >
                <Icon className="mb-1 h-4 w-4 text-current" />
                {viewLabels[item]}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
