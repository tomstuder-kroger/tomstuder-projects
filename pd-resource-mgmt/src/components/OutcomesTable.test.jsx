import React from 'react';
import { render, screen } from '@testing-library/react';
import OutcomesTable from './OutcomesTable';

describe('OutcomesTable', () => {
  const mockProductTeams = [
    {
      id: 't1',
      teamName: 'Item Pricing',
      portfolioId: 'p1',
      allocations: [
        { designerId: 'd1', allocationPercent: 60 }
      ]
    },
    {
      id: 't2',
      teamName: 'Assortment Planning',
      portfolioId: 'p2',
      allocations: [
        { designerId: 'd2', allocationPercent: 80 }
      ]
    }
  ];

  const mockPortfolios = [
    { id: 'p1', portfolioName: 'Item' },
    { id: 'p2', portfolioName: 'Assortment' }
  ];

  const mockDesigners = [
    {
      id: 'd1',
      name: 'Alice Chen',
      level: 'SPD',
      allocations: [{ productTeamId: 't1', percentage: 60 }]
    },
    {
      id: 'd2',
      name: 'Bob Smith',
      level: 'PD',
      allocations: [{ productTeamId: 't2', percentage: 80 }]
    }
  ];

  const mockOutcomes = {
    't1': 500000,
    't2': null
  };

  const mockCapacitySettings = {
    standardHoursPerWeek: 40,
    weeksPerYear: 52,
    ptoHoursPerYear: 120,
    holidaysHoursPerYear: 80,
    ldHoursPerYear: 24,
    okrPlanningHoursPerYear: 16,
    ratesByLevel: {
      APD: { actual: 100, blended: 125 },
      PD: { actual: 120, blended: 150 },
      SPD: { actual: 150, blended: 180 }
    }
  };

  const mockUpdateOutcome = jest.fn();

  test('renders table headers', () => {
    render(
      <OutcomesTable
        productTeams={mockProductTeams}
        portfolios={mockPortfolios}
        designers={mockDesigners}
        outcomes={mockOutcomes}
        capacitySettings={mockCapacitySettings}
        onUpdateOutcome={mockUpdateOutcome}
      />
    );

    expect(screen.getByText('Product Team')).toBeInTheDocument();
    expect(screen.getByText('Portfolio')).toBeInTheDocument();
    expect(screen.getByText('Monthly Design Cost')).toBeInTheDocument();
    expect(screen.getByText('Outcomes Value')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  test('renders team rows with data', () => {
    render(
      <OutcomesTable
        productTeams={mockProductTeams}
        portfolios={mockPortfolios}
        designers={mockDesigners}
        outcomes={mockOutcomes}
        capacitySettings={mockCapacitySettings}
        onUpdateOutcome={mockUpdateOutcome}
      />
    );

    expect(screen.getByText('Item Pricing')).toBeInTheDocument();
    expect(screen.getByText('Assortment Planning')).toBeInTheDocument();
    expect(screen.getByText('Item')).toBeInTheDocument();
    expect(screen.getByText('Assortment')).toBeInTheDocument();
  });

  test('displays monthly costs', () => {
    render(
      <OutcomesTable
        productTeams={mockProductTeams}
        portfolios={mockPortfolios}
        designers={mockDesigners}
        outcomes={mockOutcomes}
        capacitySettings={mockCapacitySettings}
        onUpdateOutcome={mockUpdateOutcome}
      />
    );

    // Should calculate costs based on allocations
    // Available hours: (40 * 52) - 120 - 80 - 24 - 16 = 1840
    // t1: SPD (180 blended) * 1840 * 60% / 12 = 16,560
    // t2: PD (150 blended) * 1840 * 80% / 12 = 18,400
    expect(screen.getByText('$16,560')).toBeInTheDocument();
    expect(screen.getByText('$18,400')).toBeInTheDocument();
  });
});
