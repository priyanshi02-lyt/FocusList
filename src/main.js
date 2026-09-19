import './styles/variables.css';
import './styles/base.css';
import './styles/components.css';
import './styles/utilities.css';

import { store } from './state.js';
import { renderStatsPanel } from './components/StatsPanel.js';
import { renderFilterBar } from './components/FilterBar.js';
import { renderTaskList } from './components/TaskList.js';
import { setupTaskModal, openTaskModalForCreate } from './components/TaskModal.js';
import { playTactileClick } from './utils/audio.js';

function initApp() {
  const root = document.getElementById('app-root');
  if (!root) return;

  // Mount the entire phone mockup frame with iOS styling matching user photo
  root.innerHTML = `
    <div class="device-showcase-wrap">
      <div class="phone-frame">
        <!-- iOS Status Notch Bar -->
        <div class="phone-notch-bar" aria-hidden="true">
          <span class="notch-time">11:30</span>
          <div class="notch-island"></div>
          <div class="notch-icons">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4.35 19.4c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l1.9-1.9C9.33 19.67 10.61 20 12 20c4.97 0 9-4.03 9-9s-4.03-9-9-9z"/>
            </svg>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 4C7.31 4 3.07 5.9 0 8.98L12 21 24 8.98C20.93 5.9 16.69 4 12 4z"/>
            </svg>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <rect x="2" y="7" width="18" height="10" rx="3" fill="none" stroke="currentColor" stroke-width="2"/>
              <rect x="4" y="9" width="12" height="6" rx="1.5"/>
              <path d="M22 11v2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
        </div>

        <!-- Scrollable Screen Content Area -->
        <div class="screen-scroll-area" id="screen-scroll">
          <!-- 1. User Header: Good Morning, Olivia Reed + Buttons -->
          <header class="app-user-header">
            <div class="user-profile-group">
              <div class="avatar-circle">
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" 
                  alt="Olivia Reed" 
                  class="avatar-img" 
                  onerror="this.style.display='none'"
                />
              </div>
              <div class="user-meta">
                <span class="greeting-text">Good Morning</span>
                <span class="user-name">Olivia Reed</span>
              </div>
            </div>

            <div class="header-action-buttons">
              <!-- Round Black + Button (Opens Screen 3 Modal) -->
              <button 
                type="button" 
                class="btn-circle-black" 
                id="header-add-task-btn" 
                aria-label="Add new task"
                title="Create Task"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>

              <!-- Round White Bell Button -->
              <button 
                type="button" 
                class="btn-circle-white" 
                id="header-bell-btn" 
                aria-label="Notifications"
                title="Notifications"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
              </button>
            </div>
          </header>

          <!-- 2. Hero Typography: Let's Make Today Productive -->
          <div class="hero-typography-block">
            <div class="hero-line-1">Let's Make</div>
            <div class="hero-line-2">Today Productive</div>
          </div>

          <!-- 3. Today's Progress Card Mount -->
          <div id="stats-mount" aria-live="polite"></div>

          <!-- 4. Today's Tasks Section & Filter Bar Mount -->
          <div id="filter-mount"></div>

          <!-- 5. Tasks List Mount -->
          <div id="list-mount" aria-live="polite"></div>
        </div>

        <!-- 6. Floating Bottom Navigation Dock -->
        <nav class="bottom-nav-dock" aria-label="Bottom Navigation">
          <button type="button" class="nav-item-btn active" aria-label="Home" title="Home">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <span>Home</span>
          </button>

          <button type="button" class="nav-item-btn" id="nav-projects-btn" aria-label="Projects" title="Projects">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            <span>Projects</span>
          </button>

          <button type="button" class="nav-item-btn" id="nav-calendar-btn" aria-label="Calendar" title="Calendar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span>Calendar</span>
          </button>

          <button type="button" class="nav-item-btn" id="nav-profile-btn" aria-label="Profile" title="Profile">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>Profile</span>
          </button>
        </nav>
      </div>
    </div>
  `;

  // Pre-mount task modal into DOM so all test querySelectors (#task-input, #add-task-btn) exist immediately
  setupTaskModal();

  // Attach Header '+' Button to open Add Task modal
  const headerAddBtn = document.getElementById('header-add-task-btn');
  if (headerAddBtn) {
    headerAddBtn.addEventListener('click', () => {
      openTaskModalForCreate();
      playTactileClick('click');
    });
  }

  // Reactive mounts
  const statsMount = document.getElementById('stats-mount');
  const filterMount = document.getElementById('filter-mount');
  const listMount = document.getElementById('list-mount');

  const updateComponents = () => {
    if (statsMount) renderStatsPanel(statsMount);
    if (filterMount) renderFilterBar(filterMount);
    if (listMount) renderTaskList(listMount);
  };

  // Subscribe to central store updates
  store.subscribe(updateComponents);

  // Initial render
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
