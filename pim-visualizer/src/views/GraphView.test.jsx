import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { FilterProvider } from '../context/FilterContext';
import { links } from '../data/pidData';
import GraphView from './GraphView';

describe('GraphView', () => {
  it('renders an svg with 535 node groups and does not mutate the shared links array', () => {
    const originalLinksSnapshot = links.map(l => ({ ...l }));
    render(<FilterProvider><GraphView /></FilterProvider>);
    expect(document.querySelector('svg')).toBeTruthy();
    expect(document.querySelectorAll('.node').length).toBe(535);
    links.forEach((l, i) => {
      expect(typeof l.source).toBe('string');
      expect(typeof l.target).toBe('string');
      expect(l.source).toBe(originalLinksSnapshot[i].source);
      expect(l.target).toBe(originalLinksSnapshot[i].target);
    });
  });
});
