"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { 
  LayoutDashboard, 
  FileCheck, 
  FileScan, 
  MessageSquareWarning, 
  BarChart3, 
  Users, 
  Wallet,
  Settings,
  Bell,
  LogOut
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileNumber, setMobileNumber] = useState<string>("");

  useEffect(() => {
    try {
      const uStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
      if (!uStr) return;
      const u = JSON.parse(uStr);
      if (typeof u?.mobileNumber === "string") setMobileNumber(u.mobileNumber);
    } catch {
      // ignore
    }
  }, []);

  const initials = useMemo(() => {
    if (!mobileNumber) return "A";
    const digits = mobileNumber.replace(/\D/g, "");
    if (!digits) return "A";
    return digits.slice(-2).padStart(2, "0");
  }, [mobileNumber]);

  const subTitle = useMemo(() => {
    if (!mobileNumber) return "Admin";
    return `Mobile: ${mobileNumber}`;
  }, [mobileNumber]);

  const navLinks = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Applications", href: "/admin/applications", icon: FileCheck },
    { name: "Documents", href: "/admin/documents", icon: FileScan },
    { name: "Grievances", href: "/admin/grievances", icon: MessageSquareWarning },
    { name: "Reports", href: "/admin/reports", icon: BarChart3 },
    { name: "Farmer Records", href: "/admin/farmers", icon: Users },
    { name: "Schemes", href: "/admin/schemes", icon: Wallet },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex">
      {/* Sidebar (left, 260px wide) */}
      <aside className="w-[260px] bg-forest-dark text-white flex flex-col shrink-0 fixed h-full z-20">
        <div className="h-16 flex items-center px-6 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center">
              <span className="text-forest-dark font-bold text-lg">A</span>
            </div>
            <span className="text-white font-bold text-lg tracking-wide hidden sm:block">AgroAdmin</span>
          </div>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
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
                <span className="font-medium text-sm">{link.name}</span>
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-[260px] flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
          <div></div>
          <div className="flex items-center gap-6">
            <button className="relative text-gray-500 hover:text-forest transition-colors mt-1">
              <Bell size={22} />
            </button>
            <div className="w-px h-6 bg-gray-200"></div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-forest-light text-white flex items-center justify-center font-bold text-sm">
                {initials}
              </div>
              <div className="hidden sm:block text-right">
                <div className="text-sm font-bold text-gray-900 leading-tight">AgroAdmin</div>
                <div className="text-xs text-gray-500">{subTitle}</div>
              </div>
              <Link href="/login" className="ml-4 text-gray-400 hover:text-red-500 transition-colors">
                <LogOut size={20} />
              </Link>
            </div>
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
