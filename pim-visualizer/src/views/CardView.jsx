import { useFilters } from '../context/FilterContext';
import { nodes, adjacency, CAT_LABEL } from '../data/pidData';
import './CardView.css';

const nodesById = new Map(nodes.map(n => [n.id, n]));

function groupNeighborsByCategory(nodeId) {
  const neighborIds = adjacency.get(nodeId) ?? new Set();
  const groups = { hub: [], cics: [], mq: [], batch: [] };
  for (const id of neighborIds) {
    const n = nodesById.get(id);
    if (n) groups[n.cat].push(n);
  }
  return groups;
}

export default function CardView() {
  const { visibleNodeIds } = useFilters();
  const visible = nodes.filter(n => visibleNodeIds.has(n.id));

  return (
    <div className="card-grid">
      {visible.map(n => {
        const groups = groupNeighborsByCategory(n.id);
        return (
          <article key={n.id} className="card">
            <span className={`badge badge-${n.cat}`}>{CAT_LABEL[n.cat]}</span>
            <h3>{n.label || n.id} {n.label && <span className="card-id">{n.id}</span>}</h3>
            {n.sub && <p className="card-desc">{n.sub}</p>}
            <div className="card-chips">
              {Object.entries(groups).flatMap(([cat, group]) =>
                group.filter(g => g.label).map(g => (
                  <span key={g.id} className={`chip chip-${cat}`}>{g.label} ({g.id})</span>
                ))
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
