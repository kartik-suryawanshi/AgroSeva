"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { 
  LayoutDashboard, 
  FilePlus, 
  ListCheck, 
  ShieldAlert, 
  MessageSquareWarning, 
  User, 
  LogOut,
  Bell,
  MapPin
} from "lucide-react";
import api from "../../lib/api";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: farmerProfile } = useQuery({
    queryKey: ["dashboardLayoutFarmerProfile"],
    queryFn: async () => {
      const res = await api.get("/farmer/profile");
      return res.data.data;
    },
  });

  const fullName = farmerProfile?.personalDetails?.fullName || "";
  const district = farmerProfile?.address?.district || "";
  const state = farmerProfile?.address?.state || "";
  const locationText = [district, state].filter(Boolean).join(", ");

  const initials = (() => {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "F";
    const a = parts[0]?.[0] || "F";
    const b = parts[1]?.[0] || "";
    return (a + b).toUpperCase();
  })();

  const navLinks = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Apply Scheme", href: "/dashboard/apply", icon: FilePlus },
    { name: "My Applications", href: "/dashboard/track", icon: ListCheck },
    { name: "Insurance Claim", href: "/dashboard/insurance", icon: ShieldAlert },
    { name: "Grievances", href: "/dashboard/grievance", icon: MessageSquareWarning },
    { name: "My Profile", href: "/dashboard/profile", icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex">
      {/* Sidebar (left, 240px wide) */}
      <aside className="w-64 bg-forest-dark text-white flex flex-col shrink-0 fixed h-full z-20">
        {/* Profile Info */}
        <div className="p-6 border-b border-white/10 flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-forest flex items-center justify-center text-3xl font-bold text-gold border-2 border-gold/30 mb-3 shadow-lg">
            {initials}
          </div>
          <h2 className="text-lg font-bold">{fullName || "Farmer"}</h2>
          {locationText ? (
            <div className="flex items-center text-white/60 text-sm mt-1">
              <MapPin size={14} className="mr-1" />
              <span>{locationText}</span>
            </div>
          ) : null}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.name} 
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                  ? "bg-forest border-l-4 border-gold text-white" 
                  : "text-white/70 hover:bg-forest hover:text-white border-l-4 border-transparent"
                }`}
              >
                <link.icon size={20} />
                <span className="font-medium">{link.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/10">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 text-red-300 hover:bg-red-500/10 rounded-lg transition-colors">
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
          <h1 className="text-xl font-bold text-gray-800">
            {fullName ? `Good morning, ${fullName.split(" ")[0]}` : "Welcome"}
          </h1>
          <div className="flex items-center gap-6">
            <button className="relative text-gray-400 hover:text-forest transition-colors">
              <Bell size={24} />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
