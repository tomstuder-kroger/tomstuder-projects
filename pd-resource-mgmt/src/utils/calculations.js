// Module-level constants
const DESIGNER_LEVELS = ['APD', 'PD', 'SPD'];
const MONTHS_PER_YEAR = 12;

/**
 * Calculate available hours per year for a designer
 * Formula: (standardHoursPerWeek × weeksPerYear) - all adjustments
 */
export function calculateAvailableHours(capacitySettings) {
  const {
    standardHoursPerWeek,
    weeksPerYear,
    ptoHoursPerYear,
    holidaysHoursPerYear,
    ldHoursPerYear,
    okrPlanningHoursPerYear
  } = capacitySettings;

  return (
    standardHoursPerWeek * weeksPerYear -
    ptoHoursPerYear -
    holidaysHoursPerYear -
    ldHoursPerYear -
    okrPlanningHoursPerYear
  );
}

/**
 * Calculate allocated hours per year for a designer
 * Formula: availableHours × (sum of allocation percentages / 100)
 */
export function calculateAllocatedHours(designer, capacitySettings) {
  const availableHours = calculateAvailableHours(capacitySettings);
  const totalAllocationPercentage = designer.allocations.reduce(
    (sum, allocation) => sum + allocation.percentage,
    0
  );
  return availableHours * (totalAllocationPercentage / 100);
}

/**
 * Calculate utilization percentage for a designer
 * Formula: (allocatedHours / availableHours) × 100
 */
export function calculateUtilization(designer, capacitySettings) {
  const availableHours = calculateAvailableHours(capacitySettings);
  const allocatedHours = calculateAllocatedHours(designer, capacitySettings);

  if (availableHours === 0) return 0;

  return (allocatedHours / availableHours) * 100;
}

/**
 * Calculate monthly run rate for a designer
 * Formula: (blendedRate × availableHours) / 12
 */
export function calculateMonthlyRunRate(designer, capacitySettings) {
  const availableHours = calculateAvailableHours(capacitySettings);
  const blendedRate = capacitySettings.ratesByLevel[designer.level].blended;
  const annualCost = blendedRate * availableHours;
  return annualCost / 12;
}

/**
 * Get color code for utilization percentage
 * < 70%: Gray, 70-100%: Green, > 100%: Red
 */
export function getUtilizationColor(utilization) {
  if (utilization < 70) return '#9ca3af';
  if (utilization <= 85) return '#81C5F4';
  if (utilization <= 100) return '#2e7d32';
  return '#d32f2f';
}

/**
 * Get status label for utilization
 */
export function getUtilizationStatus(utilization) {
  if (utilization < 70) return 'under';
  if (utilization <= 100) return 'good';
  return 'over';
}

/**
 * Calculate monthly cost for a team
 * Sums the allocated monthly run rates for all designers assigned to the team
 */
export function calculateTeamMonthlyCost(teamId, designers, capacitySettings) {
  let monthlyCost = 0;

  designers.forEach(designer => {
    const allocation = designer.allocations.find(
      a => a.productTeamId === teamId
    );

    if (allocation) {
      const designerMonthlyRate = calculateMonthlyRunRate(
        designer,
        capacitySettings
      );
      monthlyCost += (designerMonthlyRate * allocation.percentage) / 100;
    }
  });

  return monthlyCost;
}

/**
 * Enrich a designer with calculated metrics and team names
 */
function enrichDesignerWithMetrics(designer, productTeams, capacitySettings) {
  return {
    ...designer,
    monthlyRunRate: calculateMonthlyRunRate(designer, capacitySettings),
    utilization: calculateUtilization(designer, capacitySettings),
    allocationsWithTeamNames: designer.allocations.map(alloc => {
      const team = productTeams.find(t => t.id === alloc.productTeamId);
      return {
        ...alloc,
        teamName: team ? team.name : 'Unknown'
      };
    })
  };
}

/**
 * Calculate ROI percentage from monthly cost and outcomes value
 * Returns null if cost is 0 or outcomes is null
 */
function calculateROI(monthlyCost, outcomesValue) {
  if (outcomesValue === null || monthlyCost <= 0) {
    return null;
  }
  const annualCost = monthlyCost * MONTHS_PER_YEAR;
  return (outcomesValue / annualCost) * 100;
}

/**
 * Calculate aggregate team metrics
 */
export function calculateTeamMetrics(
  designers,
  productTeams,
  portfolios,
  outcomes,
  capacitySettings
) {
  // Total monthly run rate
  const totalMonthlyRunRate = designers.reduce((sum, designer) => {
    return sum + calculateMonthlyRunRate(designer, capacitySettings);
  }, 0);

  // Average utilization
  const utilizationSum = designers.reduce((sum, designer) => {
    return sum + calculateUtilization(designer, capacitySettings);
  }, 0);
  const averageUtilization = designers.length > 0
    ? utilizationSum / designers.length
    : 0;

  // Total hours
  const totalHoursAvailable = designers.reduce((sum, designer) => {
    return sum + calculateAvailableHours(capacitySettings);
  }, 0);

  const totalHoursAllocated = designers.reduce((sum, designer) => {
    return sum + calculateAllocatedHours(designer, capacitySettings);
  }, 0);

  // Headcount by level
  const headcountByLevel = { APD: 0, PD: 0, SPD: 0 };
  designers.forEach(designer => {
    if (headcountByLevel.hasOwnProperty(designer.level)) {
      headcountByLevel[designer.level]++;
    }
  });

  // Average run rate per designer
  const averageRunRatePerDesigner = designers.length > 0
    ? totalMonthlyRunRate / designers.length
    : 0;

  // Check if all teams have outcomes
  const incompleteTeamsCount = productTeams.filter(team => {
    return outcomes[team.id] == null;
  }).length;

  // Total outcomes value (null if any team missing)
  let totalOutcomesValue = null;
  if (incompleteTeamsCount === 0) {
    totalOutcomesValue = productTeams.reduce((sum, team) => {
      return sum + (outcomes[team.id] || 0);
    }, 0);
  }

  // Overall ROI (null if incomplete)
  const overallROI = calculateROI(totalMonthlyRunRate, totalOutcomesValue);

  return {
    totalMonthlyRunRate,
    averageUtilization,
    totalOutcomesValue,
    overallROI,
    totalHoursAvailable,
    totalHoursAllocated,
    headcountByLevel,
    averageRunRatePerDesigner,
    incompleteTeamsCount
  };
}

/**
 * Calculate capacity by designer level
 */
export function calculateCapacityByLevel(designers, capacitySettings) {
  return DESIGNER_LEVELS.map(level => {
    const designersAtLevel = designers.filter(d => d.level === level);

    const available = designersAtLevel.reduce((sum, designer) => {
      return sum + calculateAvailableHours(capacitySettings);
    }, 0);

    const allocated = designersAtLevel.reduce((sum, designer) => {
      return sum + calculateAllocatedHours(designer, capacitySettings);
    }, 0);

    const unallocated = available - allocated;

    return {
      level,
      available,
      allocated,
      unallocated
    };
  });
}

/**
 * Calculate team cost and outcomes
 */
export function calculateTeamCostAndOutcomes(
  productTeams,
  designers,
  outcomes,
  capacitySettings,
  portfolios
) {
  return productTeams.map(team => {
    // Find portfolio
    const portfolio = portfolios.find(p => p.id === team.portfolioId) || { name: 'Unknown' };

    // Calculate monthly cost for this team
    const monthlyCost = calculateTeamMonthlyCost(team.id, designers, capacitySettings);

    // Count designers allocated to this team
    let designerCount = 0;
    designers.forEach(designer => {
      if (designer.allocations.some(a => a.productTeamId === team.id)) {
        designerCount++;
      }
    });

    return {
      teamId: team.id,
      teamName: team.name,
      portfolioId: team.portfolioId,
      portfolioName: portfolio.name,
      monthlyCost,
      outcomesValue: outcomes[team.id] != null ? outcomes[team.id] : null,
      designerCount
    };
  });
}

/**
 * Calculate portfolio ROI
 */
export function calculatePortfolioROI(
  portfolios,
  productTeams,
  designers,
  outcomes,
  capacitySettings
) {
  return portfolios.map(portfolio => {
    // Find teams in this portfolio
    const teamsInPortfolio = productTeams.filter(
      t => t.portfolioId === portfolio.id
    );

    // Calculate total cost for portfolio
    let monthlyCost = 0;
    let hasIncompleteData = false;
    let totalOutcomes = 0;

    teamsInPortfolio.forEach(team => {
      // Calculate team cost
      monthlyCost += calculateTeamMonthlyCost(team.id, designers, capacitySettings);

      // Check outcomes
      if (outcomes[team.id] == null) {
        hasIncompleteData = true;
      } else {
        totalOutcomes += outcomes[team.id];
      }
    });

    // Calculate ROI
    let roi = null;
    let outcomesValue = null;

    if (!hasIncompleteData) {
      outcomesValue = totalOutcomes;
      roi = calculateROI(monthlyCost, outcomesValue);
    }

    return {
      portfolioId: portfolio.id,
      portfolioName: portfolio.name,
      monthlyCost,
      outcomesValue,
      roi
    };
  });
}

/**
 * Calculate designers grouped by level
 */
export function calculateDesignersGroupedByLevel(
  designers,
  productTeams,
  capacitySettings
) {
  const result = {};

  DESIGNER_LEVELS.forEach(level => {
    const designersAtLevel = designers.filter(d => d.level === level);

    const totalCost = designersAtLevel.reduce((sum, designer) => {
      return sum + calculateMonthlyRunRate(designer, capacitySettings);
    }, 0);

    const avgUtilization = designersAtLevel.length > 0
      ? designersAtLevel.reduce((sum, designer) => {
          return sum + calculateUtilization(designer, capacitySettings);
        }, 0) / designersAtLevel.length
      : 0;

    // Enrich designers with full details
    const enrichedDesigners = designersAtLevel.map(designer =>
      enrichDesignerWithMetrics(designer, productTeams, capacitySettings)
    );

    result[level] = {
      designers: enrichedDesigners,
      totalCost,
      avgUtilization,
      roi: null  // Not applicable for groupBy=level
    };
  });

  return result;
}

/**
 * Calculate designers grouped by portfolio
 */
export function calculateDesignersGroupedByPortfolio(
  designers,
  productTeams,
  portfolios,
  outcomes,
  capacitySettings
) {
  const result = {};

  portfolios.forEach(portfolio => {
    const teamsInPortfolio = productTeams.filter(
      t => t.portfolioId === portfolio.id
    );
    const teamIds = teamsInPortfolio.map(t => t.id);

    // Find designers allocated to teams in this portfolio
    const designersInPortfolio = designers.filter(designer => {
      return designer.allocations.some(alloc =>
        teamIds.includes(alloc.productTeamId)
      );
    });

    // Calculate metrics
    let totalCost = 0;
    let hasIncompleteData = false;
    let totalOutcomes = 0;

    teamsInPortfolio.forEach(team => {
      totalCost += calculateTeamMonthlyCost(team.id, designers, capacitySettings);

      if (outcomes[team.id] == null) {
        hasIncompleteData = true;
      } else {
        totalOutcomes += outcomes[team.id];
      }
    });

    // Calculate ROI
    let roi = null;
    if (!hasIncompleteData) {
      roi = calculateROI(totalCost, totalOutcomes);
    }

    // Calculate average utilization
    const avgUtilization = designersInPortfolio.length > 0
      ? designersInPortfolio.reduce((sum, designer) => {
          return sum + calculateUtilization(designer, capacitySettings);
        }, 0) / designersInPortfolio.length
      : 0;

    // Enrich designers
    const enrichedDesigners = designersInPortfolio.map(designer =>
      enrichDesignerWithMetrics(designer, productTeams, capacitySettings)
    );

    result[portfolio.name] = {
      designers: enrichedDesigners,
      totalCost,
      avgUtilization,
      roi
    };
  });

  return result;
}
