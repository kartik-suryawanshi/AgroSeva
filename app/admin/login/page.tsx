"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import api from "../../../lib/api";
import Cookies from "js-cookie";

export default function AdminLoginPage() {
  const router = useRouter();
  
  // Form State
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { mobileNumber, password });
      
      if (res.data.success) {
        const userRole = res.data.user.role;
        
        // Ensure only admin or official can log in here
        if (userRole === 'admin' || userRole === 'official') {
          Cookies.set('accessToken', res.data.accessToken, { expires: 1/96 });
          Cookies.set('refreshToken', res.data.refreshToken, { expires: 7 });
          if (typeof window !== 'undefined') localStorage.setItem('user', JSON.stringify(res.data.user));
          
          router.push('/admin');
        } else {
          setError("Access denied. This login is strictly for officials and administrators.");
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Invalid credentials or unauthorized access.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-forest-dark flex items-center justify-center p-6 relative">
      <Link href="/login" className="absolute top-8 left-8 flex items-center gap-2 text-white/70 font-medium hover:text-white transition-colors">
        <ArrowLeft size={20} /> Back to Farmer Login
      </Link>
      
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-100 p-8 text-center relative">
           <div className="w-16 h-16 rounded-full bg-forest/10 flex items-center justify-center text-forest mx-auto mb-4">
             <ShieldCheck size={32} />
           </div>
           <h2 className="text-2xl font-bold text-gray-900">AgroSeva Official Portal</h2>
           <p className="text-gray-500 mt-2 text-sm">Authorized personnel login only</p>
        </div>
        
        <div className="p-8">
          {error && <div className="p-3 mb-6 bg-red-50 border border-red-100 text-red-600 rounded-md text-sm text-center font-medium">{error}</div>}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Registered Mobile Number / Employee ID</label>
              <input 
                type="tel" 
                value={mobileNumber} 
                onChange={(e) => setMobileNumber(e.target.value)} 
                required 
                placeholder="Enter 10-digit number" 
                className="w-full h-[48px] px-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-forest/20 focus:border-forest outline-none transition-all shadow-sm" 
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-bold text-gray-700">Password</label>
                <button type="button" className="text-xs font-medium text-forest hover:underline">Forgot password?</button>
              </div>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                placeholder="••••••••" 
                className="w-full h-[48px] px-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-forest/20 focus:border-forest outline-none transition-all shadow-sm" 
              />
            </div>

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-forest hover:bg-forest-light text-white h-[48px] rounded-md font-bold text-lg transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? "Authenticating..." : "Login to Dashboard"}
              </button>
            </div>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-400">
              By logging in, you agree to the government security terms and auditing. All actions are logged.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
