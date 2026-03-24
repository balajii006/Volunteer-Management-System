import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { resetPassword } from "../services/events";
import { useToast } from "../components/ToastProvider";

export function meta() {
  return [
    { title: "Reset Password | VolunteerHub" },
    { name: "description", content: "Reset your VolunteerHub password" },
  ];
}

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setTokenValid(false);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      showToast("Reset token is required", "error");
      return;
    }

    if (!newPassword.trim()) {
      showToast("Please enter a new password", "error");
      return;
    }

    if (newPassword.length < 6) {
      showToast("Password must be at least 6 characters long", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }

    setLoading(true);
    try {
      const result = await resetPassword(token, newPassword);
      console.log('Reset password result:', result);
      showToast("Password reset successfully! Please sign in with your new password.", "success");
      
      // Clear form
      setNewPassword("");
      setConfirmPassword("");
      
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error("Reset password error:", err);
      showToast(((err as any)?.response?.data?.message) || "Failed to reset password", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <div className="w-full max-w-md px-6">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500 text-white mb-4">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-300">
              VolunteerHub
            </span>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 p-8">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h1 className="text-2xl font-semibold text-white mb-2">Invalid Reset Link</h1>
              <p className="text-sm text-slate-400 mb-6">
                This password reset link is invalid or has expired.
              </p>
              
              <div className="space-y-3">
                <Link
                  to="/forgot-password"
                  className="block w-full px-4 py-3 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-sky-600/30"
                >
                  Request New Reset Link
                </Link>
                <Link
                  to="/login"
                  className="block w-full px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  Back to Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
      <div className="w-full max-w-md px-6">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500 text-white mb-4">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-300">
            VolunteerHub
          </span>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-semibold text-white mb-2">Reset Password</h1>
            <p className="text-sm text-slate-400">
              Enter your new password below
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium tracking-wide text-slate-300">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-sm text-slate-50 outline-none ring-0 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/25 placeholder:text-slate-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium tracking-wide text-slate-300">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-sm text-slate-50 outline-none ring-0 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/25 placeholder:text-slate-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-500/30 transition-colors hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>

          <div className="text-center mt-6">
            <Link
              to="/login"
              className="text-sm text-sky-400 hover:text-sky-300 transition-colors"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
