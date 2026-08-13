import React from 'react';

function CapacityByLevelChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="chart-container" style={{ padding: '1.5rem', backgroundColor: '#ffffff', borderRadius: '0.5rem' }}>
        <h3 className="chart-title" style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', color: '#000' }}>
          Team Capacity by Level
        </h3>
        <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
          No data available
        </div>
      </div>
    );
  }

  // Find max value for scaling
  const maxValue = Math.max(...data.map(d => d.available));

  return (
    <div className="chart-container" style={{ padding: '1.5rem', backgroundColor: '#ffffff', borderRadius: '0.5rem' }}>
      <h3 className="chart-title" style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', color: '#000' }}>
        Team Capacity by Level
      </h3>

      <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
        {data.map((item, index) => {
          const allocatedPercent = (item.allocated / maxValue) * 100;
          const unallocatedPercent = (item.unallocated / maxValue) * 100;
          const utilization = item.available > 0 ? (item.allocated / item.available * 100).toFixed(0) : 0;

          return (
            <div key={index} style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{item.level}</span>
                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  {item.allocated.toLocaleString()} / {item.available.toLocaleString()} hours ({utilization}%)
                </span>
              </div>
              <div style={{
                display: 'flex',
                height: '32px',
                backgroundColor: '#f3f4f6',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div
                  style={{
                    width: `${allocatedPercent}%`,
                    backgroundColor: '#2e7d32',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: '0.75rem',
                    fontWeight: 600
                  }}
                  title={`Allocated: ${item.allocated.toLocaleString()} hours`}
                >
                  {allocatedPercent > 10 ? `${item.allocated.toLocaleString()}` : ''}
                </div>
                <div
                  style={{
                    width: `${unallocatedPercent}%`,
                    backgroundColor: '#9ca3af',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: '0.75rem',
                    fontWeight: 600
                  }}
                  title={`Unallocated: ${item.unallocated.toLocaleString()} hours`}
                >
                  {unallocatedPercent > 10 && item.unallocated > 0 ? `${item.unallocated.toLocaleString()}` : ''}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.875rem', marginTop: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '16px', height: '16px', backgroundColor: '#2e7d32', borderRadius: '2px' }}></div>
          <span>Allocated Hours</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '16px', height: '16px', backgroundColor: '#9ca3af', borderRadius: '2px' }}></div>
          <span>Unallocated Hours</span>
        </div>
      </div>

      <div className="chart-note" style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '1rem' }}>
        Note: Future enhancement will allow toggling between by-level, by-portfolio, and by-individual views
      </div>
    </div>
  );
}

export default CapacityByLevelChart;
