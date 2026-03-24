import { Link, useNavigate } from "react-router";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import AuthGuard from "../components/AuthGuard";
import { useToast } from "../components/ToastProvider";
import {
  cancelEnrollment,
  getMyParticipations,
  getNotifications,
  markNotificationRead,
  getVolunteerTasks,
  updateTaskStatus,
  deleteAssignedTask,
  type ParticipationResponse,
  type NotificationResponse,
  type VolunteerTask,
  type TaskStatus,
} from "../services/events";
import { getHourLogs, getTasks } from "../services/productivity";

export function meta() {
  return[
    { title: "Dashboard | VolunteerHub" },
    { name: "description", content: "Your Volunteer Management System dashboard" },
  ];
}

function LandingContent() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    showToast("Logged out", "info");
    navigate("/login", { replace: true });
  };
  
  const [participations, setParticipations] = useState<ParticipationResponse[]>([]);
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [volunteerTasks, setVolunteerTasks] = useState<VolunteerTask[]>([]);
  const[dataLoading, setDataLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [markingRead, setMarkingRead] = useState(false);
  const[markingNotification, setMarkingNotification] = useState<Record<string, boolean>>({});
  const [unregistering, setUnregistering] = useState<Record<string, boolean>>({});
  const [expandedNotifications, setExpandedNotifications] = useState<Record<string, boolean>>({});
  const [taskActionLoading, setTaskActionLoading] = useState<Record<string, boolean>>({});
  const [hoursLogged, setHoursLogged] = useState(0);
  const [tasksPending, setTasksPending] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  const setMarkingNotificationFor = (id: string, loading: boolean) =>
    setMarkingNotification((prev) => ({ ...prev, [id]: loading }));

  const setUnregisteringFor = (eventId: string, loading: boolean) =>
    setUnregistering((prev) => ({ ...prev, [eventId]: loading }));

  const setTaskActionLoadingFor = (taskId: string, loading: boolean) =>
    setTaskActionLoading((prev) => ({ ...prev, [taskId]: loading }));

  const sortedNotifications = useMemo(() => {
    return [...notifications].sort((a, b) => {
      if (a.status !== b.status) {
        return a.status === "READ" ? 1 : -1;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [notifications]);

  const unreadCount = notifications.filter((n) => n.status !== "READ").length;

  const fetchDashboardData = async (options?: { isRefresh?: boolean; signal?: AbortSignal }) => {
    const { isRefresh = false, signal } = options ?? {};
    if (signal?.aborted) return false;

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setDataLoading(true);
    }

    try {
      const [participationsData, notificationsData, tasksData] = await Promise.all([
        getMyParticipations(),
        getNotifications(),
        user?.id ? getVolunteerTasks(user.id) : Promise.resolve([]),
      ]);

      if (signal?.aborted) return false;

      setParticipations(participationsData);
      setNotifications(notificationsData);
      setVolunteerTasks(tasksData);
      return true;
    } catch (err) {
      if (!signal?.aborted) {
        console.error("Dashboard data fetch failed", err);
      }
      return false;
    } finally {
      if (!signal?.aborted) {
        setDataLoading(false);
        setRefreshing(false);
      }
    }
  };

  const handleRefresh = async () => {
    const success = await fetchDashboardData({ isRefresh: true });
    if (success) {
      showToast("Data Synchronized", "success");
    } else {
      showToast("Failed to refresh dashboard", "error");
    }
  };

  const handleMarkNotificationRead = async (id: string) => {
    setMarkingNotificationFor(id, true);
    try {
      await markNotificationRead(id);
      const refreshed = await getNotifications();
      setNotifications(refreshed);
      showToast("Notification marked as read", "success");
    } catch (err) {
      console.error(err);
      showToast(((err as any)?.response?.data?.message) || "Failed to mark notification read.", "error");
    } finally {
      setMarkingNotificationFor(id, false);
    }
  };

  const toggleNotificationExpanded = (id: string) => {
    setExpandedNotifications((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleMarkAllRead = async () => {
    setMarkingRead(true);
    try {
      const unread = notifications.filter((n) => n.status !== "READ");
      await Promise.all(unread.map((n) => markNotificationRead(n.id).catch(() => undefined)));
      const refreshed = await getNotifications();
      setNotifications(refreshed);
      showToast("All notifications marked as read", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to mark all notifications as read", "error");
    } finally {
      setMarkingRead(false);
    }
  };

  const handleUnregister = async (eventId: string) => {
    setUnregisteringFor(eventId, true);
    try {
      await cancelEnrollment(eventId);
      showToast("You have been unregistered from the event.", "success");
      await fetchDashboardData();
    } catch (err) {
      console.error(err);
      showToast(((err as any)?.response?.data?.message) || "Failed to unregister.", "error");
    } finally {
      setUnregisteringFor(eventId, false);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    if (!user?.id) return;
    setTaskActionLoadingFor(taskId, true);
    try {
      await updateTaskStatus(user.id, taskId, newStatus);
      showToast("Task status updated.", "success");
      await fetchDashboardData();
    } catch (err) {
      console.error(err);
      showToast(((err as any)?.response?.data?.message) || "Failed to update task status.", "error");
    } finally {
      setTaskActionLoadingFor(taskId, false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!user?.id) return;
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    
    setTaskActionLoadingFor(taskId, true);
    try {
      await deleteAssignedTask(user.id, taskId);
      showToast("Task deleted.", "success");
      await fetchDashboardData();
    } catch (err) {
      console.error(err);
      showToast(((err as any)?.response?.data?.message) || "Failed to delete task.", "error");
    } finally {
      setTaskActionLoadingFor(taskId, false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    const controller = new AbortController();
    fetchDashboardData({ signal: controller.signal });
    return () => controller.abort();
  },[]);

  useEffect(() => {
    if (!user?.id) return;
    const hours = getHourLogs(user.id);
    const tasks = getTasks(user.id);
    setHoursLogged(hours.reduce((sum, item) => sum + item.hours, 0));
    // Use volunteerTasks from API instead of local storage
    setTasksPending(volunteerTasks.filter((t) => t.status !== "DONE").length);
  }, [user?.id, refreshing, dataLoading, volunteerTasks]);

  return (
    <div className="relative min-h-screen text-slate-100">
      {/* BACKGROUND GRADIENT LAYER */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950/95 to-sky-950" />
        <div className="absolute -top-32 -left-24 w-[420px] h-[420px] rounded-full bg-sky-500/25 blur-3xl" />
        <div className="absolute -bottom-40 -right-20 w-[520px] h-[520px] rounded-full bg-orange-500/20 blur-3xl" />
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px]" />
      </div>

      {/* CONTENT LAYER */}
      <div className="relative z-10 flex flex-col">
        {/* Navigation */}
        <nav className="bg-slate-900/60 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-sky-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <span className="text-lg font-bold text-slate-100">VolunteerHub</span>
                </div>
                <div className="hidden sm:flex items-center gap-1">
                  <Link
                    to="/"
                    className="px-3 py-2 rounded-lg text-sm font-medium text-slate-100 bg-sky-600 hover:bg-sky-700 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/events"
                    className="px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:text-slate-50 hover:bg-slate-800 transition-colors"
                  >
                    Events
                  </Link>
                  {(user?.role ?? "").toUpperCase() === "ADMIN" && (
                    <Link
                      to="/admin"
                      className="px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:text-slate-50 hover:bg-slate-800 transition-colors"
                    >
                      Admin
                    </Link>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 text-sm text-slate-200">
                  <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center">
                    <span className="text-sky-400 font-semibold text-xs">
                      {user?.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="font-medium">{user?.username}</span>
                  <span className="px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-medium uppercase">
                    {user?.role}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
          <div className="mb-10 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-100">
                Welcome back, {user?.username}
              </h1>
              <p className="mt-2 text-slate-300">
                Here's an overview of your volunteer dashboard.
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing || dataLoading}
              className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v6h6M20 20v-6h-6m-4 1a8 8 0 1111.314-11.314m0 0L20 4m0 0h-4"
                />
              </svg>
              {refreshing ? "Refreshing..." : "Refresh Dashboard"}
            </button>
          </div>

          {/* Stats Grid */}
          <div
            className={`grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10 transition-all duration-500 ${
              isMounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <div className="bg-slate-900/60 backdrop-blur-md rounded-xl border border-slate-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-slate-300">Upcoming Events</span>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-sky-600">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-100">
                {dataLoading ? "..." : participations.filter((p) => p.status !== "CANCELLED").length}
              </div>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-md rounded-xl border border-slate-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-slate-300">Pending Tasks</span>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-slate-800">
                  <svg className="w-5 h-5 text-slate-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-100">
                {dataLoading ? "..." : tasksPending}
              </div>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-md rounded-xl border border-slate-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-slate-300">Hours Logged</span>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-slate-800">
                  <svg className="w-5 h-5 text-slate-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-100">{hoursLogged.toFixed(1)}</div>
            </div>
          </div>

          {/* Recent Notifications */}
          <div
            className={`bg-slate-900/60 backdrop-blur-md rounded-xl border border-slate-800 p-8 mb-8 transition-all duration-500 ${
              isMounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-100 mb-2">Recent Notifications</h2>
                <p className="text-slate-300">Latest alerts for you.</p>
              </div>
              <button
                onClick={handleMarkAllRead}
                disabled={markingRead || unreadCount === 0}
                className="rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {markingRead ? "Marking..." : "Mark all as read"}
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
              {dataLoading ? (
                <div className="text-slate-300">Fetching notifications...</div>
              ) : sortedNotifications.length === 0 ? (
                <div className="text-slate-400">No notifications yet.</div>
              ) : (
                sortedNotifications.map((note) => (
                  <div
                    key={note.id}
                    className={`rounded-lg p-4 border ${
                      note.status !== "READ"
                        ? "border-sky-500/50 bg-slate-900/80"
                        : "border-slate-800 bg-slate-950/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-slate-100">{note.subject}</div>
                        <div className="text-xs text-slate-400">
                          {new Date(note.createdAt).toLocaleString()}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {note.type ? `Type: ${note.type.replace(/_/g, " ")}` : "Type: Notification"}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          From: {(note as any).senderName || (note as any).senderEmail || "Admin / System"}
                        </div>
                      </div>
                      {note.status !== "READ" ? (
                        <button
                          onClick={() => handleMarkNotificationRead(note.id)}
                          disabled={markingNotification[note.id]}
                          className="inline-flex items-center justify-center rounded-lg bg-slate-800 px-2 py-1 text-xs font-medium text-slate-200 hover:bg-slate-700 disabled:opacity-60 disabled:cursor-not-allowed"
                          title="Mark as read"
                        >
                          {markingNotification[note.id] ? (
                            <span className="h-3 w-3 animate-spin rounded-full border-2 border-slate-200 border-t-transparent" />
                          ) : (
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      ) : null}
                    </div>
                    <p className={`text-sm text-slate-300 mt-2 ${expandedNotifications[note.id] ? "" : "line-clamp-1"}`}>
                      {note.message}
                    </p>
                    <button
                      onClick={() => toggleNotificationExpanded(note.id)}
                      className="mt-2 text-xs text-sky-400 hover:text-sky-300 underline"
                    >
                      {expandedNotifications[note.id] ? "Show less" : "Show full message"}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* My Upcoming Events */}
          <div
            className={`bg-slate-900/60 backdrop-blur-md rounded-xl border border-slate-800 p-8 mb-8 transition-all duration-500 ${
              isMounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <h2 className="text-xl font-semibold text-slate-100 mb-2">My Upcoming Events</h2>
            <p className="text-slate-300 mb-6">Events you are registered for.</p>
            <div className="space-y-2">
              {dataLoading ? (
                <div className="text-slate-300">Fetching participations...</div>
              ) : participations.length === 0 ? (
                <div className="text-slate-400">You have no upcoming events.</div>
              ) : (
                participations
                  .filter((p) => p.status !== "CANCELLED")
                  .map((p) => (
                    <div key={p.id} className="rounded-lg p-4 border border-slate-800 bg-slate-950/50">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-medium text-slate-100">{p.eventTitle}</div>
                        <div className="text-xs text-slate-400">{new Date(p.registeredAt).toLocaleString()}</div>
                      </div>
                      <div className="text-sm text-slate-300 mt-1">Registered on {new Date(p.registeredAt).toLocaleDateString()}</div>
                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={() => handleUnregister(p.eventId)}
                          disabled={unregistering[p.eventId]}
                          className="inline-flex items-center gap-2 rounded-lg bg-red-500/10 text-red-400 px-3 py-2 text-sm font-medium hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {unregistering[p.eventId] ? "Unenrolling..." : "Unenroll"}
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* My Assigned Tasks */}
          <div
            className={`bg-slate-900/60 backdrop-blur-md rounded-xl border border-slate-800 p-8 mb-8 transition-all duration-500 ${
              isMounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <h2 className="text-xl font-semibold text-slate-100 mb-2">My Assigned Tasks</h2>
            <p className="text-slate-300 mb-6">Tasks assigned to you by administrators.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {dataLoading ? (
                <div className="col-span-full text-slate-300">Fetching assigned tasks...</div>
              ) : volunteerTasks.length === 0 ? (
                <div className="col-span-full text-slate-400">No tasks assigned to you yet.</div>
              ) : (
                volunteerTasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-slate-950/50 border border-slate-800 rounded-lg p-4 hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h3 className="font-semibold text-slate-100 text-sm line-clamp-2">{task.title}</h3>
                      <div className="flex gap-1">
                        <span
                          className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${
                            task.priority === "HIGH"
                              ? "bg-red-900/40 text-red-300"
                              : task.priority === "MEDIUM"
                              ? "bg-amber-900/40 text-amber-300"
                              : "bg-green-900/40 text-green-300"
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>
                    </div>
                    
                    {task.description && (
                      <p className="text-xs text-slate-300 mb-3 line-clamp-2">{task.description}</p>
                    )}
                    
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                          task.status === "DONE"
                            ? "bg-emerald-900/40 text-emerald-300"
                            : task.status === "IN_PROGRESS"
                            ? "bg-blue-900/40 text-blue-300"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {task.status.replace("_", " ")}
                      </span>
                      {task.dueDate && (
                        <span className="text-xs text-slate-500">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    
                    {task.eventTitle && (
                      <div className="text-xs text-slate-500 mb-3">
                        Event: {task.eventTitle}
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-1">
                      <select
                        value={task.status}
                        onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value as TaskStatus)}
                        disabled={taskActionLoading[task.id]}
                        className="flex-1 rounded bg-slate-900 border border-slate-700 px-2 py-1 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-600 disabled:opacity-50"
                      >
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="DONE">Done</option>
                      </select>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        disabled={taskActionLoading[task.id]}
                        className="px-2 py-1 rounded bg-red-900/20 text-red-400 text-xs hover:bg-red-900/40 transition-colors disabled:opacity-50"
                      >
                        {taskActionLoading[task.id] ? "..." : "Delete"}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="bg-slate-900/60 backdrop-blur-md rounded-xl border border-slate-800 p-8">
            <h2 className="text-xl font-semibold text-slate-100 mb-2">Quick Actions</h2>
            <p className="text-slate-300 mb-6">Get started with common volunteer activities.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                to="/events"
                className="flex flex-col items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/50 p-6 text-center hover:border-sky-500 hover:bg-sky-900/20 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-sky-600 transition-colors">
                  <svg className="w-6 h-6 text-slate-300 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-slate-100">Browse Events</div>
                  <div className="text-sm text-slate-400 mt-1">Explore upcoming volunteer events</div>
                </div>
              </Link>

              <Link
                to="/log-hours"
                className="flex flex-col items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/50 p-6 text-center hover:border-slate-600 hover:bg-slate-800 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center transition-colors">
                  <svg className="w-6 h-6 text-slate-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-slate-100">Log Hours</div>
                  <div className="text-sm text-slate-400 mt-1">Record your volunteer hours</div>
                </div>
              </Link>
            </div>
          </div>

          {/* Account Info */}
          <div className="mt-8 bg-slate-900/60 backdrop-blur-md rounded-xl border border-slate-800 p-8">
            <h2 className="text-xl font-semibold text-slate-100 mb-6">Account Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-slate-400 mb-1">Username</div>
                <div className="text-slate-100 font-medium">{user?.username || "—"}</div>
              </div>
              <div>
                <div className="text-sm text-slate-400 mb-1">Email</div>
                <div className="text-slate-100 font-medium">{user?.email || "—"}</div>
              </div>
              <div>
                <div className="text-sm text-slate-400 mb-1">Phone</div>
                <div className="text-slate-100 font-medium">{user?.phoneNumber || "—"}</div>
              </div>
              <div>
                <div className="text-sm text-slate-400 mb-1">Role</div>
                <div className="text-slate-100 font-medium">{user?.role || "—"}</div>
              </div>
              <div>
                <div className="text-sm text-slate-400 mb-1">Member since</div>
                <div className="text-slate-100 font-medium">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
                    : "—"}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <AuthGuard>
      <LandingContent />
    </AuthGuard>
  );
}