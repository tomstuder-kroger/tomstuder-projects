import React from 'react';
import { calculateTeamMonthlyCost } from '../utils/calculations';

function OutcomesTable({
  productTeams,
  portfolios,
  designers,
  outcomes,
  capacitySettings,
  onUpdateOutcome
}) {
  const getPortfolioName = (portfolioId) => {
    const portfolio = portfolios.find(p => p.id === portfolioId);
    return portfolio ? portfolio.portfolioName : '';
  };

  const getPortfolioColor = (portfolioName) => {
    const colors = {
      'Item': '#0F52A2',
      'Assortment': '#2e7d32',
      'Supplier': '#ff9800'
    };
    return colors[portfolioName] || '#6b7280';
  };

  return (
    <div className="outcomes-table-container">
      <table className="outcomes-table">
        <thead>
          <tr>
            <th>Product Team</th>
            <th>Portfolio</th>
            <th>Monthly Design Cost</th>
            <th>Outcomes Value</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {productTeams.map((team) => {
            const portfolioName = getPortfolioName(team.portfolioId);
            const monthlyCost = calculateTeamMonthlyCost(team.id, designers, capacitySettings);

            return (
              <tr key={team.id}>
                <td className="team-name">{team.teamName}</td>
                <td>
                  <span
                    className="portfolio-badge"
                    style={{ backgroundColor: getPortfolioColor(portfolioName) }}
                  >
                    {portfolioName}
                  </span>
                </td>
                <td className="monthly-cost">${monthlyCost.toLocaleString()}</td>
                <td></td>
                <td></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default OutcomesTable;
