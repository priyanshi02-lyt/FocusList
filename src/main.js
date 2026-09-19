import './styles/variables.css';
import './styles/base.css';
import './styles/components.css';
import './styles/utilities.css';

import { store } from './state.js';
import { renderStatsPanel } from './components/StatsPanel.js';
import { renderTaskForm } from './components/TaskForm.js';
import { renderFilterBar } from './components/FilterBar.js';
import { renderTaskList } from './components/TaskList.js';
import { setupTaskModal, openTaskModalForCreate } from './components/TaskModal.js';
import { playTactileClick, toggleSound } from './utils/audio.js';

function initApp() {
  const root = document.getElementById('app-root');
  if (!root) return;

  root.innerHTML = `
    <div class="app-master-container">
      <!-- Top Utility Header -->
      <header class="app-top-bar" role="banner">
        <div class="user-profile-group">
          <div class="avatar-circle" aria-hidden="true">
            <img 
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" 
              alt="Olivia Reed" 
              class="avatar-img" 
              onerror="this.style.display='none'"
            />
          </div>
          <div class="user-meta">
            <span class="greeting-text">Good Morning</span>
            <h1 class="user-name" style="font-size: 1.1rem; margin: 0;">Olivia Reed</h1>
          </div>
        </div>

        <div class="header-action-buttons">
          <button 
            type="button" 
            class="btn-circle-white" 
            id="audio-sound-toggle-btn" 
            aria-label="Toggle sound feedback"
            title="Sound Feedback: Enabled"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            </svg>
          </button>

          <button 
            type="button" 
            class="btn-circle-black" 
            id="header-create-task-btn" 
            aria-label="Create new task"
            title="Create Task"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        </div>
      </header>

      <!-- Main Dashboard Grid -->
      <main role="main" class="dashboard-grid">
        <!-- Left Column: Hero, Progress Card & Quick-Add Form -->
        <aside class="dashboard-sidebar" aria-label="Progress and Creation Sidebar">
          <div class="hero-typography-block">
            <div class="hero-line-1">Let's Make</div>
            <div class="hero-line-2">Today Productive</div>
          </div>

          <!-- 1. Today's Progress Card Mount -->
          <div id="stats-mount" aria-live="polite"></div>

          <!-- 2. Quick Task Creation Form Mount -->
          <div id="form-mount"></div>
        </aside>

        <!-- Right Column: Filters, Search, and Tasks List -->
        <section class="dashboard-main" aria-label="Task Management and Agenda">
          <!-- 3. Filters & Search Mount -->
          <div id="filter-mount"></div>

          <!-- 4. Tasks List Mount -->
          <div id="list-mount" aria-live="polite"></div>
        </section>
      </main>

      <!-- Footer -->
      <footer style="text-align: center; font-size: 0.76rem; color: var(--text-muted); margin-top: 20px;">
        FocusList &bull; Real-time LocalStorage Persistence &bull; WCAG AAA Compliant
      </footer>
    </div>
  `;

  // Pre-mount modal drawer for Screen 3
  setupTaskModal();

  // Attach header '+' button to modal
  const headerAddBtn = document.getElementById('header-create-task-btn');
  if (headerAddBtn) {
    headerAddBtn.addEventListener('click', () => {
      openTaskModalForCreate();
      playTactileClick('click');
    });
  }

  // Audio toggle
  const audioBtn = document.getElementById('audio-sound-toggle-btn');
  if (audioBtn) {
    audioBtn.addEventListener('click', () => {
      const active = toggleSound();
      audioBtn.title = active ? 'Sound Feedback: Enabled' : 'Sound Feedback: Muted';
      playTactileClick('click');
    });
  }

  // Mount components
  const statsMount = document.getElementById('stats-mount');
  const formMount = document.getElementById('form-mount');
  const filterMount = document.getElementById('filter-mount');
  const listMount = document.getElementById('list-mount');

  // Static mount for form so user typing is not wiped during background list re-renders
  if (formMount) {
    renderTaskForm(formMount);
  }

  const updateComponents = () => {
    if (statsMount) renderStatsPanel(statsMount);
    if (filterMount) renderFilterBar(filterMount);
    if (listMount) renderTaskList(listMount);
  };

  store.subscribe(updateComponents);
  updateComponents();

  // Global keyboard shortcuts
  window.addEventListener('keydown', (e) => {
    const isInputFocused = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);
    if (e.key === 'n' && !isInputFocused) {
      e.preventDefault();
      openTaskModalForCreate();
    } else if (e.key === '/' && !isInputFocused) {
      e.preventDefault();
      const searchInput = document.getElementById('search-input');
      if (searchInput) searchInput.focus();
    }
  });
}

// Bootstrap
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
