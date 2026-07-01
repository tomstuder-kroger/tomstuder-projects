import React, { useState } from 'react';
import { ResourceProvider, useResource } from './context/ResourceContext';
import GlobalNavBar from './components/GlobalNavBar';
import DesignerGrid from './components/DesignerGrid';
import DesignerEditModal from './components/DesignerEditModal';
import TeamSummary from './components/TeamSummary';
import SettingsModal from './components/SettingsModal';
import './App.css';

function AppContent() {
  const [selectedDesigner, setSelectedDesigner] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { currentView } = useResource();

  const handleDesignerClick = (designer) => {
    setSelectedDesigner(designer);
    setEditModalOpen(true);
  };

  const handleAddClick = () => {
    setSelectedDesigner(null);
    setEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditModalOpen(false);
    setSelectedDesigner(null);
  };

  return (
    <div className="app-shell">
      <GlobalNavBar onSettingsClick={() => setSettingsOpen(true)} />

      <div className="app-container">
        {currentView === 'individual' && (
          <DesignerGrid
            onDesignerClick={handleDesignerClick}
            onAddClick={handleAddClick}
          />
        )}

        {currentView === 'summary' && (
          <TeamSummary />
        )}
      </div>

      <DesignerEditModal
        designer={selectedDesigner}
        isOpen={editModalOpen}
        onClose={handleCloseModal}
      />

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}

function App() {
  return (
    <ResourceProvider>
      <AppContent />
    </ResourceProvider>
  );
}

export default App;
