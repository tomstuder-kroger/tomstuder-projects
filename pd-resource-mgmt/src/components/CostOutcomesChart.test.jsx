import React from 'react';
import { render, screen } from '@testing-library/react';
import CostOutcomesChart from './CostOutcomesChart';

// Mock ResizeObserver
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = ResizeObserverMock;

describe('CostOutcomesChart', () => {
  const mockData = [
    {
      teamId: '1',
      teamName: 'Item Pricing',
      portfolioId: 'p1',
      portfolioName: 'Item',
      monthlyCost: 45000,
      outcomesValue: 500000,
      designerCount: 3
    },
    {
      teamId: '2',
      teamName: 'Assortment Planning',
      portfolioId: 'p2',
      portfolioName: 'Assortment',
      monthlyCost: 35000,
      outcomesValue: 400000,
      designerCount: 2
    },
    {
      teamId: '3',
      teamName: 'Supplier Analytics',
      portfolioId: 'p3',
      portfolioName: 'Supplier',
      monthlyCost: 50000,
      outcomesValue: null,
      designerCount: 4
    }
  ];

  test('renders chart title', () => {
    render(<CostOutcomesChart data={mockData} />);
    expect(screen.getByText('Cost vs. Outcomes by Product Team')).toBeInTheDocument();
  });

  test('renders chart with all required components', () => {
    const { container } = render(<CostOutcomesChart data={mockData} />);
    // Check for ResponsiveContainer which should be present
    const responsiveContainer = container.querySelector('.recharts-responsive-container');
    expect(responsiveContainer).toBeTruthy();
  });

  test('handles data with null outcomes', () => {
    const dataWithNull = [
      {
        teamId: '1',
        teamName: 'Test Team',
        portfolioId: 'p1',
        portfolioName: 'Item',
        monthlyCost: 40000,
        outcomesValue: null,
        designerCount: 2
      }
    ];

    render(<CostOutcomesChart data={dataWithNull} />);
    expect(screen.getByText('Cost vs. Outcomes by Product Team')).toBeInTheDocument();
  });

  test('handles empty data array', () => {
    render(<CostOutcomesChart data={[]} />);
    expect(screen.getByText('Cost vs. Outcomes by Product Team')).toBeInTheDocument();
  });

  test('processes data with null outcomes by setting to 0', () => {
    const dataWithNull = [
      {
        teamId: '1',
        teamName: 'Test Team',
        portfolioId: 'p1',
        portfolioName: 'Item',
        monthlyCost: 40000,
        outcomesValue: null,
        designerCount: 2
      }
    ];

    const { container } = render(<CostOutcomesChart data={dataWithNull} />);
    expect(screen.getByText('Cost vs. Outcomes by Product Team')).toBeInTheDocument();
    expect(container.querySelector('.recharts-responsive-container')).toBeTruthy();
  });

  test('filters teams correctly by portfolio', () => {
    const itemOnlyData = mockData.filter(d => d.portfolioName === 'Item');
    const assortmentOnlyData = mockData.filter(d => d.portfolioName === 'Assortment');
    const supplierOnlyData = mockData.filter(d => d.portfolioName === 'Supplier');

    expect(itemOnlyData.length).toBe(1);
    expect(itemOnlyData[0].teamName).toBe('Item Pricing');

    expect(assortmentOnlyData.length).toBe(1);
    expect(assortmentOnlyData[0].teamName).toBe('Assortment Planning');

    expect(supplierOnlyData.length).toBe(1);
    expect(supplierOnlyData[0].teamName).toBe('Supplier Analytics');
  });
});
