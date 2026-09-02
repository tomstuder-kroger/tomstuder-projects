import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('App', () => {
  it('renders all 5 view tabs and defaults to Graph', () => {
    render(<App />);
    for (const label of ['Graph', 'Tree', 'List', 'Cards', 'List+Deps']) {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
    }
    expect(screen.getByTestId('active-view')).toHaveTextContent('graph');
  });

  it('switching tabs changes the active view and keeps the filter bar mounted', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: 'List' }));
    expect(screen.getByTestId('active-view')).toHaveTextContent('list');
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });
});
