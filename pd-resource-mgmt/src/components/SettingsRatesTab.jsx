import React from 'react';
import { MxInputTextBox } from 'react-mx-web-components';
import { useResource } from '../context/ResourceContext';

function SettingsRatesTab() {
  const { capacitySettings, updateCapacitySettings } = useResource();

  const levels = ['APD', 'PD', 'SPD'];

  const getLevelColor = (level) => {
    switch (level) {
      case 'APD': return '#2e7d32';
      case 'PD': return '#0F52A2';
      case 'SPD': return '#ff9800';
      default: return '#6b7280';
    }
  };

  const handleRateChange = (level, rateType, value) => {
    const numValue = parseFloat(value) || 0;
    updateCapacitySettings({
      ratesByLevel: {
        ...capacitySettings.ratesByLevel,
        [level]: {
          ...capacitySettings.ratesByLevel[level],
          [rateType]: numValue
        }
      }
    });
  };

  return (
    <div style={{ maxWidth: '700px' }}>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '0.5rem'
      }}>
        <thead style={{ background: '#f9fafb' }}>
          <tr>
            <th style={{
              padding: '1rem',
              textAlign: 'left',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              borderBottom: '2px solid #e5e7eb'
            }}>
              Level
            </th>
            <th style={{
              padding: '1rem',
              textAlign: 'left',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              borderBottom: '2px solid #e5e7eb'
            }}>
              Actual Hourly Rate
            </th>
            <th style={{
              padding: '1rem',
              textAlign: 'left',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              borderBottom: '2px solid #e5e7eb'
            }}>
              Blended Hourly Rate
            </th>
          </tr>
        </thead>
        <tbody>
          {levels.map((level) => {
            const rates = capacitySettings.ratesByLevel?.[level] || { actual: 0, blended: 0 };
            return (
              <tr key={level} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '1rem' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '0.25rem',
                    color: '#ffffff',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    background: getLevelColor(level)
                  }}>
                    {level}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ maxWidth: '150px' }}>
                    <MxInputTextBox
                      value={rates.actual.toString()}
                      onChange={(e) => handleRateChange(level, 'actual', e.target.value)}
                      mask="currency"
                    />
                  </div>
                </td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ maxWidth: '150px' }}>
                    <MxInputTextBox
                      value={rates.blended.toString()}
                      onChange={(e) => handleRateChange(level, 'blended', e.target.value)}
                      mask="currency"
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '1rem', fontStyle: 'italic' }}>
        Actual = direct cost, Blended = loaded cost (benefits, overhead)
      </p>
    </div>
  );
}

export default SettingsRatesTab;
