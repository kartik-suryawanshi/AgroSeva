"use client";

import { useState } from "react";
import { ZoomIn, RotateCw, CheckCircle2, AlertTriangle, FileWarning, Search, KeySquare } from "lucide-react";

export default function DocumentVerificationPage() {
  const [selectedApp, setSelectedApp] = useState("APP-8812");
  const [activeTab, setActiveTab] = useState("aadhaar");
  
  const MOCK_LIST = [
    { id: "APP-8812", name: "Ramesh Singh", docs: 3, date: "2 hrs ago", active: selectedApp === "APP-8812" },
    { id: "APP-8815", name: "Kamlesh Patel", docs: 4, date: "4 hrs ago", active: selectedApp === "APP-8815" },
    { id: "APP-8819", name: "Suresh Thakor", docs: 2, date: "5 hrs ago", active: selectedApp === "APP-8819" },
    { id: "APP-8822", name: "Dineshbhai", docs: 3, date: "1 day ago", active: selectedApp === "APP-8822" },
  ];

  const TABS = [
    { id: "aadhaar", label: "Aadhaar Card" },
    { id: "land", label: "Land Record" },
    { id: "bank", label: "Bank Passbook" },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-130px)] space-y-4 max-w-[1600px] mx-auto">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Document Verification Center</h1>
        <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1.5">
          <FileWarning size={16} /> 48 Pending
        </span>
      </div>

      <div className="flex flex-col md:flex-row flex-1 gap-6 min-h-0">
        
        {/* Left Panel: List */}
        <div className="w-full md:w-[35%] lg:w-[30%] bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input type="text" placeholder="Search applicant..." className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-forest outline-none" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {MOCK_LIST.map((item) => (
              <div 
                key={item.id} 
                onClick={() => setSelectedApp(item.id)}
                className={`p-4 cursor-pointer transition-colors ${item.active ? 'bg-forest/5 border-l-4 border-forest/80' : 'hover:bg-gray-50 border-l-4 border-transparent'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-gray-900">{item.name}</h3>
                  <span className="text-xs text-gray-400 font-medium">{item.date}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="font-mono text-gray-500">{item.id}</span>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                  <span className="text-forest font-semibold">{item.docs} Docs</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel: Viewer */}
        <div className="w-full md:w-[65%] lg:w-[70%] bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
          
          {/* Tabs */}
          <div className="flex px-2 pt-2 bg-gray-50 border-b border-gray-200 shrink-0 overflow-x-auto">
            {TABS.map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id ? 'border-forest text-forest' : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
                }`}
              >
                {tab.label} {tab.id === "aadhaar" && <span className="ml-2 inline-flex w-2 h-2 rounded-full bg-amber-500"></span>}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
            
            {/* Top Half: Document Image Viewer */}
            <div className="bg-gray-100 rounded-xl border border-gray-200 p-4 h-64 md:h-80 flex flex-col relative shrink-0">
              <div className="absolute top-6 right-6 flex flex-col gap-2 z-10">
                <button className="w-10 h-10 bg-white rounded shadow text-gray-600 hover:text-forest flex items-center justify-center transition-colors">
                  <ZoomIn size={20} />
                </button>
                <button className="w-10 h-10 bg-white rounded shadow text-gray-600 hover:text-forest flex items-center justify-center transition-colors">
                  <RotateCw size={20} />
                </button>
              </div>
              <div className="flex-1 bg-white rounded border border-gray-300 flex items-center justify-center overflow-hidden">
                {/* Mock Image Placeholder */}
                <div className="text-gray-300 flex flex-col items-center">
                  <KeySquare size={64} className="mb-4 opacity-50" />
                  <span className="font-medium">Document Preview UI</span>
                </div>
              </div>
            </div>

            {/* Bottom Half: 2-col Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* AI Extracted Data */}
              <div className="bg-[#FFFBEB] rounded-xl border border-amber-200 p-5">
                <h3 className="text-amber-800 font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                  <AlertTriangle size={16} /> AI Extracted Data
                </h3>
                <div className="space-y-4">
                  <div>
                    <span className="block text-xs text-amber-900/60 font-medium uppercase mb-1">Full Name</span>
                    <div className="font-mono text-gray-800 font-medium bg-amber-100/50 px-3 py-2 rounded">RAMESH SING</div>
                  </div>
                  <div>
                    <span className="block text-xs text-amber-900/60 font-medium uppercase mb-1">Aadhaar Number</span>
                    <div className="font-mono text-gray-800 font-medium bg-amber-100/50 px-3 py-2 rounded">4920 1192 8921</div>
                  </div>
                  <div>
                    <span className="block text-xs text-amber-900/60 font-medium uppercase mb-1">Date of Birth</span>
                    <div className="font-mono text-gray-800 font-medium bg-amber-100/50 px-3 py-2 rounded">12/05/1982</div>
                  </div>
                </div>
              </div>

              {/* Correct Data (Editable) */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <h3 className="text-gray-900 font-bold mb-4 text-sm uppercase tracking-wider">
                  Correct Profile Data
                </h3>
                <div className="space-y-4">
                  <div>
                    <span className="block text-xs text-gray-500 font-medium uppercase mb-1">Full Name</span>
                    <input type="text" defaultValue="Ramesh Singh" className="w-full text-gray-900 font-medium border border-gray-300 px-3 py-[7px] rounded focus:ring-1 focus:ring-forest outline-none bg-white" />
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500 font-medium uppercase mb-1">Aadhaar Number</span>
                    <input type="text" defaultValue="4920 1192 8921" className="w-full text-gray-900 font-medium border border-gray-300 px-3 py-[7px] rounded focus:ring-1 focus:ring-forest outline-none bg-gray-50" readOnly />
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500 font-medium uppercase mb-1">Date of Birth</span>
                    <input type="text" defaultValue="12/05/1982" className="w-full text-gray-900 font-medium border border-gray-300 px-3 py-[7px] rounded focus:ring-1 focus:ring-forest outline-none bg-gray-50" readOnly />
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Actions (per document) */}
            <div className="flex flex-wrap gap-3 mt-2">
              <button className="flex-1 flex items-center justify-center gap-2 border-2 border-green-500 text-green-700 hover:bg-green-50 px-4 py-3 rounded-lg font-bold transition-colors">
                <CheckCircle2 size={18} /> Verified Match
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 border-2 border-red-500 text-red-700 hover:bg-red-50 px-4 py-3 rounded-lg font-bold transition-colors">
                <AlertTriangle size={18} /> Mismatch Found
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 border-2 border-amber-500 text-amber-700 hover:bg-amber-50 px-4 py-3 rounded-lg font-bold transition-colors">
                <FileWarning size={18} /> Re-upload Required
              </button>
            </div>

          </div>

          {/* Bottom Action Bar (App level) */}
          <div className="bg-gray-50 p-4 border-t border-gray-200 shrink-0 flex items-center justify-between">
            <input type="text" placeholder="Add verification notes..." className="flex-1 max-w-sm px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-forest mr-4" />
            <div className="flex gap-3">
              <button className="px-6 py-2.5 bg-white border border-gray-300 rounded-lg font-bold text-gray-700 hover:bg-gray-100 transition-colors">
                Save Notes
              </button>
              <button className="px-6 py-2.5 bg-forest hover:bg-forest-light text-white rounded-lg font-bold shadow-subtle transition-colors flex items-center gap-2">
                <CheckCircle2 size={18} /> Mark All Verified
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
