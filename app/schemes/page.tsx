"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, ChevronRight, X, Calendar, IndianRupee, FileText, CheckCircle2, ChevronLeft, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "../../lib/api";

export default function SchemesPage() {
  const [selectedScheme, setSelectedScheme] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const limit = 9;

  const formatCategoryLabel = (c: string) => {
    const s = c.replace(/_/g, " ");
    return s.replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase());
  };

  const { data: categories = [] } = useQuery({
    queryKey: ["schemeCategories"],
    queryFn: async () => {
      const res = await api.get("/public/schemes/categories");
      return res.data?.data?.categories || [];
    },
  });

  const { data: schemesResponse, isLoading } = useQuery({
    queryKey: ["publicSchemes", searchTerm, selectedCategory, page, limit],
    queryFn: async () => {
      const res = await api.get("/public/schemes", {
        params: {
          search: searchTerm || undefined,
          category: selectedCategory || undefined,
          page,
          limit,
        },
      });
      return res.data;
    }
  });

  const schemes = schemesResponse?.docs || [];
  const totalPages = schemesResponse?.totalPages || 1;

  useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedCategory]);

  // Close drawer on escape key
  if (typeof window !== "undefined") {
    window.onkeydown = (e) => {
      if (e.key === "Escape") setSelectedScheme(null);
    };
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      
      {/* Header & Nav (simplified for subpage) */}
      <nav className="bg-forest-dark border-b border-forest-light sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center">
              <span className="text-forest-dark font-bold text-lg">A</span>
            </div>
            <span className="text-white font-bold text-lg hidden sm:block">AgroSeva Portal</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-white/90 hover:text-white font-medium">Login</Link>
            <Link href="/login?tab=register" className="bg-forest text-sm text-white px-4 py-1.5 rounded-md font-medium hover:bg-forest-light transition-colors">Register</Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-500 mb-6 font-medium">
          <Link href="/" className="hover:text-forest">Home</Link>
          <ChevronRight size={16} className="mx-2" />
          <span className="text-gray-900">Schemes</span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Active Government Schemes & Subsidies</h1>
            <p className="text-gray-600">Browse and apply for agricultural initiatives tailored to your needs.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search schemes..." 
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-forest outline-none w-full sm:w-64" 
              />
            </div>
            <button className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
              <Filter size={18} /> Filters
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-wrap gap-3 mb-8">
          <button
            onClick={() => setSelectedCategory("")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border ${
              selectedCategory === ""
                ? "bg-forest text-white border-forest"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
            }`}
          >
            All Categories
          </button>
          {categories.map((cat: string) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border ${
                selectedCategory === cat
                  ? "bg-forest text-white border-forest"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              }`}
            >
              {formatCategoryLabel(cat)}
            </button>
          ))}
        </div>

        {/* Scheme Grid */}
        {isLoading ? (
          <div className="flex justify-center p-24 items-center gap-3">
            <Loader2 className="animate-spin text-forest" /> Loading active schemes...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schemes.map((scheme: any) => (
              <div key={scheme._id} className="card p-6 flex flex-col bg-white">
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full mb-3">
                    {scheme.category}
                  </span>
                  <h3 className="text-lg font-bold text-gray-900 leading-tight mb-2 line-clamp-2" title={scheme.schemeName}>
                    {scheme.schemeName}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2" title={scheme.description}>
                    {scheme.description}
                  </p>
                </div>
                
                <div className="mt-auto pt-4 border-t border-gray-100 divide-y divide-gray-50">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-500">Benefit:</span>
                    <span className="text-sm font-bold text-forest">{scheme.benefits?.[0] || 'See details'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-500">Apply By:</span>
                    <span className="text-sm font-semibold flex items-center gap-1.5 text-gray-700">
                      <Calendar size={14} /> {scheme.timeline?.applicationEndDate ? new Date(scheme.timeline.applicationEndDate).toLocaleDateString() : 'Rolling'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 mt-5">
                  <button 
                    onClick={() => setSelectedScheme(scheme)}
                    className="flex-1 border border-forest text-forest font-semibold py-2 rounded-md hover:bg-forest/5 transition-colors"
                  >
                    View Details
                  </button>
                  <div className="flex-1 group relative">
                    <Link href={`/login?redirect=/dashboard/apply?schemeId=${scheme._id}`} className="w-full flex items-center justify-center bg-forest text-white hover:bg-forest-light font-semibold py-2 rounded-md transition-colors">
                      Apply Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="flex justify-center mt-12 mb-8 text-sm text-gray-500 font-medium">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="w-10 h-10 flex items-center justify-center rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-gray-700">
              Page <span className="font-bold">{page}</span> of <span className="font-bold">{totalPages}</span>
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="w-10 h-10 flex items-center justify-center rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

      </main>

      {/* Right-Side Drawer Overlay */}
      <AnimatePresence>
        {selectedScheme && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedScheme(null)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 cursor-pointer"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <span className="text-xs font-bold text-gray-400 tracking-wider">SCHEME DETAILS</span>
                <button 
                  onClick={() => setSelectedScheme(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="p-6 overflow-y-auto flex-1">
                <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm font-bold rounded-full mb-4">
                  {selectedScheme.category}
                </span>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{selectedScheme.schemeName}</h2>
                <div className="flex items-center gap-2 text-forest font-bold text-xl mb-6">
                  <IndianRupee size={20} /> {selectedScheme.benefits?.[0]}
                </div>
                
                <p className="text-gray-600 mb-8 leading-relaxed">
                  {selectedScheme.description}
                </p>

                <div className="space-y-8">
                  <section>
                    <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2 mb-4">
                      <CheckCircle2 className="text-forest" size={20} /> Eligibility Criteria
                    </h3>
                    <ul className="space-y-3">
                      {(() => {
                        const criteria = selectedScheme?.eligibilityCriteria;
                        if (!criteria) return null;

                        const items: string[] = [];

                        if (criteria.farmerCategories?.length) {
                          items.push(`Farmer Categories: ${criteria.farmerCategories.join(", ")}`);
                        }
                        if (criteria.minLandAcres !== undefined || criteria.maxLandAcres !== undefined) {
                          const min = criteria.minLandAcres !== undefined ? `${criteria.minLandAcres} acres` : "any";
                          const max = criteria.maxLandAcres !== undefined ? `${criteria.maxLandAcres} acres` : "any";
                          items.push(`Land Area: ${min} to ${max}`);
                        }
                        if (criteria.maxAnnualIncome !== undefined) {
                          items.push(`Maximum Annual Income: <= ${criteria.maxAnnualIncome}`);
                        }
                        if (criteria.allowedCasteCategories?.length) {
                          items.push(`Allowed Castes: ${criteria.allowedCasteCategories.join(", ")}`);
                        }
                        if (criteria.allowedCrops?.length) {
                          items.push(`Allowed Crops: ${criteria.allowedCrops.join(", ")}`);
                        }
                        if (criteria.minAge !== undefined || criteria.maxAge !== undefined) {
                          const min = criteria.minAge !== undefined ? criteria.minAge : "any";
                          const max = criteria.maxAge !== undefined ? criteria.maxAge : "any";
                          items.push(`Age Limits: ${min} to ${max}`);
                        }
                        if (criteria.allowedStates?.length) {
                          items.push(`Allowed States: ${criteria.allowedStates.join(", ")}`);
                        }
                        if (criteria.requiredLandType?.length) {
                          items.push(`Required Land Type: ${criteria.requiredLandType.join(", ")}`);
                        }
                        if (criteria.customRules?.length) {
                          items.push(`Custom Rules: ${criteria.customRules.length} rule(s)`);
                        }

                        if (!items.length) {
                          items.push("No eligibility criteria configured for this scheme.");
                        }

                        return items.map((item, i) => (
                          <li key={i} className="flex gap-3 text-gray-600">
                            <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-gold mt-2"></span> {item}
                          </li>
                        ));
                      })()}
                    </ul>
                  </section>

                  <section>
                    <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2 mb-4">
                      <FileText className="text-forest" size={20} /> Required Documents
                    </h3>
                    <ul className="space-y-3">
                      {selectedScheme?.requiredDocuments?.length ? (
                        selectedScheme.requiredDocuments.map((doc: any, i: number) => (
                          <li
                            key={i}
                            className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-lg text-gray-700 text-sm gap-3"
                          >
                            <span className="flex-1">{doc.label || doc.docType}</span>
                            {doc.mandatory ? (
                              <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-forest/10 text-forest border border-forest/20">
                                Mandatory
                              </span>
                            ) : (
                              <span className="shrink-0 text-xs text-gray-500">Optional</span>
                            )}
                          </li>
                        ))
                      ) : (
                        <li className="p-3 bg-gray-50 border border-gray-100 rounded-lg text-gray-700 text-sm">
                          No document requirements configured.
                        </li>
                      )}
                    </ul>
                  </section>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-600">Application Deadline:</span>
                  <span className={`font-bold text-gray-900`}>
                    {selectedScheme.timeline?.applicationEndDate ? new Date(selectedScheme.timeline.applicationEndDate).toLocaleDateString() : 'Rolling Application'}
                  </span>
                </div>
                <Link 
                  href={`/login?redirect=/dashboard/apply?schemeId=${selectedScheme._id}`}
                  className="w-full flex items-center justify-center bg-forest hover:bg-forest-light text-white py-3.5 rounded-lg font-bold transition-colors mb-2"
                >
                  Apply to this Scheme
                </Link>
                <p className="text-xs text-center text-gray-500">You must be registered to submit an application.</p>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
