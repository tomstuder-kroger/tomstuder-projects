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
      allocations: [{ teamId: 't1', allocationPercent: 60 }]
    },
    {
      id: 'd2',
      name: 'Bob Smith',
      level: 'PD',
      allocations: [{ teamId: 't2', allocationPercent: 80 }]
    }
  ];

  const mockOutcomes = {
    't1': 500000,
    't2': null
  };

  const mockCapacitySettings = {
    hoursPerWeek: 40,
    weeksPerMonth: 4,
    apd: { monthlyRate: 15000 },
    pd: { monthlyRate: 18000 },
    spd: { monthlyRate: 22500 }
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
});
