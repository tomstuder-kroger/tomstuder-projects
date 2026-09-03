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
    return portfolio ? portfolio.name : '';
  };

  const getPortfolioColor = (portfolioName) => {
    const colors = {
      'Item': '#0F52A2',
      'Assortment': '#2e7d32',
      'Supplier': '#ff9800'
    };
    return colors[portfolioName] || '#6b7280';
  };

  const handleOutcomeChange = (teamId, value) => {
    const numericValue = parseFloat(value.replace(/[^0-9.]/g, ''));
    if (!isNaN(numericValue)) {
      onUpdateOutcome(teamId, numericValue);
    } else if (value === '') {
      onUpdateOutcome(teamId, null);
    }
  };

  const formatOutcomeValue = (value) => {
    if (value === null || value === undefined) return '';
    return value.toLocaleString();
  };

  const trackedCount = productTeams.filter(team => {
    const outcome = outcomes[team.id];
    return outcome !== null && outcome !== undefined;
  }).length;

  const allTracked = trackedCount === productTeams.length;

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
            const outcomeValue = outcomes[team.id];
            const hasOutcome = outcomeValue !== null && outcomeValue !== undefined;

            return (
              <tr key={team.id}>
                <td className="team-name">{team.name}</td>
                <td>
                  <span
                    className="portfolio-badge"
                    style={{ backgroundColor: getPortfolioColor(portfolioName) }}
                  >
                    {portfolioName}
                  </span>
                </td>
                <td className="monthly-cost">${monthlyCost.toLocaleString()}</td>
                <td>
                  <input
                    type="text"
                    className="outcome-input"
                    value={formatOutcomeValue(outcomeValue)}
                    onChange={(e) => handleOutcomeChange(team.id, e.target.value)}
                    placeholder="$0"
                  />
                </td>
                <td className="status-cell">
                  {hasOutcome ? (
                    <span className="status-check">✓</span>
                  ) : (
                    <span className="status-dash">-</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="5" className="footer-row">
              {allTracked ? (
                <span className="footer-complete">All teams tracked ✓</span>
              ) : (
                <span className="footer-incomplete">
                  {trackedCount} of {productTeams.length} teams tracked
                </span>
              )}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default OutcomesTable;
