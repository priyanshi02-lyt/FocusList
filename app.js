/**
 * FocusList — Spatial Task & Priority Engine
 * Pure Vanilla JavaScript (Zero External Dependencies, High Performance)
 */

(() => {
  'use strict';

  // --- Storage & State Keys ---
  const STORAGE_KEY = 'focuslist_tasks_spatial_v1';
  const THEME_KEY = 'focuslist_theme_v2';
  const SOUND_KEY = 'focuslist_sound_v1';

  // --- Initial Starter / Demo Tasks ---
  const INITIAL_TASKS = [
    {
      id: 'task_demo_1',
      title: 'Architect Spatial Interface & Refine Hackathon Delivery',
      completed: false,
      priority: 'High',
      category: 'Work',
      dueDate: getRelativeDateString(0), // Today
      createdAt: Date.now() - 3600000 * 2
    },
    {
      id: 'task_demo_2',
      title: 'Calibrate ambient lighting, 3D parallax & sound harmonics',
      completed: false,
      priority: 'Medium',
      category: 'Study',
      dueDate: getRelativeDateString(1), // Tomorrow
      createdAt: Date.now() - 3600000 * 4
    },
    {
      id: 'task_demo_3',
      title: 'Verify LocalStorage offline persistence across browser sessions',
      completed: true,
      priority: 'Medium',
      category: 'Urgent',
      dueDate: getRelativeDateString(0),
      createdAt: Date.now() - 3600000 * 6
    },
    {
      id: 'task_demo_4',
      title: 'Serene botanical walk & scheduled hydration interval',
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
  let currentSortBy = 'newest';
  let searchQuery = '';
  let soundEnabled = localStorage.getItem(SOUND_KEY) !== 'false';
  let lastDeletedTask = null;
  let undoTimeout = null;
  let audioCtx = null;

  // --- DOM Element References ---
  const elements = {
    spatialContainer: document.getElementById('spatialContainer'),
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    soundToggleBtn: document.getElementById('soundToggleBtn'),
    hudDateText: document.getElementById('hudDateText'),
    goldenFocusDial: document.getElementById('goldenFocusDial'),
    dialRingFill: document.getElementById('dialRingFill'),
    dialPendingCount: document.getElementById('dialPendingCount'),
    statTotal: document.getElementById('statTotal'),
    statPending: document.getElementById('statPending'),
    statCompleted: document.getElementById('statCompleted'),
    statPercentage: document.getElementById('statPercentage'),
    progressBarFill: document.getElementById('progressBarFill'),
    motivationQuote: document.getElementById('motivationQuote'),
    chipHighCount: document.getElementById('chipHighCount'),
    chipMediumCount: document.getElementById('chipMediumCount'),
    chipLowCount: document.getElementById('chipLowCount'),
    taskForm: document.getElementById('taskForm'),
    taskTitleInput: document.getElementById('taskTitleInput'),
    charCounter: document.getElementById('charCounter'),
    taskCategorySelect: document.getElementById('taskCategorySelect'),
    taskDueDateInput: document.getElementById('taskDueDateInput'),
    searchInput: document.getElementById('searchInput'),
    clearSearchBtn: document.getElementById('clearSearchBtn'),
    glassTabs: document.querySelectorAll('.glass-tab'),
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
    aboutProjectBtn: document.getElementById('aboutProjectBtn'),
    aboutModal: document.getElementById('aboutModal'),
    closeAboutModalBtn: document.getElementById('closeAboutModalBtn'),
    dismissAboutBtn: document.getElementById('dismissAboutBtn'),
    toastContainer: document.getElementById('toastContainer'),
    exportJsonBtn: document.getElementById('exportJsonBtn'),
    importJsonInput: document.getElementById('importJsonInput'),
    ambientCanvas: document.getElementById('ambientCanvas'),
    confettiCanvas: document.getElementById('confettiCanvas'),
    navDots: document.querySelectorAll('.nav-dot')
  };

  // --- Initialization ---
  function init() {
    initTheme();
    initSound();
    initDateDisplay();
    initAmbientParticles();
    initParallax3D();
    bindEvents();
    render();
  }

  // --- Helper: Date Calculation ---
  function getRelativeDateString(daysOffset) {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    return d.toISOString().split('T')[0];
  }

  // --- Local Storage Management ---
  function loadTasks() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to load tasks from localStorage:', e);
    }
    saveTasksToStorage(INITIAL_TASKS);
    return [...INITIAL_TASKS];
  }

  function saveTasksToStorage(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to persist tasks:', e);
      showToast('⚠️ Storage quota exceeded.', 'error');
    }
  }

  // --- Theme Controller ---
  function initTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY) || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }

  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
    playSynthesizedAudio('click');
  }

  // --- Date Display ---
  function initDateDisplay() {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    const today = new Date().toLocaleDateString(undefined, options);
    if (elements.hudDateText) {
      elements.hudDateText.textContent = today;
    }
  }

  // --- Sound Effects with Web Audio API ---
  function initSound() {
    updateSoundUI();
  }

  function toggleSound() {
    soundEnabled = !soundEnabled;
    localStorage.setItem(SOUND_KEY, soundEnabled.toString());
    updateSoundUI();
    if (soundEnabled) playSynthesizedAudio('chime');
  }

  function updateSoundUI() {
    const onIcon = elements.soundToggleBtn.querySelector('.sound-on-icon');
    const offIcon = elements.soundToggleBtn.querySelector('.sound-off-icon');
    if (onIcon && offIcon) {
      onIcon.style.display = soundEnabled ? 'block' : 'none';
      offIcon.style.display = soundEnabled ? 'none' : 'block';
    }
  }

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playSynthesizedAudio(type) {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'complete') {
        // Ascending major chord (C5 -> E5 -> G5 -> C6)
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, idx) => {
          const subOsc = ctx.createOscillator();
          const subGain = ctx.createGain();
          subOsc.type = 'sine';
          subOsc.frequency.setValueAtTime(freq, now + idx * 0.08);
          subGain.gain.setValueAtTime(0, now + idx * 0.08);
          subGain.gain.linearRampToValueAtTime(0.12, now + idx * 0.08 + 0.03);
          subGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.4);
          subOsc.connect(subGain);
          subGain.connect(ctx.destination);
          subOsc.start(now + idx * 0.08);
          subOsc.stop(now + idx * 0.08 + 0.45);
        });
      } else if (type === 'add') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'delete') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.2);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.24);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.09);
      }
    } catch (e) {
      // Audio fallback without throwing
    }
  }

  // --- Ambient Floating Dust Particles Canvas ---
  function initAmbientParticles() {
    const canvas = elements.ambientCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const particles = [];
    const count = window.innerWidth < 768 ? 35 : 70;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2 + 0.8,
        vy: -(Math.random() * 0.35 + 0.15),
        vx: (Math.random() - 0.5) * 0.25,
        alpha: Math.random() * 0.6 + 0.2,
        pulse: Math.random() * Math.PI * 2
      });
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

      particles.forEach(p => {
        p.y += p.vy;
        p.x += p.vx;
        p.pulse += 0.02;

        if (p.y < -10) p.y = canvas.height + 10;
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;

        const currentAlpha = Math.max(0.1, p.alpha + Math.sin(p.pulse) * 0.25);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = isDark
          ? `rgba(251, 191, 36, ${currentAlpha * 0.7})`
          : `rgba(217, 119, 6, ${currentAlpha * 0.4})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = isDark ? '#fbbf24' : '#d97706';
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      requestAnimationFrame(animate);
    }
    animate();
  }

  // --- Subtle 3D Parallax Tilt Following Cursor ---
  function initParallax3D() {
    if (window.innerWidth < 1024) return; // Skip on mobile/touch screens

    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    window.addEventListener('mousemove', (e) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      targetX = (e.clientX - centerX) / centerX;
      targetY = (e.clientY - centerY) / centerY;
    });

    function tiltLoop() {
      mouseX += (targetX - mouseX) * 0.06;
      mouseY += (targetY - mouseY) * 0.06;

      const tiltX = -mouseY * 4.5;
      const tiltY = mouseX * 5.5;

      if (elements.spatialContainer) {
        elements.spatialContainer.style.transform = `perspective(1400px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg)`;
      }

      requestAnimationFrame(tiltLoop);
    }
    tiltLoop();
  }

  // --- Event Bindings ---
  function bindEvents() {
    // Theme toggle
    elements.themeToggleBtn.addEventListener('click', toggleTheme);

    // Sound toggle
    elements.soundToggleBtn.addEventListener('click', toggleSound);

    // Title input char counter
    elements.taskTitleInput.addEventListener('input', (e) => {
      elements.charCounter.textContent = `${e.target.value.length}/140`;
    });

    // Priority button label active sync
    document.querySelectorAll('.task-creation-panel .prio-tier-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.task-creation-panel .prio-tier-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        playSynthesizedAudio('click');
      });
    });

    // Add Task Form Submission
    elements.taskForm.addEventListener('submit', handleAddTask);

    // Search Input (Real-time)
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

    // Glass Tabs Filter
    elements.glassTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        elements.glassTabs.forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        currentStatusFilter = tab.getAttribute('data-filter');
        syncSideNav();
        playSynthesizedAudio('click');
        render();
      });
    });

    // Side Navigation Dots (From Video)
    elements.navDots.forEach(dot => {
      dot.addEventListener('click', () => {
        const view = dot.getAttribute('data-view');
        handleNavDotClick(view);
      });
    });

    // Priority Quick Aura Pills
    document.querySelectorAll('.aura-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const p = pill.getAttribute('data-filter-prio');
        elements.priorityFilterSelect.value = (elements.priorityFilterSelect.value === p) ? 'all' : p;
        currentPriorityFilter = elements.priorityFilterSelect.value;
        playSynthesizedAudio('click');
        render();
      });
    });

    // Priority Filter Select
    elements.priorityFilterSelect.addEventListener('change', (e) => {
      currentPriorityFilter = e.target.value;
      render();
    });

    // Sort Dropdown
    elements.sortBySelect.addEventListener('change', (e) => {
      currentSortBy = e.target.value;
      render();
    });

    // Clear Completed Tasks
    elements.clearCompletedBtn.addEventListener('click', handleClearCompleted);

    // Load Sample Tasks Button
    elements.loadSampleTasksBtn.addEventListener('click', () => {
      tasks = [...INITIAL_TASKS];
      saveTasksToStorage(tasks);
      showToast('Sample tasks restored to sanctuary! 🏛️', 'success');
      playSynthesizedAudio('add');
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
    document.querySelectorAll('#editTaskForm .prio-tier-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#editTaskForm .prio-tier-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        playSynthesizedAudio('click');
      });
    });

    // About Modal
    elements.aboutProjectBtn.addEventListener('click', () => {
      elements.aboutModal.classList.add('open');
      elements.aboutModal.setAttribute('aria-hidden', 'false');
      playSynthesizedAudio('click');
    });
    elements.closeAboutModalBtn.addEventListener('click', () => {
      elements.aboutModal.classList.remove('open');
      elements.aboutModal.setAttribute('aria-hidden', 'true');
    });
    elements.dismissAboutBtn.addEventListener('click', () => {
      elements.aboutModal.classList.remove('open');
      elements.aboutModal.setAttribute('aria-hidden', 'true');
    });
    elements.aboutModal.addEventListener('click', (e) => {
      if (e.target === elements.aboutModal) {
        elements.aboutModal.classList.remove('open');
      }
    });

    // Export Data to JSON
    elements.exportJsonBtn.addEventListener('click', handleExportJson);

    // Import Data from JSON
    elements.importJsonInput.addEventListener('change', handleImportJson);

    // Global Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== elements.taskTitleInput && document.activeElement !== elements.searchInput && !elements.editModal.classList.contains('open')) {
        e.preventDefault();
        elements.searchInput.focus();
      }
      if (e.key === 'Escape') {
        elements.editModal.classList.remove('open');
        elements.aboutModal.classList.remove('open');
      }
    });
  }

  // --- Side Nav Dot Sync ---
  function handleNavDotClick(view) {
    if (view === 'all') {
      currentStatusFilter = 'all';
      currentPriorityFilter = 'all';
      elements.priorityFilterSelect.value = 'all';
    } else if (view === 'active') {
      currentStatusFilter = 'active';
      currentPriorityFilter = 'all';
      elements.priorityFilterSelect.value = 'all';
    } else if (view === 'priority') {
      currentStatusFilter = 'all';
      currentPriorityFilter = 'High';
      elements.priorityFilterSelect.value = 'High';
    } else if (view === 'completed') {
      currentStatusFilter = 'completed';
      currentPriorityFilter = 'all';
      elements.priorityFilterSelect.value = 'all';
    }

    elements.glassTabs.forEach(t => {
      const f = t.getAttribute('data-filter');
      t.classList.toggle('active', f === currentStatusFilter);
      t.setAttribute('aria-selected', (f === currentStatusFilter).toString());
    });

    syncSideNav();
    playSynthesizedAudio('click');
    render();
  }

  function syncSideNav() {
    let activeView = 'all';
    if (currentPriorityFilter === 'High') {
      activeView = 'priority';
    } else if (currentStatusFilter === 'active') {
      activeView = 'active';
    } else if (currentStatusFilter === 'completed') {
      activeView = 'completed';
    }

    elements.navDots.forEach(d => {
      d.classList.toggle('active', d.getAttribute('data-view') === activeView);
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
    const category = elements.taskCategorySelect.value || 'General';
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
    document.querySelectorAll('.task-creation-panel .prio-tier-btn').forEach(b => b.classList.remove('active'));
    const defaultMedBtn = document.querySelector('.task-creation-panel .prio-tier-btn.medium');
    if (defaultMedBtn) {
      defaultMedBtn.classList.add('active');
      const radio = defaultMedBtn.querySelector('input');
      if (radio) radio.checked = true;
    }

    playSynthesizedAudio('add');
    showToast('New goal forged into reality! ✨', 'success');
    render();
  }

  // --- Task Operations: Toggle Complete ---
  function handleToggleTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    task.completed = !task.completed;
    saveTasksToStorage(tasks);

    if (task.completed) {
      playSynthesizedAudio('complete');
      showToast('Victory achieved! Goal completed! 🏆', 'success');
      const remainingPending = tasks.filter(t => !t.completed).length;
      if (remainingPending === 0 && tasks.length > 0) {
        triggerConfettiCelebration();
      }
    } else {
      playSynthesizedAudio('click');
    }

    render();
  }

  // --- Task Operations: Delete with Undo Toast ---
  function handleDeleteTask(taskId) {
    const index = tasks.findIndex(t => t.id === taskId);
    if (index === -1) return;

    const deleted = tasks.splice(index, 1)[0];
    saveTasksToStorage(tasks);

    lastDeletedTask = { task: deleted, index };
    playSynthesizedAudio('delete');

    showToastWithUndo(`Dissolved "${truncate(deleted.title, 24)}"`, () => {
      if (lastDeletedTask) {
        tasks.splice(lastDeletedTask.index, 0, lastDeletedTask.task);
        saveTasksToStorage(tasks);
        lastDeletedTask = null;
        playSynthesizedAudio('add');
        showToast('Goal restored to pipeline! ↩️', 'info');
        render();
      }
    });

    render();
  }

  // --- Task Operations: Clear Completed ---
  function handleClearCompleted() {
    const completedCount = tasks.filter(t => t.completed).length;
    if (completedCount === 0) return;

    if (!confirm(`Clear all ${completedCount} completed goals from the pipeline?`)) {
      return;
    }

    tasks = tasks.filter(t => !t.completed);
    saveTasksToStorage(tasks);
    playSynthesizedAudio('delete');
    showToast(`Archived ${completedCount} completed goal(s). 🧹`, 'info');
    render();
  }

  // --- Task Operations: Edit Modal ---
  function openEditModal(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    elements.editTaskId.value = task.id;
    elements.editTaskTitle.value = task.title;
    elements.editTaskCategory.value = task.category || 'General';
    elements.editTaskDueDate.value = task.dueDate || '';

    document.querySelectorAll('#editTaskForm .prio-tier-btn').forEach(btn => {
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
    playSynthesizedAudio('click');
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
    playSynthesizedAudio('add');
    showToast('Goal refined with precision! ✏️', 'success');
    render();
  }

  // --- Filter and Sorting Logic ---
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

  // --- Statistics & Golden Dial Calculation ---
  function updateStatistics() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Stat Cards
    elements.statTotal.textContent = total;
    elements.statCompleted.textContent = completed;
    elements.statPending.textContent = pending;
    elements.statPercentage.textContent = `${percentage}%`;

    // Golden Dial Ring Fill
    if (elements.dialPendingCount) {
      elements.dialPendingCount.textContent = pending;
    }
    if (elements.dialRingFill) {
      const circumference = 2 * Math.PI * 20; // ~125.6
      const offset = circumference - (percentage / 100) * circumference;
      elements.dialRingFill.style.strokeDashoffset = offset.toString();
    }

    // Progress Bar
    elements.progressBarFill.style.width = `${percentage}%`;

    // Dynamic Motivational Quote
    let quote = 'Architect your day with serene focus.';
    if (total === 0) {
      quote = 'Sanctuary is calm. Add your first pursuit.';
    } else if (percentage === 100) {
      quote = '🏛️ Pinnacle reached! Every task conquered.';
    } else if (percentage >= 75) {
      quote = '⚡ Ascendant velocity! Final summit in sight.';
    } else if (percentage >= 50) {
      quote = '🔥 Past the meridian! Unshakable momentum.';
    } else if (percentage > 0) {
      quote = '🌱 The journey has begun. Maintain rhythm.';
    }
    elements.motivationQuote.textContent = quote;

    // Tab badges
    elements.countAll.textContent = total;
    elements.countActive.textContent = pending;
    elements.countCompleted.textContent = completed;

    // Priority Distribution
    const highCount = tasks.filter(t => t.priority === 'High').length;
    const mediumCount = tasks.filter(t => t.priority === 'Medium').length;
    const lowCount = tasks.filter(t => t.priority === 'Low').length;

    elements.chipHighCount.textContent = highCount;
    elements.chipMediumCount.textContent = mediumCount;
    elements.chipLowCount.textContent = lowCount;

    elements.clearCompletedBtn.disabled = completed === 0;
  }

  // --- Render DOM ---
  function render() {
    updateStatistics();

    const filteredTasks = getFilteredAndSortedTasks();
    elements.taskList.innerHTML = '';

    if (searchQuery || currentStatusFilter !== 'all' || currentPriorityFilter !== 'all') {
      elements.showingCountText.textContent = `Showing ${filteredTasks.length} of ${tasks.length} goals (filtered)`;
    } else {
      elements.showingCountText.textContent = `Showing ${filteredTasks.length} goal${filteredTasks.length === 1 ? '' : 's'}`;
    }

    if (filteredTasks.length === 0) {
      elements.emptyState.style.display = 'flex';
      if (tasks.length === 0) {
        elements.emptyTitle.textContent = 'Sanctuary of Clarity';
        elements.emptyDesc.textContent = 'Your task pipeline is serene. Add a new goal above or load demo pursuits.';
        elements.loadSampleTasksBtn.style.display = 'inline-flex';
      } else {
        elements.emptyTitle.textContent = 'No Coinciding Goals';
        elements.emptyDesc.textContent = 'No goals match your current filter parameters or search term.';
        elements.loadSampleTasksBtn.style.display = 'none';
      }
    } else {
      elements.emptyState.style.display = 'none';

      filteredTasks.forEach(task => {
        const itemEl = document.createElement('li');
        itemEl.className = `spatial-task-item ${task.completed ? 'is-completed' : ''}`;
        itemEl.setAttribute('data-priority', task.priority);
        itemEl.setAttribute('data-id', task.id);

        // Due date badge
        let dueBadgeHtml = '';
        if (task.dueDate) {
          const isOverdue = !task.completed && new Date(task.dueDate + 'T23:59:59') < new Date();
          dueBadgeHtml = `
            <span class="due-badge ${isOverdue ? 'overdue' : ''}" title="Target completion date">
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
          <div class="task-left-cluster">
            <label class="spatial-checkbox-wrap" title="${task.completed ? 'Mark pending' : 'Mark completed'}">
              <input type="checkbox" ${task.completed ? 'checked' : ''} aria-label="Mark task complete" />
              <div class="checkbox-gem">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
            </label>

            <div class="task-core-details">
              <span class="task-title-text">${displayTitle}</span>
              <div class="task-badges-row">
                <span class="prio-badge badge-${task.priority.toLowerCase()}">
                  <span class="gem-pulse ${task.priority === 'High' ? 'ruby' : task.priority === 'Medium' ? 'amber' : 'emerald'}"></span>
                  <span>${task.priority} Priority</span>
                </span>
                ${task.category ? `<span class="cat-badge">${escapeHtml(task.category)}</span>` : ''}
                ${dueBadgeHtml}
              </div>
            </div>
          </div>

          <div class="task-actions-cluster">
            <button class="item-action-btn edit-btn" title="Refine task" aria-label="Edit task">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button class="item-action-btn delete-btn" title="Dissolve task" aria-label="Delete task">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        `;

        const checkbox = itemEl.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', () => handleToggleTask(task.id));

        const editBtn = itemEl.querySelector('.edit-btn');
        editBtn.addEventListener('click', () => openEditModal(task.id));

        const deleteBtn = itemEl.querySelector('.delete-btn');
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

  // --- Helper: Highlight Search Match ---
  function highlightMatch(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
    return text.replace(regex, '<mark class="search-match-mark">$1</mark>');
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

  // --- Toast Notifications ---
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast-bubble toast-${type}`;
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
    toast.className = 'toast-bubble toast-undo';
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
    a.download = `focuslist-sanctuary-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    playSynthesizedAudio('add');
    showToast('Task archive exported safely! 📁', 'success');
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
          playSynthesizedAudio('complete');
          render();
          showToast(`Imported ${tasks.length} goals into sanctuary! 📥`, 'success');
        } else {
          showToast('Invalid JSON file structure.', 'error');
        }
      } catch (err) {
        showToast('Error parsing archive file.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  // --- Confetti Particle Celebration ---
  function triggerConfettiCelebration() {
    const canvas = elements.confettiCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces = [];
    const colors = ['#fbbf24', '#f59e0b', '#d97706', '#10b981', '#ff4d6d', '#ffffff'];

    for (let i = 0; i < 110; i++) {
      pieces.push({
        x: canvas.width / 2,
        y: canvas.height * 0.45,
        w: Math.random() * 8 + 6,
        h: Math.random() * 8 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 20,
        vy: (Math.random() - 0.75) * 22,
        rot: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 12,
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
        p.vy += 0.38;
        p.rot += p.rotSpeed;
        p.opacity -= 0.011;

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

      if (alive && frame < 140) {
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
