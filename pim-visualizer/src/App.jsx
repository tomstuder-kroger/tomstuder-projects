import { useState } from 'react';
import { FilterProvider } from './context/FilterContext';
import FilterBar from './components/FilterBar';

const VIEWS = [
  { key: 'graph', label: 'Graph' },
  { key: 'tree', label: 'Tree' },
  { key: 'list', label: 'List' },
  { key: 'cards', label: 'Cards' },
  { key: 'deps', label: 'List+Deps' },
];

function StubView({ name }) {
  return <div data-testid="active-view">{name}</div>;
}

export default function App() {
  const [active, setActive] = useState('graph');

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
        <StubView name={active} />
      </div>
    </FilterProvider>
  );
}
