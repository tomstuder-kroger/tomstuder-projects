import React, { useState } from 'react';
import { KdsButton } from 'react-mx-web-components';
import { useResource } from '../context/ResourceContext';

function SettingsImportExportTab() {
  const { exportData, importData, importFromCapacityApp } = useResource();
  const [importStatus, setImportStatus] = useState(null);
  const [capacityAppData, setCapacityAppData] = useState(null);

  const handleCheckCapacityApp = () => {
    try {
      const icsData = localStorage.getItem('capacity-planning-ics');
      if (!icsData) {
        setImportStatus({ type: 'error', message: 'No data found in Capacity Planning app. Make sure the app has been used first.' });
        setCapacityAppData(null);
        return;
      }

      const ics = JSON.parse(icsData);
      if (!Array.isArray(ics) || ics.length === 0) {
        setImportStatus({ type: 'error', message: 'Capacity Planning app has no IC data to import.' });
        setCapacityAppData(null);
        return;
      }

      setCapacityAppData(ics);
      setImportStatus({ type: 'success', message: `Found ${ics.length} ICs in Capacity Planning app.` });
    } catch (error) {
      setImportStatus({ type: 'error', message: 'Failed to read Capacity Planning app data.' });
      setCapacityAppData(null);
    }
  };

  const handleImportFromCapacityApp = () => {
    if (!capacityAppData) {
      setImportStatus({ type: 'error', message: 'No data to import. Check for data first.' });
      return;
    }

    try {
      const imported = importFromCapacityApp(capacityAppData);
      setImportStatus({
        type: 'success',
        message: `Successfully imported ${imported.count} designers from Capacity Planning app.`
      });
      setCapacityAppData(null);
    } catch (error) {
      setImportStatus({ type: 'error', message: error.message || 'Import failed.' });
    }
  };

  const handleFileImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      await importData(file);
      setImportStatus({ type: 'success', message: 'Successfully imported data from JSON file.' });
      event.target.value = '';
    } catch (error) {
      setImportStatus({ type: 'error', message: error.message || 'Import failed.' });
      event.target.value = '';
    }
  };

  return (
    <div style={{ maxWidth: '700px' }}>
      {/* Import from Capacity Planning App */}
      <div className="kds-Card kds-Card--m kds-card-section" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          Import from Capacity Planning App
        </h3>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
          One-time import of IC data from the Capacity Planning app. This will create new designer
          records based on IC names and roles found in localStorage.
        </p>

        {capacityAppData && (
          <div style={{
            padding: '1rem',
            background: '#f0f9ff',
            borderRadius: '4px',
            border: '1px solid #bae6fd',
            marginBottom: '1rem'
          }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Preview: {capacityAppData.length} ICs found
            </div>
            <ul style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0, paddingLeft: '1.5rem' }}>
              {capacityAppData.slice(0, 5).map((ic, idx) => (
                <li key={idx}>{ic.icName} ({ic.icRole || 'No role'})</li>
              ))}
              {capacityAppData.length > 5 && (
                <li style={{ fontStyle: 'italic' }}>...and {capacityAppData.length - 5} more</li>
              )}
            </ul>
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <KdsButton
            onClick={handleCheckCapacityApp}
            kind="secondary"
          >
            Check for Data
          </KdsButton>

          {capacityAppData && (
            <KdsButton
              onClick={handleImportFromCapacityApp}
              kind="primary"
            >
              Import {capacityAppData.length} ICs
            </KdsButton>
          )}
        </div>
      </div>

      {/* Import from JSON file */}
      <div className="kds-Card kds-Card--m kds-card-section" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          Import from JSON File
        </h3>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
          Import previously exported data from a JSON backup file.
        </p>

        <label>
          <input
            type="file"
            accept=".json"
            onChange={handleFileImport}
            style={{ display: 'none' }}
          />
          <KdsButton
            kind="secondary"
            onClick={(e) => e.currentTarget.previousElementSibling.click()}
          >
            Choose File to Import
          </KdsButton>
        </label>
      </div>

      {/* Export to JSON file */}
      <div className="kds-Card kds-Card--m kds-card-section" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          Export to JSON File
        </h3>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
          Download a backup of all data (designers, teams, portfolios, settings) as a JSON file.
        </p>

        <KdsButton
          onClick={exportData}
          kind="primary"
        >
          Export All Data
        </KdsButton>
      </div>

      {/* Status message */}
      {importStatus && (
        <div style={{
          padding: '1rem',
          background: importStatus.type === 'success' ? '#f0fdf4' : '#fef2f2',
          borderRadius: '4px',
          border: `1px solid ${importStatus.type === 'success' ? '#86efac' : '#fca5a5'}`
        }}>
          <div style={{
            fontSize: '0.875rem',
            color: importStatus.type === 'success' ? '#166534' : '#991b1b'
          }}>
            {importStatus.message}
          </div>
        </div>
      )}

      <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '1.5rem', fontStyle: 'italic' }}>
        Note: Importing from Capacity Planning app will add designers without allocations.
        You'll need to manually assign them to product teams.
      </p>
    </div>
  );
}

export default SettingsImportExportTab;
