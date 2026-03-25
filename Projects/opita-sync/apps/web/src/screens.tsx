import React from 'react';
import type { WebAppViewModel } from '../../../services/api/src/view-models.js';
import { ShellCard, StatusPill } from './components.js';

function List(props: { items: React.ReactNode[] }) {
  return <ul style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 8 }}>{props.items.map((item, index) => <li key={index}>{item}</li>)}</ul>;
}

export function OperateScreen(props: { model: WebAppViewModel['operate'] }) {
  return (
    <ShellCard title="Operate">
      <p><strong>Objective:</strong> {props.model.objective}</p>
      <p><strong>Contract:</strong> <StatusPill label={props.model.contractStatus} tone="warning" /></p>
      <p><strong>Policy:</strong> <StatusPill label={props.model.policyState} tone="warning" /></p>
      <p><strong>Release:</strong> <StatusPill label={props.model.releaseState} /></p>
      <List items={props.model.warnings.map((item) => <span>{item}</span>)} />
    </ShellCard>
  );
}

export function CatalogScreen(props: { model: WebAppViewModel['catalog'] }) {
  return (
    <ShellCard title="Catalog">
      <List items={props.model.map((item) => <span>{item.name} · {item.kind} · {item.lifecycleState} · {item.approvalMode}</span>)} />
    </ShellCard>
  );
}

export function InboxScreen(props: { model: WebAppViewModel['inbox'] }) {
  return (
    <ShellCard title="Inbox">
      <List items={props.model.map((item) => <span>{item.type} · {item.summary}</span>)} />
    </ShellCard>
  );
}

export function ActivityScreen(props: { model: WebAppViewModel['activity'] }) {
  return (
    <ShellCard title="Activity">
      <List items={props.model.map((item) => <span>{item.runId} · {item.state} · {item.summary}</span>)} />
    </ShellCard>
  );
}

export function GovernanceScreen(props: { model: WebAppViewModel['governance'] }) {
  return (
    <ShellCard title="Governance">
      <p><strong>Classification scheme:</strong> {props.model.classificationScheme}</p>
      <List items={props.model.activePolicies.map((item) => <span>{item}</span>)} />
      <hr />
      <List items={props.model.publicationControls.map((item) => <span>{item}</span>)} />
    </ShellCard>
  );
}

export function SettingsScreen(props: { model: WebAppViewModel['settings'] }) {
  return (
    <ShellCard title="Settings">
      <p><strong>Providers:</strong> {props.model.activeProviders.join(', ')}</p>
      <p><strong>Environments:</strong> {props.model.environments.join(', ')}</p>
      <p><strong>Governed connectors:</strong> {props.model.governedConnectors.join(', ')}</p>
    </ShellCard>
  );
}
