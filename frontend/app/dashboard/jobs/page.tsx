"use client";

import { useEffect, useState, useCallback } from "react";
import { Briefcase, Building2, Calendar, Edit2, X, Plus } from "lucide-react";
import { api } from "@/lib/api";
import AddJobModal from "../../components/AddJobs";

type Job = {
  id: string;
  title: string;
  company?: string | null;
  location?: string | null;
  jobType?: "PART_TIME" | "FULL_TIME" | "INTERNSHIP" | "CONTRACT" | string;
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

  // Add modal state
  const [showAddModal, setShowAddModal] = useState(false);

  // Edit modal state
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    company: "",
    status: "SAVED" as Job["status"],
    location: "",
    jobType: "" as Job["jobType"]
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

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

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm("Are you sure you want to delete this job?")) return;

    try {
      await api(`/api/jobs/${jobId}`, {
        method: "DELETE",
      });
      await loadJobs();
    } catch (e: any) {
      alert(e.message || "Failed to delete job");
    }
  };

  const handleEditJob = (job: Job) => {
    setEditingJob(job);
    setEditForm({
      title: job.title,
      company: job.company || "",
      status: job.status,
      location: job.location || "",
      jobType: job.jobType || ""
    });
    setEditError(null);
  };

  const handleUpdateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;

    if (!editForm.title.trim()) {
      setEditError("Title is required");
      return;
    }

    setEditLoading(true);
    setEditError(null);

    try {
      await api(`/api/jobs/${editingJob.id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: editForm.title.trim(),
          company: editForm.company.trim() || null,
          status: editForm.status,
          location: editForm.location.trim() || null,
          jobType: editForm.jobType || null
        }),
      });

      setEditingJob(null);
      await loadJobs();
    } catch (e: any) {
      setEditError(e.message || "Failed to update job");
    } finally {
      setEditLoading(false);
    }
  };

  const closeEditModal = () => {
    setTimeout(() => {
      setEditingJob(null);
      setEditError(null);
    }, 150); // 150ms for exit animation
  };

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

      {/* Add Job Button */}
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center">
          <div className="rounded-xl bg-red-400 px-4 py-2 mr-4 text-black">
            <span>{jobs.filter(job => job.status === "REJECTED").length} Rejected Jobs</span>
          </div>
          <div className="rounded-xl bg-green-400 px-4 py-2">
            <span>{jobs.filter(job => job.status === "OFFER").length} Offered Jobs</span>
          </div>
          <div className="rounded-xl bg-blue-400 px-4 py-2 ml-4">
            <span>{jobs.filter(job => job.status === "INTERVIEWING").length} Interviewing Jobs</span>
          </div>
          <div className="rounded-xl bg-yellow-400 px-4 py-2 ml-4 text-black">
            <span>{jobs.filter(job => job.status === "APPLIED").length} Applied Jobs</span>
          </div>
        </div>
        <div className="flex items-center">
          <input type="text" placeholder="Paste in job link" className="px-4 py-2 border border-border rounded-lg mr-4 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg hover:cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add New Job
          </button>
        </div>
      </div>

      {jobs.length === 0 ? (
        <div className="bg-card border border-border rounded-lg shadow-sm p-3 text-center">
          <Briefcase className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No jobs found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => {
            const key = (job.status || "default").toUpperCase();
            const badge = statusColors[key] || statusColors.default;

            return (
              <div
                key={job.id}
                className="bg-card border border-border rounded-lg shadow-sm p-3 hover:shadow-md transition-all hover:border-border"
              >
                <div className="flex items-center justify-between gap-6">
                  {/* Left content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-foreground flex-1">
                        {job.title}
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                      {job.company && (
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 flex-shrink-0" />
                          <span>{job.company}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span>
                          {new Date(job.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 flex-shrink-0" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 flex-shrink-0" />
                        <span>{job.jobType}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap ${badge}`}
                    >
                      {job.status}
                    </span>
                    <button
                      className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-md transition-colors hover:cursor-pointer"
                      onClick={() => handleEditJob(job)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-md transition-colors hover:cursor-pointer"
                      onClick={() => handleDeleteJob(job.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      {editingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeEditModal}
          />

          {/* Modal Content */}
          <div className="relative bg-card rounded-lg p-6 w-full max-w-md mx-4 shadow-xl border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-primary">Edit Job</h3>
              <button
                onClick={closeEditModal}
                className="text-gray-400 hover:text-gray-600 hover:cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateJob} className="space-y-4">
              <div>
                <label htmlFor="edit-title" className="block text-sm font-medium mb-1">
                  Job Title *
                </label>
                <input
                  id="edit-title"
                  type="text"
                  value={editForm.title}
                  onChange={(e) => {
                    setEditForm(prev => ({ ...prev, title: e.target.value }));
                    setEditError(null);
                  }}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter job title"
                  required
                />
              </div>

              <div>
                <label htmlFor="edit-company" className="block text-sm font-medium mb-1">
                  Company
                </label>
                <input
                  id="edit-company"
                  type="text"
                  value={editForm.company}
                  onChange={(e) => setEditForm(prev => ({ ...prev, company: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter company name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit-status" className="block text-sm font-medium mb-1">
                    Status
                  </label>
                  <select
                    id="edit-status"
                    value={editForm.status}
                    onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value as Job["status"] }))}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="SAVED">Saved</option>
                    <option value="APPLIED">Applied</option>
                    <option value="INTERVIEWING">Interviewing</option>
                    <option value="OFFER">Offer</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="WITHDRAWN">Withdrawn</option>
                    <option value="GHOSTED">Ghosted</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="job-type" className="block text-sm font-medium mb-1">
                    Job Type
                  </label>
                  <select
                    id="job-type"
                    value={editForm.jobType}
                    onChange={(e) => setEditForm(prev => ({ ...prev, jobType: e.target.value as Job["jobType"] }))}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Job Type</option>
                    <option value="FULL_TIME">Full-time</option>
                    <option value="PART_TIME">Part-time</option>
                    <option value="INTERNSHIP">Internship</option>
                    <option value="CONTRACT">Contract</option>
                  </select>
                </div>
              </div>

              {editError && (
                <p className="text-red-500 text-sm">{editError}</p>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors hover:cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex-1 px-4 py-2 bg-secondary text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors hover:cursor-pointer"
                >
                  {editLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </span>
                  ) : "Update Job"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Job Modal */}
      <AddJobModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onCreated={loadJobs}
      />
    </div>
  );
}
