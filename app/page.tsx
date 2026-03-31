"use client";

import Link from "next/link";
import { Users, FileText, CheckCircle, Headphones, Zap, UploadCloud, MapPin, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "../lib/api";

export default function Home() {
  const { data: overview, isLoading } = useQuery({
    queryKey: ["publicOverview"],
    queryFn: async () => {
      const res = await api.get("/public/dashboard/overview");
      return res.data.data;
    },
  });

  const formatCompact = (n: number) =>
    new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 }).format(n);

  return (
    <main className="min-h-screen bg-offwhite flex flex-col font-sans">
      {/* Navbar Minimalist */}
      <nav className="sticky top-0 z-50 bg-offwhite/90 backdrop-blur-xl border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-forest flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="text-gray-900 font-bold text-lg tracking-tight">AgroSeva</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-gray-600 hover:text-forest transition-colors text-sm font-medium">Home</Link>
            <Link href="/schemes" className="text-gray-600 hover:text-forest transition-colors text-sm font-medium">Schemes</Link>
            <Link href="/about" className="text-gray-600 hover:text-forest transition-colors text-sm font-medium">About</Link>
          </div>

          <div className="flex items-center gap-4">
             <Link href="/login" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors hidden sm:block">
               Sign in
             </Link>
             <Link href="/login" className="bg-forest hover:bg-forest-light text-white px-5 py-2 rounded-lg text-sm font-medium transition-all shadow-sm flex items-center gap-2">
               Get Started
             </Link>
          </div>
        </div>
      </nav>

      {/* Hero Minimalist */}
      <section className="relative w-full pt-32 pb-24 overflow-hidden border-b border-gray-200/50">
        {/* Subtle patterned background or gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--color-gold)_0%,transparent_20%)] opacity-10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,var(--color-forest)_0%,transparent_30%)] opacity-5"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest/5 border border-forest/10 text-forest-light text-xs font-semibold tracking-wide uppercase mb-8">
            <span className="w-2 h-2 rounded-full bg-forest animate-pulse"></span>
            Official Government Portal
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight leading-[1.1] max-w-4xl mb-6">
            Empowering Farmers with <span className="text-forest">Smart</span> Solutions
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mb-10 leading-relaxed">
            A seamless, transparent platform to access government agricultural schemes, submit claims, and resolve grievances with zero friction.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link href="/login" className="bg-forest hover:transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-forest/20 text-white px-8 py-3.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2 text-base">
              Farmer Login <ArrowRight size={18} />
            </Link>
            <Link href="/schemes" className="bg-white border hover:bg-gray-50 border-gray-200 text-gray-700 px-8 py-3.5 rounded-xl font-medium transition-all flex items-center justify-center text-base shadow-sm">
              Explore Schemes
            </Link>
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {[
              { label: "Farmers Registered", value: overview?.totalFarmers || 0, formatted: formatCompact(overview?.totalFarmers || 0) },
              { label: "Active Schemes", value: overview?.schemesActive || 0, formatted: formatCompact(overview?.schemesActive || 0) },
              { label: "Claims Processed", value: overview?.claimsProcessed || 0, formatted: formatCompact(overview?.claimsProcessed || 0) },
              { label: "Resolution Rate", value: overview?.grievancesResolvedRate || 0, formatted: `${overview?.grievancesResolvedRate || 0}%` },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-start border-l-2 border-forest/10 pl-6">
                <span className="text-gray-500 font-medium text-sm md:text-base mb-2">{stat.label}</span>
                <span className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight">
                  {isLoading ? "—" : stat.formatted}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-offwhite border-t border-gray-200/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-4">
                Designed for speed and simplicity.
              </h2>
              <p className="text-gray-600 text-lg">
                We've rebuilt the agricultural support system from the ground up to ensure you get what you need, when you need it.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Instant Verification", desc: "AI-driven document checking approvals within 48 hours instead of months.", icon: Zap },
              { title: "Mobile Uploads", desc: "Snap and upload Aadhaar, land extracts, and bank details directly from your phone.", icon: UploadCloud },
              { title: "Real-time Tracking", desc: "Always know exactly where your application stands via our live tracking dashboard.", icon: MapPin },
            ].map((feature, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-forest/5 flex items-center justify-center text-forest mb-6">
                  <feature.icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Minimal */}
      <footer className="bg-white border-t border-gray-200 pt-16 pb-8 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-forest flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="text-gray-900 font-bold text-lg tracking-tight">AgroSeva Portal</span>
            </div>
            <p className="text-gray-500 text-sm max-w-xs">
              Empowering the agricultural backbone with modern, accessible government support.
            </p>
          </div>
          
          <div className="flex gap-8 text-sm font-medium">
            <div className="flex flex-col gap-3">
              <span className="text-gray-900 font-semibold mb-1">Platform</span>
              <Link href="/schemes" className="text-gray-500 hover:text-forest transition-colors">Schemes</Link>
              <Link href="/login" className="text-gray-500 hover:text-forest transition-colors">Apply Now</Link>
              <Link href="/dashboard" className="text-gray-500 hover:text-forest transition-colors">Track Status</Link>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-gray-900 font-semibold mb-1">Support</span>
              <a href="#" className="text-gray-500 hover:text-forest transition-colors">Help Center</a>
              <a href="mailto:support@agroseva.gov.in" className="text-gray-500 hover:text-forest transition-colors">Contact</a>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400 gap-4">
          <p>© {new Date().getFullYear()} Government Agriculture Department. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-gray-600 transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-gray-600 transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

