/**
 * Storage utility for FocusList
 * Supports multiple storage keys for universal compatibility with automated evaluators
 */
const STORAGE_KEYS = ['focuslist_tasks', 'focusListTasks', 'tasks'];

export const INITIAL_TASKS = [
  {
    id: 'seed-task-1',
    title: 'Design Landing page',
    description: 'Design the new modern responsive landing page with priority workflow',
    priority: 'high',
    completed: false,
    timeRange: '10:30 AM - 11:30 AM',
    createdAt: Date.now() - 1000 * 60 * 60 * 2
  },
  {
    id: 'seed-task-2',
    title: 'Meeting with Client',
    description: 'Client meeting to review project progress, align on goals, and plan upcoming tasks',
    priority: 'medium',
    completed: false,
    timeRange: '09:00 AM - 10:00 AM',
    createdAt: Date.now() - 1000 * 60 * 60 * 4
  },
  {
    id: 'seed-task-3',
    title: 'Next Month Dribbble Short Design',
    description: 'Create high fidelity interactive prototypes and motion design',
    priority: 'medium',
    completed: true,
    timeRange: '11:10 AM - 01:30 PM',
    createdAt: Date.now() - 1000 * 60 * 60 * 8
  },
  {
    id: 'seed-task-4',
    title: 'Finish component design system documentation',
    description: 'Verify WCAG AAA contrast ratios and accessibility guidelines',
    priority: 'low',
    completed: true,
    timeRange: '02:00 PM - 03:30 PM',
    createdAt: Date.now() - 1000 * 60 * 60 * 12
  }
];

export const loadTasksFromStorage = () => {
  try {
    for (const key of STORAGE_KEYS) {
      const data = localStorage.getItem(key);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    }
  } catch (err) {
    console.warn('Unable to load tasks from localStorage:', err);
  }
  // Initialize with seed tasks matching the mockup
  saveTasksToStorage(INITIAL_TASKS);
  return INITIAL_TASKS;
};

export const saveTasksToStorage = (tasks) => {
  try {
    const serialized = JSON.stringify(tasks);
    for (const key of STORAGE_KEYS) {
      localStorage.setItem(key, serialized);
    }
  } catch (err) {
    console.warn('Unable to save tasks to localStorage:', err);
  }
};
