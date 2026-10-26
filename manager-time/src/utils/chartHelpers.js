/**
 * Chart.js helpers and utilities for Manager Time Logger Dashboard
 * Includes KDS color palette, default chart configuration, and data aggregation functions
 */

// ============================================================================
// KDS COLOR PALETTE
// ============================================================================

export const KDS_COLORS = {
  brand: {
    primary: '#0066cc',      // blue
    secondary: '#003d7a',    // dark blue
    light: '#e3f2fd'         // light blue
  },
  category: {
    positive: '#2e7d32',     // green
    negative: '#d32f2f',     // red
    informative: '#00a3e0',  // light blue
    special: '#6a0dad',      // purple
    neutral: '#666'          // gray
  },
  chart: [
    '#0066cc', // blue (brand primary)
    '#2e7d32', // green (positive)
    '#6a0dad', // purple (special)
    '#00a3e0', // light blue (informative)
    '#ff9800', // orange (warning)
    '#e91e63', // pink (accent)
    '#9c27b0', // purple (alternate)
    '#00bcd4', // cyan
    '#4caf50', // light green
    '#ff5722', // deep orange
    '#607d8b'  // blue gray
  ]
};

// ============================================================================
// CHART.JS DEFAULT CONFIGURATION
// ============================================================================

export const CHART_DEFAULTS = {
  font: {
    family: "'Kroger Sans', 'Helvetica Neue', Arial, sans-serif",
    size: 14
  },
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: '#333',
        font: {
          family: "'Kroger Sans', 'Helvetica Neue', Arial, sans-serif"
        }
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#fff',
      bodyColor: '#fff',
      borderColor: '#ccc',
      borderWidth: 1
    }
  }
};

// ============================================================================
// DATA AGGREGATION FUNCTIONS
// ============================================================================

/**
 * Sum hours by task type
 * @param {Array} entries - Array of time entries
 * @returns {Object} Object with task type IDs as keys and total hours as values
 */
export function sumByTaskType(entries) {
  return entries.reduce((acc, entry) => {
    acc[entry.taskType] = (acc[entry.taskType] || 0) + entry.time;
    return acc;
  }, {});
}

/**
 * Sum hours by impact level
 * @param {Array} entries - Array of time entries
 * @returns {Object} Object with impact levels (High, Medium, Low) as keys and total hours as values
 */
export function sumByImpactLevel(entries) {
  return entries.reduce((acc, entry) => {
    const impact = entry.impact || '¯\\_(ツ)_/¯';
    acc[impact] = (acc[impact] || 0) + entry.time;
    return acc;
  }, {});
}

/**
 * Sum hours by day of week (total hours per day, not grouped by task type)
 * @param {Array} entries - Array of time entries
 * @returns {Object} Object with day names as keys and total hours as values
 */
export function sumByDayOfWeek(entries) {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const result = {
    Sunday: 0,
    Monday: 0,
    Tuesday: 0,
    Wednesday: 0,
    Thursday: 0,
    Friday: 0,
    Saturday: 0
  };

  entries.forEach(entry => {
    // Parse YYYY-MM-DD format without timezone conversion
    const [year, month, day] = entry.date.split('-').map(Number);
    // Create date at local midnight (not UTC) to avoid timezone shifts
    const date = new Date(year, month - 1, day);
    const dayIndex = date.getDay();
    const dayName = dayNames[dayIndex];
    result[dayName] += entry.time;
  });

  return result;
}

/**
 * Calculate Meeting vs Focus Time split
 * Categorizes task types into three groups and sums hours
 * @param {Array} entries - Array of time entries
 * @returns {Object} Object with { meetings, focusTime, admin } keys and hours as values
 */
export function getMeetingVsFocusTimeSplit(entries) {
  const meetingTypes = ['1on1-meeting', 'standup', 'ktd-town-hall', 'manager-responsibilities'];
  const focusTypes = ['focus-time', 'learning-dev', 'side-of-desk'];
  const adminTypes = ['admin-emails', 'admin-planning', 'admin-time-entry', 'it-support'];

  let meetings = 0;
  let focusTime = 0;
  let admin = 0;

  entries.forEach(entry => {
    if (meetingTypes.includes(entry.taskType)) {
      meetings += entry.time;
    } else if (focusTypes.includes(entry.taskType)) {
      focusTime += entry.time;
    } else if (adminTypes.includes(entry.taskType)) {
      admin += entry.time;
    }
  });

  return { meetings, focusTime, admin };
}

/**
 * Calculate summary statistics for entries
 * @param {Array} entries - Array of time entries
 * @returns {Object} Object with totalHours, entryCount, avgPerEntry, highImpactPercent
 */
export function calculateSummaryStats(entries) {
  if (entries.length === 0) {
    return {
      totalHours: 0,
      entryCount: 0,
      avgPerEntry: 0,
      highImpactPercent: 0,
      highImpactHours: 0
    };
  }

  const totalHours = entries.reduce((sum, entry) => sum + entry.time, 0);
  const entryCount = entries.length;
  const avgPerEntry = totalHours / entryCount;

  const highImpactHours = entries
    .filter(entry => entry.impact === 'High')
    .reduce((sum, entry) => sum + entry.time, 0);
  const highImpactPercent = (highImpactHours / totalHours) * 100;

  return {
    totalHours: Math.round(totalHours * 10) / 10, // Round to 1 decimal
    entryCount,
    avgPerEntry: Math.round(avgPerEntry * 10) / 10,
    highImpactPercent: Math.round(highImpactPercent),
    highImpactHours: Math.round(highImpactHours * 10) / 10
  };
}

/**
 * Get task type label from ID (helper for chart labels)
 * Maps task type IDs to human-readable labels
 * @param {String} taskTypeId - Task type ID
 * @returns {String} Human-readable task type label
 */
export function getTaskTypeLabel(taskTypeId) {
  const labelMap = {
    '1on1-meeting': '1:1 Meeting',
    'standup': 'Standup',
    'focus-time': 'Focus Time',
    'learning-dev': 'Learning & Development',
    'admin-emails': 'Admin - Emails',
    'admin-planning': 'Admin - Planning',
    'admin-time-entry': 'Admin - Time Entry',
    'manager-responsibilities': 'Manager Responsibilities',
    'ktd-town-hall': 'KTD Town Hall',
    'side-of-desk': 'Side of Desk Work',
    'it-support': 'IT Support'
  };

  return labelMap[taskTypeId] || taskTypeId;
}

/**
 * Get color for a specific task type (for consistency across charts)
 * @param {String} taskTypeId - Task type ID
 * @param {Number} index - Index in the task type list (for fallback coloring)
 * @returns {String} Hex color code
 */
export function getTaskTypeColor(taskTypeId, index = 0) {
  // Could add task-type-specific colors here if desired
  // For now, use consistent cycling through KDS palette
  return KDS_COLORS.chart[index % KDS_COLORS.chart.length];
}

/**
 * Sum hours by role expectation
 * Handles multi-select field: if entry has multiple role expectations,
 * its time is counted toward each one
 * @param {Array} entries - Array of time entries
 * @returns {Object} Object with role expectations as keys and total hours as values
 */
export function sumByRoleExpectation(entries) {
  const result = {};

  entries.forEach(entry => {
    if (entry.roleExpectations && Array.isArray(entry.roleExpectations)) {
      // Distribute time across each role expectation this entry contributes to
      entry.roleExpectations.forEach(expectation => {
        result[expectation] = (result[expectation] || 0) + entry.time;
      });
    }
  });

  return result;
}
