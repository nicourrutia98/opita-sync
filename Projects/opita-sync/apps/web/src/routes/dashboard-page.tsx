'use client';

import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  BookOpenText,
  Building2,
  Inbox,
  KeyRound,
  LayoutGrid,
  Settings2,
  ShieldCheck,
  Sparkles,
  TimerReset,
  UserRound
} from 'lucide-react';
import { Badge } from '../../../../packages/ui-core/src/primitives.js';

const DESTINATIONS: ReadonlyArray<{
  href: string;
  label: string;
  description: string;
  eyebrow: string;
  Icon: typeof LayoutGrid;
  primary?: boolean;
}> = [
  {
    href: '/operate',
    label: 'Operate',
    description: 'Primary governed workspace for execution, review and release control.',
    eyebrow: 'Primary workspace',
    Icon: LayoutGrid,
    primary: true
  },
  {
    href: '/catalog',
    label: 'Catalog',
    description: 'Browse published governed assets before launch.',
    eyebrow: 'Assets',
    Icon: BookOpenText
  },
  {
    href: '/inbox',
    label: 'Inbox',
    description: 'Review approvals, holds and queued actions.',
    eyebrow: 'Queue',
    Icon: Inbox
  },
  {
    href: '/activity',
    label: 'Activity',
    description: 'Inspect runtime transitions and audit history.',
    eyebrow: 'History',
    Icon: Activity
  },
  {
    href: '/governance',
    label: 'Governance',
    description: 'See policy, authority and classification boundaries.',
    eyebrow: 'Control surface',
    Icon: ShieldCheck
  },
  {
    href: '/settings',
    label: 'Settings',
    description: 'Manage tenant and provider plumbing.',
    eyebrow: 'Configuration',
    Icon: Settings2
  }
] as const;

const SESSION_FACTS: ReadonlyArray<{
  key: string;
  label: string;
  valueFromAuth: (auth: DashboardPageProps['auth']) => string;
  Icon: typeof Building2;
}> = [
  {
    key: 'tenant',
    label: 'Tenant',
    valueFromAuth: (auth) => auth.tenantId,
    Icon: Building2
  },
  {
    key: 'user',
    label: 'User',
    valueFromAuth: (auth) => auth.displayName,
    Icon: UserRound
  },
  {
    key: 'email',
    label: 'Email',
    valueFromAuth: (auth) => auth.email,
    Icon: Sparkles
  },
  {
    key: 'roles',
    label: 'Roles',
    valueFromAuth: (auth) => auth.roles.join(', '),
    Icon: KeyRound
  },
  {
    key: 'expires',
    label: 'Session expires',
    valueFromAuth: (auth) => auth.expiresAt,
    Icon: TimerReset
  }
] as const;

type DashboardPageProps = {
  auth: {
    tenantId: string;
    displayName: string;
    email: string;
    roles: string[];
    expiresAt: string;
  };
};

export function DashboardPage(props: DashboardPageProps) {
  const primaryRole = props.auth.roles[0] ?? 'member';

  return (
    <div className="dashboard-v3">
      <div className="dashboard-shell">
        <header className="dashboard-header">
          <div className="header-copy">
            <div className="header-kicker-row">
              <span className="header-kicker">Dashboard</span>
              <Badge tone="brand">Authenticated workspace</Badge>
            </div>
            <div className="header-title-row">
              <h1 className="header-title">{props.auth.tenantId}</h1>
              <p className="header-subtitle">
                Governed access is active across workspaces, approvals, catalog and control surfaces.
              </p>
            </div>
            <div className="header-mobile-context" aria-label="Workspace summary">
              <span>{props.auth.displayName}</span>
              <span>{primaryRole}</span>
              <span>Local auth</span>
            </div>
          </div>

          <div className="header-meta-strip" aria-label="Tenant metadata">
            <div className="meta-chip meta-chip-primary">
              <UserRound size={13} />
              <span>{props.auth.displayName}</span>
            </div>
            <div className="meta-chip">
              <KeyRound size={13} />
              <span>{props.auth.roles.join(', ')}</span>
            </div>
            <div className="meta-chip">
              <Sparkles size={13} />
              <span>{props.auth.email}</span>
            </div>
          </div>
        </header>

        <details className="session-strip" aria-label="Session context">
          <summary className="session-strip-trigger">
            <div className="session-strip-main">
              <div className="session-strip-icon">
                <Building2 size={14} />
              </div>
              <div className="session-strip-copy">
                <div className="session-strip-title">{props.auth.tenantId}</div>
                <div className="session-strip-meta">
                  <span>{primaryRole}</span>
                  <span>Local auth session active</span>
                </div>
              </div>
            </div>
            <div className="session-strip-chevron" aria-hidden="true">
              <ArrowRight size={13} />
            </div>
          </summary>
          <div className="session-disclosure-panel">
            {SESSION_FACTS.map(({ key, label, valueFromAuth, Icon }) => (
              <div key={key} className="session-item">
                <div className="session-item-label">
                  <Icon size={13} />
                  <span>{label}</span>
                </div>
                <div className="session-item-value">{valueFromAuth(props.auth)}</div>
              </div>
            ))}
          </div>
        </details>

        <div className="dashboard-grid">
          <section className="panel quick-actions-panel" aria-labelledby="quick-actions-heading">
            <div className="panel-header">
              <div>
                <div className="section-kicker">Quick actions</div>
                <h2 id="quick-actions-heading" className="panel-title">
                  Choose the next governed surface
                </h2>
              </div>
              <div className="section-note">Operate remains the primary path.</div>
            </div>

            <div className="quick-grid">
              {DESTINATIONS.map(({ href, label, description, eyebrow, Icon, primary }) => (
                <Link
                  key={href}
                  href={href}
                  className={primary ? 'quick-card quick-card-primary' : 'quick-card'}
                  aria-label={`${label} ${description}`}
                >
                  <div className="quick-card-top">
                    <div className={primary ? 'quick-icon quick-icon-primary' : 'quick-icon'}>
                      <Icon size={primary ? 18 : 16} />
                    </div>
                    <div className="quick-arrow" aria-hidden="true">
                      <ArrowRight size={14} />
                    </div>
                  </div>

                  <div className="quick-copy">
                    <div className="quick-eyebrow">{eyebrow}</div>
                    <div className="quick-title-row">
                      <strong className="quick-title">{label}</strong>
                      {primary ? <span className="quick-badge">Main</span> : null}
                    </div>
                    <div className="quick-description">{description}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <aside className="panel session-panel" aria-labelledby="session-heading">
            <div className="panel-header panel-header-tight">
              <div>
                <div className="section-kicker">Session snapshot</div>
                <h2 id="session-heading" className="panel-title">
                  Current access context
                </h2>
              </div>
              <div className="session-status">Local auth session active</div>
            </div>

            <div className="session-hero">
              <div className="session-hero-icon">
                <Building2 size={16} />
              </div>
              <div className="session-hero-copy">
                <div className="session-hero-title">{props.auth.tenantId}</div>
                <div className="session-hero-text">Signed in with local enterprise controls and governed access boundaries.</div>
              </div>
            </div>

            <div className="session-grid">
              {SESSION_FACTS.map(({ key, label, valueFromAuth, Icon }) => (
                <div key={key} className="session-item">
                  <div className="session-item-label">
                    <Icon size={13} />
                    <span>{label}</span>
                  </div>
                  <div className="session-item-value">{valueFromAuth(props.auth)}</div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>

      <style jsx>{`
        .dashboard-v3 {
          height: 100dvh;
          min-height: 100dvh;
          overflow: hidden;
          background: #f3f5f7;
          color: #0f1720;
        }

        .dashboard-shell {
          height: 100%;
          max-width: 1240px;
          margin: 0 auto;
          padding: clamp(12px, 1.6vw, 20px);
          display: grid;
          grid-template-rows: auto minmax(0, 1fr);
          gap: clamp(12px, 1.3vw, 18px);
          box-sizing: border-box;
        }

        .dashboard-header,
        .panel {
          border-radius: 24px;
          border: 1px solid rgba(15, 23, 42, 0.07);
          background: rgba(255, 255, 255, 0.96);
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);
        }

        .dashboard-header {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          align-items: center;
          gap: 16px;
          padding: clamp(14px, 1.6vw, 18px) clamp(16px, 1.8vw, 22px);
          min-width: 0;
        }

        .header-copy {
          min-width: 0;
          display: grid;
          gap: 8px;
        }

        .header-kicker-row {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .header-kicker,
        .section-kicker,
        .quick-eyebrow {
          font-size: 10px;
          line-height: 1;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          font-weight: 700;
          color: #73808d;
        }

        .header-title-row {
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 16px;
        }

        .header-title {
          margin: 0;
          font-size: clamp(2rem, 3.2vw, 2.65rem);
          line-height: 0.94;
          letter-spacing: -0.05em;
          font-weight: 780;
          color: #0d1720;
          white-space: nowrap;
        }

        .header-subtitle {
          margin: 0;
          max-width: 40ch;
          color: #61707d;
          font-size: clamp(12px, 1vw, 13px);
          line-height: 1.45;
          text-wrap: balance;
        }

        .header-meta-strip {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
          flex-wrap: wrap;
          max-width: 390px;
        }

        .header-mobile-context {
          display: none;
        }

        .meta-chip {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          min-height: 32px;
          max-width: 100%;
          padding: 0 10px;
          border-radius: 999px;
          border: 1px solid rgba(15, 23, 42, 0.07);
          background: #f8fafb;
          color: #475462;
          font-size: 11px;
          font-weight: 650;
          line-height: 1.2;
          white-space: nowrap;
        }

        .meta-chip-primary {
          border-color: rgba(15, 118, 110, 0.14);
          background: rgba(221, 243, 239, 0.8);
          color: #0c615a;
        }

        .dashboard-grid {
          min-height: 0;
          display: grid;
          grid-template-columns: minmax(0, 1.28fr) minmax(290px, 0.72fr);
          gap: clamp(12px, 1.3vw, 18px);
          align-items: stretch;
        }

        .session-strip {
          display: grid;
          gap: 0;
          border-radius: 18px;
          border: 1px solid rgba(15, 23, 42, 0.06);
          background: rgba(255, 255, 255, 0.96);
          box-shadow: 0 6px 16px rgba(15, 23, 42, 0.03);
          position: relative;
        }

        .panel {
          min-height: 0;
          padding: clamp(14px, 1.5vw, 18px);
          display: grid;
          gap: 14px;
          overflow: hidden;
        }

        .quick-actions-panel {
          grid-template-rows: auto minmax(0, 1fr);
        }

        .panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          min-width: 0;
        }

        .panel-header-tight {
          align-items: start;
        }

        .panel-title {
          margin: 4px 0 0;
          font-size: clamp(16px, 1.25vw, 18px);
          line-height: 1.12;
          letter-spacing: -0.03em;
          color: #101923;
        }

        .section-note,
        .session-status {
          flex: 0 0 auto;
          display: inline-flex;
          align-items: center;
          min-height: 26px;
          padding: 0 10px;
          border-radius: 999px;
          border: 1px solid rgba(15, 23, 42, 0.06);
          background: #f6f8fa;
          color: #5d6976;
          font-size: 11px;
          font-weight: 650;
          white-space: nowrap;
        }

        .quick-grid {
          min-height: 0;
          display: grid;
          grid-template-columns: minmax(0, 1.08fr) minmax(0, 0.92fr);
          grid-template-rows: repeat(3, minmax(0, 1fr));
          gap: 10px;
        }

        .quick-card {
          min-width: 0;
          display: grid;
          grid-template-rows: auto 1fr;
          gap: 10px;
          padding: 14px;
          border-radius: 20px;
          border: 1px solid rgba(15, 23, 42, 0.07);
          background: #f8fafb;
          color: inherit;
          text-decoration: none;
          transition: transform 140ms ease, box-shadow 140ms ease, border-color 140ms ease, background-color 140ms ease;
          outline: none;
          overflow: hidden;
        }

        .quick-card:hover {
          transform: translateY(-1px);
          border-color: rgba(15, 118, 110, 0.16);
          background: #fbfcfd;
          box-shadow: 0 12px 24px rgba(15, 23, 42, 0.05);
        }

        .quick-card:focus-visible {
          border-color: rgba(15, 118, 110, 0.34);
          box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.12);
        }

        .quick-card-primary {
          grid-row: span 2;
          background: linear-gradient(180deg, #ffffff 0%, #f4fbf9 100%);
          border-color: rgba(15, 118, 110, 0.14);
          box-shadow: 0 14px 28px rgba(15, 23, 42, 0.05);
        }

        .quick-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .quick-icon {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border-radius: 14px;
          border: 1px solid rgba(15, 23, 42, 0.07);
          background: rgba(255, 255, 255, 0.92);
          color: #445260;
          flex: 0 0 auto;
        }

        .quick-icon-primary {
          width: 44px;
          height: 44px;
          border-color: rgba(15, 118, 110, 0.14);
          background: rgba(221, 243, 239, 0.8);
          color: #0c615a;
        }

        .quick-arrow {
          width: 28px;
          height: 28px;
          display: grid;
          place-items: center;
          border-radius: 999px;
          border: 1px solid rgba(15, 23, 42, 0.06);
          background: rgba(255, 255, 255, 0.75);
          color: #6a7785;
          transition: transform 140ms ease, color 140ms ease, background-color 140ms ease;
        }

        .quick-card:hover .quick-arrow,
        .quick-card:focus-visible .quick-arrow {
          transform: translateX(2px);
          color: #0c615a;
          background: rgba(221, 243, 239, 0.74);
        }

        .quick-copy {
          min-width: 0;
          display: grid;
          align-content: end;
          gap: 6px;
        }

        .quick-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
          flex-wrap: wrap;
        }

        .quick-title {
          font-size: clamp(15px, 1.2vw, 17px);
          line-height: 1.1;
          color: #101923;
          font-weight: 730;
        }

        .quick-card-primary .quick-title {
          font-size: clamp(18px, 1.45vw, 21px);
        }

        .quick-badge {
          display: inline-flex;
          align-items: center;
          min-height: 20px;
          padding: 0 7px;
          border-radius: 999px;
          background: rgba(15, 118, 110, 0.1);
          color: #0c615a;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .quick-description {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          color: #60707d;
          font-size: 12px;
          line-height: 1.45;
        }

        .quick-card-primary .quick-description {
          -webkit-line-clamp: 3;
          color: #52616f;
          font-size: 13px;
          max-width: 30ch;
        }

        .session-panel {
          display: none;
          grid-template-rows: auto auto minmax(0, 1fr);
          background: linear-gradient(180deg, #ffffff 0%, #fbfcfd 100%);
        }

        .session-strip-trigger {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          align-items: center;
          gap: 10px;
          min-height: 58px;
          padding: 10px 12px;
          cursor: pointer;
          list-style: none;
        }

        .session-strip-trigger::-webkit-details-marker {
          display: none;
        }

        .session-hero {
          display: grid;
          grid-template-columns: 42px minmax(0, 1fr);
          gap: 12px;
          align-items: center;
          padding: 12px;
          border-radius: 18px;
          border: 1px solid rgba(15, 23, 42, 0.06);
          background: #f7f9fb;
        }

        .session-hero-icon {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border-radius: 14px;
          border: 1px solid rgba(15, 118, 110, 0.12);
          background: rgba(221, 243, 239, 0.74);
          color: #0c615a;
        }

        .session-hero-copy {
          min-width: 0;
          display: grid;
          gap: 4px;
        }

        .session-hero-title {
          font-size: 16px;
          line-height: 1.12;
          font-weight: 720;
          color: #111a24;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .session-hero-text {
          color: #62717e;
          font-size: 12px;
          line-height: 1.45;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .session-grid {
          min-height: 0;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
          align-content: start;
        }

        .session-item {
          min-width: 0;
          display: grid;
          gap: 7px;
          padding: 12px;
          border-radius: 18px;
          border: 1px solid rgba(15, 23, 42, 0.06);
          background: #f7f9fb;
        }

        .session-item-label {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          min-width: 0;
          font-size: 10px;
          line-height: 1;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          font-weight: 700;
          color: #73808d;
        }

        .session-item-value {
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #16212a;
          font-size: 13px;
          line-height: 1.35;
          font-weight: 650;
        }

        .session-item:last-child {
          grid-column: 1 / -1;
        }

        .session-strip-main {
          display: grid;
          grid-template-columns: 30px minmax(0, 1fr);
          align-items: center;
          gap: 9px;
          min-width: 0;
        }

        .session-strip-icon {
          width: 30px;
          height: 30px;
          display: grid;
          place-items: center;
          border-radius: 11px;
          border: 1px solid rgba(15, 118, 110, 0.12);
          background: rgba(221, 243, 239, 0.72);
          color: #0c615a;
        }

        .session-strip-copy {
          min-width: 0;
          display: grid;
          gap: 2px;
        }

        .session-strip-title {
          font-size: 12.5px;
          line-height: 1.1;
          font-weight: 720;
          color: #111a24;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .session-strip-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
          color: #677482;
          font-size: 10px;
          line-height: 1.2;
          white-space: nowrap;
        }

        .session-strip-meta span {
          position: relative;
        }

        .session-strip-meta span + span::before {
          content: '';
          position: absolute;
          left: -4px;
          top: 50%;
          width: 2px;
          height: 2px;
          border-radius: 999px;
          background: #97a4b1;
          transform: translateY(-50%);
        }

        .session-strip-chevron {
          width: 24px;
          height: 24px;
          display: grid;
          place-items: center;
          border-radius: 999px;
          border: 1px solid rgba(15, 23, 42, 0.05);
          background: rgba(247, 249, 251, 0.92);
          color: #92a0ab;
          transition: transform 140ms ease, color 140ms ease, background-color 140ms ease;
        }

        .session-strip[open] .session-strip-chevron {
          transform: rotate(90deg);
          color: #0c615a;
          background: rgba(221, 243, 239, 0.72);
        }

        .session-disclosure-panel {
          position: absolute;
          left: 8px;
          right: 8px;
          top: calc(100% + 6px);
          z-index: 5;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 6px;
          padding: 8px;
          border-radius: 18px;
          border: 1px solid rgba(15, 23, 42, 0.07);
          background: rgba(255, 255, 255, 0.98);
          box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
        }

        .session-disclosure {
          margin: 0;
        }

        @media (max-width: 1199px) {
          .dashboard-grid {
            grid-template-columns: minmax(0, 1.12fr) minmax(280px, 0.88fr);
          }

          .section-note {
            display: none;
          }

          .header-title-row {
            align-items: center;
          }
        }

        @media (max-width: 1023px) {
          .dashboard-v3 {
            height: auto;
            min-height: 100dvh;
            overflow-x: hidden;
            overflow-y: auto;
          }

          .dashboard-shell {
            height: auto;
            min-height: 100%;
            padding: 12px;
            grid-template-rows: auto auto;
          }

          .dashboard-header {
            grid-template-columns: 1fr;
            align-items: start;
          }

          .header-title-row {
            align-items: start;
            flex-direction: column;
            gap: 8px;
          }

          .header-title {
            white-space: normal;
          }

          .header-meta-strip {
            justify-content: flex-start;
            max-width: none;
          }

          .dashboard-grid {
            grid-template-columns: minmax(0, 1fr);
            align-items: start;
          }

          .session-panel {
            grid-template-rows: auto auto auto;
          }
        }

        @media (min-width: 768px) {
          .session-strip {
            display: none;
          }

          .session-panel {
            display: grid;
          }
        }

        @media (max-width: 767px) {
          .dashboard-v3 {
            height: 100dvh;
            min-height: 100dvh;
            overflow: hidden;
          }

          .dashboard-shell {
            height: 100%;
            min-height: 100%;
            gap: 6px;
            padding: 6px;
            grid-template-rows: auto auto minmax(0, 1fr);
          }

          .dashboard-header {
            padding: 8px 10px;
            gap: 4px;
            border-radius: 18px;
            box-shadow: 0 6px 18px rgba(15, 23, 42, 0.03);
          }

          .header-copy {
            gap: 2px;
          }

          .header-title {
            font-size: clamp(1.56rem, 7vw, 1.86rem);
            line-height: 0.92;
          }

          .header-subtitle {
            max-width: 100%;
            font-size: 10px;
            line-height: 1.2;
            display: -webkit-box;
            -webkit-line-clamp: 1;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .meta-chip {
            min-height: 24px;
            font-size: 9.5px;
            padding: 0 7px;
            max-width: none;
          }

          .header-mobile-context {
            display: flex;
            align-items: center;
            gap: 8px;
            min-width: 0;
            color: #7c8894;
            font-size: 9.5px;
            line-height: 1.2;
            white-space: nowrap;
            overflow: hidden;
          }

          .header-mobile-context span {
            position: relative;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .header-mobile-context span + span::before {
            content: '';
            position: absolute;
            left: -5px;
            top: 50%;
            width: 2px;
            height: 2px;
            border-radius: 999px;
            background: #9aa6b3;
            transform: translateY(-50%);
          }

          .panel {
            padding: 10px;
            gap: 10px;
            border-radius: 20px;
          }

          .dashboard-grid {
            min-height: 0;
            height: 100%;
          }

          .panel-header {
            align-items: start;
            flex-direction: row;
            justify-content: space-between;
          }

          .header-meta-strip {
            display: none !important;
          }

          .header-mobile-context {
            display: flex !important;
          }

          .quick-grid {
            min-height: 0;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            grid-template-rows: repeat(3, minmax(96px, auto));
            gap: 7px;
            align-content: start;
          }

          .quick-card-primary {
            grid-column: auto;
            grid-row: auto;
          }

          .quick-card {
            min-height: 96px;
            padding: 10px 9px;
            gap: 6px;
            border-radius: 17px;
            background: #fafbfd;
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.75);
          }

          .quick-title {
            font-size: 13.5px;
            line-height: 1.04;
          }

          .quick-card-primary .quick-title {
            font-size: 14.5px;
          }

          .quick-description {
            font-size: 10px;
            line-height: 1.22;
            -webkit-line-clamp: 1;
            color: #72808d;
          }

          .quick-card-primary .quick-description {
            font-size: 10px;
            max-width: none;
            -webkit-line-clamp: 1;
            color: #5d6b78;
          }

          .quick-icon {
            width: 34px;
            height: 34px;
            border-radius: 12px;
          }

          .quick-icon-primary {
            width: 36px;
            height: 36px;
          }

          .quick-arrow {
            width: 18px;
            height: 18px;
            border: none;
            color: #adb7c0;
            background: transparent;
          }

          .quick-badge {
            min-height: 16px;
            font-size: 8px;
            padding: 0 5px;
            letter-spacing: 0.04em;
          }

          .quick-eyebrow {
            display: none;
          }

          .section-note,
          .session-status {
            min-height: 18px;
            padding: 0 6px;
            font-size: 8.5px;
          }

          .session-panel {
            display: none !important;
          }
        }

        @media (max-width: 430px) {
          .dashboard-shell {
            padding: 5px;
            gap: 5px;
          }

          .dashboard-header,
          .panel,
          .session-strip {
            border-radius: 18px;
          }

          .header-kicker,
          .section-kicker,
          .quick-eyebrow,
          .session-item-label {
            font-size: 9.5px;
            letter-spacing: 0.13em;
          }

          .dashboard-header {
            padding: 7px 9px;
            gap: 4px;
          }

          .header-copy {
            gap: 3px;
          }

          .header-title {
            font-size: 1.52rem;
          }

          .header-subtitle {
            font-size: 9.5px;
          }

          .header-kicker-row :global([data-ui='badge']) {
            min-height: 18px;
            padding: 0 7px;
            font-size: 8px;
            opacity: 0.82;
          }

          .header-mobile-context {
            gap: 7px;
            font-size: 9px;
          }

          .header-title-row {
            gap: 4px;
          }

          .panel-title {
            font-size: 14px;
            margin-top: 2px;
          }

          .quick-grid {
            gap: 6px;
          }

          .quick-card {
            min-height: 96px;
            padding: 8px;
            gap: 5px;
          }

          .quick-title {
            font-size: 12.5px;
          }

          .quick-card-primary .quick-title {
            font-size: 13px;
          }

          .quick-description,
          .quick-card-primary .quick-description {
            font-size: 9px;
            line-height: 1.18;
            -webkit-line-clamp: 1;
          }

          .quick-card-top {
            gap: 8px;
          }

          .quick-icon,
          .quick-icon-primary {
            width: 32px;
            height: 32px;
          }

          .quick-arrow {
            width: 16px;
            height: 16px;
          }

          .quick-badge {
            min-height: 16px;
            font-size: 8px;
            padding: 0 5px;
          }

          .panel {
            padding: 8px;
            gap: 8px;
          }

          .section-note,
          .session-status {
            min-height: 20px;
            padding: 0 7px;
            font-size: 9px;
          }

          .session-strip {
            padding: 0;
          }

          .session-strip-trigger {
            min-height: 54px;
            padding: 8px 9px;
          }

          .session-strip-title {
            font-size: 12px;
          }

          .session-strip-meta {
            font-size: 9px;
          }

          .session-disclosure-panel {
            left: 0;
            right: 0;
            grid-template-columns: 1fr;
            gap: 5px;
            padding: 7px;
          }

          .session-item {
            padding: 7px 8px;
            border-radius: 14px;
          }

          .session-item-value {
            font-size: 10px;
          }
        }
      `}</style>
    </div>
  );
}
