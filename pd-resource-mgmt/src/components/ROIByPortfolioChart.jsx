import React from 'react';
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer
} from 'recharts';

/**
 * ROIByPortfolioChart - Displays ROI % by portfolio
 * Shows color-coded bars with a 100% target reference line
 */

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload[0]) return null;

  const data = payload[0].payload;

  return (
    <div className="custom-tooltip">
      <p><strong>{data.portfolioName} Portfolio</strong></p>
      <p>Monthly Cost: ${data.monthlyCost.toLocaleString()}</p>
      <p>Annual Cost: ${(data.monthlyCost * 12).toLocaleString()}</p>
      <p>Outcomes: {data.outcomesValue ? `$${data.outcomesValue.toLocaleString()}` : 'Incomplete'}</p>
      <p>ROI: {data.roi !== null ? `${data.roi.toFixed(1)}%` : 'N/A'}</p>
    </div>
  );
}

function getROIColor(roi) {
  if (roi === null) return '#9ca3af';      // Gray for N/A
  if (roi > 100) return '#2e7d32';         // Green for positive ROI
  if (roi >= 50) return '#fbbf24';         // Yellow for moderate
  return '#d32f2f';                        // Red for low ROI
}

function ROIByPortfolioChart({ data = [] }) {
  return (
    <div className="chart-container">
      <h3 className="chart-title">ROI by Portfolio</h3>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="portfolioName" />
          <YAxis label={{ value: 'ROI %', angle: -90, position: 'left' }} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={100} stroke="#6b7280" strokeDasharray="3 3" label="Target: 100%" />

          <Bar dataKey="roi" fill="#2e7d32">
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={getROIColor(entry.roi)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ROIByPortfolioChart;
