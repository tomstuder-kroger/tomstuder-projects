import React, { useState } from 'react';
import { MxModal, MxModalBody, KdsTabs } from 'react-mx-web-components';
import { useResource } from '../context/ResourceContext';
import SettingsCapacityTab from './SettingsCapacityTab';

function SettingsModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('capacity');

  const tabs = [
    { id: 'capacity', label: 'Capacity' },
    { id: 'rates', label: 'Rates' },
    { id: 'teams', label: 'Product Teams' },
    { id: 'portfolios', label: 'Portfolios' }
  ];

  return (
    <MxModal
      isOpened={isOpen}
      headercontent="Settings"
      footerSecondaryButtonText="Close"
      closeOnSecondaryButton
      onSecondaryClick={onClose}
      onModalClose={onClose}
      size="xl"
    >
      <MxModalBody>
        <KdsTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(e) => setActiveTab(e.detail)}
        />

        <div style={{ marginTop: '1.5rem' }}>
          {activeTab === 'capacity' && <SettingsCapacityTab />}
          {activeTab === 'rates' && <div>Rates tab placeholder</div>}
          {activeTab === 'teams' && <div>Teams tab placeholder</div>}
          {activeTab === 'portfolios' && <div>Portfolios tab placeholder</div>}
        </div>
      </MxModalBody>
    </MxModal>
  );
}

export default SettingsModal;
