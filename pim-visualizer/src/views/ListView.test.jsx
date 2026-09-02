import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterProvider, useFilters } from '../context/FilterContext';
import ListView from './ListView';

function Controlled({ children }) {
  return <FilterProvider>{children}</FilterProvider>;
}

describe('ListView', () => {
  it('renders one row per visible node (42 with default namedOnly)', () => {
    render(<Controlled><ListView /></Controlled>);
    const rows = screen.getAllByRole('row'); // includes header row
    expect(rows.length).toBe(1 + 42);
  });

  it('shows total-degree connection count unaffected by category filter', async () => {
    function Harness() {
      const { setCategories } = useFilters();
      return (
        <>
          <button onClick={() => setCategories(new Set(['batch']))}>Batch only</button>
          <ListView />
        </>
      );
    }
    render(<Controlled><Harness /></Controlled>);
    const posRow = screen.getByText('POS Publisher').closest('tr');
    const before = posRow.querySelector('[data-col="connections"]').textContent;
    // POS Publisher (PID4102) is itself 'batch', so narrowing to 'batch' keeps its row
    // visible but must not change ITS connection count, which counts ALL its neighbors
    // (including non-batch ones like POS_KMA/hub) regardless of the active category filter.
    await userEvent.click(screen.getByRole('button', { name: 'Batch only' }));
    const posRowAfter = screen.getByText('POS Publisher').closest('tr');
    expect(posRowAfter.querySelector('[data-col="connections"]').textContent).toBe(before);
  });

  it('sorting by column reorders rows', async () => {
    render(<Controlled><ListView /></Controlled>);
    await userEvent.click(screen.getByRole('columnheader', { name: /label/i }));
    const labels = screen.getAllByTestId('row-label').map(el => el.textContent);
    const sorted = [...labels].sort((a, b) => a.localeCompare(b));
    expect(labels).toEqual(sorted);
  });
});
