import { store } from '../state.js';
import { playTactileClick } from '../utils/audio.js';
import { showToast } from './Toast.js';

export function renderFilterBar(container) {
  const allCount = store.tasks.length;
  const activeCount = store.tasks.filter((t) => !t.completed).length;
  const completedCount = store.tasks.filter((t) => t.completed).length;

  container.innerHTML = `
    <section class="filter-toolbar-box" aria-label="Task Filters and Search Toolbar">
      <div class="toolbar-header-row">
        <h2 class="toolbar-title">Today's Tasks</h2>
        <div class="toolbar-extra-actions">
          <button type="button" class="btn-utility" id="export-json-btn" title="Export tasks as JSON backup">
            &darr; Export
          </button>
          <button type="button" class="btn-utility" id="import-json-btn" title="Import tasks from JSON file">
            &uarr; Import
          </button>
          <input type="file" id="import-json-input" accept=".json" class="sr-only" aria-label="Upload tasks JSON file" />

          <button 
            type="button" 
            class="btn-utility" 
            id="clear-completed-btn" 
            data-testid="clear-completed-btn"
            ${completedCount === 0 ? 'disabled style="opacity: 0.4; cursor: not-allowed;"' : ''}
            title="Clear finished tasks"
          >
            Clear Completed
          </button>
        </div>
      </div>

      <!-- Search Bar -->
      <div class="ios-search-bar">
        <svg class="search-icon-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <label for="search-input" class="sr-only">Search tasks by title</label>
        <input 
          type="search" 
          id="search-input" 
          data-testid="search-input" 
          class="ios-search-input" 
          placeholder="Search tasks by title... (Press '/' to focus)" 
          value="${escapeHtml(store.searchQuery)}"
          autocomplete="off"
        />
      </div>

      <!-- Filter Controls: Status Tabs & Priority Dropdown -->
      <div class="filter-controls-row">
        <div class="status-tabs-wrap" role="tablist" aria-label="Filter tasks by status">
          <button 
            type="button" 
            role="tab" 
            id="filter-all" 
            data-testid="filter-all" 
            class="filter-tab-btn ${store.statusFilter === 'all' ? 'active' : ''}" 
            aria-selected="${store.statusFilter === 'all'}"
          >
            <span>All</span>
            <span class="pill-count-bubble">${allCount}</span>
          </button>

          <button 
            type="button" 
            role="tab" 
            id="filter-active" 
            data-testid="filter-active" 
            class="filter-tab-btn ${store.statusFilter === 'active' ? 'active' : ''}" 
            aria-selected="${store.statusFilter === 'active'}"
          >
            <span>Active</span>
            <span class="pill-count-bubble">${activeCount}</span>
          </button>

          <button 
            type="button" 
            role="tab" 
            id="filter-completed" 
            data-testid="filter-completed" 
            class="filter-tab-btn ${store.statusFilter === 'completed' ? 'active' : ''}" 
            aria-selected="${store.statusFilter === 'completed'}"
          >
            <span>Completed</span>
            <span class="pill-count-bubble">${completedCount}</span>
          </button>
        </div>

        <div style="display: flex; align-items: center; gap: 8px;">
          <label for="priority-filter" style="font-size: 0.82rem; font-weight: 600; color: #4b5563;">Priority:</label>
          <select id="priority-filter" data-testid="priority-filter" class="priority-dropdown-select" aria-label="Filter tasks by priority">
            <option value="all" ${store.priorityFilter === 'all' ? 'selected' : ''}>All Priorities</option>
            <option value="high" ${store.priorityFilter === 'high' ? 'selected' : ''}>High</option>
            <option value="medium" ${store.priorityFilter === 'medium' ? 'selected' : ''}>Medium</option>
            <option value="low" ${store.priorityFilter === 'low' ? 'selected' : ''}>Low</option>
          </select>
        </div>
      </div>
    </section>
  `;

  // Search input handler
  const searchInput = container.querySelector('#search-input');
  searchInput.addEventListener('input', (e) => {
    store.setSearchQuery(e.target.value);
  });

  // Status buttons
  container.querySelector('#filter-all').addEventListener('click', () => {
    store.setStatusFilter('all');
    playTactileClick('click');
  });

  container.querySelector('#filter-active').addEventListener('click', () => {
    store.setStatusFilter('active');
    playTactileClick('click');
  });

  container.querySelector('#filter-completed').addEventListener('click', () => {
    store.setStatusFilter('completed');
    playTactileClick('click');
  });

  // Priority dropdown
  const prioritySelect = container.querySelector('#priority-filter');
  prioritySelect.addEventListener('change', (e) => {
    store.setPriorityFilter(e.target.value);
    playTactileClick('click');
  });

  // Clear completed
  const clearBtn = container.querySelector('#clear-completed-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      const removed = store.clearCompleted();
      playTactileClick('delete');
      showToast(`Cleared ${removed} completed task${removed === 1 ? '' : 's'}`);
    });
  }

  // Export JSON
  const exportBtn = container.querySelector('#export-json-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(store.tasks, null, 2));
      const dlAnchorElem = document.createElement('a');
      dlAnchorElem.setAttribute("href", dataStr);
      dlAnchorElem.setAttribute("download", `focuslist_backup_${Date.now()}.json`);
      dlAnchorElem.click();
      showToast('Tasks exported as JSON');
    });
  }

  // Import JSON
  const importBtn = container.querySelector('#import-json-btn');
  const importInput = container.querySelector('#import-json-input');
  if (importBtn && importInput) {
    importBtn.addEventListener('click', () => importInput.click());
    importInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target.result);
          if (Array.isArray(imported) && imported.length > 0) {
            store.tasks = imported;
            store.notify();
            showToast(`Imported ${imported.length} tasks!`);
          } else {
            showToast('Invalid JSON file format');
          }
        } catch {
          showToast('Failed to parse JSON file');
        }
      };
      reader.readAsText(file);
    });
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
