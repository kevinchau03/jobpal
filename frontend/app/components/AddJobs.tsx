"use client";
import { useState } from "react";
import { X } from "lucide-react";
import { useCreateJob, CreateJobData } from "@/hooks/useJobs";

type Props = {
    isOpen: boolean;
    onClose: () => void;
};

export default function AddJobModal({ isOpen, onClose }: Props) {
    const [title, setTitle] = useState("");
    const [company, setCompany] = useState("");
    const [status, setStatus] = useState<CreateJobData["status"]>("SAVED");
    const [location, setLocation] = useState("");
    const [jobType, setJobType] = useState<CreateJobData["jobType"] | "">(null);
    const [error, setError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    const createJobMutation = useCreateJob();

    // Validation function
    const validateForm = () => {
        const errors: Record<string, string> = {};

        if (!title.trim()) {
            errors.title = "Job title is required";
        } else if (title.trim().length < 2) {
            errors.title = "Job title must be at least 2 characters";
        }

        if (company && company.trim().length < 2) {
            errors.company = "Company name must be at least 2 characters";
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const resetForm = () => {
        setTitle("");
        setCompany("");
        setStatus("SAVED");
        setLocation("");
        setJobType(null);
        setError(null);
        setValidationErrors({});
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setError(null);

        try {
            await createJobMutation.mutateAsync({
                title: title.trim(),
                company: company.trim() || undefined,
                status,
                location: location.trim() || undefined,
                jobType: jobType || undefined,
            });

            resetForm();
            onClose();
        } catch (e: any) {
            setError(e.message || "Could not save job");
        }
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">

            {/* Modal Content */}
            <div className="relative bg-card rounded-lg p-6 w-full max-w-md mx-4 shadow-xl border border-border">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Add New Job</h3>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors hover:cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="job-title" className="block text-sm font-medium mb-1">
                            Job Title *
                        </label>
                        <input
                            id="job-title"
                            type="text"
                            value={title}
                            onChange={(e) => {
                                setTitle(e.target.value);
                                if (validationErrors.title) {
                                    setValidationErrors(prev => ({ ...prev, title: '' }));
                                }
                            }}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${validationErrors.title ? 'border-red-500 bg-red-50' : 'border-border'
                                }`}
                            placeholder="e.g., Software Engineer"
                            required
                        />
                        {validationErrors.title && (
                            <p className="text-red-500 text-xs mt-1">{validationErrors.title}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="job-company" className="block text-sm font-medium mb-1">
                            Company
                        </label>
                        <input
                            id="job-company"
                            type="text"
                            value={company}
                            onChange={(e) => {
                                setCompany(e.target.value);
                                if (validationErrors.company) {
                                    setValidationErrors(prev => ({ ...prev, company: '' }));
                                }
                            }}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${validationErrors.company ? 'border-red-500 bg-red-50' : 'border-border'
                                }`}
                            placeholder="e.g., Google"
                        />
                        {validationErrors.company && (
                            <p className="text-red-500 text-xs mt-1">{validationErrors.company}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="job-location" className="block text-sm font-medium mb-1">
                            Location
                        </label>
                        <input
                            id="job-location"
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., New York, NY"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="job-status" className="block text-sm font-medium mb-1">
                                Status
                            </label>
                            <select
                                id="job-status"
                                value={status}
                                onChange={(e) => setStatus(e.target.value as any)}
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
                                value={jobType || ""}
                                onChange={(e) => setJobType(e.target.value as CreateJobData["jobType"] || null)}
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

                    {error && (
                        <p className="text-red-500 text-sm">{error}</p>
                    )}

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 px-4 py-2 rounded-md bg-gray-800 transition-colors hover:cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={createJobMutation.isPending}
                            className="flex-1 px-4 py-2 bg-secondary text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors hover:cursor-pointer"
                        >
                            {createJobMutation.isPending ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Adding...
                                </span>
                            ) : "Add Job"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
