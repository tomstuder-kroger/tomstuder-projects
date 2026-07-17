import React, { useState, useEffect } from 'react';
import { MxModal, MxModalBody, MxInputTextBox } from 'react-mx-web-components';
import { useResource } from '../context/ResourceContext';

function DesignerEditModalSimple({ designer, isOpen, onClose }) {
  const { addDesigner } = useResource();
  const [name, setName] = useState('');

  const handleSave = () => {
    if (!name.trim()) return;
    addDesigner({ name: name.trim(), level: 'PD', employmentStatus: 'FTE', allocations: [] });
    onClose();
  };

  return (
    <MxModal
      isOpened={isOpen}
      headercontent="Add Designer (Test)"
      footerPrimaryButtonText="Save"
      footerSecondaryButtonText="Cancel"
      closeOnSecondaryButton
      onApplyClick={handleSave}
      onSecondaryClick={onClose}
      onModalClose={onClose}
      size="m"
    >
      <MxModalBody>
        <MxInputTextBox
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          mask="none"
        />
      </MxModalBody>
    </MxModal>
  );
}

export default DesignerEditModalSimple;
