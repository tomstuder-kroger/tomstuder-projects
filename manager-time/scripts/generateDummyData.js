// Generates demo time-entry data for the Manager Time Logger prototype.
//
// Usage:  node scripts/generateDummyData.js [END_DATE YYYY-MM-DD]
// Output: demo-data/demo-entries.json  (entries + learnedValues, matches exportData() shape)
//         demo-data/demo-entries.csv   (importable via Table View > Import CSV)
//
// 200 logged working days, 8-9 hours each, ending on END_DATE (default: today, rolled back
// to the previous weekday if it falls on a weekend). Seeded, so output is reproducible.

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { APP_CONFIG } from '../src/config/appConfig.js';

const DAYS = 200;
const SEED = 5150;
const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'demo-data');

// ---------------------------------------------------------------------------
// Seeded randomness
// ---------------------------------------------------------------------------

function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(SEED);
const chance = (p) => rand() < p;
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
function weighted(pairs) {
  const total = pairs.reduce((s, [, w]) => s + w, 0);
  let r = rand() * total;
  for (const [value, w] of pairs) {
    if ((r -= w) < 0) return value;
  }
  return pairs[pairs.length - 1][0];
}
function pickN(pool, n) {
  const copy = [...pool];
  const out = [];
  while (out.length < n && copy.length) out.push(copy.splice(Math.floor(rand() * copy.length), 1)[0]);
  return out;
}

// ---------------------------------------------------------------------------
// Dates (UTC arithmetic only, so no timezone drift)
// ---------------------------------------------------------------------------

const parseDate = (s) => new Date(`${s}T00:00:00Z`);
const fmtDate = (d) => d.toISOString().slice(0, 10);
const addDays = (d, n) => new Date(d.getTime() + n * 86400000);
const weekday = (d) => (d.getUTCDay() + 6) % 7; // 0 = Mon ... 4 = Fri
const WEEK0 = parseDate('2025-01-06'); // a Monday, anchor for biweekly cadences
const weekIndex = (d) => Math.floor((d - WEEK0) / (7 * 86400000));

// Company holidays and PTO (no entries logged on these days)
const DAYS_OFF = new Set([
  '2025-11-27', '2025-11-28', '2025-12-24', '2025-12-25', '2025-12-26', '2025-12-29', '2025-12-30',
  '2025-12-31', '2026-01-01', '2026-01-19', '2026-03-16', '2026-03-17', '2026-03-18', '2026-03-19',
  '2026-03-20', '2026-05-25', '2026-07-03', '2026-07-06', '2026-07-07', '2026-07-08', '2026-07-09',
  '2026-07-10', '2026-08-14', '2026-09-07'
]);

function resolveEndDate() {
  if (process.argv[2]) return parseDate(process.argv[2]);
  const now = new Date();
  let d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  while (weekday(d) > 4) d = addDays(d, -1);
  return d;
}

function buildWorkdays(end) {
  const days = [];
  let d = end;
  while (days.length < DAYS) {
    if (weekday(d) <= 4 && !DAYS_OFF.has(fmtDate(d))) days.push(fmtDate(d));
    d = addDays(d, -1);
  }
  return days.reverse();
}

// ---------------------------------------------------------------------------
// Fictional cast and content pools
// ---------------------------------------------------------------------------

const [CAT_FACILITATOR, CAT_ENABLER, CAT_COLLABORATOR, CAT_DOER, CAT_SHRUG] = APP_CONFIG.categories;
const IMPACT_SHRUG = APP_CONFIG.impacts[3];

// slot = weekday (0=Mon) of their weekly 1:1
const REPORTS = [
  { name: 'Priya Nair',    slot: 0, portfolio: 'Assortment', focus: 'assortment planning flows' },
  { name: 'Marcus Webb',   slot: 1, portfolio: 'Supplier',   focus: 'the supplier portal' },
  { name: 'Elena Ruiz',    slot: 1, portfolio: 'Item',       focus: 'item onboarding' },
  { name: 'Dev Patel',     slot: 2, portfolio: 'MSCX',       focus: 'MSCX workflow research' },
  { name: 'Hannah Brooks', slot: 3, portfolio: 'S/I/A',      focus: 'unified navigation' },
  { name: 'Jonas Keller',  slot: 3, portfolio: 'Other',      focus: 'design system components' },
  { name: 'Aisha Rahman',  slot: 4, portfolio: 'KTD',        focus: 'KTD design vision' }
];
const DIRECTOR = 'Olivia Grant';   // biweekly, Wednesdays
const PM_LEAD = 'Sam Ortega';      // weekly, Thursdays

const STANDUP_DOMAINS = { 0: ['Assortment'], 1: ['Supplier', 'KTD'], 2: ['Item'], 3: ['MSCX', 'Item'], 4: ['S/I/A'] };

const INITIATIVES = [
  ['Assortment planning redesign', 'Assortment'],
  ['Supplier portal flows', 'Supplier'],
  ['Item onboarding prototype', 'Item'],
  ['S/I/A unified navigation concept', 'S/I/A'],
  ['MSCX workflow research synthesis', 'MSCX'],
  ['KTD design vision deck', 'KTD']
];
const EVERGREEN_FOCUS = [
  ['Design System governance', 'Other'],
  ['Accessibility audit follow-ups', 'Other'],
  ['OKR drafting', 'Other'],
  ['Design critique prep', 'Other']
];
const LEARNING_TOPICS = [
  'AI-assisted design workflows', 'Leading through change', 'Accessibility certification',
  'Product strategy course', 'Coaching conversations', 'Design ops at scale', 'Data storytelling'
];
const IT_ISSUES = ['VPN reconnect', 'Laptop OS update', 'Figma license request', 'Calendar sync', 'Jira board access', 'Monitor not detected'];

const SUBTYPES = APP_CONFIG.customFieldOptions.subtype;

// ---------------------------------------------------------------------------
// Per-type attribute helpers
// ---------------------------------------------------------------------------

const IMPACT_WEIGHTS = {
  '1on1-meeting':             [['High', 35], ['Medium', 45], ['Low', 15], [IMPACT_SHRUG, 5]],
  'standup':                  [['High', 15], ['Medium', 50], ['Low', 30], [IMPACT_SHRUG, 5]],
  'focus-time':               [['High', 55], ['Medium', 35], ['Low', 8], [IMPACT_SHRUG, 2]],
  'learning-dev':             [['High', 15], ['Medium', 40], ['Low', 40], [IMPACT_SHRUG, 5]],
  'admin-emails':             [['Medium', 30], ['Low', 60], [IMPACT_SHRUG, 10]],
  'admin-planning':           [['High', 35], ['Medium', 50], ['Low', 15]],
  'admin-time-entry':         [['Low', 85], [IMPACT_SHRUG, 15]],
  'manager-responsibilities': [['High', 40], ['Medium', 45], ['Low', 15]],
  'ktd-town-hall':            [['Medium', 40], ['Low', 50], [IMPACT_SHRUG, 10]],
  'side-of-desk':             [['High', 10], ['Medium', 40], ['Low', 35], [IMPACT_SHRUG, 15]],
  'it-support':               [['Low', 90], [IMPACT_SHRUG, 10]]
};

const ROLE_POOLS = {
  '1on1-meeting':   ['Psychological safety', 'Capacity multiplication', 'Delegation', 'Personal Professional Growth', 'Value direction not delivery'],
  'standup':        ['Build bridges not silos', 'Value direction not delivery', 'Delegation'],
  'focus-time':     ['Step back see the horizon', 'Focus: why what not how', 'Delivery of strategy document', 'Standards & docs'],
  'learning-dev':   ['Personal Professional Growth'],
  'admin-emails':   ['Delegation'],
  'admin-planning': ['Step back see the horizon', 'Capacity multiplication', 'Delegation'],
  'ktd-town-hall':  ['Build bridges not silos'],
  'side-of-desk':   ['Build bridges not silos', 'Other']
};
const MANAGER_ROLES = {
  'Team Reviews':           ['Standards & docs', 'Value direction not delivery', 'Focus: why what not how'],
  'Coaching':               ['Capacity multiplication', 'Psychological safety', 'Personal Professional Growth'],
  'Finance & Accounting':   ['Step back see the horizon', 'Delegation'],
  'Performance Management': ['Psychological safety', 'Capacity multiplication', 'Personal Professional Growth'],
  'Hiring/Recruiting':      ['Capacity multiplication', 'Build bridges not silos']
};

function rolesFor(taskType, subtype) {
  if (taskType === 'manager-responsibilities') return pickN(MANAGER_ROLES[subtype], 1 + (chance(0.35) ? 1 : 0));
  const pool = ROLE_POOLS[taskType];
  if (!pool) return [];
  if (taskType === 'admin-emails') return chance(0.15) ? [...pool] : [];
  return pickN(pool, 1 + (chance(0.35) ? 1 : 0));
}

const randomPortfolio = () => weighted([
  ['Other', 30], ['Assortment', 14], ['Supplier', 14], ['Item', 14], ['S/I/A', 10], ['MSCX', 10], ['KTD', 8]
]);
const adminPortfolio = () => (chance(0.8) ? 'Other' : randomPortfolio());

// ---------------------------------------------------------------------------
// Notes
// ---------------------------------------------------------------------------

const NOTES = {
  '1on1-meeting': (c) => pick([
    'Career growth check-in; discussed a stretch goal for next quarter.',
    `Reviewed workload and blockers on ${c.person.focus}.`,
    'Feedback on last design review; agreed to pair with research.',
    'Talked through promotion packet timing and evidence gaps.',
    'Quick sync on priorities; no blockers.',
    'Coaching on stakeholder communication and framing trade-offs.',
    'Discussed team dynamics and how to rebalance requests.'
  ]),
  'standup': (c) => pick([
    `Status across ${c.domain} squads; one engineering dependency flagged.`,
    `Aligned on handoff dates for ${c.domain}.`,
    `Quick pulse on ${c.domain}; design QA backlog is growing.`,
    `${c.domain}: unblocked two open questions on scope.`
  ]),
  'focus-time': (c) => `${c.area}: ${pick([
    'iterated on key flows.', 'drafted the narrative and recommendations.', 'reviewed prototypes with the team.',
    'cleaned up components and annotations.', 'synthesized feedback into next steps.', 'pressure-tested the approach with edge cases.'
  ])}`,
  'learning-dev': (c) => pick([
    `Worked through a module on ${c.topic}.`,
    `${c.topic}: captured notes to share with the team.`,
    `Self-paced study on ${c.topic}.`
  ]),
  'admin-emails': () => pick(['Inbox triage and stakeholder replies.', 'Cleared backlog of approvals.', 'Follow-ups from yesterday\'s reviews.']),
  'admin-planning': (c) => c.okrWeek
    ? 'Quarterly OKR planning: drafted objectives and key results with the leadership group.'
    : pick([
      'Weekly planning: prioritized team asks against capacity.',
      'Reviewed upcoming roadmap milestones and staffing.',
      'Prepped agenda and pre-reads for leadership sync.'
    ]),
  'admin-time-entry': () => 'Weekly time log catch-up.',
  'manager-responsibilities': (c) => pick({
    'Team Reviews': [
      `Reviewed design work for ${c.initiative}; gave written feedback.`,
      'Team design review: aligned on quality bar and next steps.'
    ],
    'Coaching': [
      'Coached a designer on presenting to senior stakeholders.',
      'Pairing session on framing problems before solutions.'
    ],
    'Finance & Accounting': [
      'Budget forecast review and tooling spend.',
      'Reconciled contractor spend against plan.'
    ],
    'Performance Management': [
      'Drafted performance reviews with specific examples.',
      'Calibration prep and rating discussions.'
    ],
    'Hiring/Recruiting': [
      'Interviewed a senior designer candidate.',
      'Reviewed portfolios and ran the panel debrief.'
    ]
  }[c.subtype]),
  'ktd-town-hall': () => 'KTD Town Hall: leadership updates and Q&A.',
  'side-of-desk': (c) => pick([
    `Helped a partner team with a request on ${c.area}.`,
    `Ad hoc support: ${c.area}.`,
    `Short-notice ask on ${c.area}; scoped and handed off.`
  ]),
  'it-support': (c) => `${c.issue}: resolved after a ticket.`
};
const NOTE_PROBABILITY = {
  'admin-emails': 0.15, 'admin-time-entry': 0.1, 'it-support': 0.9, 'ktd-town-hall': 0.9
};

// ---------------------------------------------------------------------------
// Entry assembly
// ---------------------------------------------------------------------------

const taskConfig = Object.fromEntries(APP_CONFIG.taskTypes.map((t) => [t.id, t]));
let seq = 0;

function makeEntry(date, taskType, time, ctx = {}) {
  const cfg = taskConfig[taskType];
  const customFields = {};
  let { category, taskCode } = cfg.autoFill;
  let portfolio = ctx.portfolio ?? adminPortfolio();

  switch (taskType) {
    case '1on1-meeting': customFields.participant = ctx.person?.name ?? ctx.participant; break;
    case 'standup': customFields.domain = ctx.domain; break;
    case 'focus-time':
      customFields.focusArea = ctx.area;
      if (ctx.area === 'OKR drafting') { category = CAT_ENABLER; taskCode = APP_CONFIG.taskCodes[2]; }
      break;
    case 'learning-dev': customFields.topic = ctx.topic; break;
    case 'manager-responsibilities': customFields.subtype = ctx.subtype; break;
    case 'side-of-desk':
      customFields.focusArea = ctx.area;
      category = pick([CAT_DOER, CAT_COLLABORATOR, CAT_SHRUG]);
      break;
    case 'it-support': customFields.issue = ctx.issue; break;
    default: break;
  }

  const noteChance = NOTE_PROBABILITY[taskType] ?? 0.75;
  const notes = chance(noteChance) ? NOTES[taskType](ctx).slice(0, 200) : '';
  const stamp = `${date}T17:30:00.000Z`;

  return {
    id: `demo-${date}-${String(++seq).padStart(4, '0')}`,
    date,
    taskType,
    time,
    category,
    taskCode,
    portfolio,
    impact: weighted(IMPACT_WEIGHTS[taskType]),
    roleExpectations: rolesFor(taskType, ctx.subtype),
    customFields,
    notes,
    createdAt: stamp,
    updatedAt: stamp
  };
}

function buildDay(dateStr) {
  const d = parseDate(dateStr);
  const wd = weekday(d);
  const wk = weekIndex(d);
  const month = d.getUTCMonth();
  const dom = d.getUTCDate();

  // Which initiative the team is leaning on shifts roughly every 6 weeks.
  const activeInitiative = INITIATIVES[Math.floor(wk / 6) % INITIATIVES.length];
  const focusChoices = [
    ...INITIATIVES.map((i) => [i, i === activeInitiative ? 6 : 1]),
    ...EVERGREEN_FOCUS.map((i) => [i, 2])
  ];
  const pickFocus = () => weighted(focusChoices);

  const target = weighted([[8, 35], [8.5, 40], [9, 25]]);
  const items = []; // { priority, build: () => entry, time }
  const add = (priority, taskType, time, ctx) => items.push({ priority, taskType, time, ctx });

  // --- Core rhythm ---------------------------------------------------------
  add(0, 'admin-emails', weighted([[0.25, 10], [0.5, 50], [0.75, 20], [1, 20]]), {});
  if (wd === 4 ? chance(0.4) : chance(0.9)) {
    add(0, 'admin-time-entry', wd === 4 && chance(0.3) ? 0.5 : 0.25, {});
  }

  STANDUP_DOMAINS[wd].forEach((domain) => {
    add(0, 'standup', chance(0.75) ? 0.25 : 0.5, { domain, portfolio: domain });
  });

  REPORTS.filter((r) => r.slot === wd && chance(0.92)).forEach((person) => {
    add(1, '1on1-meeting', weighted([[0.5, 60], [0.75, 25], [1, 15]]), { person, portfolio: person.portfolio });
  });
  if (wd === 2 && wk % 2 === 0) add(1, '1on1-meeting', 0.5, { participant: DIRECTOR, person: { name: DIRECTOR, focus: 'org priorities' }, portfolio: 'Other' });
  if (wd === 3 && chance(0.9)) add(1, '1on1-meeting', 0.5, { participant: PM_LEAD, person: { name: PM_LEAD, focus: 'roadmap alignment' }, portfolio: randomPortfolio() });

  if (wd === 3 && dom <= 7) add(1, 'ktd-town-hall', 1, { portfolio: 'KTD' });

  // --- Planning --------------------------------------------------------------
  const okrWeek = wd === 0 && dom <= 7 && [0, 3, 6, 9].includes(month);
  if (okrWeek) add(2, 'admin-planning', 2, { okrWeek: true, portfolio: 'Other' });
  else if (wd === 0 && chance(0.85)) add(2, 'admin-planning', 1, {});
  else if (wd === 4 && chance(0.6)) add(2, 'admin-planning', weighted([[0.5, 60], [1, 40]]), {});
  else if (chance(0.12)) add(3, 'admin-planning', 0.5, {});

  // --- Manager responsibilities (seasonal weighting) -----------------------------
  const mgrChance = [0.6, 0.6, 0.7, 0.6, 0.5][wd];
  if (chance(mgrChance)) {
    const subtype = weighted([
      ['Team Reviews', 30],
      ['Coaching', 30],
      ['Finance & Accounting', [2, 5, 8, 11].includes(month) ? 30 : 8],
      ['Performance Management', [11, 0, 5, 6].includes(month) ? 40 : 6],
      ['Hiring/Recruiting', [2, 3, 8, 9].includes(month) ? 28 : 10]
    ]);
    add(2, 'manager-responsibilities', weighted([[0.5, 10], [1, 45], [1.5, 30], [2, 15]]), {
      subtype, initiative: activeInitiative[0], portfolio: chance(0.5) ? 'Other' : randomPortfolio()
    });
  }

  // --- Occasional items -----------------------------------------------------------
  if (chance(0.22)) add(3, 'learning-dev', weighted([[0.5, 20], [1, 60], [1.5, 15], [2, 5]]), { topic: pick(LEARNING_TOPICS), portfolio: 'Other' });
  if (chance(0.07)) add(3, 'it-support', weighted([[0.25, 40], [0.5, 45], [1, 15]]), { issue: pick(IT_ISSUES), portfolio: 'Other' });

  // --- Trim lowest-priority items if the fixed load exceeds the target ----------------
  const sum = () => items.reduce((s, i) => s + i.time, 0);
  while (sum() > target) {
    const maxPriority = Math.max(...items.map((i) => i.priority));
    const idx = items.map((i) => i.priority).lastIndexOf(maxPriority);
    items.splice(idx, 1);
  }

  // --- Fill the remainder with side-of-desk work and focus time ---------------------------
  // Focus time is capped per day; the rest goes to the varied "other" work a manager actually gets pulled into.
  const round = (n) => Math.round(n * 4) / 4;
  let remaining = round(target - sum());
  let focusLeft = Math.min(remaining, weighted([[0, 8], [1, 17], [2, 35], [3, 28], [4, 12]]));

  while (remaining - focusLeft > 0.001) {
    const pool = remaining - focusLeft;
    const kind = weighted([['manager-responsibilities', 35], ['side-of-desk', 30], ['admin-planning', 20], ['learning-dev', 15]]);
    const t = Math.min(pool, weighted([[0.5, 25], [1, 45], [1.5, 20], [2, 10]]));
    if (kind === 'manager-responsibilities') {
      const subtype = pick(SUBTYPES);
      add(4, kind, t, { subtype, initiative: activeInitiative[0], portfolio: randomPortfolio() });
    } else if (kind === 'side-of-desk') {
      const [area, portfolio] = pickFocus();
      add(4, kind, t, { area, portfolio });
    } else if (kind === 'learning-dev') {
      add(4, kind, t, { topic: pick(LEARNING_TOPICS), portfolio: 'Other' });
    } else {
      add(4, kind, t, {});
    }
    remaining = round(remaining - t);
  }
  while (focusLeft > 0.001) {
    const sizes = [[1, 3], [1.5, 3], [2, 4], [2.5, 2], [3, 1]].filter(([s]) => s <= focusLeft);
    const t = sizes.length ? weighted(sizes) : focusLeft;
    const [area, portfolio] = pickFocus();
    add(4, 'focus-time', t, { area, portfolio });
    focusLeft = round(focusLeft - t);
  }

  return items.map((i) => makeEntry(dateStr, i.taskType, i.time, i.ctx));
}

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------

function learnedValuesFrom(entriesAsc) {
  // Mirrors learnValue(): most recent first, distinct, capped at 10.
  const learned = {};
  entriesAsc.forEach((e) => {
    Object.entries(e.customFields).forEach(([field, value]) => {
      if (!value) return;
      learned[field] = [value, ...(learned[field] || []).filter((v) => v !== value)].slice(0, 10);
    });
  });
  return learned;
}

const CSV_CUSTOM_COLUMNS = ['participant', 'domain', 'focusArea', 'topic', 'subtype', 'issue'];
const csvCell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;

function toCSV(entries) {
  const headers = ['Date', 'Task Type', 'Time (hours)', 'Category', 'Task Code', 'Portfolio', 'Impact',
    'Role Expectations', ...CSV_CUSTOM_COLUMNS, 'Notes'];
  const rows = entries.map((e) => [
    e.date, taskConfig[e.taskType].label, e.time, e.category, e.taskCode, e.portfolio, e.impact,
    e.roleExpectations.join('; '), ...CSV_CUSTOM_COLUMNS.map((c) => e.customFields[c] ?? ''), e.notes
  ]);
  return [headers.map(csvCell).join(','), ...rows.map((r) => r.map(csvCell).join(','))].join('\n') + '\n';
}

const workdays = buildWorkdays(resolveEndDate());
const entriesAsc = workdays.flatMap(buildDay);
const entries = [...entriesAsc].reverse(); // newest first, like the app stores them after import

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(join(OUT_DIR, 'demo-entries.json'), JSON.stringify({
  entries,
  config: null,
  learnedValues: learnedValuesFrom(entriesAsc),
  exportedAt: new Date().toISOString()
}, null, 2));
writeFileSync(join(OUT_DIR, 'demo-entries.csv'), toCSV(entries));

console.log(`Wrote ${entries.length} entries across ${workdays.length} days (${workdays[0]} to ${workdays.at(-1)}) to ${OUT_DIR}`);
