import { store } from '../state.js';
import { createTaskElement } from './TaskItem.js';
import { triggerConfetti } from '../utils/confetti.js';

let previousRate = 0;

export function renderTaskList(container) {
  const filteredTasks = store.getFilteredTasks();
  const stats = store.getStats();

  // Celebration trigger when hitting 100% completion with at least 1 task
  if (stats.total > 0 && stats.completed === stats.total && previousRate < 100) {
    triggerConfetti();
  }
  previousRate = stats.rate;

  container.innerHTML = `
    <section class="task-list-section" aria-label="Task List">
      <ul class="task-list" id="task-list" data-testid="task-list" role="list"></ul>
    </section>
  `;

  const ul = container.querySelector('#task-list');

  if (filteredTasks.length === 0) {
    let emptyMsg = 'No tasks found';
    let subMsg = 'Add a new task above to begin your focused flow.';

    if (store.searchQuery.trim()) {
      emptyMsg = `No tasks matching "${escapeHtml(store.searchQuery)}"`;
      subMsg = 'Try clearing your search query or adjusting your filters.';
    } else if (store.statusFilter === 'active') {
      emptyMsg = 'All tasks completed!';
      subMsg = 'Outstanding work. Everything on your active list is done.';
    } else if (store.statusFilter === 'completed') {
      emptyMsg = 'No completed tasks yet';
      subMsg = 'Mark tasks as complete to see them in this view.';
    } else if (store.priorityFilter !== 'all') {
      emptyMsg = `No ${store.priorityFilter} priority tasks`;
      subMsg = 'Create one or change your priority filter above.';
    }

    ul.innerHTML = `
      <li class="empty-state" data-testid="empty-state">
        <div class="empty-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="9" y1="9" x2="15" y2="15"></line>
            <line x1="15" y1="9" x2="9" y2="15"></line>
          </svg>
        </div>
        <div class="empty-title">${emptyMsg}</div>
        <div class="empty-subtext">${subMsg}</div>
      </li>
    `;
    return;
  }

  filteredTasks.forEach((task) => {
    ul.appendChild(createTaskElement(task));
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
