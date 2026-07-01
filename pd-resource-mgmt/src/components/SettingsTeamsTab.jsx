import React, { useState, useMemo } from 'react';
import { MxInputTextBox, MxSingleSelect, KdsButton, KdsMessage, MxModal, MxModalBody } from 'react-mx-web-components';
import { useResource } from '../context/ResourceContext';

function SettingsTeamsTab() {
  const {
    productTeams,
    portfolios,
    designers,
    addProductTeam,
    updateProductTeam,
    deleteProductTeam
  } = useResource();

  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [editingPortfolioId, setEditingPortfolioId] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPortfolioId, setNewPortfolioId] = useState('');
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const sortedTeams = useMemo(() => {
    return [...productTeams].sort((a, b) => {
      const portfolioA = portfolios.find(p => p.id === a.portfolioId)?.name || '';
      const portfolioB = portfolios.find(p => p.id === b.portfolioId)?.name || '';
      if (portfolioA !== portfolioB) {
        return portfolioA.localeCompare(portfolioB);
      }
      return a.name.localeCompare(b.name);
    });
  }, [productTeams, portfolios]);

  const validateTeam = (name, excludeId = null) => {
    if (!name.trim()) {
      return 'Team name is required';
    }
    if (name.length > 50) {
      return 'Team name must be 50 characters or less';
    }
    const duplicate = productTeams.find(t =>
      t.id !== excludeId && t.name.toLowerCase() === name.trim().toLowerCase()
    );
    if (duplicate) {
      return 'A team with this name already exists';
    }
    return '';
  };

  const getDesignersForTeam = (teamId) => {
    return designers.filter(d =>
      d.allocations.some(a => a.productTeamId === teamId)
    );
  };

  const getPortfolioName = (portfolioId) => {
    return portfolios.find(p => p.id === portfolioId)?.name || 'Unknown';
  };

  const handleStartAdd = () => {
    setIsAdding(true);
    setNewName('');
    setNewPortfolioId(portfolios[0]?.id || '');
    setError('');
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
    setNewName('');
    setNewPortfolioId('');
    setError('');
  };

  const handleSaveAdd = () => {
    const validationError = validateTeam(newName);
    if (validationError) {
      setError(validationError);
      return;
    }
    if (!newPortfolioId) {
      setError('Portfolio is required');
      return;
    }
    addProductTeam({ name: newName.trim(), portfolioId: newPortfolioId });
    setIsAdding(false);
    setNewName('');
    setNewPortfolioId('');
    setError('');
  };

  const handleStartEdit = (team) => {
    setEditingId(team.id);
    setEditingName(team.name);
    setEditingPortfolioId(team.portfolioId);
    setError('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
    setEditingPortfolioId('');
    setError('');
  };

  const handleSaveEdit = () => {
    const validationError = validateTeam(editingName, editingId);
    if (validationError) {
      setError(validationError);
      return;
    }
    if (!editingPortfolioId) {
      setError('Portfolio is required');
      return;
    }
    updateProductTeam(editingId, {
      name: editingName.trim(),
      portfolioId: editingPortfolioId
    });
    setEditingId(null);
    setEditingName('');
    setEditingPortfolioId('');
    setError('');
  };

  const handleDeleteClick = (team) => {
    const assignedDesigners = getDesignersForTeam(team.id);
    if (assignedDesigners.length > 0) {
      setError(`Cannot delete ${team.name} - ${assignedDesigners.length} designers are currently allocated.\n\nTo delete this team:\n1. Go to Individual Designers page\n2. Find designers allocated to ${team.name}: ${assignedDesigners.map(d => d.name).join(', ')}\n3. Edit each designer and remove their allocation to this team\n4. Return here to delete the team`);
      return;
    }
    setDeleteConfirm(team);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirm) {
      deleteProductTeam(deleteConfirm.id);
      setDeleteConfirm(null);
    }
  };

  const getRowBackground = (team, index) => {
    if (editingId === team.id) return '#fffbeb';
    const portfolioIndex = portfolios.findIndex(p => p.id === team.portfolioId);
    return portfolioIndex % 2 === 0 ? '#ffffff' : '#f9fafb';
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
          + Add Product Team
        </KdsButton>
      </div>

      {productTeams.length === 0 && !isAdding ? (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          color: '#9ca3af',
          background: '#f9fafb',
          borderRadius: '4px'
        }}>
          No product teams yet. Click "+ Add Product Team" to create one.
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
                Team Name
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
                width: '200px'
              }}>
                Portfolio
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
                Designers Assigned
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
                    placeholder="Enter team name"
                    mask="none"
                  />
                </td>
                <td style={{ padding: '1rem' }}>
                  <MxSingleSelect
                    items={portfolios.map(p => p.name)}
                    value={getPortfolioName(newPortfolioId)}
                    emitOnlyValue
                    onValueUpdate={(e) => {
                      const portfolio = portfolios.find(p => p.name === e.detail);
                      if (portfolio) setNewPortfolioId(portfolio.id);
                    }}
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

            {sortedTeams.map((team, index) => {
              const assignedDesigners = getDesignersForTeam(team.id);
              const isEditing = editingId === team.id;

              return (
                <tr key={team.id} style={{
                  background: getRowBackground(team, index),
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  <td style={{ padding: '1rem' }}>
                    {isEditing ? (
                      <MxInputTextBox
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        mask="none"
                      />
                    ) : (
                      <span style={{ fontWeight: 600 }}>{team.name}</span>
                    )}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {isEditing ? (
                      <MxSingleSelect
                        items={portfolios.map(p => p.name)}
                        value={getPortfolioName(editingPortfolioId)}
                        emitOnlyValue
                        onValueUpdate={(e) => {
                          const portfolio = portfolios.find(p => p.name === e.detail);
                          if (portfolio) setEditingPortfolioId(portfolio.id);
                        }}
                      />
                    ) : (
                      <span style={{ color: '#6b7280' }}>
                        {getPortfolioName(team.portfolioId)}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '1rem', color: '#6b7280' }}>
                    <span title={assignedDesigners.map(d => d.name).join(', ')}>
                      {assignedDesigners.length} {assignedDesigners.length === 1 ? 'designer' : 'designers'}
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
                          onClick={() => handleStartEdit(team)}
                          disabled={isAdding || editingId !== null}
                        >
                          Edit
                        </KdsButton>
                        <KdsButton
                          kind="destructive"
                          variant="minimal"
                          onClick={() => handleDeleteClick(team)}
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

export default SettingsTeamsTab;
