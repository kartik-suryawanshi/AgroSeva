"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, UploadCloud, FileImage, ShieldAlert, CheckSquare, Loader2 } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "../../../lib/api";

const STEPS = ["Personal Info", "Land Details", "Document Upload", "Review & Submit"];

export default function ApplySchemePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const schemeId = searchParams?.get("schemeId");

  const { data: scheme, isLoading: schemeLoading } = useQuery({
    queryKey: ['scheme', schemeId],
    queryFn: async () => {
      if (!schemeId) return null;
      const { data } = await api.get(`/public/schemes/${schemeId}`);
      return data.data;
    },
    enabled: !!schemeId
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    aadhaar: "",
    mobile: "",
    bankAccount: "",
    ifsc: "",
    beneficiaryName: "",
    surveyNo: "",
    landArea: "",
    landType: "",
    cropGrown: "",
    district: "Banaskantha",
    documents: {} as any
  });

  const { data: farmerProfile } = useQuery({
    queryKey: ["farmerProfileForApply"],
    queryFn: async () => {
      const res = await api.get("/farmer/profile");
      return res.data.data;
    },
  });

  useEffect(() => {
    if (!farmerProfile) return;

    const mapLandTypeToUi = (lt?: string) => {
      if (!lt) return "";
      const s = String(lt).toLowerCase();
      if (s === "irrigated") return "Irrigated";
      if (s === "unirrigated") return "Rainfed";
      if (s === "forest") return "Forest";
      return "";
    };

    setFormData((prev) => ({
      ...prev,
      name: farmerProfile.personalDetails?.fullName || prev.name,
      mobile: farmerProfile.personalDetails?.mobileNumber || prev.mobile,
      aadhaar: farmerProfile.personalDetails?.aadhaarNumber || prev.aadhaar,
      bankAccount: farmerProfile.bankDetails?.accountNumber || prev.bankAccount,
      ifsc: farmerProfile.bankDetails?.ifscCode || prev.ifsc,
      beneficiaryName: farmerProfile.bankDetails?.accountHolderName || prev.beneficiaryName,
      surveyNo: farmerProfile.landDetails?.surveyNumber || prev.surveyNo,
      landArea:
        farmerProfile.landDetails?.totalLandAcres !== undefined &&
        farmerProfile.landDetails?.totalLandAcres !== null
          ? String(farmerProfile.landDetails.totalLandAcres)
          : prev.landArea,
      landType: mapLandTypeToUi(farmerProfile.landDetails?.landType) || prev.landType,
      cropGrown: farmerProfile.landDetails?.primaryCrop || prev.cropGrown,
      district: farmerProfile.address?.district || prev.district,
    }));
  }, [farmerProfile]);

  const [uploadingField, setUploadingField] = useState<string | null>(null);

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleUpload = async (docType: string, file: File) => {
    try {
      setUploadingField(docType);
      const body = new FormData();
      body.append("file", file);
      body.append("docType", docType);
      const res = await api.post("/farmer/documents/upload", body, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const uploaded = res.data?.data;
      if (!uploaded?._id) {
        throw new Error("Upload failed");
      }
      setFormData((prev) => ({
        ...prev,
        documents: {
          ...prev.documents,
          [docType]: {
            id: uploaded._id as string,
            name: uploaded.originalFileName as string,
            url: uploaded.cloudinaryUrl as string,
          },
        },
      }));
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to upload document");
    } finally {
      setUploadingField(null);
    }
  };

  const handleSubmit = async () => {
    if (!schemeId) return setError("No scheme selected");
    setSubmitting(true);
    setError("");
    try {
      const uploadedDocIds = Object.values(formData.documents || {})
        .map((d: any) => d?.id)
        .filter(Boolean);

      const payload = {
        schemeId,
        formData: {
          personalDetails: {
            aadhaarNumber: formData.aadhaar,
            bankAccount: formData.bankAccount,
            ifsc: formData.ifsc,
            beneficiaryName: formData.beneficiaryName,
          },
          landDetails: {
            surveyNo: formData.surveyNo,
            landArea: formData.landArea,
            landType: formData.landType,
            cropGrown: formData.cropGrown,
            district: formData.district,
          }
        },
        documents: uploadedDocIds,
      };
      const res = await api.post('/farmer/applications', payload);
      if (res.data.success) {
        router.push(`/dashboard/track?id=${res.data.data.applicationId}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  const { data: eligibility, isLoading: eligibilityLoading } = useQuery({
    queryKey: [
      "schemeEligibility",
      schemeId,
      currentStep,
      formData.aadhaar,
      formData.bankAccount,
      formData.ifsc,
      formData.beneficiaryName,
      formData.surveyNo,
      formData.landArea,
      formData.landType,
      formData.cropGrown,
      formData.district,
    ],
    queryFn: async () => {
      const res = await api.post(`/farmer/schemes/${schemeId}/check-eligibility`, {
        formData: {
          personalDetails: {
            aadhaarNumber: formData.aadhaar,
            bankAccount: formData.bankAccount,
            ifsc: formData.ifsc,
            beneficiaryName: formData.beneficiaryName,
          },
          landDetails: {
            surveyNo: formData.surveyNo,
            landArea: formData.landArea,
            landType: formData.landType,
            cropGrown: formData.cropGrown,
            district: formData.district,
          },
        },
      });
      return res.data.data;
    },
    enabled: !!schemeId && currentStep === 4,
  });

  if (!schemeId) {
    return (
      <div className="text-center p-12 bg-white rounded-xl shadow-sm border border-gray-200">
        <ShieldAlert size={48} className="mx-auto text-amber-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900">No Scheme Selected</h2>
        <p className="text-gray-500 mt-2 mb-6">Please select a scheme from the schemes directory to apply.</p>
        <button onClick={() => router.push('/schemes')} className="bg-forest text-white px-6 py-2 rounded-md font-bold hover:bg-forest-light">View Schemes</button>
      </div>
    );
  }

  if (schemeLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-forest" /></div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Apply for Scheme</h1>
        <p className="text-gray-600">Please provide accurate information for <b>{scheme?.schemeName || "the selected scheme"}</b>.</p>
      </div>

      {/* Step Progress Bar */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 z-0 rounded-full"></div>
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-green-500 z-0 rounded-full transition-all duration-300" 
            style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
          ></div>
          
          {STEPS.map((step, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;
            
            return (
              <div key={stepNumber} className="relative z-10 flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors ${
                  isCompleted ? "bg-green-500 border-green-500 text-white" :
                  isCurrent ? "bg-white border-gold text-gold shadow-[0_0_0_4px_rgba(201,168,76,0.2)]" :
                  "bg-white border-gray-300 text-gray-400"
                }`}>
                  {isCompleted ? <CheckCircle2 size={20} /> : stepNumber}
                </div>
                <span className={`absolute top-12 whitespace-nowrap text-xs font-semibold ${
                  isCompleted ? "text-green-600" :
                  isCurrent ? "text-gray-900" :
                  "text-gray-400"
                }`}>
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 min-h-[400px]">
        
        {/* Step 1: Personal Info */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Step 1 — Personal & Bank Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input type="text" disabled value={formData.name} className="w-full h-[44px] px-4 border border-gray-300 rounded-md bg-gray-50 text-gray-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Aadhaar Number</label>
                <input type="text" value={formData.aadhaar} onChange={e => setFormData({...formData, aadhaar: e.target.value})} className="w-full h-[44px] px-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-forest focus:border-forest outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                <input type="text" disabled value={formData.mobile} className="w-full h-[44px] px-4 border border-gray-300 rounded-md bg-gray-50 text-gray-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Account Number</label>
                <input type="text" value={formData.bankAccount} onChange={e => setFormData({...formData, bankAccount: e.target.value})} className="w-full h-[44px] px-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-forest focus:border-forest outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
                <input type="text" value={formData.ifsc} onChange={e => setFormData({...formData, ifsc: e.target.value})} className="w-full h-[44px] px-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-forest focus:border-forest outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Beneficiary Name (As per Bank)</label>
                <input type="text" value={formData.beneficiaryName} onChange={e => setFormData({...formData, beneficiaryName: e.target.value})} className="w-full h-[44px] px-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-forest focus:border-forest outline-none transition-all" />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Land Details */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Step 2 — Land & Crop Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Survey/Khata Number</label>
                <input type="text" value={formData.surveyNo} onChange={e => setFormData({...formData, surveyNo: e.target.value})} className="w-full h-[44px] px-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-forest focus:border-forest outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Land Area (Acres)</label>
                <input type="number" value={formData.landArea} onChange={e => setFormData({...formData, landArea: e.target.value})} className="w-full h-[44px] px-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-forest focus:border-forest outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Land Type</label>
                <select value={formData.landType} onChange={e => setFormData({...formData, landType: e.target.value})} className="w-full h-[44px] px-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-forest bg-white outline-none">
                  <option value="">Select Type</option>
                  <option value="Irrigated">Irrigated</option>
                  <option value="Rainfed">Rainfed</option>
                  <option value="Forest">Forest</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Crop Grown This Season</label>
                <input type="text" value={formData.cropGrown} onChange={e => setFormData({...formData, cropGrown: e.target.value})} className="w-full h-[44px] px-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-forest outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">District / Tehsil / Village</label>
                <div className="grid grid-cols-3 gap-4">
                  <select value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})} className="h-[44px] px-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-forest outline-none bg-white"><option>Banaskantha</option><option>Ahmedabad</option><option>Surat</option></select>
                  <select className="h-[44px] px-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-forest outline-none bg-white"><option>Palanpur</option><option>Deesa</option></select>
                  <select className="h-[44px] px-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-forest outline-none bg-white"><option>Gola</option><option>Bhildi</option></select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Document Upload */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Step 3 — Document Upload</h2>
            <div className="space-y-4">
              {(scheme?.requiredDocuments || []).length > 0 ? (
                (scheme?.requiredDocuments || []).map((doc: any) => {
                  const docType = doc.docType;
                  const uploaded = formData.documents?.[docType];
                  const isUploading = uploadingField === docType;

                  return (
                    <div
                      key={docType}
                      className="border border-gray-200 rounded-xl p-5 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between"
                    >
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 mb-1">{doc.label || docType}</h4>
                        <p className="text-sm text-gray-500 mb-4">
                          {doc.mandatory ? "Mandatory document" : "Optional document"} - upload a clear file.
                        </p>

                        {!uploaded ? (
                          <label className="border-2 border-dashed border-[#CBD5E1] rounded-lg w-full py-6 flex flex-col items-center justify-center text-gray-500 hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer">
                            <input
                              type="file"
                              className="hidden"
                              accept=".pdf,.png,.jpg,.jpeg"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleUpload(docType, file);
                              }}
                            />
                            <UploadCloud size={28} className="mb-2 text-forest-light" />
                            <span className="font-medium text-forest hover:underline">
                              {isUploading ? "Uploading..." : "Click to browse"}
                            </span>{" "}
                            or drag and drop
                          </label>
                        ) : (
                          <div className="flex gap-4">
                            <div className="w-24 h-16 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                              <FileImage size={24} className="text-gray-400" />
                            </div>
                            <div className="flex-1 bg-green-50 border-l-4 border-green-500 p-3 rounded-r text-sm">
                              <strong className="block text-green-800 mb-1">Uploaded Successfully</strong>
                              <p className="text-gray-700">{uploaded.name}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-6 bg-gray-50 border border-gray-200 rounded-xl text-center text-sm text-gray-600">
                  No document requirements configured for this scheme.
                </div>
              )}

            </div>
          </div>
        )}

        {/* Step 4: Review & Submit */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Step 4 — Review & Submit</h2>
            
            <div
              className={`mb-6 rounded-lg p-5 flex gap-4 items-start border ${
                eligibilityLoading
                  ? "bg-gray-50 border-gray-200"
                  : eligibility?.isEligible
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
              }`}
            >
              <div className="shrink-0 pt-1 text-green-600">
                {eligibilityLoading ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : eligibility?.isEligible ? (
                  <CheckCircle2 size={24} />
                ) : (
                  <ShieldAlert size={24} />
                )}
              </div>
              <div>
                <h4
                  className={`font-bold text-lg ${
                    eligibilityLoading
                      ? "text-gray-800"
                      : eligibility?.isEligible
                        ? "text-green-800"
                        : "text-red-800"
                  }`}
                >
                  {eligibilityLoading
                    ? "Checking eligibility..."
                    : eligibility?.isEligible
                      ? "You are eligible for this scheme"
                      : "You may not be eligible for this scheme"}
                </h4>
                <p
                  className={`mt-1 ${
                    eligibilityLoading
                      ? "text-gray-600"
                      : eligibility?.isEligible
                        ? "text-green-700"
                        : "text-red-700"
                  }`}
                >
                  {eligibilityLoading
                    ? "Evaluating your entered details against the scheme requirements."
                    : `Eligibility score: ${eligibility?.score ?? 0}/100`}
                </p>
                {!eligibilityLoading && eligibility && !eligibility?.isEligible && eligibility?.summary?.mandatoryFailed?.length ? (
                  <p className="text-xs mt-2 text-red-700">
                    Mandatory criteria failed: {eligibility.summary.mandatoryFailed.join(", ")}
                  </p>
                ) : null}
              </div>
            </div>

            {error && <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">{error}</div>}

            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-6 text-sm">
                <div>
                  <span className="block text-gray-500 mb-1">Name</span>
                  <span className="font-medium text-gray-900">{formData.name}</span>
                </div>
                <div>
                  <span className="block text-gray-500 mb-1">Account Number</span>
                  <span className="font-medium text-gray-900">{formData.bankAccount || "-"}</span>
                </div>
                <div>
                  <span className="block text-gray-500 mb-1">IFSC</span>
                  <span className="font-medium text-gray-900">{formData.ifsc || "-"}</span>
                </div>
                <div>
                  <span className="block text-gray-500 mb-1">Survey No.</span>
                  <span className="font-medium text-gray-900">{formData.surveyNo || "-"}</span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 mt-6">
              <input type="checkbox" id="declare" className="mt-1 w-4 h-4 text-forest focus:ring-forest border-gray-300 rounded" />
              <label htmlFor="declare" className="text-sm text-gray-700 leading-relaxed">
                I hereby declare that all information furnished by me is true, complete and correct to the best of my knowledge. I understand that if any information is found false, my application will be rejected.
              </label>
            </div>
          </div>
        )}

      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <button
          onClick={handlePrev}
          disabled={currentStep === 1}
          className="px-6 py-2.5 rounded-lg border border-gray-300 font-bold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        {currentStep < 4 ? (
          <button
            onClick={handleNext}
            className="px-6 py-2.5 rounded-lg bg-forest hover:bg-forest-light text-white font-bold transition-colors shadow-subtle"
          >
            Save & Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-8 py-2.5 rounded-lg bg-gold hover:bg-gold-hover text-forest-dark font-bold transition-colors shadow-subtle flex items-center gap-2 disabled:opacity-70"
          >
            {submitting ? "Submitting..." : "Submit Application"} <CheckSquare size={18} />
          </button>
        )}
      </div>

    </div>
  );
}
