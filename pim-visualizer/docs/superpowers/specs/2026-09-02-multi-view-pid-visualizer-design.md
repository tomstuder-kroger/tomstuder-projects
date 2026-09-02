# Multi-View PID Visualizer — Design

## Background

`references/PID_Network_Graph_v3.html` is a standalone D3 force-directed graph prototype visualizing Kroger's PID (Product Item Database) system landscape: ~40 curated/named processes and shared systems, plus ~490 procedurally-generated filler nodes, wired together with a hardcoded edge list. It supports zoom/pan, hover tooltips, click-to-focus (dim everything except a node's direct neighbors), and category highlight buttons.

This spec covers rebuilding it as a React app with the same underlying data, but adding four additional ways to view/filter it: Tree/Hierarchy, List, Product Cards, and List-with-dependency-sub-listings — alongside the original Network Graph, all sharing one filter bar.

## Goals

- Serve both a technical audience (look up a specific process, see dependencies, assess blast radius) and a stakeholder-narrative audience (high-level scale/risk story), via view toggling.
- Let users toggle between 5 views: Graph, Tree, List, Cards, List+Deps.
- Shared filtering across all views: text search (name/ID), category filter, connects-to-hub filter, named-only toggle.
- Preserve the existing Graph view's interactions unchanged, integrated into the new shared chrome.

## Non-goals

- No backend/API — data remains static, extracted from the reference HTML into a JS data module.
- No editing or persistence of data — this is a read-only exploration prototype.
- No additional views beyond the 5 listed.
- No change to the underlying dataset's fidelity (the ~490 filler nodes remain synthetic, as in the reference).

## Tech stack

React + Vite. No backend. Existing D3 dependency carried over for the Graph view only; other views are plain React/CSS (tables, nested lists, card grids) — no additional charting library needed.

## Data layer

`src/data/pidData.js` — ports the reference file's `HUBS`, `KEY`, and generated-filler node arrays, plus the `e(a,b)` edge-building logic, into plain exported data structures:

```js
export const nodes = [...]       // hubs + key + generated filler, unchanged shape: {id, cat, label?, sub?, color?, r}
export const links = [...]       // {source, target} id pairs
export const adjacency = new Map() // id -> Set<id>, built once at module load
```

This is a direct, faithful port — same IDs, same generation loops (`PIDB001..040`, `PBAT0001..0366`, etc.), same edge rules. It's deterministic (no `Math.random()`/`Date.now()` in the original), so computing `adjacency` once at import time is safe and cheap.

Category and hub metadata (`CAT_COLOR`, `CAT_LABEL`, `CAT_PLURAL`) also move into this module for reuse across all views.

**Mutation hazard:** `d3.forceLink(links)` mutates its input array in place, replacing each link's `source`/`target` string ids with references to the actual node objects (the reference file relies on this for `buildAdj()`). Since `links` here is a shared, module-level array read by all 5 views, GraphView must pass `d3.forceLink()` a **shallow clone** of `links` (`links.map(l => ({...l}))`) rather than the shared array, so its ids-to-objects mutation stays local to Graph and never corrupts what List/Tree/Cards read. Every non-Graph view must derive connection info exclusively from the `adjacency` Map — never by reading `.source`/`.target` off shared `links` objects directly.

## Shared filter state

`src/context/FilterContext.jsx` provides:

- `search` (string) — matches against `id` and `label`, case-insensitive substring
- `categories` (Set of `cics`/`mq`/`batch`/`hub`, all selected by default)
- `hubFilter` (nullable hub id) — when set, show only nodes directly connected to that hub (via `adjacency`)
- `namedOnly` (boolean, **defaults to `true`** in every view, including Graph) — when true, restricts to the ~40 nodes that have a `label`

Exposes a derived `visibleNodeIds: Set<string>` (memoized on filter state) that every view reads. Filters persist across view switches (lifted to `App.jsx`, not per-view local state).

## Layout

Top tab bar for view selection, filter row directly beneath it, content area below (validated as Option A during brainstorming — chosen over a left-sidebar layout and a collapsible-drawer layout).

```
┌─────────────────────────────────────────────┐
│ Graph | Tree | List | Cards | List+Deps      │
│ [search____] [Category▾] [Hub▾] [Named only] │
├─────────────────────────────────────────────┤
│                                               │
│              <active view>                   │
│                                               │
└─────────────────────────────────────────────┘
```

## Views

### Graph (`views/GraphView.jsx`)

Ported as-is from the reference file: force simulation, zoom/pan, hover tooltips, click-to-focus panel, category highlight. Reads `nodes`/`links`/`adjacency` from the shared data module instead of local consts. Filtering integrates by **dimming** non-matching nodes/links (opacity, same treatment the reference already uses for its own category-highlight feature) rather than removing them from the simulation — removing nodes mid-simulation would require re-running layout and is unnecessary churn for a filter.

### Tree (`views/TreeView.jsx`)

Category-rooted expandable tree as the default landing structure: top level = 4 categories (Item Setup Screens, Live Feeds, Overnight Jobs, Shared Systems), expanding a category lists its nodes (respecting current filters).

Clicking any node re-roots the tree at that node: the view switches to rendering that node as the root, with its direct neighbors (from `adjacency`) as children, expandable outward level by level. A "back to categories" control returns to the default rooted view. This combines the category-rooted structure with a pick-a-root explorer, per brainstorming discussion — chosen over a pure hub-rooted tree (rejected: heavily skewed, 249 of 527 nodes sit under one hub) and a pure blank-root explorer (rejected: no populated default landing state).

**Cycle handling:** the underlying graph has cycles (chained `PIDT` nodes, nodes with multiple hub connections), so outward expansion must track a visited-set of node ids per branch and skip re-adding any id already present on the path from the root to the current node, rather than letting it reappear as its own descendant. A node reachable via multiple paths may still appear in multiple branches (that's expected/informative) — the visited-set only prevents a node from being its own ancestor.

### List (`views/ListView.jsx`)

Flat, sortable table: ID, Label, Category, Connection count. Sortable by any column. Respects shared filters (i.e. filtered-out rows are excluded, not just visually deemphasized). "Connection count" is the node's total degree from the full `adjacency` Map (unaffected by current filters — it always reflects the complete dataset, not just currently-visible neighbors), so it doesn't change as the user filters. No sub-listing/expansion — that's the dedicated List+Deps view's job.

### List with dependency sub-listings (`views/ListWithDepsView.jsx`)

Master/detail split panel (validated as Option B during brainstorming, chosen over expandable-accordion-rows and always-expanded-nested-list): flat sortable list on the left (same columns as List view), and a fixed detail panel on the right showing the selected row's full dependency breakdown, grouped by category — reusing the reference app's focus-panel grouping logic (`bycat` grouping into hub/cics/mq/batch buckets). No selection = empty-state prompt in the detail panel.

### Product Cards (`views/CardView.jsx`)

Rich cards (validated as Option C during brainstorming, chosen over compact and standard densities): each card shows a category badge, name + ID, one-line description (from the existing `sub` field), and inline connection chips grouped by category (reusing the same `bycat` grouping as List+Deps). Grid layout, wraps responsively. Cards for unnamed filler nodes (when "named only" is off) show ID and category badge only, no description/chips section (no `sub` text exists to show).

## Named-only default and filler nodes

The ~490 generated filler nodes (`PIDB001..040`, `PBAT0001..0366`, etc.) have no `label` or `sub`. The `namedOnly` filter **defaults to `true`** globally (one shared setting, not per-view), so every view — including Graph — lands showing only the ~40 curated/described nodes on first load. This is a change from the reference file's own default (which shows all 527 unfiltered), made deliberately so first-load behavior is consistent and readable across all 5 views rather than Graph being a special case. Graph applies this the same way it applies every other filter: dimming non-matching nodes/links rather than removing them from the simulation. Toggling "Named only" off in the filter bar reveals filler nodes everywhere, labeled by ID only.

## Testing

- Unit tests for `pidData.js` (node/edge counts match expected totals: 535 nodes, correct per-category counts) and `FilterContext` derivation logic (search, category, hub, named-only, and combinations).
- Component tests for each view's filter-respecting render (e.g., List view row count changes correctly under each filter).
- No visual/e2e testing framework introduced for this round — manual verification via `run` skill/dev server is sufficient for a prototype.

## Open items for implementation planning

- Exact table/card responsive breakpoints — left to implementation, not a design concern.
- Whether Tree view's "back to categories" is a button or breadcrumb trail — small UI detail, left to implementation.
