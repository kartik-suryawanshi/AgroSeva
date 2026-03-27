"use client";

import { useState } from "react";
import { Headphones, CheckCircle2, ChevronDown, Clock, AlertCircle, FileText, UploadCloud, ChevronRight, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../lib/api";

export default function GrievancePage() {
  const queryClient = useQueryClient();
  const [desc, setDesc] = useState("");
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [relatedApplicationId, setRelatedAppId] = useState("");
  const [error, setError] = useState("");
  const [submittedData, setSubmittedData] = useState<any>(null);

  const { data: grievances, isLoading } = useQuery({
    queryKey: ['grievances'],
    queryFn: async () => {
      const { data } = await api.get('/farmer/grievances');
      return data.data;
    }
  });

  const submitMutation = useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api.post('/farmer/grievances', payload);
      return data.data;
    },
    onSuccess: (data) => {
      setSubmittedData(data);
      queryClient.invalidateQueries({ queryKey: ['grievances'] });
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || err.message || "Failed to submit grievance. Please try again.");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !subject || !desc) {
      setError("Please fill out all required fields.");
      return;
    }
    setError("");
    submitMutation.mutate({ category, subject, description: desc, relatedApplicationId });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Submit a Complaint or Grievance</h1>
          <p className="text-gray-600 text-sm">We are committed to resolving your issues promptly and fairly.</p>
        </div>
        <div className="flex items-center gap-3 bg-forest/5 text-forest px-4 py-2.5 rounded-lg border border-forest/10 font-bold">
          <Headphones size={20} />
          <span>Helpline: 1800-120-1200</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Submission Form or Success Card */}
        <div className="lg:col-span-2">
          {submittedData ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="h-2 bg-green-500 w-full" />
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={32} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Grievance Submitted</h2>
                <p className="text-gray-600 mb-6">Your complaint has been registered and assigned to the relevant department.</p>
                
                <div className="bg-gray-50 rounded-lg p-5 inline-block text-left border border-gray-200 w-full max-w-sm mx-auto mb-8">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Grievance ID</span>
                  <div className="font-mono text-xl font-bold text-forest-dark mb-4 tracking-wider">{submittedData.grievanceId}</div>
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <span className="text-sm text-gray-500">Expected Resolution:</span>
                    <span className="text-sm font-bold text-gray-900">
                      {new Date(submittedData.slaDeadline).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <button 
                  onClick={() => {
                    setSubmittedData(null);
                    setDesc(""); setSubject(""); setCategory(""); setRelatedAppId("");
                  }}
                  className="bg-forest hover:bg-forest-light text-white px-8 py-3 rounded-lg font-bold transition-colors w-full sm:w-auto"
                >
                  Submit Another Grievance
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 space-y-6">
              {error && <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">{error}</div>}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Category <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select required value={category} onChange={e => setCategory(e.target.value)} className="w-full h-[44px] pl-10 pr-4 appearance-none border border-gray-300 rounded-md focus:ring-2 focus:ring-forest focus:border-forest outline-none bg-white">
                      <option value="">Choose category...</option>
                      <option value="subsidy_delay">Subsidy Delay</option>
                      <option value="wrong_rejection">Wrong Rejection</option>
                      <option value="officer_conduct">Officer Misconduct</option>
                      <option value="insurance_issue">Insurance Issue</option>
                      <option value="land_record">Land Record Error</option>
                      <option value="other">Other</option>
                    </select>
                    <AlertCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Related Application ID (Optional)</label>
                  <div className="relative">
                    <input type="text" value={relatedApplicationId} onChange={e => setRelatedAppId(e.target.value)} placeholder="e.g. APP-2026-..." className="w-full h-[44px] pl-10 pr-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-forest focus:border-forest outline-none" />
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject <span className="text-red-500">*</span></label>
                <input type="text" value={subject} onChange={e => setSubject(e.target.value)} maxLength={100} required placeholder="Brief summary of the issue (Max 100 chars)" className="w-full h-[44px] px-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-forest focus:border-forest outline-none" />
              </div>

              <div>
                <div className="flex justify-between items-ends mb-1">
                  <label className="block text-sm font-medium text-gray-700">Detailed Description <span className="text-red-500">*</span></label>
                </div>
                <div className="relative">
                  <textarea 
                    rows={5} 
                    maxLength={500}
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    required
                    placeholder="Provide all relevant details here..."
                    className="w-full p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-forest focus:border-forest outline-none resize-none pb-8"
                  ></textarea>
                  <div className="absolute bottom-3 right-3 text-xs text-gray-400 font-medium">
                    {desc.length} / 500
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Resolution Date</label>
                  <input type="date" className="w-full h-[44px] px-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-forest outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Attach Documents (Optional)</label>
                  <button type="button" className="w-full h-[44px] px-4 border border-dashed border-gray-300 rounded-md flex items-center justify-center gap-2 text-gray-500 hover:bg-gray-50 transition-colors">
                    <UploadCloud size={18} /> Upload PDF/JPG
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button type="submit" disabled={submitMutation.isPending} className="bg-forest hover:bg-forest-light text-white px-8 py-3 rounded-lg font-bold transition-colors shadow-subtle flex items-center gap-2 disabled:opacity-70">
                  {submitMutation.isPending ? "Submitting..." : "Submit Grievance"} <ChevronRight size={18} />
                </button>
              </div>
            </form>
          )}

          {/* Past Grievances Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-8 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h2 className="font-bold text-gray-900">My Grievances</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                    <th className="px-6 py-4 font-semibold">Grievance ID</th>
                    <th className="px-6 py-4 font-semibold">Category</th>
                    <th className="px-6 py-4 font-semibold">Submitted</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center"><Loader2 className="animate-spin text-forest mx-auto inline-block" /></td>
                    </tr>
                  ) : grievances?.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No grievances found.</td>
                    </tr>
                  ) : (
                    grievances?.map((g: any) => (
                      <tr key={g._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-mono text-sm font-semibold text-gray-900">{g.grievanceId}</td>
                        <td className="px-6 py-4 text-sm text-gray-700 capitalize">{g.category.replace('_', ' ')}</td>
                        <td className="px-6 py-4 text-xs text-gray-500">{new Date(g.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold capitalize ${
                            g.status === 'resolved' ? 'bg-green-100 text-green-800' :
                            g.status === 'closed' ? 'bg-gray-100 text-gray-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {g.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-forest hover:underline text-sm font-medium">View</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Col: Info/Guidelines */}
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
              <Clock size={18} /> Resolution SLA
            </h3>
            <ul className="space-y-3 text-sm text-blue-800">
              <li className="flex justify-between border-b border-blue-200/50 pb-2">
                <span>Subsidy Issues:</span> <span className="font-bold">2 Days</span>
              </li>
              <li className="flex justify-between border-b border-blue-200/50 pb-2">
                <span>Land Records:</span> <span className="font-bold">5 Days</span>
              </li>
              <li className="flex justify-between pb-2">
                <span>Insurance Claim:</span> <span className="font-bold">7 Days</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wider">Guidelines</h3>
            <ul className="space-y-3 text-sm text-gray-600 list-disc pl-4">
              <li>Provide accurate Application IDs for faster linking.</li>
              <li>Upload supporting documents (max 5MB pdf/jpg) if applicable.</li>
              <li>Abusive language will lead to complaint dismissal.</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
