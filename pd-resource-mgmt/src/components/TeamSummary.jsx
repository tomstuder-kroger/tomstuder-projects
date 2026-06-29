import React from 'react';
import { useResource } from '../context/ResourceContext';
import {
  calculateTeamMetrics,
  calculateCapacityByLevel,
  calculateTeamCostAndOutcomes,
  calculatePortfolioROI,
  calculateDesignersGroupedByLevel,
  calculateDesignersGroupedByPortfolio
} from '../utils/calculations';

function TeamSummary() {
  const {
    designers,
    productTeams,
    portfolios,
    outcomes,
    capacitySettings,
    updateOutcomes
  } = useResource();

  // Calculate all metrics
  const teamMetrics = calculateTeamMetrics(
    designers,
    productTeams,
    portfolios,
    outcomes,
    capacitySettings
  );

  const capacityByLevel = calculateCapacityByLevel(designers, capacitySettings);

  const teamCostOutcomes = calculateTeamCostAndOutcomes(
    productTeams,
    designers,
    outcomes,
    capacitySettings,
    portfolios
  );

  const portfolioROI = calculatePortfolioROI(
    portfolios,
    productTeams,
    designers,
    outcomes,
    capacitySettings
  );

  const designersGroupedByLevel = calculateDesignersGroupedByLevel(
    designers,
    productTeams,
    capacitySettings
  );

  const designersGroupedByPortfolio = calculateDesignersGroupedByPortfolio(
    designers,
    productTeams,
    portfolios,
    outcomes,
    capacitySettings
  );

  return (
    <div className="team-summary-page">
      <div className="page-footnote">
        *ROI and cost values represent Product Design resources only.
      </div>
    </div>
  );
}

export default TeamSummary;
