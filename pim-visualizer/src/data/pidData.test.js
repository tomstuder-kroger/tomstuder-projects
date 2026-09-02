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
