import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { getWebAppViewModel } from '../../../services/api/src/mock-web-app.js';
import { WebApp } from './app.js';

export function renderWebAppHtml(): string {
  return '<!doctype html>' + renderToStaticMarkup(<WebApp model={getWebAppViewModel()} />);
}
