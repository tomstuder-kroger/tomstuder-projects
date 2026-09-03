import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterProvider } from '../context/FilterContext';
import ListWithDepsView from './ListWithDepsView';

describe('ListWithDepsView', () => {
  it('shows an empty-state prompt in the detail panel before selection', () => {
    render(<FilterProvider><ListWithDepsView /></FilterProvider>);
    expect(screen.getByTestId('detail-panel')).toHaveTextContent(/select a/i);
  });

  it('selecting a row shows its dependencies grouped by category in the detail panel', async () => {
    render(<FilterProvider><ListWithDepsView /></FilterProvider>);
    await userEvent.click(screen.getByText('POS Publisher'));
    const panel = screen.getByTestId('detail-panel');
    expect(panel).toHaveTextContent('POS Publisher');
    expect(panel).toHaveTextContent(/shared systems/i);
  });
});
