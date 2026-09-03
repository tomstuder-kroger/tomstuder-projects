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
            role="button"
            tabIndex={0}
            aria-pressed={n.id === selectedId}
            onClick={() => setSelectedId(n.id)}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedId(n.id); } }}
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
                      <span key={g.id} className="deps-tag">{g.label} ({g.id})</span>
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
