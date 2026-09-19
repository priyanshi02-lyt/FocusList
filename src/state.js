import { loadTasksFromStorage, saveTasksToStorage } from './utils/storage.js';

class StateManager {
  constructor() {
    this.tasks = loadTasksFromStorage();
    this.statusFilter = 'all'; // 'all' | 'active' | 'completed'
    this.priorityFilter = 'all'; // 'all' | 'high' | 'medium' | 'low'
    this.searchQuery = '';
    this.subscribers = new Set();
    this.lastDeletedTask = null;
    this.theme = (typeof window !== 'undefined' && localStorage.getItem('focuslist_theme')) || 'dark';
  }

  subscribe(listener) {
    this.subscribers.add(listener);
    return () => this.subscribers.delete(listener);
  }

  notify() {
    saveTasksToStorage(this.tasks);
    this.subscribers.forEach((fn) => {
      try {
        fn(this);
      } catch (e) {
        console.error('Subscriber error:', e);
      }
    });
  }

  // --- Task Operations (CRUD) ---

  addTask(title, priority = 'medium') {
    const trimmed = title.trim();
    if (!trimmed) {
      throw new Error('Task title cannot be empty.');
    }

    const validPriority = ['high', 'medium', 'low'].includes(priority.toLowerCase())
      ? priority.toLowerCase()
      : 'medium';

    const newTask = {
      id: 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      title: trimmed,
      priority: validPriority,
      completed: false,
      createdAt: Date.now()
    };

    this.tasks = [newTask, ...this.tasks];
    this.notify();
    return newTask;
  }

  toggleTask(id) {
    let toggledToCompleted = false;
    this.tasks = this.tasks.map((task) => {
      if (task.id === id) {
        const nextCompleted = !task.completed;
        if (nextCompleted) toggledToCompleted = true;
        return { ...task, completed: nextCompleted };
      }
      return task;
    });
    this.notify();
    return toggledToCompleted;
  }

  editTask(id, nextTitle, nextPriority) {
    const trimmed = nextTitle.trim();
    if (!trimmed) {
      throw new Error('Task title cannot be empty.');
    }

    let updated = null;
    this.tasks = this.tasks.map((task) => {
      if (task.id === id) {
        updated = {
          ...task,
          title: trimmed,
          priority: nextPriority || task.priority
        };
        return updated;
      }
      return task;
    });

    this.notify();
    return updated;
  }

  deleteTask(id) {
    const target = this.tasks.find((t) => t.id === id);
    if (target) {
      this.lastDeletedTask = { ...target };
    }
    this.tasks = this.tasks.filter((t) => t.id !== id);
    this.notify();
    return target;
  }

  restoreLastDeleted() {
    if (!this.lastDeletedTask) return null;
    const restored = { ...this.lastDeletedTask };
    this.tasks = [restored, ...this.tasks];
    this.lastDeletedTask = null;
    this.notify();
    return restored;
  }

  clearCompleted() {
    const count = this.tasks.filter((t) => t.completed).length;
    if (count === 0) return 0;
    this.tasks = this.tasks.filter((t) => !t.completed);
    this.notify();
    return count;
  }

  // --- Filtering & Search ---

  setStatusFilter(filter) {
    if (['all', 'active', 'completed'].includes(filter)) {
      this.statusFilter = filter;
      this.notify();
    }
  }

  setPriorityFilter(priority) {
    this.priorityFilter = priority.toLowerCase();
    this.notify();
  }

  setSearchQuery(query) {
    this.searchQuery = query;
    this.notify();
  }

  getFilteredTasks() {
    return this.tasks.filter((task) => {
      // 1. Status Filter
      if (this.statusFilter === 'active' && task.completed) return false;
      if (this.statusFilter === 'completed' && !task.completed) return false;

      // 2. Priority Filter
      if (this.priorityFilter !== 'all' && task.priority !== this.priorityFilter) {
        return false;
      }

      // 3. Search Query
      if (this.searchQuery.trim()) {
        const q = this.searchQuery.toLowerCase().trim();
        return task.title.toLowerCase().includes(q);
      }

      return true;
    });
  }

  // --- Statistics Calculation ---

  getStats() {
    const total = this.tasks.length;
    const completed = this.tasks.filter((t) => t.completed).length;
    const pending = total - completed;
    const rate = total === 0 ? 0 : Math.round((completed / total) * 100);

    return {
      total,
      completed,
      pending,
      rate
    };
  }

  // --- Theme Management ---

  setTheme(theme) {
    this.theme = theme;
    if (typeof window !== 'undefined') {
      localStorage.setItem('focuslist_theme', theme);
      document.documentElement.setAttribute('data-theme', theme);
    }
    this.notify();
  }

  toggleTheme() {
    const next = this.theme === 'dark' ? 'light' : 'dark';
    this.setTheme(next);
  }
}

export const store = new StateManager();
