import { useState, useEffect, useMemo, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import AuthGuard from "../components/AuthGuard";
import {
  getEvents,
  enrollInEvent,
  cancelEnrollment,
  getMyParticipations,
  getEventParticipants,
  createEvent,
  deleteEvent,
  getMyOrganizedEvents,
  type EventResponse,
  type ParticipationResponse,
  type CreateEventRequest,
} from "../services/events";
import { useToast } from "../components/ToastProvider";

export function meta() {
  return [
    { title: "Events | VolunteerHub" },
    { name: "description", content: "Browse volunteer events" },
  ];
}
 
function EventsContent() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
 
  const handleSignOut = () => {
    logout();
    showToast("Logged out", "info");
    navigate("/login", { replace: true });
  };
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "upcoming">("all");
  const [retryCount, setRetryCount] = useState(0);
 
  const [participations, setParticipations] = useState<ParticipationResponse[]>([]);
  const [participationsLoading, setParticipationsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [participantsModalEvent, setParticipantsModalEvent] = useState<EventResponse | null>(null);
  const [participantsModalList, setParticipantsModalList] = useState<ParticipationResponse[]>([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [participantsModalMounted, setParticipantsModalMounted] = useState(false);
  const [participantsModalActive, setParticipantsModalActive] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<Record<string, boolean>>({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    location: "",
    eventDate: "",
    requiredVolunteers: "",
  });

  const isOrganizer = (user?.role ?? "").toUpperCase() === "ORGANIZER";
  const isAdmin = (user?.role ?? "").toUpperCase() === "ADMIN";
 
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    getEvents(filter === "upcoming" ? true : undefined, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) {
          setEvents(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          setError(err.response?.data?.message || "Failed to load events.");
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [filter, retryCount]);
 
  useEffect(() => {
    const controller = new AbortController();
    setParticipationsLoading(true);
    getMyParticipations()
      .then((data) => {
        if (!controller.signal.aborted) {
          setParticipations(data);
          setParticipationsLoading(false);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setParticipations([]);
          setParticipationsLoading(false);
        }
      });

    return () => controller.abort();
  }, [retryCount]);
 
  function fetchEvents() {
    setRetryCount((c) => c + 1);
  }
 
  const enrolledEventIds = useMemo(() => {
    const inactiveStatuses = new Set(["CANCELLED", "UNENROLLED", "WITHDRAWN"]);
    const ids = new Set<string>();

    for (const participation of participations) {
      if (inactiveStatuses.has(participation.status?.toUpperCase?.() ?? "")) continue;
      if (user?.id && participation.volunteerId && participation.volunteerId !== user.id) continue;

      const rawEventId =
        participation.eventId ||
        (participation as unknown as { event?: { id?: string | number } }).event?.id;

      if (rawEventId !== undefined && rawEventId !== null) {
        ids.add(String(rawEventId));
      }
    }

    return ids;
  }, [participations, user?.id]);

  const isRegistered = (eventId: string) => {
    if (participationsLoading) return false;
    return enrolledEventIds.has(String(eventId));
  };
 
  const setLoadingFor = (eventId: string, loading: boolean) => {
    setActionLoading((prev) => ({ ...prev, [eventId]: loading }));
  };
  const setDeleteLoadingFor = (eventId: string, loading: boolean) => {
    setDeleteLoading((prev) => ({ ...prev, [eventId]: loading }));
  };
 
  const handleJoin = async (eventId: string) => {
    setLoadingFor(eventId, true);
    try {
      await enrollInEvent(eventId);
      showToast("You are now registered for this event.", "success");
      const updated = await getMyParticipations();
      setParticipations(updated);
      fetchEvents();
    } catch (err) {
      console.error(err);
      showToast(((err as any)?.response?.data?.message) || "Failed to join event.", "error");
    } finally {
      setLoadingFor(eventId, false);
    }
  };
 
  const handleCancel = async (eventId: string) => {
    setLoadingFor(eventId, true);
    try {
      await cancelEnrollment(eventId);
      showToast("Your registration has been cancelled.", "success");
      const updated = await getMyParticipations();
      setParticipations(updated);
      fetchEvents();
    } catch (err) {
      console.error(err);
      showToast(((err as any)?.response?.data?.message) || "Failed to cancel registration.", "error");
    } finally {
      setLoadingFor(eventId, false);
    }
  };

  const handleCreateEvent = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isOrganizer) {
      showToast("Only organizers can create events.", "error");
      return;
    }

    if (!createForm.title || !createForm.location || !createForm.eventDate || !createForm.requiredVolunteers) {
      showToast("Please fill all required fields.", "error");
      return;
    }

    const requiredVolunteers = Number(createForm.requiredVolunteers);
    if (!Number.isFinite(requiredVolunteers) || requiredVolunteers <= 0) {
      showToast("Required volunteers must be greater than 0.", "error");
      return;
    }

    setCreateSubmitting(true);
    try {
      const payload: CreateEventRequest = {
        title: createForm.title.trim(),
        description: createForm.description.trim() || undefined,
        location: createForm.location.trim(),
        eventDate: new Date(createForm.eventDate).toISOString(),
        requiredVolunteers,
      };
      await createEvent(payload);
      showToast("Event created successfully.", "success");
      setCreateForm({
        title: "",
        description: "",
        location: "",
        eventDate: "",
        requiredVolunteers: "",
      });
      setShowCreateForm(false);
      fetchEvents();
    } catch (err) {
      console.error(err);
      showToast(((err as any)?.response?.data?.message) || "Failed to create event.", "error");
    } finally {
      setCreateSubmitting(false);
    }
  };

  const handleDeleteEvent = async (event: EventResponse) => {
    if (!isOrganizer) {
      showToast("Only organizers can delete events.", "error");
      return;
    }
    if (event.organizerId !== user?.id) {
      showToast("You can delete only your own events.", "error");
      return;
    }

    const confirmed = window.confirm(`Delete "${event.title}"? This action cannot be undone.`);
    if (!confirmed) return;

    setDeleteLoadingFor(event.id, true);
    try {
      console.log('Calling delete API for event:', event.id);
      const result = await deleteEvent(event.id);
      console.log('Delete API result:', result);
      showToast("Event deleted successfully.", "success");
      fetchEvents();
    } catch (err) {
      console.error("Error deleting event:", err);
      console.error("Error response:", (err as any)?.response);
      console.error("Error status:", (err as any)?.response?.status);
      console.error("Error data:", (err as any)?.response?.data);
      showToast(((err as any)?.response?.data?.message) || "Failed to delete event.", "error");
    } finally {
      setDeleteLoadingFor(event.id, false);
    }
  };
 
  const fetchParticipantsForEvent = async (eventId: string) => {
    setParticipantsLoading(true);
    try {
      const data = await getEventParticipants(eventId);
      setParticipantsModalList(data);
    } catch (err) {
      console.error(err);
      showToast(((err as any)?.response?.data?.message) || "Failed to load participants.", "error");
    } finally {
      setParticipantsLoading(false);
    }
  };
 
  const openParticipantsModal = async (event: EventResponse) => {
    setParticipantsModalMounted(true);
    setParticipantsModalEvent(event);
    window.requestAnimationFrame(() => setParticipantsModalActive(true));
    await fetchParticipantsForEvent(event.id);
  };
 
  const closeParticipantsModal = () => {
    setParticipantsModalActive(false);
    window.setTimeout(() => {
      setParticipantsModalMounted(false);
      setParticipantsModalEvent(null);
      setParticipantsModalList([]);
    }, 220);
  };
 
  const refreshParticipants = async () => {
    if (!participantsModalEvent) return;
    await fetchParticipantsForEvent(participantsModalEvent.id);
    showToast("Participant list refreshed.", "success");
  };
 
  // Auto-poll participants while the modal is open (every 10s)
  useEffect(() => {
    if (!participantsModalActive || !participantsModalEvent) return;
 
    const intervalId = window.setInterval(() => {
      fetchParticipantsForEvent(participantsModalEvent.id);
    }, 10_000);
 
    return () => window.clearInterval(intervalId);
  }, [participantsModalActive, participantsModalEvent]);
 
  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
 
  function formatTime(timeStr: string) {
    if (!timeStr) return "";
    try {
      const [hours, minutes] = timeStr.split(":");
      const h = parseInt(hours, 10);
      const suffix = h >= 12 ? "PM" : "AM";
      const displayH = h % 12 || 12;
      return `${displayH}:${minutes} ${suffix}`;
    } catch {
      return timeStr;
    }
  }
 
  function getStatusColor(status: string) {
    switch (status?.toUpperCase()) {
      case "UPCOMING":
      case "SCHEDULED":
        return "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400";
      case "ONGOING":
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "COMPLETED":
        return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
      case "CANCELLED":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
    }
  }
 
  function getCategoryColor(category: string) {
    switch (category?.toUpperCase()) {
      case "ENVIRONMENT":
        return "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400";
      case "EDUCATION":
        return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400";
      case "HEALTH":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
      case "COMMUNITY":
        return "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400";
      case "ANIMAL_WELFARE":
        return "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400";
    }
  }
 
  const spotsPercentage = (e: EventResponse) =>
    e.requiredVolunteers > 0 ? Math.round((e.registeredVolunteers / e.requiredVolunteers) * 100) : 0;
 
  return (
    <div className="relative min-h-screen text-slate-100 bg-gradient-to-br from-slate-900 to-blue-900">

  {/* FIXED BACKGROUND LAYER */}
  <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px]" />

  {/* MAIN CONTENT */}
  <div className="relative z-10 flex flex-col flex-1">
  
        {/* Navigation */}
        <nav className="bg-slate-900/70 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-6">
                <Link to="/" className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-sky-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <span className="text-lg font-bold text-slate-100">VolunteerHub</span>
                </Link>
                <div className="hidden sm:flex items-center gap-1">
                  <Link
                    to="/"
                    className="px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:text-slate-50 hover:bg-slate-800 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/events"
                    className="px-3 py-2 rounded-lg text-sm font-medium text-slate-100 bg-sky-600 hover:bg-sky-700 transition-colors"
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
                    <span className="text-sky-200 font-semibold text-xs">
                      {user?.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="font-medium">{user?.username}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800 transition-colors"
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white drop-shadow-md">Events</h1>
              <p className="mt-1 text-slate-300">
                Browse and discover volunteer opportunities.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === "all"
                    ? "bg-sky-600 text-white shadow-sm"
                    : "bg-slate-900/70 text-slate-200 border border-slate-800 hover:bg-slate-800"
                }`}
              >
                All Events
              </button>
              <button
                onClick={() => setFilter("upcoming")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === "upcoming"
                    ? "bg-sky-600 text-white shadow-sm"
                    : "bg-slate-900/70 text-slate-200 border border-slate-800 hover:bg-slate-800"
                }`}
              >
                Upcoming
              </button>
              {isOrganizer && (
                <button
                  onClick={() => setShowCreateForm((prev) => !prev)}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                >
                  {showCreateForm ? "Close Form" : "Create Event"}
                </button>
              )}
            </div>
          </div>

          {isOrganizer && showCreateForm && (
            <form
              onSubmit={handleCreateEvent}
              className="mb-6 rounded-xl border border-slate-700 bg-slate-900/70 p-5 grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <input
                type="text"
                placeholder="Event title *"
                value={createForm.title}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, title: e.target.value }))}
                className="rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-600"
                required
              />
              <input
                type="text"
                placeholder="Location *"
                value={createForm.location}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, location: e.target.value }))}
                className="rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-600"
                required
              />
              <input
                type="datetime-local"
                value={createForm.eventDate}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, eventDate: e.target.value }))}
                className="rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-600"
                required
              />
              <input
                type="number"
                min={1}
                placeholder="Required volunteers *"
                value={createForm.requiredVolunteers}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, requiredVolunteers: e.target.value }))}
                className="rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-600"
                required
              />
              <textarea
                placeholder="Description (optional)"
                value={createForm.description}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, description: e.target.value }))}
                className="md:col-span-2 rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-600"
                rows={3}
              />
              <div className="md:col-span-2 flex justify-end">
                <button
                  type="submit"
                  disabled={createSubmitting}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {createSubmitting ? "Creating..." : "Create Event"}
                </button>
              </div>
            </form>
          )}
 
          {/* Error */}
          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-lg bg-red-900/20 border border-red-800 px-4 py-3 text-sm text-red-200">
              <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
              <button onClick={fetchEvents} className="ml-auto text-red-300 underline text-sm font-medium hover:text-red-100">
                Retry
              </button>
            </div>
          )}

          {/* Participations Loading Indicator */}
          {participationsLoading && (
            <div className="mb-6 flex items-center gap-3 rounded-lg bg-blue-900/20 border border-blue-800 px-4 py-3 text-sm text-blue-200">
              <div className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-blue-400 border-t-transparent"></div>
              Loading your enrollments...
            </div>
          )}
 
          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-24">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
                <span className="text-sm text-slate-300">Loading events...</span>
              </div>
            </div>
          )}
 
          {/* Empty state */}
          {!loading && !error && events.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-800/70 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-100 mb-1">No events found</h3>
              <p className="text-slate-300 max-w-sm">
                {filter === "upcoming"
                  ? "There are no upcoming events right now. Check back later or view all events."
                  : "No events have been created yet. Check back soon!"}
              </p>
              {filter === "upcoming" && (
                <button
                  onClick={() => setFilter("all")}
                  className="mt-4 px-4 py-2 rounded-lg text-sm font-medium bg-sky-600 text-white hover:bg-sky-700 transition-colors"
                >
                  View all events
                </button>
              )}
            </div>
          )}
 
          {/* Events Grid */}
          {!loading && events.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => {
                const registered = isRegistered(event.id);

                return (
                <div
                  key={event.id}
                  className="h-full bg-slate-900/60 backdrop-blur-xl rounded-xl border border-slate-700/50 overflow-hidden hover:shadow-lg hover:border-slate-600 transition-all flex flex-col"
                >
                  {/* Card Header */}
                  <div className="p-6 pb-4 flex-1">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex flex-wrap gap-2">
                        {event.status && (
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                            {event.status.replace(/_/g, " ")}
                          </span>
                        )}
                      </div>
                    </div>
 
                    <h3 className="text-lg font-semibold text-slate-100 mb-2 line-clamp-2">
                      {event.title}
                    </h3>
 
                    {event.description && (
                      <p className="text-sm text-slate-300 line-clamp-2 mb-4">
                        {event.description}
                      </p>
                    )}
 
                    {/* Details */}
                    <div className="space-y-2.5 min-h-[112px]">
                      {event.eventDate && (
                        <div className="flex items-center gap-2.5 text-sm text-slate-300">
                          <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{formatDate(event.eventDate)}</span>
                        </div>
                      )}
 
                      {event.eventDate && (
                        <div className="flex items-center gap-2.5 text-sm text-slate-300">
                          <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{formatTime(event.eventDate)}</span>
                        </div>
                      )}
 
                      {event.location && (
                        <div className="flex items-center gap-2.5 text-sm text-slate-300">
                          <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="truncate">{event.location}</span>
                        </div>
                      )}
 
                      {event.organizerName && (
                        <div className="flex items-center gap-2.5 text-sm text-slate-300">
                          <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>{event.organizerName}</span>
                        </div>
                      )}
                    </div>
                  </div>
 
                  <div className="mt-auto px-6 py-4 border-t border-slate-700/50 bg-slate-950/40">
                    {event.requiredVolunteers > 0 && (
                      <>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-slate-300">Volunteer spots</span>
                          <span className="font-medium text-slate-100">
                            {event.registeredVolunteers}/{event.requiredVolunteers}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              spotsPercentage(event) >= 100
                                ? "bg-red-500"
                                : spotsPercentage(event) >= 75
                                  ? "bg-amber-500"
                                  : "bg-sky-500"
                            }`}
                            style={{ width: `${Math.min(spotsPercentage(event), 100)}%` }}
                          />
                        </div>
                        {spotsPercentage(event) >= 100 && (
                          <p className="text-xs text-red-400 mt-1.5 font-medium">Event is full</p>
                        )}
                      </>
                    )}
 
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => (registered ? handleCancel(event.id) : handleJoin(event.id))}
                        disabled={!!actionLoading[event.id]}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                          registered
                            ? "bg-red-600 text-white hover:bg-red-700"
                            : "bg-sky-600 text-white hover:bg-sky-700"
                        } ${actionLoading[event.id] ? "opacity-70 cursor-not-allowed" : ""}`}
                      >
                        {actionLoading[event.id]
                          ? "Working..."
                          : registered
                            ? "Unenroll"
                            : "Enroll"}
                      </button>
                      <button
                        onClick={() => openParticipantsModal(event)}
                        disabled={
                          !!actionLoading[event.id] || (participantsLoading && participantsModalEvent?.id === event.id)
                        }
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap bg-slate-800 text-slate-100 hover:bg-slate-700 ${
                          actionLoading[event.id] || (participantsLoading && participantsModalEvent?.id === event.id)
                            ? "opacity-70 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        View Participants
                      </button>
                      {(isOrganizer && event.organizerId === user?.id) || isAdmin ? (
                        <button
                          onClick={() => handleDeleteEvent(event)}
                          disabled={!!deleteLoading[event.id]}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap bg-red-700 text-white hover:bg-red-800 ${
                            deleteLoading[event.id] ? "opacity-70 cursor-not-allowed" : ""
                          }`}
                        >
                          {deleteLoading[event.id] ? "Deleting..." : "Delete Event"}
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              )})}
            </div>
          )}
 
          {participantsModalMounted && (
            <div
              className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 transition-opacity duration-200 ${
                participantsModalActive ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
              aria-hidden={!participantsModalActive}
            >
              <div
                className={`w-full max-w-3xl rounded-2xl border border-slate-700 bg-slate-950/90 shadow-2xl transition-transform duration-200 ${
                  participantsModalActive ? "opacity-100 scale-100" : "opacity-0 scale-95"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 px-6 py-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-100">Participants</h2>
                    <p className="text-sm text-slate-300">{participantsModalEvent?.title}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={refreshParticipants}
                      disabled={participantsLoading}
                      className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {participantsLoading ? (
                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-slate-200 border-t-transparent" />
                      ) : (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v6h6M20 20v-6h-6m-4 1a8 8 0 1111.314-11.314m0 0L20 4m0 0h-4" />
                        </svg>
                      )}
                      Refresh list
                    </button>
                    <button
                      onClick={closeParticipantsModal}
                      className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800"
                      aria-label="Close participants modal"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <div className="p-6 max-h-[65vh] overflow-y-auto">
                  {participantsLoading ? (
                    <div className="text-slate-300">Loading participants...</div>
                  ) : participantsModalList.length === 0 ? (
                    <div className="text-slate-400">No participants yet.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-left text-sm text-slate-200">
                        <thead className="sticky top-0 bg-slate-950/95 backdrop-blur supports-[backdrop-filter]:bg-slate-950/80">
                          <tr className="border-b border-slate-700">
                            <th className="py-3 px-4 font-semibold">Name</th>
                            <th className="py-3 px-4 font-semibold">Email</th>
                            <th className="py-3 px-4 font-semibold">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {participantsModalList.map((p) => (
                            <tr key={p.id} className="border-b border-slate-800">
                              <td className="py-3 px-4">{p.volunteerName}</td>
                              <td className="py-3 px-4">{p.volunteerEmail}</td>
                              <td className="py-3 px-4">
                                <span className="inline-flex items-center rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-200">
                                  {p.status.replace(/_/g, " ")}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
 
export default function EventsPage() {
  return (
    <AuthGuard>
      <EventsContent />
    </AuthGuard>
  );
}