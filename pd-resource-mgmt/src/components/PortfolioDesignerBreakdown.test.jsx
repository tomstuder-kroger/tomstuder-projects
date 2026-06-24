import React from 'react';
import { render, screen } from '@testing-library/react';
import PortfolioDesignerBreakdown from './PortfolioDesignerBreakdown';

describe('PortfolioDesignerBreakdown', () => {
  const mockDataByPortfolio = {
    'Item': {
      designers: [
        {
          id: 'd1',
          name: 'Alice Chen',
          level: 'SPD',
          monthlyRunRate: 22500,
          utilization: 95,
          allocationsWithTeamNames: [
            { teamId: 't1', teamName: 'Item Pricing', allocationPercent: 60 },
            { teamId: 't2', teamName: 'Item Analytics', allocationPercent: 35 }
          ]
        }
      ],
      totalCost: 22500,
      avgUtilization: 95,
      roi: 148.5
    },
    'Assortment': {
      designers: [
        {
          id: 'd2',
          name: 'Bob Smith',
          level: 'PD',
          monthlyRunRate: 18000,
          utilization: 80,
          allocationsWithTeamNames: [
            { teamId: 't3', teamName: 'Assortment Planning', allocationPercent: 80 }
          ]
        }
      ],
      totalCost: 18000,
      avgUtilization: 80,
      roi: null
    }
  };

  test('renders title', () => {
    render(<PortfolioDesignerBreakdown groupBy="portfolio" data={mockDataByPortfolio} title="Designer Breakdown" />);
    expect(screen.getByText('Designer Breakdown')).toBeInTheDocument();
  });
});
