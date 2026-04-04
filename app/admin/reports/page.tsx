"use client";

import { BarChart3, Download, Calendar, TrendingUp, Filter, FileText, ChevronRight, Loader2, BrainCircuit } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "../../../lib/api";

export default function ReportsAnalyticsPage() {
  
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['adminAnalytics'],
    queryFn: async () => {
      const res = await api.get('/admin/reports/analytics');
      return res.data.data;
    }
  });

  const { data: predictions, isLoading: isPredLoading } = useQuery({
    queryKey: ['adminPredictions'],
    queryFn: async () => {
      try {
         const res = await api.get('/admin/reports/predictions');
         return res.data.data;
      } catch(e) {
         return null; // AI server might be offline
      }
    },
    retry: false
  });

  const rawTrend = analyticsData?.trend || [];
  
  // Format trend data for chart
  const maxCount = Math.max(...rawTrend.map((t:any) => t.count), 10);
  
  const getLabel = (ym: string) => {
    if (!ym) return "";
    const [y, m] = ym.split('-');
    const date = new Date(parseInt(y), parseInt(m)-1);
    return date.toLocaleString('default', { month: 'short' });
  }

  const chartData = rawTrend.map((t: any) => ({
    m: getLabel(t._id),
    vTotal: Math.round((t.count / maxCount) * 100),
    vApproved: Math.round((t.approved / maxCount) * 100),
    rawTotal: t.count,
    rawApproved: t.approved
  }));

  // Missing months padding
  while (chartData.length < 6) {
    chartData.unshift({ m: "-", vTotal: 0, vApproved: 0, rawTotal: 0, rawApproved: 0 });
  }

  // Calculate top schemes
  const topSchemes = analyticsData?.byScheme || [];

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      
      {/* Header & Date Picker */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Reports & Analytics</h1>
          <p className="text-gray-500 text-sm">Monitor scheme performance and generate official reports.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium">
            <Calendar size={16} className="text-gray-400" />
            <span>Last 6 Months</span>
          </div>
          <button className="bg-forest text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-subtle hover:bg-forest-light transition-colors">
            <Filter size={16} /> Filters
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-forest" /></div>
      ) : (
      <>
        {/* KPI Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 text-green-50">
              <BarChart3 size={120} />
            </div>
            <div className="relative z-10">
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Total Submissions (YTD)</p>
              <h3 className="text-4xl font-bold text-gray-900 mb-2">{analyticsData?.applicationsStatus?.reduce((acc:any, s:any)=>acc+s.count,0) || 0}</h3>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                <TrendingUp size={14} /> LIVE DATA
              </span>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -right-4 -bottom-2 text-blue-50">
              <BrainCircuit size={100} />
            </div>
            <div className="relative z-10">
               <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">AI 30-Day Forecast</p>
               {isPredLoading ? <Loader2 className="animate-spin" size={20} /> : predictions ? (
                 <>
                   <h3 className="text-3xl font-bold text-gray-900 mb-2">{predictions.forecast} <span className="text-sm font-medium text-gray-400">apps expected</span></h3>
                   <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">Model Confidence: {predictions.confidence}</span>
                 </>
               ) : (
                 <div>
                   <h3 className="text-xl font-bold text-gray-400 mb-2">Service Offline</h3>
                   <span className="text-xs text-gray-400">AI prediction engine is currently unreachable.</span>
                 </div>
               )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Resolution Rate</p>
            {(() => {
              const res = analyticsData?.grievancesStatus?.find((s:any)=>s._id==='resolved')?.count || 0;
              const total = analyticsData?.grievancesStatus?.reduce((acc:any,s:any)=>acc+s.count,0) || 1;
              const pct = total > 0 ? Math.round((res/total)*100) : 0;
              return (
                <>
                  <div className="flex items-end gap-2 mb-4">
                    <h3 className="text-3xl font-bold text-gray-900">{pct}%</h3>
                    <span className="text-sm text-gray-500 font-medium pb-1">Grievances Solved</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-forest rounded-full" style={{ width: `${pct}%` }}></div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Chart (Live) */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-bold text-gray-900">Application Intake via Dashboard</h3>
              <select className="text-sm border-none bg-gray-50 px-3 py-1 rounded font-medium text-gray-600 outline-none">
                <option>All Schemes</option>
              </select>
            </div>
            
            <div className="flex-1 flex items-end gap-2 md:gap-6 min-h-[250px] relative pb-6 border-b border-gray-100">
              {/* Grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between pb-6 opacity-30 pointer-events-none">
                <div className="border-t border-gray-200 w-full h-0"></div>
                <div className="border-t border-gray-200 w-full h-0"></div>
                <div className="border-t border-gray-200 w-full h-0"></div>
                <div className="border-t border-gray-200 w-full h-0"></div>
              </div>

              {chartData.map((data: any, i: number) => (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full relative z-10 group">
                  <div className="flex gap-1 items-end w-full px-1 justify-center h-full relative group">
                    <div className="w-full max-w-[40px] bg-forest rounded-t-sm transition-all duration-300 group-hover:opacity-80 relative flex items-end justify-center" style={{ height: `${data.vTotal}%` }}>
                      <span className="absolute -top-6 text-[10px] font-bold text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{data.rawTotal} Apps</span>
                    </div>
                  </div>
                  <span className="absolute -bottom-6 text-[10px] md:text-xs text-gray-500 font-bold uppercase">{data.m}</span>
                </div>
              ))}
            </div>
          </div>

          {/* District Rankings (Top Schemes Live) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-6">Top Performing Schemes</h3>
            <div className="space-y-6">
              {topSchemes.length === 0 ? <p className="text-gray-400 text-sm font-medium">No applications found.</p> : null}
              {topSchemes.map((scheme: any, i: number) => {
                const max = topSchemes[0].count;
                const p = (scheme.count / max) * 100;
                return (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-sm font-bold text-gray-700 truncate mr-3" title={scheme.name}>{scheme.name}</span>
                      <span className="text-xs font-bold text-forest shrink-0">{scheme.count} apps</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-forest rounded-full transition-all duration-1000" style={{ width: `${p}%` }}></div>
                    </div>
                  </div>
                )
              })}
            </div>
            <button className="w-full mt-6 py-2.5 text-sm font-bold text-forest hover:bg-forest/5 rounded-lg transition-colors border border-transparent hover:border-forest/20">
              View All Distributions
            </button>
          </div>

        </div>

        {/* Reports Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Generator Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Generate custom report</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Report Type</label>
                <select className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-forest outline-none bg-white">
                  <option>Scheme Disbursement Summary</option>
                  <option>Grievance Resolution Metrics</option>
                  <option>District-wise Application Status</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center justify-center gap-2 border border-blue-500 bg-blue-50 text-blue-700 py-2.5 rounded-lg cursor-pointer">
                  <input type="radio" name="format" checked className="hidden" readOnly />
                  <span className="font-bold text-sm">PDF Format</span>
                </label>
                <label className="flex items-center justify-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-600 py-2.5 rounded-lg cursor-pointer transition-colors">
                  <input type="radio" name="format" className="hidden" readOnly />
                  <span className="font-bold text-sm">CSV Excel</span>
                </label>
              </div>
              <button className="w-full bg-forest hover:bg-forest-light text-white py-3 rounded-lg font-bold shadow-subtle transition-colors flex justify-center items-center gap-2 mt-4" onClick={() => alert("Report generation enqueued successfully")}>
                <Download size={18} /> Generate & Download
              </button>
            </div>
          </div>

          {/* Recent Reports Table */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-gray-900">Previously Generated</h3>
              <button className="text-sm font-bold text-forest hover:underline">View Archive</button>
            </div>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100">
                    <th className="px-6 py-3 font-semibold">Report Name</th>
                    <th className="px-6 py-3 font-semibold">Generated By</th>
                    <th className="px-6 py-3 font-semibold">Date</th>
                    <th className="px-6 py-3 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  <tr className="hover:bg-gray-50 transition-colors">
                     <td className="px-6 py-4">
                       <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded flex items-center justify-center shrink-0 bg-red-50 text-red-500"><FileText size={16} /></div>
                         <span className="font-medium text-sm text-gray-900">Live_Weekly_Digest.pdf</span>
                       </div>
                     </td>
                     <td className="px-6 py-4 text-sm text-gray-600">System Auto</td>
                     <td className="px-6 py-4 text-sm text-gray-500">Today</td>
                     <td className="px-6 py-4 text-right">
                       <button className="text-forest hover:bg-forest/10 p-2 rounded transition-colors"><Download size={18} /></button>
                     </td>
                   </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </>
      )}
    </div>
  );
}

