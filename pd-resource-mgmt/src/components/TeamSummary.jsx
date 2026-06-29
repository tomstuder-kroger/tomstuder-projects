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
import TeamMetricCards from './TeamMetricCards';
import TeamSecondaryStats from './TeamSecondaryStats';
import CapacityByLevelChart from './CapacityByLevelChart';
import CostOutcomesChart from './CostOutcomesChart';
import ROIByPortfolioChart from './ROIByPortfolioChart';
import PortfolioDesignerBreakdown from './PortfolioDesignerBreakdown';
import OutcomesTable from './OutcomesTable';

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
      {/* Primary Metrics */}
      <TeamMetricCards
        totalMonthlyRunRate={teamMetrics.totalMonthlyRunRate}
        averageUtilization={teamMetrics.averageUtilization}
        totalOutcomesValue={teamMetrics.totalOutcomesValue}
        overallROI={teamMetrics.overallROI}
        incompleteTeamsCount={teamMetrics.incompleteTeamsCount}
        totalTeamsCount={productTeams.length}
      />

      {/* Secondary Stats */}
      <TeamSecondaryStats
        totalHoursAvailable={teamMetrics.totalHoursAvailable}
        totalHoursAllocated={teamMetrics.totalHoursAllocated}
        headcountByLevel={teamMetrics.headcountByLevel}
        averageRunRatePerDesigner={teamMetrics.averageRunRatePerDesigner}
      />

      {/* Capacity by Level Section */}
      <div className="chart-section">
        <CapacityByLevelChart data={capacityByLevel} />
        <PortfolioDesignerBreakdown
          groupBy="level"
          data={designersGroupedByLevel}
          title="Designer Breakdown by Level"
        />
      </div>

      {/* Cost vs Outcomes Section */}
      <div className="chart-section">
        <CostOutcomesChart data={teamCostOutcomes} />
        <PortfolioDesignerBreakdown
          groupBy="portfolio"
          data={designersGroupedByPortfolio}
          title="Designer Breakdown by Portfolio"
        />
      </div>

      {/* ROI by Portfolio Section */}
      <div className="chart-section">
        <ROIByPortfolioChart data={portfolioROI} />
        <PortfolioDesignerBreakdown
          groupBy="portfolio"
          data={designersGroupedByPortfolio}
          title="Designer Breakdown by Portfolio"
        />
      </div>

      {/* Outcomes Table */}
      <OutcomesTable
        productTeams={productTeams}
        portfolios={portfolios}
        designers={designers}
        outcomes={outcomes}
        capacitySettings={capacitySettings}
        onUpdateOutcome={updateOutcomes}
      />

      {/* Footnote */}
      <div className="page-footnote">
        *ROI and cost values represent Product Design resources only.
      </div>
    </div>
  );
}

export default TeamSummary;
