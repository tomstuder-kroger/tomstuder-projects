import React from 'react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload[0]) return null;

  const data = payload[0].payload;

  return (
    <div
      className="custom-tooltip"
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #d1d5db',
        borderRadius: '0.375rem',
        padding: '0.75rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}
    >
      <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>
        {data.teamName}
      </p>
      <p style={{ margin: '0.25rem 0', fontSize: '0.875rem' }}>
        Portfolio: {data.portfolioName}
      </p>
      <p style={{ margin: '0.25rem 0', fontSize: '0.875rem' }}>
        Monthly Cost: ${data.monthlyCost.toLocaleString()}
      </p>
      <p style={{ margin: '0.25rem 0', fontSize: '0.875rem' }}>
        Outcomes: {data.outcomesValue ? `$${data.outcomesValue.toLocaleString()}` : 'N/A'}
      </p>
      <p style={{ margin: '0.25rem 0', fontSize: '0.875rem' }}>
        Designers: {data.designerCount}
      </p>
    </div>
  );
}

function CostOutcomesChart({ data }) {
  // Prepare data with handling for null outcomes
  // Teams with null outcomes are set to Y=0 for rendering
  const processedData = data.map(item => ({
    ...item,
    outcomesValue: item.outcomesValue || 0,
    isNullOutcomes: item.outcomesValue === null || item.outcomesValue === undefined
  }));

  // Filter data by portfolio
  const itemData = processedData.filter(d => d.portfolioName === 'Item');
  const assortmentData = processedData.filter(d => d.portfolioName === 'Assortment');
  const supplierData = processedData.filter(d => d.portfolioName === 'Supplier');

  return (
    <div
      className="chart-container"
      style={{
        padding: '1.5rem',
        backgroundColor: '#ffffff',
        borderRadius: '0.5rem'
      }}
    >
      <h3
        className="chart-title"
        style={{
          fontSize: '1.125rem',
          fontWeight: 600,
          marginBottom: '1rem',
          color: '#000'
        }}
      >
        Cost vs. Outcomes by Product Team
      </h3>

      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            type="number"
            dataKey="monthlyCost"
            name="Monthly Cost"
            label={{ value: 'Monthly Design Cost ($)', position: 'bottom' }}
          />
          <YAxis
            type="number"
            dataKey="outcomesValue"
            name="Outcomes Value"
            label={{ value: 'Outcomes Value ($)', angle: -90, position: 'left' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />

          <Scatter
            name="Item Portfolio"
            data={itemData}
            fill="#0F52A2"
            fillOpacity={1}
          />
          <Scatter
            name="Assortment Portfolio"
            data={assortmentData}
            fill="#2e7d32"
            fillOpacity={1}
          />
          <Scatter
            name="Supplier Portfolio"
            data={supplierData}
            fill="#ff9800"
            fillOpacity={1}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

export default CostOutcomesChart;
