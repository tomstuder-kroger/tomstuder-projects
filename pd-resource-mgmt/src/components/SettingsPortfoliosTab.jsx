import React, { useState } from 'react';
import { MxInputTextBox, KdsButton, KdsMessage, MxModal, MxModalBody } from 'react-mx-web-components';
import { useResource } from '../context/ResourceContext';

function SettingsPortfoliosTab() {
  const { portfolios, productTeams, addPortfolio, updatePortfolio, deletePortfolio } = useResource();

  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const validateName = (name, excludeId = null) => {
    if (!name.trim()) {
      return 'Portfolio name is required';
    }
    if (name.length > 30) {
      return 'Portfolio name must be 30 characters or less';
    }
    const duplicate = portfolios.find(p =>
      p.id !== excludeId && p.name.toLowerCase() === name.trim().toLowerCase()
    );
    if (duplicate) {
      return 'A portfolio with this name already exists';
    }
    return '';
  };

  const getTeamsForPortfolio = (portfolioId) => {
    return productTeams.filter(t => t.portfolioId === portfolioId);
  };

  const handleStartAdd = () => {
    setIsAdding(true);
    setNewName('');
    setError('');
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
    setNewName('');
    setError('');
  };

  const handleSaveAdd = () => {
    const validationError = validateName(newName);
    if (validationError) {
      setError(validationError);
      return;
    }
    addPortfolio({ name: newName.trim() });
    setIsAdding(false);
    setNewName('');
    setError('');
  };

  const handleStartEdit = (portfolio) => {
    setEditingId(portfolio.id);
    setEditingName(portfolio.name);
    setError('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
    setError('');
  };

  const handleSaveEdit = () => {
    const validationError = validateName(editingName, editingId);
    if (validationError) {
      setError(validationError);
      return;
    }
    updatePortfolio(editingId, { name: editingName.trim() });
    setEditingId(null);
    setEditingName('');
    setError('');
  };

  const handleDeleteClick = (portfolio) => {
    const teams = getTeamsForPortfolio(portfolio.id);
    if (teams.length > 0) {
      setError(`Cannot delete ${portfolio.name} - ${teams.length} product teams are assigned.\n\nTo delete this portfolio:\n1. Switch to Product Teams tab\n2. Either delete or reassign these teams: ${teams.map(t => t.name).join(', ')}\n3. Return here to delete the portfolio`);
      return;
    }
    setDeleteConfirm(portfolio);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirm) {
      deletePortfolio(deleteConfirm.id);
      setDeleteConfirm(null);
    }
  };

  return (
    <div>
      {error && (
        <KdsMessage kind="error" style={{ marginBottom: '1rem', whiteSpace: 'pre-line' }}>
          {error}
        </KdsMessage>
      )}

      <div style={{ marginBottom: '1rem' }}>
        <KdsButton kind="primary" onClick={handleStartAdd} disabled={isAdding || editingId !== null}>
          + Add Portfolio
        </KdsButton>
      </div>

      {portfolios.length === 0 && !isAdding ? (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          color: '#9ca3af',
          background: '#f9fafb',
          borderRadius: '4px'
        }}>
          No portfolios yet. Click "+ Add Portfolio" to create one.
        </div>
      ) : (
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '0.5rem'
        }}>
          <thead style={{ background: '#f9fafb', position: 'sticky', top: 0 }}>
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
                Portfolio Name
              </th>
              <th style={{
                padding: '1rem',
                textAlign: 'left',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                borderBottom: '2px solid #e5e7eb',
                width: '150px'
              }}>
                Teams Count
              </th>
              <th style={{
                padding: '1rem',
                textAlign: 'right',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                borderBottom: '2px solid #e5e7eb',
                width: '200px'
              }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {isAdding && (
              <tr style={{ background: '#fffbeb', borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '1rem' }}>
                  <MxInputTextBox
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Enter portfolio name"
                    mask="none"
                  />
                </td>
                <td style={{ padding: '1rem', color: '#9ca3af' }}>
                  —
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <KdsButton kind="primary" onClick={handleSaveAdd}>
                      Save
                    </KdsButton>
                    <KdsButton kind="secondary" onClick={handleCancelAdd}>
                      Cancel
                    </KdsButton>
                  </div>
                </td>
              </tr>
            )}

            {portfolios.map((portfolio) => {
              const teams = getTeamsForPortfolio(portfolio.id);
              const isEditing = editingId === portfolio.id;

              return (
                <tr key={portfolio.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '1rem' }}>
                    {isEditing ? (
                      <MxInputTextBox
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        mask="none"
                      />
                    ) : (
                      <span style={{ fontWeight: 600 }}>{portfolio.name}</span>
                    )}
                  </td>
                  <td style={{ padding: '1rem', color: '#6b7280' }}>
                    <span title={teams.map(t => t.name).join(', ')}>
                      {teams.length} {teams.length === 1 ? 'team' : 'teams'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    {isEditing ? (
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <KdsButton kind="primary" onClick={handleSaveEdit}>
                          Save
                        </KdsButton>
                        <KdsButton kind="secondary" onClick={handleCancelEdit}>
                          Cancel
                        </KdsButton>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <KdsButton
                          kind="secondary"
                          variant="minimal"
                          onClick={() => handleStartEdit(portfolio)}
                          disabled={isAdding || editingId !== null}
                        >
                          Edit
                        </KdsButton>
                        <KdsButton
                          kind="destructive"
                          variant="minimal"
                          onClick={() => handleDeleteClick(portfolio)}
                          disabled={isAdding || editingId !== null}
                        >
                          Delete
                        </KdsButton>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <MxModal
        isOpened={deleteConfirm !== null}
        headercontent={`Delete ${deleteConfirm?.name}?`}
        footerPrimaryButtonText="Delete"
        footerPrimaryButtonKind="destructive"
        footerSecondaryButtonText="Cancel"
        closeOnSecondaryButton
        onApplyClick={handleConfirmDelete}
        onSecondaryClick={() => setDeleteConfirm(null)}
        onModalClose={() => setDeleteConfirm(null)}
      >
        <MxModalBody>
          <p>Are you sure you want to delete '{deleteConfirm?.name}'? This action cannot be undone.</p>
        </MxModalBody>
      </MxModal>
    </div>
  );
}

export default SettingsPortfoliosTab;
