"use client";

import Link from "next/link";
import { Users, FileText, CheckCircle, Headphones, Zap, UploadCloud, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import CinematicScroll from "../components/CinematicScroll";
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
    <main className="relative w-full">
      {/* Navbar overlaying the cinematic scroll */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-forest-dark/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center">
              <span className="text-forest-dark font-bold text-lg">A</span>
            </div>
            <span className="text-white font-bold text-xl tracking-wide">AgroSeva Portal</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-white/90 hover:text-gold transition-colors font-medium">Home</Link>
            <Link href="/schemes" className="text-white/90 hover:text-gold transition-colors font-medium">Schemes</Link>
            <Link href="/about" className="text-white/90 hover:text-gold transition-colors font-medium">About</Link>
            <Link href="/contact" className="text-white/90 hover:text-gold transition-colors font-medium">Contact</Link>
          </div>

          <div>
             <Link href="/login" className="bg-forest hover:bg-forest-light text-white px-6 py-2.5 rounded-md font-medium transition-colors shadow-subtle border border-forest-light/50">
               Login
             </Link>
          </div>
        </div>
      </nav>

      {/* Hero / Cinematic Scroll Section */}
      <section className="relative w-full">
        {/* We place CTA buttons absolutely inside the first part of the scroll, or fixed on page load? 
            Since the scroll takes 900vh, we'll let the user scroll through the story, and put CTAs at the bottom of the first milestone, handled inside the CinematicScroll, or we just put them sticky.
            Let's put a simple overlay that fades out on scroll, or just standard buttons immediately below the scroll.
        */}
        <CinematicScroll />
      </section>

      {/* CTA Buttons for the landing page - fixed near bottom of the first viewport */}
      <div className="absolute top-[80vh] left-[10vw] z-50 flex gap-4 pointer-events-auto">
        <Link href="/login" className="bg-forest hover:bg-forest-light text-white px-8 py-3 rounded-md font-bold transition-all shadow-subtle text-lg">
          Farmer Login
        </Link>
        <Link href="/schemes" className="border-2 border-white text-white hover:bg-white/10 px-8 py-3 rounded-md font-bold transition-all text-lg">
          View Schemes
        </Link>
      </div>

      {/* Content Below Hero */}
      <section className="relative z-10 bg-offwhite py-24">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 -mt-40 relative z-20">
            {[
              {
                label: "Total Farmers Registered",
                value: isLoading ? "—" : formatCompact(overview?.totalFarmers || 0),
                icon: Users,
              },
              {
                label: "Schemes Active",
                value: isLoading ? "—" : formatCompact(overview?.schemesActive || 0),
                icon: FileText,
              },
              {
                label: "Claims Processed",
                value: isLoading ? "—" : formatCompact(overview?.claimsProcessed || 0),
                icon: CheckCircle,
              },
              {
                label: "Grievances Resolved",
                value: isLoading ? "—" : `${overview?.grievancesResolvedRate || 0}%`,
                icon: Headphones,
              },
            ].map((stat, i) => (
              <div key={i} className="card p-8 flex flex-col items-start gap-4 bg-white">
                <div className="w-12 h-12 rounded-full bg-forest/10 flex items-center justify-center text-forest">
                  <stat.icon size={24} />
                </div>
                <div>
                  <h3 className="text-4xl font-bold text-gray-900">{stat.value}</h3>
                  <p className="text-gray-500 font-medium mt-1">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Features Section */}
          <div className="mt-32">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-forest-dark mb-4">Designed for the modern farmer</h2>
              <p className="text-lg text-gray-600">Access all government resources through a single, easy-to-use platform with full transparency.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                { title: "Fast Approvals", desc: "AI-driven document verification speeds up scheme and subsidy approvals to under 48 hours.", icon: Zap },
                { title: "Document Upload", desc: "Easily upload Aadhaar, 7/12 land extracts, and bank passbooks directly from your mobile phone.", icon: UploadCloud },
                { title: "Live Tracking", desc: "Know exactly where your application or claim is with real-time status updates and SMS alerts.", icon: MapPin },
              ].map((feature, i) => (
                <div key={i} className="flex flex-col items-center text-center p-6">
                  <div className="w-16 h-16 rounded-2xl bg-gold/20 flex items-center justify-center text-gold-hover mb-6">
                    <feature.icon size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-forest-dark border-t border-forest-light py-12 text-white/80">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center">
                <span className="text-forest-dark font-bold text-lg">A</span>
              </div>
              <span className="text-white font-bold text-xl tracking-wide">AgroSeva Portal</span>
            </div>
            <p className="max-w-sm">
              An official government initiative to empower farmers with seamless access to agricultural schemes, subsidies, and support.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="hover:text-gold transition-colors">Home</Link></li>
              <li><Link href="/schemes" className="hover:text-gold transition-colors">Schemes</Link></li>
              <li><Link href="/login" className="hover:text-gold transition-colors">Login / Register</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Contact</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2"><Headphones size={16} /> Helpline: 1800-120-1200</li>
              <li>support@agroseva.gov.in</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-white/10 text-sm text-white/50 flex flex-col md:flex-row justify-between items-center">
          <p>© 2026 Government Agriculture Department. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link href="#" className="hover:text-white">Privacy Policy</Link>
            <Link href="#" className="hover:text-white">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
