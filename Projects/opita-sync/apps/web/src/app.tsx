import React from 'react';
import { CANONICAL_NAVIGATION } from './navigation.js';
import type { WebAppViewModel } from '../../../services/api/src/view-models.js';
import { ActivityScreen, CatalogScreen, GovernanceScreen, InboxScreen, OperateScreen, SettingsScreen } from './screens.js';

export function WebApp(props: { model: WebAppViewModel }) {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', background: '#f6f8fb', color: '#17202a', minHeight: '100vh', padding: 24 }}>
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>Opita Sync</h1>
        <p style={{ margin: '8px 0 0' }}>Governed execution platform</p>
        <nav style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
          {CANONICAL_NAVIGATION.map((item) => (
            <span key={item.key} style={{ padding: '6px 12px', border: '1px solid #d0d7de', borderRadius: 999, background: '#fff' }}>
              {item.label}
            </span>
          ))}
        </nav>
      </header>
      <main style={{ display: 'grid', gap: 16 }}>
        <OperateScreen model={props.model.operate} />
        <CatalogScreen model={props.model.catalog} />
        <InboxScreen model={props.model.inbox} />
        <ActivityScreen model={props.model.activity} />
        <GovernanceScreen model={props.model.governance} />
        <SettingsScreen model={props.model.settings} />
      </main>
    </div>
  );
}
