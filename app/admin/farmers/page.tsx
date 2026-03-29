"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../../lib/api";
import { Search, Filter, Download, UserCheck, UserX, UserMinus, ChevronDown, CheckCircle2, History, X, MapPin, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function maskValue(value?: string) {
  const digits = (value || "").replace(/\D/g, "");
  if (!digits) return "—";
  const last4 = digits.slice(-4);
  return `XXXX XXXX ${last4}`;
}

function initialsFromName(name?: string) {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "F";
  return `${parts[0]?.[0] || "F"}${parts[1]?.[0] || ""}`.toUpperCase();
}

function getKycBadge(status: string) {
  if (status === "Verified") return "bg-green-100 text-green-800";
  if (status === "Pending") return "bg-amber-100 text-amber-800";
  return "bg-red-100 text-red-800";
}

function getKycIcon(status: string) {
  if (status === "Verified") return <UserCheck size={14} className="mr-1" />;
  if (status === "Pending") return <UserMinus size={14} className="mr-1" />;
  return <UserX size={14} className="mr-1" />;
}

function deriveKyc(profile: any) {
  const docs = profile?.documents || [];
  if (!docs.length) return profile?.personalDetails?.aadhaarVerified ? "Verified" : "Pending";

  const statuses = docs.map((d: any) => d.verificationStatus);
  if (statuses.every((s: string) => s === "verified")) return "Verified";
  if (statuses.some((s: string) => s === "pending")) return "Pending";
  return "Failed";
}

export default function FarmerRecordsPage() {
  const [search, setSearch] = useState("");
  const [district, setDistrict] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const [selectedFarmerId, setSelectedFarmerId] = useState<string | null>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedFarmerId(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const farmersQuery = useQuery({
    queryKey: ["adminFarmers", search, district, page, limit],
    queryFn: async () => {
      const res = await api.get("/admin/farmers", {
        params: {
          search: search || undefined,
          district: district || undefined,
          page,
          limit,
        },
      });
      return res.data?.data || res.data;
    },
  });

  const farmers = farmersQuery.data?.docs || [];
  const totalDocs = farmersQuery.data?.totalDocs || 0;
  const totalPages = farmersQuery.data?.totalPages || 1;

  const selectedQuery = useQuery({
    queryKey: ["adminFarmerById", selectedFarmerId],
    enabled: !!selectedFarmerId,
    queryFn: async () => {
      const res = await api.get(`/admin/farmers/${selectedFarmerId}`);
      return res.data?.data;
    },
  });

  const profile = selectedQuery.data?.profile;
  const applications = selectedQuery.data?.applications || [];
  const selectedKyc = profile ? deriveKyc(profile) : null;
  const applicationHistory = useMemo(() => {
    const sorted = [...applications].sort(
      (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return sorted.slice(0, 8).map((app: any) => {
      const schemeName = app.schemeId?.schemeName || "—";
      const date = app.createdAt ? new Date(app.createdAt).toLocaleDateString("en-GB") : "—";
      const status = String(app.status || "");

      const uiStatus =
        status === "disbursed" || status === "approved" || status === "eligible"
          ? "Approved"
          : status === "rejected" || status === "ineligible" || status === "cancelled"
            ? "Rejected"
            : status.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());

      const badgeClass =
        uiStatus === "Approved"
          ? "bg-green-100 text-green-800"
          : uiStatus === "Rejected"
            ? "bg-red-100 text-red-800"
            : "bg-amber-100 text-amber-800";

      return { schemeName, date, uiStatus, badgeClass };
    });
  }, [applications]);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Farmer Database</h1>
          <p className="text-gray-500 text-sm">Manage registered farmers, verify KYC, and view 360° profiles.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right mr-4 hidden md:block">
            <span className="block text-2xl font-bold text-forest-dark">{totalDocs.toLocaleString("en-US")}</span>
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Registered</span>
          </div>
          <button className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-bold">
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap gap-3 w-full">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            placeholder="Search by Aadhaar, Name, ID..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest outline-none text-sm"
          />
        </div>
        <select
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-forest outline-none bg-white font-medium"
        >
          <option value="">All Districts</option>
          <option value="Banaskantha">Banaskantha</option>
          <option value="Patan">Patan</option>
          <option value="Mehsana">Mehsana</option>
        </select>
        <select className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-forest outline-none bg-white font-medium" disabled>
          <option>KYC Status: All (coming soon)</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider border-b border-gray-200">
                <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 group">Farmer ID <ChevronDown size={14} className="inline ml-1 opacity-50 group-hover:opacity-100" /></th>
                <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 group">Name <ChevronDown size={14} className="inline ml-1 opacity-50 group-hover:opacity-100" /></th>
                <th className="px-6 py-4">Aadhaar</th>
                <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 group">District <ChevronDown size={14} className="inline ml-1 opacity-50 group-hover:opacity-100" /></th>
                <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 group">Land Area <ChevronDown size={14} className="inline ml-1 opacity-50 group-hover:opacity-100" /></th>
                <th className="px-6 py-4">KYC Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {farmersQuery.isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                    <Loader2 className="animate-spin mx-auto" />
                  </td>
                </tr>
              ) : !farmers.length ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-gray-500">No farmers found.</td>
                </tr>
              ) : (
                farmers.map((farmer: any) => {
                  const kycStatus = farmer?.personalDetails?.aadhaarVerified ? "Verified" : "Pending";
                  const land = farmer?.landDetails?.totalLandAcres !== undefined ? `${farmer.landDetails.totalLandAcres} Acres` : "—";
                  return (
                  <tr 
                    key={farmer._id} 
                    onClick={() => setSelectedFarmerId(farmer._id)}
                    className="hover:bg-[#F0FDF4] cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 font-mono text-sm font-semibold text-gray-900">{farmer?.farmerId || "—"}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{farmer?.personalDetails?.fullName || "Unknown"}</td>
                    <td className="px-6 py-4 font-mono text-sm text-gray-500">{maskValue(farmer?.personalDetails?.aadhaarNumber)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{farmer?.address?.district || "—"}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{land}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${getKycBadge(kycStatus)}`}>
                        {getKycIcon(kycStatus)}
                        {kycStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-forest hover:text-forest-light font-semibold text-sm">View 360°</button>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500">
          <span>
            Showing {totalDocs ? (page - 1) * limit + 1 : 0} to {Math.min(page * limit, totalDocs)} of{" "}
            {totalDocs.toLocaleString("en-US")} entries
          </span>
          <div className="flex gap-2 text-sm items-center">
            <button
              type="button"
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              Prev
            </button>
            <span className="px-3 py-1 text-gray-600 font-bold">
              Page {page} / {totalPages}
            </span>
            <button
              type="button"
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Slide-over Panel: 360 View */}
      <AnimatePresence>
        {selectedFarmerId && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedFarmerId(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 cursor-pointer"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full md:w-[600px] bg-white z-50 shadow-[-10px_0_30px_rgba(0,0,0,0.1)] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-forest-dark text-white flex-shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center font-bold text-xl text-gold border-2 border-white/20">
                    {initialsFromName(profile?.personalDetails?.fullName)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{profile?.personalDetails?.fullName || "Farmer"}</h2>
                    <div className="flex items-center gap-3 text-sm text-white/70 mt-1">
                      <span className="font-mono">{profile?.farmerId || "—"}</span>
                      <span className="flex items-center gap-1"><MapPin size={12}/> {profile?.address?.district || "—"}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedFarmerId(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors" type="button">
                  <X size={20} />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="p-6 overflow-y-auto flex-1 bg-gray-50 space-y-6">
                
                {/* Status Bar */}
                <div className="flex items-center justify-between bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
                  <div>
                    <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Registration Date</span>
                    <span className="font-medium text-gray-900">{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-GB') : '—'}</span>
                  </div>
                  <div className="w-px h-8 bg-gray-200"></div>
                  <div>
                    <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Schemes</span>
                    <span className="font-medium text-gray-900">{applications.length} Applied</span>
                  </div>
                  <div className="w-px h-8 bg-gray-200"></div>
                  <div>
                    <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">KYC Status</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${getKycBadge(selectedKyc || 'Pending')}`}>
                      {getKycIcon(selectedKyc || 'Pending')} {selectedKyc || 'Pending'}
                    </span>
                  </div>
                </div>

                {/* Land & Bank Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Land Profile</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between"><span className="text-gray-500">Total Area</span><span className="font-semibold text-gray-900">{profile?.landDetails?.totalLandAcres !== undefined ? `${profile.landDetails.totalLandAcres} Acres` : '—'}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Land Type</span><span className="font-semibold text-gray-900">{profile?.landDetails?.landType || '—'}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Primary Crop</span><span className="font-semibold text-gray-900">{profile?.landDetails?.primaryCrop || '—'}</span></div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Bank Details</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between"><span className="text-gray-500">Bank</span><span className="font-semibold text-gray-900">{profile?.bankDetails?.bankName || '—'}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">A/C No.</span><span className="font-mono text-gray-900">{profile?.bankDetails?.accountNumber ? maskValue(profile.bankDetails.accountNumber) : '—'}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Aadhaar Linked</span><span className="font-semibold text-green-600 flex items-center gap-1">{profile?.personalDetails?.aadhaarVerified ? <CheckCircle2 size={14} /> : null}{profile?.personalDetails?.aadhaarVerified ? 'Yes' : 'No'}</span></div>
                    </div>
                  </div>
                </div>

                {/* Application History */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider p-4 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
                    <History size={16} /> Application History
                  </h3>
                  <div className="divide-y divide-gray-100">
                    {applicationHistory.length ? (
                      applicationHistory.map((app: any, i: number) => (
                        <div key={i} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                          <div>
                            <h4 className="font-bold text-sm text-gray-900">{app.schemeName}</h4>
                            <span className="text-xs text-gray-500">{app.date}</span>
                          </div>
                          <span className={`text-xs font-bold px-2 py-1 rounded-md ${app.badgeClass}`}>
                            {app.uiStatus}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-sm text-gray-500">No application history.</div>
                    )}
                  </div>
                </div>

              </div>
              
              <div className="p-4 border-t border-gray-200 bg-white shrink-0 flex gap-3">
                 <button className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-2.5 rounded-lg font-bold transition-colors">Edit Profile</button>
                 <button className="flex-1 bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 py-2.5 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"><UserCheck size={18}/> Verify KYC</button>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
