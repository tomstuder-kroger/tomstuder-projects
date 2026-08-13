import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { getInitialData } from '../data/placeholderData';
import { saveData, loadData } from '../utils/storage';

const ResourceContext = createContext();

export function useResource() {
  const context = useContext(ResourceContext);
  if (!context) {
    throw new Error('useResource must be used within ResourceProvider');
  }
  return context;
}

export function ResourceProvider({ children }) {
  // Initialize state from localStorage or placeholder data
  const [state, setState] = useState(() => {
    const stored = loadData();

    // Check if stored data has valid outcomes structure
    const hasValidOutcomes = stored?.outcomes && typeof stored.outcomes === 'object' &&
      Object.keys(stored.outcomes).length > 0 &&
      Object.keys(stored.outcomes).some(key => typeof stored.outcomes[key] === 'number');

    if (stored && hasValidOutcomes) {
      console.log('Loading from localStorage:', stored);
      return {
        designers: stored.designers || [],
        productTeams: stored.productTeams || [],
        portfolios: stored.portfolios || [],
        capacitySettings: stored.capacitySettings || {},
        outcomes: stored.outcomes || {},
        currentView: 'individual',
        filterLevel: null,
        filterStatus: null,
        filterPortfolio: null,
        sortBy: 'name'
      };
    }

    // If no valid stored data, use placeholder data
    console.log('No valid localStorage data, using placeholder data');
    const initial = getInitialData();
    console.log('Initial data loaded:', initial);
    return {
      ...initial,
      currentView: 'individual',
      filterLevel: null,
      filterStatus: null,
      filterPortfolio: null,
      sortBy: 'name'
    };
  });

  // Auto-save to localStorage whenever state changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      saveData({
        designers: state.designers,
        productTeams: state.productTeams,
        portfolios: state.portfolios,
        capacitySettings: state.capacitySettings,
        outcomes: state.outcomes
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [state.designers, state.productTeams, state.portfolios, state.capacitySettings, state.outcomes]);

  // Designer actions
  const addDesigner = useCallback((designer) => {
    const newDesigner = {
      id: uuidv4(),
      ...designer,
      allocations: designer.allocations || []
    };
    setState(prev => ({
      ...prev,
      designers: [...prev.designers, newDesigner]
    }));
  }, []);

  const updateDesigner = useCallback((id, updates) => {
    setState(prev => ({
      ...prev,
      designers: prev.designers.map(d =>
        d.id === id ? { ...d, ...updates } : d
      )
    }));
  }, []);

  const deleteDesigner = useCallback((id) => {
    setState(prev => ({
      ...prev,
      designers: prev.designers.filter(d => d.id !== id)
    }));
  }, []);

  // Product Team actions
  const addProductTeam = useCallback((team) => {
    const newTeam = {
      id: uuidv4(),
      ...team
    };
    setState(prev => ({
      ...prev,
      productTeams: [...prev.productTeams, newTeam]
    }));
  }, []);

  const updateProductTeam = useCallback((id, updates) => {
    setState(prev => ({
      ...prev,
      productTeams: prev.productTeams.map(t =>
        t.id === id ? { ...t, ...updates } : t
      )
    }));
  }, []);

  const deleteProductTeam = useCallback((id) => {
    setState(prev => ({
      ...prev,
      productTeams: prev.productTeams.filter(t => t.id !== id),
      // Remove allocations to this team from all designers
      designers: prev.designers.map(d => ({
        ...d,
        allocations: d.allocations.filter(a => a.productTeamId !== id)
      }))
    }));
  }, []);

  // Portfolio actions
  const addPortfolio = useCallback((portfolio) => {
    const newPortfolio = {
      id: uuidv4(),
      ...portfolio
    };
    setState(prev => ({
      ...prev,
      portfolios: [...prev.portfolios, newPortfolio]
    }));
  }, []);

  const updatePortfolio = useCallback((id, updates) => {
    setState(prev => ({
      ...prev,
      portfolios: prev.portfolios.map(p =>
        p.id === id ? { ...p, ...updates } : p
      )
    }));
  }, []);

  const deletePortfolio = useCallback((id) => {
    setState(prev => {
      // Check if any teams belong to this portfolio
      const hasTeams = prev.productTeams.some(t => t.portfolioId === id);
      if (hasTeams) {
        throw new Error('Cannot delete portfolio with teams');
      }

      return {
        ...prev,
        portfolios: prev.portfolios.filter(p => p.id !== id)
      };
    });
  }, []);

  // Settings actions
  const updateCapacitySettings = useCallback((settings) => {
    setState(prev => ({
      ...prev,
      capacitySettings: { ...prev.capacitySettings, ...settings }
    }));
  }, []);

  const updateOutcomes = useCallback((teamId, value) => {
    setState(prev => ({
      ...prev,
      outcomes: {
        ...prev.outcomes,
        [teamId]: value
      }
    }));
  }, []);

  // View actions
  const setCurrentView = useCallback((view) => {
    setState(prev => ({ ...prev, currentView: view }));
  }, []);

  const setFilters = useCallback(({ level, status, portfolio }) => {
    setState(prev => ({
      ...prev,
      filterLevel: level !== undefined ? level : prev.filterLevel,
      filterStatus: status !== undefined ? status : prev.filterStatus,
      filterPortfolio: portfolio !== undefined ? portfolio : prev.filterPortfolio
    }));
  }, []);

  const setSortBy = useCallback((sortBy) => {
    setState(prev => ({ ...prev, sortBy }));
  }, []);

  // Data management actions
  const exportData = useCallback(() => {
    const { exportToJSON } = require('../utils/storage');
    const today = new Date().toISOString().split('T')[0];
    exportToJSON(
      {
        designers: state.designers,
        productTeams: state.productTeams,
        portfolios: state.portfolios,
        capacitySettings: state.capacitySettings,
        outcomes: state.outcomes
      },
      `pd-resource-mgmt-backup-${today}`
    );
  }, [state]);

  const importData = useCallback(async (file) => {
    const { importFromJSON } = require('../utils/storage');
    const data = await importFromJSON(file);

    setState(prev => ({
      ...prev,
      designers: data.designers || [],
      productTeams: data.productTeams || [],
      portfolios: data.portfolios || [],
      capacitySettings: data.capacitySettings || prev.capacitySettings,
      outcomes: data.outcomes || {}
    }));
  }, []);

  const importFromCapacityApp = useCallback((icsData) => {
    if (!Array.isArray(icsData) || icsData.length === 0) {
      throw new Error('No valid IC data to import');
    }

    // Map IC role to Designer level with safe defaults
    const mapRoleToLevel = (icRole) => {
      const role = (icRole || '').toLowerCase().trim();
      if (role.includes('senior') || role.includes('spd')) return 'SPD';
      if (role.includes('associate') || role.includes('apd')) return 'APD';
      return 'PD'; // Default to mid-level
    };

    const newDesigners = [];
    const existingNames = new Set(
      state.designers.map(d => d.name.toLowerCase().trim())
    );

    icsData.forEach(ic => {
      // Validate IC has required fields
      if (!ic.icName || typeof ic.icName !== 'string') return;

      const nameLower = ic.icName.toLowerCase().trim();

      // Skip if designer already exists
      if (existingNames.has(nameLower)) return;

      // Create new designer with safe defaults
      newDesigners.push({
        id: uuidv4(),
        name: ic.icName,
        level: mapRoleToLevel(ic.icRole),
        employmentStatus: 'FTE', // Default to FTE
        allocations: [] // Start with no allocations - user will assign manually
      });
    });

    if (newDesigners.length === 0) {
      throw new Error('No new designers to import (all ICs already exist)');
    }

    setState(prev => ({
      ...prev,
      designers: [...prev.designers, ...newDesigners]
    }));

    return { count: newDesigners.length };
  }, [state.designers]);

  const resetToPlaceholder = useCallback(() => {
    const initial = getInitialData();
    setState(prev => ({
      ...prev,
      ...initial
    }));
  }, []);

  const value = {
    // State
    designers: state.designers,
    productTeams: state.productTeams,
    portfolios: state.portfolios,
    capacitySettings: state.capacitySettings,
    outcomes: state.outcomes,
    currentView: state.currentView,
    filterLevel: state.filterLevel,
    filterStatus: state.filterStatus,
    filterPortfolio: state.filterPortfolio,
    sortBy: state.sortBy,

    // Actions
    addDesigner,
    updateDesigner,
    deleteDesigner,
    addProductTeam,
    updateProductTeam,
    deleteProductTeam,
    addPortfolio,
    updatePortfolio,
    deletePortfolio,
    updateCapacitySettings,
    updateOutcomes,
    setCurrentView,
    setFilters,
    setSortBy,
    exportData,
    importData,
    importFromCapacityApp,
    resetToPlaceholder
  };

  return (
    <ResourceContext.Provider value={value}>
      {children}
    </ResourceContext.Provider>
  );
}
