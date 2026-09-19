import { store } from '../state.js';

export function renderStatsPanel(container) {
  const stats = store.getStats();
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (circumference * stats.rate) / 100;

  container.innerHTML = `
    <section class="progress-dark-card" aria-label="Today's Progress">
      <div class="progress-card-title">Today's Progress</div>
      <div class="progress-card-body">
        <div class="progress-ring-container" aria-label="Progress: ${stats.rate}%">
          <svg class="progress-ring-svg" viewBox="0 0 104 104">
            <circle 
              class="progress-ring-bg" 
              cx="52" 
              cy="52" 
              r="${radius}" 
            />
            <circle 
              class="progress-ring-circle" 
              cx="52" 
              cy="52" 
              r="${radius}" 
              stroke-dasharray="${circumference}" 
              stroke-dashoffset="${offset}" 
            />
          </svg>
          <div class="progress-ring-percent" id="completion-rate" data-testid="completion-rate">${stats.rate}%</div>
        </div>

        <div class="progress-stats-column">
          <!-- Stat 1: Total Tasks -->
          <div class="stat-item-row" data-testid="stat-card-total">
            <div class="stat-icon-wrap" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                <line x1="9" y1="9" x2="15" y2="9"></line>
                <line x1="9" y1="15" x2="15" y2="15"></line>
              </svg>
            </div>
            <div class="stat-text-val">
              <span class="stat-bold-number" id="total-tasks" data-testid="total-tasks">${stats.total}</span>
              <span>Total Task</span>
            </div>
          </div>

          <!-- Stat 2: Completed Tasks -->
          <div class="stat-item-row" data-testid="stat-card-completed">
            <div class="stat-icon-wrap" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <div class="stat-text-val">
              <span class="stat-bold-number" id="completed-tasks" data-testid="completed-tasks">${stats.completed}</span>
              <span>Completed Task</span>
            </div>
          </div>

          <!-- Stat 3: Pending Tasks -->
          <div class="stat-item-row" data-testid="stat-card-pending">
            <div class="stat-icon-wrap" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <div class="stat-text-val">
              <span class="stat-bold-number" id="pending-tasks" data-testid="pending-tasks">${stats.pending}</span>
              <span>Pending Task</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}
