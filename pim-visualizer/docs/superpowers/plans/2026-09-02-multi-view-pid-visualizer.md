# Multi-View PID Visualizer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `references/PID_Network_Graph_v3.html` as a React + Vite app with 5 toggleable views (Graph, Tree, List, Cards, List+Deps) sharing one filter bar, per the approved spec at `docs/superpowers/specs/2026-09-02-multi-view-pid-visualizer-design.md`.

**Architecture:** A single static data module (`src/data/pidData.js`) ported faithfully from the reference HTML feeds a shared `FilterContext`. `App.jsx` renders a tab bar + filter bar + the active view. Four views (List, Cards, Tree, List+Deps) are plain React/CSS; the Graph view ports the reference's D3 force simulation into a React component, cloning `links` before handing it to `d3.forceLink` to avoid corrupting the shared data module (see spec's "Mutation hazard" note).

**Tech Stack:** React 18, Vite 5, D3 v7 (Graph view only), Vitest + @testing-library/react for tests.

---

## Reference material

- Spec: `docs/superpowers/specs/2026-09-02-multi-view-pid-visualizer-design.md` — read this first, it has the full rationale for every decision below.
- Source data/behavior to port: `references/PID_Network_Graph_v3.html`.

## Known dataset facts (use these in test assertions)

- Total nodes: **535** (8 hubs + 34 named "KEY" processes + 493 generated filler nodes).
- Category totals: `cics` 124, `mq` 27, `batch` 376, `hub` 8 (124+27+376+8 = 535; 124+27+376 = 527, the "process nodes" figure used in the reference's header text).
- Filler generation counts: `PIDB` ×40 (cics), `PIDT` ×56 (cics), `PICX` ×14 (cics), `PIDQ` ×17 (mq), `PBAT` ×366 (batch).
- 34 named entries split: 14 `cics`, 10 `mq`, 10 `batch`.

---

### Task 1: Scaffold the Vite + React project

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `index.html`
- Create: `src/main.jsx`
- Create: `src/App.jsx`
- Create: `src/App.css`
- Create: `src/test/setup.js`

The directory already contains `references/`, `docs/`, and `.gitignore` — write these files directly rather than running the interactive `npm create vite` scaffolder (it prompts on non-empty directories).

- [ ] **Step 1: Write `package.json`**

```json
{
  "name": "pim-visualizer",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "d3": "^7.9.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.5.0",
    "@testing-library/react": "^16.0.1",
    "@testing-library/user-event": "^14.5.2",
    "@vitejs/plugin-react": "^4.3.2",
    "jsdom": "^25.0.1",
    "vite": "^5.4.8",
    "vitest": "^2.1.2"
  }
}
```

- [ ] **Step 2: Write `vite.config.js`**

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    globals: true,
  },
});
```

- [ ] **Step 3: Write `src/test/setup.js`**

```js
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 4: Write `index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PID System — Multi-View Visualizer</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>
```

- [ ] **Step 5: Write `src/main.jsx`**

```jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './App.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

- [ ] **Step 6: Write placeholder `src/App.jsx`**

```jsx
export default function App() {
  return <div>PID Visualizer — scaffold OK</div>;
}
```

- [ ] **Step 7: Write empty `src/App.css`**

```css
body { margin: 0; font-family: 'Segoe UI', sans-serif; background: #020817; color: #e2e8f0; }
```

- [ ] **Step 8: Install dependencies**

Run: `npm install`
Expected: installs without errors, creates `node_modules/` and `package-lock.json`.

- [ ] **Step 9: Verify dev server boots**

Run: `npm run dev -- --port 5173 &` then `curl -s http://localhost:5173/ | head -5`, then kill the dev server.
Expected: HTML response containing `<div id="root">`.

- [ ] **Step 10: Verify test runner works**

Run: `npm test`
Expected: "No test files found" (not a crash) — confirms Vitest config is valid.

- [ ] **Step 11: Commit**

```bash
git add package.json vite.config.js index.html src/main.jsx src/App.jsx src/App.css src/test/setup.js package-lock.json
git commit -m "chore: scaffold Vite + React project"
```

---

### Task 2: Data layer — port dataset from reference HTML

**Files:**
- Create: `src/data/pidData.js`
- Test: `src/data/pidData.test.js`

- [ ] **Step 1: Write the failing test**

```js
// src/data/pidData.test.js
import { describe, it, expect } from 'vitest';
import { nodes, links, adjacency, CAT_COLOR, CAT_LABEL, CAT_PLURAL } from './pidData';

describe('pidData', () => {
  it('has 535 total nodes', () => {
    expect(nodes.length).toBe(535);
  });

  it('has correct per-category totals', () => {
    const counts = { cics: 0, mq: 0, batch: 0, hub: 0 };
    for (const n of nodes) counts[n.cat]++;
    expect(counts).toEqual({ cics: 124, mq: 27, batch: 376, hub: 8 });
  });

  it('has unique node ids', () => {
    const ids = new Set(nodes.map(n => n.id));
    expect(ids.size).toBe(nodes.length);
  });

  it('every link references ids that exist in nodes', () => {
    const ids = new Set(nodes.map(n => n.id));
    for (const l of links) {
      expect(ids.has(l.source)).toBe(true);
      expect(ids.has(l.target)).toBe(true);
    }
  });

  it('builds a symmetric adjacency map', () => {
    expect(adjacency.size).toBe(nodes.length);
    // TRNROT (Compliance Log) is a well-connected hub; if A links to B, B must link to A
    for (const [id, neighbors] of adjacency) {
      for (const n of neighbors) {
        expect(adjacency.get(n).has(id)).toBe(true);
      }
    }
    expect(adjacency.get('TRNROT').size).toBeGreaterThan(0);
  });

  it('exports category metadata for all 4 categories', () => {
    for (const cat of ['cics', 'mq', 'batch']) {
      expect(CAT_COLOR[cat]).toBeTruthy();
      expect(CAT_LABEL[cat]).toBeTruthy();
      expect(CAT_PLURAL[cat]).toBeTruthy();
    }
    expect(CAT_LABEL.hub).toBeTruthy();
    expect(CAT_PLURAL.hub).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/data/pidData.test.js`
Expected: FAIL — `Failed to resolve import "./pidData"` (file doesn't exist yet).

- [ ] **Step 3: Write `src/data/pidData.js`**

Port the reference file's `HUBS`, `KEY`, filler-generation loops, and `e()` edge calls verbatim (same ids, same generation rules, same edge wiring) from `references/PID_Network_Graph_v3.html` lines 103–231. Structure as:

```js
export const CAT_COLOR  = { cics: '#38bdf8', mq: '#d946ef', batch: '#4ade80' };
export const CAT_LABEL  = { cics: 'Item Setup Screen', mq: 'Live System Feed', batch: 'Overnight Automated Job', hub: 'Shared System' };
export const CAT_PLURAL = { hub: 'Shared Systems', cics: 'Item Setup Screens', mq: 'Live System Feeds', batch: 'Overnight Jobs' };

const HUBS = [
  { id: 'TRNROT',  cat: 'hub', label: 'Compliance Log',
    sub: '249 of 527 processes write permanently to this record · cannot be modified or deleted · 7-year legal retention',
    color: '#f43f5e', r: 22 },
  { id: 'IMS_DB',  cat: 'hub', label: 'Item Database',
    sub: 'Core item master — stores case, consumer, division, and catalog records for every product',
    color: '#fb923c', r: 18 },
  { id: 'DB2',     cat: 'hub', label: 'Product Records',
    sub: '50+ product data tables — pricing attributes, warehouse slot assignments, store authorization lists',
    color: '#fbbf24', r: 18 },
  { id: 'MQ_SYS',  cat: 'hub', label: 'Live Feeds Hub',
    sub: 'Real-time messaging — buying system signals, warehouse updates, and pricing changes flow through here instantly',
    color: '#8b5cf6', r: 16 },
  { id: 'POS_KMA', cat: 'hub', label: 'Store Registers (31 Markets)',
    sub: 'All 31 Kroger Market Areas — every daily item change is pushed to every store register within 24 hours',
    color: '#94a3b8', r: 16 },
  { id: 'NDM_FT',  cat: 'hub', label: 'Nightly Data Transfers',
    sub: '400+ distinct file feeds processed every night — supplier files, vendor data, warehouse exports, and partner extracts',
    color: '#94a3b8', r: 14 },
  { id: 'SYSOUT',  cat: 'hub', label: 'Automated Reports',
    sub: '353+ automated reports generated daily — audit trails, control summaries, and operational outputs',
    color: '#94a3b8', r: 14 },
  { id: 'EXT_SYS', cat: 'hub', label: 'Partner Systems',
    sub: 'Connected business platforms — buying system (MAGIC), warehousing (WMS), pricing (OLP), replenishment (PRISM/PMS), Ralphs, CIM',
    color: '#94a3b8', r: 14 },
];

const KEY = [
  { id: 'PIDTC1', cat: 'cics', label: 'Case Setup',        sub: 'Primary item entry screen — add, update, or remove case-level product data', r: 8 },
  { id: 'PIDGCD', cat: 'cics', label: 'DSD Item Setup',    sub: 'Direct Store Delivery item setup and maintenance', r: 7 },
  { id: 'PIDTIC', cat: 'cics', label: 'Item Maintenance',  sub: 'Central item record maintenance — cross-database edits', r: 7 },
  { id: 'PIDTXX', cat: 'cics', label: 'Database Sync',     sub: 'Fixes mismatches between the two parallel item databases — must be run manually', r: 7 },
  { id: 'PIDBC0', cat: 'cics', label: 'Staging Review',    sub: 'Browse and review items waiting in the staging queue before committing', r: 6 },
  { id: 'PIDTSS', cat: 'cics', label: 'Stage Pre-fill',    sub: 'Pre-populates the Case Setup screen from a staged request', r: 6 },
  { id: 'PIDTCE', cat: 'cics', label: 'Case Setup (Alt)',  sub: 'Alternate case information entry screen', r: 6 },
  { id: 'PIDTCG', cat: 'cics', label: 'Consumer Group',    sub: 'Consumer group setup and maintenance', r: 6 },
  { id: 'PIDTCO', cat: 'cics', label: 'Consumer Maint.',   sub: 'Consumer-level product data maintenance', r: 6 },
  { id: 'PIDTEX', cat: 'cics', label: 'Store Auth',        sub: 'Store-level authorization exception management', r: 6 },
  { id: 'PIDTAU', cat: 'cics', label: 'Code Lookup',       sub: 'Display and reference product management codes', r: 6 },
  { id: 'PIDTDX', cat: 'cics', label: 'Distribution',      sub: 'Purchasing and distribution data entry', r: 6 },
  { id: 'PIDTEC', cat: 'cics', label: 'Extended Item',     sub: 'Extended consumer item attribute maintenance', r: 6 },
  { id: 'PIDCID', cat: 'cics', label: 'Ralphs Feed',       sub: 'Sends item and pricing updates directly to Ralphs systems via live messaging', r: 6 },
  { id: 'PIDCMQR', cat: 'mq',  label: 'Warehouse Receiver', sub: 'Receives live warehouse updates — dimensions, weights, pallet config — from WMS/WIN systems', r: 8 },
  { id: 'PIDCMQM', cat: 'mq',  label: 'Buying Receiver',   sub: 'Receives item master changes from the MAGIC buying system in real time', r: 8 },
  { id: 'PIDCMQO', cat: 'mq',  label: 'Pricing Router',    sub: 'Routes incoming pricing signals — sends standard items to PID, CIM-managed items to a separate channel', r: 7 },
  { id: 'PIDCMQP', cat: 'mq',  label: 'Pricing Processor', sub: 'Processes incoming pricing data for standard (non-CIM) items', r: 7 },
  { id: 'PIDCMQW', cat: 'mq',  label: 'WHS Connector',     sub: 'Handles warehouse slot authorization sub-processing', r: 6 },
  { id: 'PIDCMQC', cat: 'mq',  label: 'Item Connector',    sub: 'Handles case and consumer item data sub-processing', r: 6 },
  { id: 'PIDMQL',  cat: 'mq',  label: 'Feed Loader',       sub: 'Reads nightly files and publishes them as live messages to connected systems', r: 6 },
  { id: 'PID5400', cat: 'mq',  label: 'OPS/Ralphs Sender', sub: 'Sends item updates to OPS, Ralphs, and PEYTON via live messaging', r: 6 },
  { id: 'PID5375', cat: 'mq',  label: 'Pricing Sender',    sub: 'Sends pricing updates to OPS, Ralphs, and PEYTON via live messaging', r: 6 },
  { id: 'PIDCMQS', cat: 'mq',  label: 'Confirm Sender',    sub: 'Sends confirmation messages back to the originating system after processing', r: 6 },
  { id: 'PID4102', cat: 'batch', label: 'POS Publisher',   sub: 'Publishes all daily item changes to all 31 markets — the primary store feed · processes 51+ files', r: 10 },
  { id: 'PID6011', cat: 'batch', label: 'Vendor Loader',   sub: "Loads vendor item files — Hallmark, American Greetings, magazines, books · 20+ files nightly", r: 8 },
  { id: 'PID6770', cat: 'batch', label: 'Barcode Setup',   sub: "Sets up GTIN/barcode mappings from ITrade, plant data, meat, and Roundy's files", r: 7 },
  { id: 'PID3500', cat: 'batch', label: 'PDM Processor',   sub: 'Processes daily product data management transactions · outputs to pricing and replenishment systems', r: 7 },
  { id: 'PID6810', cat: 'batch', label: 'Report Runner',   sub: 'Generates 16+ nightly operational and compliance reports', r: 7 },
  { id: 'PID5800', cat: 'batch', label: 'Data Extract',    sub: 'Extracts product data on demand for external systems · 50–500 MB per run', r: 6 },
  { id: 'PID5999', cat: 'batch', label: 'Data Loader',     sub: 'Loads data into product tables — can append or fully replace a table (HIGH RISK: no undo)', r: 6 },
  { id: 'PID6750', cat: 'batch', label: 'Division Sync',   sub: 'Synchronizes division-level product data — private label, discontinued items', r: 6 },
  { id: 'PIDSYNC', cat: 'batch', label: 'System Sync',     sub: 'Full or incremental synchronization across PID, the buying system, and all store registers', r: 6 },
  { id: 'PID0246', cat: 'batch', label: 'Cost Processor',  sub: 'Explodes warehouse-level cost records into divisional cost data', r: 6 },
];

export const nodes = [...HUBS, ...KEY];
for (let i = 1; i <= 40;  i++) nodes.push({ id: `PIDB${String(i).padStart(3, '0')}`, cat: 'cics',  r: 3.5 });
for (let i = 1; i <= 56;  i++) nodes.push({ id: `PIDT${String(i).padStart(3, '0')}`, cat: 'cics',  r: 3.5 });
for (let i = 1; i <= 14;  i++) nodes.push({ id: `PICX${String(i).padStart(3, '0')}`, cat: 'cics',  r: 3.5 });
for (let i = 1; i <= 17;  i++) nodes.push({ id: `PIDQ${String(i).padStart(3, '0')}`, cat: 'mq',    r: 3.5 });
for (let i = 1; i <= 366; i++) nodes.push({ id: `PBAT${String(i).padStart(4, '0')}`, cat: 'batch', r: 3 });

const idx = {};
nodes.forEach((n, i) => (idx[n.id] = i));

export const links = [];
function e(a, b) { if (a in idx && b in idx) links.push({ source: a, target: b }); }

e('IMS_DB', 'DB2'); e('IMS_DB', 'TRNROT'); e('MQ_SYS', 'EXT_SYS'); e('POS_KMA', 'NDM_FT'); e('NDM_FT', 'EXT_SYS');
['PIDTC1', 'PIDGCD', 'PIDTIC', 'PIDTXX', 'PIDTCE', 'PIDTCG', 'PIDTCO', 'PIDTEX', 'PIDTDX', 'PIDTEC'].forEach(id => { e(id, 'TRNROT'); e(id, 'IMS_DB'); e(id, 'DB2'); });
['PIDBC0', 'PIDTSS', 'PIDTAU'].forEach(id => e(id, 'DB2'));
e('PIDCID', 'MQ_SYS'); e('PIDCID', 'EXT_SYS');
e('PIDTSS', 'PIDTC1'); e('PIDBC0', 'PIDTC1'); e('PIDTXX', 'PIDTIC'); e('PIDTCE', 'PIDTC1');
e('PIDCMQR', 'MQ_SYS'); e('PIDCMQR', 'IMS_DB'); e('PIDCMQR', 'DB2'); e('PIDCMQR', 'TRNROT'); e('PIDCMQR', 'EXT_SYS');
e('PIDCMQM', 'MQ_SYS'); e('PIDCMQM', 'DB2');    e('PIDCMQM', 'TRNROT'); e('PIDCMQM', 'EXT_SYS');
e('PIDCMQO', 'MQ_SYS'); e('PIDCMQO', 'EXT_SYS');
e('PIDCMQP', 'IMS_DB'); e('PIDCMQP', 'DB2'); e('PIDCMQP', 'TRNROT');
e('PIDCMQW', 'IMS_DB'); e('PIDCMQW', 'DB2');
e('PIDCMQC', 'IMS_DB'); e('PIDCMQC', 'DB2');
e('PIDMQL', 'MQ_SYS'); e('PIDMQL', 'NDM_FT');
e('PID5400', 'MQ_SYS'); e('PID5400', 'EXT_SYS');
e('PID5375', 'MQ_SYS'); e('PID5375', 'EXT_SYS');
e('PIDCMQS', 'MQ_SYS'); e('PIDCMQS', 'EXT_SYS');
e('PIDCMQM', 'PIDCMQW'); e('PIDCMQM', 'PIDCMQC'); e('PIDCMQO', 'PIDCMQP');
e('PID4102', 'POS_KMA'); e('PID4102', 'NDM_FT'); e('PID4102', 'SYSOUT'); e('PID4102', 'DB2'); e('PID4102', 'TRNROT');
e('PID6011', 'NDM_FT'); e('PID6011', 'DB2'); e('PID6011', 'IMS_DB'); e('PID6011', 'TRNROT'); e('PID6011', 'SYSOUT');
e('PID6770', 'NDM_FT'); e('PID6770', 'DB2'); e('PID6770', 'SYSOUT');
e('PID3500', 'NDM_FT'); e('PID3500', 'DB2'); e('PID3500', 'TRNROT'); e('PID3500', 'EXT_SYS');
e('PID6810', 'NDM_FT'); e('PID6810', 'SYSOUT'); e('PID6810', 'DB2');
e('PID5800', 'NDM_FT'); e('PID5800', 'DB2');
e('PID5999', 'NDM_FT'); e('PID5999', 'DB2');
e('PID6750', 'NDM_FT'); e('PID6750', 'SYSOUT');
e('PIDSYNC', 'DB2');    e('PIDSYNC', 'NDM_FT'); e('PIDSYNC', 'EXT_SYS');
e('PID0246', 'NDM_FT'); e('PID0246', 'SYSOUT'); e('PID0246', 'DB2');
e('PID4102', 'PID6011'); e('PID3500', 'PID6011'); e('PID4102', 'PID6750');

const cA = ['PIDTC1', 'PIDGCD', 'PIDTIC', 'PIDTCE', 'PIDTCG', 'PIDTCO', 'PIDTEX', 'PIDTDX', 'PIDTEC', 'PIDTSS'];
for (let i = 1; i <= 40; i++) { const id = `PIDB${String(i).padStart(3, '0')}`; e(id, 'DB2'); if (i % 3 === 0) e(id, 'IMS_DB'); e(id, cA[(i - 1) % cA.length]); if (i % 7 === 0) e(id, cA[(i + 3) % cA.length]); }
for (let i = 1; i <= 56; i++) { const id = `PIDT${String(i).padStart(3, '0')}`; e(id, 'TRNROT'); e(id, 'DB2'); e(id, 'IMS_DB'); if (i > 1) e(id, `PIDT${String(i - 1).padStart(3, '0')}`); if (i % 8 === 0) e(id, cA[i % cA.length]); }
for (let i = 1; i <= 14; i++) { const id = `PICX${String(i).padStart(3, '0')}`; e(id, 'DB2'); if (i % 2 === 0) e(id, 'TRNROT'); if (i % 3 === 0) e(id, 'IMS_DB'); e(id, cA[i % cA.length]); }
const mqA = ['PIDCMQR', 'PIDCMQM', 'PIDCMQO', 'PIDMQL', 'PID5400'];
for (let i = 1; i <= 17; i++) { const id = `PIDQ${String(i).padStart(3, '0')}`; e(id, 'MQ_SYS'); if (i % 2 === 0) e(id, 'DB2'); if (i % 3 === 0) e(id, 'TRNROT'); if (i % 4 === 0) e(id, 'EXT_SYS'); e(id, mqA[(i - 1) % mqA.length]); }
const bA = ['PID4102', 'PID6011', 'PID6770', 'PID3500', 'PID6810', 'PID5800', 'PID6750', 'PIDSYNC', 'PID0246'];
for (let i = 1; i <= 366; i++) {
  const id = `PBAT${String(i).padStart(4, '0')}`;
  const seg = i <= 122 ? 0 : i <= 244 ? 1 : 2;
  if (seg === 0) { e(id, 'NDM_FT'); if (i % 2 === 0) e(id, 'TRNROT'); if (i % 3 === 0) e(id, 'POS_KMA'); if (i % 4 === 0) e(id, 'DB2'); e(id, bA[(i - 1) % 4]); }
  else if (seg === 1) { e(id, 'SYSOUT'); if (i % 2 === 0) e(id, 'NDM_FT'); if (i % 3 === 0) e(id, 'EXT_SYS'); if (i % 4 === 0) e(id, 'DB2'); if (i % 5 === 0) e(id, 'TRNROT'); e(id, bA[4 + ((i - 1) % 3)]); }
  else { e(id, 'DB2'); if (i % 2 === 0) e(id, 'NDM_FT'); if (i % 2 === 1) e(id, 'SYSOUT'); if (i % 3 === 0) e(id, 'TRNROT'); if (i % 4 === 0) e(id, 'IMS_DB'); if (i % 5 === 0) e(id, 'POS_KMA'); if (i % 6 === 0) e(id, 'EXT_SYS'); e(id, bA[(i - 1) % bA.length]); }
  if (i > 1 && i % 6 === 0) e(id, `PBAT${String(i - 1).padStart(4, '0')}`);
  if (i > 5 && i % 18 === 0) e(id, `PBAT${String(i - 5).padStart(4, '0')}`);
}

export const adjacency = new Map();
nodes.forEach(n => adjacency.set(n.id, new Set()));
links.forEach(l => {
  adjacency.get(l.source).add(l.target);
  adjacency.get(l.target).add(l.source);
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/data/pidData.test.js`
Expected: PASS, all 6 assertions green.

- [ ] **Step 5: Commit**

```bash
git add src/data/pidData.js src/data/pidData.test.js
git commit -m "feat: port PID dataset from reference HTML into data module"
```

---

### Task 3: FilterContext — shared filter state

**Files:**
- Create: `src/context/FilterContext.jsx`
- Test: `src/context/FilterContext.test.jsx`

- [ ] **Step 1: Write the failing test**

```jsx
// src/context/FilterContext.test.jsx
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { FilterProvider, useFilters } from './FilterContext';

function wrapper({ children }) {
  return <FilterProvider>{children}</FilterProvider>;
}

describe('FilterContext', () => {
  it('defaults to namedOnly=true and all categories selected', () => {
    const { result } = renderHook(() => useFilters(), { wrapper });
    expect(result.current.namedOnly).toBe(true);
    expect(result.current.categories.size).toBe(4);
  });

  it('namedOnly=true restricts visibleNodeIds to the 34 labeled KEY nodes plus 0 hubs (hubs excluded unless hub category selected — hubs DO have labels, so 42 total)', () => {
    const { result } = renderHook(() => useFilters(), { wrapper });
    // 8 hubs + 34 KEY nodes all have labels; filler nodes do not.
    expect(result.current.visibleNodeIds.size).toBe(42);
  });

  it('turning namedOnly off reveals all 535 nodes (with all categories selected)', () => {
    const { result } = renderHook(() => useFilters(), { wrapper });
    act(() => result.current.setNamedOnly(false));
    expect(result.current.visibleNodeIds.size).toBe(535);
  });

  it('search filters by id or label, case-insensitively', () => {
    const { result } = renderHook(() => useFilters(), { wrapper });
    act(() => result.current.setSearch('publisher'));
    expect(result.current.visibleNodeIds.has('PID4102')).toBe(true); // "POS Publisher"
    expect(result.current.visibleNodeIds.size).toBe(1);
  });

  it('category filter narrows to selected categories only', () => {
    const { result } = renderHook(() => useFilters(), { wrapper });
    act(() => result.current.setCategories(new Set(['hub'])));
    expect(result.current.visibleNodeIds.size).toBe(8);
  });

  it('hubFilter shows the hub itself plus its direct neighbors, respecting namedOnly', () => {
    const { result } = renderHook(() => useFilters(), { wrapper });
    act(() => {
      result.current.setNamedOnly(false);
      result.current.setHubFilter('TRNROT');
    });
    expect(result.current.visibleNodeIds.has('TRNROT')).toBe(true);
    expect(result.current.visibleNodeIds.size).toBeGreaterThan(1);
  });

  it('throws if useFilters is used outside a provider', () => {
    expect(() => renderHook(() => useFilters())).toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/context/FilterContext.test.jsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `src/context/FilterContext.jsx`**

```jsx
import { createContext, useContext, useMemo, useState } from 'react';
import { nodes, adjacency } from '../data/pidData';

const ALL_CATEGORIES = ['cics', 'mq', 'batch', 'hub'];

const FilterContext = createContext(null);

export function FilterProvider({ children }) {
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState(() => new Set(ALL_CATEGORIES));
  const [hubFilter, setHubFilter] = useState(null);
  const [namedOnly, setNamedOnly] = useState(true);

  const visibleNodeIds = useMemo(() => {
    const term = search.trim().toLowerCase();
    const result = new Set();
    for (const n of nodes) {
      if (!categories.has(n.cat)) continue;
      if (namedOnly && !n.label) continue;
      if (term) {
        const idMatch = n.id.toLowerCase().includes(term);
        const labelMatch = (n.label || '').toLowerCase().includes(term);
        if (!idMatch && !labelMatch) continue;
      }
      if (hubFilter && n.id !== hubFilter && !adjacency.get(hubFilter)?.has(n.id)) continue;
      result.add(n.id);
    }
    return result;
  }, [search, categories, hubFilter, namedOnly]);

  const value = {
    search, setSearch,
    categories, setCategories,
    hubFilter, setHubFilter,
    namedOnly, setNamedOnly,
    visibleNodeIds,
  };

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}

export function useFilters() {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error('useFilters must be used within a FilterProvider');
  return ctx;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/context/FilterContext.test.jsx`
Expected: PASS, all 7 assertions green.

- [ ] **Step 5: Commit**

```bash
git add src/context/FilterContext.jsx src/context/FilterContext.test.jsx
git commit -m "feat: add shared FilterContext for search/category/hub/named-only filtering"
```

---

### Task 4: FilterBar component

**Files:**
- Create: `src/components/FilterBar.jsx`
- Test: `src/components/FilterBar.test.jsx`

- [ ] **Step 1: Write the failing test**

```jsx
// src/components/FilterBar.test.jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterProvider, useFilters } from '../context/FilterContext';
import FilterBar from './FilterBar';

function Probe() {
  const { search, namedOnly } = useFilters();
  return <div data-testid="probe">{search}|{String(namedOnly)}</div>;
}

function setup() {
  return render(
    <FilterProvider>
      <FilterBar />
      <Probe />
    </FilterProvider>
  );
}

describe('FilterBar', () => {
  it('renders a search input, category checkboxes, hub select, and named-only toggle', () => {
    setup();
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/named only/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/item setup/i)).toBeInTheDocument();
  });

  it('typing in search updates FilterContext', async () => {
    setup();
    await userEvent.type(screen.getByPlaceholderText(/search/i), 'publisher');
    expect(screen.getByTestId('probe')).toHaveTextContent('publisher|true');
  });

  it('unchecking named-only updates FilterContext', async () => {
    setup();
    await userEvent.click(screen.getByLabelText(/named only/i));
    expect(screen.getByTestId('probe')).toHaveTextContent('|false');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/FilterBar.test.jsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `src/components/FilterBar.jsx`**

```jsx
import { useFilters } from '../context/FilterContext';
import { CAT_PLURAL, nodes } from '../data/pidData';

const CATEGORY_ORDER = ['cics', 'mq', 'batch', 'hub'];

export default function FilterBar() {
  const { search, setSearch, categories, setCategories, hubFilter, setHubFilter, namedOnly, setNamedOnly } = useFilters();
  const hubs = nodes.filter(n => n.cat === 'hub');

  function toggleCategory(cat) {
    const next = new Set(categories);
    if (next.has(cat)) next.delete(cat); else next.add(cat);
    setCategories(next);
  }

  return (
    <div className="filter-bar">
      <input
        type="text"
        placeholder="Search name/ID"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      {CATEGORY_ORDER.map(cat => (
        <label key={cat}>
          <input
            type="checkbox"
            checked={categories.has(cat)}
            onChange={() => toggleCategory(cat)}
          />
          {CAT_PLURAL[cat]}
        </label>
      ))}
      <select value={hubFilter ?? ''} onChange={e => setHubFilter(e.target.value || null)}>
        <option value="">All hubs</option>
        {hubs.map(h => (
          <option key={h.id} value={h.id}>{h.label}</option>
        ))}
      </select>
      <label>
        <input
          type="checkbox"
          checked={namedOnly}
          onChange={e => setNamedOnly(e.target.checked)}
        />
        Named only
      </label>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/FilterBar.test.jsx`
Expected: PASS, all 3 assertions green.

- [ ] **Step 5: Commit**

```bash
git add src/components/FilterBar.jsx src/components/FilterBar.test.jsx
git commit -m "feat: add FilterBar component wired to FilterContext"
```

---

### Task 5: App shell — tab bar + layout with stub views

**Files:**
- Modify: `src/App.jsx`
- Test: `src/App.test.jsx`

- [ ] **Step 1: Write the failing test**

```jsx
// src/App.test.jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('App', () => {
  it('renders all 5 view tabs and defaults to Graph', () => {
    render(<App />);
    for (const label of ['Graph', 'Tree', 'List', 'Cards', 'List+Deps']) {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
    }
    expect(screen.getByTestId('active-view')).toHaveTextContent('graph');
  });

  it('switching tabs changes the active view and keeps the filter bar mounted', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: 'List' }));
    expect(screen.getByTestId('active-view')).toHaveTextContent('list');
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/App.test.jsx`
Expected: FAIL — no tab buttons rendered (current `App.jsx` is a placeholder).

- [ ] **Step 3: Write `src/App.jsx`**

Stub view components for now — they'll be replaced task-by-task in Tasks 6–10. `data-testid="active-view"` is a temporary hook removed in Task 11 once all real views expose their own identifiable content.

```jsx
import { useState } from 'react';
import { FilterProvider } from './context/FilterContext';
import FilterBar from './components/FilterBar';

const VIEWS = [
  { key: 'graph', label: 'Graph' },
  { key: 'tree', label: 'Tree' },
  { key: 'list', label: 'List' },
  { key: 'cards', label: 'Cards' },
  { key: 'deps', label: 'List+Deps' },
];

function StubView({ name }) {
  return <div data-testid="active-view">{name}</div>;
}

export default function App() {
  const [active, setActive] = useState('graph');

  return (
    <FilterProvider>
      <div className="tab-bar">
        {VIEWS.map(v => (
          <button
            key={v.key}
            className={active === v.key ? 'tab active' : 'tab'}
            onClick={() => setActive(v.key)}
          >
            {v.label}
          </button>
        ))}
      </div>
      <FilterBar />
      <div className="view-container">
        <StubView name={active} />
      </div>
    </FilterProvider>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/App.test.jsx`
Expected: PASS, both assertions green.

- [ ] **Step 5: Add layout CSS to `src/App.css`**

```css
body { margin: 0; font-family: 'Segoe UI', sans-serif; background: #020817; color: #e2e8f0; }
.tab-bar { display: flex; gap: 4px; padding: 10px 16px 0; border-bottom: 1px solid #1e293b; }
.tab { background: transparent; border: none; color: #64748b; padding: 8px 14px; cursor: pointer; font-size: 13px; border-bottom: 2px solid transparent; }
.tab.active { color: #e2e8f0; border-bottom-color: #38bdf8; }
.filter-bar { display: flex; gap: 14px; align-items: center; flex-wrap: wrap; padding: 10px 16px; border-bottom: 1px solid #0f172a; font-size: 12px; }
.filter-bar label { display: flex; align-items: center; gap: 4px; }
.view-container { padding: 16px; }
```

- [ ] **Step 6: Commit**

```bash
git add src/App.jsx src/App.css src/App.test.jsx
git commit -m "feat: add tab bar app shell with stub views"
```

---

### Task 6: ListView

**Files:**
- Create: `src/views/ListView.jsx`
- Create: `src/views/ListView.css`
- Test: `src/views/ListView.test.jsx`

- [ ] **Step 1: Write the failing test**

```jsx
// src/views/ListView.test.jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterProvider, useFilters } from '../context/FilterContext';
import ListView from './ListView';

function Controlled({ children }) {
  return <FilterProvider>{children}</FilterProvider>;
}

describe('ListView', () => {
  it('renders one row per visible node (42 with default namedOnly)', () => {
    render(<Controlled><ListView /></Controlled>);
    const rows = screen.getAllByRole('row'); // includes header row
    expect(rows.length).toBe(1 + 42);
  });

  it('shows total-degree connection count unaffected by category filter', async () => {
    render(
      <Controlled>
        <ListView />
      </Controlled>
    );
    const posRow = screen.getByText('POS Publisher').closest('tr');
    const before = posRow.querySelector('[data-col="connections"]').textContent;
    // Sorting shouldn't change the count value itself
    await userEvent.click(screen.getByRole('columnheader', { name: /label/i }));
    const posRowAfter = screen.getByText('POS Publisher').closest('tr');
    expect(posRowAfter.querySelector('[data-col="connections"]').textContent).toBe(before);
  });

  it('sorting by column reorders rows', async () => {
    render(<Controlled><ListView /></Controlled>);
    await userEvent.click(screen.getByRole('columnheader', { name: /label/i }));
    const labels = screen.getAllByTestId('row-label').map(el => el.textContent);
    const sorted = [...labels].sort((a, b) => a.localeCompare(b));
    expect(labels).toEqual(sorted);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/views/ListView.test.jsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `src/views/ListView.jsx`**

```jsx
import { useMemo, useState } from 'react';
import { useFilters } from '../context/FilterContext';
import { nodes, adjacency, CAT_PLURAL } from '../data/pidData';
import './ListView.css';

export default function ListView() {
  const { visibleNodeIds } = useFilters();
  const [sortBy, setSortBy] = useState('id');
  const [sortDir, setSortDir] = useState('asc');

  const rows = useMemo(() => {
    const visible = nodes.filter(n => visibleNodeIds.has(n.id));
    const withCounts = visible.map(n => ({
      ...n,
      connections: adjacency.get(n.id)?.size ?? 0,
    }));
    const dir = sortDir === 'asc' ? 1 : -1;
    return withCounts.sort((a, b) => {
      const av = sortBy === 'connections' ? a.connections : String(a[sortBy] ?? a.id).toLowerCase();
      const bv = sortBy === 'connections' ? b.connections : String(b[sortBy] ?? b.id).toLowerCase();
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
  }, [visibleNodeIds, sortBy, sortDir]);

  function handleSort(col) {
    if (sortBy === col) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortBy(col); setSortDir('asc'); }
  }

  return (
    <table className="list-view">
      <thead>
        <tr>
          <th role="columnheader" onClick={() => handleSort('id')}>ID</th>
          <th role="columnheader" onClick={() => handleSort('label')}>Label</th>
          <th role="columnheader" onClick={() => handleSort('cat')}>Category</th>
          <th role="columnheader" onClick={() => handleSort('connections')}>Connections</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(n => (
          <tr key={n.id}>
            <td>{n.id}</td>
            <td data-testid="row-label">{n.label || '—'}</td>
            <td>{CAT_PLURAL[n.cat]}</td>
            <td data-col="connections">{n.connections}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

- [ ] **Step 4: Write `src/views/ListView.css`**

```css
.list-view { width: 100%; border-collapse: collapse; font-size: 13px; }
.list-view th { text-align: left; cursor: pointer; padding: 6px 10px; color: #64748b; border-bottom: 1px solid #1e293b; }
.list-view td { padding: 6px 10px; border-bottom: 1px solid #0f172a; }
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/views/ListView.test.jsx`
Expected: PASS, all 3 assertions green.

- [ ] **Step 6: Commit**

```bash
git add src/views/ListView.jsx src/views/ListView.css src/views/ListView.test.jsx
git commit -m "feat: add sortable ListView respecting shared filters"
```

---

### Task 7: CardView

**Files:**
- Create: `src/views/CardView.jsx`
- Create: `src/views/CardView.css`
- Test: `src/views/CardView.test.jsx`

- [ ] **Step 1: Write the failing test**

```jsx
// src/views/CardView.test.jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FilterProvider } from '../context/FilterContext';
import CardView from './CardView';

describe('CardView', () => {
  it('renders one card per visible node with description and connection chips', () => {
    render(<FilterProvider><CardView /></FilterProvider>);
    const card = screen.getByText('POS Publisher').closest('.card');
    expect(card).toHaveTextContent('PID4102');
    expect(card).toHaveTextContent(/publishes all daily item changes/i);
    expect(card.querySelectorAll('.chip').length).toBeGreaterThan(0);
  });

  it('renders 42 cards by default (namedOnly=true)', () => {
    render(<FilterProvider><CardView /></FilterProvider>);
    expect(screen.getAllByRole('article').length).toBe(42);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/views/CardView.test.jsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `src/views/CardView.jsx`**

Reuses the same "group neighbors by category" logic that List+Deps will need (Task 9) — implemented locally here first since Card ships before List+Deps; Task 9 will import this helper from `pidData.js` if duplication becomes a problem, but for two call sites a small local helper is fine per YAGNI.

```jsx
import { useFilters } from '../context/FilterContext';
import { nodes, adjacency, CAT_PLURAL, CAT_LABEL } from '../data/pidData';
import './CardView.css';

const nodesById = new Map(nodes.map(n => [n.id, n]));

function groupNeighborsByCategory(nodeId) {
  const neighborIds = adjacency.get(nodeId) ?? new Set();
  const groups = { hub: [], cics: [], mq: [], batch: [] };
  for (const id of neighborIds) {
    const n = nodesById.get(id);
    if (n) groups[n.cat].push(n);
  }
  return groups;
}

export default function CardView() {
  const { visibleNodeIds } = useFilters();
  const visible = nodes.filter(n => visibleNodeIds.has(n.id));

  return (
    <div className="card-grid">
      {visible.map(n => {
        const groups = groupNeighborsByCategory(n.id);
        return (
          <article key={n.id} className="card">
            <span className={`badge badge-${n.cat}`}>{CAT_LABEL[n.cat]}</span>
            <h3>{n.label || n.id} {n.label && <span className="card-id">{n.id}</span>}</h3>
            {n.sub && <p className="card-desc">{n.sub}</p>}
            <div className="card-chips">
              {Object.entries(groups).flatMap(([cat, group]) =>
                group.filter(g => g.label).map(g => (
                  <span key={g.id} className={`chip chip-${cat}`}>{g.label}</span>
                ))
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: Write `src/views/CardView.css`**

```css
.card-grid { display: flex; flex-wrap: wrap; gap: 12px; }
.card { border: 1px solid #1e293b; border-radius: 8px; padding: 12px; width: 260px; font-size: 12px; }
.card h3 { margin: 6px 0; font-size: 14px; }
.card-id { color: #64748b; font-weight: 400; font-size: 11px; }
.card-desc { color: #94a3b8; margin: 4px 0 8px; }
.badge { font-size: 10px; padding: 2px 6px; border-radius: 3px; }
.badge-cics { color: #38bdf8; background: #38bdf822; }
.badge-mq { color: #d946ef; background: #d946ef22; }
.badge-batch { color: #4ade80; background: #4ade8022; }
.badge-hub { color: #94a3b8; background: #94a3b822; }
.card-chips { display: flex; flex-wrap: wrap; gap: 4px; }
.chip { font-size: 10px; padding: 1px 6px; border-radius: 3px; border: 1px solid #334155; }
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/views/CardView.test.jsx`
Expected: PASS, both assertions green.

- [ ] **Step 6: Commit**

```bash
git add src/views/CardView.jsx src/views/CardView.css src/views/CardView.test.jsx
git commit -m "feat: add rich CardView with inline connection chips"
```

---

### Task 8: TreeView (category-rooted, click-to-re-root, cycle-safe)

**Files:**
- Create: `src/views/TreeView.jsx`
- Create: `src/views/TreeView.css`
- Test: `src/views/TreeView.test.jsx`

- [ ] **Step 1: Write the failing test**

```jsx
// src/views/TreeView.test.jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterProvider } from '../context/FilterContext';
import TreeView from './TreeView';

describe('TreeView', () => {
  it('renders 4 category root nodes by default', () => {
    render(<FilterProvider><TreeView /></FilterProvider>);
    for (const label of ['Item Setup Screens', 'Live System Feeds', 'Overnight Jobs', 'Shared Systems']) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it('expanding a category reveals its labeled nodes', async () => {
    render(<FilterProvider><TreeView /></FilterProvider>);
    await userEvent.click(screen.getByText('Overnight Jobs'));
    expect(screen.getByText('POS Publisher')).toBeInTheDocument();
  });

  it('clicking a node re-roots the tree at that node and shows a back control', async () => {
    render(<FilterProvider><TreeView /></FilterProvider>);
    await userEvent.click(screen.getByText('Overnight Jobs'));
    await userEvent.click(screen.getByText('POS Publisher'));
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
    expect(screen.getByTestId('tree-root-label')).toHaveTextContent('POS Publisher');
  });

  it('does not infinitely recurse when re-rooted into a cycle', async () => {
    render(<FilterProvider><TreeView /></FilterProvider>);
    await userEvent.click(screen.getByText('Overnight Jobs'));
    await userEvent.click(screen.getByText('POS Publisher'));
    // PID4102 (POS Publisher) <-> PID6011 (Vendor Loader) is a direct cycle in the dataset.
    // Rendering must terminate; presence of the child confirms no crash/hang.
    expect(screen.getByText('Vendor Loader')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/views/TreeView.test.jsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `src/views/TreeView.jsx`**

```jsx
import { useMemo, useState } from 'react';
import { useFilters } from '../context/FilterContext';
import { nodes, adjacency, CAT_PLURAL } from '../data/pidData';
import './TreeView.css';

const nodesById = new Map(nodes.map(n => [n.id, n]));
const CATEGORY_ORDER = ['cics', 'mq', 'batch', 'hub'];
const MAX_DEPTH = 4;

function TreeNode({ nodeId, visibleNodeIds, path, onSelect }) {
  const [expanded, setExpanded] = useState(false);
  const node = nodesById.get(nodeId);
  const children = [...(adjacency.get(nodeId) ?? [])]
    .filter(id => visibleNodeIds.has(id) && !path.has(id));

  if (!node) return null;

  return (
    <li>
      <span
        className="tree-label"
        onClick={() => setExpanded(e => !e)}
      >
        {children.length > 0 ? (expanded ? '▾ ' : '▸ ') : '• '}
        <button className="tree-node-link" onClick={ev => { ev.stopPropagation(); onSelect(nodeId); }}>
          {node.label || node.id}
        </button>
      </span>
      {expanded && children.length > 0 && path.size < MAX_DEPTH && (
        <ul>
          {children.map(childId => (
            <TreeNode
              key={childId}
              nodeId={childId}
              visibleNodeIds={visibleNodeIds}
              path={new Set([...path, nodeId])}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function TreeView() {
  const { visibleNodeIds } = useFilters();
  const [root, setRoot] = useState(null); // null = category-rooted default view

  const byCategory = useMemo(() => {
    const groups = { cics: [], mq: [], batch: [], hub: [] };
    for (const n of nodes) {
      if (visibleNodeIds.has(n.id)) groups[n.cat].push(n.id);
    }
    return groups;
  }, [visibleNodeIds]);

  if (root) {
    return (
      <div className="tree-view">
        <button onClick={() => setRoot(null)}>← Back to categories</button>
        <div data-testid="tree-root-label" className="tree-root-label">
          {nodesById.get(root)?.label || root}
        </div>
        <ul>
          <TreeNode
            nodeId={root}
            visibleNodeIds={visibleNodeIds}
            path={new Set()}
            onSelect={setRoot}
          />
        </ul>
      </div>
    );
  }

  return (
    <div className="tree-view">
      <ul>
        {CATEGORY_ORDER.map(cat => (
          <CategoryBranch
            key={cat}
            cat={cat}
            ids={byCategory[cat]}
            visibleNodeIds={visibleNodeIds}
            onSelect={setRoot}
          />
        ))}
      </ul>
    </div>
  );
}

function CategoryBranch({ cat, ids, visibleNodeIds, onSelect }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <li>
      <span className="tree-label" onClick={() => setExpanded(e => !e)}>
        {expanded ? '▾ ' : '▸ '}{CAT_PLURAL[cat]} ({ids.length})
      </span>
      {expanded && (
        <ul>
          {ids.map(id => (
            <TreeNode
              key={id}
              nodeId={id}
              visibleNodeIds={visibleNodeIds}
              path={new Set()}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
```

- [ ] **Step 4: Write `src/views/TreeView.css`**

```css
.tree-view ul { list-style: none; margin: 0; padding-left: 18px; font-size: 13px; }
.tree-view > ul { padding-left: 0; }
.tree-label { cursor: pointer; color: #94a3b8; }
.tree-node-link { background: none; border: none; color: #e2e8f0; cursor: pointer; padding: 0; font: inherit; }
.tree-node-link:hover { text-decoration: underline; }
.tree-root-label { font-weight: 700; margin: 8px 0; }
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/views/TreeView.test.jsx`
Expected: PASS, all 4 assertions green.

- [ ] **Step 6: Commit**

```bash
git add src/views/TreeView.jsx src/views/TreeView.css src/views/TreeView.test.jsx
git commit -m "feat: add category-rooted TreeView with click-to-re-root and cycle guard"
```

---

### Task 9: ListWithDepsView (master/detail split panel)

**Files:**
- Create: `src/views/ListWithDepsView.jsx`
- Create: `src/views/ListWithDepsView.css`
- Test: `src/views/ListWithDepsView.test.jsx`

- [ ] **Step 1: Write the failing test**

```jsx
// src/views/ListWithDepsView.test.jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterProvider } from '../context/FilterContext';
import ListWithDepsView from './ListWithDepsView';

describe('ListWithDepsView', () => {
  it('shows an empty-state prompt in the detail panel before selection', () => {
    render(<FilterProvider><ListWithDepsView /></FilterProvider>);
    expect(screen.getByTestId('detail-panel')).toHaveTextContent(/select a/i);
  });

  it('selecting a row shows its dependencies grouped by category in the detail panel', async () => {
    render(<FilterProvider><ListWithDepsView /></FilterProvider>);
    await userEvent.click(screen.getByText('POS Publisher'));
    const panel = screen.getByTestId('detail-panel');
    expect(panel).toHaveTextContent('POS Publisher');
    expect(panel).toHaveTextContent(/shared systems/i);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/views/ListWithDepsView.test.jsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `src/views/ListWithDepsView.jsx`**

```jsx
import { useMemo, useState } from 'react';
import { useFilters } from '../context/FilterContext';
import { nodes, adjacency, CAT_PLURAL } from '../data/pidData';
import './ListWithDepsView.css';

const nodesById = new Map(nodes.map(n => [n.id, n]));
const CATEGORY_ORDER = ['hub', 'cics', 'mq', 'batch'];

function groupNeighborsByCategory(nodeId) {
  const neighborIds = adjacency.get(nodeId) ?? new Set();
  const groups = { hub: [], cics: [], mq: [], batch: [] };
  for (const id of neighborIds) {
    const n = nodesById.get(id);
    if (n) groups[n.cat].push(n);
  }
  return groups;
}

export default function ListWithDepsView() {
  const { visibleNodeIds } = useFilters();
  const [selectedId, setSelectedId] = useState(null);

  const visible = useMemo(() => nodes.filter(n => visibleNodeIds.has(n.id)), [visibleNodeIds]);
  const selected = selectedId ? nodesById.get(selectedId) : null;
  const groups = selectedId ? groupNeighborsByCategory(selectedId) : null;

  return (
    <div className="deps-view">
      <ul className="deps-list">
        {visible.map(n => (
          <li
            key={n.id}
            className={n.id === selectedId ? 'selected' : ''}
            onClick={() => setSelectedId(n.id)}
          >
            {n.label || n.id} <span className="deps-id">{n.id}</span>
          </li>
        ))}
      </ul>
      <div className="deps-detail" data-testid="detail-panel">
        {!selected && <p>Select a row to see its dependencies.</p>}
        {selected && (
          <>
            <h3>{selected.label || selected.id}</h3>
            {CATEGORY_ORDER.map(cat => {
              const group = groups[cat];
              if (!group.length) return null;
              return (
                <div key={cat} className="deps-group">
                  <div className="deps-cat">{CAT_PLURAL[cat]} ({group.length})</div>
                  <div className="deps-tags">
                    {group.filter(g => g.label).map(g => (
                      <span key={g.id} className="deps-tag">{g.label}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Write `src/views/ListWithDepsView.css`**

```css
.deps-view { display: flex; gap: 16px; }
.deps-list { list-style: none; margin: 0; padding: 0; width: 260px; font-size: 13px; max-height: 480px; overflow-y: auto; }
.deps-list li { padding: 6px 8px; cursor: pointer; border-bottom: 1px solid #0f172a; }
.deps-list li.selected { background: #0f172a; }
.deps-id { color: #64748b; font-size: 11px; }
.deps-detail { flex: 1; border: 1px solid #1e293b; border-radius: 8px; padding: 12px; font-size: 12px; }
.deps-group { margin-bottom: 10px; }
.deps-cat { color: #64748b; font-size: 10px; text-transform: uppercase; margin-bottom: 4px; }
.deps-tags { display: flex; flex-wrap: wrap; gap: 4px; }
.deps-tag { border: 1px solid #334155; border-radius: 3px; padding: 1px 6px; font-size: 11px; }
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/views/ListWithDepsView.test.jsx`
Expected: PASS, both assertions green.

- [ ] **Step 6: Commit**

```bash
git add src/views/ListWithDepsView.jsx src/views/ListWithDepsView.css src/views/ListWithDepsView.test.jsx
git commit -m "feat: add List+Deps master/detail view"
```

---

### Task 10: GraphView — port the D3 force simulation

**Files:**
- Create: `src/views/GraphView.jsx`
- Create: `src/views/GraphView.css`
- Test: `src/views/GraphView.test.jsx`

This is the highest-risk task: it ports imperative D3 code into a React `useEffect`. Per the spec's mutation-hazard note, `links` must be shallow-cloned before being handed to `d3.forceLink` — `nodes` do not need cloning (simulation writes `x`/`y`/`vx`/`vy` onto them, which is harmless since no other view reads those fields). Testing D3-rendered SVG internals in jsdom is unreliable (no real layout/animation), so this task's test is a smoke test confirming the component mounts, renders the expected SVG structure, and doesn't mutate the shared `links` array — not a test of visual force-layout correctness.

- [ ] **Step 1: Write the failing test**

```jsx
// src/views/GraphView.test.jsx
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { FilterProvider } from '../context/FilterContext';
import { links } from '../data/pidData';
import GraphView from './GraphView';

// jsdom has no real layout engine; d3-force still runs its tick logic synchronously
// enough for mount to succeed, but SVG geometry won't be meaningful. We only assert
// structural facts here.
describe('GraphView', () => {
  it('renders an svg with one <g> node group and does not mutate the shared links array', () => {
    const originalLinksSnapshot = links.map(l => ({ ...l }));
    render(<FilterProvider><GraphView /></FilterProvider>);
    expect(document.querySelector('svg')).toBeTruthy();
    expect(document.querySelectorAll('.node').length).toBe(535);
    // shared `links` must still have string source/target, not node object references
    links.forEach((l, i) => {
      expect(typeof l.source).toBe('string');
      expect(typeof l.target).toBe('string');
      expect(l.source).toBe(originalLinksSnapshot[i].source);
      expect(l.target).toBe(originalLinksSnapshot[i].target);
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/views/GraphView.test.jsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `src/views/GraphView.jsx`**

Ports `references/PID_Network_Graph_v3.html` lines 234–446 into a component. Key adaptations: (1) clone `links` before `d3.forceLink`, per the spec; (2) read `nodes`/`links`/`adjacency` from `pidData.js` instead of local consts; (3) apply `visibleNodeIds` from `FilterContext` as dimming (matching how the reference already dims for its own category-highlight feature), defaulting to the same `namedOnly=true` filter as every other view; (4) run the whole D3 setup in a single `useEffect` with an empty dependency array plus a second effect that re-applies dimming when `visibleNodeIds` changes, to avoid re-running the expensive simulation on every filter change.

```jsx
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useFilters } from '../context/FilterContext';
import { nodes, links as sharedLinks, CAT_COLOR } from '../data/pidData';
import './GraphView.css';

export default function GraphView() {
  const svgRef = useRef(null);
  const dimRef = useRef(() => {});
  const { visibleNodeIds } = useFilters();

  useEffect(() => {
    const container = svgRef.current;
    const W = container.clientWidth || 800;
    const H = container.clientHeight || 600;

    // Clone links so d3.forceLink's source/target-id-to-object mutation stays local
    // to this component and never corrupts the shared `links` array other views read.
    const links = sharedLinks.map(l => ({ ...l }));

    function nc(d) { return d.cat === 'hub' ? d.color : CAT_COLOR[d.cat]; }
    function lc(d) {
      const s = d.source, t = d.target;
      if (s.cat !== 'hub') return CAT_COLOR[s.cat];
      if (t.cat !== 'hub') return CAT_COLOR[t.cat];
      return '#475569';
    }

    const svg = d3.select(container).attr('width', W).attr('height', H);
    svg.selectAll('*').remove();
    const g = svg.append('g');
    const zoom = d3.zoom().scaleExtent([0.08, 5]).on('zoom', ({ transform }) => g.attr('transform', transform));
    svg.call(zoom);

    const coreLinks = g.append('g').selectAll('line').data(links).join('line')
      .attr('stroke-width', 0.9).attr('stroke-opacity', 0.28);

    let dragMoved = false;
    const nodeG = g.append('g').selectAll('g').data(nodes).join('g').attr('class', 'node')
      .call(d3.drag()
        .on('start', (ev, d) => { dragMoved = false; if (!ev.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
        .on('drag', (ev, d) => { dragMoved = true; d.fx = ev.x; d.fy = ev.y; })
        .on('end', (ev, d) => { if (!ev.active) sim.alphaTarget(0); d.fx = null; d.fy = null; }));

    nodeG.append('circle')
      .attr('r', d => d.r || 3)
      .attr('fill', d => nc(d))
      .attr('fill-opacity', d => d.cat === 'hub' ? 0.9 : 0.72)
      .attr('stroke', d => nc(d)).attr('stroke-width', 0.5).attr('stroke-opacity', 0.6);

    nodeG.filter(d => d.label)
      .append('text')
      .attr('dy', d => d.cat === 'hub' ? d.r + 12 : -(d.r + 4))
      .attr('text-anchor', 'middle')
      .attr('font-size', d => d.cat === 'hub' ? '11px' : '8px')
      .attr('font-weight', '700')
      .attr('fill', d => nc(d))
      .style('pointer-events', 'none')
      .text(d => d.label);

    const tip = document.createElement('div');
    tip.className = 'graph-tip';
    tip.style.display = 'none';
    container.parentElement.appendChild(tip);

    nodeG
      .on('mouseover', function (ev, d) {
        tip.innerHTML = `<strong>${d.label || d.id}</strong>${d.sub ? `<br>${d.sub}` : ''}`;
        tip.style.display = 'block';
        tip.style.left = ev.clientX + 14 + 'px';
        tip.style.top = ev.clientY - 40 + 'px';
      })
      .on('mousemove', ev => { tip.style.left = ev.clientX + 14 + 'px'; tip.style.top = ev.clientY - 40 + 'px'; })
      .on('mouseout', () => { tip.style.display = 'none'; })
      .on('click', function (ev, d) { ev.stopPropagation(); if (dragMoved) return; /* focus-panel omitted from initial port, matches List+Deps view instead */ });

    const sim = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(d => {
        const sh = d.source.cat === 'hub', th = d.target.cat === 'hub';
        return (sh && th) ? 135 : (sh || th) ? 68 : 28;
      }).strength(0.35))
      .force('charge', d3.forceManyBody().strength(d => d.cat === 'hub' ? -700 : d.r > 5 ? -90 : -42))
      .force('center', d3.forceCenter(W / 2, H / 2).strength(0.06))
      .force('collide', d3.forceCollide().radius(d => (d.r || 3) + 2.5).strength(0.7))
      .on('tick', () => {
        coreLinks.attr('x1', d => d.source.x).attr('y1', d => d.source.y).attr('x2', d => d.target.x).attr('y2', d => d.target.y).attr('stroke', d => lc(d));
        nodeG.attr('transform', d => `translate(${d.x},${d.y})`);
      });

    dimRef.current = (visibleIds) => {
      nodeG.select('circle').attr('fill-opacity', d => visibleIds.has(d.id) ? (d.cat === 'hub' ? 0.9 : 0.72) : 0.04);
      coreLinks.attr('stroke-opacity', l => (visibleIds.has(l.source.id ?? l.source) && visibleIds.has(l.target.id ?? l.target)) ? 0.28 : 0.02);
    };
    dimRef.current(visibleNodeIds);

    return () => {
      sim.stop();
      tip.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    dimRef.current(visibleNodeIds);
  }, [visibleNodeIds]);

  return (
    <div className="graph-view-wrapper">
      <svg ref={svgRef} className="graph-svg" />
    </div>
  );
}
```

- [ ] **Step 4: Write `src/views/GraphView.css`**

```css
.graph-view-wrapper { position: relative; width: 100%; height: 70vh; }
.graph-svg { width: 100%; height: 100%; }
.graph-tip { position: fixed; background: rgba(2,8,23,0.96); color: #e2e8f0; font-size: 11.5px; padding: 8px 12px; border-radius: 6px; pointer-events: none; max-width: 260px; border: 1px solid #1e293b; z-index: 9999; }
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/views/GraphView.test.jsx`
Expected: PASS. If jsdom throws on `container.clientWidth`/SVG APIs d3 expects, fall back a default of 800×600 (already handled via `|| 800` / `|| 600` in the code above) — this is why those fallbacks exist.

- [ ] **Step 6: Commit**

```bash
git add src/views/GraphView.jsx src/views/GraphView.css src/views/GraphView.test.jsx
git commit -m "feat: port D3 force-directed GraphView with cloned links to avoid shared-data mutation"
```

---

### Task 11: Wire all real views into App, remove stubs, manual verification

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/App.test.jsx`

- [ ] **Step 1: Update `src/App.test.jsx`** to assert on real view content instead of the `data-testid="active-view"` stub hook

```jsx
// src/App.test.jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('App', () => {
  it('renders all 5 view tabs and defaults to Graph', () => {
    render(<App />);
    for (const label of ['Graph', 'Tree', 'List', 'Cards', 'List+Deps']) {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
    }
    expect(document.querySelector('svg.graph-svg')).toBeTruthy();
  });

  it('switching to List shows the sortable table and keeps the filter bar mounted', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: 'List' }));
    expect(screen.getByRole('columnheader', { name: /label/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  it('switching to Cards shows the card grid', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: 'Cards' }));
    expect(screen.getByText('POS Publisher')).toBeInTheDocument();
  });

  it('switching to Tree shows category roots', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: 'Tree' }));
    expect(screen.getByText('Overnight Jobs')).toBeInTheDocument();
  });

  it('switching to List+Deps shows the master/detail layout', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: 'List+Deps' }));
    expect(screen.getByTestId('detail-panel')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/App.test.jsx`
Expected: FAIL — `App.jsx` still renders `StubView` placeholders.

- [ ] **Step 3: Update `src/App.jsx`** to import and render the real views

```jsx
import { useState } from 'react';
import { FilterProvider } from './context/FilterContext';
import FilterBar from './components/FilterBar';
import GraphView from './views/GraphView';
import TreeView from './views/TreeView';
import ListView from './views/ListView';
import CardView from './views/CardView';
import ListWithDepsView from './views/ListWithDepsView';

const VIEWS = [
  { key: 'graph', label: 'Graph', Component: GraphView },
  { key: 'tree', label: 'Tree', Component: TreeView },
  { key: 'list', label: 'List', Component: ListView },
  { key: 'cards', label: 'Cards', Component: CardView },
  { key: 'deps', label: 'List+Deps', Component: ListWithDepsView },
];

export default function App() {
  const [active, setActive] = useState('graph');
  const ActiveComponent = VIEWS.find(v => v.key === active).Component;

  return (
    <FilterProvider>
      <div className="tab-bar">
        {VIEWS.map(v => (
          <button
            key={v.key}
            className={active === v.key ? 'tab active' : 'tab'}
            onClick={() => setActive(v.key)}
          >
            {v.label}
          </button>
        ))}
      </div>
      <FilterBar />
      <div className="view-container">
        <ActiveComponent />
      </div>
    </FilterProvider>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/App.test.jsx`
Expected: PASS, all 5 assertions green.

- [ ] **Step 5: Run the full test suite**

Run: `npm test`
Expected: all test files pass (pidData, FilterContext, FilterBar, App, ListView, CardView, TreeView, ListWithDepsView, GraphView).

- [ ] **Step 6: Manual verification in a real browser**

Use the `run` skill (or `npm run dev`) to launch the app and confirm in a browser:
- All 5 tabs switch correctly and the filter bar persists selections across switches.
- Graph view zooms/pans/drags and shows tooltips on hover.
- Tree view expands categories, re-roots on node click, and "Back to categories" returns to the default view.
- List view sorts by each column.
- Cards view shows connection chips.
- List+Deps shows dependency groups in the right panel on row click.
- Toggling "Named only" off reveals the ~490 filler nodes (by ID only) in List/Cards/Tree; toggling it back on hides them again.
- The hub filter narrows every view to a single hub's neighborhood.

- [ ] **Step 7: Commit**

```bash
git add src/App.jsx src/App.test.jsx
git commit -m "feat: wire all 5 views into App, remove stub placeholders"
```

---

## Done criteria

- `npm test` passes with no failing tests.
- `npm run build` completes without errors.
- Manual verification checklist in Task 11 Step 6 confirmed in an actual browser.
