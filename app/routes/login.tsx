import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/", { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-slate-950">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-28 -left-20 h-72 w-72 rounded-full bg-sky-500/15 blur-3xl" />
        <div className="absolute bottom-[-140px] right-[-80px] h-[420px] w-[420px] rounded-full bg-emerald-400/12 blur-3xl" />
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
              Sign in to a calmer, smarter volunteer dashboard.
            </h1>
            <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-md">
              Manage events, hours, and teams in one focused workspace designed for
              impact, not noise.
            </p>
          </div>

          <dl className="grid grid-cols-3 gap-4 max-w-sm text-xs sm:text-sm text-slate-300">
            <div>
              <dt className="text-slate-400">Volunteers</dt>
              <dd className="mt-1 text-lg font-semibold text-slate-50">2K+</dd>
            </div>
            <div>
              <dt className="text-slate-400">Events hosted</dt>
              <dd className="mt-1 text-lg font-semibold text-slate-50">500+</dd>
            </div>
            <div>
              <dt className="text-slate-400">Hours logged</dt>
              <dd className="mt-1 text-lg font-semibold text-slate-50">10K+</dd>
            </div>
          </dl>
        </div>

        {/* Right - form card */}
        <div className="rounded-2xl border border-slate-700/70 bg-slate-950/70 shadow-2xl shadow-black/60 backdrop-blur-xl px-6 py-7 sm:px-8 sm:py-9">
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-50">Welcome back</h2>
          <p className="mt-1 text-sm text-slate-400">
            Use your registered email to access your dashboard.
          </p>

          {error && (
            <div className="mt-5 rounded-xl border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium tracking-wide text-slate-300">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-sm text-slate-50 outline-none ring-0 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/25 placeholder:text-slate-500"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium tracking-wide text-slate-300">
                  Password
                </label>
                <Link 
                  to="/forgot-password" 
                  className="text-xs text-sky-400 hover:text-sky-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-sm text-slate-50 outline-none ring-0 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/25 placeholder:text-slate-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-500/30 transition-colors hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs sm:text-sm text-slate-400">
            Don't have an account?{" "}
            <Link to="/register" className="font-medium text-sky-400 hover:text-sky-300">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}