import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterProvider, useFilters } from '../context/FilterContext';
import FilterBar from './FilterBar';

function Probe() {
  const { search, namedOnly } = useFilters();
  return <div data-testid="probe">{search}|{String(namedOnly)}</div>;
}

function setup() {
  return render(
    <FilterProvider>
      <FilterBar />
      <Probe />
    </FilterProvider>
  );
}

describe('FilterBar', () => {
  it('renders a search input, category checkboxes, hub select, and named-only toggle', () => {
    setup();
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/named only/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/item setup/i)).toBeInTheDocument();
  });

  it('typing in search updates FilterContext', async () => {
    setup();
    await userEvent.type(screen.getByPlaceholderText(/search/i), 'publisher');
    expect(screen.getByTestId('probe')).toHaveTextContent('publisher|true');
  });

  it('unchecking named-only updates FilterContext', async () => {
    setup();
    await userEvent.click(screen.getByLabelText(/named only/i));
    expect(screen.getByTestId('probe')).toHaveTextContent('|false');
  });
});
