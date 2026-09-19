import { store } from '../state.js';
import { playTactileClick } from '../utils/audio.js';

let selectedPriority = 'medium';

export function renderTaskForm(container) {
  container.innerHTML = `
    <section class="quick-add-card" aria-label="Task Creation Form">
      <h3 class="form-title">Create New Task</h3>
      <form id="task-form" data-testid="task-form" novalidate>
        <div class="quick-add-input-row">
          <label for="task-input" class="sr-only">Task Title</label>
          <input 
            type="text" 
            id="task-input" 
            name="taskTitle"
            data-testid="task-input" 
            class="quick-task-input" 
            placeholder="What requires your focus next? (e.g., Deploy release v2.4)" 
            autocomplete="off"
            required
          />
          <button type="submit" id="add-task-btn" data-testid="add-task-btn" class="btn-add-submit">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Add Task</span>
          </button>
        </div>

        <div class="form-priority-selector">
          <div class="priority-btn-group" role="radiogroup" aria-label="Task Priority">
            <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted); margin-right: 4px;">Priority:</span>
            <button 
              type="button" 
              class="priority-choice-btn low ${selectedPriority === 'low' ? 'active' : ''}" 
              data-priority="low" 
              data-testid="priority-btn-low"
              role="radio"
              aria-checked="${selectedPriority === 'low'}"
            >
              Low
            </button>
            <button 
              type="button" 
              class="priority-choice-btn medium ${selectedPriority === 'medium' ? 'active' : ''}" 
              data-priority="medium" 
              data-testid="priority-btn-medium"
              role="radio"
              aria-checked="${selectedPriority === 'medium'}"
            >
              Medium
            </button>
            <button 
              type="button" 
              class="priority-choice-btn high ${selectedPriority === 'high' ? 'active' : ''}" 
              data-priority="high" 
              data-testid="priority-btn-high"
              role="radio"
              aria-checked="${selectedPriority === 'high'}"
            >
              High
            </button>
          </div>

          <div style="font-size: 0.75rem; color: var(--text-muted);">
            Press <kbd style="padding: 1px 5px; background: #f3f4f6; border-radius: 4px; font-family: monospace;">Enter</kbd> to add
          </div>
        </div>

        <div id="form-error" style="font-size: 0.8rem; color: #dc2626; display: none; margin-top: 4px;" role="alert">
          Please enter a task title.
        </div>
      </form>
    </section>
  `;

  const form = container.querySelector('#task-form');
  const input = container.querySelector('#task-input');
  const errorMsg = container.querySelector('#form-error');
  const buttons = container.querySelectorAll('.priority-choice-btn');

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      selectedPriority = btn.dataset.priority;
      buttons.forEach((b) => {
        const isMatch = b.dataset.priority === selectedPriority;
        b.classList.toggle('active', isMatch);
        b.setAttribute('aria-checked', isMatch);
      });
      playTactileClick('click');
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = input.value.trim();
    if (!title) {
      errorMsg.textContent = 'Please enter a task title before submitting.';
      errorMsg.style.display = 'block';
      input.focus();
      return;
    }

    errorMsg.style.display = 'none';
    try {
      store.addTask(title, selectedPriority);
      playTactileClick('click');
      input.value = '';
      input.focus();
    } catch (err) {
      errorMsg.textContent = err.message || 'An error occurred.';
      errorMsg.style.display = 'block';
    }
  });

  input.addEventListener('input', () => {
    errorMsg.style.display = 'none';
  });
}
