"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import {
    useUpdateJob,
    Job
} from "@/hooks/useJobs";


export default function EditJob({ isOpen, onClose, job }: { isOpen: boolean; onClose: () => void; job: Job }) {
    const [editForm, setEditForm] = useState({
        title: "",
        company: "",
        status: "SAVED" as Job["status"],
        location: "",
        jobType: null as Job["jobType"]
    });

    const updateJobMutation = useUpdateJob();

    // Update form when job prop changes
    useEffect(() => {
        if (job) {
            setEditForm({
                title: job.title || "",
                company: job.company || "",
                status: job.status || "SAVED",
                location: job.location || "",
                jobType: job.jobType || null
            });
        }
    }, [job]);

    const handleUpdateJob = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!job) return;

        if (!editForm.title.trim()) {
            return;
        }

        try {
            await updateJobMutation.mutateAsync({
                id: job.id,
                data: {
                    title: editForm.title,
                    company: editForm.company || undefined,
                    status: editForm.status,
                    location: editForm.location || undefined,
                    jobType: editForm.jobType || undefined,
                },
            });
            onClose(); // Close the modal after successful update
        } catch (e: any) {
            alert(e.message || "Failed to update job");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-card rounded-lg p-6 w-full max-w-md mx-4 shadow-xl border border-border">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-primary">Edit Job</h3>
                    <button
                        onClick={onClose}
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
                                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-card"
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
                                value={editForm.jobType || ""}
                                onChange={(e) => setEditForm(prev => ({
                                    ...prev,
                                    jobType: e.target.value as Job["jobType"] || null
                                }))}
                                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-card"
                            >
                                <option value="">Select Job Type</option>
                                <option value="FULL_TIME">Full-time</option>
                                <option value="PART_TIME">Part-time</option>
                                <option value="INTERNSHIP">Internship</option>
                                <option value="CONTRACT">Contract</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors hover:cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={updateJobMutation.isPending}
                            className="flex-1 px-4 py-2 bg-secondary text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors hover:cursor-pointer"
                        >
                            {updateJobMutation.isPending ? (
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
    );
}