"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShieldCheck, Eye, EyeOff } from "lucide-react";
import api from "../../../lib/api";
import Cookies from "js-cookie";

export default function OfficialLoginPage() {
  const router = useRouter();
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { mobileNumber, password });
      if (res.data.success) {
        const { role } = res.data.user;

        // Only allow officials or admins through this portal
        if (role !== "admin" && role !== "official") {
          setError(
            "Access denied. This portal is for government officials only."
          );
          setLoading(false);
          return;
        }

        Cookies.set("accessToken", res.data.accessToken, { expires: 1 / 96 });
        Cookies.set("refreshToken", res.data.refreshToken, { expires: 7 });
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(res.data.user));
        }
        router.push("/admin");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Panel */}
      <div className="hidden md:flex w-1/2 relative bg-forest-dark items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a3a2a] to-[#2d6a4f] z-0" />
        {/* Decorative circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/5 z-0" />
        <div className="absolute -bottom-32 -right-16 w-80 h-80 rounded-full bg-white/5 z-0" />

        <div className="relative z-10 text-center text-white flex flex-col items-center max-w-sm">
          <div className="w-20 h-20 rounded-2xl bg-gold/20 border border-gold/30 flex items-center justify-center mb-8">
            <ShieldCheck size={40} className="text-gold" />
          </div>
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Official Portal
          </h1>
          <p className="text-white/60 text-base leading-relaxed">
            Secure access for government officials to manage farmer applications,
            grievances, and scheme disbursements.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4 w-full text-center">
            {[
              { label: "Districts", value: "36+" },
              { label: "Officials", value: "500+" },
              { label: "Schemes", value: "12" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white/10 rounded-xl p-4 border border-white/10"
              >
                <div className="text-2xl font-bold text-gold">{stat.value}</div>
                <div className="text-xs text-white/60 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full md:w-1/2 flex flex-col p-6 md:p-12 lg:p-24 bg-white overflow-y-auto">
        <Link
          href="/login"
          className="flex items-center gap-2 text-gray-500 font-medium hover:text-forest transition-colors mb-8 self-start"
        >
          <ArrowLeft size={18} />
          <span className="text-sm">Back to Farmer Login</span>
        </Link>

        <div className="max-w-md w-full mx-auto my-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
              <ShieldCheck size={14} />
              Government Officials Only
            </div>
            <h2 className="text-3xl font-bold text-gray-900">
              Official Sign In
            </h2>
            <p className="text-gray-500 mt-2 text-sm">
              Sign in with your registered mobile number and password.
            </p>
          </div>

          {error && (
            <div className="p-3 mb-6 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start gap-2">
              <span className="text-red-500 mt-0.5">⚠</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Registered Mobile Number
              </label>
              <input
                type="tel"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                required
                placeholder="10-digit mobile number"
                className="w-full h-[48px] px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest/20 focus:border-forest outline-none transition-all text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="w-full h-[48px] px-4 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest/20 focus:border-forest outline-none transition-all text-gray-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                className="text-sm font-medium text-forest hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-forest-dark hover:bg-forest text-white h-[48px] rounded-lg font-bold transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  Sign In to Portal
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">
              This portal is restricted to authorised government personnel only.
              <br />
              Unauthorized access is a punishable offence.
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link
              href="/login"
              className="text-sm text-forest font-medium hover:underline"
            >
              Are you a farmer? Login here →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
