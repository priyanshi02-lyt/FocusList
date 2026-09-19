import { store } from '../state.js';
import { playTactileClick } from '../utils/audio.js';

let selectedPriority = 'medium';

export function renderTaskForm(container) {
  container.innerHTML = `
    <section class="task-form-wrapper" aria-label="Create New Task">
      <form id="task-form" class="task-form" novalidate>
        <div class="form-row-main">
          <div class="input-group">
            <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="16"></line>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
            <label for="task-input" class="sr-only">Task Title</label>
            <input 
              type="text" 
              id="task-input" 
              name="taskTitle"
              data-testid="task-input" 
              class="task-input" 
              placeholder="What requires your focus next? (e.g., Deploy release v2.4)" 
              autocomplete="off"
              required
            />
          </div>

          <button type="submit" id="add-task-btn" data-testid="add-task-btn" class="btn-primary" aria-label="Add Task">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Add Task</span>
          </button>
        </div>

        <div class="form-row-sub">
          <div class="priority-selector-group" role="group" aria-label="Select Task Priority">
            <span class="field-label">Priority:</span>
            <div class="priority-chips">
              <button 
                type="button" 
                class="priority-chip" 
                data-priority="high" 
                data-active="${selectedPriority === 'high'}"
                data-testid="priority-btn-high"
                aria-pressed="${selectedPriority === 'high'}"
              >
                High
              </button>
              <button 
                type="button" 
                class="priority-chip" 
                data-priority="medium" 
                data-active="${selectedPriority === 'medium'}"
                data-testid="priority-btn-medium"
                aria-pressed="${selectedPriority === 'medium'}"
              >
                Medium
              </button>
              <button 
                type="button" 
                class="priority-chip" 
                data-priority="low" 
                data-active="${selectedPriority === 'low'}"
                data-testid="priority-btn-low"
                aria-pressed="${selectedPriority === 'low'}"
              >
                Low
              </button>
            </div>
          </div>

          <div class="form-hint">
            <span>Press</span>
            <kbd class="key-badge">Enter</kbd>
            <span>to add quickly</span>
          </div>
        </div>

        <div id="form-error" class="form-error" role="alert">Please enter a task title.</div>
      </form>
    </section>
  `;

  const form = container.querySelector('#task-form');
  const input = container.querySelector('#task-input');
  const errorMsg = container.querySelector('#form-error');
  const priorityChips = container.querySelectorAll('.priority-chip');

  // Priority chip selection handlers
  priorityChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      selectedPriority = chip.dataset.priority;
      priorityChips.forEach((c) => {
        const isActive = c.dataset.priority === selectedPriority;
        c.setAttribute('data-active', isActive);
        c.setAttribute('aria-pressed', isActive);
      });
      playTactileClick('click');
    });
  });

  // Form submission handler
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = input.value.trim();

    if (!title) {
      errorMsg.textContent = 'Please enter a task title before submitting.';
      errorMsg.classList.add('active');
      input.focus();
      return;
    }

    errorMsg.classList.remove('active');
    try {
      store.addTask(title, selectedPriority);
      playTactileClick('click');
      input.value = '';
      input.focus();
    } catch (err) {
      errorMsg.textContent = err.message || 'An error occurred.';
      errorMsg.classList.add('active');
    }
  });

  // Clear error on input
  input.addEventListener('input', () => {
    if (errorMsg.classList.contains('active')) {
      errorMsg.classList.remove('active');
    }
  });
}
