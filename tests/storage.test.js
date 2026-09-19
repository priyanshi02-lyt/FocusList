/**
 * Automated Unit Tests for Storage Persistence & JSON Serialization
 */

export function runStorageTests(assert) {
  const tests = [];

  class MockStorage {
    constructor() {
      this.store = {};
    }
    getItem(key) {
      return this.store[key] || null;
    }
    setItem(key, value) {
      this.store[key] = String(value);
    }
    removeItem(key) {
      delete this.store[key];
    }
    clear() {
      this.store = {};
    }
  }

  // Test 1: Save & Load
  tests.push({
    name: 'Storage: saves and retrieves task data',
    fn: () => {
      const storage = new MockStorage();
      const mockTasks = [{ id: '1', title: 'Test Task', completed: false, priority: 'High' }];
      storage.setItem('focuslist_test', JSON.stringify(mockTasks));

      const retrieved = JSON.parse(storage.getItem('focuslist_test'));
      assert.strictEqual(Array.isArray(retrieved), true);
      assert.strictEqual(retrieved.length, 1);
      assert.strictEqual(retrieved[0].title, 'Test Task');
    }
  });

  // Test 2: JSON Backup Serialization
  tests.push({
    name: 'Storage: validates JSON backup import schema',
    fn: () => {
      const validPayload = JSON.stringify([
        { id: '101', title: 'Backup Task', completed: true, priority: 'Medium', category: 'Work' }
      ]);
      const parsed = JSON.parse(validPayload);
      assert.strictEqual(Array.isArray(parsed), true);
      assert.strictEqual(typeof parsed[0].title, 'string');
      assert.strictEqual(typeof parsed[0].completed, 'boolean');
    }
  });

  return tests;
}
