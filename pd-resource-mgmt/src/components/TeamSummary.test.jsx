import React from 'react';
import { render, screen } from '@testing-library/react';
import TeamSummary from './TeamSummary';
import { ResourceProvider } from '../context/ResourceContext';

describe('TeamSummary', () => {
  test('renders all major sections', () => {
    render(
      <ResourceProvider>
        <TeamSummary />
      </ResourceProvider>
    );

    // Check for metric cards
    expect(screen.getByText(/Monthly Run Rate/i)).toBeInTheDocument();

    // Check for charts
    expect(screen.getByText(/Team Capacity by Level/i)).toBeInTheDocument();
    expect(screen.getByText(/Cost vs. Outcomes by Product Team/i)).toBeInTheDocument();
    expect(screen.getByText(/ROI by Portfolio/i)).toBeInTheDocument();

    // Check for outcomes table
    expect(screen.getByText(/Product Team/i)).toBeInTheDocument();
    expect(screen.getByText(/Outcomes Value/i)).toBeInTheDocument();

    // Check for footnote
    expect(screen.getByText(/ROI and cost values represent Product Design resources only/i)).toBeInTheDocument();
  });
});
