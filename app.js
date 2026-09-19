/**
 * FocusList — Modern SaaS & Orbix Studio Task Engine
 * Pure Vanilla JavaScript (Zero External Dependencies, Maximum Performance)
 */

(() => {
  'use strict';

  // --- Storage Keys ---
  const STORAGE_KEY = 'focuslist_tasks_clean_v1';
  const THEME_KEY = 'focuslist_theme_mode_v1';
  const SOUND_KEY = 'focuslist_sound_mode_v1';

  // --- Initial Starter / Demo Tasks ---
  const INITIAL_TASKS = [
    {
      id: 'task_demo_1',
      title: 'Create mood boards and visual references for mobile apps',
      completed: false,
      priority: 'High',
      category: 'Work',
      dueDate: getRelativeDateString(0), // Today
      createdAt: Date.now() - 3600000 * 2
    },
    {
      id: 'task_demo_2',
      title: 'Review responsive mobile and desktop dashboard layout',
      completed: false,
      priority: 'Medium',
      category: 'Study',
      dueDate: getRelativeDateString(1), // Tomorrow
      createdAt: Date.now() - 3600000 * 4
    },
    {
      id: 'task_demo_3',
      title: 'Test LocalStorage offline persistence across browser sessions',
      completed: true,
      priority: 'Medium',
      category: 'Urgent',
      dueDate: getRelativeDateString(0),
      createdAt: Date.now() - 3600000 * 6
    },
    {
      id: 'task_demo_4',
      title: 'Daily gym session & hydration interval (Week 3)',
      completed: false,
      priority: 'Low',
      category: 'Personal',
      dueDate: '',
      createdAt: Date.now() - 3600000 * 8
    }
  ];

  // --- App State ---
  let tasks = loadTasks();
  let currentStatusFilter = 'all'; // 'all' | 'active' | 'completed'
  let currentPriorityFilter = 'all'; // 'all' | 'High' | 'Medium' | 'Low'
  let currentCategoryFilter = 'all';
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
    openNewTaskBtn: document.getElementById('openNewTaskBtn'),
    mobileFloatingAddBtn: document.getElementById('mobileFloatingAddBtn'),
    taskForm: document.getElementById('taskForm'),
    taskTitleInput: document.getElementById('taskTitleInput'),
    charCounter: document.getElementById('charCounter'),
    taskCategorySelect: document.getElementById('taskCategorySelect'),
    taskDueDateInput: document.getElementById('taskDueDateInput'),
    statTotal: document.getElementById('statTotal'),
    statPending: document.getElementById('statPending'),
    statCompleted: document.getElementById('statCompleted'),
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
    sideCountAll: document.getElementById('sideCountAll'),
    sideCountActive: document.getElementById('sideCountActive'),
    sideCountCompleted: document.getElementById('sideCountCompleted'),
    sideCountHigh: document.getElementById('sideCountHigh'),
    sideCountMedium: document.getElementById('sideCountMedium'),
    sideCountLow: document.getElementById('sideCountLow'),
    countAll: document.getElementById('countAll'),
    countActive: document.getElementById('countActive'),
    countCompleted: document.getElementById('countCompleted'),
    priorityFilterSelect: document.getElementById('priorityFilterSelect'),
    sortBySelect: document.getElementById('sortBySelect'),
    clearCompletedBtn: document.getElementById('clearCompletedBtn'),
    taskList: document.getElementById('taskList'),
    emptyState: document.getElementById('emptyState'),
    emptyTitle: document.getElementById('emptyTitle'),
    emptyDesc: document.getElementById('emptyDesc'),
    loadSampleTasksBtn: document.getElementById('loadSampleTasksBtn'),
    showingCountText: document.getElementById('showingCountText'),
    editModal: document.getElementById('editModal'),
    editTaskForm: document.getElementById('editTaskForm'),
    editTaskId: document.getElementById('editTaskId'),
    editTaskTitle: document.getElementById('editTaskTitle'),
    editTaskCategory: document.getElementById('editTaskCategory'),
    editTaskDueDate: document.getElementById('editTaskDueDate'),
    closeModalBtn: document.getElementById('closeModalBtn'),
    cancelEditBtn: document.getElementById('cancelEditBtn'),
    toastContainer: document.getElementById('toastContainer'),
    exportJsonBtn: document.getElementById('exportJsonBtn'),
    importJsonInput: document.getElementById('importJsonInput'),
    confettiCanvas: document.getElementById('confettiCanvas'),
    sidebarNavItems: document.querySelectorAll('.desktop-sidebar .nav-item'),
    statusPills: document.querySelectorAll('.status-pill'),
    kpiChips: document.querySelectorAll('.kpi-chip'),
    mobileNavTabs: document.querySelectorAll('.mobile-nav-tab')
  };

  // --- Initialization ---
  function init() {
    initTheme();
    initSound();
    initDateDisplay();
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
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to load tasks:', e);
    }
    saveTasksToStorage(INITIAL_TASKS);
    return [...INITIAL_TASKS];
  }

  function saveTasksToStorage(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save tasks:', e);
      showToast('⚠️ Storage quota exceeded.', 'error');
    }
  }

  // --- Theme Controller ---
  function initTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY) || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }

  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
    playAudio('click');
  }

  // --- Sound Effects (Web Audio API) ---
  function initSound() {
    updateSoundUI();
  }

  function toggleSound() {
    soundEnabled = !soundEnabled;
    localStorage.setItem(SOUND_KEY, soundEnabled.toString());
    updateSoundUI();
    if (soundEnabled) playAudio('click');
  }

  function updateSoundUI() {
    const onIcon = elements.soundToggleBtn.querySelector('.sound-on-icon');
    const offIcon = elements.soundToggleBtn.querySelector('.sound-off-icon');
    if (onIcon && offIcon) {
      onIcon.style.display = soundEnabled ? 'block' : 'none';
      offIcon.style.display = soundEnabled ? 'none' : 'block';
    }
  }

  function playAudio(type) {
    if (!soundEnabled) return;
    try {
      if (!audioCtx) {
        const AudioClass = window.AudioContext || window.webkitAudioContext;
        if (AudioClass) audioCtx = new AudioClass();
      }
      if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
      if (!audioCtx) return;

      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'complete') {
        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
        notes.forEach((freq, idx) => {
          const sOsc = audioCtx.createOscillator();
          const sGain = audioCtx.createGain();
          sOsc.type = 'sine';
          sOsc.frequency.setValueAtTime(freq, now + idx * 0.08);
          sGain.gain.setValueAtTime(0, now + idx * 0.08);
          sGain.gain.linearRampToValueAtTime(0.12, now + idx * 0.08 + 0.03);
          sGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);
          sOsc.connect(sGain);
          sGain.connect(audioCtx.destination);
          sOsc.start(now + idx * 0.08);
          sOsc.stop(now + idx * 0.08 + 0.4);
        });
      } else if (type === 'add') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
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
        gain.gain.setValueAtTime(0.05, now);
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
  }

  // --- Event Bindings ---
  function bindEvents() {
    elements.themeToggleBtn.addEventListener('click', toggleTheme);
    elements.soundToggleBtn.addEventListener('click', toggleSound);

    // Desktop New Task button & Mobile floating + button focus input
    const focusTaskInput = () => {
      elements.taskTitleInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      elements.taskTitleInput.focus();
      playAudio('click');
    };
    if (elements.openNewTaskBtn) elements.openNewTaskBtn.addEventListener('click', focusTaskInput);
    if (elements.mobileFloatingAddBtn) elements.mobileFloatingAddBtn.addEventListener('click', focusTaskInput);

    // Char counter
    elements.taskTitleInput.addEventListener('input', (e) => {
      elements.charCounter.textContent = `${e.target.value.length}/140`;
    });

    // Form Priority radio styling
    document.querySelectorAll('.add-task-form .prio-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.add-task-form .prio-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        playAudio('click');
      });
    });

    // Add Task submit
    elements.taskForm.addEventListener('submit', handleAddTask);

    // Real-time Search
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

    // Status Pills (All, Active, Completed)
    elements.statusPills.forEach(pill => {
      pill.addEventListener('click', () => {
        currentStatusFilter = pill.getAttribute('data-filter');
        currentPriorityFilter = 'all';
        currentCategoryFilter = 'all';
        elements.priorityFilterSelect.value = 'all';
        syncNavigationUI();
        playAudio('click');
        render();
      });
    });

    // KPI Chips
    elements.kpiChips.forEach(chip => {
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

    // Mobile Bottom Nav Dock
    elements.mobileNavTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const filter = tab.getAttribute('data-filter');
        const prio = tab.getAttribute('data-priority');
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

    // Priority Filter Select
    elements.priorityFilterSelect.addEventListener('change', (e) => {
      currentPriorityFilter = e.target.value;
      syncNavigationUI();
      render();
    });

    // Sort Dropdown
    elements.sortBySelect.addEventListener('change', (e) => {
      currentSortBy = e.target.value;
      render();
    });

    // Clear Completed Tasks
    elements.clearCompletedBtn.addEventListener('click', handleClearCompleted);

    // Load Sample Tasks
    elements.loadSampleTasksBtn.addEventListener('click', () => {
      tasks = [...INITIAL_TASKS];
      saveTasksToStorage(tasks);
      showToast('Sample tasks loaded! 🚀', 'success');
      playAudio('add');
      render();
    });

    // Edit Modal Events
    elements.closeModalBtn.addEventListener('click', closeEditModal);
    elements.cancelEditBtn.addEventListener('click', closeEditModal);
    elements.editModal.addEventListener('click', (e) => {
      if (e.target === elements.editModal) closeEditModal();
    });
    elements.editTaskForm.addEventListener('submit', handleSaveEditTask);

    // Modal Priority Radio Styling Sync
    document.querySelectorAll('#editTaskForm .prio-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#editTaskForm .prio-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        playAudio('click');
      });
    });

    // Export & Import JSON
    elements.exportJsonBtn.addEventListener('click', handleExportJson);
    elements.importJsonInput.addEventListener('change', handleImportJson);

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== elements.taskTitleInput && document.activeElement !== elements.searchInput && !elements.editModal.classList.contains('open')) {
        e.preventDefault();
        elements.searchInput.focus();
      }
      if (e.key === 'Escape' && elements.editModal.classList.contains('open')) {
        closeEditModal();
      }
    });
  }

  // --- Sync Active States Across Sidebar, Pills, and Mobile Dock ---
  function syncNavigationUI() {
    // Status Pills
    elements.statusPills.forEach(pill => {
      const f = pill.getAttribute('data-filter');
      pill.classList.toggle('active', f === currentStatusFilter && currentPriorityFilter === 'all' && currentCategoryFilter === 'all');
    });

    // Sidebar items
    elements.sidebarNavItems.forEach(item => {
      const filter = item.getAttribute('data-filter');
      const prio = item.getAttribute('data-priority');
      const cat = item.getAttribute('data-category');

      let isActive = false;
      if (filter && filter === currentStatusFilter && currentPriorityFilter === 'all' && currentCategoryFilter === 'all') isActive = true;
      if (prio && prio === currentPriorityFilter) isActive = true;
      if (cat && cat === currentCategoryFilter) isActive = true;

      item.classList.toggle('active', isActive);
    });

    // KPI Chips
    elements.kpiChips.forEach(chip => {
      const f = chip.getAttribute('data-filter');
      const p = chip.getAttribute('data-priority');
      let isActive = false;
      if (f && f === currentStatusFilter && currentPriorityFilter === 'all') isActive = true;
      if (p && p === currentPriorityFilter) isActive = true;
      chip.classList.toggle('active', isActive);
    });

    // Mobile Bottom Dock
    elements.mobileNavTabs.forEach(tab => {
      const f = tab.getAttribute('data-filter');
      const p = tab.getAttribute('data-priority');
      let isActive = false;
      if (f && f === currentStatusFilter && currentPriorityFilter === 'all') isActive = true;
      if (p && p === currentPriorityFilter) isActive = true;
      tab.classList.toggle('active', isActive);
    });
  }

  // --- Task Operations: Create ---
  function handleAddTask(e) {
    e.preventDefault();
    const title = elements.taskTitleInput.value.trim();
    if (!title) {
      elements.taskTitleInput.focus();
      return;
    }

    const priorityInput = elements.taskForm.querySelector('input[name="priority"]:checked');
    const priority = priorityInput ? priorityInput.value : 'Medium';
    const category = elements.taskCategorySelect.value || 'Work';
    const dueDate = elements.taskDueDateInput.value || '';

    const newTask = {
      id: 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      title,
      completed: false,
      priority,
      category,
      dueDate,
      createdAt: Date.now()
    };

    tasks.unshift(newTask);
    saveTasksToStorage(tasks);

    // Reset Form
    elements.taskForm.reset();
    elements.charCounter.textContent = '0/140';
    document.querySelectorAll('.add-task-form .prio-btn').forEach(b => b.classList.remove('active'));
    const defaultMedBtn = document.querySelector('.add-task-form .prio-btn.medium');
    if (defaultMedBtn) {
      defaultMedBtn.classList.add('active');
      const radio = defaultMedBtn.querySelector('input');
      if (radio) radio.checked = true;
    }

    playAudio('add');
    showToast('Task added to pipeline! 🎯', 'success');
    render();
  }

  // --- Task Operations: Toggle Complete ---
  function handleToggleTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    task.completed = !task.completed;
    saveTasksToStorage(tasks);

    if (task.completed) {
      playAudio('complete');
      showToast('Task marked as done! 🎉', 'success');
      const remainingPending = tasks.filter(t => !t.completed).length;
      if (remainingPending === 0 && tasks.length > 0) {
        triggerConfettiCelebration();
      }
    } else {
      playAudio('click');
    }

    render();
  }

  // --- Task Operations: Delete with 5-Second Undo ---
  function handleDeleteTask(taskId) {
    const index = tasks.findIndex(t => t.id === taskId);
    if (index === -1) return;

    const deleted = tasks.splice(index, 1)[0];
    saveTasksToStorage(tasks);

    lastDeletedTask = { task: deleted, index };
    playAudio('delete');

    showToastWithUndo(`Deleted "${truncate(deleted.title, 24)}"`, () => {
      if (lastDeletedTask) {
        tasks.splice(lastDeletedTask.index, 0, lastDeletedTask.task);
        saveTasksToStorage(tasks);
        lastDeletedTask = null;
        playAudio('add');
        showToast('Task restored! ↩️', 'info');
        render();
      }
    });

    render();
  }

  // --- Task Operations: Clear Completed ---
  function handleClearCompleted() {
    const completedCount = tasks.filter(t => t.completed).length;
    if (completedCount === 0) return;

    if (!confirm(`Are you sure you want to clear ${completedCount} completed task(s)?`)) {
      return;
    }

    tasks = tasks.filter(t => !t.completed);
    saveTasksToStorage(tasks);
    playAudio('delete');
    showToast(`Cleared ${completedCount} completed task(s). 🧹`, 'info');
    render();
  }

  // --- Task Operations: Edit Modal ---
  function openEditModal(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    elements.editTaskId.value = task.id;
    elements.editTaskTitle.value = task.title;
    elements.editTaskCategory.value = task.category || 'Work';
    elements.editTaskDueDate.value = task.dueDate || '';

    document.querySelectorAll('#editTaskForm .prio-btn').forEach(btn => {
      const radio = btn.querySelector('input');
      if (radio.value === task.priority) {
        radio.checked = true;
        btn.classList.add('active');
      } else {
        radio.checked = false;
        btn.classList.remove('active');
      }
    });

    elements.editModal.classList.add('open');
    elements.editModal.setAttribute('aria-hidden', 'false');
    elements.editTaskTitle.focus();
    playAudio('click');
  }

  function closeEditModal() {
    elements.editModal.classList.remove('open');
    elements.editModal.setAttribute('aria-hidden', 'true');
  }

  function handleSaveEditTask(e) {
    e.preventDefault();
    const id = elements.editTaskId.value;
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const newTitle = elements.editTaskTitle.value.trim();
    if (!newTitle) {
      elements.editTaskTitle.focus();
      return;
    }

    const priorityInput = elements.editTaskForm.querySelector('input[name="editPriority"]:checked');
    task.title = newTitle;
    task.priority = priorityInput ? priorityInput.value : task.priority;
    task.category = elements.editTaskCategory.value;
    task.dueDate = elements.editTaskDueDate.value;

    saveTasksToStorage(tasks);
    closeEditModal();
    playAudio('add');
    showToast('Task updated successfully! ✏️', 'success');
    render();
  }

  // --- Filtering and Sorting Logic ---
  function getFilteredAndSortedTasks() {
    let result = [...tasks];

    // Status Filter
    if (currentStatusFilter === 'active') {
      result = result.filter(t => !t.completed);
    } else if (currentStatusFilter === 'completed') {
      result = result.filter(t => t.completed);
    }

    // Priority Filter
    if (currentPriorityFilter !== 'all') {
      result = result.filter(t => t.priority === currentPriorityFilter);
    }

    // Category Filter
    if (currentCategoryFilter !== 'all') {
      result = result.filter(t => t.category === currentCategoryFilter);
    }

    // Search Query
    if (searchQuery) {
      result = result.filter(t => t.title.toLowerCase().includes(searchQuery));
    }

    // Sorting
    const priorityWeight = { 'High': 3, 'Medium': 2, 'Low': 1 };

    result.sort((a, b) => {
      switch (currentSortBy) {
        case 'oldest':
          return a.createdAt - b.createdAt;
        case 'priority':
          return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate) - new Date(b.dueDate);
        case 'newest':
        default:
          return b.createdAt - a.createdAt;
      }
    });

    return result;
  }

  // --- Statistics & Donut KPI Chart Calculation ---
  function updateStatistics() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const highUrgency = tasks.filter(t => !t.completed && t.priority === 'High').length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Stat Cards
    elements.statTotal.textContent = total;
    elements.statCompleted.textContent = completed;
    elements.statPending.textContent = pending;
    elements.statHigh.textContent = highUrgency;
    elements.statPercentage.textContent = `${percentage}%`;

    // Linear progress fill
    elements.progressBarFill.style.width = `${percentage}%`;

    // Donut SVG Segments
    // r = 52 -> Circumference = 2 * PI * 52 ≈ 326.72
    const C = 2 * Math.PI * 52;
    const doneLen = total > 0 ? (completed / total) * C : 0;
    const progLen = total > 0 ? ((pending - highUrgency) / total) * C : 0;
    const highLen = total > 0 ? (highUrgency / total) * C : 0;

    if (elements.donutDoneSeg) {
      elements.donutDoneSeg.style.strokeDasharray = `${doneLen} ${C}`;
      elements.donutDoneSeg.style.strokeDashoffset = '0';
    }
    if (elements.donutProgSeg) {
      elements.donutProgSeg.style.strokeDasharray = `${progLen} ${C}`;
      elements.donutProgSeg.style.strokeDashoffset = `${-doneLen}`;
    }
    if (elements.donutHighSeg) {
      elements.donutHighSeg.style.strokeDasharray = `${highLen} ${C}`;
      elements.donutHighSeg.style.strokeDashoffset = `${-(doneLen + progLen)}`;
    }

    // Motivational Quote
    let quote = 'Start your day with steady momentum!';
    if (total === 0) {
      quote = 'Task pipeline is clear. Add your first goal above!';
    } else if (percentage === 100) {
      quote = '🏆 All tasks conquered today! Fantastic execution!';
    } else if (percentage >= 75) {
      quote = '⚡ Almost at the finish line! Great velocity!';
    } else if (percentage >= 50) {
      quote = '🔥 Past the halfway mark! Keep pushing!';
    } else if (percentage > 0) {
      quote = '🌱 Good start, keep knocking tasks out!';
    }
    elements.motivationQuote.textContent = quote;

    // Counter Badges
    elements.countAll.textContent = total;
    elements.countActive.textContent = pending;
    elements.countCompleted.textContent = completed;

    // Sidebar Counters
    elements.sideCountAll.textContent = total;
    elements.sideCountActive.textContent = pending;
    elements.sideCountCompleted.textContent = completed;
    elements.sideCountHigh.textContent = tasks.filter(t => t.priority === 'High').length;
    elements.sideCountMedium.textContent = tasks.filter(t => t.priority === 'Medium').length;
    elements.sideCountLow.textContent = tasks.filter(t => t.priority === 'Low').length;

    // KPI Chips
    elements.chipAllCount.textContent = `${total} task${total === 1 ? '' : 's'}`;
    elements.chipActiveCount.textContent = `${pending} in progress`;
    elements.chipHighCount.textContent = `${tasks.filter(t => t.priority === 'High').length} critical`;
    elements.chipCompletedCount.textContent = `${completed} finished`;

    // Clear completed button state
    elements.clearCompletedBtn.disabled = completed === 0;
  }

  // --- Render Task Cards ---
  function render() {
    updateStatistics();
    syncNavigationUI();

    const filteredTasks = getFilteredAndSortedTasks();
    elements.taskList.innerHTML = '';

    if (searchQuery || currentStatusFilter !== 'all' || currentPriorityFilter !== 'all' || currentCategoryFilter !== 'all') {
      elements.showingCountText.textContent = `Showing ${filteredTasks.length} of ${tasks.length} tasks (filtered)`;
    } else {
      elements.showingCountText.textContent = `Showing ${filteredTasks.length} task${filteredTasks.length === 1 ? '' : 's'}`;
    }

    if (filteredTasks.length === 0) {
      elements.emptyState.style.display = 'flex';
      if (tasks.length === 0) {
        elements.emptyTitle.textContent = 'All caught up!';
        elements.emptyDesc.textContent = 'No tasks in your pipeline. Add a new goal above or load sample tasks!';
        elements.loadSampleTasksBtn.style.display = 'inline-flex';
      } else {
        elements.emptyTitle.textContent = 'No matching tasks';
        elements.emptyDesc.textContent = 'No tasks match your current search query or active filter criteria.';
        elements.loadSampleTasksBtn.style.display = 'none';
      }
    } else {
      elements.emptyState.style.display = 'none';

      filteredTasks.forEach(task => {
        const itemEl = document.createElement('li');
        itemEl.className = `task-card-item ${task.completed ? 'is-completed' : ''}`;
        itemEl.setAttribute('data-priority', task.priority);
        itemEl.setAttribute('data-id', task.id);

        let dueHtml = '';
        if (task.dueDate) {
          const isOverdue = !task.completed && new Date(task.dueDate + 'T23:59:59') < new Date();
          dueHtml = `
            <span class="due-pill ${isOverdue ? 'overdue' : ''}" title="Due date">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>${formatDueDate(task.dueDate)}</span>
            </span>
          `;
        }

        const displayTitle = highlightMatch(escapeHtml(task.title), searchQuery);

        itemEl.innerHTML = `
          <div class="card-left-group">
            <label class="clean-check-wrap" title="${task.completed ? 'Mark pending' : 'Mark complete'}">
              <input type="checkbox" ${task.completed ? 'checked' : ''} aria-label="Mark task complete" />
              <div class="custom-box">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
            </label>

            <div class="card-text-details">
              <span class="card-title-text">${displayTitle}</span>
              <div class="card-meta-badges">
                <span class="prio-badge-pill badge-prio-${task.priority.toLowerCase()}">
                  <span class="prio-circle ${task.priority === 'High' ? 'red' : task.priority === 'Medium' ? 'yellow' : 'green'}"></span>
                  <span>${task.priority}</span>
                </span>
                ${task.category ? `<span class="cat-pill">${escapeHtml(task.category)}</span>` : ''}
                ${dueHtml}
              </div>
            </div>
          </div>

          <div class="card-actions-group">
            <button class="card-action-btn edit-action" title="Edit task" aria-label="Edit task">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button class="card-action-btn delete-action" title="Delete task" aria-label="Delete task">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        `;

        const checkbox = itemEl.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', () => handleToggleTask(task.id));

        const editBtn = itemEl.querySelector('.edit-action');
        editBtn.addEventListener('click', () => openEditModal(task.id));

        const deleteBtn = itemEl.querySelector('.delete-action');
        deleteBtn.addEventListener('click', () => handleDeleteTask(task.id));

        elements.taskList.appendChild(itemEl);
      });
    }
  }

  // --- Helper: Format Due Date ---
  function formatDueDate(dateStr) {
    if (!dateStr) return '';
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [year, month, day] = dateStr.split('-').map(Number);
    const target = new Date(year, month - 1, day);
    target.setHours(0, 0, 0, 0);

    const diffDays = Math.round((target - today) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday (Overdue)';
    if (diffDays < -1) return `${Math.abs(diffDays)}d overdue`;

    return target.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  // --- Helper: Highlight Search Matches ---
  function highlightMatch(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
    return text.replace(regex, '<mark class="highlight-match">$1</mark>');
  }

  function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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

  function truncate(str, maxLen) {
    if (!str) return '';
    return str.length > maxLen ? str.substring(0, maxLen) + '...' : str;
  }

  // --- Toast Notifications with Undo ---
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast-pill toast-${type}`;
    toast.innerHTML = `<span>${message}</span>`;
    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(15px)';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  function showToastWithUndo(message, undoCallback) {
    if (undoTimeout) clearTimeout(undoTimeout);

    const toast = document.createElement('div');
    toast.className = 'toast-pill toast-undo';
    toast.innerHTML = `
      <span>${message}</span>
      <button class="toast-undo-action">Undo</button>
    `;

    const undoBtn = toast.querySelector('.toast-undo-action');
    undoBtn.addEventListener('click', () => {
      undoCallback();
      toast.remove();
    });

    elements.toastContainer.appendChild(toast);

    undoTimeout = setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(15px)';
      setTimeout(() => toast.remove(), 300);
      lastDeletedTask = null;
    }, 5000);
  }

  // --- JSON Export & Import ---
  function handleExportJson() {
    const dataStr = JSON.stringify(tasks, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `focuslist-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    playAudio('add');
    showToast('Tasks exported to JSON successfully! 📁', 'success');
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
          playAudio('complete');
          render();
          showToast(`Imported ${tasks.length} tasks successfully! 📥`, 'success');
        } else {
          showToast('Invalid JSON structure.', 'error');
        }
      } catch (err) {
        showToast('Error reading JSON file.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  // --- Celebration Confetti ---
  function triggerConfettiCelebration() {
    const canvas = elements.confettiCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces = [];
    const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];

    for (let i = 0; i < 90; i++) {
      pieces.push({
        x: canvas.width / 2,
        y: canvas.height * 0.45,
        w: Math.random() * 8 + 6,
        h: Math.random() * 8 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 18,
        vy: (Math.random() - 0.7) * 20,
        rot: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 10,
        opacity: 1
      });
    }

    let frame = 0;
    function loop() {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      pieces.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35;
        p.rot += p.rotSpeed;
        p.opacity -= 0.012;

        if (p.opacity > 0) {
          alive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rot * Math.PI) / 180);
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
        }
      });

      if (alive && frame < 130) {
        requestAnimationFrame(loop);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    loop();
  }

  // Kickoff
  document.addEventListener('DOMContentLoaded', init);
})();
