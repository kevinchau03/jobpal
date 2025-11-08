"use client";
import { useState } from "react";
import { api } from "@/lib/api";

type Job = { id: string; title: string; company?: string | null; status: string; createdAt: string };
type Props = { onCreated?: (job: Job) => void };

export default function AddJobForm({ onCreated }: Props) {
    const [title, setTitle] = useState("");
    const [company, setCompany] = useState("");
    const [status, setStatus] = useState<"SAVED" | "APPLIED" | "INTERVIEWING" | "OFFER" | "REJECTED">("SAVED");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setBusy(true);
        setError(null);
        try {
            const job = await api<Job>("/api/jobs", {
                method: "POST",
                body: JSON.stringify({ title, company, status }),
            });
            setTitle("");
            setCompany("");
            setStatus("SAVED");
            onCreated?.(job);
        } catch (e: any) {
            setError(e.message || "Could not save job");
        } finally {
            setBusy(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="bg-card space-y-3 rounded-sm p-4 border border-border">
            <div className="flex gap-2">
                <input
                    className="flex-1 border rounded px-3 py-2"
                    placeholder="Job title *"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
                <input
                    className="flex-1 border rounded px-3 py-2"
                    placeholder="Company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                />
                <select
                    className="border rounded px-3 py-2"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                >
                    <option value="SAVED">Saved</option>
                    <option value="APPLIED">Applied</option>
                    <option value="INTERVIEWING">Interviewing</option>
                    <option value="OFFER">Offer</option>
                    <option value="REJECTED">Rejected</option>
                </select>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
                type="submit"
                disabled={busy}
                className="rounded-sm bg-primary px-4 py-2 font-medium disabled:opacity-60"
            >
                {busy ? <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving
                </span> : "Add Job"}
            </button>
        </form>
    );
}
