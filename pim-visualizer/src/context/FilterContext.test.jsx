import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { FilterProvider, useFilters } from './FilterContext';
import { adjacency } from '../data/pidData';

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
    // Exact expected size: the hub itself + every one of its direct neighbors
    // (namedOnly is off here, so no neighbor is excluded for lacking a label).
    const expectedSize = 1 + adjacency.get('TRNROT').size;
    expect(result.current.visibleNodeIds.size).toBe(expectedSize);
  });

  it('throws if useFilters is used outside a provider', () => {
    expect(() => renderHook(() => useFilters())).toThrow();
  });
});
