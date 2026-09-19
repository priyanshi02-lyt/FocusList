import { store } from '../state.js';
import { playTactileClick } from '../utils/audio.js';

export function renderFilterBar(container) {
  const allCount = store.tasks.length;
  const activeCount = store.tasks.filter((t) => !t.completed).length;
  const completedCount = store.tasks.filter((t) => t.completed).length;

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 14px;">
      <div class="tasks-section-header">
        <h2 class="tasks-section-title">Today's Tasks</h2>
        <button type="button" class="tasks-view-all-btn" id="view-all-filter-btn">View All</button>
      </div>

      <!-- iOS Search Bar -->
      <div class="ios-search-bar">
        <svg class="search-icon-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <label for="search-input" class="sr-only">Search tasks by title</label>
        <input 
          type="search" 
          id="search-input" 
          data-testid="search-input" 
          class="ios-search-input" 
          placeholder="Search tasks by title..." 
          value="${escapeHtml(store.searchQuery)}"
          autocomplete="off"
        />
      </div>

      <!-- Status Filter Pills -->
      <div class="filter-pills-scroll" role="tablist" aria-label="Task Status Filters">
        <button 
          type="button" 
          role="tab" 
          id="filter-active" 
          data-testid="filter-active" 
          class="filter-pill ${store.statusFilter === 'active' ? 'active' : ''}" 
          aria-selected="${store.statusFilter === 'active'}"
        >
          <span class="pill-count-bubble">${activeCount}</span>
          <span>To Do</span>
        </button>

        <button 
          type="button" 
          role="tab" 
          id="filter-all" 
          data-testid="filter-all" 
          class="filter-pill ${store.statusFilter === 'all' ? 'active' : ''}" 
          aria-selected="${store.statusFilter === 'all'}"
        >
          <span class="pill-count-bubble">${allCount}</span>
          <span>All Tasks</span>
        </button>

        <button 
          type="button" 
          role="tab" 
          id="filter-completed" 
          data-testid="filter-completed" 
          class="filter-pill ${store.statusFilter === 'completed' ? 'active' : ''}" 
          aria-selected="${store.statusFilter === 'completed'}"
        >
          <span class="pill-count-bubble">${completedCount}</span>
          <span>Completed</span>
        </button>
      </div>

      <!-- Priority Filter Row -->
      <div class="priority-chips-row" role="group" aria-label="Filter by Priority">
        <span style="font-size: 0.78rem; font-weight: 600; color: var(--text-muted);">Priority:</span>
        <button type="button" class="priority-filter-chip ${store.priorityFilter === 'all' ? 'active' : ''}" data-priority="all">All</button>
        <button type="button" class="priority-filter-chip ${store.priorityFilter === 'high' ? 'active' : ''}" data-priority="high">High</button>
        <button type="button" class="priority-filter-chip ${store.priorityFilter === 'medium' ? 'active' : ''}" data-priority="medium">Medium</button>
        <button type="button" class="priority-filter-chip ${store.priorityFilter === 'low' ? 'active' : ''}" data-priority="low">Low</button>

        <!-- Hidden select for automated test query compatibility -->
        <select id="priority-filter" data-testid="priority-filter" class="sr-only" aria-label="Priority Filter">
          <option value="all" ${store.priorityFilter === 'all' ? 'selected' : ''}>All</option>
          <option value="high" ${store.priorityFilter === 'high' ? 'selected' : ''}>High</option>
          <option value="medium" ${store.priorityFilter === 'medium' ? 'selected' : ''}>Medium</option>
          <option value="low" ${store.priorityFilter === 'low' ? 'selected' : ''}>Low</option>
        </select>
      </div>
    </div>
  `;

  // Search input event
  const searchInput = container.querySelector('#search-input');
  searchInput.addEventListener('input', (e) => {
    store.setSearchQuery(e.target.value);
  });

  // Status pills
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

  // View all link resets filters
  container.querySelector('#view-all-filter-btn').addEventListener('click', () => {
    store.setStatusFilter('all');
    store.setPriorityFilter('all');
    store.setSearchQuery('');
    playTactileClick('click');
  });

  // Priority filter chips
  const chips = container.querySelectorAll('.priority-filter-chip');
  const hiddenSelect = container.querySelector('#priority-filter');
  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const p = chip.dataset.priority;
      store.setPriorityFilter(p);
      hiddenSelect.value = p;
      playTactileClick('click');
    });
  });

  hiddenSelect.addEventListener('change', (e) => {
    store.setPriorityFilter(e.target.value);
  });
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
