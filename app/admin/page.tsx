"use client";

import Link from "next/link";
import { TrendingUp, TrendingDown, Eye, AlertTriangle, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "../../lib/api";

export default function AdminDashboardPage() {
  const { data: dashboard, isLoading, error } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: async () => {
      const { data } = await api.get('/admin/dashboard');
      return data.data;
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-[1600px] mx-auto animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-28 bg-gray-200 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-80 bg-gray-200 rounded-xl" />
          <div className="h-80 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }
  
  if (error || !dashboard) {
    return (
      <div className="flex flex-col items-center justify-center p-24 text-center gap-4">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-500 text-2xl">⚠</div>
        <h2 className="text-lg font-bold text-gray-800">Failed to load dashboard</h2>
        <p className="text-sm text-gray-500 max-w-sm">Could not reach the server. Please check your connection or try again.</p>
        <button onClick={() => window.location.reload()} className="mt-2 px-5 py-2 bg-forest text-white rounded-lg font-semibold text-sm hover:bg-forest-dark transition-colors">
          Retry
        </button>
      </div>
    );
  }
  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Overview Dashboard</h1>
        <div className="text-sm text-gray-500 font-medium">Last updated: Today, 10:45 AM</div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Total Applications", value: dashboard.kpis?.totalApplications || 0, trend: "+12%", color: "border-blue-500" },
          { label: "Pending Review", value: dashboard.kpis?.pendingReview || 0, trend: "-5%", color: "border-amber-500" },
          { label: "Approved", value: dashboard.kpis?.approved || 0, trend: "+8%", color: "border-green-500" },
          { label: "Rejected", value: dashboard.kpis?.rejected || 0, trend: "-2%", color: "border-red-500" },
          { label: "Open Grievances", value: dashboard.kpis?.openGrievances || 0, trend: "+15%", color: "border-purple-500", negativeTrend: true },
        ].map((kpi, i) => (
          <div key={i} className={`bg-white rounded-xl shadow-sm border border-gray-200 border-t-4 ${kpi.color} p-5`}>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">{kpi.label}</p>
            <div className="flex items-end justify-between">
              <h3 className="text-3xl font-bold text-gray-900">{kpi.value}</h3>
              <span className={`flex items-center text-xs font-bold ${kpi.trend.startsWith('+') ? (kpi.negativeTrend ? 'text-red-600' : 'text-green-600') : (kpi.negativeTrend ? 'text-green-600' : 'text-green-600')}`}>
                {kpi.trend.startsWith('+') ? <TrendingUp size={14} className="mr-1"/> : <TrendingDown size={14} className="mr-1"/>}
                {kpi.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Bar Chart Mockup */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
              <h3 className="font-bold text-gray-900 mb-6">Applications by District (7 Days)</h3>
              <div className="flex-1 flex items-end gap-4 h-48">
                {[40, 70, 45, 90, 65, 30, 80].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-forest rounded-t-sm" style={{ height: `${h}%` }}></div>
                    <span className="text-[10px] text-gray-400 font-medium">D{i+1}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Donut Chart Mockup */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
               <h3 className="font-bold text-gray-900 mb-6">Application Status Breakdown</h3>
               <div className="flex-1 flex items-center justify-center relative">
                 <div className="w-32 h-32 rounded-full border-[16px] border-green-500 border-r-amber-400 border-t-blue-500 border-l-green-500 flex items-center justify-center">
                    <span className="font-bold text-xl text-gray-900">45%</span>
                 </div>
               </div>
               <div className="flex justify-center gap-4 mt-6 text-xs text-gray-600 font-medium">
                 <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-500"></span> Approved</span>
                 <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-500"></span> Under Review</span>
                 <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-400"></span> Pending</span>
               </div>
            </div>
          </div>

          {/* Alert Panel */}
          <div className="bg-[#FEF2F2] rounded-xl shadow-sm border border-red-100 border-l-4 border-l-red-500 p-6">
            <h3 className="font-bold text-red-900 mb-4 flex items-center gap-2">
              <AlertTriangle size={20} /> Flagged for Fraud/Anomaly
            </h3>
            <div className="space-y-3">
              {dashboard.flaggedApplications?.length === 0 ? (
                <div className="text-sm text-gray-500">No anomalies detected.</div>
              ) : dashboard.flaggedApplications?.map((alert: any, i: number) => (
                <div key={i} className="bg-white rounded-lg p-3 flex justify-between items-center border border-red-50">
                  <div>
                    <span className="font-bold text-gray-900 text-sm block">{alert.name || "Unknown"} <span className="text-gray-400 font-normal">({alert.applicationId})</span></span>
                    <span className="text-xs text-red-600 font-medium">{alert.aiScore?.flags?.[0] || alert.reason || "Suspicious Activity Detected"}</span>
                  </div>
                  <Link href={`/admin/applications?id=${alert.applicationId}`} className="bg-white border border-gray-200 text-gray-700 hover:text-forest hover:border-forest px-3 py-1.5 rounded text-sm font-semibold transition-colors">
                    Review
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Activity Feed */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col h-[calc(100vh-180px)] overflow-hidden">
          <h3 className="font-bold text-gray-900 mb-6">Recent Activity</h3>
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {dashboard.recentActivity?.length === 0 ? (
              <div className="text-sm text-gray-500">No recent activity.</div>
            ) : dashboard.recentActivity?.map((log: any, i: number) => {
              const type = log.entityType === 'Application' ? (log.action.includes('APPROVE') ? 'approval' : log.action.includes('REJECT') ? 'rejection' : 'review') : 'grievance';
              const color = type === 'approval' ? 'text-green-600' : type === 'rejection' ? 'text-red-600' : type === 'grievance' ? 'text-purple-600' : 'text-blue-600';
              return (
              <div key={i} className="relative pl-6 pb-4 border-l border-gray-100 last:border-transparent last:pb-0 group">
                <span className={`absolute -left-[5px] top-1.5 w-2 h-2 rounded-full ring-4 ring-white ${
                  type === 'approval' ? 'bg-green-500' : 
                  type === 'grievance' ? 'bg-purple-500' : 
                  type === 'rejection' ? 'bg-red-500' : 
                  type === 'review' ? 'bg-amber-500' : 'bg-blue-500'
                }`}></span>
                <p className={`text-sm font-bold ${color}`}>{log.action.replace(/_/g, ' ')}</p>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-gray-500">System / User</span>
                  <span className="text-xs text-gray-400 font-medium">{new Date(log.timestamp).toLocaleDateString()}</span>
                </div>
              </div>
            )})}
          </div>
        </div>

      </div>
    </div>
  );
}
