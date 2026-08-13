import React from 'react';

function CostOutcomesChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="chart-container" style={{ padding: '1.5rem', backgroundColor: '#ffffff', borderRadius: '0.5rem' }}>
        <h3 className="chart-title" style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', color: '#000' }}>
          Cost vs. Outcomes by Product Team
        </h3>
        <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
          No data available
        </div>
      </div>
    );
  }

  // Portfolio colors
  const portfolioColors = {
    'Item': '#0F52A2',
    'Assortment': '#2e7d32',
    'Supplier': '#ff9800'
  };

  // Group data by portfolio
  const portfolios = ['Item', 'Assortment', 'Supplier'];
  const groupedData = portfolios.map(portfolio => ({
    name: portfolio,
    teams: data.filter(d => d.portfolioName === portfolio),
    color: portfolioColors[portfolio]
  }));

  return (
    <div className="chart-container" style={{ padding: '1.5rem', backgroundColor: '#ffffff', borderRadius: '0.5rem' }}>
      <h3 className="chart-title" style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', color: '#000' }}>
        Cost vs. Outcomes by Product Team
      </h3>

      <div style={{ marginTop: '1.5rem' }}>
        {groupedData.map((portfolio, pIndex) => (
          <div key={pIndex} style={{ marginBottom: '2rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.75rem',
              fontWeight: 600,
              fontSize: '0.875rem'
            }}>
              <div style={{
                width: '12px',
                height: '12px',
                backgroundColor: portfolio.color,
                borderRadius: '50%'
              }}></div>
              <span>{portfolio.name} Portfolio</span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '0.75rem'
            }}>
              {portfolio.teams.map((team, tIndex) => {
                const hasOutcome = team.outcomesValue !== null && team.outcomesValue !== undefined;
                const roi = hasOutcome && team.monthlyCost > 0
                  ? ((team.outcomesValue / (team.monthlyCost * 12)) * 100).toFixed(0)
                  : null;

                return (
                  <div
                    key={tIndex}
                    style={{
                      padding: '0.75rem',
                      border: `2px solid ${portfolio.color}`,
                      borderRadius: '0.375rem',
                      backgroundColor: '#fafafa'
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                      {team.teamName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', lineHeight: '1.5' }}>
                      <div>Monthly Cost: <strong>${team.monthlyCost.toLocaleString()}</strong></div>
                      <div>
                        Outcomes: <strong>{hasOutcome ? `$${team.outcomesValue.toLocaleString()}` : 'N/A'}</strong>
                      </div>
                      <div>Designers: <strong>{team.designerCount}</strong></div>
                      {roi !== null && (
                        <div style={{ marginTop: '0.25rem', color: '#2e7d32', fontWeight: 600 }}>
                          ROI: {roi}%
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.875rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
        {portfolios.map((portfolio, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '16px', height: '16px', backgroundColor: portfolioColors[portfolio], borderRadius: '50%' }}></div>
            <span>{portfolio} Portfolio</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CostOutcomesChart;
