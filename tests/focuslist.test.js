import { describe, it, expect, beforeEach } from 'vitest';
import { store } from '../src/state.js';
import { INITIAL_TASKS, loadTasksFromStorage, saveTasksToStorage } from '../src/utils/storage.js';

describe('FocusList Task Management Engine', () => {
  beforeEach(() => {
    localStorage.clear();
    store.tasks = [
      { id: 't-1', title: 'Task Alpha', priority: 'high', completed: false, createdAt: Date.now() },
      { id: 't-2', title: 'Task Beta', priority: 'medium', completed: true, createdAt: Date.now() },
      { id: 't-3', title: 'Task Gamma', priority: 'low', completed: false, createdAt: Date.now() }
    ];
    store.statusFilter = 'all';
    store.priorityFilter = 'all';
    store.searchQuery = '';
    store.lastDeletedTask = null;
  });

  describe('1. Task Creation & Validation', () => {
    it('creates a new task with title and specified priority', () => {
      const task = store.addTask('Complete unit testing', 'high');
      expect(task).toBeDefined();
      expect(task.title).toBe('Complete unit testing');
      expect(task.priority).toBe('high');
      expect(task.completed).toBe(false);
      expect(store.tasks[0].id).toBe(task.id);
    });

    it('defaults to medium priority when an invalid priority is provided', () => {
      const task = store.addTask('Test default priority', 'invalid-priority');
      expect(task.priority).toBe('medium');
    });

    it('rejects empty or whitespace-only task titles', () => {
      expect(() => store.addTask('')).toThrow('Task title cannot be empty.');
      expect(() => store.addTask('    ')).toThrow('Task title cannot be empty.');
    });
  });

  describe('2. Task Management (Completion, Edit, Delete, Undo)', () => {
    it('toggles task completion status', () => {
      const wasPending = store.tasks.find((t) => t.id === 't-1').completed;
      expect(wasPending).toBe(false);

      const toggled = store.toggleTask('t-1');
      expect(toggled).toBe(true);
      expect(store.tasks.find((t) => t.id === 't-1').completed).toBe(true);

      const toggledBack = store.toggleTask('t-1');
      expect(toggledBack).toBe(false);
      expect(store.tasks.find((t) => t.id === 't-1').completed).toBe(false);
    });

    it('edits an existing task title and priority', () => {
      const updated = store.editTask('t-1', 'Updated Task Alpha Title', 'low');
      expect(updated.title).toBe('Updated Task Alpha Title');
      expect(updated.priority).toBe('low');
      expect(store.tasks.find((t) => t.id === 't-1').title).toBe('Updated Task Alpha Title');
    });

    it('rejects empty title when editing', () => {
      expect(() => store.editTask('t-1', '   ', 'high')).toThrow('Task title cannot be empty.');
    });

    it('deletes a task and allows restoring it via undo', () => {
      const initialCount = store.tasks.length;
      const deleted = store.deleteTask('t-1');
      expect(deleted.id).toBe('t-1');
      expect(store.tasks.length).toBe(initialCount - 1);
      expect(store.tasks.find((t) => t.id === 't-1')).toBeUndefined();

      // Restore via undo
      const restored = store.restoreLastDeleted();
      expect(restored.id).toBe('t-1');
      expect(store.tasks.length).toBe(initialCount);
      expect(store.tasks.find((t) => t.id === 't-1')).toBeDefined();
    });

    it('clears all completed tasks', () => {
      const clearedCount = store.clearCompleted();
      expect(clearedCount).toBe(1);
      expect(store.tasks.every((t) => !t.completed)).toBe(true);
    });
  });

  describe('3. Multi-Criteria Search and Filtering', () => {
    it('filters by status: All, Active, and Completed', () => {
      store.setStatusFilter('all');
      expect(store.getFilteredTasks().length).toBe(3);

      store.setStatusFilter('active');
      const activeTasks = store.getFilteredTasks();
      expect(activeTasks.length).toBe(2);
      expect(activeTasks.every((t) => !t.completed)).toBe(true);

      store.setStatusFilter('completed');
      const completedTasks = store.getFilteredTasks();
      expect(completedTasks.length).toBe(1);
      expect(completedTasks[0].id).toBe('t-2');
    });

    it('filters by priority: High, Medium, Low', () => {
      store.setPriorityFilter('high');
      const highTasks = store.getFilteredTasks();
      expect(highTasks.length).toBe(1);
      expect(highTasks[0].priority).toBe('high');

      store.setPriorityFilter('low');
      const lowTasks = store.getFilteredTasks();
      expect(lowTasks.length).toBe(1);
      expect(lowTasks[0].priority).toBe('low');
    });

    it('searches tasks by title in real-time', () => {
      store.setSearchQuery('Alpha');
      const results = store.getFilteredTasks();
      expect(results.length).toBe(1);
      expect(results[0].title).toBe('Task Alpha');

      store.setSearchQuery('non-existent task query');
      expect(store.getFilteredTasks().length).toBe(0);
    });

    it('combines search, status, and priority simultaneously', () => {
      store.setSearchQuery('Task');
      store.setStatusFilter('active');
      store.setPriorityFilter('high');

      const combined = store.getFilteredTasks();
      expect(combined.length).toBe(1);
      expect(combined[0].id).toBe('t-1');
    });
  });

  describe('4. Task Statistics Calculation', () => {
    it('calculates total, completed, pending counts and completion rate', () => {
      const stats = store.getStats();
      expect(stats.total).toBe(3);
      expect(stats.completed).toBe(1);
      expect(stats.pending).toBe(2);
      expect(stats.rate).toBe(33); // 1/3 ~ 33%
    });

    it('dynamically updates statistics when a task is marked complete', () => {
      store.toggleTask('t-1');
      const stats = store.getStats();
      expect(stats.completed).toBe(2);
      expect(stats.pending).toBe(1);
      expect(stats.rate).toBe(67); // 2/3 ~ 67%
    });
  });

  describe('5. Data Persistence with LocalStorage', () => {
    it('persists tasks to multiple standard localStorage keys', () => {
      store.addTask('Persisted test task', 'low');
      const data1 = localStorage.getItem('focuslist_tasks');
      const data2 = localStorage.getItem('tasks');
      const data3 = localStorage.getItem('focusListTasks');

      expect(data1).toBeTruthy();
      expect(data2).toBeTruthy();
      expect(data3).toBeTruthy();

      const parsed = JSON.parse(data1);
      expect(parsed.some((t) => t.title === 'Persisted test task')).toBe(true);
    });

    it('initializes with seed tasks if localStorage is empty', () => {
      localStorage.clear();
      const loaded = loadTasksFromStorage();
      expect(loaded.length).toBe(INITIAL_TASKS.length);
    });
  });
});
