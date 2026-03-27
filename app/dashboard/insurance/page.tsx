"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Loader2 } from "lucide-react";
import api from "../../../lib/api";

export default function InsuranceClaimPage() {
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["insuranceSchemes", search],
    queryFn: async () => {
      const res = await api.get("/public/schemes", {
        params: {
          category: "insurance",
          search: search || undefined,
          page: 1,
          limit: 12,
        },
      });
      return res.data;
    },
  });

  const schemes = data?.docs || [];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Insurance Schemes</h1>
          <p className="text-gray-600 text-sm">
            Select an insurance scheme to file your claim through the portal.
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search insurance schemes..."
            className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-forest outline-none"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="animate-spin text-forest" size={48} />
        </div>
      ) : schemes.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {schemes.map((scheme: any) => (
            <div
              key={scheme._id}
              className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col"
            >
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full mb-3">
                  Insurance
                </span>
                <h2 className="text-lg font-bold text-gray-900 leading-tight mb-2 line-clamp-2">
                  {scheme.schemeName}
                </h2>
                <p className="text-gray-600 text-sm line-clamp-2">{scheme.description}</p>
              </div>

              <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between gap-4">
                <div className="text-sm text-gray-600 flex items-center gap-2 whitespace-nowrap">
                  <Calendar size={14} />
                  {scheme.timeline?.applicationEndDate
                    ? new Date(scheme.timeline.applicationEndDate).toLocaleDateString()
                    : "Rolling"}
                </div>
                <Link
                  href={`/dashboard/apply?schemeId=${scheme._id}`}
                  className="bg-forest hover:bg-forest-light text-white px-5 py-2 rounded-lg font-bold transition-colors whitespace-nowrap"
                >
                  Apply
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-sm text-gray-600">
          No insurance schemes found.
        </div>
      )}
    </div>
  );
}

