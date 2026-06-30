import React, { useMemo } from 'react';
import { MxInputTextBox } from 'react-mx-web-components';
import { useResource } from '../context/ResourceContext';

function SettingsCapacityTab() {
  const { capacitySettings, updateCapacitySettings } = useResource();

  const availableHours = useMemo(() => {
    const totalWork = (capacitySettings.standardHoursPerWeek || 40) * (capacitySettings.weeksPerYear || 52);
    const totalOff =
      (capacitySettings.ptoHoursPerYear || 0) +
      (capacitySettings.holidaysHoursPerYear || 0) +
      (capacitySettings.ldHoursPerYear || 0) +
      (capacitySettings.okrPlanningHoursPerYear || 0);
    return totalWork - totalOff;
  }, [capacitySettings]);

  const handleChange = (field, value) => {
    const numValue = parseInt(value) || 0;
    updateCapacitySettings({ [field]: numValue });
  };

  return (
    <div style={{ maxWidth: '600px' }}>
      <div className="kds-Card kds-Card--m kds-card-section" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>
          Work Schedule
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <MxInputTextBox
            label="Standard Hours Per Week"
            value={(capacitySettings.standardHoursPerWeek || 40).toString()}
            onChange={(e) => handleChange('standardHoursPerWeek', e.target.value)}
            type="number"
            mask="none"
          />

          <MxInputTextBox
            label="Weeks Per Year"
            value={(capacitySettings.weeksPerYear || 52).toString()}
            onChange={(e) => handleChange('weeksPerYear', e.target.value)}
            type="number"
            mask="none"
          />
        </div>
      </div>

      <div className="kds-Card kds-Card--m kds-card-section" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>
          Time Off Adjustments (hours/year)
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <MxInputTextBox
            label="PTO Hours"
            value={(capacitySettings.ptoHoursPerYear || 120).toString()}
            onChange={(e) => handleChange('ptoHoursPerYear', e.target.value)}
            type="number"
            mask="none"
          />

          <MxInputTextBox
            label="Holiday Hours"
            value={(capacitySettings.holidaysHoursPerYear || 80).toString()}
            onChange={(e) => handleChange('holidaysHoursPerYear', e.target.value)}
            type="number"
            mask="none"
          />

          <MxInputTextBox
            label="L&D Hours"
            value={(capacitySettings.ldHoursPerYear || 24).toString()}
            onChange={(e) => handleChange('ldHoursPerYear', e.target.value)}
            type="number"
            mask="none"
          />

          <MxInputTextBox
            label="OKR Planning Hours"
            value={(capacitySettings.okrPlanningHoursPerYear || 16).toString()}
            onChange={(e) => handleChange('okrPlanningHoursPerYear', e.target.value)}
            type="number"
            mask="none"
          />
        </div>
      </div>

      <div style={{
        padding: '1rem',
        background: '#f0fdf4',
        borderRadius: '4px',
        border: '1px solid #86efac'
      }}>
        <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
          Available Hours Per Year
        </div>
        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2e7d32' }}>
          {availableHours.toLocaleString()} hours
        </div>
        <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem' }}>
          ({capacitySettings.standardHoursPerWeek || 40} × {capacitySettings.weeksPerYear || 52}) -
          ({capacitySettings.ptoHoursPerYear || 120} + {capacitySettings.holidaysHoursPerYear || 80} +
          {capacitySettings.ldHoursPerYear || 24} + {capacitySettings.okrPlanningHoursPerYear || 16})
        </div>
      </div>

      <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '1rem', fontStyle: 'italic' }}>
        These settings affect available hours for all designers
      </p>
    </div>
  );
}

export default SettingsCapacityTab;
