"use client";

import { useState } from "react";
import { Plus, Wallet, Search, Filter, MoreVertical, Edit2, PauseCircle, CheckCircle, Clock, X, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MOCK_SCHEMES = [
  { id: "SCH-01", title: "PM-KISAN Subsidy Installment", type: "Direct Benefit", budget: 500, disbursed: 412, status: "Active", end: "31-Dec-2026" },
  { id: "SCH-02", title: "Solar Pump Subsidy (KUSUM)", type: "Asset Subsidy", budget: 120, disbursed: 45, status: "Active", end: "30-Sep-2026" },
  { id: "SCH-03", title: "Micro-Irrigation Fund", type: "Infrastructure", budget: 80, disbursed: 80, status: "Closed", end: "15-Jan-2026" },
  { id: "SCH-04", title: "Monsoon Crop Insurance", type: "Insurance Claim", budget: 200, disbursed: 0, status: "Draft", end: "31-Dec-2026" },
];

export default function SchemeManagementPage() {
  const [isCreating, setIsCreating] = useState(false);

  if (typeof window !== "undefined") {
    window.onkeydown = (e) => {
      if (e.key === "Escape") setIsCreating(false);
    };
  }

  const getStatusBadge = (status: string) => {
    if (status === "Active") return "bg-green-100 text-green-800 border-green-200";
    if (status === "Draft") return "bg-amber-100 text-amber-800 border-amber-200";
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getStatusIcon = (status: string) => {
    if (status === "Active") return <CheckCircle size={14} className="mr-1" />;
    if (status === "Draft") return <Clock size={14} className="mr-1" />;
    return <PauseCircle size={14} className="mr-1" />;
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Scheme & Subsidy Management</h1>
          <p className="text-gray-500 text-sm">Configure schemes, allocate budgets, and set eligibility rules.</p>
        </div>
        <button onClick={() => setIsCreating(true)} className="flex items-center gap-2 bg-forest hover:bg-forest-light text-white px-5 py-2.5 rounded-lg font-bold transition-colors shadow-subtle shrink-0">
          <Plus size={18} /> Create New Scheme
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Active Schemes", value: "14", color: "border-blue-500" },
          { label: "Total Allocated FY26", value: "₹950 Cr", color: "border-forest" },
          { label: "Total Disbursed", value: "₹537 Cr", color: "border-amber-500" },
          { label: "Remaining Budget", value: "₹413 Cr", color: "border-purple-500" },
        ].map((kpi, i) => (
          <div key={i} className={`bg-white rounded-xl shadow-sm border border-gray-200 border-t-4 ${kpi.color} p-5 flex flex-col`}>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">{kpi.label}</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-auto">{kpi.value}</h3>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Search schemes..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest outline-none text-sm" />
        </div>
        <select className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-forest outline-none bg-white font-medium">
          <option>All Status</option><option>Active</option><option>Draft</option><option>Closed</option>
        </select>
        <button className="flex items-center gap-2 bg-gray-50 border border-gray-300 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors text-sm font-medium">
          <Filter size={16} /> Filters
        </button>
      </div>

      {/* Scheme Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {MOCK_SCHEMES.map((scheme) => {
          const progress = (scheme.disbursed / scheme.budget) * 100;
          return (
            <div key={scheme.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow p-6 flex flex-col group relative overflow-hidden">
              <div className="flex justify-between items-start mb-4 relative z-10">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusBadge(scheme.status)}`}>
                  {getStatusIcon(scheme.status)} {scheme.status}
                </span>
                <button className="text-gray-400 hover:text-forest transition-colors">
                  <MoreVertical size={18} />
                </button>
              </div>
              
              <div className="mb-6 relative z-10">
                <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1 group-hover:text-forest transition-colors">{scheme.title}</h3>
                <p className="text-sm text-gray-500">{scheme.type} • Ends: {scheme.end}</p>
              </div>

              <div className="mt-auto relative z-10">
                <div className="flex justify-between items-center text-sm font-bold text-gray-900 mb-2">
                  <span>₹{scheme.disbursed} Cr Disbursed</span>
                  <span className="text-gray-500">₹{scheme.budget} Cr</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${
                      progress >= 100 ? 'bg-red-500' : 
                      progress >= 80 ? 'bg-amber-500' : 'bg-forest'
                    }`} 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

               {/* Quick Actions Hover Reveal (Desktop only essentially, but good for UI) */}
               <div className="absolute inset-x-0 bottom-0 top-0 bg-white/95 backdrop-blur-sm opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-opacity z-20 pointer-events-none group-hover:pointer-events-auto">
                 <button className="w-10 h-10 bg-forest text-white rounded-full flex items-center justify-center hover:bg-forest-light transition-colors shadow-md" title="Edit Scheme">
                   <Edit2 size={18} />
                 </button>
                 {scheme.status === "Active" ? (
                    <button className="w-10 h-10 bg-amber-500 text-white rounded-full flex items-center justify-center hover:bg-amber-400 transition-colors shadow-md" title="Pause Scheme">
                      <PauseCircle size={18} />
                    </button>
                 ) : (
                    <button className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-400 transition-colors shadow-md" title="Publish/Activate">
                      <CheckCircle size={18} />
                    </button>
                 )}
               </div>
            </div>
          )
        })}
      </div>

      {/* Slide-over Panel: Create Scheme */}
      <AnimatePresence>
        {isCreating && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreating(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 cursor-pointer"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full md:w-[600px] bg-gray-50 z-50 shadow-[-10px_0_30px_rgba(0,0,0,0.1)] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white flex-shrink-0">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Create New Scheme</h2>
                  <p className="text-sm text-gray-500">Configure parameters and eligibility rules.</p>
                </div>
                <button onClick={() => setIsCreating(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Scrollable Form Content */}
              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                
                {/* Basic Details */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-4">
                  <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">Basic Information</h3>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Scheme Title <span className="text-red-500">*</span></label>
                    <input type="text" placeholder="e.g. PM-KISAN Extra Bonus 2026" className="w-full h-[40px] px-3 border border-gray-300 rounded focus:ring-1 focus:ring-forest outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Description <span className="text-red-500">*</span></label>
                    <textarea rows={3} placeholder="Brief objective of the scheme..." className="w-full p-3 border border-gray-300 rounded focus:ring-1 focus:ring-forest outline-none text-sm resize-none"></textarea>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Scheme Category</label>
                      <select className="w-full h-[40px] px-3 border border-gray-300 rounded focus:ring-1 focus:ring-forest outline-none text-sm bg-white">
                        <option>Subsidy (Direct Benefit)</option>
                        <option>Asset / Equipment</option>
                        <option>Crop Insurance</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Budget (Cr) <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                        <input type="number" placeholder="0.00" className="w-full h-[40px] pl-7 pr-3 border border-gray-300 rounded focus:ring-1 focus:ring-forest outline-none text-sm" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rules & Eligibility */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-4">
                  <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">Eligibility Criteria</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Max Land Area</label>
                      <select className="w-full h-[40px] px-3 border border-gray-300 rounded focus:ring-1 focus:ring-forest outline-none text-sm bg-white">
                        <option>Any (No limit)</option>
                        <option>&lt; 2 Hectares (Small/Marginal)</option>
                        <option>&gt; 2 Hectares</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Eligible Districts</label>
                      <select className="w-full h-[40px] px-3 border border-gray-300 rounded focus:ring-1 focus:ring-forest outline-none text-sm bg-white">
                        <option>All Districts (Statewide)</option>
                        <option>Custom Selection...</option>
                      </select>
                    </div>
                  </div>
                  <div>
                     <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                       <input type="checkbox" defaultChecked className="w-4 h-4 text-forest focus:ring-forest rounded border-gray-300" />
                       Require active Aadhaar linking (Mandatory)
                     </label>
                  </div>
                </div>

                {/* Workflow Configuration */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-4">
                  <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 flex justify-between items-center">
                    Verification Workflow
                    <Settings size={16} className="text-gray-400" />
                  </h3>
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
                    <label className="flex items-center justify-between text-sm text-gray-800 font-medium">
                      <span>Enable AI Auto-Approval</span>
                      <div className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-forest/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-forest"></div>
                      </div>
                    </label>
                    <p className="text-xs text-gray-500">Applications meeting 90%+ AI score and complete KYC will bypass manual review.</p>
                  </div>
                </div>

              </div>

              {/* Action Buttons Footer */}
              <div className="p-6 border-t border-gray-200 bg-white shrink-0 flex gap-3">
                <button onClick={() => setIsCreating(false)} className="flex-1 bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button className="flex-1 bg-forest hover:bg-forest-light text-white py-3 rounded-lg font-bold shadow-subtle transition-colors">
                  Save as Draft
                </button>
                <button className="flex-1 bg-gold hover:bg-gold-hover text-forest-dark py-3 rounded-lg font-bold shadow-subtle transition-colors focus:ring-2 focus:ring-forest focus:ring-offset-2">
                  Publish Scheme
                </button>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
