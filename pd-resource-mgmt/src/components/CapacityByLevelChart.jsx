import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload) return null;

  const allocated = payload[0]?.value || 0;
  const unallocated = payload[1]?.value || 0;
  const total = allocated + unallocated;
  const utilization = total > 0 ? (allocated / total * 100).toFixed(1) : 0;

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
      <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>{label}</p>
      <p style={{ margin: '0.25rem 0', fontSize: '0.875rem' }}>
        Allocated: {allocated.toLocaleString()} hours
      </p>
      <p style={{ margin: '0.25rem 0', fontSize: '0.875rem' }}>
        Unallocated: {unallocated.toLocaleString()} hours
      </p>
      <p style={{ margin: '0.25rem 0', fontSize: '0.875rem' }}>
        Total: {total.toLocaleString()} hours
      </p>
      <p style={{ margin: '0.25rem 0', fontSize: '0.875rem', fontWeight: 'bold', color: '#2e7d32' }}>
        Utilization: {utilization}%
      </p>
    </div>
  );
}

function CapacityByLevelChart({ data }) {
  return (
    <div className="chart-container" style={{ padding: '1.5rem', backgroundColor: '#ffffff', borderRadius: '0.5rem' }}>
      <h3 className="chart-title" style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', color: '#000' }}>
        Team Capacity by Level
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          layout="horizontal"
          margin={{ top: 20, right: 30, left: 60, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis type="number" />
          <YAxis type="category" dataKey="level" width={50} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />

          <Bar
            dataKey="allocated"
            stackId="a"
            fill="#2e7d32"
            name="Allocated Hours"
            radius={[0, 4, 4, 0]}
          />
          <Bar
            dataKey="unallocated"
            stackId="a"
            fill="#9ca3af"
            name="Unallocated Hours"
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>

      <div className="chart-note" style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
        Note: Future enhancement will allow toggling between by-level, by-portfolio, and by-individual views
      </div>
    </div>
  );
}

export default CapacityByLevelChart;
