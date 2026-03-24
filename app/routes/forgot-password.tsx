import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { forgotPassword } from "../services/events";
import { useToast } from "../components/ToastProvider";

export function meta() {
  return [
    { title: "Forgot Password | VolunteerHub" },
    { name: "description", content: "Reset your VolunteerHub password" },
  ];
}

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetData, setResetData] = useState<{ message: string; resetToken: string } | null>(null);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      showToast("Please enter your email address", "error");
      return;
    }

    setLoading(true);
    try {
      const result = await forgotPassword(email);
      console.log('Forgot password result:', result);
      setResetData(result);
      showToast("Password reset link generated successfully!", "success");
    } catch (err) {
      console.error("Forgot password error:", err);
      showToast(((err as any)?.response?.data?.message) || "Failed to generate reset link", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoToReset = () => {
    if (resetData?.resetToken) {
      navigate(`/reset-password?token=${resetData.resetToken}`);
    }
  };

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
            <h1 className="text-2xl font-semibold text-white mb-2">Forgot Password</h1>
            <p className="text-sm text-slate-400">
              Enter your email address and we'll send you a password reset link
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-500/30 transition-colors hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Generating..." : "Generate Reset Link"}
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

        {resetData && (
          <div className="mt-6 bg-slate-900/60 backdrop-blur-md rounded-xl border border-slate-800 p-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Password reset token created.</h3>
              <p className="text-sm text-slate-400 mb-6">
                Your password reset link has been generated successfully.
              </p>
              
              <button
                onClick={handleGoToReset}
                className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-emerald-600/30"
              >
                RESET PASSWORD HERE
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
