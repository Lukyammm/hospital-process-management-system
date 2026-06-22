# Clinical Operations Command Center

Repository: `clinical-operations-command-center`

## Overview

SIGEP-HUC style process management dashboard for indicators, process boards, snapshots, governance, managers, and data review.

## Main Capabilities

- KPI dashboard with unit cards and historical indicators.
- Process board for new, analysis, data cleanup, and completed work.
- Snapshot routines and audit surfaces.
- Data review center with manual and batch correction flows.

## Operating Flow

1. Review the main KPI and unit status cards.
2. Move process items through the operational board.
3. Run or inspect snapshot routines.
4. Review data findings and apply corrections when appropriate.

## Visual System Guide

> The screens below are documentation mockups based on the components, labels, colors, and workflows found in this repository. All displayed data is fictitious and does not represent real patients, staff members, or institutions.

### SIGEP-HUC - KPI dashboard
![SIGEP-HUC - KPI dashboard](./docs/screenshots/kpi-dashboard.svg)

### SIGEP-HUC - process board
![SIGEP-HUC - process board](./docs/screenshots/process-board.svg)

### SIGEP-HUC - routines and snapshots
![SIGEP-HUC - routines and snapshots](./docs/screenshots/snapshot-jobs.svg)

## Data Privacy

The repository documentation and guide images use fictitious sample data only.

## Technologies

- JavaScript
- HTML/CSS
- Google Apps Script
- Google Sheets

## Modules

- **Acompanhamento** — tracking by unit, scheduling and stage progress.
- **Modelagem de Processos** — modeling/validation/publication pipeline.
- **Mapeamento** — value chain board (management / core / support processes).
- **Indicadores** — KPI portfolio with targets, polarity, periodicity and filters.
- **Administração** — users, managers (Gestores), sectors and data sanitation.

## Architecture

- **Frontend:** single `index.html` (HTML/CSS/vanilla JS) served by `HtmlService`.
- **Backend:** `Code.gs` — layered (`SheetRepository`, domain services,
  `SigepApplication`) with `LockService` for writes, `CacheService` for reads,
  RBAC by profile and an audit trail in the `HISTORICO` sheet.
- **Data store:** Google Sheets (`BASE_*` tables).

## Development & tests

Tests are dependency‑free (Node only) and run both business‑logic checks on
`Code.gs` and a DOM‑stub smoke test on `index.html` (covering the load‑failure
path so the UI can never become unresponsive again):

```bash
node tests/run.js   # or: npm test
```

CI runs the same suite on every push to `main` and on every pull request
(`.github/workflows/ci.yml`).

## Deployment

This is a Google Apps Script Web App. After merging changes you must
**create a new deployment** (Apps Script → Deploy) for the published Web App to
serve the updated code — merging to `main` alone does not republish it.

## Status

Active — continuously maintained.
