import React from 'react';

export function ShellCard(props: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ border: '1px solid #d0d7de', borderRadius: 12, padding: 16, background: '#fff' }}>
      <h2 style={{ margin: '0 0 12px', fontSize: 18 }}>{props.title}</h2>
      {props.children}
    </section>
  );
}

export function StatusPill(props: { label: string; tone?: 'neutral' | 'warning' | 'danger' | 'success' }) {
  const background = props.tone === 'warning' ? '#fff3cd' : props.tone === 'danger' ? '#fde2e1' : props.tone === 'success' ? '#d1f7dd' : '#eef2f7';
  return <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: 999, background, fontSize: 12 }}>{props.label}</span>;
}
