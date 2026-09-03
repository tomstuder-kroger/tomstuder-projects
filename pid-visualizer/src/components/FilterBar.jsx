import { useFilters, ALL_CATEGORIES } from '../context/FilterContext';
import { CAT_PLURAL, nodes } from '../data/pidData';

const hubs = nodes.filter(n => n.cat === 'hub');

export default function FilterBar() {
  const { search, setSearch, categories, setCategories, hubFilter, setHubFilter, namedOnly, setNamedOnly } = useFilters();

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
        aria-label="Search name/ID"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      {ALL_CATEGORIES.map(cat => (
        <label key={cat}>
          <input
            type="checkbox"
            checked={categories.has(cat)}
            onChange={() => toggleCategory(cat)}
          />
          {CAT_PLURAL[cat]}
        </label>
      ))}
      <select
        aria-label="Filter by hub"
        value={hubFilter ?? ''}
        onChange={e => setHubFilter(e.target.value || null)}
      >
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
