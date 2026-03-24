export interface HourLog {
  id: string;
  date: string;
  hours: number;
  activity: string;
  notes?: string;
  createdAt: string;
}

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export interface VolunteerTask {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  createdAt: string;
  eventId?: string;
  eventTitle?: string;
  assignedBy?: string;
}

function getHoursKey(userId: string) {
  return `volunteer-hours-${userId}`;
}

function getTasksKey(userId: string) {
  return `volunteer-tasks-${userId}`;
}

export function getHourLogs(userId: string): HourLog[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(getHoursKey(userId));
  if (!raw) return [];
  try {
    return JSON.parse(raw) as HourLog[];
  } catch {
    return [];
  }
}

export function saveHourLogs(userId: string, logs: HourLog[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(getHoursKey(userId), JSON.stringify(logs));
}

export function addHourLog(userId: string, payload: Omit<HourLog, "id" | "createdAt">): HourLog[] {
  const current = getHourLogs(userId);
  const next: HourLog = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...payload,
  };
  const updated = [next, ...current];
  saveHourLogs(userId, updated);
  return updated;
}

export function deleteHourLog(userId: string, id: string): HourLog[] {
  const updated = getHourLogs(userId).filter((log) => log.id !== id);
  saveHourLogs(userId, updated);
  return updated;
}

export function getTasks(userId: string): VolunteerTask[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(getTasksKey(userId));
  if (!raw) return [];
  try {
    return JSON.parse(raw) as VolunteerTask[];
  } catch {
    return [];
  }
}

export function saveTasks(userId: string, tasks: VolunteerTask[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(getTasksKey(userId), JSON.stringify(tasks));
}

export function addTask(userId: string, payload: Omit<VolunteerTask, "id" | "createdAt">): VolunteerTask[] {
  const current = getTasks(userId);
  const next: VolunteerTask = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...payload,
  };
  const updated = [next, ...current];
  saveTasks(userId, updated);
  return updated;
}

export function updateTaskStatus(userId: string, id: string, status: TaskStatus): VolunteerTask[] {
  const updated = getTasks(userId).map((task) => (task.id === id ? { ...task, status } : task));
  saveTasks(userId, updated);
  return updated;
}

export function deleteTask(userId: string, id: string): VolunteerTask[] {
  const updated = getTasks(userId).filter((task) => task.id !== id);
  saveTasks(userId, updated);
  return updated;
}

export function getTasksForEvents(userId: string, eventIds: string[]): VolunteerTask[] {
  if (typeof window === "undefined") return [];
  const allTasks = getTasks(userId);
  return allTasks.filter(task => task.eventId && eventIds.includes(task.eventId));
}

export function assignTaskToVolunteer(userId: string, task: Omit<VolunteerTask, "id" | "createdAt">): VolunteerTask[] {
  const current = getTasks(userId);
  const next: VolunteerTask = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...task,
  };
  const updated = [next, ...current];
  saveTasks(userId, updated);
  return updated;
}

// Helper function to create sample tasks for testing
export function createSampleTaskForEvent(userId: string, eventId: string, eventTitle: string): void {
  if (typeof window === "undefined") return;
  
  const existingTasks = getTasks(userId);
  const sampleTaskTitle = "Setup event venue";

  // Check if a sample task for this event already exists
  const sampleTaskExists = existingTasks.some(
    (task) => task.title === sampleTaskTitle && task.eventId === eventId
  );

  if (sampleTaskExists) {
    console.log("Sample task for this event already exists. Not creating a new one.");
    return;
  }

  const sampleTask: Omit<VolunteerTask, "id" | "createdAt"> = {
    title: sampleTaskTitle,
    description: "Arrange chairs, tables, and registration desk",
    status: "TODO",
    priority: "HIGH",
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days from now
    eventId,
    eventTitle,
    assignedBy: "Admin"
  };
  
  assignTaskToVolunteer(userId, sampleTask);
}
