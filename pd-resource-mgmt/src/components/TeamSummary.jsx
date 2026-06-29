import React from 'react';
import { useResource } from '../context/ResourceContext';

function TeamSummary() {
  const {
    designers,
    productTeams,
    portfolios,
    outcomes,
    capacitySettings,
    updateOutcomes
  } = useResource();

  return (
    <div className="team-summary-page">
      <div className="page-footnote">
        *ROI and cost values represent Product Design resources only.
      </div>
    </div>
  );
}

export default TeamSummary;
