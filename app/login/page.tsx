"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import api from "../../lib/api";
import Cookies from "js-cookie";

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [otpStep, setOtpStep] = useState(false);
  
  // Form State
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  
  // OTP State
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [userId, setUserId] = useState("");
  const otpRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const stateDistrictData: { [key: string]: string[] } = {
    "Maharashtra": ["Pune", "Mumbai", "Nagpur", "Nashik", "Aurangabad"],
    "Gujarat": ["Ahmedabad", "Surat", "Rajkot", "Vadodara"],
    "Karnataka": ["Bangalore", "Mysore", "Hubli", "Mangalore"],
    "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior", "Jabalpur"],
    "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota"]
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (activeTab === "login") {
        const res = await api.post('/auth/login', { mobileNumber, password });
        if (res.data.success) {
          // If login says account not verified, we'd need to send OTP, but login returns 403.
          // The API directly returns access tokens if already verified.
          Cookies.set('accessToken', res.data.accessToken, { expires: 1/96 });
          Cookies.set('refreshToken', res.data.refreshToken, { expires: 7 });
          if (typeof window !== 'undefined') localStorage.setItem('user', JSON.stringify(res.data.user));
          
          if (res.data.user.role === 'admin' || res.data.user.role === 'official') {
            router.push('/admin');
          } else {
            router.push('/dashboard');
          }
        }
      } else {
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match");
        }
        // Register sends OTP
        const res = await api.post('/auth/register', { 
          mobileNumber, 
          password, 
          fullName, 
          role: 'farmer',
          aadhaarNumber,
          state,
          district
        });
        if (res.data.success) {
          setUserId(res.data.userId);
          setOtpStep(true);
        }
      }
    } catch (err: any) {
      // Backend might return 403 "Account not verified. Please request OTP."
      if (err.response?.status === 403 && activeTab === "login") {
         // Auto-trigger an OTP resend by basically registering again or calling a resend endpoint 
         // Since we don't have a direct resend endpoint, we show the error.
         setError(err.response?.data?.message || "Error occurred");
      } else {
         setError(err.response?.data?.message || err.message || "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) return setError("Please enter 6-digit OTP");
    
    setLoading(true);
    setError("");
    try {
      const res = await api.post('/auth/verify-otp', { userId, otp: otpString });
      if (res.data.success) {
        Cookies.set('accessToken', res.data.accessToken, { expires: 1/96 });
        Cookies.set('refreshToken', res.data.refreshToken, { expires: 7 });
        if (typeof window !== 'undefined') localStorage.setItem('user', JSON.stringify(res.data.user));
        
        if (res.data.user.role === 'admin' || res.data.user.role === 'official') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1); // Only accept 1 char
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next
    if (value && index < 5) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  if (otpStep) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-offwhite p-6 relative">
        <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-forest font-medium hover:text-forest-light">
          <ArrowLeft size={20} /> Back to Home
        </Link>
        <div className="card w-full max-w-md p-8 relative overflow-hidden">
          <div className="w-16 h-16 bg-forest/10 rounded-full flex items-center justify-center text-forest mx-auto mb-6">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-2xl font-bold text-center text-forest-dark mb-2">Verify Mobile Number</h2>
          <p className="text-center text-gray-600 mb-8">
            Please enter the 6-digit OTP sent to your registered mobile number.
          </p>
          {error && <div className="p-3 mb-4 bg-red-50 text-red-600 rounded-md text-sm text-center">{error}</div>}
          <div className="space-y-6">
            <div className="flex justify-center gap-3">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <input
                  key={i}
                  ref={otpRefs[i]}
                  type="text"
                  maxLength={1}
                  value={otp[i]}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className="w-12 h-14 text-center text-2xl font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-forest outline-none transition-all"
                />
              ))}
            </div>
            <button 
              type="button" 
              onClick={handleVerifyOtp} 
              disabled={loading}
              className="w-full bg-forest hover:bg-forest-light text-white py-3.5 rounded-lg font-bold transition-colors disabled:opacity-70"
            >
              {loading ? "Verifying..." : "Verify & Proceed"}
            </button>
            <div className="text-center">
              <button type="button" className="text-forest font-medium hover:underline">Resend OTP</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Panel */}
      <div className="hidden md:flex w-1/2 relative bg-forest-dark items-center justify-center p-12 overflow-hidden">
        {/* Abstract pattern placeholder for farmer image */}
        <div className="absolute inset-0 bg-gradient-to-br from-forest-dark to-forest-light opacity-90 mix-blend-multiply z-10" />
        <div className="relative z-20 text-center text-white flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-gold/20 flex items-center justify-center mb-8 border border-gold/30">
            <span className="text-3xl font-bold text-gold">A</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
             &quot;Serving the backbone<br />of our nation&quot;
          </h1>
          <p className="text-white/70 text-lg max-w-md">
            The AgroSeva Portal facilitates seamless access to government benefits, ensuring every farmer receives what they deserve.
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full md:w-1/2 flex flex-col p-6 md:p-12 lg:p-24 bg-white overflow-y-auto">
        <Link href="/" className="flex items-center gap-2 text-gray-500 font-medium hover:text-forest md:hidden mb-8">
          <ArrowLeft size={20} /> Back
        </Link>
        <div className="max-w-md w-full mx-auto my-auto">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-8">
            <button
              onClick={() => setActiveTab("login")}
              className={`flex-1 pb-4 font-semibold text-lg transition-colors border-b-2 ${activeTab === "login" ? "text-forest-dark border-gold" : "text-gray-400 border-transparent hover:text-gray-700"}`}
            >
              Login
            </button>
            <button
              onClick={() => setActiveTab("register")}
              className={`flex-1 pb-4 font-semibold text-lg transition-colors border-b-2 ${activeTab === "register" ? "text-forest-dark border-gold" : "text-gray-400 border-transparent hover:text-gray-700"}`}
            >
              Register
            </button>
          </div>
          {error && <div className="p-3 mb-4 bg-red-50 text-red-600 rounded-md text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            {activeTab === "login" ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                  <input type="tel" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} required placeholder="Enter 10-digit number" className="w-full h-[44px] px-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-forest/20 focus:border-forest outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" className="w-full h-[44px] px-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-forest/20 focus:border-forest outline-none transition-all" />
                </div>
                <div className="flex bg-gray-50 border border-gray-200 rounded-md p-3 items-center justify-between">
                  <span className="font-mono text-gray-600 tracking-wider">A X 4 9 M 2</span>
                  <input type="text" placeholder="Captcha" className="w-32 h-[36px] px-3 border border-gray-300 rounded focus:ring-1 focus:border-forest outline-none" />
                </div>
                
                <div className="flex justify-end">
                  <button type="button" className="text-sm font-medium text-forest hover:underline">Forgot Password?</button>
                </div>
                
                <button type="submit" disabled={loading} className="w-full bg-forest hover:bg-forest-light text-white h-[44px] rounded-md font-bold transition-colors mt-2 disabled:opacity-70">
                  {loading ? "Logging in..." : "Login securely"}
                </button>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name (as per Aadhaar)</label>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="w-full h-[44px] px-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-forest/20 focus:border-forest outline-none transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Aadhaar Number</label>
                    <input 
                      type="text" 
                      value={aadhaarNumber}
                      onChange={(e) => setAadhaarNumber(e.target.value)}
                      className="w-full h-[44px] px-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-forest/20 focus:border-forest outline-none transition-all" 
                      placeholder="12-digit number" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
                    <input type="tel" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} required className="w-full h-[44px] px-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-forest/20 focus:border-forest outline-none transition-all" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <select 
                      value={state}
                      onChange={(e) => { setState(e.target.value); setDistrict(""); }}
                      className="w-full h-[44px] px-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-forest/20 focus:border-forest outline-none bg-white"
                    >
                      <option value="">Select State</option>
                      {Object.keys(stateDistrictData).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                    <select 
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      disabled={!state}
                      className="w-full h-[44px] px-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-forest/20 focus:border-forest outline-none bg-white disabled:bg-gray-50 disabled:text-gray-400"
                    >
                      <option value="">Select District</option>
                      {state && stateDistrictData[state].map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full h-[44px] px-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-forest/20 focus:border-forest outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full h-[44px] px-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-forest/20 focus:border-forest outline-none transition-all" />
                  </div>
                </div>
                
                <button type="submit" disabled={loading} className="w-full bg-forest hover:bg-forest-light text-white h-[44px] rounded-md font-bold transition-colors mt-2 disabled:opacity-70">
                  {loading ? "Loading..." : "Send OTP to Register"}
                </button>
              </>
            )}
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 flex justify-center">
            <Link href="/admin/login" className="text-sm font-medium text-gray-500 hover:text-forest transition-colors">
              Login as Official
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
