import { useMemo, useState } from 'react';
import { useFilters } from '../context/FilterContext';
import { nodes, adjacency, CAT_PLURAL } from '../data/pidData';
import './TreeView.css';

const nodesById = new Map(nodes.map(n => [n.id, n]));
const CATEGORY_ORDER = ['cics', 'mq', 'batch', 'hub'];
const MAX_DEPTH = 4;

function TreeNode({ nodeId, visibleNodeIds, path, onSelect, initiallyExpanded = false }) {
  const [expanded, setExpanded] = useState(initiallyExpanded);
  const node = nodesById.get(nodeId);
  const children = [...(adjacency.get(nodeId) ?? [])]
    .filter(id => visibleNodeIds.has(id) && !path.has(id));
  const canExpand = children.length > 0 && path.size < MAX_DEPTH;

  if (!node) return null;

  return (
    <li>
      <span
        className="tree-label"
        role="button"
        tabIndex={0}
        aria-expanded={children.length > 0 ? expanded : undefined}
        onClick={() => setExpanded(e => !e)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpanded(x => !x); } }}
      >
        {canExpand ? (expanded ? '▾ ' : '▸ ') : '• '}
        <button className="tree-node-link" onClick={ev => { ev.stopPropagation(); onSelect(nodeId); }}>
          {node.label || node.id}
        </button>
      </span>
      {expanded && canExpand && (
        <ul>
          {children.map(childId => (
            <TreeNode
              key={childId}
              nodeId={childId}
              visibleNodeIds={visibleNodeIds}
              path={new Set([...path, nodeId])}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function TreeView() {
  const { visibleNodeIds } = useFilters();
  const [root, setRoot] = useState(null); // null = category-rooted default view

  const byCategory = useMemo(() => {
    const groups = { cics: [], mq: [], batch: [], hub: [] };
    for (const n of nodes) {
      if (visibleNodeIds.has(n.id)) groups[n.cat].push(n.id);
    }
    return groups;
  }, [visibleNodeIds]);

  if (root) {
    return (
      <div className="tree-view">
        <button onClick={() => setRoot(null)}>← Back to categories</button>
        <div data-testid="tree-root-label" className="tree-root-label">
          {nodesById.get(root)?.label || root}
        </div>
        <ul>
          <TreeNode
            key={root}
            nodeId={root}
            visibleNodeIds={visibleNodeIds}
            path={new Set()}
            onSelect={setRoot}
            initiallyExpanded
          />
        </ul>
      </div>
    );
  }

  return (
    <div className="tree-view">
      <ul>
        {CATEGORY_ORDER.map(cat => (
          <CategoryBranch
            key={cat}
            cat={cat}
            ids={byCategory[cat]}
            visibleNodeIds={visibleNodeIds}
            onSelect={setRoot}
          />
        ))}
      </ul>
    </div>
  );
}

function CategoryBranch({ cat, ids, visibleNodeIds, onSelect }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <li>
      <span
        className="tree-label"
        role="button"
        tabIndex={0}
        aria-expanded={ids.length > 0 ? expanded : undefined}
        onClick={() => setExpanded(e => !e)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpanded(x => !x); } }}
      >
        <span aria-hidden="true">{expanded ? '▾' : '▸'}</span>{' '}
        <span>{CAT_PLURAL[cat]}</span>{' '}
        <span className="tree-count">({ids.length})</span>
      </span>
      {expanded && (
        <ul>
          {ids.map(id => (
            <TreeNode
              key={id}
              nodeId={id}
              visibleNodeIds={visibleNodeIds}
              path={new Set()}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
