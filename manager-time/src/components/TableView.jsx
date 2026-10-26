import React, { useState, useEffect, useRef } from 'react';
import { APP_CONFIG } from '../config/appConfig';
import { getEntries, deleteEntry, updateEntry, saveEntries } from '../utils/storage';
import { useNotification } from '../context/NotificationContext';
import { importCSVFile } from '../utils/csvImport';
import './TableView.css';

function TableView() {
  const { showSuccess, showError } = useNotification();

  const [entries, setEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Import ref
  const fileInputRef = useRef(null);

  // Filter visibility state
  const [showFilters, setShowFilters] = useState(true);

  // Filter state
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    taskType: '',
    category: '',
    portfolio: '',
    impact: '',
    roleExpectation: '',
    searchText: ''
  });

  // Sort state
  const [sortConfig, setSortConfig] = useState({
    key: 'date',
    direction: 'desc' // Most recent first by default
  });

  // Editing state
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Load entries on mount
  useEffect(() => {
    loadEntries();
  }, []);

  // Apply filters and sorting when entries or filters change
  useEffect(() => {
    applyFiltersAndSort();
    setCurrentPage(1); // Reset to first page when filters change
  }, [entries, filters, sortConfig]);

  function loadEntries() {
    const allEntries = getEntries();
    setEntries(allEntries);
  }

  function applyFiltersAndSort() {
    let result = [...entries];

    // Apply filters
    if (filters.dateFrom) {
      result = result.filter(e => e.date >= filters.dateFrom);
    }
    if (filters.dateTo) {
      result = result.filter(e => e.date <= filters.dateTo);
    }
    if (filters.taskType) {
      result = result.filter(e => e.taskType === filters.taskType);
    }
    if (filters.category) {
      result = result.filter(e => e.category === filters.category);
    }
    if (filters.portfolio) {
      result = result.filter(e => e.portfolio === filters.portfolio);
    }
    if (filters.impact) {
      result = result.filter(e => e.impact === filters.impact);
    }
    if (filters.roleExpectation) {
      result = result.filter(e => e.roleExpectations?.includes(filters.roleExpectation));
    }
    if (filters.searchText) {
      const search = filters.searchText.toLowerCase();
      result = result.filter(e =>
        e.notes?.toLowerCase().includes(search) ||
        e.taskType?.toLowerCase().includes(search) ||
        e.category?.toLowerCase().includes(search) ||
        JSON.stringify(e.customFields).toLowerCase().includes(search)
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      // Handle special cases
      if (sortConfig.key === 'date' || sortConfig.key === 'createdAt') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      } else if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal?.toLowerCase() || '';
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredEntries(result);
  }

  function handleSort(key) {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }

  function handleFilterChange(filterKey, value) {
    setFilters(prev => ({ ...prev, [filterKey]: value }));
  }

  function clearFilters() {
    setFilters({
      dateFrom: '',
      dateTo: '',
      taskType: '',
      category: '',
      portfolio: '',
      impact: '',
      roleExpectation: '',
      searchText: ''
    });
  }

  function toggleFilters() {
    setShowFilters(prev => !prev);
  }

  function handleSelectAll(checked) {
    // Calculate current page entries
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const currentPageEntries = filteredEntries.slice(start, end);
    const currentPageIds = currentPageEntries.map(e => e.id);

    if (checked) {
      // Select all on current page
      setSelectedIds(prev => [...new Set([...prev, ...currentPageIds])]);
    } else {
      // Deselect all on current page
      setSelectedIds(prev => prev.filter(id => !currentPageIds.includes(id)));
    }
  }

  function handleSelectOne(id, checked) {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(i => i !== id));
    }
  }

  function handleDelete(id) {
    if (confirm('Are you sure you want to delete this entry?')) {
      try {
        deleteEntry(id);
        loadEntries();
        setSelectedIds(prev => prev.filter(i => i !== id));
        showSuccess('Entry deleted successfully');
      } catch (error) {
        showError('Failed to delete entry. Please try again.');
        console.error('Error deleting entry:', error);
      }
    }
  }

  function handleBulkDelete() {
    if (selectedIds.length === 0) return;
    if (confirm(`Delete ${selectedIds.length} selected entries?`)) {
      try {
        selectedIds.forEach(id => deleteEntry(id));
        loadEntries();
        setSelectedIds([]);
        showSuccess(`${selectedIds.length} entries deleted successfully`);
      } catch (error) {
        showError('Failed to delete entries. Please try again.');
        console.error('Error bulk deleting entries:', error);
      }
    }
  }

  function startEdit(entry) {
    setEditingId(entry.id);
    setEditForm({ ...entry });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({});
  }

  function saveEdit() {
    try {
      updateEntry(editingId, editForm);
      loadEntries();
      setEditingId(null);
      setEditForm({});
      showSuccess('Entry updated successfully');
    } catch (error) {
      showError('Failed to update entry. Please try again.');
      console.error('Error updating entry:', error);
    }
  }

  function handleDuplicate(entry) {
    try {
      const { id, createdAt, updatedAt, ...entryData } = entry;
      const duplicateEntry = {
        ...entryData,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Add the duplicate entry
      const currentEntries = getEntries();
      currentEntries.push(duplicateEntry);
      currentEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      // Save entries
      saveEntries(currentEntries);

      // Reload entries to show the duplicate
      loadEntries();
      showSuccess('Entry duplicated successfully');
    } catch (error) {
      showError('Failed to duplicate entry. Please try again.');
      console.error('Error duplicating entry:', error);
    }
  }

  function exportToCSV() {
    const data = filteredEntries.map(entry => {
      const taskType = APP_CONFIG.taskTypes.find(t => t.id === entry.taskType);
      return {
        Date: entry.date,
        'Task Type': taskType?.label || entry.taskType,
        'Time (hours)': entry.time,
        Category: entry.category,
        'Task Code': entry.taskCode,
        Portfolio: entry.portfolio,
        Impact: entry.impact,
        'Role Expectations': entry.roleExpectations?.join('; ') || '',
        ...entry.customFields,
        Notes: entry.notes
      };
    });

    // Convert to CSV
    const headers = Object.keys(data[0] || {});
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(h => `"${String(row[h] ?? '').replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `time-entries-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  async function handleFileSelect(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const currentEntries = getEntries();

    // If there are existing entries, ask whether to replace or merge
    let shouldReplace = false;
    if (currentEntries.length > 0) {
      const userChoice = window.confirm(
        `You have ${currentEntries.length} existing entries.\n\n` +
        `Click OK to REPLACE all existing data.\n` +
        `Click Cancel to MERGE (add to existing data).`
      );
      shouldReplace = userChoice;
    }

    try {
      const results = await importCSVFile(file);

      if (results.entries.length === 0) {
        showError('No valid entries found in CSV file');
        if (results.errors.length > 0) {
          console.error('Import errors:', results.errors);
        }
        return;
      }

      // Replace or merge based on user choice
      let allEntries;
      if (shouldReplace) {
        allEntries = results.entries;
      } else {
        allEntries = [...currentEntries, ...results.entries];
      }

      // Sort by date (newest first)
      allEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      // Save to localStorage
      saveEntries(allEntries);

      // Reload entries
      loadEntries();

      // Show success message
      let message = shouldReplace
        ? `Replaced all data with ${results.entries.length} imported entries`
        : `Successfully imported ${results.entries.length} entries (total now: ${allEntries.length})`;

      const totalSkipped = (results.skipped || 0) + (results.skippedInfo || 0);

      if (totalSkipped > 0) {
        const parts = [];
        if (results.skippedInfo > 0) {
          parts.push(`${results.skippedInfo} informational rows`);
        }
        if (results.skipped > 0) {
          parts.push(`${results.skipped} errors`);
        }
        message += ` (${totalSkipped} skipped: ${parts.join(', ')})`;

        if (results.skipped > 0) {
          console.warn(`⚠️ ${results.skipped} rows had errors and were skipped. See details below:`);
          console.table(results.errors);
        }
        if (results.skippedInfo > 0) {
          console.info(`ℹ️ ${results.skippedInfo} informational rows (PTO, Notes) were skipped`);
        }
      }
      showSuccess(message);

      // Reset file input
      event.target.value = '';
    } catch (error) {
      showError(`Failed to import CSV: ${error.message}`);
      console.error('CSV import error:', error);
    }
  }

  function getTaskTypeLabel(taskTypeId) {
    const taskType = APP_CONFIG.taskTypes.find(t => t.id === taskTypeId);
    return taskType?.label || taskTypeId;
  }

  const totalHours = filteredEntries.reduce((sum, e) => sum + (e.time || 0), 0);

  // Pagination calculations
  const totalPages = Math.ceil(filteredEntries.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedEntries = filteredEntries.slice(startIndex, endIndex);

  function handlePageChange(page) {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }

  function handlePageSizeChange(newSize) {
    setPageSize(newSize);
    setCurrentPage(1); // Reset to first page when page size changes
  }

  return (
    <div className="table-view">
      <div className="table-header">
        <h2>Time Entries</h2>
        <div className="table-actions">
          {selectedIds.length > 0 && (
            <kds-button type="button" kind="danger" onClick={handleBulkDelete}>
              Delete Selected ({selectedIds.length})
            </kds-button>
          )}
          <button
            type="button"
            className="kds-Button kind-secondary palette-brand variant-border filter-toggle-button"
            onClick={toggleFilters}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          <kds-button type="button" kind="secondary" onClick={handleImportClick}>
            <kds-icon-upload size="s"></kds-icon-upload>
            Import CSV
          </kds-button>
          <kds-button type="button" kind="secondary" onClick={exportToCSV} disabled={filteredEntries.length === 0}>
            <kds-icon-download size="s"></kds-icon-download>
            Export CSV
          </kds-button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
      <div className="filter-section">
        <div className="filter-row">
          <div className="filter-group">
            <label htmlFor="filter-date-from" className="kds-Label">From Date</label>
            <input
              id="filter-date-from"
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="kds-Input"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="filter-date-to" className="kds-Label">To Date</label>
            <input
              id="filter-date-to"
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="kds-Input"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="filter-task-type" className="kds-Label">Task Type</label>
            <select
              id="filter-task-type"
              value={filters.taskType}
              onChange={(e) => handleFilterChange('taskType', e.target.value)}
              className="kds-Select"
            >
              <option value="">All</option>
              {APP_CONFIG.taskTypes.map(t => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="filter-category" className="kds-Label">Category</label>
            <select
              id="filter-category"
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="kds-Select"
            >
              <option value="">All</option>
              {APP_CONFIG.categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="filter-portfolio" className="kds-Label">Portfolio</label>
            <select
              id="filter-portfolio"
              value={filters.portfolio}
              onChange={(e) => handleFilterChange('portfolio', e.target.value)}
              className="kds-Select"
            >
              <option value="">All</option>
              {APP_CONFIG.portfolios.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="filter-impact" className="kds-Label">Impact</label>
            <select
              id="filter-impact"
              value={filters.impact}
              onChange={(e) => handleFilterChange('impact', e.target.value)}
              className="kds-Select"
            >
              <option value="">All</option>
              {APP_CONFIG.impacts.map(i => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="filter-role-expectation" className="kds-Label">Role Expectation</label>
            <select
              id="filter-role-expectation"
              value={filters.roleExpectation}
              onChange={(e) => handleFilterChange('roleExpectation', e.target.value)}
              className="kds-Select"
            >
              <option value="">All</option>
              {APP_CONFIG.roleExpectations.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="filter-search" className="kds-Label">Search</label>
            <input
              id="filter-search"
              type="text"
              value={filters.searchText}
              onChange={(e) => handleFilterChange('searchText', e.target.value)}
              placeholder="Search notes, fields..."
              className="kds-Input"
            />
          </div>

          <div className="filter-group">
            <label className="kds-Label">&nbsp;</label>
            <kds-button type="button" kind="secondary" onClick={clearFilters}>
              Clear All
            </kds-button>
          </div>
        </div>
      </div>
      )}

      {/* Summary Stats */}
      <div className="summary-stats">
        <div className="stat">
          <span className="stat-label">Total Entries:</span>
          <span className="stat-value">{filteredEntries.length}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Total Hours:</span>
          <span className="stat-value">{totalHours.toFixed(2)}</span>
        </div>
        {filteredEntries.length > 0 && (
          <div className="stat">
            <span className="stat-label">Avg Hours/Entry:</span>
            <span className="stat-value">{(totalHours / filteredEntries.length).toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="table-container">
        {filteredEntries.length === 0 ? (
          <div className="empty-state">
            <p>No entries found. {entries.length === 0 ? 'Create your first entry!' : 'Try adjusting your filters.'}</p>
          </div>
        ) : (
          <table className="time-entries-table">
            <thead>
              <tr>
                <th className="checkbox-col">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === paginatedEntries.length && paginatedEntries.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </th>
                <th onClick={() => handleSort('date')} className="sortable">
                  Date {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </th>
                <th onClick={() => handleSort('taskType')} className="sortable">
                  Task Type {sortConfig.key === 'taskType' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </th>
                <th onClick={() => handleSort('time')} className="sortable">
                  Time {sortConfig.key === 'time' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </th>
                <th onClick={() => handleSort('category')} className="sortable">
                  Category {sortConfig.key === 'category' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </th>
                <th>Task Code</th>
                <th>Portfolio</th>
                <th>Impact</th>
                <th>Role Expectations</th>
                <th>Notes</th>
                <th className="actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedEntries.map(entry => (
                <tr key={entry.id} className={selectedIds.includes(entry.id) ? 'selected' : ''}>
                  <td className="checkbox-col">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(entry.id)}
                      onChange={(e) => handleSelectOne(entry.id, e.target.checked)}
                    />
                  </td>
                  <td>{entry.date}</td>
                  <td>{getTaskTypeLabel(entry.taskType)}</td>
                  <td>{entry.time}h</td>
                  <td>{entry.category}</td>
                  <td>{entry.taskCode || '-'}</td>
                  <td>{entry.portfolio || '-'}</td>
                  <td>{entry.impact || '-'}</td>
                  <td>{entry.roleExpectations?.join('; ') || '-'}</td>
                  <td className="notes-col" title={entry.notes}>
                    {entry.notes ? (entry.notes.length > 50 ? entry.notes.substring(0, 50) + '...' : entry.notes) : '-'}
                  </td>
                  <td className="actions-col">
                    <div className="action-icons">
                      <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); startEdit(entry); }}
                        className="icon-button"
                        title="Edit"
                        aria-label="Edit entry"
                      >
                        <kds-icon-edit size="s" class="icon-edit"></kds-icon-edit>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); handleDuplicate(entry); }}
                        className="icon-button"
                        title="Duplicate"
                        aria-label="Duplicate entry"
                      >
                        <kds-icon-copy size="s" class="icon-copy"></kds-icon-copy>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); handleDelete(entry.id); }}
                        className="icon-button icon-button-danger"
                        title="Delete"
                        aria-label="Delete entry"
                      >
                        <kds-icon-trash size="s" class="icon-trash"></kds-icon-trash>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Controls - Bottom */}
      {filteredEntries.length > 0 && (
        <div className="pagination-controls">
          <div className="pagination-left">
            <label htmlFor="page-size" className="pagination-label">Rows per page:</label>
            <select
              id="page-size"
              value={pageSize}
              onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
              className="kds-Select pagination-select"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>

          <div className="pagination-center">
            <button
              type="button"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="pagination-btn"
              title="First page"
            >
              ⟪
            </button>
            <button
              type="button"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-btn"
              title="Previous page"
            >
              <kds-icon-caret-left size="s"></kds-icon-caret-left>
            </button>
            <span className="pagination-info">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="pagination-btn"
              title="Next page"
            >
              <kds-icon-caret-right size="s"></kds-icon-caret-right>
            </button>
            <button
              type="button"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="pagination-btn"
              title="Last page"
            >
              ⟫
            </button>
          </div>

          <div className="pagination-right">
            <span className="pagination-info">
              Rows {startIndex + 1} - {Math.min(endIndex, filteredEntries.length)} of {filteredEntries.length}
            </span>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingId && (
        <div className="edit-modal-overlay" onClick={cancelEdit}>
          <div className="edit-modal edit-modal-large" onClick={(e) => e.stopPropagation()}>
            <h3>Edit Time Entry</h3>
            <div className="edit-form">
              <div className="edit-form-grid">
                <div className="form-group">
                  <label className="kds-Label">Date *</label>
                  <input
                    type="date"
                    value={editForm.date || ''}
                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                    className="kds-Input"
                  />
                </div>

                <div className="form-group">
                  <label className="kds-Label">Time (hours) *</label>
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    max="24"
                    value={editForm.time || ''}
                    onChange={(e) => setEditForm({ ...editForm, time: parseFloat(e.target.value) })}
                    className="kds-Input"
                  />
                </div>

                <div className="form-group">
                  <label className="kds-Label">Task Type</label>
                  <select
                    value={editForm.taskType || ''}
                    onChange={(e) => setEditForm({ ...editForm, taskType: e.target.value })}
                    className="kds-Select"
                  >
                    <option value="">Select task type</option>
                    {APP_CONFIG.taskTypes.map(t => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="kds-Label">Category</label>
                  <select
                    value={editForm.category || ''}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="kds-Select"
                  >
                    <option value="">Select category</option>
                    {APP_CONFIG.categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="kds-Label">Portfolio</label>
                  <select
                    value={editForm.portfolio || ''}
                    onChange={(e) => setEditForm({ ...editForm, portfolio: e.target.value })}
                    className="kds-Select"
                  >
                    <option value="">Select portfolio</option>
                    {APP_CONFIG.portfolios.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="kds-Label">Impact</label>
                  <select
                    value={editForm.impact || ''}
                    onChange={(e) => setEditForm({ ...editForm, impact: e.target.value })}
                    className="kds-Select"
                  >
                    <option value="">Select impact</option>
                    {APP_CONFIG.impacts.map(i => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="kds-Label">Notes ({(editForm.notes || '').length}/200)</label>
                <textarea
                  value={editForm.notes || ''}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value.slice(0, 200) })}
                  className="kds-Textarea"
                  rows="3"
                  maxLength={200}
                />
              </div>

              <div className="modal-actions">
                <kds-button type="button" kind="secondary" onClick={cancelEdit}>
                  Cancel
                </kds-button>
                <kds-button type="button" kind="primary" onClick={saveEdit}>
                  Save Changes
                </kds-button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TableView;
