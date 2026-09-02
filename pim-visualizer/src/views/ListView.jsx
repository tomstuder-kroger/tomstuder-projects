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
