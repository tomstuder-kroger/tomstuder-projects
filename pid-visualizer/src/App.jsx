import { useState } from 'react';
import { FilterProvider } from './context/FilterContext';
import FilterBar from './components/FilterBar';
import GraphView from './views/GraphView';
import TreeView from './views/TreeView';
import ListView from './views/ListView';
import CardView from './views/CardView';
import ListWithDepsView from './views/ListWithDepsView';

const VIEWS = [
  { key: 'graph', label: 'Graph', Component: GraphView },
  { key: 'tree', label: 'Tree', Component: TreeView },
  { key: 'list', label: 'List', Component: ListView },
  { key: 'cards', label: 'Cards', Component: CardView },
  { key: 'deps', label: 'List+Deps', Component: ListWithDepsView },
];

export default function App() {
  const [active, setActive] = useState('graph');
  const ActiveComponent = VIEWS.find(v => v.key === active).Component;

  return (
    <FilterProvider>
      <div className="tab-bar">
        {VIEWS.map(v => (
          <button
            key={v.key}
            className={active === v.key ? 'tab active' : 'tab'}
            aria-selected={active === v.key}
            onClick={() => setActive(v.key)}
          >
            {v.label}
          </button>
        ))}
      </div>
      <FilterBar />
      <div className="view-container">
        <ActiveComponent />
      </div>
    </FilterProvider>
  );
}
