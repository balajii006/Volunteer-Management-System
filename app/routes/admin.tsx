import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import AuthGuard from "../components/AuthGuard";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/ToastProvider";
import {
  createNotification,
  deleteUserById,
  getAdminNotificationHistory,
  getUnreadNotifications,
  getUnreadNotificationsCount,
  getUsers,
  mapUserRole,
  sendNotification,
  sendPendingNotifications,
  getEvents,
  getEventParticipants,
  assignTaskToVolunteerForEvent,
  getTasksForEventParticipants,
  deleteNotification,
  type CreateNotificationRequest,
  type NotificationResponse,
  type UserResponse,
  type UserRole,
  type EventResponse,
  type ParticipationResponse,
  type CreateTaskRequest,
} from "../services/events";

export function meta() {
  return [
    { title: "Admin | VolunteerHub" },
    { name: "description", content: "Admin management panel" },
  ];
}

type RoleFilter = "ALL" | UserRole;

function AdminContent() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [users, setUsers] = useState<UserResponse[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState<NotificationResponse[]>([]);
  const [allNotifications, setAllNotifications] = useState<NotificationResponse[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifActionLoading, setNotifActionLoading] = useState(false);
  const [autoSendAfterCreate, setAutoSendAfterCreate] = useState(true);

  // Task assignment state
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [eventParticipants, setEventParticipants] = useState<ParticipationResponse[]>([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState<string>("");
  const [taskAssignments, setTaskAssignments] = useState<Record<string, any[]>>({});
  const [taskAssignmentsLoading, setTaskAssignmentsLoading] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    priority: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH",
    dueDate: "",
  });
  const [taskAssignmentLoading, setTaskAssignmentLoading] = useState(false);

  const [notifForm, setNotifForm] = useState<CreateNotificationRequest>({
    recipientId: "",
    recipientEmail: "",
    type: "EVENT_CREATED",
    subject: "",
    message: "",
    eventId: "",
  });

  const isAdmin = (user?.role ?? "").toUpperCase() === "ADMIN";
  const historyStorageKey = user?.id ? `admin-notification-history-${user.id}` : "";

  useEffect(() => {
    if (!isAdmin) {
      navigate("/", { replace: true });
    }
  }, [isAdmin, navigate]);

  const handleSignOut = () => {
    logout();
    showToast("Logged out", "info");
    navigate("/login", { replace: true });
  };

  const setLoadingFor = (key: string, loading: boolean) => {
    setActionLoading((prev) => ({ ...prev, [key]: loading }));
  };

  const effectiveRoleFilter = useMemo<UserRole | undefined>(() => {
    if (roleFilter === "ALL") return undefined;
    return roleFilter;
  }, [roleFilter]);

  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const data = await getUsers(effectiveRoleFilter);
      setUsers(data);
    } catch (err) {
      console.error(err);
      showToast(((err as any)?.response?.data?.message) || "Failed to load users.", "error");
    } finally {
      setUsersLoading(false);
    }
  };

  const loadNotifications = async () => {
    setNotifLoading(true);
    try {
      const [countData, unreadData, allData] = await Promise.all([
        getUnreadNotificationsCount(),
        getUnreadNotifications(),
        getAdminNotificationHistory(),
      ]);
      setUnreadCount(countData.unreadCount);
      setUnreadNotifications(unreadData);
      let merged = allData;
      if (typeof window !== "undefined" && historyStorageKey) {
        const localRaw = localStorage.getItem(historyStorageKey);
        const localHistory = localRaw ? (JSON.parse(localRaw) as NotificationResponse[]) : [];
        const map = new Map<string, NotificationResponse>();
        for (const item of [...allData, ...localHistory]) {
          map.set(item.id, item);
        }
        merged = Array.from(map.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      }
      setAllNotifications(merged);
    } catch (err) {
      console.error(err);
      showToast(((err as any)?.response?.data?.message) || "Failed to load notifications.", "error");
    } finally {
      setNotifLoading(false);
    }
  };

  const loadEvents = async () => {
    setEventsLoading(true);
    try {
      const data = await getEvents();
      setEvents(data);
    } catch (err) {
      console.error(err);
      showToast(((err as any)?.response?.data?.message) || "Failed to load events.", "error");
    } finally {
      setEventsLoading(false);
    }
  };

  const loadEventParticipants = async (eventId: string) => {
    if (!eventId) return;
    setParticipantsLoading(true);
    try {
      const data = await getEventParticipants(eventId);
      setEventParticipants(data);
      setSelectedVolunteer("");
    } catch (err) {
      console.error(err);
      showToast(((err as any)?.response?.data?.message) || "Failed to load event participants.", "error");
    } finally {
      setParticipantsLoading(false);
    }
  };

  const loadTaskAssignments = async () => {
    setTaskAssignmentsLoading(true);
    try {
      const assignments: Record<string, any[]> = {};
      for (const event of events) {
        const participants = await getEventParticipants(event.id);
        const tasks = await getTasksForEventParticipants(event.id, participants);
        if (tasks.length > 0) {
          assignments[event.id] = tasks;
        }
      }
      setTaskAssignments(assignments);
    } catch (err) {
      console.error(err);
      showToast(((err as any)?.response?.data?.message) || "Failed to load task assignments.", "error");
    } finally {
      setTaskAssignmentsLoading(false);
    }
  };

  const handleAssignTask = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedEvent || !selectedVolunteer || !taskForm.title.trim()) {
      showToast("Please select event, volunteer, and enter task title.", "error");
      return;
    }

    setTaskAssignmentLoading(true);
    try {
      const taskData: CreateTaskRequest = {
        title: taskForm.title.trim(),
        description: taskForm.description.trim() || undefined,
        priority: taskForm.priority,
        dueDate: taskForm.dueDate || undefined,
        eventId: selectedEvent,
        volunteerId: selectedVolunteer,
      };

      await assignTaskToVolunteerForEvent(taskData);
      showToast("Task assigned successfully.", "success");
      
      // Reset form
      setTaskForm({
        title: "",
        description: "",
        priority: "MEDIUM",
        dueDate: "",
      });
      setSelectedVolunteer("");
      
      // Reload task assignments
      await loadTaskAssignments();
    } catch (err) {
      console.error(err);
      showToast(((err as any)?.response?.data?.message) || "Failed to assign task.", "error");
    } finally {
      setTaskAssignmentLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    loadEvents();
  }, [effectiveRoleFilter]);

  useEffect(() => {
    loadNotifications();
    loadTaskAssignments();
  }, [events]);

  const persistNotificationHistory = (items: NotificationResponse[]) => {
    if (typeof window === "undefined" || !historyStorageKey) return;
    localStorage.setItem(historyStorageKey, JSON.stringify(items.slice(0, 200)));
  };

  const handleRoleChange = async (userId: string, role: UserRole) => {
    const key = `role-${userId}`;
    setLoadingFor(key, true);
    try {
      await mapUserRole(userId, role);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
      showToast("User role updated.", "success");
    } catch (err) {
      console.error(err);
      showToast(((err as any)?.response?.data?.message) || "Failed to update role.", "error");
    } finally {
      setLoadingFor(key, false);
    }
  };

  const handleDeleteUser = async (target: UserResponse) => {
    if (target.id === user?.id) {
      showToast("You cannot delete your own admin account here.", "error");
      return;
    }
    if (!window.confirm(`Delete user "${target.username}"?`)) return;

    const key = `delete-${target.id}`;
    setLoadingFor(key, true);
    try {
      await deleteUserById(target.id);
      setUsers((prev) => prev.filter((u) => u.id !== target.id));
      showToast("User deleted.", "success");
    } catch (err) {
      console.error(err);
      showToast(((err as any)?.response?.data?.message) || "Failed to delete user.", "error");
    } finally {
      setLoadingFor(key, false);
    }
  };

  const handleCreateNotification = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setNotifActionLoading(true);
    try {
      const created = await createNotification({
        ...notifForm,
        eventId: notifForm.eventId || null,
      });
      let historyItem: NotificationResponse = created;
      if (autoSendAfterCreate) {
        await sendNotification(created.id);
        historyItem = { ...created, status: "SENT", sentAt: new Date().toISOString() };
      }
      showToast("Notification created.", "success");
      setNotifForm((prev) => ({ ...prev, subject: "", message: "", eventId: "" }));
      setAllNotifications((prev) => {
        const next = [historyItem, ...prev.filter((p) => p.id !== historyItem.id)];
        persistNotificationHistory(next);
        return next;
      });
      await loadNotifications();
    } catch (err) {
      console.error(err);
      showToast(((err as any)?.response?.data?.message) || "Failed to create notification.", "error");
    } finally {
      setNotifActionLoading(false);
    }
  };

  const handleSendPending = async () => {
    setNotifActionLoading(true);
    try {
      await sendPendingNotifications();
      showToast("Pending notifications processed.", "success");
      await loadNotifications();
    } catch (err) {
      console.error(err);
      showToast(((err as any)?.response?.data?.message) || "Failed to send pending notifications.", "error");
    } finally {
      setNotifActionLoading(false);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    if (!window.confirm("Are you sure you want to delete this notification?")) return;
    
    setNotifActionLoading(true);
    try {
      await deleteNotification(notificationId);
      showToast("Notification deleted successfully.", "success");
      await loadNotifications();
    } catch (err) {
      console.error(err);
      showToast(((err as any)?.response?.data?.message) || "Failed to delete notification.", "error");
    } finally {
      setNotifActionLoading(false);
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 text-slate-100">
      <nav className="bg-slate-900/70 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link to="/" className="text-lg font-bold">VolunteerHub</Link>
              <div className="flex items-center gap-1">
                <Link to="/" className="px-3 py-2 rounded-lg text-sm hover:bg-slate-800">Dashboard</Link>
                <Link to="/events" className="px-3 py-2 rounded-lg text-sm hover:bg-slate-800">Events</Link>
                <Link to="/admin" className="px-3 py-2 rounded-lg text-sm bg-sky-600">Admin</Link>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="px-3 py-2 rounded-lg border border-slate-700 bg-slate-900/70 text-sm hover:bg-slate-800"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <section className="rounded-xl border border-slate-700 bg-slate-900/60 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <h1 className="text-2xl font-bold">Admin User Management</h1>
            <div className="flex items-center gap-2">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
                className="rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
              >
                <option value="ALL">All Roles</option>
                <option value="VOLUNTEER">Volunteer</option>
                <option value="ORGANIZER">Organizer</option>
                <option value="ADMIN">Admin</option>
              </select>
              <button onClick={loadUsers} className="px-3 py-2 rounded-lg text-sm bg-sky-600 hover:bg-sky-700">
                Refresh Users
              </button>
            </div>
          </div>

          {usersLoading ? (
            <div className="text-slate-300">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="text-slate-400">No users found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-300">
                    <th className="py-3 px-3 text-left">Username</th>
                    <th className="py-3 px-3 text-left">Email</th>
                    <th className="py-3 px-3 text-left">Phone</th>
                    <th className="py-3 px-3 text-left">Role</th>
                    <th className="py-3 px-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-slate-800">
                      <td className="py-3 px-3">{u.username}</td>
                      <td className="py-3 px-3">{u.email}</td>
                      <td className="py-3 px-3">{u.phoneNumber}</td>
                      <td className="py-3 px-3">
                        <select
                          value={u.role}
                          disabled={!!actionLoading[`role-${u.id}`]}
                          onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                          className="rounded-lg bg-slate-950 border border-slate-700 px-2 py-1 text-xs"
                        >
                          <option value="VOLUNTEER">VOLUNTEER</option>
                          <option value="ORGANIZER">ORGANIZER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </td>
                      <td className="py-3 px-3">
                        <button
                          onClick={() => handleDeleteUser(u)}
                          disabled={!!actionLoading[`delete-${u.id}`] || u.id === user?.id}
                          className="px-3 py-1.5 rounded-lg text-xs bg-red-700 hover:bg-red-800 disabled:opacity-50"
                        >
                          {actionLoading[`delete-${u.id}`] ? "Deleting..." : "Delete"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Notification Service</h2>
              <button
                onClick={handleSendPending}
                disabled={notifActionLoading}
                className="px-3 py-2 rounded-lg text-sm bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
              >
                Send Pending
              </button>
            </div>

            <form onSubmit={handleCreateNotification} className="space-y-3">
              <select
                value={notifForm.recipientId}
                onChange={(e) => {
                  const selectedUser = users.find((u) => u.id === e.target.value);
                  if (!selectedUser) return;
                  setNotifForm((p) => ({
                    ...p,
                    recipientId: selectedUser.id,
                    recipientEmail: selectedUser.email,
                  }));
                }}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
              >
                <option value="">Select recipient user (recommended)</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.username} ({u.role}) - {u.email}
                  </option>
                ))}
              </select>
              <input
                required
                placeholder="Recipient ID"
                value={notifForm.recipientId}
                onChange={(e) => setNotifForm((p) => ({ ...p, recipientId: e.target.value }))}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
              />
              <input
                required
                placeholder="Recipient Email"
                value={notifForm.recipientEmail}
                onChange={(e) => setNotifForm((p) => ({ ...p, recipientEmail: e.target.value }))}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
              />
              <select
                value={notifForm.type}
                onChange={(e) => setNotifForm((p) => ({ ...p, type: e.target.value as CreateNotificationRequest["type"] }))}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
              >
                <option value="EVENT_CREATED">EVENT_CREATED</option>
                <option value="EVENT_UPDATED">EVENT_UPDATED</option>
                <option value="EVENT_CANCELLED">EVENT_CANCELLED</option>
                <option value="VOLUNTEER_REGISTERED">VOLUNTEER_REGISTERED</option>
                <option value="VOLUNTEER_CANCELLED">VOLUNTEER_CANCELLED</option>
                <option value="EVENT_REMINDER">EVENT_REMINDER</option>
                <option value="EVENT_COMPLETED">EVENT_COMPLETED</option>
              </select>
              <input
                required
                placeholder="Subject"
                value={notifForm.subject}
                onChange={(e) => setNotifForm((p) => ({ ...p, subject: e.target.value }))}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
              />
              <textarea
                required
                placeholder="Message"
                value={notifForm.message}
                onChange={(e) => setNotifForm((p) => ({ ...p, message: e.target.value }))}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
                rows={3}
              />
              <input
                placeholder="Event ID (optional)"
                value={notifForm.eventId ?? ""}
                onChange={(e) => setNotifForm((p) => ({ ...p, eventId: e.target.value }))}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
              />
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={autoSendAfterCreate}
                  onChange={(e) => setAutoSendAfterCreate(e.target.checked)}
                />
                Auto-send immediately after create
              </label>
              <button
                type="submit"
                disabled={notifActionLoading}
                className="w-full px-3 py-2 rounded-lg text-sm bg-sky-600 hover:bg-sky-700 disabled:opacity-50"
              >
                Create Notification
              </button>
            </form>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Task Assignment</h2>
              <button
                onClick={loadTaskAssignments}
                disabled={taskAssignmentsLoading}
                className="px-3 py-2 rounded-lg text-sm bg-slate-800 hover:bg-slate-700 disabled:opacity-50"
              >
                Refresh Tasks
              </button>
            </div>

            <form onSubmit={handleAssignTask} className="space-y-3">
              <select
                value={selectedEvent}
                onChange={(e) => {
                  setSelectedEvent(e.target.value);
                  loadEventParticipants(e.target.value);
                }}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
                disabled={eventsLoading}
              >
                <option value="">Select Event</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title} ({event.registeredVolunteers}/{event.requiredVolunteers} volunteers)
                  </option>
                ))}
              </select>

              <select
                value={selectedVolunteer}
                onChange={(e) => setSelectedVolunteer(e.target.value)}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
                disabled={participantsLoading || !selectedEvent}
              >
                <option value="">Select Volunteer</option>
                {eventParticipants.map((participant) => (
                  <option key={participant.id} value={participant.volunteerId}>
                    {participant.volunteerName} - {participant.volunteerEmail}
                  </option>
                ))}
              </select>

              <input
                required
                placeholder="Task Title"
                value={taskForm.title}
                onChange={(e) => setTaskForm((p) => ({ ...p, title: e.target.value }))}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
              />

              <textarea
                placeholder="Task Description (optional)"
                value={taskForm.description}
                onChange={(e) => setTaskForm((p) => ({ ...p, description: e.target.value }))}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
                rows={2}
              />

              <select
                value={taskForm.priority}
                onChange={(e) => setTaskForm((p) => ({ ...p, priority: e.target.value as "LOW" | "MEDIUM" | "HIGH" }))}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
              >
                <option value="LOW">Low Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="HIGH">High Priority</option>
              </select>

              <input
                type="date"
                placeholder="Due Date (optional)"
                value={taskForm.dueDate}
                onChange={(e) => setTaskForm((p) => ({ ...p, dueDate: e.target.value }))}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
              />

              <button
                type="submit"
                disabled={taskAssignmentLoading || !selectedEvent || !selectedVolunteer}
                className="w-full px-3 py-2 rounded-lg text-sm bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
              >
                {taskAssignmentLoading ? "Assigning..." : "Assign Task"}
              </button>
            </form>
          </div>
        </section>

        <section className="rounded-xl border border-slate-700 bg-slate-900/60 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Current Task Assignments</h2>
            <button onClick={loadTaskAssignments} className="px-3 py-2 rounded-lg text-sm bg-slate-800 hover:bg-slate-700">
              Refresh
            </button>
          </div>
          {taskAssignmentsLoading ? (
            <div className="text-slate-300">Loading task assignments...</div>
          ) : Object.keys(taskAssignments).length === 0 ? (
            <div className="text-slate-400">No task assignments found.</div>
          ) : (
            <div className="space-y-4">
              {Object.entries(taskAssignments).map(([eventId, assignments]) => {
                const event = events.find(e => e.id === eventId);
                return (
                  <div key={eventId} className="border border-slate-800 rounded-lg p-4">
                    <h3 className="font-semibold text-slate-100 mb-2">{event?.title || 'Unknown Event'}</h3>
                    <div className="space-y-2">
                      {assignments.map((assignment: any) => (
                        <div key={assignment.volunteerId} className="bg-slate-950/50 rounded p-3">
                          <div className="text-sm font-medium text-slate-100">
                            {assignment.volunteerId} - {assignment.tasks.length} task(s)
                          </div>
                          <div className="mt-2 space-y-1">
                            {assignment.tasks.map((task: any) => (
                              <div key={task.id} className="text-xs text-slate-300 bg-slate-900 rounded p-2">
                                <div className="font-medium">{task.title}</div>
                                <div className="flex gap-2 mt-1">
                                  <span className={`px-1.5 py-0.5 rounded text-xs ${
                                    task.priority === 'HIGH' ? 'bg-red-900/40 text-red-300' :
                                    task.priority === 'MEDIUM' ? 'bg-amber-900/40 text-amber-300' :
                                    'bg-green-900/40 text-green-300'
                                  }`}>
                                    {task.priority}
                                  </span>
                                  <span className={`px-1.5 py-0.5 rounded text-xs ${
                                    task.status === 'DONE' ? 'bg-emerald-900/40 text-emerald-300' :
                                    task.status === 'IN_PROGRESS' ? 'bg-blue-900/40 text-blue-300' :
                                    'bg-slate-800 text-slate-400'
                                  }`}>
                                    {task.status.replace('_', ' ')}
                                  </span>
                                </div>
                                {task.dueDate && (
                                  <div className="text-xs text-slate-500 mt-1">Due: {new Date(task.dueDate).toLocaleDateString()}</div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="rounded-xl border border-slate-700 bg-slate-900/60 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Notification History</h2>
            <button onClick={loadNotifications} className="px-3 py-2 rounded-lg text-sm bg-slate-800 hover:bg-slate-700">
              Refresh
            </button>
          </div>
          <div>
            {notifLoading ? (
              <div className="text-slate-300">Loading notifications...</div>
            ) : allNotifications.length === 0 ? (
              <div className="text-slate-400">
                No notification history returned by backend for this account.
              </div>
            ) : (
              <div className="max-h-[420px] overflow-y-auto space-y-2 pr-1">
                <div className="mb-2 text-xs text-slate-400">
                  Unread count for current account: {unreadCount}
                </div>
                {allNotifications.map((n) => (
                  <div key={n.id} className="rounded-lg border border-slate-700 bg-slate-950/70 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-medium">{n.subject}</div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            n.status === "READ"
                              ? "bg-emerald-900/40 text-emerald-300"
                              : n.status === "SENT"
                                ? "bg-sky-900/40 text-sky-300"
                                : n.status === "PENDING"
                                  ? "bg-amber-900/40 text-amber-300"
                                  : "bg-slate-800 text-slate-300"
                          }`}
                        >
                          {n.status}
                        </span>
                        <button
                          onClick={() => handleDeleteNotification(n.id)}
                          disabled={notifActionLoading}
                          className="p-1 rounded-full text-slate-400 hover:bg-slate-800 hover:text-red-500 transition-colors disabled:opacity-50"
                          title="Delete notification"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="text-xs text-slate-400">{n.type}</div>
                    <div className="text-sm text-slate-300 mt-1">{n.message}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      From: {n.senderName || 'System'}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      To: {n.recipientName || 'N/A'}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Sent: {new Date(n.sentAt || n.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default function AdminPage() {
  return (
    <AuthGuard>
      <AdminContent />
    </AuthGuard>
  );
}
