import { v4 as uuidv4 } from 'uuid';

// Portfolios
const portfolios = [
  { id: uuidv4(), name: 'Item' },
  { id: uuidv4(), name: 'Assortment' },
  { id: uuidv4(), name: 'Supplier' }
];

// Product Teams
const productTeams = [
  // Item Portfolio
  { id: uuidv4(), name: 'Item Pricing Team', portfolioId: portfolios[0].id },
  { id: uuidv4(), name: 'Item Catalog Team', portfolioId: portfolios[0].id },
  { id: uuidv4(), name: 'Item Discovery Team', portfolioId: portfolios[0].id },
  { id: uuidv4(), name: 'Item Recommendations Team', portfolioId: portfolios[0].id },

  // Assortment Portfolio
  { id: uuidv4(), name: 'Assortment Planning Team', portfolioId: portfolios[1].id },
  { id: uuidv4(), name: 'Category Management Team', portfolioId: portfolios[1].id },
  { id: uuidv4(), name: 'Inventory Optimization Team', portfolioId: portfolios[1].id },

  // Supplier Portfolio
  { id: uuidv4(), name: 'Supplier Onboarding Team', portfolioId: portfolios[2].id },
  { id: uuidv4(), name: 'Supplier Portal Team', portfolioId: portfolios[2].id },
  { id: uuidv4(), name: 'Supplier Analytics Team', portfolioId: portfolios[2].id }
];

// Designers (11 total: 2 APD, 5 PD, 4 SPD)
const designers = [
  // APD
  {
    id: uuidv4(),
    name: 'Alex Chen',
    level: 'APD',
    employmentStatus: 'FTE',
    allocations: [
      { productTeamId: productTeams[0].id, percentage: 50 },
      { productTeamId: productTeams[1].id, percentage: 50 }
    ]
  },
  {
    id: uuidv4(),
    name: 'Jordan Kim',
    level: 'APD',
    employmentStatus: 'FTE',
    allocations: [
      { productTeamId: productTeams[4].id, percentage: 100 }
    ]
  },

  // PD
  {
    id: uuidv4(),
    name: 'Taylor Martinez',
    level: 'PD',
    employmentStatus: 'FTE',
    allocations: [
      { productTeamId: productTeams[2].id, percentage: 60 },
      { productTeamId: productTeams[3].id, percentage: 40 }
    ]
  },
  {
    id: uuidv4(),
    name: 'Morgan Lee',
    level: 'PD',
    employmentStatus: 'SOW',
    allocations: [
      { productTeamId: productTeams[5].id, percentage: 100 }
    ]
  },
  {
    id: uuidv4(),
    name: 'Casey Johnson',
    level: 'PD',
    employmentStatus: 'FTE',
    allocations: [
      { productTeamId: productTeams[6].id, percentage: 100 }
    ]
  },
  {
    id: uuidv4(),
    name: 'Riley Patel',
    level: 'PD',
    employmentStatus: 'FTE',
    allocations: [
      { productTeamId: productTeams[7].id, percentage: 50 },
      { productTeamId: productTeams[8].id, percentage: 50 }
    ]
  },
  {
    id: uuidv4(),
    name: 'Avery Wong',
    level: 'PD',
    employmentStatus: 'SOW Koncert',
    allocations: [
      { productTeamId: productTeams[9].id, percentage: 100 }
    ]
  },

  // SPD
  {
    id: uuidv4(),
    name: 'Jamie Rodriguez',
    level: 'SPD',
    employmentStatus: 'FTE',
    allocations: [
      { productTeamId: productTeams[0].id, percentage: 40 },
      { productTeamId: productTeams[1].id, percentage: 30 },
      { productTeamId: productTeams[2].id, percentage: 30 }
    ]
  },
  {
    id: uuidv4(),
    name: 'Quinn Davis',
    level: 'SPD',
    employmentStatus: 'FTE',
    allocations: [
      { productTeamId: productTeams[4].id, percentage: 50 },
      { productTeamId: productTeams[5].id, percentage: 50 }
    ]
  },
  {
    id: uuidv4(),
    name: 'Sage Williams',
    level: 'SPD',
    employmentStatus: 'FTE',
    allocations: [
      { productTeamId: productTeams[7].id, percentage: 100 }
    ]
  },
  {
    id: uuidv4(),
    name: 'Drew Thompson',
    level: 'SPD',
    employmentStatus: 'FTE',
    allocations: [
      { productTeamId: productTeams[8].id, percentage: 50 },
      { productTeamId: productTeams[9].id, percentage: 50 }
    ]
  }
];

// Capacity Settings
const capacitySettings = {
  standardHoursPerWeek: 40,
  weeksPerYear: 52,
  ptoHoursPerYear: 120,      // 15 days × 8
  holidaysHoursPerYear: 80,   // 10 days × 8
  ldHoursPerYear: 24,         // 3 days × 8
  okrPlanningHoursPerYear: 16, // 2 days × 8
  ratesByLevel: {
    APD: { actual: 100, blended: 125 },
    PD: { actual: 120, blended: 150 },
    SPD: { actual: 150, blended: 180 }
  }
};

// Outcomes - keyed by productTeam ID
// Realistic placeholder values representing annual value delivered
const outcomes = {
  // Item Portfolio teams
  [productTeams[0].id]: 500000,   // Item Pricing Team
  [productTeams[1].id]: 400000,   // Item Catalog Team
  [productTeams[2].id]: 600000,   // Item Discovery Team
  [productTeams[3].id]: 450000,   // Item Recommendations Team

  // Assortment Portfolio teams
  [productTeams[4].id]: 350000,   // Assortment Planning Team
  [productTeams[5].id]: 300000,   // Category Management Team
  [productTeams[6].id]: 250000,   // Inventory Optimization Team

  // Supplier Portfolio teams
  [productTeams[7].id]: 200000,   // Supplier Onboarding Team
  [productTeams[8].id]: 150000,   // Supplier Portal Team
  [productTeams[9].id]: 100000    // Supplier Analytics Team
};

export function getInitialData() {
  return {
    designers,
    productTeams,
    portfolios,
    capacitySettings,
    outcomes
  };
}
