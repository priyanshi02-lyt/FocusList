import { store } from '../state.js';
import { playTactileClick } from '../utils/audio.js';
import { showToast } from './Toast.js';

export function createTaskElement(task) {
  const li = document.createElement('li');
  li.className = `task-card-ios ${task.completed ? 'completed' : ''}`;
  li.id = `task-${task.id}`;
  li.setAttribute('data-testid', 'task-item');
  li.setAttribute('data-id', task.id);
  li.setAttribute('data-priority', task.priority);

  let isEditing = false;

  const priorityCapitalized = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);

  const renderViewMode = () => {
    li.innerHTML = `
      <!-- Top Row: Priority Badge & Actions -->
      <div class="task-card-top-row">
        <span class="priority-pill-badge ${task.priority}" data-testid="task-priority">
          &bull; ${priorityCapitalized} Priority
        </span>

        <div class="task-card-actions">
          <button 
            type="button" 
            class="btn-card-action edit" 
            id="task-edit-${task.id}"
            data-testid="task-edit-btn" 
            aria-label="Edit task '${escapeHtml(task.title)}'"
            title="Edit Task"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            <span>Edit</span>
          </button>

          <button 
            type="button" 
            class="btn-card-action delete" 
            id="task-delete-${task.id}"
            data-testid="task-delete-btn" 
            aria-label="Delete task '${escapeHtml(task.title)}'"
            title="Delete Task"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            <span>Delete</span>
          </button>
        </div>
      </div>

      <!-- Title & Checkbox Row -->
      <div class="task-card-title-row">
        <input 
          type="checkbox" 
          id="task-checkbox-${task.id}"
          class="task-checkbox" 
          data-testid="task-checkbox" 
          ${task.completed ? 'checked' : ''}
          aria-checked="${task.completed}"
          aria-label="Toggle completion of '${escapeHtml(task.title)}'"
        />
        <div style="flex: 1;">
          <span class="task-card-title" data-testid="task-title">${escapeHtml(task.title)}</span>
          ${task.description ? `<div style="font-size: 0.8rem; color: #6b7280; margin-top: 4px;">${escapeHtml(task.description)}</div>` : ''}
        </div>
      </div>

      <!-- Bottom Meta Row -->
      <div class="task-card-bottom-row">
        <div class="task-time-pill">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span>${task.timeRange || formatRelativeTime(task.createdAt)}</span>
        </div>

        <div style="font-size: 0.75rem; color: #9ca3af;">
          Status: <strong style="color: ${task.completed ? '#10b981' : '#f59e0b'};">${task.completed ? 'Completed' : 'Active'}</strong>
        </div>
      </div>
    `;

    // Checkbox click
    const checkbox = li.querySelector('.task-checkbox');
    checkbox.addEventListener('change', () => {
      const isCompleted = store.toggleTask(task.id);
      playTactileClick(isCompleted ? 'complete' : 'click');
    });

    // Edit button click
    const editBtn = li.querySelector('.btn-card-action.edit');
    editBtn.addEventListener('click', () => {
      isEditing = true;
      renderEditMode();
      playTactileClick('click');
    });

    // Delete button click
    const deleteBtn = li.querySelector('.btn-card-action.delete');
    deleteBtn.addEventListener('click', () => {
      store.deleteTask(task.id);
      playTactileClick('delete');
      showToast('Task removed', 'Undo', () => {
        store.restoreLastDeleted();
        playTactileClick('click');
      });
    });
  };

  const renderEditMode = () => {
    li.innerHTML = `
      <form class="inline-edit-form" novalidate>
        <label for="edit-input-${task.id}" style="font-size: 0.82rem; font-weight: 600; color: #121417;">Edit Task Title:</label>
        <input 
          type="text" 
          id="edit-input-${task.id}"
          data-testid="task-edit-input" 
          class="inline-edit-input" 
          value="${escapeHtml(task.title)}" 
          required
        />
        <div class="inline-edit-controls">
          <div style="display: flex; align-items: center; gap: 6px;">
            <label for="edit-priority-${task.id}" style="font-size: 0.8rem; font-weight: 600; color: #4b5563;">Priority:</label>
            <select id="edit-priority-${task.id}" data-testid="task-edit-priority" class="priority-dropdown-select" style="height: 32px; font-size: 0.8rem;">
              <option value="high" ${task.priority === 'high' ? 'selected' : ''}>High</option>
              <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>Medium</option>
              <option value="low" ${task.priority === 'low' ? 'selected' : ''}>Low</option>
            </select>
          </div>

          <div style="display: flex; align-items: center; gap: 6px;">
            <button type="submit" class="btn-save-inline" data-testid="task-save-btn">Save</button>
            <button type="button" class="btn-cancel-inline" data-testid="task-cancel-btn">Cancel</button>
          </div>
        </div>
      </form>
    `;

    const editForm = li.querySelector('.inline-edit-form');
    const editInput = li.querySelector('.inline-edit-input');
    const editPriority = li.querySelector('.priority-dropdown-select');
    const cancelBtn = li.querySelector('.btn-cancel-inline');

    editInput.focus();
    editInput.setSelectionRange(editInput.value.length, editInput.value.length);

    editForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const updated = editInput.value.trim();
      if (!updated) return;
      store.editTask(task.id, updated, editPriority.value);
      isEditing = false;
      playTactileClick('click');
    });

    cancelBtn.addEventListener('click', () => {
      isEditing = false;
      renderViewMode();
      playTactileClick('click');
    });

    editInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        isEditing = false;
        renderViewMode();
      }
    });
  };

  renderViewMode();
  return li;
}

function formatRelativeTime(timestamp) {
  if (!timestamp) return 'Today, 10:30 AM';
  const diff = Date.now() - timestamp;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return 'Today, Just now';
  if (hours < 24) return `Today, ${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
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
