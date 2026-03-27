"use client";

import { useState, useEffect } from "react";
import { Edit2, ShieldCheck, Eye, EyeOff, Save, X, FileText, CheckCircle2, Clock, Download, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../lib/api";

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [showAadhaar, setShowAadhaar] = useState(false);
  const [showAccount, setShowAccount] = useState(false);

  // Editable form state
  const [profileParams, setProfileParams] = useState<any>({});

  const { data: farmer, isLoading } = useQuery({
    queryKey: ['farmerProfile'],
    queryFn: async () => {
      const res = await api.get('/farmer/profile');
      return res.data.data;
    }
  });

  useEffect(() => {
    if (farmer && isEditing) {
      setProfileParams({
        dob: farmer.personalDetails?.dateOfBirth ? new Date(farmer.personalDetails.dateOfBirth).toISOString().split('T')[0] : "",
        gender: farmer.personalDetails?.gender || "male",
        mobile: farmer.personalDetails?.mobileNumber || "",
        email: farmer.personalDetails?.email || "",
        surveyNo: farmer.landDetails?.surveyNumber || "",
        totalLand: farmer.landDetails?.totalLandAcres || "",
        landType: farmer.landDetails?.landType || "irrigated",
        primaryCrop: farmer.landDetails?.primaryCrop || "",
        secondaryCrop: farmer.landDetails?.secondaryCrop || "",
        irrigation: farmer.landDetails?.irrigationSource || "none",
        bankName: farmer.bankDetails?.bankName || "",
        branch: farmer.bankDetails?.branchName || "",
        ifsc: farmer.bankDetails?.ifscCode || "",
        holderName: farmer.bankDetails?.accountHolderName || ""
      });
    }
  }, [farmer, isEditing]);

  const updateMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.put('/farmer/profile', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmerProfile'] });
      setIsEditing(false);
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setProfileParams({ ...profileParams, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    const payload = {
      personalDetails: { dateOfBirth: profileParams.dob, gender: profileParams.gender, mobileNumber: profileParams.mobile, email: profileParams.email },
      landDetails: { surveyNumber: profileParams.surveyNo, totalLandAcres: parseFloat(profileParams.totalLand || 0), landType: profileParams.landType, primaryCrop: profileParams.primaryCrop, secondaryCrop: profileParams.secondaryCrop, irrigationSource: profileParams.irrigation },
      bankDetails: { bankName: profileParams.bankName, branchName: profileParams.branch, ifscCode: profileParams.ifsc, accountHolderName: profileParams.holderName }
    };
    updateMutation.mutate(payload);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-24"><Loader2 className="animate-spin text-forest" /></div>;
  }


  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Top Section */}
      <div className="bg-[#F0FDF4] rounded-xl border border-green-100 p-8 flex flex-col md:flex-row items-center md:items-start justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 text-green-100 opacity-50 scale-150 -translate-y-1/4 translate-x-1/4">
           <ShieldCheck size={200} />
        </div>
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10 w-full">
          <div className="w-24 h-24 rounded-full bg-forest text-gold flex items-center justify-center text-4xl font-bold shadow-md border-4 border-white shrink-0">
            {farmer?.personalDetails?.fullName ? farmer.personalDetails.fullName.substring(0, 2).toUpperCase() : 'FA'}
          </div>
          <div className="text-center md:text-left pt-2 pb-2">
            <h1 className="text-3xl font-bold text-forest-dark mb-1">{farmer?.personalDetails?.fullName}</h1>
            <div className="flex flex-col md:flex-row gap-2 md:gap-6 text-green-800 text-sm font-medium">
              <span>Farmer ID: <span className="font-mono bg-white/60 px-2 py-0.5 rounded">{farmer?.farmerId}</span></span>
              <span>Member Since: {new Date(farmer?.createdAt || Date.now()).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</span>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 shrink-0">
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 bg-white text-forest hover:bg-forest/5 px-6 py-2.5 rounded-lg font-bold border border-forest/20 shadow-sm transition-colors"
            >
              <Edit2 size={18} /> Edit Profile
            </button>
          ) : (
            <div className="flex gap-3">
              <button 
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-2 bg-white text-gray-600 hover:bg-gray-50 px-4 py-2.5 rounded-lg font-bold border border-gray-200 transition-colors"
              >
                <X size={18} /> Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="flex items-center gap-2 bg-forest hover:bg-forest-light text-white px-6 py-2.5 rounded-lg font-bold shadow-subtle transition-colors disabled:opacity-70"
              >
                {updateMutation.isPending ? <Loader2 size={18} className="animate-spin"/> : <Save size={18} />} 
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3-Column Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Personal Details */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100 flex items-center justify-between">
            Personal Details
            {!isEditing && <span className="text-xs font-normal text-gray-400">View Only</span>}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Name (As per Aadhaar)</label>
              <div className="font-medium text-gray-900 p-2.5 bg-gray-50 rounded border border-gray-100">{farmer?.personalDetails?.fullName}</div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Aadhaar Number</label>
              <div className="flex items-center justify-between font-mono font-medium text-gray-900 p-2.5 bg-gray-50 rounded border border-gray-100">
                {showAadhaar ? (farmer?.personalDetails?.aadhaarNumber || "Not Provided") : (farmer?.personalDetails?.aadhaarNumber ? `XXXX XXXX ${farmer.personalDetails.aadhaarNumber.slice(-4)}` : "XXXX")}
                <button onClick={() => setShowAadhaar(!showAadhaar)} className="text-gray-400 hover:text-forest">
                  {showAadhaar ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Date of Birth</label>
                {isEditing ? (
                  <input type="date" name="dob" value={profileParams.dob} onChange={handleChange} className="w-full p-2 border border-blue-300 rounded focus:ring-1 focus:ring-forest outline-none text-sm" />
                ) : (
                  <div className="font-medium text-gray-900 p-2">{farmer?.personalDetails?.dateOfBirth ? new Date(farmer.personalDetails.dateOfBirth).toLocaleDateString() : 'N/A'}</div>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Gender</label>
                {isEditing ? (
                  <select name="gender" value={profileParams.gender} onChange={handleChange} className="w-full p-2 border border-blue-300 rounded focus:ring-1 focus:ring-forest outline-none text-sm bg-white capitalize">
                    <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
                  </select>
                ) : (
                  <div className="font-medium text-gray-900 p-2 capitalize">{farmer?.personalDetails?.gender || 'N/A'}</div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Mobile / Email</label>
              {isEditing ? (
                <div className="space-y-2">
                  <input type="tel" name="mobile" value={profileParams.mobile} onChange={handleChange} placeholder="Mobile Number" className="w-full p-2 border border-blue-300 rounded focus:ring-1 focus:ring-forest outline-none text-sm" />
                  <input type="email" name="email" value={profileParams.email} onChange={handleChange} placeholder="Email" className="w-full p-2 border border-blue-300 rounded focus:ring-1 focus:ring-forest outline-none text-sm" />
                </div>
              ) : (
                <div className="font-medium text-gray-900 p-2">{farmer?.personalDetails?.mobileNumber || 'N/A'}<br/><span className="text-gray-500 font-normal">{farmer?.personalDetails?.email || 'No email provided'}</span></div>
              )}
            </div>
          </div>
        </div>

        {/* Card 2: Land & Crop Details */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100 flex items-center justify-between">
            Land & Crop Details
            {isEditing && <span className="text-xs font-bold px-2 py-0.5 bg-blue-100 text-blue-700 rounded uppercase">Editing</span>}
          </h2>
          <div className="space-y-4">
             <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Survey / Khata No.</label>
              {isEditing ? (
                <input type="text" name="surveyNo" value={profileParams.surveyNo} onChange={handleChange} className="w-full p-2 border border-blue-300 rounded focus:ring-1 focus:ring-forest outline-none text-sm" />
              ) : (
                <div className="font-medium text-gray-900 p-2">{farmer?.landDetails?.surveyNumber || 'N/A'}</div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Land (Acres)</label>
                {isEditing ? (
                  <input type="number" step="0.1" name="totalLand" value={profileParams.totalLand} onChange={handleChange} className="w-full p-2 border border-blue-300 rounded focus:ring-1 focus:ring-forest outline-none text-sm" />
                ) : (
                  <div className="font-medium text-gray-900 p-2">{farmer?.landDetails?.totalLandAcres || 'N/A'}</div>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Land Type</label>
                {isEditing ? (
                  <select name="landType" value={profileParams.landType} onChange={handleChange} className="w-full p-2 border border-blue-300 rounded focus:ring-1 focus:ring-forest outline-none text-sm bg-white capitalize">
                    <option value="irrigated">Irrigated</option><option value="unirrigated">Unirrigated</option><option value="forest">Forest</option>
                  </select>
                ) : (
                  <div className="font-medium text-gray-900 p-2 capitalize">{farmer?.landDetails?.landType || 'N/A'}</div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Primary Crop</label>
                {isEditing ? (
                  <input type="text" name="primaryCrop" value={profileParams.primaryCrop} onChange={handleChange} className="w-full p-2 border border-blue-300 rounded focus:ring-1 focus:ring-forest outline-none text-sm" />
                ) : (
                  <div className="font-medium text-gray-900 p-2">{farmer?.landDetails?.primaryCrop || 'N/A'}</div>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Secondary Crop</label>
                {isEditing ? (
                  <input type="text" name="secondaryCrop" value={profileParams.secondaryCrop} onChange={handleChange} className="w-full p-2 border border-blue-300 rounded focus:ring-1 focus:ring-forest outline-none text-sm" />
                ) : (
                  <div className="font-medium text-gray-900 p-2">{farmer?.landDetails?.secondaryCrop || 'N/A'}</div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Irrigation Source</label>
              {isEditing ? (
                  <select name="irrigation" value={profileParams.irrigation} onChange={handleChange} className="w-full p-2 border border-blue-300 rounded focus:ring-1 focus:ring-forest outline-none text-sm bg-white capitalize">
                    <option value="borewell">Borewell</option><option value="canal">Canal</option><option value="rainwater">Rainwater</option><option value="none">None</option>
                  </select>
                ) : (
                  <div className="font-medium text-gray-900 p-2 capitalize">{farmer?.landDetails?.irrigationSource || 'N/A'}</div>
                )}
            </div>
          </div>
        </div>

        {/* Card 3: Bank Details */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100 flex items-center justify-between">
            Bank Details
            {isEditing && <span className="text-xs font-bold px-2 py-0.5 bg-blue-100 text-blue-700 rounded uppercase">Editing</span>}
          </h2>
          <div className="space-y-4">
             <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Bank Name & Branch</label>
              {isEditing ? (
                <div className="space-y-2">
                  <input type="text" name="bankName" value={profileParams.bankName} onChange={handleChange} placeholder="Bank Name" className="w-full p-2 border border-blue-300 rounded focus:ring-1 focus:ring-forest outline-none text-sm" />
                  <input type="text" name="branch" value={profileParams.branch} onChange={handleChange} placeholder="Branch" className="w-full p-2 border border-blue-300 rounded focus:ring-1 focus:ring-forest outline-none text-sm" />
                </div>
              ) : (
                <div className="font-medium text-gray-900 p-2">{farmer?.bankDetails?.bankName || 'N/A'}<br/><span className="text-gray-500 font-normal">{farmer?.bankDetails?.branchName || ''}</span></div>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Account Number</label>
              <div className="flex items-center justify-between font-mono font-medium text-gray-900 p-2.5 bg-gray-50 rounded border border-gray-100">
                {showAccount ? (farmer?.bankDetails?.accountNumber || "Not Provided") : (farmer?.bankDetails?.accountNumber ? `XXXX XXXX ${farmer.bankDetails.accountNumber.slice(-4)}` : "XXXX")}
                <button onClick={() => setShowAccount(!showAccount)} className="text-gray-400 hover:text-forest">
                  {showAccount ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">IFSC Code</label>
              {isEditing ? (
                <input type="text" name="ifsc" value={profileParams.ifsc} onChange={handleChange} className="w-full p-2 border border-blue-300 rounded focus:ring-1 focus:ring-forest outline-none text-sm uppercase font-mono" />
              ) : (
                <div className="font-medium text-gray-900 p-2 font-mono">{farmer?.bankDetails?.ifscCode || 'N/A'}</div>
              )}
            </div>
            <div>
               <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Account Holder Name</label>
               {isEditing ? (
                <input type="text" name="holderName" value={profileParams.holderName} onChange={handleChange} className="w-full p-2 border border-blue-300 rounded focus:ring-1 focus:ring-forest outline-none text-sm" />
              ) : (
                <div className="font-medium text-gray-900 p-2">{farmer?.bankDetails?.accountHolderName || 'N/A'}</div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Linked Documents */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h2 className="font-bold text-gray-900">Linked Documents</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {farmer?.documents && farmer.documents.length > 0 ? farmer.documents.map((doc: any, i: number) => (
            <div key={i} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 hover:bg-gray-50 transition-colors gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-10 h-10 rounded bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                  <FileText size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{doc.documentType || 'Uploaded Document'}</h4>
                  <p className="text-sm text-gray-500 font-mono mt-0.5 max-w-xs truncate">{doc.fileUrl?.split('/').pop() || doc.fileUrl}</p>
                  <p className="text-xs text-gray-400 mt-1">Uploaded: {new Date(doc.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-4 sm:pt-0 border-gray-100">
                {doc.verificationStatus === "verified" ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                    <CheckCircle2 size={14} /> Verified
                  </span>
                ) : doc.verificationStatus === "rejected" ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
                    <X size={14} /> Rejected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                    <Clock size={14} /> Pending
                  </span>
                )}
                
                <div className="flex items-center gap-2">
                  <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="p-2 text-gray-400 hover:text-forest transition-colors rounded hover:bg-gray-100" title="View">
                    <Eye size={18} />
                  </a>
                  <a href={doc.fileUrl} download className="p-2 text-gray-400 hover:text-forest transition-colors rounded hover:bg-gray-100" title="Download">
                    <Download size={18} />
                  </a>
                </div>
              </div>
            </div>
          )) : (
            <div className="p-8 text-center text-gray-500 text-sm">No documents uploaded yet.</div>
          )}
        </div>
      </div>

    </div>
  );
}
