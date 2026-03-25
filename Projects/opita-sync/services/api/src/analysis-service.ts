import type { RequestedAnalysisMode } from '../../../packages/contracts/src/index.js';
import type { GovernedArtifact } from '../../../packages/ui-artifacts/src/index.js';

export interface GovernedAnalysisResult {
  datasetRef: string;
  datasetName: string;
  analysisMode: RequestedAnalysisMode;
  chartFamily?: string;
  summary: string;
  artifacts: GovernedArtifact[];
}

interface RevenueRow {
  month: string;
  region: string;
  revenue: number;
  tickets: number;
}

const REVENUE_DATASET: RevenueRow[] = [
  { month: '2026-01', region: 'North', revenue: 128000, tickets: 84 },
  { month: '2026-01', region: 'South', revenue: 96000, tickets: 67 },
  { month: '2026-02', region: 'North', revenue: 136000, tickets: 88 },
  { month: '2026-02', region: 'South', revenue: 101000, tickets: 71 },
  { month: '2026-03', region: 'North', revenue: 149000, tickets: 94 },
  { month: '2026-03', region: 'South', revenue: 112000, tickets: 76 }
];

export const GOVERNED_ANALYSIS_DATASET_REF = 'dataset:revenue_by_region:v1';
const DATASET_DOMAINS = ['customer', 'analytics'];

export function detectAnalysisIntent(rawIntent: string): {
  wantsAnalysis: boolean;
  analysisMode: RequestedAnalysisMode;
  chartFamily?: string;
} {
  const normalized = rawIntent.toLowerCase();
  const wantsVisualization = /(chart|graph|gráfic|visual|plot|trend|bar|line|scatter)/i.test(normalized);
  const wantsAggregation = /(compare|top|aggregate|group|segment|breakdown|ranking|resumen|summary)/i.test(normalized);
  const chartFamily = /scatter/i.test(normalized)
    ? 'scatter'
    : /line|trend|tendencia/i.test(normalized)
      ? 'line'
      : wantsVisualization
        ? 'bar'
        : undefined;

  return {
    wantsAnalysis: wantsVisualization || wantsAggregation || /dataset|data|tabla|informaci/i.test(normalized),
    analysisMode: wantsVisualization ? 'visualize' : wantsAggregation ? 'aggregate' : 'summarize',
    chartFamily
  };
}

function datasetSummaryArtifact(): GovernedArtifact {
  return {
    type: 'dataset_summary',
    title: 'Governed dataset scope',
    datasetRef: GOVERNED_ANALYSIS_DATASET_REF,
    rowCount: REVENUE_DATASET.length,
    columnCount: 4,
    allowedDataDomains: DATASET_DOMAINS,
    classification: 'confidential',
    notes: ['Source connector remains centrally governed.', 'Output release still passes through output control.']
  };
}

function querySummaryArtifact(analysisMode: RequestedAnalysisMode, chartFamily?: string): GovernedArtifact {
  return {
    type: 'query_summary',
    title: 'Compiled analysis plan',
    datasetRef: GOVERNED_ANALYSIS_DATASET_REF,
    analysisMode,
    requestedChartFamily: chartFamily,
    transforms:
      analysisMode === 'visualize'
        ? ['aggregate revenue by region', 'compare regions over time', 'render chart spec']
        : analysisMode === 'aggregate'
          ? ['aggregate revenue and tickets by region', 'prepare ranked summary']
          : ['inspect governed dataset', 'prepare summary and sample rows'],
    narrowedFields: ['month', 'region', 'revenue', 'tickets'],
    releaseMode: 'draft_only'
  };
}

function sampleTableArtifact(): GovernedArtifact {
  return {
    type: 'data_table',
    title: 'Sample governed rows',
    columns: ['Month', 'Region', 'Revenue', 'Tickets'],
    rows: REVENUE_DATASET.slice(0, 4).map((row) => [
      row.month,
      row.region,
      `$${row.revenue.toLocaleString('en-US')}`,
      String(row.tickets)
    ])
  };
}

function chartSpecArtifact(chartFamily = 'bar'): GovernedArtifact {
  const isLine = chartFamily === 'line';
  return {
    type: 'chart_spec',
    title: isLine ? 'Revenue trend by region' : 'Revenue by region',
    subtitle: 'Governed analytical output preview',
    library: 'vega_lite',
    schemaVersion: 'v5',
    datasetRef: GOVERNED_ANALYSIS_DATASET_REF,
    releaseMode: 'draft_only',
    spec: {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      width: 'container',
      height: 280,
      data: {
        values: REVENUE_DATASET
      },
      mark: isLine ? { type: 'line', point: true } : { type: 'bar', cornerRadiusTopLeft: 6, cornerRadiusTopRight: 6 },
      encoding: isLine
        ? {
            x: { field: 'month', type: 'ordinal', title: 'Month' },
            y: { field: 'revenue', type: 'quantitative', title: 'Revenue' },
            color: { field: 'region', type: 'nominal', title: 'Region' }
          }
        : {
            x: { field: 'region', type: 'nominal', title: 'Region' },
            y: { field: 'revenue', type: 'quantitative', aggregate: 'sum', title: 'Revenue' },
            color: { field: 'region', type: 'nominal', legend: null }
          },
      config: {
        axis: {
          labelColor: '#475569',
          titleColor: '#0f172a',
          gridColor: '#e2e8f0'
        },
        view: { stroke: '#e2e8f0' }
      }
    }
  };
}

export function createGovernedAnalysisResult(rawIntent: string): GovernedAnalysisResult {
  const detected = detectAnalysisIntent(rawIntent);
  const summary =
    detected.analysisMode === 'visualize'
      ? 'Prepared a governed analytical visualization over the allowed revenue-by-region dataset.'
      : detected.analysisMode === 'aggregate'
        ? 'Prepared a governed aggregate summary over the allowed revenue-by-region dataset.'
        : 'Prepared a governed dataset summary over the allowed revenue-by-region dataset.';

  const artifacts: GovernedArtifact[] = [
    datasetSummaryArtifact(),
    querySummaryArtifact(detected.analysisMode, detected.chartFamily),
    sampleTableArtifact()
  ];

  if (detected.analysisMode === 'visualize') {
    artifacts.push(chartSpecArtifact(detected.chartFamily));
  }

  return {
    datasetRef: GOVERNED_ANALYSIS_DATASET_REF,
    datasetName: 'Revenue by region',
    analysisMode: detected.analysisMode,
    chartFamily: detected.chartFamily,
    summary,
    artifacts
  };
}
