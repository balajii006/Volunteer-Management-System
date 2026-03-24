import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { registerApi } from "../services/auth";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      await registerApi({
        username: form.username,
        email: form.email,
        password: form.password,
        phoneNumber: form.phoneNumber,
      });
      navigate("/login?registered=true");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-24 h-80 w-80 rounded-full bg-sky-500/14 blur-3xl" />
        <div className="absolute bottom-[-140px] right-[-80px] h-[420px] w-[420px] rounded-full bg-emerald-400/10 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-5xl grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] items-center">
        {/* Left - brand copy */}
        <div className="space-y-6 text-slate-100">
          <div className="inline-flex items-center gap-3 rounded-full bg-slate-900/70 px-3 py-1 border border-slate-700/60 shadow-lg shadow-black/40 backdrop-blur">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500 text-white">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-300">
              VolunteerHub
            </span>
          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">
              Create your volunteer profile.
            </h1>
            <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-md">
              Set up your account once and keep every event, hour, and contribution connected
              to a single, simple profile.
            </p>
          </div>

          <ul className="space-y-3 text-sm text-slate-200">
            <li className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
                ✓
              </span>
              <span>Discover and join verified volunteer events.</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
                ✓
              </span>
              <span>Log hours automatically as you participate.</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
                ✓
              </span>
              <span>Keep a shareable record of your impact.</span>
            </li>
          </ul>
        </div>

        {/* Right - form card */}
        <div className="rounded-2xl border border-slate-700/70 bg-slate-950/70 shadow-2xl shadow-black/60 backdrop-blur-xl px-6 py-7 sm:px-8 sm:py-9">
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-50">Create your account</h2>
          <p className="mt-1 text-sm text-slate-400">
            Start volunteering in just a few minutes.
          </p>

          {error && (
            <div className="mt-5 rounded-xl border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-100 flex items-start gap-3">
              <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* ... rest of your form fields remain exactly the same ... */}
            <div>
              <label
                htmlFor="username"
                className="block text-xs font-medium tracking-wide text-slate-300 mb-1.5"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                required
                value={form.username}
                onChange={(e) => update("username", e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-sm text-slate-50 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/25 placeholder:text-slate-500"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium tracking-wide text-slate-300 mb-1.5"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-sm text-slate-50 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/25 placeholder:text-slate-500"
              />
            </div>
            <div>
              <label
                htmlFor="phone"
                className="block text-xs font-medium tracking-wide text-slate-300 mb-1.5"
              >
                Phone number
              </label>
              <input
                id="phone"
                type="tel"
                required
                value={form.phoneNumber}
                onChange={(e) => update("phoneNumber", e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-sm text-slate-50 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/25 placeholder:text-slate-500"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-medium tracking-wide text-slate-300 mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-sm text-slate-50 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/25 placeholder:text-slate-500"
              />
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-medium tracking-wide text-slate-300 mb-1.5"
              >
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={form.confirmPassword}
                onChange={(e) => update("confirmPassword", e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-sm text-slate-50 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/25 placeholder:text-slate-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-500/30 transition-colors hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs sm:text-sm text-slate-400">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-sky-400 hover:text-sky-300">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}