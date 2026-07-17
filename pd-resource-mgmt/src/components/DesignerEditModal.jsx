import React, { useState, useEffect } from 'react';
import {
  MxModal,
  MxModalBody,
  MxInputTextBox,
  MxSingleSelect,
  KdsButton,
  KdsMessage,
  KdsIconTrash,
  KdsIconClose
} from 'react-mx-web-components';
import { useResource } from '../context/ResourceContext';

function DesignerEditModal({ designer, isOpen, onClose }) {
  const { productTeams, addDesigner, updateDesigner, deleteDesigner } = useResource();

  const [name, setName] = useState('');
  const [level, setLevel] = useState('PD');
  const [employmentStatus, setEmploymentStatus] = useState('FTE');
  const [allocations, setAllocations] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Initialize form when designer changes
  useEffect(() => {
    if (designer) {
      setName(designer.name);
      setLevel(designer.level);
      setEmploymentStatus(designer.employmentStatus);
      setAllocations(designer.allocations || []);
    } else {
      // Reset for new designer
      setName('');
      setLevel('PD');
      setEmploymentStatus('FTE');
      setAllocations([]);
    }
  }, [designer]);

  const totalAllocation = allocations.reduce((sum, a) => sum + a.percentage, 0);

  const handleSave = () => {
    if (!name.trim()) return;

    const designerData = {
      name: name.trim(),
      level,
      employmentStatus,
      allocations
    };

    if (designer) {
      updateDesigner(designer.id, designerData);
    } else {
      addDesigner(designerData);
    }

    onClose();
  };

  const handleDelete = () => {
    if (designer) {
      deleteDesigner(designer.id);
      onClose();
    }
  };

  const handleAddAllocation = () => {
    setAllocations([...allocations, { productTeamId: '', percentage: 0 }]);
  };

  const handleRemoveAllocation = (index) => {
    setAllocations(allocations.filter((_, i) => i !== index));
  };

  const handleAllocationChange = (index, field, value) => {
    const updated = [...allocations];
    updated[index] = { ...updated[index], [field]: value };
    setAllocations(updated);
  };

  if (!isOpen) return null;

  return (
    <>
      <MxModal
        isOpened={isOpen}
        headercontent={designer ? `Edit Designer - ${designer.name}` : 'Add Designer'}
        footerPrimaryButtonText="Save"
        footerPrimaryButtonDisabled={!name.trim()}
        footerSecondaryButtonText="Cancel"
        closeOnSecondaryButton
        onApplyClick={handleSave}
        onSecondaryClick={onClose}
        onModalClose={onClose}
        size="l"
      >
        <MxModalBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <MxInputTextBox
              label="Name"
              placeholder="e.g., Jane Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
              mask="none"
              required
            />

            <MxSingleSelect
              label="Level"
              items={['APD', 'PD', 'SPD']}
              value={level}
              emitOnlyValue
              onValueUpdate={(e) => setLevel(e.detail)}
            />

            <MxSingleSelect
              label="Employment Status"
              items={['FTE', 'SOW', 'SOW Koncert']}
              value={employmentStatus}
              emitOnlyValue
              onValueUpdate={(e) => setEmploymentStatus(e.detail)}
            />

            <div style={{ marginTop: '1rem' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.75rem'
              }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Team Allocations</h3>
                <KdsButton kind="secondary" variant="minimal" onClick={handleAddAllocation}>
                  + Add Allocation
                </KdsButton>
              </div>

              {allocations.map((allocation, index) => (
                <div key={index} style={{
                  display: 'flex',
                  gap: '0.75rem',
                  alignItems: 'flex-end',
                  marginBottom: '0.75rem',
                  padding: '0.75rem',
                  background: '#f9fafb',
                  borderRadius: '4px'
                }}>
                  <div style={{ flex: 2 }}>
                    <MxSingleSelect
                      label="Product Team"
                      items={['Select One', ...productTeams.map(t => t.name)]}
                      value={productTeams.find(t => t.id === allocation.productTeamId)?.name || 'Select One'}
                      emitOnlyValue
                      onValueUpdate={(e) => {
                        if (e.detail === 'Select One') return;
                        const team = productTeams.find(t => t.name === e.detail);
                        if (team) {
                          handleAllocationChange(index, 'productTeamId', team.id);
                        }
                      }}
                    />
                  </div>

                  <div style={{ flex: 1 }}>
                    <MxInputTextBox
                      label="Percentage"
                      value={allocation.percentage.toString()}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        handleAllocationChange(index, 'percentage', Math.max(0, Math.min(100, val)));
                      }}
                      mask="none"
                      type="number"
                    />
                  </div>

                  <KdsButton
                    kind="negative"
                    variant="minimal"
                    onClick={() => handleRemoveAllocation(index)}
                    style={{ marginBottom: '0.5rem' }}
                  >
                    <KdsIconClose size="s" />
                  </KdsButton>
                </div>
              ))}

              {allocations.length === 0 && (
                <div style={{
                  padding: '1.5rem',
                  textAlign: 'center',
                  color: '#9ca3af',
                  fontSize: '0.875rem',
                  background: '#f9fafb',
                  borderRadius: '4px'
                }}>
                  No allocations yet. Click "Add Allocation" to assign this designer to teams.
                </div>
              )}

              <div style={{
                marginTop: '1rem',
                padding: '0.75rem',
                background: totalAllocation === 100 ? '#f0fdf4' : '#fef3c7',
                borderRadius: '4px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Total Allocation:</span>
                <span style={{
                  fontWeight: 700,
                  fontSize: '1.125rem',
                  color: totalAllocation === 100 ? '#16a34a' : totalAllocation > 100 ? '#dc2626' : '#9ca3af'
                }}>
                  {totalAllocation}%
                </span>
              </div>

              {totalAllocation !== 100 && allocations.length > 0 && (
                <KdsMessage kind="warning" style={{ marginTop: '0.5rem' }}>
                  Allocations should total 100% for full capacity utilization
                </KdsMessage>
              )}
            </div>

            {designer && (
              <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                <KdsButton kind="destructive" variant="minimal" onClick={() => setShowDeleteConfirm(true)}>
                  <KdsIconTrash size="s" /> Delete Designer
                </KdsButton>
              </div>
            )}
          </div>
        </MxModalBody>
      </MxModal>

      <MxModal
        isOpened={showDeleteConfirm}
        headercontent="Delete Designer"
        footerPrimaryButtonText="Delete"
        footerPrimaryButtonKind="destructive"
        footerSecondaryButtonText="Cancel"
        closeOnSecondaryButton
        onApplyClick={handleDelete}
        onSecondaryClick={() => setShowDeleteConfirm(false)}
        onModalClose={() => setShowDeleteConfirm(false)}
      >
        <MxModalBody>
          <p>Are you sure you want to delete "{designer?.name}"? This action cannot be undone.</p>
        </MxModalBody>
      </MxModal>
    </>
  );
}

export default DesignerEditModal;
