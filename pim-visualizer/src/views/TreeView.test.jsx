import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterProvider } from '../context/FilterContext';
import TreeView from './TreeView';

describe('TreeView', () => {
  it('renders 4 category root nodes by default', () => {
    render(<FilterProvider><TreeView /></FilterProvider>);
    for (const label of ['Item Setup Screens', 'Live System Feeds', 'Overnight Jobs', 'Shared Systems']) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it('expanding a category reveals its labeled nodes', async () => {
    render(<FilterProvider><TreeView /></FilterProvider>);
    await userEvent.click(screen.getByText('Overnight Jobs'));
    expect(screen.getByText('POS Publisher')).toBeInTheDocument();
  });

  it('clicking a node re-roots the tree at that node and shows a back control', async () => {
    render(<FilterProvider><TreeView /></FilterProvider>);
    await userEvent.click(screen.getByText('Overnight Jobs'));
    await userEvent.click(screen.getByText('POS Publisher'));
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
    expect(screen.getByTestId('tree-root-label')).toHaveTextContent('POS Publisher');
  });

  it('does not infinitely recurse when re-rooted into a cycle', async () => {
    render(<FilterProvider><TreeView /></FilterProvider>);
    await userEvent.click(screen.getByText('Overnight Jobs'));
    await userEvent.click(screen.getByText('POS Publisher'));
    // PID4102 (POS Publisher) <-> PID6011 (Vendor Loader) is a direct cycle in the dataset.
    // Rendering must terminate; presence of the child confirms no crash/hang.
    expect(screen.getByText('Vendor Loader')).toBeInTheDocument();
  });
});
