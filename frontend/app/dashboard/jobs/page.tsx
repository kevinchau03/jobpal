"use client";

import { useEffect, useState, useCallback } from "react";
import { Briefcase, Building2, Calendar } from "lucide-react";
import { api } from "@/lib/api";
import AddJobs from "../../components/AddJobs";

type Job = {
  id: string;
  title: string;
  company?: string | null;
  status: "SAVED" | "APPLIED" | "INTERVIEWING" | "OFFER" | "REJECTED" | string;
  createdAt: string;
};

const statusColors: Record<string, string> = {
  SAVED: "bg-gray-100 text-gray-700",
  APPLIED: "bg-blue-100 text-blue-700",
  INTERVIEWING: "bg-yellow-100 text-yellow-700",
  OFFER: "bg-green-100 text-green-700",
  REJECTED: "bg-rose-100 text-rose-700",
  default: "bg-gray-100 text-gray-700",
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const { items } = await api<{ items: Job[]; nextCursor: string | null }>(
        "/api/jobs?limit=20"
      );
      setJobs(items);
    } catch (e: any) {
      setErr(e.message || "Failed to load jobs");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  if (loading && jobs.length === 0) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary">Job Applications</h1>
          <p className="mt-2 text-gray-500">Loading…</p>
        </div>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-gray-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          {err}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary">Job Applications</h1>
        <p className="mt-2 text-gray-600">
          {jobs.length} {jobs.length === 1 ? "application" : "applications"}
        </p>
      </div>

      {/* Add Job (refresh after create) */}
      <div className="mb-6">
        <AddJobs onCreated={loadJobs} />
      </div>

      {jobs.length === 0 ? (
        <div className="bg-card border border-border rounded-lg shadow-sm p-12 text-center">
          <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">No jobs found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => {
            const key = (job.status || "default").toUpperCase();
            const badge = statusColors[key] || statusColors.default;

            return (
              <div
                key={job.id}
                className="bg-card border border-border rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
                    <div className="flex flex-wrap gap-4 text-sm">
                      {job.company && (
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          <span>{job.company}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(job.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${badge}`}
                  >
                    {job.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
