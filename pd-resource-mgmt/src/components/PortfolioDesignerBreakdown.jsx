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
          </div>
        ))}
      </div>
    </div>
  );
}

export default PortfolioDesignerBreakdown;
