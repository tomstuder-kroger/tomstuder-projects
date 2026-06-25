import React from 'react';

function PortfolioDesignerBreakdown({ groupBy, data, title }) {
  const formatCurrency = (value) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
    return `$${value.toLocaleString()}`;
  };

  const formatROI = (roi) => {
    if (roi === null || roi === undefined) return 'N/A';
    return `${roi.toFixed(1)}%`;
  };

  const getUtilizationColor = (utilization) => {
    if (utilization < 70) return '#9ca3af';
    if (utilization <= 100) return '#2e7d32';
    return '#d32f2f';
  };

  return (
    <div className="portfolio-designer-breakdown">
      <h3 className="breakdown-title">{title}</h3>

      <div className="breakdown-sections">
        {Object.entries(data).map(([groupName, groupData]) => (
          <div key={groupName} className="breakdown-section">
            <div className="section-header">
              <span className="group-name">
                {groupName} {groupBy === 'portfolio' ? 'Portfolio' : 'Level'}
              </span>
              <span className="group-stats">
                {formatCurrency(groupData.totalCost)}/mo · {groupData.avgUtilization.toFixed(0)}% · ROI: {formatROI(groupData.roi)}
              </span>
            </div>

            <div className="designers-grid">
              {groupData.designers.map((designer) => (
                <div key={designer.id} className="designer-card">
                  <div className="designer-header">
                    <span className="designer-name">{designer.name}</span>
                    <span className="level-badge">{designer.level}</span>
                  </div>
                  <div className="designer-stats">
                    <span className="monthly-rate">{formatCurrency(designer.monthlyRunRate)}/mo</span>
                    <span
                      className="utilization"
                      style={{ color: getUtilizationColor(designer.utilization) }}
                    >
                      {designer.utilization.toFixed(0)}%
                    </span>
                  </div>
                  <div className="allocations">
                    {designer.allocationsWithTeamNames.map((allocation, idx) => (
                      <span key={idx} className="allocation-badge">
                        {allocation.teamName} ({allocation.allocationPercent}%)
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PortfolioDesignerBreakdown;
