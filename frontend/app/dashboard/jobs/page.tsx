"use client";

import { useState } from "react";
import { Briefcase, Plus } from "lucide-react";
import AddJobModal from "../../components/AddJobs";
import EditJob from "../../components/EditJob";
import JobComponent from "../../components/Job";
import {
  useJobs,
  useDeleteJob,
  Job
} from "@/hooks/useJobs";

export default function JobsPage() {
  // React Query hooks
  const { data: jobsData, isLoading: loading, error } = useJobs();
  const deleteJobMutation = useDeleteJob();

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);


  const jobs = jobsData?.items || [];
  const err = error?.message || null;

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm("Are you sure you want to delete this job?")) return;

    try {
      await deleteJobMutation.mutateAsync(jobId);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to delete job");
    }
  };

  const handleEditJob = async (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      setEditingJob(job);
    }
  }

  if (loading && jobs.length === 0) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary">Job Applications</h1>
          <p className="mt-2 text-gray-500">Loading…</p>
        </div>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 rounded-sm bg-gray-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-sm">
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
          <div className="rounded-sm bg-card px-4 py-2 mr-4 text-red-400 border border-red-400">
            <span>{jobs.filter(job => job.status === "REJECTED").length} Rejected Jobs</span>
          </div>
          <div className="rounded-sm bg-card px-4 py-2 text-green-400 border border-green-400">
            <span>{jobs.filter(job => job.status === "OFFER").length} Offered Jobs</span>
          </div>
          <div className="rounded-sm bg-card px-4 py-2 ml-4 text-blue-400 border border-blue-400">
            <span>{jobs.filter(job => job.status === "INTERVIEWING").length} Interviewing Jobs</span>
          </div>
          <div className="rounded-sm bg-card px-4 py-2 ml-4 text-yellow-400 border border-yellow-400">
            <span>{jobs.filter(job => job.status === "APPLIED").length} Applied Jobs</span>
          </div>
        </div>
        <div className="flex items-center">
          <input type="text" placeholder="Paste in job link" className="px-4 py-2 border border-border rounded-sm mr-4 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] rounded-sm hover:opacity-90 transition-opacity hover:cursor-pointer text-black"
          >
            <Plus className="w-4 h-4" />
            Add New Job
          </button>
        </div>
      </div>

      {jobs.length === 0 ? (
        <div className="bg-card border border-border rounded-sm shadow-sm p-3 text-center">
          <Briefcase className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No jobs found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <JobComponent
              key={job.id}
              job={job}
              onEdit={handleEditJob}
              onDelete={handleDeleteJob}
            />
          ))}
        </div>
      )}

      {/* Add Job Modal */}
      <AddJobModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />

      {editingJob && (
        <EditJob
          key={editingJob.id}
          isOpen={!!editingJob}
          onClose={() => setEditingJob(null)}
          job={editingJob}
        />
      )}
    </div>
  );
}
