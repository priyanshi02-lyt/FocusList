import { store } from '../state.js';
import { playTactileClick } from '../utils/audio.js';
import { showToast } from './Toast.js';
import { openTaskModalForEdit } from './TaskModal.js';

export function createTaskElement(task) {
  const li = document.createElement('li');
  li.className = `task-card-ios ${task.completed ? 'completed' : ''}`;
  li.id = `task-${task.id}`;
  li.setAttribute('data-testid', 'task-item');
  li.setAttribute('data-id', task.id);
  li.setAttribute('data-priority', task.priority);

  const priorityLabel = task.priority === 'high' 
    ? 'High Priority' 
    : task.priority === 'medium' 
    ? 'Medium Priority' 
    : 'Low Priority';

  li.innerHTML = `
    <!-- Top Row: Priority Pill & Actions -->
    <div class="task-card-top-row">
      <span class="priority-pill-badge ${task.priority}" data-testid="task-priority">
        &bull; ${priorityLabel}
      </span>

      <div class="task-card-actions">
        <button 
          type="button" 
          class="btn-card-icon edit" 
          data-testid="task-edit-btn" 
          aria-label="Edit task '${escapeHtml(task.title)}'"
          title="Edit Task"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </button>

        <button 
          type="button" 
          class="btn-card-icon delete" 
          data-testid="task-delete-btn" 
          aria-label="Delete task '${escapeHtml(task.title)}'"
          title="Delete Task"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    </div>

    <!-- Title Row: Checkbox + Title -->
    <div class="task-card-title-row">
      <label class="task-checkbox-wrap" aria-label="Mark task '${escapeHtml(task.title)}' as ${task.completed ? 'pending' : 'completed'}">
        <input 
          type="checkbox" 
          class="task-checkbox-ios" 
          data-testid="task-checkbox" 
          ${task.completed ? 'checked' : ''}
          aria-checked="${task.completed}"
        />
      </label>
      <div style="flex: 1;">
        <div class="task-card-title" data-testid="task-title">${escapeHtml(task.title)}</div>
        ${task.description ? `<div style="font-size: 0.8rem; color: #64748b; margin-top: 4px;">${escapeHtml(task.description)}</div>` : ''}
      </div>
    </div>

    <!-- Bottom Row: Time Pill & Team Avatars -->
    <div class="task-card-bottom-row">
      <div class="task-time-pill">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        <span>${task.timeRange || formatRelativeTime(task.createdAt)}</span>
      </div>

      <div class="avatar-stack-mini" aria-hidden="true">
        <div class="avatar-stack-circle" style="background: #f87171;">OR</div>
        <div class="avatar-stack-circle" style="background: #60a5fa;">JD</div>
        <div class="avatar-stack-circle" style="background: #34d399;">+2</div>
      </div>
    </div>
  `;

  // Toggle completion
  const checkbox = li.querySelector('.task-checkbox-ios');
  checkbox.addEventListener('change', () => {
    const isCompleted = store.toggleTask(task.id);
    playTactileClick(isCompleted ? 'complete' : 'click');
  });

  // Edit task (opens edit modal matching Screen 3)
  const editBtn = li.querySelector('.btn-card-icon.edit');
  editBtn.addEventListener('click', () => {
    openTaskModalForEdit(task);
    playTactileClick('click');
  });

  // Delete task with Undo toast
  const deleteBtn = li.querySelector('.btn-card-icon.delete');
  deleteBtn.addEventListener('click', () => {
    store.deleteTask(task.id);
    playTactileClick('delete');
    showToast('Task removed', 'Undo', () => {
      store.restoreLastDeleted();
      playTactileClick('click');
    });
  });

  return li;
}

function formatRelativeTime(timestamp) {
  if (!timestamp) return '10:30 AM - 11:30 AM';
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
