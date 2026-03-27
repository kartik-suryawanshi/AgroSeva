"use client";

import { BarChart3, Download, Calendar, TrendingUp, Filter, FileText, ChevronRight } from "lucide-react";

export default function ReportsAnalyticsPage() {
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
            <span>01 Jan 2026 - 15 Mar 2026</span>
          </div>
          <button className="bg-forest text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-subtle hover:bg-forest-light transition-colors">
            <Filter size={16} /> Filters
          </button>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 text-green-50">
            <BarChart3 size={120} />
          </div>
          <div className="relative z-10">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Total Disbursed (FY 25-26)</p>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">₹142.5 Cr</h3>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
              <TrendingUp size={14} /> +18.4% vs last year
            </span>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Target Achievement</p>
          <div className="flex items-end gap-2 mb-4">
            <h3 className="text-3xl font-bold text-gray-900">82%</h3>
            <span className="text-sm text-gray-500 font-medium pb-1">of 2.5L farmers</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full w-[82%]"></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Active Schemes</p>
          <h3 className="text-3xl font-bold text-gray-900 mb-2">14</h3>
          <p className="text-sm text-gray-500 font-medium flex items-center gap-1">
             <span className="w-2 h-2 rounded-full bg-green-500 inline-block mr-1"></span> 12 Running
             <span className="w-2 h-2 rounded-full bg-amber-500 inline-block ml-3 mr-1"></span> 2 Accepting Apps
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Chart (Mock) */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-bold text-gray-900">Monthly Subsidy Disbursement Trends</h3>
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

            {[
               { m: "Oct", v1: 40, v2: 60 },
               { m: "Nov", v1: 55, v2: 45 },
               { m: "Dec", v1: 70, v2: 80 },
               { m: "Jan", v1: 65, v2: 50 },
               { m: "Feb", v1: 90, v2: 85 },
               { m: "Mar", v1: 100, v2: 95 },
            ].map((data, i) => (
              <div key={i} className="flex-1 flex flex-col items-center justify-end h-full relative z-10 group">
                <div className="flex gap-1 items-end w-full px-1 md:px-4 justify-center h-full">
                  <div className="w-full max-w-[20px] bg-forest rounded-t-sm transition-all duration-300 group-hover:opacity-80" style={{ height: `${data.v1}%` }}></div>
                  <div className="w-full max-w-[20px] bg-gold rounded-t-sm transition-all duration-300 group-hover:opacity-80" style={{ height: `${data.v2}%` }}></div>
                </div>
                <span className="absolute -bottom-6 text-[10px] md:text-xs text-gray-500 font-bold">{data.m}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-6 mt-6 pt-2">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-600"><span className="w-3 h-3 bg-forest rounded"></span> PM-KISAN</div>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-600"><span className="w-3 h-3 bg-gold rounded"></span> Solar Pump</div>
          </div>
        </div>

        {/* District Rankings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-bold text-gray-900 mb-6">Top Performing Districts</h3>
          <div className="space-y-6">
            {[
              { name: "Banaskantha", p: 94, val: "12,450 apps" },
              { name: "Mehsana", p: 88, val: "9,820 apps" },
              { name: "Patan", p: 76, val: "7,100 apps" },
              { name: "Sabarkantha", p: 64, val: "5,430 apps" },
              { name: "Gandhinagar", p: 58, val: "4,190 apps" },
            ].map((dist, i) => (
              <div key={i}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm font-bold text-gray-700">{dist.name}</span>
                  <span className="text-xs font-medium text-gray-500">{dist.val}</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-forest rounded-full" style={{ width: `${dist.p}%` }}></div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2.5 text-sm font-bold text-forest hover:bg-forest/5 rounded-lg transition-colors border border-transparent hover:border-forest/20">
            View All Districts
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
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Scheme Filter</label>
              <select className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-forest outline-none bg-white">
                <option>All Schemes</option>
                <option>PM-KISAN</option>
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
            <button className="w-full bg-forest hover:bg-forest-light text-white py-3 rounded-lg font-bold shadow-subtle transition-colors flex justify-center items-center gap-2 mt-4">
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
                {[
                  { name: "Q1_Disbursement_Summary.pdf", user: "Manoj Kumar", date: "12 Mar 2026", type: "pdf" },
                  { name: "Grievance_Metrics_Weekly.csv", user: "System Auto", date: "09 Mar 2026", type: "csv" },
                  { name: "Banaskantha_Status_Feb.pdf", user: "Rajesh V.", date: "01 Mar 2026", type: "pdf" },
                ].map((rep, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${rep.type === 'pdf' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                          <FileText size={16} />
                        </div>
                        <span className="font-medium text-sm text-gray-900">{rep.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{rep.user}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{rep.date}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-forest hover:bg-forest/10 p-2 rounded transition-colors" title="Download">
                        <Download size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
