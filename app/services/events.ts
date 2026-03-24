import api from "./api";
import { isAxiosError } from "axios";
import { type VolunteerTask, type TaskStatus, assignTaskToVolunteer, getTasks, getTasksForEvents } from "./productivity";

export interface EventResponse {
  id: string;
  title: string;
  description: string;
  location: string;
  eventDate: string;
  requiredVolunteers: number;
  registeredVolunteers: number;
  organizerId: string;
  organizerName: string;
  status: string;
  averageRating: number;
  createdAt: string;
  updatedAt: string;
}

export async function getEvents(upcoming?: boolean, signal?: AbortSignal): Promise<EventResponse[]> {
  const params = upcoming !== undefined ? { upcoming } : {};
  console.log('Making API call to: /api/events with params:', params);
  const { data } = await api.get<EventResponse[]>("/api/events", { params, signal });
  console.log('API response:', data);
  return data;
}

export interface ParticipationResponse {
  id: string;
  eventId: string;
  eventTitle: string;
  volunteerId: string;
  volunteerName: string;
  volunteerEmail: string;
  status: string;
  rolePlayed: string | null;
  registeredAt: string;
}

export async function enrollInEvent(eventId: string): Promise<ParticipationResponse> {
  try {
    console.log(`Attempting to enroll in event: ${eventId}`);
    const { data } = await api.post<ParticipationResponse>(`/api/participations/events/${eventId}/register`);
    console.log('Enroll successful:', data);
    return data;
  } catch (error) {
    console.error("Error enrolling in event:", error);
    if (isAxiosError(error)) {
      console.error("Error response:", error.response);
      console.error("Error status:", error.response?.status);
      console.error("Error data:", error.response?.data);
    }
    throw error;
  }
}

export async function cancelEnrollment(eventId: string): Promise<{ message: string }> {
  try {
    console.log(`Attempting to cancel enrollment for event: ${eventId}`);
    const { data } = await api.post<{ message: string }>(`/api/participations/events/${eventId}/cancel`);
    console.log('Cancel enrollment successful:', data);
    return data;
  } catch (error) {
    console.error("Error canceling enrollment:", error);
    if (isAxiosError(error)) {
      console.error("Error response:", error.response);
      console.error("Error status:", error.response?.status);
      console.error("Error data:", error.response?.data);
    }
    throw error;
  }
}

export async function getEventParticipants(eventId: string): Promise<ParticipationResponse[]> {
  try {
    const { data } = await api.get<ParticipationResponse[]>(`/api/participations/events/${eventId}/participants`);
    return data;
  } catch {
    // Backward-compat route used in some deployments
    const { data } = await api.get<ParticipationResponse[]>(`/api/participations/events/${eventId}`);
    return data;
  }
}

export async function getMyParticipations(): Promise<ParticipationResponse[]> {
  try {
    const { data } = await api.get<ParticipationResponse[]>("/api/participations/my-participations");
    return data;
  } catch {
    // Fallback if backend exposes /my
    const { data } = await api.get<ParticipationResponse[]>("/api/participations/my");
    return data;
  }
}

export interface NotificationResponse {
  id: string;
  type: string;
  subject: string;
  message: string;
  senderName?: string;
  senderEmail?: string;
  eventId: string | null;
  status: string;
  createdAt: string;
  sentAt: string | null;
  readAt: string | null;
}

export interface CreateNotificationRequest {
  recipientId: string;
  recipientEmail: string;
  type:
    | "EVENT_CREATED"
    | "EVENT_UPDATED"
    | "EVENT_CANCELLED"
    | "VOLUNTEER_REGISTERED"
    | "VOLUNTEER_CANCELLED"
    | "EVENT_REMINDER"
    | "EVENT_COMPLETED";
  subject: string;
  message: string;
  eventId?: string | null;
}

export async function getNotifications(): Promise<NotificationResponse[]> {
  try {
    const { data } = await api.get<NotificationResponse[]>("/api/notifications");
    return data;
  } catch {
    // Backward-compat route
    const { data } = await api.get<NotificationResponse[]>("/api/notifications/my-notifications");
    return data;
  }
}

// Admin history helper:
// tries common admin/global history routes, then falls back to current-user notifications
export async function getAdminNotificationHistory(): Promise<NotificationResponse[]> {
  const candidateRoutes = [
    "/api/notifications/all",
    "/api/notifications/admin/all",
    "/api/notifications/history",
    "/api/notifications/admin/history",
  ];

  for (const route of candidateRoutes) {
    try {
      const { data } = await api.get<NotificationResponse[]>(route);
      return data;
    } catch {
      // Try next route
    }
  }

  // Fallback to current-user feed if global history endpoints are not exposed
  return getNotifications();
}

export async function markNotificationRead(id: string): Promise<{ message: string }> {
  const { data } = await api.put<{ message: string }>(`/api/notifications/${id}/read`);
  return data;
}

export async function markAllNotificationsRead(): Promise<{ message: string }> {
  const { data } = await api.put<{ message: string }>("/api/notifications/read-all");
  return data;
}

export async function getUnreadNotificationsCount(): Promise<{ unreadCount: number }> {
  const { data } = await api.get<{ unreadCount: number }>("/api/notifications/unread-count");
  return data;
}

export async function getUnreadNotifications(): Promise<NotificationResponse[]> {
  const { data } = await api.get<NotificationResponse[]>("/api/notifications/unread");
  return data;
}

export async function createNotification(payload: CreateNotificationRequest): Promise<NotificationResponse> {
  const { data } = await api.post<NotificationResponse>("/api/notifications", payload);
  return data;
}

export async function sendNotification(id: string): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>(`/api/notifications/${id}/send`);
  return data;
}

export async function sendPendingNotifications(): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>("/api/notifications/send-pending");
  return data;
}

export async function deleteNotification(notificationId: string): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(`/api/notifications/${notificationId}`);
  return data;
}

// User Service APIs
export interface UserResponse {
  id: string;
  username: string;
  email: string;
  role: string;
  phoneNumber: string;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = "VOLUNTEER" | "ORGANIZER" | "ADMIN";

export interface LoginResponse {
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
  user: UserResponse;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/api/auth/login", { email, password });
  return data;
}

export async function register(username: string, email: string, password: string, phoneNumber: string): Promise<UserResponse> {
  const { data } = await api.post<UserResponse>("/api/auth/register", {
    username,
    email,
    password,
    phoneNumber
  });
  return data;
}

export async function refreshToken(refreshToken: string): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/api/auth/refresh", { refreshToken });
  return data;
}

export async function getCurrentUser(): Promise<UserResponse> {
  const { data } = await api.get<UserResponse>("/api/users/me");
  return data;
}

export async function updateCurrentUser(userData: Partial<UserResponse>): Promise<UserResponse> {
  const { data } = await api.put<UserResponse>("/api/users/me", userData);
  return data;
}

export async function getUsers(role?: UserRole): Promise<UserResponse[]> {
  const params = role ? { role } : undefined;
  const { data } = await api.get<UserResponse[]>("/api/users", { params });
  return data;
}

export async function getUserById(userId: string): Promise<UserResponse> {
  const { data } = await api.get<UserResponse>(`/api/users/${userId}`);
  return data;
}

export async function updateUserById(userId: string, userData: Partial<UserResponse>): Promise<UserResponse> {
  const { data } = await api.put<UserResponse>(`/api/users/${userId}`, userData);
  return data;
}

export async function mapUserRole(userId: string, role: UserRole): Promise<UserResponse> {
  const { data } = await api.put<UserResponse>(`/api/users/${userId}`, { role });
  return data;
}

export async function deleteUserById(userId: string): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(`/api/users/${userId}`);
  return data;
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>("/api/auth/change-password", {
    currentPassword,
    newPassword
  });
  return data;
}

export async function logout(refreshToken: string): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>("/api/auth/logout", { refreshToken });
  return data;
}

export async function forgotPassword(email: string): Promise<{ message: string; resetToken: string }> {
  const { data } = await api.post<{ message: string; resetToken: string }>("/api/auth/forgot-password", { email });
  return data;
}

export async function resetPassword(resetToken: string, newPassword: string): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>("/api/auth/reset-password", {
    resetToken,
    newPassword
  });
  return data;
}

// Event Management APIs (for organizers)
export interface CreateEventRequest {
  title: string;
  description?: string;
  location: string;
  eventDate: string;
  requiredVolunteers: number;
}

export async function createEvent(eventData: CreateEventRequest): Promise<EventResponse> {
  const { data } = await api.post<EventResponse>("/api/events", eventData);
  return data;
}

export async function updateEvent(eventId: string, eventData: Partial<EventResponse>): Promise<EventResponse> {
  const { data } = await api.put<EventResponse>(`/api/events/${eventId}`, eventData);
  return data;
}

export async function deleteEvent(eventId: string): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(`/api/events/${eventId}`);
  return data;
}

export async function getMyOrganizedEvents(): Promise<EventResponse[]> {
  const { data } = await api.get<EventResponse[]>("/api/events/organizer/my-events");
  return data;
}

// Feedback APIs
export interface FeedbackResponse {
  id: string;
  eventId: string;
  volunteerId: string;
  volunteerName: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface SubmitFeedbackRequest {
  rating: number;
  comment?: string;
}

export async function submitFeedback(eventId: string, feedback: SubmitFeedbackRequest): Promise<FeedbackResponse> {
  const { data } = await api.post<FeedbackResponse>(`/api/feedbacks/events/${eventId}`, feedback);
  return data;
}

export async function getEventFeedbacks(eventId: string): Promise<FeedbackResponse[]> {
  const { data } = await api.get<FeedbackResponse[]>(`/api/feedbacks/events/${eventId}`);
  return data;
}

export async function getEventAverageRating(eventId: string): Promise<number> {
  const { data } = await api.get<number>(`/api/feedbacks/events/${eventId}/average-rating`);
  return data;
}

// Attendance and Role Management (for organizers)
export async function markAttendance(eventId: string, volunteerId: string, attended: boolean): Promise<{ message: string }> {
  const { data } = await api.put<{ message: string }>(`/api/participations/events/${eventId}/volunteers/${volunteerId}/attendance`, null, {
    params: { attended }
  });
  return data;
}

export async function assignRole(eventId: string, volunteerId: string, role: string): Promise<{ message: string }> {
  const { data } = await api.put<{ message: string }>(`/api/participations/events/${eventId}/volunteers/${volunteerId}/role`, null, {
    params: { role }
  });
  return data;
}

export async function markParticipationAttended(participationId: string): Promise<ParticipationResponse> {
  const { data } = await api.put<ParticipationResponse>(`/api/participations/${participationId}/mark-attended`);
  return data;
}

// Task Assignment APIs
export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate?: string;
  eventId: string;
  volunteerId: string;
}

export async function assignTaskToVolunteerForEvent(taskData: CreateTaskRequest): Promise<VolunteerTask> {
  // For now, use local storage. In production, this would be an API call
  const task = assignTaskToVolunteer(taskData.volunteerId, {
    title: taskData.title,
    description: taskData.description,
    priority: taskData.priority,
    dueDate: taskData.dueDate,
    eventId: taskData.eventId,
    eventTitle: "", // This would be populated from event data
    assignedBy: "Admin",
    status: "TODO"
  });
  
  return task[0]; // assignTaskToVolunteer returns array, first element is the new task
}

export async function getVolunteerTasks(volunteerId: string): Promise<VolunteerTask[]> {
  // For now, use local storage. In production, this would be an API call
  return getTasks(volunteerId);
}

export async function updateTaskStatus(volunteerId: string, taskId: string, status: TaskStatus): Promise<VolunteerTask[]> {
  // For now, use local storage. In production, this would be an API call
  const { updateTaskStatus } = await import("./productivity");
  return updateTaskStatus(volunteerId, taskId, status);
}

export async function deleteAssignedTask(volunteerId: string, taskId: string): Promise<VolunteerTask[]> {
  // For now, use local storage. In production, this would be an API call
  const { deleteTask } = await import("./productivity");
  return deleteTask(volunteerId, taskId);
}

export async function getTasksForEventParticipants(eventId: string, participants: ParticipationResponse[]): Promise<{ volunteerId: string; tasks: VolunteerTask[] }[]> {
  const results: { volunteerId: string; tasks: VolunteerTask[] }[] = [];
  
  for (const participant of participants) {
    const tasks = getTasksForEvents(participant.volunteerId, [eventId]);
    if (tasks.length > 0) {
      results.push({
        volunteerId: participant.volunteerId,
        tasks
      });
    }
  }
  
  return results;
}

export default {
  // Events
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getMyOrganizedEvents,
  
  // Participations
  enrollInEvent,
  cancelEnrollment,
  getEventParticipants,
  getMyParticipations,
  markAttendance,
  assignRole,
  markParticipationAttended,
  
  // Notifications
  getNotifications,
  getAdminNotificationHistory,
  markNotificationRead,
  markAllNotificationsRead,
  getUnreadNotificationsCount,
  getUnreadNotifications,
  createNotification,
  sendNotification,
  sendPendingNotifications,
  deleteNotification,
  
  // User/Auth
  login,
  register,
  refreshToken,
  getCurrentUser,
  updateCurrentUser,
  getUsers,
  getUserById,
  updateUserById,
  mapUserRole,
  deleteUserById,
  changePassword,
  logout,
  forgotPassword,
  resetPassword,
  
  // Feedback
  submitFeedback,
  getEventFeedbacks,
  getEventAverageRating,
  
  // Task Assignment
  assignTaskToVolunteerForEvent,
  getVolunteerTasks,
  updateTaskStatus,
  deleteAssignedTask,
  getTasksForEventParticipants
};
