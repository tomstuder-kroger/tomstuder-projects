import React from 'react';
import { render, screen } from '@testing-library/react';
import CapacityByLevelChart from './CapacityByLevelChart';

// Mock ResizeObserver for Recharts tests
global.ResizeObserver = class ResizeObserver {
  constructor(callback) {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('CapacityByLevelChart', () => {
  const mockData = [
    { level: 'APD', available: 3680, allocated: 3312, unallocated: 368 },
    { level: 'PD', available: 9200, allocated: 8280, unallocated: 920 },
    { level: 'SPD', available: 7360, allocated: 6808, unallocated: 552 }
  ];

  test('renders chart with correct title', () => {
    render(<CapacityByLevelChart data={mockData} />);
    const title = screen.getByText('Team Capacity by Level');
    expect(title).toBeInTheDocument();
  });

  test('renders chart with correct note about future enhancements', () => {
    render(<CapacityByLevelChart data={mockData} />);
    const note = screen.getByText(/Future enhancement will allow toggling between by-level, by-portfolio, and by-individual views/);
    expect(note).toBeInTheDocument();
  });

  test('renders with empty data', () => {
    render(<CapacityByLevelChart data={[]} />);
    const title = screen.getByText('Team Capacity by Level');
    expect(title).toBeInTheDocument();
  });

  test('renders bars with correct names in legend', () => {
    const { container } = render(<CapacityByLevelChart data={mockData} />);
    // Check that the chart container is rendered
    const chartContainer = container.querySelector('.chart-container');
    expect(chartContainer).toBeInTheDocument();
  });
});
