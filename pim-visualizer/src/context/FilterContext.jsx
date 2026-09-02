import { createContext, useContext, useMemo, useState } from 'react';
import { nodes, adjacency } from '../data/pidData';

export const ALL_CATEGORIES = ['cics', 'mq', 'batch', 'hub'];

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

  const value = useMemo(() => ({
    search, setSearch,
    categories, setCategories,
    hubFilter, setHubFilter,
    namedOnly, setNamedOnly,
    visibleNodeIds,
  }), [search, categories, hubFilter, namedOnly, visibleNodeIds]);

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}

export function useFilters() {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error('useFilters must be used within a FilterProvider');
  return ctx;
}
