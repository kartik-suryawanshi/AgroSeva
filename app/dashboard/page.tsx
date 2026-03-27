"use client";

import Link from "next/link";
import { FileText, CheckCircle, Clock, XCircle, ChevronRight, PlusCircle, AlertTriangle, Search, Loader2 } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';

export default function FarmerDashboard() {
  const { data: dashboardResp, isLoading, isError } = useQuery({
    queryKey: ['farmerDashboard'],
    queryFn: async () => {
      const { data } = await api.get('/farmer/dashboard');
      return data.data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="animate-spin text-forest" size={48} />
      </div>
    );
  }

  if (isError || !dashboardResp) {
    return (
      <div className="text-center text-red-600 p-8 bg-red-50 rounded-lg">
        Failed to load dashboard data. Please make sure you are logged in.
      </div>
    );
  }

  const { applications, recentApplications, latestGrievance, notifications } = dashboardResp;

  const totalSubmitted = (applications['submitted'] || 0) + (applications['documents_pending'] || 0);
  const totalUnderReview = applications['under_review'] || 0;
  const totalApproved = (applications['approved'] || 0) + (applications['disbursed'] || 0) + (applications['eligible'] || 0);
  const totalRejected = (applications['rejected'] || 0) + (applications['ineligible'] || 0) + (applications['cancelled'] || 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Summary Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Applications Submitted", count: totalSubmitted, color: "border-gray-400", icon: FileText, textColor: "text-gray-700" },
          { label: "Under Review", count: totalUnderReview, color: "border-amber-400", icon: Clock, textColor: "text-amber-700" },
          { label: "Approved (Active)", count: totalApproved, color: "border-green-500", icon: CheckCircle, textColor: "text-green-700" },
          { label: "Rejected / Ineligible", count: totalRejected, color: "border-red-500", icon: XCircle, textColor: "text-red-700" },
        ].map((stat, i) => (
          <div key={i} className={`bg-white rounded-lg shadow-sm border border-gray-100 border-l-4 ${stat.color} p-5 flex items-center justify-between`}>
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">{stat.label}</p>
              <h3 className="text-3xl font-bold text-gray-900">{stat.count}</h3>
            </div>
            <div className={`p-3 rounded-full bg-gray-50 ${stat.textColor}`}>
              <stat.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Table + Grievance) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Recent Applications Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900">Recent Applications</h2>
              <Link href="/dashboard/track" className="text-sm font-semibold text-forest hover:text-forest-light flex items-center">
                View All <ChevronRight size={16} />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-sm font-semibold border-b border-gray-200">
                    <th className="px-6 py-3">Scheme Name</th>
                    <th className="px-6 py-3">Applied Date</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentApplications?.length > 0 ? (
                    recentApplications.map((app: any) => (
                      <tr key={app._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">{app.schemeId?.schemeName || 'Unknown Scheme'}</td>
                        <td className="px-6 py-4 text-gray-600">{new Date(app.createdAt).toLocaleDateString('en-GB')}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold 
                            ${app.status === 'approved' || app.status === 'disbursed' || app.status === 'eligible' ? 'bg-green-100 text-green-800' :
                              app.status === 'rejected' || app.status === 'ineligible' ? 'bg-red-100 text-red-800' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                            {app.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link href={`/dashboard/track?id=${app.applicationId}`} className="text-forest hover:underline text-sm font-medium">Track</Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                        No recent applications found. <Link href="/schemes" className="text-forest underline">Apply now</Link>.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Grievance Status Section */}
          {latestGrievance && (
            <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center justify-between border-l-4 
              ${latestGrievance.status === 'resolved' || latestGrievance.status === 'closed' ? 'border-l-green-500' : 'border-l-amber-500'}
            `}>
              <div>
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Latest Grievance</h3>
                <p className="text-gray-900 font-semibold text-lg">{latestGrievance.subject} ({latestGrievance.grievanceId})</p>
                <p className="text-sm text-gray-500 mt-1">Submitted on {new Date(latestGrievance.createdAt).toLocaleDateString('en-GB')}</p>
              </div>
              <div className="text-right">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold mb-2
                  ${latestGrievance.status === 'resolved' || latestGrievance.status === 'closed' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}
                `}>
                  {latestGrievance.status.replace('_', ' ').toUpperCase()}
                </span>
                <br/>
                <Link href="/dashboard/grievance" className="text-forest hover:underline text-sm font-medium">View Updates</Link>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (Actions + Notifications) */}
        <div className="space-y-8">
          
          {/* Quick Actions */}
          <div className="bg-forest rounded-xl shadow-sm p-6 text-white text-center border-b-4 border-gold">
            <h2 className="font-bold text-xl mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link href="/schemes" className="flex items-center justify-center gap-2 w-full bg-white text-forest hover:bg-gray-50 py-3 rounded-lg font-bold transition-colors">
                <PlusCircle size={18} /> Apply New Scheme
              </Link>
              <Link href="/dashboard/grievance" className="flex items-center justify-center gap-2 w-full bg-forest-light text-white hover:bg-forest-light/80 border border-white/20 py-3 rounded-lg font-bold transition-colors">
                <AlertTriangle size={18} /> File Grievance
              </Link>
              <Link href="/dashboard/track" className="flex items-center justify-center gap-2 w-full text-white hover:bg-white/10 py-3 rounded-lg font-bold transition-colors">
                 <Search size={18} /> Check Application Status
              </Link>
            </div>
          </div>

          {/* Notifications Panel */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[350px]">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="font-bold text-gray-900">Recent Updates</h2>
            </div>
            <div className="divide-y divide-gray-100 overflow-y-auto flex-1">
              {notifications?.length > 0 ? (
                notifications.map((note: any) => (
                  <div key={note._id} className="p-4 hover:bg-gray-50 transition-colors flex gap-4">
                    <div className="mt-1.5 shrink-0">
                      <span className={`block w-2.5 h-2.5 rounded-full ${note.isRead ? 'bg-gray-300' : 'bg-amber-500'}`}></span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-800">{note.title}</h4>
                      <p className="text-sm text-gray-600 mt-0.5">{note.message}</p>
                      <span className="text-xs text-gray-400 mt-2 block">{new Date(note.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500 text-sm">
                  You have no new notifications.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
