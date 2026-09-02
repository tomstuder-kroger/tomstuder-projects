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
