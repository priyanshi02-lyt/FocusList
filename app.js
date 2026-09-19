/**
 * FocusList — Modern Mobile-First Task & Productivity Studio
 * Pure Vanilla JavaScript (Zero External Dependencies, High Performance)
 * Matches User Reference Photos: Image 1, Image 2, Image 3, Image 4
 */

(() => {
  'use strict';

  // --- Storage Keys ---
  const STORAGE_KEY = 'focuslist_tasks_orbix_v1';
  const THEME_KEY = 'focuslist_theme_v2';
  const SOUND_KEY = 'focuslist_sound_v1';

  // --- Initial Starter / Demo Tasks ---
  const INITIAL_TASKS = [
    {
      id: 'task_orbix_1',
      title: 'Meeting with client',
      description: 'Discuss progress, next steps, and client prototype feedback.',
      completed: false,
      priority: 'Medium',
      category: 'Work',
      time: '01:20 PM',
      dueDate: getRelativeDateString(0), // Today
      createdAt: Date.now() - 3600000 * 2
    },
    {
      id: 'task_orbix_2',
      title: 'Prepare Presentation for Monday',
      description: 'Reposition, create wireframe prototype, and slide deck.',
      completed: false,
      priority: 'High',
      category: 'Work',
      time: '04:20 PM',
      dueDate: getRelativeDateString(0), // Today
      createdAt: Date.now() - 3600000 * 4
    },
    {
      id: 'task_orbix_3',
      title: 'Workout & Hydration Session',
      description: 'Cardio intervals, stretching, and 45min gym workout.',
      completed: true,
      priority: 'Low',
      category: 'Personal',
      time: '07:30 AM',
      dueDate: getRelativeDateString(0),
      createdAt: Date.now() - 3600000 * 6
    },
    {
      id: 'task_orbix_4',
      title: 'Study & Review Architecture Patterns',
      description: 'Deep dive into responsive mobile layouts and CSS grid.',
      completed: false,
      priority: 'Medium',
      category: 'Study',
      time: '08:00 PM',
      dueDate: getRelativeDateString(1), // Tomorrow
      createdAt: Date.now() - 3600000 * 8
    },
    {
      id: 'task_orbix_5',
      title: 'Data backup & JSON synchronization',
      description: 'Verify offline local storage and restore pipeline.',
      completed: true,
      priority: 'High',
      category: 'Urgent',
      time: '11:00 AM',
      dueDate: getRelativeDateString(0),
      createdAt: Date.now() - 3600000 * 10
    }
  ];

  // --- App State ---
  let tasks = loadTasks();
  let currentView = 'tasks'; // 'tasks' | 'timeline' | 'projects' | 'settings'
  let currentStatusFilter = 'all'; // 'all' | 'active' | 'completed'
  let currentPriorityFilter = 'all'; // 'all' | 'High' | 'Medium' | 'Low'
  let currentCategoryFilter = 'all';
  let selectedDateFilter = null; // null or 'YYYY-MM-DD'
  let currentSortBy = 'newest';
  let searchQuery = '';
  let soundEnabled = localStorage.getItem(SOUND_KEY) !== 'false';
  let lastDeletedTask = null;
  let undoTimeout = null;
  let audioCtx = null;

  // --- DOM Element References ---
  const elements = {
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    soundToggleBtn: document.getElementById('soundToggleBtn'),
    currentDateText: document.getElementById('currentDateText'),
    searchInput: document.getElementById('searchInput'),
    clearSearchBtn: document.getElementById('clearSearchBtn'),
    priorityFilterSelect: document.getElementById('priorityFilterSelect'),
    calendarWeekRibbon: document.getElementById('calendarWeekRibbon'),
    
    // Quick Add Bar Elements
    taskForm: document.getElementById('taskForm'),
    taskTitleInput: document.getElementById('taskTitleInput'),
    taskPrioritySelect: document.getElementById('taskPrioritySelect'),
    taskCategorySelect: document.getElementById('taskCategorySelect'),
    taskDueDateInput: document.getElementById('taskDueDateInput'),
    addTaskBtn: document.getElementById('addTaskBtn'),

    // Desktop New Task & Mobile FAB
    openNewTaskBtn: document.getElementById('openNewTaskBtn'),
    mobileFloatingAddBtn: document.getElementById('mobileFloatingAddBtn'),

    // Views
    viewTasks: document.getElementById('viewTasks'),
    viewTimeline: document.getElementById('viewTimeline'),
    viewProjects: document.getElementById('viewProjects'),
    viewSettings: document.getElementById('viewSettings'),
    barTabs: document.querySelectorAll('.bar-tab'),

    // Tasks View Elements & Test ID Aliases
    statTotal: document.getElementById('statTotal'),
    totalTasks: document.getElementById('totalTasks'),
    statPending: document.getElementById('statPending'),
    pendingTasks: document.getElementById('pendingTasks'),
    statCompleted: document.getElementById('statCompleted'),
    completedTasks: document.getElementById('completedTasks'),
    statHigh: document.getElementById('statHigh'),
    statPercentage: document.getElementById('statPercentage'),
    progressBarFill: document.getElementById('progressBarFill'),
    motivationQuote: document.getElementById('motivationQuote'),
    donutDoneSeg: document.getElementById('donutDoneSeg'),
    donutProgSeg: document.getElementById('donutProgSeg'),
    donutHighSeg: document.getElementById('donutHighSeg'),
    chipAllCount: document.getElementById('chipAllCount'),
    chipActiveCount: document.getElementById('chipActiveCount'),
    chipHighCount: document.getElementById('chipHighCount'),
    chipCompletedCount: document.getElementById('chipCompletedCount'),
    countAll: document.getElementById('countAll'),
    countActive: document.getElementById('countActive'),
    countCompleted: document.getElementById('countCompleted'),
    sortBySelect: document.getElementById('sortBySelect'),
    taskList: document.getElementById('taskList'),
    emptyState: document.getElementById('emptyState'),
    emptyTitle: document.getElementById('emptyTitle'),
    emptyDesc: document.getElementById('emptyDesc'),
    loadSampleTasksBtn: document.getElementById('loadSampleTasksBtn'),
    showingCountText: document.getElementById('showingCountText'),
    mobileClearCompletedBtn: document.getElementById('mobileClearCompletedBtn'),

    // Desktop Sidebar Elements
    sideCountAll: document.getElementById('sideCountAll'),
    sideCountActive: document.getElementById('sideCountActive'),
    sideCountCompleted: document.getElementById('sideCountCompleted'),
    sideCountHigh: document.getElementById('sideCountHigh'),
    sideCountMedium: document.getElementById('sideCountMedium'),
    sideCountLow: document.getElementById('sideCountLow'),
    clearCompletedBtn: document.getElementById('clearCompletedBtn'),
    exportJsonBtn: document.getElementById('exportJsonBtn'),
    importJsonInput: document.getElementById('importJsonInput'),
    sidebarNavItems: document.querySelectorAll('.desktop-sidebar .nav-item'),
    statusBtns: document.querySelectorAll('.status-btn'),
    orbixChips: document.querySelectorAll('.orbix-chip'),

    // Timeline View Elements
    chronologicalTimeline: document.getElementById('chronologicalTimeline'),
    timelineDateBadge: document.getElementById('timelineDateBadge'),

    // Projects View Elements
    projectsGrid: document.getElementById('projectsGrid'),

    // Settings View Elements
    mobileExportBtn: document.getElementById('mobileExportBtn'),
    mobileImportInput: document.getElementById('mobileImportInput'),
    mobileClearAllDoneBtn: document.getElementById('mobileClearAllDoneBtn'),
    mobileResetDemoBtn: document.getElementById('mobileResetDemoBtn'),
    mobileSoundToggle: document.getElementById('mobileSoundToggle'),
    mobileSoundLabel: document.getElementById('mobileSoundLabel'),
    mobileThemeToggle: document.getElementById('mobileThemeToggle'),
    mobileThemeLabel: document.getElementById('mobileThemeLabel'),

    // Create Task Modal
    createTaskModal: document.getElementById('createTaskModal'),
    closeCreateModalBtn: document.getElementById('closeCreateModalBtn'),
    createTaskForm: document.getElementById('createTaskForm'),
    createTaskTitle: document.getElementById('createTaskTitle'),
    createTaskDesc: document.getElementById('createTaskDesc'),
    createTaskDueDate: document.getElementById('createTaskDueDate'),
    createTaskTime: document.getElementById('createTaskTime'),
    createTaskCategory: document.getElementById('createTaskCategory'),

    // Edit Task Modal
    editModal: document.getElementById('editModal'),
    closeModalBtn: document.getElementById('closeModalBtn'),
    cancelEditBtn: document.getElementById('cancelEditBtn'),
    editTaskForm: document.getElementById('editTaskForm'),
    editTaskId: document.getElementById('editTaskId'),
    editTaskTitle: document.getElementById('editTaskTitle'),
    editTaskDesc: document.getElementById('editTaskDesc'),
    editTaskCategory: document.getElementById('editTaskCategory'),
    editTaskDueDate: document.getElementById('editTaskDueDate'),

    // Toast, Canvas & Live Region
    toastContainer: document.getElementById('toastContainer'),
    confettiCanvas: document.getElementById('confettiCanvas'),
    liveRegion: document.getElementById('liveRegion')
  };

  // --- Screen Reader Announcements ---
  function announceLive(message) {
    if (elements.liveRegion) {
      elements.liveRegion.textContent = message;
    }
  }

  // --- Offline PWA Service Worker Registration ---
  function initServiceWorker() {
    if ('serviceWorker' in navigator && (window.location.protocol === 'http:' || window.location.protocol === 'https:')) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js').catch((err) => {
          console.warn('Service worker registration note:', err);
        });
      });
    }
  }

  // --- Initialization ---
  function init() {
    initTheme();
    initSound();
    initDateDisplay();
    initServiceWorker();
    renderCalendarWeekRibbon();
    bindEvents();
    render();
  }

  // --- Helpers ---
  function getRelativeDateString(daysOffset) {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    return d.toISOString().split('T')[0];
  }

  function loadTasks() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load stored tasks:', e);
    }
    return [...INITIAL_TASKS];
  }

  function saveTasksToStorage(taskList) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(taskList));
    } catch (e) {
      console.error('Failed to save tasks to localStorage:', e);
      showToast('Storage error! Tasks could not be saved.', 'error');
    }
  }

  // --- Theme Management ---
  function initTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY) || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeToggleUI(savedTheme);
  }

  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem(THEME_KEY, nextTheme);
    updateThemeToggleUI(nextTheme);
    playAudio('click');
    showToast(`Switched to ${nextTheme === 'dark' ? 'Obsidian Dark' : 'Radiant Light'} theme`, 'info');
  }

  function updateThemeToggleUI(theme) {
    const isDark = theme === 'dark';
    const sunIcons = document.querySelectorAll('.sun-icon');
    const moonIcons = document.querySelectorAll('.moon-icon');
    sunIcons.forEach(icon => icon.style.display = isDark ? 'block' : 'none');
    moonIcons.forEach(icon => icon.style.display = isDark ? 'none' : 'block');
    if (elements.mobileThemeLabel) {
      elements.mobileThemeLabel.textContent = isDark ? 'Dark Theme' : 'Light Theme';
    }
  }

  // --- Sound Engine ---
  function initSound() {
    updateSoundUI();
  }

  function toggleSound() {
    soundEnabled = !soundEnabled;
    localStorage.setItem(SOUND_KEY, soundEnabled);
    updateSoundUI();
    if (soundEnabled) playAudio('success');
    showToast(soundEnabled ? 'Tactile sound enabled' : 'Sound muted', 'info');
  }

  function updateSoundUI() {
    const onIcons = document.querySelectorAll('.sound-on-icon');
    const offIcons = document.querySelectorAll('.sound-off-icon');
    onIcons.forEach(el => el.style.display = soundEnabled ? 'block' : 'none');
    offIcons.forEach(el => el.style.display = soundEnabled ? 'none' : 'block');
    if (elements.mobileSoundLabel) {
      elements.mobileSoundLabel.textContent = soundEnabled ? 'Enabled' : 'Muted';
    }
  }

  function playAudio(type = 'click') {
    if (!soundEnabled) return;
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      const now = audioCtx.currentTime;

      if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.12); // G5
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'add') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.1);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
        osc.start(now);
        osc.stop(now + 0.18);
      } else if (type === 'delete') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.18);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.22);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.09);
      }
    } catch (e) {}
  }

  // --- Date Display ---
  function initDateDisplay() {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    const today = new Date().toLocaleDateString(undefined, options);
    if (elements.currentDateText) {
      elements.currentDateText.textContent = today;
    }
    if (elements.timelineDateBadge) {
      elements.timelineDateBadge.textContent = today;
    }
  }

  // --- Calendar Week Ribbon (Images 1, 2, 3, 4) ---
  function renderCalendarWeekRibbon() {
    if (!elements.calendarWeekRibbon) return;
    elements.calendarWeekRibbon.innerHTML = '';

    const today = new Date();
    const currentDayOfWeek = today.getDay(); // 0 is Sun, 1 is Mon...
    // Start from Monday
    const distanceToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + distanceToMonday);

    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(monday);
      dayDate.setDate(monday.getDate() + i);

      const yyyy = dayDate.getFullYear();
      const mm = String(dayDate.getMonth() + 1).padStart(2, '0');
      const dd = String(dayDate.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;

      const isToday = dayDate.toDateString() === today.toDateString();
      const isSelected = selectedDateFilter === dateStr || (!selectedDateFilter && isToday);

      // Check if tasks exist on this date
      const hasTasks = tasks.some(t => t.dueDate === dateStr);

      const pill = document.createElement('div');
      pill.className = `cal-day-pill ${isSelected ? 'active' : ''} ${hasTasks ? 'has-tasks' : ''}`;
      pill.setAttribute('data-date', dateStr);
      pill.setAttribute('role', 'button');
      pill.setAttribute('title', `${dayNames[i]}, ${dayDate.toLocaleDateString()}`);

      pill.innerHTML = `
        <span class="cal-day-name">${dayNames[i]}</span>
        <span class="cal-day-num">${dayDate.getDate()}</span>
        <span class="cal-day-dot"></span>
      `;

      pill.addEventListener('click', () => {
        if (selectedDateFilter === dateStr) {
          selectedDateFilter = null; // Toggle off
        } else {
          selectedDateFilter = dateStr;
        }
        playAudio('click');
        renderCalendarWeekRibbon();
        render();
      });

      elements.calendarWeekRibbon.appendChild(pill);
    }
  }

  // --- View Switching (Bottom Bar Navigation) ---
  function switchView(viewName) {
    currentView = viewName;

    // Update Bottom Bar Tabs
    elements.barTabs.forEach(tab => {
      if (tab.getAttribute('data-view') === viewName) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    // Hide all view containers, show selected
    elements.viewTasks.style.display = viewName === 'tasks' ? 'flex' : 'none';
    elements.viewTimeline.style.display = viewName === 'timeline' ? 'flex' : 'none';
    elements.viewProjects.style.display = viewName === 'projects' ? 'flex' : 'none';
    elements.viewSettings.style.display = viewName === 'settings' ? 'flex' : 'none';

    // Re-render corresponding view content
    if (viewName === 'timeline') renderTimelineView();
    if (viewName === 'projects') renderProjectsView();

    playAudio('click');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --- Event Bindings ---
  function bindEvents() {
    // Theme & Sound Toggles
    elements.themeToggleBtn.addEventListener('click', toggleTheme);
    elements.soundToggleBtn.addEventListener('click', toggleSound);

    // Mobile Bottom Bar View Switching
    elements.barTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const view = tab.getAttribute('data-view');
        if (view) switchView(view);
      });
    });

    // Open "Create New Task" Modal (Mobile FAB & Desktop Button)
    const openCreateModal = () => {
      // Set default due date to today
      elements.createTaskDueDate.value = getRelativeDateString(0);
      elements.createTaskModal.classList.add('open');
      elements.createTaskModal.setAttribute('aria-hidden', 'false');
      elements.createTaskTitle.focus();
      playAudio('click');
    };

    if (elements.openNewTaskBtn) elements.openNewTaskBtn.addEventListener('click', openCreateModal);
    if (elements.mobileFloatingAddBtn) elements.mobileFloatingAddBtn.addEventListener('click', openCreateModal);

    // Close Create Modal
    elements.closeCreateModalBtn.addEventListener('click', closeCreateModal);
    elements.createTaskModal.addEventListener('click', (e) => {
      if (e.target === elements.createTaskModal) closeCreateModal();
    });

    // Create Modal Priority Radio Active Styling
    document.querySelectorAll('#createTaskForm .prio-pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#createTaskForm .prio-pill-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        playAudio('click');
      });
    });

    // Quick Add Bar Task Submit
    if (elements.taskForm) {
      elements.taskForm.addEventListener('submit', handleQuickAddTaskSubmit);
    }

    // Create Task Modal Submit
    if (elements.createTaskForm) {
      elements.createTaskForm.addEventListener('submit', handleCreateTaskSubmit);
    }

    // Search Input
    elements.searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      elements.clearSearchBtn.style.display = searchQuery ? 'block' : 'none';
      render();
    });

    elements.clearSearchBtn.addEventListener('click', () => {
      elements.searchInput.value = '';
      searchQuery = '';
      elements.clearSearchBtn.style.display = 'none';
      elements.searchInput.focus();
      render();
    });

    // Priority Filter Select
    elements.priorityFilterSelect.addEventListener('change', (e) => {
      currentPriorityFilter = e.target.value;
      syncNavigationUI();
      render();
    });

    // Desktop Sidebar Navigation
    elements.sidebarNavItems.forEach(item => {
      item.addEventListener('click', () => {
        const filter = item.getAttribute('data-filter');
        const prio = item.getAttribute('data-priority');
        const cat = item.getAttribute('data-category');

        if (filter) {
          currentStatusFilter = filter;
          currentPriorityFilter = 'all';
          currentCategoryFilter = 'all';
        } else if (prio) {
          currentStatusFilter = 'all';
          currentPriorityFilter = prio;
          currentCategoryFilter = 'all';
        } else if (cat) {
          currentStatusFilter = 'all';
          currentPriorityFilter = 'all';
          currentCategoryFilter = cat;
        }

        elements.priorityFilterSelect.value = currentPriorityFilter;
        syncNavigationUI();
        playAudio('click');
        render();
      });
    });

    // Status Buttons (All, Active, Done)
    elements.statusBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        currentStatusFilter = btn.getAttribute('data-filter');
        currentPriorityFilter = 'all';
        currentCategoryFilter = 'all';
        elements.priorityFilterSelect.value = 'all';
        syncNavigationUI();
        playAudio('click');
        render();
      });
    });

    // Quick Orbix Chips
    elements.orbixChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const filter = chip.getAttribute('data-filter');
        const prio = chip.getAttribute('data-priority');
        if (filter) {
          currentStatusFilter = filter;
          currentPriorityFilter = 'all';
        } else if (prio) {
          currentStatusFilter = 'all';
          currentPriorityFilter = prio;
        }
        elements.priorityFilterSelect.value = currentPriorityFilter;
        syncNavigationUI();
        playAudio('click');
        render();
      });
    });

    // Sort Dropdown
    elements.sortBySelect.addEventListener('change', (e) => {
      currentSortBy = e.target.value;
      render();
    });

    // Clear Completed Tasks
    if (elements.clearCompletedBtn) elements.clearCompletedBtn.addEventListener('click', handleClearCompleted);
    if (elements.mobileClearCompletedBtn) elements.mobileClearCompletedBtn.addEventListener('click', handleClearCompleted);
    if (elements.mobileClearAllDoneBtn) elements.mobileClearAllDoneBtn.addEventListener('click', handleClearCompleted);

    // Load Sample Tasks
    elements.loadSampleTasksBtn.addEventListener('click', reloadSampleTasks);
    if (elements.mobileResetDemoBtn) elements.mobileResetDemoBtn.addEventListener('click', reloadSampleTasks);

    // Settings View Specific Toggles
    if (elements.mobileSoundToggle) elements.mobileSoundToggle.addEventListener('click', toggleSound);
    if (elements.mobileThemeToggle) elements.mobileThemeToggle.addEventListener('click', toggleTheme);

    // Edit Modal Events
    elements.closeModalBtn.addEventListener('click', closeEditModal);
    elements.cancelEditBtn.addEventListener('click', closeEditModal);
    elements.editModal.addEventListener('click', (e) => {
      if (e.target === elements.editModal) closeEditModal();
    });
    elements.editTaskForm.addEventListener('submit', handleSaveEditTask);

    document.querySelectorAll('#editTaskForm .prio-pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#editTaskForm .prio-pill-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        playAudio('click');
      });
    });

    // Export & Import JSON
    elements.exportJsonBtn.addEventListener('click', handleExportJson);
    if (elements.mobileExportBtn) elements.mobileExportBtn.addEventListener('click', handleExportJson);
    elements.importJsonInput.addEventListener('change', handleImportJson);
    if (elements.mobileImportInput) elements.mobileImportInput.addEventListener('change', handleImportJson);

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== elements.searchInput && !elements.createTaskModal.classList.contains('open') && !elements.editModal.classList.contains('open')) {
        e.preventDefault();
        elements.searchInput.focus();
      }
      if (e.key === 'Escape') {
        closeCreateModal();
        closeEditModal();
      }
    });
  }

  function closeCreateModal() {
    elements.createTaskModal.classList.remove('open');
    elements.createTaskModal.setAttribute('aria-hidden', 'true');
    elements.createTaskForm.reset();
  }

  function closeEditModal() {
    elements.editModal.classList.remove('open');
    elements.editModal.setAttribute('aria-hidden', 'true');
    elements.editTaskForm.reset();
  }

  function reloadSampleTasks() {
    tasks = [...INITIAL_TASKS];
    saveTasksToStorage(tasks);
    renderCalendarWeekRibbon();
    showToast('Sample tasks reloaded! 🚀', 'success');
    playAudio('add');
    render();
  }

  // --- Quick-Add Task Action (Inline on Dashboard) ---
  function handleQuickAddTaskSubmit(e) {
    e.preventDefault();
    const title = elements.taskTitleInput ? elements.taskTitleInput.value.trim() : '';
    if (!title) return;

    const priority = elements.taskPrioritySelect ? elements.taskPrioritySelect.value : 'Medium';
    const category = elements.taskCategorySelect ? elements.taskCategorySelect.value : 'Work';
    const dueDate = elements.taskDueDateInput && elements.taskDueDateInput.value ? elements.taskDueDateInput.value : getRelativeDateString(0);

    const newTask = {
      id: 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      title: title,
      description: '',
      completed: false,
      priority: priority,
      category: category,
      time: '09:00 AM',
      dueDate: dueDate,
      createdAt: Date.now()
    };

    tasks.unshift(newTask);
    saveTasksToStorage(tasks);
    if (elements.taskForm) elements.taskForm.reset();

    playAudio('add');
    showToast('Task added! ✨', 'success');
    announceLive(`Task added: ${title}`);

    renderCalendarWeekRibbon();
    render();
  }

  // --- Create Task Action (Modal / Bottom Sheet) ---
  function handleCreateTaskSubmit(e) {
    e.preventDefault();
    const title = elements.createTaskTitle.value.trim();
    if (!title) return;

    const desc = elements.createTaskDesc.value.trim();
    const dueDate = elements.createTaskDueDate.value;
    const timeInput = elements.createTaskTime.value;
    const priorityChecked = document.querySelector('input[name="createPriority"]:checked');
    const priority = priorityChecked ? priorityChecked.value : 'Medium';
    const category = elements.createTaskCategory.value || 'Work';

    // Format time display
    let formattedTime = 'Today';
    if (timeInput) {
      const [h, m] = timeInput.split(':');
      const hour = parseInt(h, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      formattedTime = `${String(displayHour).padStart(2, '0')}:${m} ${ampm}`;
    }

    const newTask = {
      id: 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      title: title,
      description: desc,
      completed: false,
      priority: priority,
      category: category,
      time: formattedTime,
      dueDate: dueDate || getRelativeDateString(0),
      createdAt: Date.now()
    };

    tasks.unshift(newTask);
    saveTasksToStorage(tasks);
    closeCreateModal();

    playAudio('add');
    showToast('Task created successfully! ✨', 'success');
    announceLive(`Task created: ${title}`);

    renderCalendarWeekRibbon();
    render();
  }

  // --- Task Editing ---
  function openEditModal(task) {
    elements.editTaskId.value = task.id;
    elements.editTaskTitle.value = task.title;
    elements.editTaskDesc.value = task.description || '';
    elements.editTaskCategory.value = task.category;
    elements.editTaskDueDate.value = task.dueDate || '';

    // Set priority
    document.querySelectorAll('#editTaskForm .prio-pill-btn').forEach(btn => {
      const input = btn.querySelector('input');
      if (input.value === task.priority) {
        input.checked = true;
        btn.classList.add('active');
      } else {
        input.checked = false;
        btn.classList.remove('active');
      }
    });

    elements.editModal.classList.add('open');
    elements.editModal.setAttribute('aria-hidden', 'false');
    elements.editTaskTitle.focus();
    playAudio('click');
  }

  function handleSaveEditTask(e) {
    e.preventDefault();
    const id = elements.editTaskId.value;
    const title = elements.editTaskTitle.value.trim();
    if (!title) return;

    const desc = elements.editTaskDesc.value.trim();
    const category = elements.editTaskCategory.value;
    const dueDate = elements.editTaskDueDate.value;
    const priorityChecked = document.querySelector('input[name="editPriority"]:checked');
    const priority = priorityChecked ? priorityChecked.value : 'Medium';

    const index = tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      tasks[index].title = title;
      tasks[index].description = desc;
      tasks[index].category = category;
      tasks[index].dueDate = dueDate;
      tasks[index].priority = priority;

      saveTasksToStorage(tasks);
      closeEditModal();
      playAudio('success');
      showToast('Task updated! 📝', 'success');
      announceLive(`Task updated: ${title}`);
      renderCalendarWeekRibbon();
      render();
    }
  }

  // --- Task Completion & Deletion ---
  function toggleTaskCompletion(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    task.completed = !task.completed;
    saveTasksToStorage(tasks);

    if (task.completed) {
      playAudio('success');
      announceLive(`Task completed: ${task.title}`);
      if (task.priority === 'High' || tasks.every(t => t.completed)) {
        triggerConfetti();
      }
    } else {
      playAudio('click');
      announceLive(`Task marked active: ${task.title}`);
    }

    renderCalendarWeekRibbon();
    render();
  }

  function deleteTask(id) {
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) return;

    const taskTitle = tasks[index].title;
    lastDeletedTask = { task: tasks[index], index: index };
    tasks.splice(index, 1);
    saveTasksToStorage(tasks);

    playAudio('delete');
    showUndoToast();
    announceLive(`Task deleted: ${taskTitle}`);

    renderCalendarWeekRibbon();
    render();
  }

  function handleClearCompleted() {
    const completedCount = tasks.filter(t => t.completed).length;
    if (completedCount === 0) return;

    tasks = tasks.filter(t => !t.completed);
    saveTasksToStorage(tasks);
    playAudio('delete');
    showToast(`Cleared ${completedCount} completed task(s)`, 'info');

    renderCalendarWeekRibbon();
    render();
  }

  // --- Undo Toast ---
  function showUndoToast() {
    clearTimeout(undoTimeout);
    elements.toastContainer.innerHTML = '';

    const toast = document.createElement('div');
    toast.className = 'toast-pill';
    toast.innerHTML = `
      <span>Task deleted</span>
      <button class="toast-undo-action" id="toastUndoBtn">Undo</button>
    `;

    elements.toastContainer.appendChild(toast);

    document.getElementById('toastUndoBtn').addEventListener('click', () => {
      if (lastDeletedTask) {
        tasks.splice(lastDeletedTask.index, 0, lastDeletedTask.task);
        saveTasksToStorage(tasks);
        lastDeletedTask = null;
        playAudio('add');
        toast.remove();
        showToast('Task restored! ↩️', 'success');
        renderCalendarWeekRibbon();
        render();
      }
    });

    undoTimeout = setTimeout(() => {
      toast.remove();
      lastDeletedTask = null;
    }, 5000);
  }

  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = 'toast-pill';
    const icon = type === 'success' ? '✅' : type === 'error' ? '⚠️' : 'ℹ️';
    toast.innerHTML = `<span>${icon} ${message}</span>`;
    elements.toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 3200);
  }

  // --- Confetti Celebration ---
  function triggerConfetti() {
    const canvas = elements.confettiCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces = [];
    const colors = ['#8b5cf6', '#a855f7', '#ec4899', '#f59e0b', '#10b981', '#38bdf8'];
    for (let i = 0; i < 70; i++) {
      pieces.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.5) * 12 - 4,
        size: Math.random() * 6 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vr: (Math.random() - 0.5) * 10
      });
    }

    let frames = 0;
    function frame() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.25; // gravity
        p.rotation += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });
      frames++;
      if (frames < 90) {
        requestAnimationFrame(frame);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    requestAnimationFrame(frame);
  }

  // --- Export & Import ---
  function handleExportJson() {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(tasks, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `focuslist_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    playAudio('success');
    showToast('Task database exported to JSON! 📥', 'success');
  }

  function handleImportJson(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (Array.isArray(imported)) {
          tasks = imported;
          saveTasksToStorage(tasks);
          playAudio('success');
          showToast(`Successfully imported ${tasks.length} tasks! 🎉`, 'success');
          renderCalendarWeekRibbon();
          render();
        } else {
          showToast('Invalid JSON file structure', 'error');
        }
      } catch (err) {
        showToast('Error parsing JSON backup file', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  // --- UI Synchronizations ---
  function syncNavigationUI() {
    // Sync desktop sidebar
    elements.sidebarNavItems.forEach(item => {
      const f = item.getAttribute('data-filter');
      const p = item.getAttribute('data-priority');
      const c = item.getAttribute('data-category');

      if (f && f === currentStatusFilter && currentPriorityFilter === 'all' && currentCategoryFilter === 'all') {
        item.classList.add('active');
      } else if (p && p === currentPriorityFilter) {
        item.classList.add('active');
      } else if (c && c === currentCategoryFilter) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Sync status tabs
    elements.statusBtns.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-filter') === currentStatusFilter);
    });

    // Sync quick chips
    elements.orbixChips.forEach(chip => {
      const f = chip.getAttribute('data-filter');
      const p = chip.getAttribute('data-priority');
      if (f && f === currentStatusFilter && currentPriorityFilter === 'all') {
        chip.classList.add('active');
      } else if (p && p === currentPriorityFilter) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }
    });
  }

  // --- Timeline View Renderer (Matching Image 4 & Image 2 Screen 3) ---
  function renderTimelineView() {
    if (!elements.chronologicalTimeline) return;
    elements.chronologicalTimeline.innerHTML = '';

    const listToRender = [...tasks].sort((a, b) => (a.time || '').localeCompare(b.time || ''));

    if (listToRender.length === 0) {
      elements.chronologicalTimeline.innerHTML = `
        <div class="orbix-empty-card">
          <div class="empty-icon-box">⏱️</div>
          <h4 class="empty-head-text">No timeline items</h4>
          <p class="empty-body-text">Add tasks with scheduled times to see them organized chronologically.</p>
        </div>
      `;
      return;
    }

    const categoryColors = {
      Work: '#8b5cf6',
      Personal: '#10b981',
      Study: '#38bdf8',
      Urgent: '#f43f5e',
      General: '#f59e0b'
    };

    listToRender.forEach((task, idx) => {
      const avatarLetter = (task.title || 'T').charAt(0).toUpperCase();
      const color = categoryColors[task.category] || '#8b5cf6';

      const entry = document.createElement('div');
      entry.className = `timeline-entry-row ${task.completed ? 'completed' : ''}`;

      entry.innerHTML = `
        <div class="timeline-time-col">${task.time || '09:00 AM'}</div>
        <div class="timeline-spine">
          <div class="spine-node"></div>
          ${idx < listToRender.length - 1 ? '<div class="spine-connector"></div>' : ''}
        </div>
        <div class="timeline-content-card">
          <div class="timeline-card-avatar" style="background: ${color};">${avatarLetter}</div>
          <div class="timeline-card-details">
            <span class="timeline-item-title">${escapeHtml(task.title)}</span>
            <span class="timeline-item-meta">${escapeHtml(task.category)} • ${task.priority} Priority</span>
          </div>
          <button class="circular-check-btn" title="${task.completed ? 'Mark pending' : 'Mark done'}" aria-label="Toggle task">
            ${task.completed ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5"><polyline points="20 6 9 17 4 12"></polyline></svg>' : ''}
          </button>
        </div>
      `;

      entry.querySelector('.circular-check-btn').addEventListener('click', () => {
        toggleTaskCompletion(task.id);
        renderTimelineView();
      });

      elements.chronologicalTimeline.appendChild(entry);

      // Between items, add a subtle free time divider like in Image 4
      if (idx < listToRender.length - 1 && idx % 2 === 1) {
        const freeStrip = document.createElement('div');
        freeStrip.className = 'timeline-free-strip';
        freeStrip.innerHTML = `<span>⏳ 1h 30min between tasks</span>`;
        elements.chronologicalTimeline.appendChild(freeStrip);
      }
    });
  }

  // --- Projects View Renderer (Matching Image 2 Screen 2) ---
  function renderProjectsView() {
    if (!elements.projectsGrid) return;
    elements.projectsGrid.innerHTML = '';

    const categories = [
      { name: 'Work', icon: '💼', title: 'Work Projects', color: '#8b5cf6' },
      { name: 'Personal', icon: '🌱', title: 'Personal & Habits', color: '#10b981' },
      { name: 'Study', icon: '📚', title: 'Study & Learning', color: '#38bdf8' },
      { name: 'Urgent', icon: '⚡', title: 'Urgent Items', color: '#f43f5e' }
    ];

    categories.forEach(cat => {
      const catTasks = tasks.filter(t => t.category === cat.name);
      const total = catTasks.length;
      const completed = catTasks.filter(t => t.completed).length;
      const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

      // Calculate SVG ring stroke offset (r = 20, circumference = 2 * PI * 20 = 125.66)
      const circ = 125.66;
      const offset = circ - (circ * pct) / 100;

      const card = document.createElement('div');
      card.className = 'project-category-card';
      card.innerHTML = `
        <div class="project-card-head">
          <span class="project-cat-badge">${cat.icon}</span>
          <div class="project-ring-box">
            <svg class="project-ring-svg" viewBox="0 0 52 52">
              <circle cx="26" cy="26" r="20" fill="none" stroke="var(--bg-input)" stroke-width="5"></circle>
              <circle cx="26" cy="26" r="20" fill="none" stroke="${cat.color}" stroke-width="5"
                stroke-dasharray="${circ}" stroke-dashoffset="${offset}" stroke-linecap="round"></circle>
            </svg>
            <span class="project-ring-percent">${pct}%</span>
          </div>
        </div>
        <div class="project-info-block">
          <h3 class="project-card-title">${cat.title}</h3>
          <span class="project-card-tasks-count">${completed} of ${total} tasks completed</span>
        </div>
      `;

      card.addEventListener('click', () => {
        currentCategoryFilter = cat.name;
        currentStatusFilter = 'all';
        currentPriorityFilter = 'all';
        syncNavigationUI();
        switchView('tasks');
        render();
      });

      elements.projectsGrid.appendChild(card);
    });
  }

  // --- Main Render Function ---
  function render() {
    // 1. Filter Tasks
    let filtered = tasks.filter(task => {
      if (currentStatusFilter === 'active' && task.completed) return false;
      if (currentStatusFilter === 'completed' && !task.completed) return false;
      if (currentPriorityFilter !== 'all' && task.priority !== currentPriorityFilter) return false;
      if (currentCategoryFilter !== 'all' && task.category !== currentCategoryFilter) return false;
      if (selectedDateFilter && task.dueDate !== selectedDateFilter) return false;
      if (searchQuery) {
        const titleMatch = task.title.toLowerCase().includes(searchQuery);
        const descMatch = (task.description || '').toLowerCase().includes(searchQuery);
        const catMatch = task.category.toLowerCase().includes(searchQuery);
        if (!titleMatch && !descMatch && !catMatch) return false;
      }
      return true;
    });

    // 2. Sort Tasks
    filtered.sort((a, b) => {
      if (currentSortBy === 'newest') return (b.createdAt || 0) - (a.createdAt || 0);
      if (currentSortBy === 'oldest') return (a.createdAt || 0) - (b.createdAt || 0);
      if (currentSortBy === 'priority') {
        const weights = { High: 3, Medium: 2, Low: 1 };
        return (weights[b.priority] || 0) - (weights[a.priority] || 0);
      }
      if (currentSortBy === 'alphabetical') return a.title.localeCompare(b.title);
      if (currentSortBy === 'dueDate') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      }
      return 0;
    });

    // 3. Render Task Cards in Tasks View
    elements.taskList.innerHTML = '';
    if (filtered.length === 0) {
      elements.emptyState.style.display = 'flex';
      elements.taskList.style.display = 'none';

      if (searchQuery) {
        elements.emptyTitle.textContent = 'No matching tasks';
        elements.emptyDesc.textContent = `No tasks matched "${searchQuery}". Try clearing search.`;
      } else if (selectedDateFilter) {
        elements.emptyTitle.textContent = 'No tasks for this date';
        elements.emptyDesc.textContent = 'No tasks scheduled for the selected calendar day.';
      } else if (currentStatusFilter === 'completed') {
        elements.emptyTitle.textContent = 'No completed tasks';
        elements.emptyDesc.textContent = 'Finish a task to see your achievements here.';
      } else {
        elements.emptyTitle.textContent = 'All caught up!';
        elements.emptyDesc.textContent = 'No tasks in this view. Enjoy your day or create a new goal.';
      }
    } else {
      elements.emptyState.style.display = 'none';
      elements.taskList.style.display = 'flex';

      filtered.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-card-item prio-${task.priority} ${task.completed ? 'completed' : ''}`;
        li.setAttribute('data-id', task.id);

        const titleHtml = highlightText(task.title, searchQuery);
        const descHtml = task.description ? highlightText(task.description, searchQuery) : '';

        li.innerHTML = `
          <div class="card-top-row">
            <div class="card-tags-cluster">
              <span class="tag-prio-pill ${task.priority}">${task.priority} Priority</span>
              <span class="tag-time-pill">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
                <span>${task.time || (task.dueDate ? task.dueDate : 'Today')}</span>
              </span>
              <span class="tag-cat-pill">${task.category}</span>
            </div>
            <label class="custom-checkbox-wrapper" for="cb-${task.id}">
              <input type="checkbox" id="cb-${task.id}" class="task-checkbox" data-id="${task.id}" aria-label="Mark task '${escapeHtml(task.title)}' as ${task.completed ? 'incomplete' : 'completed'}" ${task.completed ? 'checked' : ''} />
              <div class="circular-check-btn" aria-hidden="true">
                ${task.completed ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>' : ''}
              </div>
            </label>
          </div>

          <h4 class="task-main-title">${titleHtml}</h4>
          ${descHtml ? `<p class="task-desc-text">${descHtml}</p>` : ''}

          <div class="card-bottom-actions">
            <span class="card-status-label">${task.completed ? 'Completed' : 'In Progress'}</span>
            <div class="card-action-icons">
              <button class="icon-btn-micro btn-edit edit-btn" data-action="edit" title="Edit task" aria-label="Edit task: ${escapeHtml(task.title)}">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
              </button>
              <button class="icon-btn-micro btn-del delete-btn" data-action="delete" title="Delete task" aria-label="Delete task: ${escapeHtml(task.title)}">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </div>
        `;

        // Native Checkbox change listener
        const checkbox = li.querySelector('.task-checkbox');
        if (checkbox) {
          checkbox.addEventListener('change', (e) => {
            e.stopPropagation();
            toggleTaskCompletion(task.id);
          });
        }

        // Edit button
        li.querySelector('.btn-edit').addEventListener('click', (e) => {
          e.stopPropagation();
          openEditModal(task);
        });

        // Delete button
        li.querySelector('.btn-del').addEventListener('click', (e) => {
          e.stopPropagation();
          deleteTask(task.id);
        });

        elements.taskList.appendChild(li);
      });
    }

    // 4. Update Statistics & Counters
    updateStatistics();
    syncNavigationUI();
  }

  // --- Statistics & KPI Donut Update ---
  function updateStatistics() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const highPrio = tasks.filter(t => t.priority === 'High' && !t.completed).length;
    const mediumPrio = tasks.filter(t => t.priority === 'Medium').length;
    const lowPrio = tasks.filter(t => t.priority === 'Low').length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Numerical stats & Test Runner Aliases
    if (elements.statTotal) elements.statTotal.textContent = total;
    if (elements.totalTasks) elements.totalTasks.textContent = total;
    if (elements.statCompleted) elements.statCompleted.textContent = completed;
    if (elements.completedTasks) elements.completedTasks.textContent = completed;
    if (elements.statPending) elements.statPending.textContent = pending;
    if (elements.pendingTasks) elements.pendingTasks.textContent = pending;
    if (elements.statHigh) elements.statHigh.textContent = highPrio;
    if (elements.statPercentage) elements.statPercentage.textContent = `${percentage}%`;

    // Linear progress bar & quote
    if (elements.progressBarFill) elements.progressBarFill.style.width = `${percentage}%`;
    const progressBarWrapper = document.getElementById('progressBarWrapper');
    if (progressBarWrapper) progressBarWrapper.setAttribute('aria-valuenow', percentage);

    if (elements.motivationQuote) {
      if (total === 0) elements.motivationQuote.textContent = 'Add your first task to get started.';
      else if (percentage === 100) elements.motivationQuote.textContent = 'Superb! All tasks completed today! 🎉';
      else if (percentage >= 50) elements.motivationQuote.textContent = `Great momentum! ${percentage}% accomplished.`;
      else elements.motivationQuote.textContent = 'Focus on one high-priority goal at a time.';
    }

    // Quick chips counts
    if (elements.chipAllCount) elements.chipAllCount.textContent = `${total} tasks`;
    if (elements.chipActiveCount) elements.chipActiveCount.textContent = `${pending} pending`;
    if (elements.chipHighCount) elements.chipHighCount.textContent = `${highPrio} urgent`;
    if (elements.chipCompletedCount) elements.chipCompletedCount.textContent = `${completed} done`;

    // Status tabs count bubbles
    if (elements.countAll) elements.countAll.textContent = total;
    if (elements.countActive) elements.countActive.textContent = pending;
    if (elements.countCompleted) elements.countCompleted.textContent = completed;

    // Desktop sidebar counts
    if (elements.sideCountAll) elements.sideCountAll.textContent = total;
    if (elements.sideCountActive) elements.sideCountActive.textContent = pending;
    if (elements.sideCountCompleted) elements.sideCountCompleted.textContent = completed;
    if (elements.sideCountHigh) elements.sideCountHigh.textContent = tasks.filter(t => t.priority === 'High').length;
    if (elements.sideCountMedium) elements.sideCountMedium.textContent = mediumPrio;
    if (elements.sideCountLow) elements.sideCountLow.textContent = lowPrio;

    // Showing text
    if (elements.showingCountText) {
      elements.showingCountText.textContent = `Showing ${elements.taskList.children.length} of ${total} tasks`;
    }

    // Enable/disable clear completed buttons
    const hasCompleted = completed > 0;
    if (elements.clearCompletedBtn) elements.clearCompletedBtn.disabled = !hasCompleted;
    if (elements.mobileClearCompletedBtn) elements.mobileClearCompletedBtn.style.opacity = hasCompleted ? '1' : '0.4';

    // SVG Donut Chart Calculation (radius = 45, circumference = 2 * PI * 45 = 282.74)
    const C = 282.74;
    const doneRatio = total > 0 ? completed / total : 0;
    const progRatio = total > 0 ? pending / total : 0;
    const highRatio = total > 0 ? highPrio / total : 0;

    const doneLen = doneRatio * C;
    const progLen = progRatio * C;
    const highLen = highRatio * C;

    if (elements.donutDoneSeg) {
      elements.donutDoneSeg.style.strokeDasharray = `${doneLen} ${C - doneLen}`;
      elements.donutDoneSeg.style.strokeDashoffset = '0';
    }
    if (elements.donutProgSeg) {
      elements.donutProgSeg.style.strokeDasharray = `${progLen} ${C - progLen}`;
      elements.donutProgSeg.style.strokeDashoffset = `${-doneLen}`;
    }
    if (elements.donutHighSeg) {
      elements.donutHighSeg.style.strokeDasharray = `${highLen} ${C - highLen}`;
      elements.donutHighSeg.style.strokeDashoffset = `${-(doneLen + progLen)}`;
    }
  }

  // --- Utility: Highlight Search Text ---
  function highlightText(text, query) {
    if (!query) return escapeHtml(text);
    const escapedText = escapeHtml(text);
    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
    return escapedText.replace(regex, '<mark style="background: rgba(139, 92, 246, 0.35); color: #fff; border-radius: 4px; padding: 0 2px;">$1</mark>');
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Start the application
  init();
})();
