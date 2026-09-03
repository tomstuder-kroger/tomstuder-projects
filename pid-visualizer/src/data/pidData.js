export const CAT_COLOR = { cics: '#38bdf8', mq: '#d946ef', batch: '#4ade80' };
export const CAT_LABEL = { cics: 'Item Setup Screen', mq: 'Live System Feed', batch: 'Overnight Automated Job', hub: 'Shared System' };
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
