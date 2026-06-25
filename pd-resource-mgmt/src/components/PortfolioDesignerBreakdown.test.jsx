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

  test('renders sections for each group', () => {
    render(<PortfolioDesignerBreakdown groupBy="portfolio" data={mockDataByPortfolio} title="Designer Breakdown" />);

    expect(screen.getByText(/Item Portfolio/)).toBeInTheDocument();
    expect(screen.getByText(/Assortment Portfolio/)).toBeInTheDocument();
  });

  test('displays group stats in header', () => {
    render(<PortfolioDesignerBreakdown groupBy="portfolio" data={mockDataByPortfolio} title="Designer Breakdown" />);

    // Check for ROI values and N/A
    expect(screen.getByText(/148.5%/)).toBeInTheDocument();
    expect(screen.getByText(/N\/A/)).toBeInTheDocument();
    // Also check utilization and costs appear
    expect(screen.getAllByText(/95%/)).toHaveLength(2); // Header and designer card
    expect(screen.getByText(/\$22.5k/)).toBeInTheDocument(); // Header uses abbreviated format
    expect(screen.getByText(/\$22,500\/mo/)).toBeInTheDocument(); // Designer card uses full format
  });

  test('displays designer cards with details', () => {
    render(<PortfolioDesignerBreakdown groupBy="portfolio" data={mockDataByPortfolio} title="Designer Breakdown" />);

    expect(screen.getByText('Alice Chen')).toBeInTheDocument();
    expect(screen.getByText('Bob Smith')).toBeInTheDocument();
    expect(screen.getByText('SPD')).toBeInTheDocument();
    expect(screen.getByText('PD')).toBeInTheDocument();
    // Designer cards show their own monthly rates in full format
    expect(screen.getByText(/\$22,500\/mo/)).toBeInTheDocument();
    expect(screen.getByText(/\$18,000\/mo/)).toBeInTheDocument();
  });

  test('displays allocation badges', () => {
    render(<PortfolioDesignerBreakdown groupBy="portfolio" data={mockDataByPortfolio} title="Designer Breakdown" />);

    expect(screen.getByText(/Item Pricing.*60%/)).toBeInTheDocument();
    expect(screen.getByText(/Item Analytics.*35%/)).toBeInTheDocument();
    expect(screen.getByText(/Assortment Planning.*80%/)).toBeInTheDocument();
  });
});
