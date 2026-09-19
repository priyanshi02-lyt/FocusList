/**
 * FocusList — Task Management Application
 * Pure Vanilla JavaScript (Zero External Frameworks, Maximum Performance)
 */

(() => {
  'use strict';

  // --- Storage & State Keys ---
  const STORAGE_KEY = 'focuslist_tasks_v2';
  const THEME_KEY = 'focuslist_theme_v2';

  // --- Initial Starter / Demo Tasks ---
  const INITIAL_TASKS = [
    {
      id: 'task_demo_1',
      title: 'Finalize Hackathon Project presentation & architecture',
      completed: false,
      priority: 'High',
      category: 'Work',
      dueDate: getRelativeDateString(0), // Today
      createdAt: Date.now() - 3600000 * 2
    },
    {
      id: 'task_demo_2',
      title: 'Review responsive mobile layouts and accessibility standards',
      completed: false,
      priority: 'Medium',
      category: 'Study',
      dueDate: getRelativeDateString(1), // Tomorrow
      createdAt: Date.now() - 3600000 * 4
    },
    {
      id: 'task_demo_3',
      title: 'Test LocalStorage data persistence across browser reloads',
      completed: true,
      priority: 'Medium',
      category: 'Urgent',
      dueDate: getRelativeDateString(0),
      createdAt: Date.now() - 3600000 * 6
    },
    {
      id: 'task_demo_4',
      title: 'Drink 2 liters of water and take scheduled stretch break',
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
  let lastDeletedTask = null;
  let undoTimeout = null;

  // --- DOM Element References ---
  const elements = {
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    headerDateText: document.getElementById('headerDateText'),
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
    statusTabs: document.querySelectorAll('.status-tab'),
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
    confettiCanvas: document.getElementById('confettiCanvas')
  };

  // --- Initialization ---
  function init() {
    initTheme();
    initDateDisplay();
    bindEvents();
    render();
  }

  // --- Helper: Relative Date YYYY-MM-DD ---
  function getRelativeDateString(daysOffset) {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    return d.toISOString().split('T')[0];
  }

  // --- Storage Functions ---
  function loadTasks() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse tasks from localStorage:', e);
    }
    // Return sample tasks on initial visit
    saveTasksToStorage(INITIAL_TASKS);
    return [...INITIAL_TASKS];
  }

  function saveTasksToStorage(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save tasks to localStorage:', e);
      showToast('⚠️ Storage quota exceeded or unavailable.', 'error');
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
  }

  // --- Date Display ---
  function initDateDisplay() {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    const today = new Date().toLocaleDateString(undefined, options);
    if (elements.headerDateText) {
      elements.headerDateText.textContent = today;
    }
  }

  // --- Event Bindings ---
  function bindEvents() {
    // Theme toggle
    elements.themeToggleBtn.addEventListener('click', toggleTheme);

    // Title input char counter
    elements.taskTitleInput.addEventListener('input', (e) => {
      elements.charCounter.textContent = `${e.target.value.length}/140`;
    });

    // Priority button label active sync
    document.querySelectorAll('.task-creation-section .priority-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.task-creation-section .priority-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
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

    // Status Tabs Filter
    elements.statusTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        elements.statusTabs.forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        currentStatusFilter = tab.getAttribute('data-filter');
        render();
      });
    });

    // Priority Filter
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
      showToast('Sample tasks loaded! 🚀', 'success');
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
    document.querySelectorAll('#editTaskForm .priority-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#editTaskForm .priority-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // Export Data to JSON
    elements.exportJsonBtn.addEventListener('click', handleExportJson);

    // Import Data from JSON
    elements.importJsonInput.addEventListener('change', handleImportJson);

    // Global Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      // Focus Search on '/'
      if (e.key === '/' && document.activeElement !== elements.taskTitleInput && document.activeElement !== elements.searchInput && !elements.editModal.classList.contains('open')) {
        e.preventDefault();
        elements.searchInput.focus();
      }
      // Escape to close modal
      if (e.key === 'Escape' && elements.editModal.classList.contains('open')) {
        closeEditModal();
      }
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
    // Reset priority to Medium
    document.querySelectorAll('.task-creation-section .priority-btn').forEach(b => b.classList.remove('active'));
    const defaultMedBtn = document.querySelector('.task-creation-section .priority-btn.medium');
    if (defaultMedBtn) {
      defaultMedBtn.classList.add('active');
      const radio = defaultMedBtn.querySelector('input');
      if (radio) radio.checked = true;
    }

    showToast('Task added successfully! ✨', 'success');
    render();
  }

  // --- Task Operations: Toggle Complete ---
  function handleToggleTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    task.completed = !task.completed;
    saveTasksToStorage(tasks);

    if (task.completed) {
      showToast('Task completed! Great job! 🎉', 'success');
      // Check if all pending tasks are completed
      const remainingPending = tasks.filter(t => !t.completed).length;
      if (remainingPending === 0 && tasks.length > 0) {
        triggerConfettiCelebration();
      }
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

    showToastWithUndo(`Deleted "${truncate(deleted.title, 24)}"`, () => {
      // Undo callback
      if (lastDeletedTask) {
        tasks.splice(lastDeletedTask.index, 0, lastDeletedTask.task);
        saveTasksToStorage(tasks);
        lastDeletedTask = null;
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

    if (!confirm(`Are you sure you want to delete all ${completedCount} completed tasks?`)) {
      return;
    }

    tasks = tasks.filter(t => !t.completed);
    saveTasksToStorage(tasks);
    showToast(`Cleared ${completedCount} completed task(s). 🧹`, 'info');
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

    // Set priority radio
    document.querySelectorAll('#editTaskForm .priority-btn').forEach(btn => {
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
    showToast('Task updated successfully! ✏️', 'success');
    render();
  }

  // --- Filter and Sorting Logic ---
  function getFilteredAndSortedTasks() {
    let result = [...tasks];

    // 1. Status Filter
    if (currentStatusFilter === 'active') {
      result = result.filter(t => !t.completed);
    } else if (currentStatusFilter === 'completed') {
      result = result.filter(t => t.completed);
    }

    // 2. Priority Filter
    if (currentPriorityFilter !== 'all') {
      result = result.filter(t => t.priority === currentPriorityFilter);
    }

    // 3. Search Query Filter
    if (searchQuery) {
      result = result.filter(t => t.title.toLowerCase().includes(searchQuery));
    }

    // 4. Sorting
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

  // --- Statistics Calculation & Display ---
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

    // Progress Bar
    elements.progressBarFill.style.width = `${percentage}%`;
    elements.progressBarFill.parentElement.setAttribute('aria-valuenow', percentage);

    // Motivational quote
    let quote = 'Ready to conquer your goals today!';
    if (total === 0) {
      quote = 'Add a task to kickstart your day.';
    } else if (percentage === 100) {
      quote = '🏆 All tasks crushed! You are unstoppable!';
    } else if (percentage >= 75) {
      quote = '⚡ Outstanding progress! Almost finished!';
    } else if (percentage >= 50) {
      quote = '🔥 Over halfway there! Keep this momentum!';
    } else if (percentage > 0) {
      quote = '🌱 Great start! Keep knocking them out!';
    }
    elements.motivationQuote.textContent = quote;

    // Tab count badges
    elements.countAll.textContent = total;
    elements.countActive.textContent = pending;
    elements.countCompleted.textContent = completed;

    // Priority Distribution Bar
    const highCount = tasks.filter(t => t.priority === 'High').length;
    const mediumCount = tasks.filter(t => t.priority === 'Medium').length;
    const lowCount = tasks.filter(t => t.priority === 'Low').length;

    elements.chipHighCount.textContent = highCount;
    elements.chipMediumCount.textContent = mediumCount;
    elements.chipLowCount.textContent = lowCount;

    // Clear completed button state
    elements.clearCompletedBtn.disabled = completed === 0;
  }

  // --- Render DOM ---
  function render() {
    updateStatistics();

    const filteredTasks = getFilteredAndSortedTasks();
    elements.taskList.innerHTML = '';

    // Update Showing Count text
    if (searchQuery || currentStatusFilter !== 'all' || currentPriorityFilter !== 'all') {
      elements.showingCountText.textContent = `Showing ${filteredTasks.length} of ${tasks.length} tasks (filtered)`;
    } else {
      elements.showingCountText.textContent = `Showing ${filteredTasks.length} task${filteredTasks.length === 1 ? '' : 's'}`;
    }

    if (filteredTasks.length === 0) {
      elements.emptyState.style.display = 'flex';
      if (tasks.length === 0) {
        elements.emptyTitle.textContent = 'No Tasks Yet';
        elements.emptyDesc.textContent = 'Looks like your task board is clean. Add your first goal above or load demo tasks!';
        elements.loadSampleTasksBtn.style.display = 'inline-flex';
      } else {
        elements.emptyTitle.textContent = 'No Matching Tasks';
        elements.emptyDesc.textContent = 'No tasks matched your search query or filter criteria. Try adjusting your filters.';
        elements.loadSampleTasksBtn.style.display = 'none';
      }
    } else {
      elements.emptyState.style.display = 'none';

      filteredTasks.forEach(task => {
        const itemEl = document.createElement('li');
        itemEl.className = `task-item ${task.completed ? 'is-completed' : ''}`;
        itemEl.setAttribute('data-priority', task.priority);
        itemEl.setAttribute('data-id', task.id);

        // Due date status formatting
        let dueBadgeHtml = '';
        if (task.dueDate) {
          const isOverdue = !task.completed && new Date(task.dueDate + 'T23:59:59') < new Date();
          dueBadgeHtml = `
            <span class="task-due-badge ${isOverdue ? 'overdue' : ''}" title="Due date">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>${formatDueDate(task.dueDate)}</span>
            </span>
          `;
        }

        // Highlight matching search text
        const displayTitle = highlightMatch(escapeHtml(task.title), searchQuery);

        itemEl.innerHTML = `
          <div class="task-left-col">
            <label class="custom-checkbox-wrap" title="${task.completed ? 'Mark pending' : 'Mark complete'}">
              <input type="checkbox" ${task.completed ? 'checked' : ''} aria-label="Mark task complete" />
              <div class="checkbox-custom">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
            </label>

            <div class="task-details">
              <span class="task-title">${displayTitle}</span>
              <div class="task-meta-row">
                <span class="task-priority-badge badge-${task.priority.toLowerCase()}">
                  <span class="indicator-dot"></span>
                  <span>${task.priority} Priority</span>
                </span>
                ${task.category ? `<span class="task-category-badge">${escapeHtml(task.category)}</span>` : ''}
                ${dueBadgeHtml}
              </div>
            </div>
          </div>

          <div class="task-actions">
            <button class="task-action-btn edit-btn" title="Edit task" aria-label="Edit task">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button class="task-action-btn delete-btn" title="Delete task" aria-label="Delete task">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        `;

        // Checkbox event
        const checkbox = itemEl.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', () => handleToggleTask(task.id));

        // Edit button event
        const editBtn = itemEl.querySelector('.edit-btn');
        editBtn.addEventListener('click', () => openEditModal(task.id));

        // Delete button event
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

  // --- Helper: Highlight Search Matches ---
  function highlightMatch(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
    return text.replace(regex, '<mark class="search-highlight">$1</mark>');
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
    toast.className = `toast toast-${type}`;
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
    toast.className = 'toast toast-undo';
    toast.innerHTML = `
      <span>${message}</span>
      <button class="toast-undo-btn">Undo</button>
    `;

    const undoBtn = toast.querySelector('.toast-undo-btn');
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
    a.download = `focuslist-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Task list exported successfully! 📁', 'success');
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
          render();
          showToast(`Imported ${tasks.length} tasks successfully! 📥`, 'success');
        } else {
          showToast('Invalid JSON file format.', 'error');
        }
      } catch (err) {
        showToast('Error parsing JSON file.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  // --- Confetti Particle Explosion on 100% Finish ---
  function triggerConfettiCelebration() {
    const canvas = elements.confettiCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces = [];
    const colors = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

    for (let i = 0; i < 90; i++) {
      pieces.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        w: Math.random() * 9 + 5,
        h: Math.random() * 9 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 18,
        vy: (Math.random() - 0.7) * 18,
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
        p.vy += 0.35; // gravity
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

      if (alive && frame < 120) {
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
