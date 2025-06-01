
import type { Task } from '@/lib/types';

const TASK_STORAGE_KEY = 'userTasks_v1';

export function getAllStoredTasks(): Task[] {
  if (typeof window === 'undefined') return [];
  try {
    const storedTasks = localStorage.getItem(TASK_STORAGE_KEY);
    const tasks = storedTasks ? JSON.parse(storedTasks) : [];
    // Ensure all tasks have a creation and update timestamp
    return tasks.map((task: Task) => ({
      ...task,
      createdAt: task.createdAt || new Date().toISOString(),
      updatedAt: task.updatedAt || new Date().toISOString(),
    }));
  } catch (error) {
    console.error("Error reading tasks from localStorage:", error);
    return [];
  }
}

export function saveAllStoredTasks(tasks: Task[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error("Error saving tasks to localStorage:", error);
  }
}

export function saveStoredTask(taskToSave: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Task[] {
  let tasks = getAllStoredTasks();
  const now = new Date().toISOString();
  
  if (taskToSave.id) { // Existing task
    const existingIndex = tasks.findIndex(t => t.id === taskToSave.id);
    if (existingIndex > -1) {
      tasks[existingIndex] = { ...tasks[existingIndex], ...taskToSave, updatedAt: now };
    } else { // ID provided but not found, treat as new (though unusual)
      tasks.unshift({ 
        id: taskToSave.id, 
        ...taskToSave, 
        createdAt: now, 
        updatedAt: now 
      });
    }
  } else { // New task
    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      ...taskToSave,
      isCompleted: taskToSave.isCompleted || false,
      createdAt: now,
      updatedAt: now,
    };
    tasks.unshift(newTask);
  }
  
  saveAllStoredTasks(tasks);
  return tasks;
}


export function getStoredTaskById(taskId: string): Task | undefined {
  const tasks = getAllStoredTasks();
  return tasks.find(task => task.id === taskId);
}

export function deleteStoredTaskById(taskId: string): Task[] {
  let tasks = getAllStoredTasks();
  tasks = tasks.filter(t => t.id !== taskId);
  saveAllStoredTasks(tasks);
  return tasks;
}

export function toggleTaskCompletion(taskId: string): Task[] {
  let tasks = getAllStoredTasks();
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  if (taskIndex > -1) {
    tasks[taskIndex].isCompleted = !tasks[taskIndex].isCompleted;
    tasks[taskIndex].updatedAt = new Date().toISOString();
  }
  saveAllStoredTasks(tasks);
  return tasks;
}
