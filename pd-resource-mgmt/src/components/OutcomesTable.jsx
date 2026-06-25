import React from 'react';

function OutcomesTable({
  productTeams,
  portfolios,
  designers,
  outcomes,
  capacitySettings,
  onUpdateOutcome
}) {
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
        </tbody>
      </table>
    </div>
  );
}

export default OutcomesTable;
