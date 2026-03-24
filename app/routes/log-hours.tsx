import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import AuthGuard from "../components/AuthGuard";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/ToastProvider";
import { addHourLog, deleteHourLog, getHourLogs, type HourLog } from "../services/productivity";

export function meta() {
  return [{ title: "Log Hours | VolunteerHub" }];
}

function LogHoursContent() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<HourLog[]>([]);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    hours: "1",
    activity: "",
    notes: "",
  });

  const userId = user?.id ?? "";

  useEffect(() => {
    if (!userId) return;
    setLogs(getHourLogs(userId));
  }, [userId]);

  const totalHours = useMemo(() => logs.reduce((sum, item) => sum + item.hours, 0), [logs]);

  const onLogout = () => {
    logout();
    showToast("Logged out", "info");
    navigate("/login", { replace: true });
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId) return;
    const hours = Number(form.hours);
    if (!form.activity.trim() || !Number.isFinite(hours) || hours <= 0) {
      showToast("Enter valid activity and hours.", "error");
      return;
    }
    setLogs(
      addHourLog(userId, {
        date: form.date,
        hours,
        activity: form.activity.trim(),
        notes: form.notes.trim() || undefined,
      }),
    );
    setForm((prev) => ({ ...prev, activity: "", notes: "" }));
    showToast("Hours logged successfully.", "success");
  };

  const onDelete = (id: string) => {
    if (!userId) return;
    setLogs(deleteHourLog(userId, id));
    showToast("Log removed.", "info");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 text-slate-100">
      <nav className="bg-slate-900/70 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/" className="px-3 py-2 rounded-lg text-sm hover:bg-slate-800">Dashboard</Link>
            <Link to="/events" className="px-3 py-2 rounded-lg text-sm hover:bg-slate-800">Events</Link>
            <Link to="/log-hours" className="px-3 py-2 rounded-lg text-sm bg-sky-600">Log Hours</Link>
          </div>
          <button onClick={onLogout} className="px-3 py-2 rounded-lg text-sm border border-slate-700 hover:bg-slate-800">Sign out</button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-5">
          <h1 className="text-2xl font-bold mb-1">Log Volunteer Hours</h1>
          <p className="text-slate-300 text-sm">Track your effort and keep your contribution record updated.</p>
        </div>

        <form onSubmit={onSubmit} className="rounded-xl border border-slate-700 bg-slate-900/60 p-5 grid grid-cols-1 md:grid-cols-2 gap-3">
          <input type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} className="rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm" required />
          <input type="number" min={0.5} step={0.5} value={form.hours} onChange={(e) => setForm((p) => ({ ...p, hours: e.target.value }))} placeholder="Hours" className="rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm" required />
          <input value={form.activity} onChange={(e) => setForm((p) => ({ ...p, activity: e.target.value }))} placeholder="Activity" className="md:col-span-2 rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm" required />
          <textarea value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} placeholder="Notes (optional)" rows={3} className="md:col-span-2 rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm" />
          <button type="submit" className="md:col-span-2 rounded-lg bg-sky-600 hover:bg-sky-700 px-4 py-2 text-sm font-medium">Save Log</button>
        </form>

        <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">My Hour Logs</h2>
            <span className="text-sm text-slate-300">Total: {totalHours.toFixed(1)} hrs</span>
          </div>
          {logs.length === 0 ? (
            <p className="text-slate-400 text-sm">No logs yet.</p>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div key={log.id} className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium">{log.activity}</div>
                    <div className="text-xs text-slate-400">{log.date} • {log.hours} hrs</div>
                    {log.notes && <div className="text-sm text-slate-300 mt-1">{log.notes}</div>}
                  </div>
                  <button onClick={() => onDelete(log.id)} className="px-2 py-1 rounded text-xs bg-red-700 hover:bg-red-800">Delete</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function LogHoursPage() {
  return (
    <AuthGuard>
      <LogHoursContent />
    </AuthGuard>
  );
}
