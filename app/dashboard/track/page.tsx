"use client";

import { useState, useEffect } from "react";
import { Search, CheckCircle2, FileDown, Clock, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "../../../lib/api";
import { useSearchParams } from "next/navigation";

export default function TrackApplicationPage() {
  const searchParams = useSearchParams();
  const initAppId = searchParams?.get("id") || "";
  
  const [searchTerm, setSearchTerm] = useState(initAppId);
  const [activeApp, setActiveApp] = useState<any>(null);

  const { data: applications, isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: async () => {
      const { data } = await api.get('/farmer/applications');
      return data.data; // List of applications for this farmer
    }
  });

  useEffect(() => {
    if (applications && applications.length > 0) {
      if (searchTerm) {
        const found = applications.find((a: any) => a.applicationId === searchTerm);
        setActiveApp(found || applications[0]);
        if (!found) setSearchTerm(applications[0].applicationId);
      } else {
        setActiveApp(applications[0]);
        setSearchTerm(applications[0].applicationId);
      }
    }
  }, [applications]);

  const STAGES = [
    { key: "submitted", title: "Submitted", status: "upcoming", date: "-" },
    { key: "under_review", title: "Under Review", status: "upcoming", date: "-" },
    { key: "approved", title: "Approved", status: "upcoming", date: "-" },
    { key: "disbursed", title: "Disbursed", status: "upcoming", date: "-" },
  ];

  if (activeApp) {
    // Map timeline from backend
    let reachedStageIndex = 0;
    const stageMap: Record<string, number> = {
      'submitted': 0,
      'under_review': 1,
      'approved': 2,
      'eligible': 2, // treating eligible/approved same for timeline
      'disbursed': 3,
      'rejected': -1,
      'ineligible': -1,
    };

    reachedStageIndex = stageMap[activeApp.status] ?? 0;

    STAGES.forEach((stage, idx) => {
      // Find matching timeline event if exists
      const match = activeApp.timeline?.find((t: any) => t.stage.toLowerCase().includes(stage.title.toLowerCase()));
      if (match) {
        stage.date = new Date(match.completedAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
      }

      if (activeApp.status === 'rejected' || activeApp.status === 'ineligible') {
        stage.status = idx === 0 ? "completed" : "upcoming";
      } else {
        if (idx < reachedStageIndex) stage.status = "completed";
        else if (idx === reachedStageIndex) stage.status = "current";
        else stage.status = "upcoming";
      }
    });
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      
      {/* Page Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Track Your Applications</h1>
          <p className="text-gray-600">Enter your application ID or select from the list below.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              const found = applications?.find((a: any) => a.applicationId === e.target.value);
              if (found) setActiveApp(found);
            }}
            placeholder="Enter Application ID" 
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest outline-none" 
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12"><Loader2 className="animate-spin text-forest" /></div>
      ) : activeApp ? (
      <>
      {/* Active Tracking Card */}
      <div className="card p-6 md:p-8 bg-white overflow-hidden relative">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-10 pb-6 border-b border-gray-100">
          <div>
            <span className="text-sm font-bold text-gray-400 tracking-wider">APPLICATION ID</span>
            <h2 className="text-2xl font-bold text-forest-dark uppercase">{activeApp.applicationId}</h2>
            <p className="text-gray-900 font-medium mt-1">{activeApp.schemeId?.schemeName}</p>
          </div>
          <div className="text-left md:text-right">
            <span className="text-sm text-gray-500">Submitted: <b>{new Date(activeApp.createdAt).toLocaleDateString('en-GB')}</b></span><br/>
            <span className="text-sm text-gray-500">Status: <b className="uppercase">{activeApp.status.replace('_', ' ')}</b></span>
          </div>
        </div>

        {/* Horizontal Timeline */}
        <div className="relative py-8">
          {/* Connector Line Base */}
          <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-1 bg-gray-200 -z-10 hidden md:block rounded-full"></div>
          
          <div className="flex flex-col md:flex-row justify-between gap-8 md:gap-0 relative z-10 w-full">
            {STAGES.map((stage, i) => {
              const isFirst = i === 0;
              const isLast = i === STAGES.length - 1;
              const isCompleted = stage.status === "completed";
              const isCurrent = stage.status === "current";

              return (
                <div key={i} className="flex flex-row md:flex-col items-center flex-1 relative">
                  
                  {/* Progress Line Connector (Mobile uses v-line, Desktop uses absolute bg block) */}
                  {!isFirst && (
                    <div className={`absolute hidden md:block h-1 -left-1/2 w-full top-1/2 -translate-y-1/2 -z-10 ${isCompleted || isCurrent ? "bg-green-500" : "bg-transparent"}`}></div>
                  )}

                  {/* Icon Node */}
                  <div className="shrink-0 relative">
                    {isCurrent && (
                      <div className="absolute inset-0 bg-gold rounded-full blur-[8px] animate-pulse opacity-60"></div>
                    )}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center relative z-10 border-4 ${
                      isCompleted ? "bg-green-500 border-white text-white shadow-md" :
                      isCurrent ? "bg-gold border-white text-white shadow-md shadow-gold/30" :
                      "bg-gray-100 border-white text-gray-400"
                    }`}>
                      {isCompleted ? <CheckCircle2 size={24} /> : 
                       isCurrent ? <Clock size={20} /> : 
                       <span className="text-sm font-bold">{i + 1}</span>}
                    </div>
                  </div>

                  {/* Text Details */}
                  <div className="ml-4 md:ml-0 md:mt-4 text-left md:text-center">
                    <h4 className={`font-bold ${
                      isCompleted ? "text-green-700" : 
                      isCurrent ? "text-gray-900" : 
                      "text-gray-500"
                    }`}>{stage.title}</h4>
                    <span className="text-xs text-gray-500 hidden md:block mt-1">{stage.date}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Remarks Section & Action */}
        <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className={`border p-4 rounded-lg flex-1 ${
            activeApp.status === 'rejected' || activeApp.status === 'ineligible' 
            ? 'bg-red-50 border-red-200' 
            : 'bg-blue-50 border-blue-200'
          }`}>
            <h4 className={`text-sm font-bold mb-1 ${
              activeApp.status === 'rejected' ? 'text-red-800' : 'text-blue-800'
            }`}>Review Remarks</h4>
            <p className={`text-sm ${
              activeApp.status === 'rejected' ? 'text-red-700' : 'text-blue-700'
            }`}>
              {activeApp.reviewRemarks || activeApp.rejectionReason || "Your application is currently being processed by the system."}
            </p>
          </div>
          {activeApp.status === 'disbursed' && (
            <button className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-lg font-bold transition-colors whitespace-nowrap">
              <FileDown size={18} /> Download Acknowledgement
            </button>
          )}
        </div>
      </div>
      
      {/* Past Applications Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 text-gray-900 font-bold">
          All Submitted Applications
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                <th className="px-6 py-4 font-semibold">Application ID</th>
                <th className="px-6 py-4 font-semibold">Scheme Name</th>
                <th className="px-6 py-4 font-semibold">Submitted On</th>
                <th className="px-6 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {applications?.map((app: any) => (
                <tr 
                  key={app._id} 
                  className={`hover:bg-gray-50 cursor-pointer ${activeApp?._id === app._id ? 'bg-forest/5' : ''}`}
                  onClick={() => {
                    setActiveApp(app);
                    setSearchTerm(app.applicationId);
                  }}
                >
                  <td className="px-6 py-4 font-mono text-sm text-forest font-semibold">{app.applicationId}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{app.schemeId?.schemeName}</td>
                  <td className="px-6 py-4 text-gray-600">{new Date(app.createdAt).toLocaleDateString('en-GB')}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase
                      ${app.status === 'approved' || app.status === 'disbursed' || app.status === 'eligible' ? 'bg-green-100 text-green-800' :
                        app.status === 'rejected' || app.status === 'ineligible' ? 'bg-red-100 text-red-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                      {app.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
              {(!applications || applications.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    No applications records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      </>
      ) : (
        <div className="p-8 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
          No applications found. You haven't applied for any schemes yet.
        </div>
      )}

    </div>
  );
}
