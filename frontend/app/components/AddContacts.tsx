"use client";
import { useState } from "react";
import { api } from "@/lib/api";

type Contact = { id: string; name: string; email?: string | null; phone?: string | null; linkedin?: string | null; company: string; status: string; createdAt: string };
type Props = { onCreated?: (contact: Contact) => void };

export default function AddContactForm({ onCreated }: Props) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [linkedin, setLinkedin] = useState("");
    const [company, setCompany] = useState("");
    const [status, setStatus] = useState<"SAVED" | "REACHED_OUT" | "IN_TALK" | "CONNECTED" | "NOT_INTERESTED">("SAVED");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const contact = await api<Contact>("/api/contacts", {
                method: "POST",
                body: JSON.stringify({ name, email, phone, linkedin, company, status }),
            });
            setName("");
            setEmail("");
            setPhone("");
            setLinkedin("");
            setCompany("");
            setStatus("SAVED");
            onCreated?.(contact);
        } catch (e: any) {
            setError(e.message || "Could not save contact");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="bg-card space-y-3 rounded-sm p-4 border border-border">
            <div className="flex flex-col gap-2">
                <input
                    className="border rounded px-3 py-2"
                    placeholder="Name *"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <input
                    className="border rounded px-3 py-2"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    className="border rounded px-3 py-2"
                    placeholder="Phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                />
                <input
                    className="border rounded px-3 py-2"
                    placeholder="LinkedIn"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                />
                <input
                    className="border rounded px-3 py-2"
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
                    <option value="REACHED_OUT">Reached Out</option>
                    <option value="IN_TALK">In Talk</option>
                    <option value="CONNECTED">Connected</option>
                    <option value="NOT_INTERESTED">Not Interested</option>
                </select>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
                type="submit"
                className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 hover:cursor-pointer"
                disabled={loading}
            >
                {loading ? <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                    : "Add Contact"}
            </button>
        </form>
    );
}