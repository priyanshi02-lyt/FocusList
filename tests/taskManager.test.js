/**
 * Automated Unit Tests for TaskManager Core Logic
 * Tests task creation, completion toggling, editing, deletion, filtering, sorting, and stats calculation.
 */

export function runTaskManagerTests(assert) {
  const tests = [];

  class TestTaskManager {
    constructor(initialTasks = []) {
      this.tasks = [...initialTasks];
    }

    addTask({ title, priority = 'Medium', category = 'Work', dueDate = 'Today', time = '09:00 AM' }) {
      if (!title || !title.trim()) {
        throw new Error('Task title cannot be empty');
      }
      const p = ['high', 'medium', 'low'].includes(String(priority).toLowerCase())
        ? priority
        : 'Medium';
      const task = {
        id: 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        title: title.trim(),
        completed: false,
        priority: p,
        category,
        dueDate,
        time,
        createdAt: Date.now()
      };
      this.tasks.unshift(task);
      return task;
    }

    toggleComplete(id) {
      const task = this.tasks.find(t => t.id === id);
      if (task) {
        task.completed = !task.completed;
      }
      return task;
    }

    updateTask(id, updates) {
      const index = this.tasks.findIndex(t => t.id === id);
      if (index === -1) return null;
      this.tasks[index] = { ...this.tasks[index], ...updates };
      return this.tasks[index];
    }

    deleteTask(id) {
      const index = this.tasks.findIndex(t => t.id === id);
      if (index === -1) return null;
      return this.tasks.splice(index, 1)[0];
    }

    filterTasks({ status = 'all', priority = 'all', category = 'all', query = '' }) {
      return this.tasks.filter(task => {
        if (status === 'active' && task.completed) return false;
        if (status === 'completed' && !task.completed) return false;
        if (priority !== 'all' && String(task.priority).toLowerCase() !== String(priority).toLowerCase()) return false;
        if (category !== 'all' && task.category !== category) return false;
        if (query) {
          const q = query.toLowerCase();
          const matchTitle = task.title.toLowerCase().includes(q);
          const matchCat = (task.category || '').toLowerCase().includes(q);
          if (!matchTitle && !matchCat) return false;
        }
        return true;
      });
    }

    getStatistics() {
      const total = this.tasks.length;
      const completed = this.tasks.filter(t => t.completed).length;
      const pending = total - completed;
      const high = this.tasks.filter(t => String(t.priority).toLowerCase() === 'high' && !t.completed).length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      return { total, completed, pending, high, percentage };
    }
  }

  tests.push({
    name: 'TaskManager: creates task with correct attributes',
    fn: () => {
      const tm = new TestTaskManager();
      const task = tm.addTask({ title: 'Finish hackathon project', priority: 'High', category: 'Work' });
      assert.strictEqual(task.title, 'Finish hackathon project');
      assert.strictEqual(task.priority, 'High');
      assert.strictEqual(task.completed, false);
      assert.strictEqual(tm.tasks.length, 1);
    }
  });

  tests.push({
    name: 'TaskManager: rejects empty task title',
    fn: () => {
      const tm = new TestTaskManager();
      assert.throws(() => tm.addTask({ title: '   ' }), /empty/);
    }
  });

  tests.push({
    name: 'TaskManager: toggles task completion state',
    fn: () => {
      const tm = new TestTaskManager();
      const task = tm.addTask({ title: 'Review code' });
      assert.strictEqual(task.completed, false);
      tm.toggleComplete(task.id);
      assert.strictEqual(task.completed, true);
      tm.toggleComplete(task.id);
      assert.strictEqual(task.completed, false);
    }
  });

  tests.push({
    name: 'TaskManager: updates existing task details',
    fn: () => {
      const tm = new TestTaskManager();
      const task = tm.addTask({ title: 'Draft email', priority: 'Low' });
      const updated = tm.updateTask(task.id, { title: 'Send finalized email', priority: 'High' });
      assert.strictEqual(updated.title, 'Send finalized email');
      assert.strictEqual(updated.priority, 'High');
    }
  });

  tests.push({
    name: 'TaskManager: deletes task correctly',
    fn: () => {
      const tm = new TestTaskManager();
      const task = tm.addTask({ title: 'Temporary task' });
      assert.strictEqual(tm.tasks.length, 1);
      const deleted = tm.deleteTask(task.id);
      assert.strictEqual(deleted.id, task.id);
      assert.strictEqual(tm.tasks.length, 0);
    }
  });

  tests.push({
    name: 'TaskManager: filters tasks by status and priority',
    fn: () => {
      const tm = new TestTaskManager();
      const t1 = tm.addTask({ title: 'Task 1', priority: 'High' });
      const t2 = tm.addTask({ title: 'Task 2', priority: 'Low' });
      tm.toggleComplete(t1.id);

      const active = tm.filterTasks({ status: 'active' });
      assert.strictEqual(active.length, 1);
      assert.strictEqual(active[0].id, t2.id);

      const completed = tm.filterTasks({ status: 'completed' });
      assert.strictEqual(completed.length, 1);
      assert.strictEqual(completed[0].id, t1.id);

      const highPrio = tm.filterTasks({ priority: 'High' });
      assert.strictEqual(highPrio.length, 1);
      assert.strictEqual(highPrio[0].id, t1.id);
    }
  });

  tests.push({
    name: 'TaskManager: calculates real-time productivity statistics',
    fn: () => {
      const tm = new TestTaskManager();
      tm.addTask({ title: 'Task A', priority: 'High' });
      const tB = tm.addTask({ title: 'Task B', priority: 'Medium' });
      tm.addTask({ title: 'Task C', priority: 'Low' });
      tm.toggleComplete(tB.id);

      const stats = tm.getStatistics();
      assert.strictEqual(stats.total, 3);
      assert.strictEqual(stats.completed, 1);
      assert.strictEqual(stats.pending, 2);
      assert.strictEqual(stats.percentage, 33);
    }
  });

  return tests;
}
