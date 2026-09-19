import { store } from '../state.js';
import { playTactileClick } from '../utils/audio.js';

let modalInstance = null;
let currentEditingId = null;
let currentPriority = 'medium';

export function setupTaskModal() {
  let modal = document.getElementById('task-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'task-modal';
    modal.className = 'modal-overlay-sheet';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'sheet-title-heading');

    modal.innerHTML = `
      <div class="modal-sheet-content">
        <!-- Header Bar: Close, Title, Check -->
        <div class="sheet-header-bar">
          <button type="button" class="btn-sheet-circle" id="sheet-close-btn" aria-label="Close modal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          <h2 id="sheet-title-heading" class="sheet-title">Add New Task</h2>

          <button type="button" class="btn-sheet-circle" id="sheet-header-submit-btn" aria-label="Save task">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </button>
        </div>

        <form id="sheet-task-form" novalidate>
          <!-- Task Title Input -->
          <div class="sheet-field-group">
            <label for="task-input" class="sheet-label">Task Title</label>
            <input 
              type="text" 
              id="task-input" 
              name="taskTitle"
              data-testid="task-input" 
              class="sheet-input-box" 
              placeholder="Finish landing page design" 
              autocomplete="off"
              required 
            />
            <div id="modal-form-error" style="font-size: 0.78rem; color: #dc2626; display: none; margin-top: 2px;">
              Please enter a task title.
            </div>
          </div>

          <!-- Description Input -->
          <div class="sheet-field-group" style="margin-top: 12px;">
            <label for="task-description-input" class="sheet-label">Description</label>
            <textarea 
              id="task-description-input" 
              class="sheet-input-box sheet-textarea" 
              placeholder="Design the new landing page for the product launch."
            ></textarea>
          </div>

          <!-- Due Date & Time -->
          <div class="sheet-field-group" style="margin-top: 12px;">
            <span class="sheet-label">Due Date & time</span>
            <div class="date-time-row">
              <div class="sheet-pill-readout">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <span id="sheet-date-text">April 14, 2026</span>
              </div>
              <div class="sheet-pill-readout">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span id="sheet-time-text">10:00 AM</span>
              </div>
            </div>
          </div>

          <!-- Priority Selector (Exact 3 buttons from Screen 3) -->
          <div class="sheet-field-group" style="margin-top: 12px;">
            <span class="sheet-label">Priority</span>
            <div class="priority-pill-selector-row" role="radiogroup" aria-label="Select priority">
              <button 
                type="button" 
                class="priority-select-pill low" 
                data-priority="low" 
                data-testid="priority-btn-low"
                role="radio" 
                aria-checked="false"
              >
                Low
              </button>
              <button 
                type="button" 
                class="priority-select-pill medium selected" 
                data-priority="medium" 
                data-testid="priority-btn-medium"
                role="radio" 
                aria-checked="true"
              >
                Medium
              </button>
              <button 
                type="button" 
                class="priority-select-pill high" 
                data-priority="high" 
                data-testid="priority-btn-high"
                role="radio" 
                aria-checked="false"
              >
                High
              </button>
            </div>
          </div>

          <!-- Project Dropdown -->
          <div class="sheet-field-group" style="margin-top: 12px;">
            <span class="sheet-label">Project</span>
            <div class="sheet-pill-readout" style="justify-content: space-between; cursor: pointer;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#6366f1" stroke="currentColor" stroke-width="1.5">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                </svg>
                <span style="color: #121417; font-weight: 600;">Website Redesign</span>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>

          <!-- Tags -->
          <div class="sheet-field-group" style="margin-top: 12px;">
            <span class="sheet-label">Tags</span>
            <div class="tags-row-modal">
              <span class="tag-badge-pill">Design &times;</span>
              <span class="tag-badge-pill">UI/UX &times;</span>
              <span class="tag-badge-pill">Work &times;</span>
              <button type="button" class="tag-badge-pill add-btn">+ Add</button>
            </div>
          </div>

          <!-- Bottom Pill Button: Create Task -->
          <button 
            type="submit" 
            id="add-task-btn" 
            data-testid="add-task-btn" 
            class="btn-create-task-pill"
          >
            Create Task
          </button>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    const form = modal.querySelector('#sheet-task-form');
    const input = modal.querySelector('#task-input');
    const descInput = modal.querySelector('#task-description-input');
    const errorEl = modal.querySelector('#modal-form-error');
    const closeBtn = modal.querySelector('#sheet-close-btn');
    const checkBtn = modal.querySelector('#sheet-header-submit-btn');
    const priorityPills = modal.querySelectorAll('.priority-select-pill');

    // Select Priority Pills
    priorityPills.forEach((pill) => {
      pill.addEventListener('click', () => {
        currentPriority = pill.dataset.priority;
        priorityPills.forEach((p) => {
          const isSelected = p.dataset.priority === currentPriority;
          p.classList.toggle('selected', isSelected);
          p.setAttribute('aria-checked', isSelected);
        });
        playTactileClick('click');
      });
    });

    const submitHandler = () => {
      const title = input.value.trim();
      if (!title) {
        errorEl.style.display = 'block';
        input.focus();
        return;
      }
      errorEl.style.display = 'none';

      if (currentEditingId) {
        // Edit mode
        store.editTask(currentEditingId, title, currentPriority);
      } else {
        // Create mode
        const newTask = store.addTask(title, currentPriority);
        if (descInput.value.trim()) {
          newTask.description = descInput.value.trim();
        }
      }

      playTactileClick('click');
      closeModal();
    };

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      submitHandler();
    });

    checkBtn.addEventListener('click', submitHandler);
    closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });

    input.addEventListener('input', () => {
      errorEl.style.display = 'none';
    });
  }

  modalInstance = modal;
}

export function openTaskModalForCreate() {
  setupTaskModal();
  currentEditingId = null;
  currentPriority = 'medium';

  const modal = modalInstance;
  const titleEl = modal.querySelector('#sheet-title-heading');
  const btnEl = modal.querySelector('#add-task-btn');
  const input = modal.querySelector('#task-input');
  const descInput = modal.querySelector('#task-description-input');
  const errorEl = modal.querySelector('#modal-form-error');

  titleEl.textContent = 'Add New Task';
  btnEl.textContent = 'Create Task';
  input.value = '';
  descInput.value = '';
  errorEl.style.display = 'none';

  // Reset priority buttons to medium
  modal.querySelectorAll('.priority-select-pill').forEach((p) => {
    const isMed = p.dataset.priority === 'medium';
    p.classList.toggle('selected', isMed);
    p.setAttribute('aria-checked', isMed);
  });

  modal.classList.add('active');
  setTimeout(() => input.focus(), 150);
}

export function openTaskModalForEdit(task) {
  setupTaskModal();
  currentEditingId = task.id;
  currentPriority = task.priority || 'medium';

  const modal = modalInstance;
  const titleEl = modal.querySelector('#sheet-title-heading');
  const btnEl = modal.querySelector('#add-task-btn');
  const input = modal.querySelector('#task-input');
  const descInput = modal.querySelector('#task-description-input');
  const errorEl = modal.querySelector('#modal-form-error');

  titleEl.textContent = 'Edit Task';
  btnEl.textContent = 'Save Changes';
  input.value = task.title;
  descInput.value = task.description || '';
  errorEl.style.display = 'none';

  modal.querySelectorAll('.priority-select-pill').forEach((p) => {
    const isSelected = p.dataset.priority === currentPriority;
    p.classList.toggle('selected', isSelected);
    p.setAttribute('aria-checked', isSelected);
  });

  modal.classList.add('active');
  setTimeout(() => input.focus(), 150);
}

export function closeModal() {
  if (modalInstance) {
    modalInstance.classList.remove('active');
  }
}
