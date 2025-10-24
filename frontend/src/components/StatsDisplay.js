import React from 'react';
import { Trophy } from 'lucide-react';

const StatsDisplay = ({ successCount, attemptCount }) => {
  const percentage = attemptCount > 0 ? Math.round((successCount / attemptCount) * 100) : 0;

  return (
    <div className="stats-container" data-testid="stats-display">
      <div className="flex items-center justify-center mb-3">
        <Trophy size={24} style={{ color: '#d4af37' }} />
      </div>
      <h3>Statistiques</h3>
      <div className="stat-item">
        <span>Réussites :</span>
        <span className="stat-value" data-testid="success-count">{successCount}</span>
      </div>
      <div className="stat-item">
        <span>Essais :</span>
        <span className="stat-value" data-testid="attempt-count">{attemptCount}</span>
      </div>
      <div className="stat-item">
        <span>Score :</span>
        <span className="stat-value" data-testid="percentage">{percentage}%</span>
      </div>
    </div>
  );
};

export default StatsDisplay;