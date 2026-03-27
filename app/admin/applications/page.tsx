"use client";

import { useState } from "react";
import { Search, Filter, ChevronDown, CheckCircle2, XCircle, X, FileScan, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from '../../../lib/api';

export default function ApplicationReviewPage() {
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [remarks, setRemarks] = useState("");
  const queryClient = useQueryClient();

  const { data: appsData, isLoading } = useQuery({
    queryKey: ['adminApplications'],
    queryFn: async () => {
      const res = await api.get('/admin/applications');
      return res.data.docs; // Paginated response returns docs array
    }
  });

  const statusMutation = useMutation({
    mutationFn: async ({ appId, status, reviewRemarks }: { appId: string, status: string, reviewRemarks: string }) => {
      const res = await api.put(`/admin/applications/${appId}/status`, { status, reviewRemarks });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminApplications'] });
      // Close side panel
      setSelectedApp(null);
      setRemarks("");
    }
  });

  // Close drawer on escape
  if (typeof window !== "undefined") {
    window.onkeydown = (e) => {
      if (e.key === "Escape") setSelectedApp(null);
    };
  }

  const getAiBadgeColor = (score: number) => {
    if (score >= 90) return "bg-green-100 text-green-800";
    if (score >= 60) return "bg-amber-100 text-amber-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Filter Bar */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Application Review</h1>
          <p className="text-gray-500 text-sm">Process farmer applications with AI-assisted verification.</p>
        </div>
        
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Search ID, Name..." className="w-full md:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest outline-none text-sm" />
          </div>
          <select className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-forest outline-none bg-white">
            <option>All Schemes</option>
          </select>
          <select className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-forest outline-none bg-white">
            <option>All Districts</option>
          </select>
          <button className="flex items-center gap-2 bg-gray-50 border border-gray-300 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors text-sm font-medium">
            <Filter size={16} /> More Filters
          </button>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider border-b border-gray-200">
                <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 group">App ID <ChevronDown size={14} className="inline ml-1 opacity-50 group-hover:opacity-100" /></th>
                <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 group">Farmer Name <ChevronDown size={14} className="inline ml-1 opacity-50 group-hover:opacity-100" /></th>
                <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 group">Scheme <ChevronDown size={14} className="inline ml-1 opacity-50 group-hover:opacity-100" /></th>
                <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 group">District <ChevronDown size={14} className="inline ml-1 opacity-50 group-hover:opacity-100" /></th>
                <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 group">Date <ChevronDown size={14} className="inline ml-1 opacity-50 group-hover:opacity-100" /></th>
                <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 group">AI Score <ChevronDown size={14} className="inline ml-1 opacity-50 group-hover:opacity-100" /></th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500">
                    <Loader2 className="animate-spin text-forest mx-auto mb-2" size={24} />
                    Loading applications...
                  </td>
                </tr>
              ) : appsData?.length > 0 ? (
                appsData.map((app: any) => {
                  const score = app.eligibilityResult?.score || 0;
                  const scoreLabel = score >= 90 ? 'High' : score >= 60 ? 'Medium' : 'Low';
                  
                  return (
                    <tr 
                      key={app._id} 
                      onClick={() => setSelectedApp(app)}
                      className="hover:bg-[#F0FDF4] cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 font-mono text-sm font-semibold text-gray-900">{app.applicationId}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{app.farmerId?.personalDetails?.fullName || 'Unknown'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{app.schemeId?.schemeName}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{app.farmerId?.address?.district || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{new Date(app.createdAt).toLocaleDateString('en-GB')}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${getAiBadgeColor(score)}`}>
                          {score}% ({scoreLabel})
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-700 capitalize">{app.status.replace('_', ' ')}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-forest hover:text-forest-light font-semibold text-sm">Review</button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500">
                    No applications found in the system.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500">
          <span>{isLoading ? 'Loading...' : `Showing ${appsData?.length || 0} entries`}</span>
          <div className="flex gap-2 text-sm">
            <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">Prev</button>
            <button className="px-3 py-1 border border-forest bg-forest text-white rounded">1</button>
            <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">Next</button>
          </div>
        </div>
      </div>

      {/* Slide-over Panel */}
      <AnimatePresence>
        {selectedApp && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedApp(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 cursor-pointer"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[480px] bg-white z-50 shadow-[-10px_0_30px_rgba(0,0,0,0.1)] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50 shrink-0">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedApp.applicationId}</h2>
                  <p className="text-sm text-gray-500 font-medium">{selectedApp.schemeId?.schemeName}</p>
                </div>
                <button onClick={() => setSelectedApp(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-500 transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="p-6 overflow-y-auto flex-1 space-y-8">
                
                {/* Farmer Info Summary */}
                <section>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Applicant Details</h3>
                  <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-y-4 text-sm border border-gray-100">
                    <div><span className="block text-gray-500 mb-1">Name</span><span className="font-semibold text-gray-900">{selectedApp.farmerId?.personalDetails?.fullName || 'Unknown'}</span></div>
                    <div><span className="block text-gray-500 mb-1">Farmer ID</span><span className="font-mono text-gray-900">{selectedApp.farmerId?.farmerId || 'Unknown'}</span></div>
                    <div><span className="block text-gray-500 mb-1">District</span><span className="font-semibold text-gray-900">{selectedApp.farmerId?.address?.district || 'Unknown'}</span></div>
                    <div><span className="block text-gray-500 mb-1">Submitted</span><span className="font-semibold text-gray-900">{new Date(selectedApp.createdAt).toLocaleDateString('en-GB')}</span></div>
                  </div>
                </section>

                {/* AI Eligibility Analysis */}
                <section>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    AI Eligibility Analysis 
                    <span className={`px-2 py-0.5 rounded text-[10px] text-white ${selectedApp.eligibilityResult?.score >= 90 ? 'bg-green-500' : 'bg-red-500'}`}>Score: {selectedApp.eligibilityResult?.score || 0}%</span>
                  </h3>
                  <div className={`rounded-lg p-5 border ${(selectedApp.eligibilityResult?.score || 0) >= 90 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <ul className="space-y-3 mb-4">
                      {selectedApp.eligibilityResult?.criteriaResults?.map((res: any, idx: number) => (
                        <li key={idx} className="flex items-start gap-3">
                          {res.passed ? <CheckCircle2 size={18} className="text-green-600 mt-0.5 shrink-0" /> : <XCircle size={18} className="text-red-500 mt-0.5 shrink-0" />}
                          <span className="text-sm text-gray-800">{res.message}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="pt-3 border-t border-black/10 mt-2">
                      <span className="font-bold text-sm text-gray-900">Recommendation:</span> 
                      <span className={`ml-2 text-sm font-semibold ${(selectedApp.eligibilityResult?.score || 0) >= 90 ? 'text-green-700' : 'text-red-700'}`}>
                         {(selectedApp.eligibilityResult?.score || 0) >= 90 ? 'Ready for auto-approval.' : 'Requires manual name verification.'}
                      </span>
                    </div>
                  </div>
                </section>

                {/* Documents Panel */}
                <section>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Documents & OCR</h3>
                  <div className="space-y-4">
                    <div className="border border-gray-200 rounded-lg p-4 flex gap-4 bg-white">
                      <div className="w-20 h-24 bg-gray-100 rounded border border-gray-200 flex items-center justify-center shrink-0">
                         <FileScan size={24} className="text-gray-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-gray-900 mb-2">Attached Documents</h4>
                        <div className="bg-[#FFFBEB] p-2 rounded text-xs text-gray-700 border-l-2 border-amber-400 font-mono">
                          Available in DB.
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Officer Remarks */}
                <section>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Officer Remarks</h3>
                  <textarea value={remarks} onChange={e => setRemarks(e.target.value)} rows={3} placeholder="Add specific notes before taking action..." className="w-full text-sm p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest outline-none resize-none"></textarea>
                </section>
                
              </div>

              {/* Action Buttons Footer */}
              <div className="p-6 border-t border-gray-200 bg-white shrink-0 flex flex-col gap-3">
                <button 
                  onClick={() => statusMutation.mutate({ appId: selectedApp._id, status: 'approved', reviewRemarks: remarks })}
                  disabled={statusMutation.isPending}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold transition-colors shadow-sm disabled:opacity-50">
                  {statusMutation.isPending ? 'Processing...' : 'Approve Application'}
                </button>
                <div className="flex gap-3">
                  <button className="flex-1 bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 py-3 rounded-lg font-bold transition-colors">
                    Request Info
                  </button>
                  <button 
                    onClick={() => statusMutation.mutate({ appId: selectedApp._id, status: 'rejected', reviewRemarks: remarks })}
                    disabled={statusMutation.isPending}
                    className="flex-1 bg-white border border-red-600 text-red-600 hover:bg-red-50 py-3 rounded-lg font-bold transition-colors disabled:opacity-50">
                    Reject
                  </button>
                </div>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
