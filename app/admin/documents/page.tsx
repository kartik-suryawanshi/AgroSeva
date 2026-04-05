"use client";

import { useState, useMemo, useEffect } from "react";
import { ZoomIn, RotateCw, CheckCircle2, AlertTriangle, FileWarning, Search, Image as ImageIcon, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../lib/api";

interface ApplicationGroup {
  id: string;
  appDisplayId: string;
  farmerName: string;
  date: string;
  docs: any[];
}

export default function DocumentVerificationPage() {
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [notes, setNotes] = useState("");
  const queryClient = useQueryClient();

  // Fetch pending documents directly from backend
  const { data: pendingDocs = [], isLoading } = useQuery({
    queryKey: ['pendingDocuments'],
    queryFn: async () => {
      const res = await api.get('/admin/documents/pending-verification');
      return res.data.data;
    }
  });

  // Group flat documents array by application for the Sidebar logic
  const applicationGroups = useMemo<ApplicationGroup[]>(() => {
    const apps: Record<string, ApplicationGroup> = {};
    pendingDocs.forEach((doc: any) => {
      const appId = doc.applicationId?._id;
      if (!appId) return;
      if (!apps[appId]) {
        apps[appId] = {
          id: appId,
          appDisplayId: doc.applicationId?.applicationId || "Unknown",
          farmerName: doc.farmerId?.personalDetails?.fullName || "Unknown Farmer",
          date: new Date(doc.createdAt).toLocaleDateString(),
          docs: []
        };
      }
      apps[appId].docs.push(doc);
    });
    
    // Sort applications by newest doc
    const list = Object.values(apps).reverse();
    
    // Filter by search
    if (searchTerm) {
      return list.filter((a: ApplicationGroup) => 
        a.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        a.appDisplayId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return list;
  }, [pendingDocs, searchTerm]);

  // Set selected automatically if possible
  useEffect(() => {
    if (applicationGroups.length > 0 && !selectedAppId) {
      setSelectedAppId(applicationGroups[0].id);
    }
  }, [applicationGroups, selectedAppId]);

  const selectedApp: any = applicationGroups.find((a: any) => a.id === selectedAppId);
  const activeDoc = useMemo(() => {
    if (!selectedApp) return null;
    return selectedApp.docs.find((d: any) => d._id === activeDocId) || selectedApp.docs[0];
  }, [selectedApp, activeDocId]);

  // Make sure active tab updates when switching apps
  useEffect(() => {
    if (selectedApp?.docs?.length > 0 && (!activeDocId || !selectedApp.docs.find((d: any) => d._id === activeDocId))) {
      setActiveDocId(selectedApp.docs[0]._id);
    }
  }, [selectedApp, activeDocId]);

  const verifyMutation = useMutation({
    mutationFn: async ({ docId, status }: { docId: string, status: string }) => {
      const res = await api.put(`/admin/documents/${docId}/verify`, { 
        verificationStatus: status, 
        verificationRemarks: notes 
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingDocuments'] });
      setNotes("");
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || "Failed to verify document");
    }
  });

  const handleVerify = (status: string) => {
    if (!activeDoc) return;
    verifyMutation.mutate({ docId: activeDoc._id, status });
  };

  const handleMarkAllVerified = async () => {
    if (!selectedApp || !selectedApp.docs.length) return;
    if (confirm("Are you sure you want to mark ALL pending documents in this application as verified?")) {
      for (const doc of selectedApp.docs) {
        await api.put(`/admin/documents/${doc._id}/verify`, { verificationStatus: 'verified', verificationRemarks: "Auto-verified" });
      }
      queryClient.invalidateQueries({ queryKey: ['pendingDocuments'] });
      setNotes("");
    }
  };

  const formatDocTypeLabel = (str: string) => {
    if (!str) return "Document";
    return str.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-130px)] space-y-4 max-w-[1600px] mx-auto">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Document Verification Center</h1>
        <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1.5">
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <><FileWarning size={16} /> {pendingDocs.length} Pending</>
          )}
        </span>
      </div>

      <div className="flex flex-col md:flex-row flex-1 gap-6 min-h-0">
        
        {/* Left Panel: List */}
        <div className="w-full md:w-[35%] lg:w-[30%] bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search applicant..." 
                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-forest outline-none" 
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {isLoading ? (
               <div className="p-12 text-center text-gray-500 flex justify-center"><Loader2 className="animate-spin" /></div>
            ) : applicationGroups.length === 0 ? (
               <div className="p-12 text-center text-gray-500 text-sm font-medium">No pending documents to verify.</div>
            ) : (
              applicationGroups.map((group: any) => (
                <div 
                  key={group.id} 
                  onClick={() => setSelectedAppId(group.id)}
                  className={`p-4 cursor-pointer transition-colors ${group.id === selectedAppId ? 'bg-forest/5 border-l-4 border-forest/80' : 'hover:bg-gray-50 border-l-4 border-transparent'}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`font-bold ${group.id === selectedAppId ? 'text-forest' : 'text-gray-900'}`}>{group.farmerName}</h3>
                    <span className="text-xs text-gray-400 font-medium">{group.date}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="font-mono text-gray-500">{group.appDisplayId}</span>
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                    <span className="text-amber-600 font-bold">{group.docs.length} pending</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Panel: Viewer */}
        <div className="w-full md:w-[65%] lg:w-[70%] bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
          {!selectedApp ? (
             <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
               <ImageIcon size={64} className="mb-4 opacity-50" />
               <p className="font-medium text-lg">Select an application to view documents</p>
             </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex px-2 pt-2 bg-gray-50 border-b border-gray-200 shrink-0 overflow-x-auto">
                {selectedApp.docs.map((doc: any) => {
                  const isActive = activeDoc?._id === doc._id;
                  return (
                    <button 
                      key={doc._id}
                      onClick={() => setActiveDocId(doc._id)}
                      className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
                        isActive ? 'border-forest text-forest' : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
                      }`}
                    >
                      {formatDocTypeLabel(doc.docType)}
                      <span className="inline-flex w-2 h-2 rounded-full bg-amber-500"></span>
                    </button>
                  );
                })}
              </div>

              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                
                {/* Top Half: Document Image Viewer */}
                <div className="bg-gray-100 rounded-xl border border-gray-200 p-4 h-64 md:h-96 flex flex-col relative shrink-0">
                  <div className="absolute top-6 right-6 flex flex-col gap-2 z-10">
                    <button onClick={() => window.open(activeDoc?.cloudinaryUrl, '_blank')} className="w-10 h-10 bg-white rounded shadow text-gray-600 hover:text-forest flex items-center justify-center transition-colors" title="Open Full Screen">
                      <ZoomIn size={20} />
                    </button>
                  </div>
                  <div className="flex-1 bg-white rounded border border-gray-300 flex items-center justify-center overflow-hidden">
                    {activeDoc?.cloudinaryUrl ? (
                      <img src={activeDoc.cloudinaryUrl} alt="Uploaded Document" className="w-full h-full object-contain" />
                    ) : (
                      <div className="text-gray-300 flex flex-col items-center">
                        <ImageIcon size={64} className="mb-4 opacity-50" />
                        <span className="font-medium">No valid image preview available</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Half: 2-col Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* AI Extracted Data */}
                  <div className="bg-[#FFFBEB] rounded-xl border border-amber-200 p-5 shadow-sm">
                    <h3 className="text-amber-800 font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                      <AlertTriangle size={16} /> AI Extracted Data (OCR)
                    </h3>
                    <div className="space-y-4">
                      {activeDoc?.ocrData?.extractedFields && Object.keys(activeDoc.ocrData.extractedFields).length > 0 ? (
                        Object.entries(activeDoc.ocrData.extractedFields).map(([key, value]) => (
                          <div key={key}>
                            <span className="block text-xs text-amber-900/60 font-medium uppercase mb-1">{key}</span>
                            <div className="font-mono text-gray-800 font-medium bg-amber-100/70 px-3 py-2 rounded max-h-24 overflow-y-auto">{String(value)}</div>
                          </div>
                        ))
                      ) : (
                         <div className="text-sm text-amber-700 font-medium italic p-3 bg-amber-100/50 rounded">No OCR data extracted. Please verify manually.</div>
                      )}
                    </div>
                  </div>

                  {/* Verification Notes / Correct Data */}
                  <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <h3 className="text-gray-900 font-bold mb-4 text-sm uppercase tracking-wider">
                      Verification Context
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <span className="block text-xs text-gray-500 font-medium uppercase mb-1">Applicant Name</span>
                        <div className="w-full text-gray-900 font-medium border border-gray-300 px-3 py-2 rounded bg-gray-50">{selectedApp.farmerName}</div>
                      </div>
                      <div>
                        <span className="block text-xs text-gray-500 font-medium uppercase mb-1">Application ID</span>
                        <div className="w-full text-gray-900 font-medium border border-gray-300 px-3 py-2 rounded bg-gray-50">{selectedApp.appDisplayId}</div>
                      </div>
                      <div>
                        <span className="block text-xs text-gray-500 font-medium uppercase mb-1">Original Upload Name</span>
                        <div className="w-full text-gray-900 font-medium border border-gray-300 px-3 py-2 rounded bg-gray-50 text-sm truncate">{activeDoc?.originalFileName || "N/A"}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Verification Actions (per document) */}
                <div className="flex flex-wrap md:flex-nowrap gap-3 mt-2">
                  <button 
                    onClick={() => handleVerify('verified')}
                    disabled={verifyMutation.isPending}
                    className="flex-1 flex items-center justify-center gap-2 border-2 border-green-500 bg-green-500 text-white hover:bg-green-600 px-4 py-3 rounded-lg font-bold transition-colors disabled:opacity-50"
                  >
                    <CheckCircle2 size={18} /> Verified Match
                  </button>
                  <button 
                    onClick={() => handleVerify('mismatch')}
                    disabled={verifyMutation.isPending}
                    className="flex-1 flex items-center justify-center gap-2 border-2 border-red-500 text-red-700 hover:bg-red-50 px-4 py-3 rounded-lg font-bold transition-colors disabled:opacity-50"
                  >
                    <AlertTriangle size={18} /> Mismatch Found
                  </button>
                  <button 
                    onClick={() => handleVerify('re_upload_required')}
                    disabled={verifyMutation.isPending}
                    className="flex-1 flex items-center justify-center gap-2 border-2 border-amber-500 text-amber-700 hover:bg-amber-50 px-4 py-3 rounded-lg font-bold transition-colors disabled:opacity-50"
                  >
                    <FileWarning size={18} /> Re-upload Required
                  </button>
                </div>

              </div>

              {/* Bottom Action Bar (App level) */}
              <div className="bg-gray-50 p-4 border-t border-gray-200 shrink-0 flex items-center justify-between">
                <input 
                  type="text" 
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Optional verification notes for this specific document..." 
                  className="flex-1 max-w-sm px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-forest mr-4" 
                />
                <div className="flex gap-3">
                  <button onClick={() => setNotes('')} className="px-6 py-2.5 bg-white border border-gray-300 rounded-lg font-bold text-gray-700 hover:bg-gray-100 transition-colors">
                    Clear Note
                  </button>
                  <button 
                    onClick={handleMarkAllVerified}
                    className="px-6 py-2.5 bg-forest hover:bg-forest-light text-white rounded-lg font-bold shadow-subtle transition-colors flex items-center gap-2"
                  >
                    <CheckCircle2 size={18} /> Mark All App Docs Verified
                  </button>
                </div>
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
}
