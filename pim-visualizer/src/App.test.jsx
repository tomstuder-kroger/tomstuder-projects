import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('App', () => {
  it('renders all 5 view tabs and defaults to Graph', () => {
    render(<App />);
    for (const label of ['Graph', 'Tree', 'List', 'Cards', 'List+Deps']) {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
    }
    expect(document.querySelector('svg.graph-svg')).toBeTruthy();
  });

  it('switching to List shows the sortable table and keeps the filter bar mounted', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: 'List' }));
    expect(screen.getByRole('columnheader', { name: /label/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  it('switching to Cards shows the card grid', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: 'Cards' }));
    expect(screen.getByText('POS Publisher')).toBeInTheDocument();
  });

  it('switching to Tree shows category roots', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: 'Tree' }));
    // Scoped to the tree container: FilterBar also renders a "Overnight Jobs"
    // category-filter checkbox label, so an unscoped query is ambiguous.
    const treeView = document.querySelector('.tree-view');
    expect(within(treeView).getByText('Overnight Jobs')).toBeInTheDocument();
  });

  it('switching to List+Deps shows the master/detail layout', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: 'List+Deps' }));
    expect(screen.getByTestId('detail-panel')).toBeInTheDocument();
  });
});
