"use client";

import { useState } from "react";
import { Search, Filter, Phone, Clock, AlertTriangle, Send, X, ShieldAlert, CheckCircle2, ChevronDown, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MOCK_TICKETS = [
  { id: "GR-89021", name: "Ramesh Singh", category: "Subsidy Delay", priority: "High", date: "2 hrs ago", sla: "Overdue", status: "Open" },
  { id: "GR-89018", name: "Vinod Kumar", category: "Land Record Error", priority: "Medium", date: "5 hrs ago", sla: "On Track", status: "In Progress" },
  { id: "GR-88992", name: "Suresh Thakor", category: "Officer Misconduct", priority: "High", date: "1 day ago", sla: "Escalated", status: "Open" },
  { id: "GR-88910", name: "Dineshbhai Patel", category: "Insurance Issue", priority: "Low", date: "2 days ago", sla: "Done", status: "Resolved" },
];

export default function GrievanceManagementPage() {
  const [selectedTicket, setSelectedTicket] = useState<typeof MOCK_TICKETS[0] | null>(null);

  if (typeof window !== "undefined") {
    window.onkeydown = (e) => {
      if (e.key === "Escape") setSelectedTicket(null);
    };
  }

  const getPriorityColor = (p: string) => {
    if (p === "High") return "bg-red-100 text-red-800";
    if (p === "Medium") return "bg-amber-100 text-amber-800";
    return "bg-blue-100 text-blue-800";
  };

  const getSlaColor = (sla: string) => {
    if (sla === "Overdue" || sla === "Escalated") return "text-red-600 font-bold flex items-center gap-1";
    if (sla === "Done") return "text-green-600 font-bold flex items-center gap-1";
    return "text-amber-600 font-bold flex items-center gap-1";
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Grievance Management</h1>
          <p className="text-gray-500 text-sm">Resolve farmer complaints and track SLA compliance.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Open Tickets", value: "42", color: "border-blue-500" },
          { label: "Action Required", value: "18", color: "border-amber-500" },
          { label: "Escalated to Nodal", value: "5", color: "border-red-500" },
          { label: "Resolved Today", value: "24", color: "border-green-500" },
        ].map((kpi, i) => (
          <div key={i} className={`bg-white rounded-xl shadow-sm border border-gray-200 border-t-4 ${kpi.color} p-5`}>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">{kpi.label}</p>
            <h3 className="text-3xl font-bold text-gray-900">{kpi.value}</h3>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap gap-3 w-full">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Search ID, Name..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest outline-none text-sm" />
        </div>
        <select className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-forest outline-none bg-white">
          <option>All Status</option><option>Open</option><option>In Progress</option>
        </select>
        <select className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-forest outline-none bg-white">
          <option>All Priorities</option><option>High</option><option>Medium</option><option>Low</option>
        </select>
        <select className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-forest outline-none bg-white">
          <option>All Categories</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider border-b border-gray-200">
                <th className="px-6 py-4">Ticket ID</th>
                <th className="px-6 py-4">Farmer Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Submitted</th>
                <th className="px-6 py-4">SLA Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {MOCK_TICKETS.map((ticket) => (
                <tr 
                  key={ticket.id} 
                  onClick={() => setSelectedTicket(ticket)}
                  className="hover:bg-[#F0FDF4] cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 font-mono text-sm font-semibold text-gray-900">{ticket.id}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{ticket.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{ticket.category}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{ticket.date}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={getSlaColor(ticket.sla)}>
                      {ticket.sla === "Overdue" ? <AlertTriangle size={14}/> : ticket.sla === "Done" ? <CheckCircle2 size={14}/> : <Clock size={14}/>}
                      {ticket.sla}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-forest hover:text-forest-light font-semibold text-sm">Resolve</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Panel */}
      <AnimatePresence>
        {selectedTicket && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTicket(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 cursor-pointer"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full md:w-[500px] bg-white z-50 shadow-[-10px_0_30px_rgba(0,0,0,0.1)] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-bold text-gray-900">{selectedTicket.id}</h2>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getPriorityColor(selectedTicket.priority)}`}>{selectedTicket.priority}</span>
                  </div>
                  <p className="text-sm text-gray-600 border border-gray-200 bg-white inline-block px-2 py-0.5 rounded font-medium">{selectedTicket.category}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button onClick={() => setSelectedTicket(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-500 transition-colors">
                    <X size={20} />
                  </button>
                  <span className={`text-xs ${getSlaColor(selectedTicket.sla)}`}>{selectedTicket.sla}</span>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="p-6 overflow-y-auto flex-1 bg-gray-50 flex flex-col gap-6">
                
                {/* Caller Info */}
                <div className="bg-white rounded-lg p-4 border border-gray-200 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-forest/10 text-forest rounded-full flex items-center justify-center">
                      <User size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{selectedTicket.name}</h4>
                      <p className="text-xs text-gray-500">Related App: <span className="font-mono text-forest">APP-2026-901</span></p>
                    </div>
                  </div>
                  <button className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-md text-sm font-bold border border-green-200 hover:bg-green-100 transition-colors">
                    <Phone size={14} /> Call Farmer
                  </button>
                </div>

                {/* Message Thread */}
                <div className="flex-1 space-y-4">
                  {/* Initial Complaint */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 relative">
                    <div className="absolute -left-3 top-4 w-6 h-6 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center ring-4 ring-gray-50">
                      <AlertTriangle size={12} />
                    </div>
                    <div className="ml-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-gray-900 text-sm">Original Complaint</span>
                        <span className="text-xs text-gray-400">12 Mar, 10:30 AM</span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed bg-amber-50/50 p-3 rounded border border-amber-100/50">
                        "I submitted my PM-KISAN application 3 months ago but haven't received the subsidy installment. The portal shows my land record is verified, but payment is stuck. Please check."
                      </p>
                    </div>
                  </div>

                  {/* Internal Note */}
                  <div className="bg-blue-50/50 rounded-xl border border-blue-100 p-4 relative ml-8">
                    <div className="absolute -left-3 top-4 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center ring-4 ring-gray-50">
                      <ShieldAlert size={12} />
                    </div>
                    <div className="ml-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-blue-900 text-sm">Internal System Note</span>
                        <span className="text-xs text-blue-400">12 Mar, 11:15 AM</span>
                      </div>
                      <p className="text-sm text-blue-800 leading-relaxed">
                        Payment failure recorded in PFMS. Reason code: Account Dormant. Needs account re-activation or new bank details from farmer.
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Reply Box */}
              <div className="bg-white border-t border-gray-200 p-4 shrink-0 flex flex-col gap-3">
                <div className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-t border border-gray-200 border-b-0">
                  <span className="text-xs font-bold text-gray-500 uppercase">Reply to Farmer</span>
                  <label className="flex items-center gap-2 text-xs font-medium text-gray-600 cursor-pointer">
                    <input type="checkbox" className="w-3.5 h-3.5 text-forest focus:ring-forest rounded border-gray-300" />
                    Save as Internal Note
                  </label>
                </div>
                <textarea 
                  rows={3} 
                  placeholder="Type your response here..." 
                  className="w-full text-sm p-3 border border-gray-300 rounded-b focus:ring-1 focus:ring-forest focus:border-forest outline-none resize-none -mt-3 relative z-10"
                ></textarea>
                
                <div className="flex gap-3 mt-1">
                  <select className="flex-1 border border-gray-300 rounded-lg px-3 text-sm focus:ring-2 focus:ring-forest outline-none bg-white font-medium">
                    <option>Status: In Progress</option>
                    <option>Status: Resolved</option>
                    <option>Status: Escalated</option>
                  </select>
                  <button className="flex-1 bg-forest hover:bg-forest-light text-white py-2.5 rounded-lg font-bold shadow-subtle transition-colors flex items-center justify-center gap-2">
                     Send Reply <Send size={16} />
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
