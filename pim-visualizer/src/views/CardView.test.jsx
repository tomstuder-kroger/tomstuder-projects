import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FilterProvider } from '../context/FilterContext';
import CardView from './CardView';

describe('CardView', () => {
  it('renders one card per visible node with description and connection chips', () => {
    render(<FilterProvider><CardView /></FilterProvider>);
    const card = screen.getByText('POS Publisher').closest('.card');
    expect(card).toHaveTextContent('PID4102');
    expect(card).toHaveTextContent(/publishes all daily item changes/i);
    expect(card.querySelectorAll('.chip').length).toBeGreaterThan(0);
  });

  it('renders 42 cards by default (namedOnly=true)', () => {
    render(<FilterProvider><CardView /></FilterProvider>);
    expect(screen.getAllByRole('article').length).toBe(42);
  });
});
