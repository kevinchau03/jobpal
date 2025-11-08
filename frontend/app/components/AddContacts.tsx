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
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    // Validation functions
    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePhone = (phone: string): boolean => {
        // Remove all non-digit characters and check if it's a valid length
        const cleanPhone = phone.replace(/\D/g, '');
        return cleanPhone.length >= 10 && cleanPhone.length <= 15;
    };

    const validateLinkedIn = (linkedin: string): boolean => {
        if (!linkedin) return true; // Optional field
        // Check if it's a valid LinkedIn URL or username
        const linkedinRegex = /^(https?:\/\/)?(www\.)?linkedin\.com\/(in|pub)\/[a-zA-Z0-9-]+\/?$|^[a-zA-Z0-9-]+$/;
        return linkedinRegex.test(linkedin);
    };

    const validateForm = () => {
        const errors: Record<string, string> = {};

        // Name validation
        if (!name.trim()) {
            errors.name = "Name is required";
        } else if (name.trim().length < 2) {
            errors.name = "Name must be at least 2 characters";
        }

        // Email validation
        if (email && !validateEmail(email)) {
            errors.email = "Please enter a valid email address";
        }

        // Phone validation
        if (phone && !validatePhone(phone)) {
            errors.phone = "Please enter a valid phone number (10-15 digits)";
        }

        // LinkedIn validation
        if (linkedin && !validateLinkedIn(linkedin)) {
            errors.linkedin = "Please enter a valid LinkedIn URL or username";
        }

        // Company validation
        if (company && company.trim().length < 2) {
            errors.company = "Company name must be at least 2 characters";
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        
        // Validate form before submitting
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError(null);
        setValidationErrors({});
        
        try {
            const contact = await api<Contact>("/api/contacts", {
                method: "POST",
                body: JSON.stringify({ 
                    name: name.trim(), 
                    email: email.trim() || null, 
                    phone: phone.trim() || null, 
                    linkedin: linkedin.trim() || null, 
                    company: company.trim(), 
                    status 
                }),
            });
            
            // Clear form on success
            setName("");
            setEmail("");
            setPhone("");
            setLinkedin("");
            setCompany("");
            setStatus("SAVED");
            setValidationErrors({});
            
            onCreated?.(contact);
        } catch (e: any) {
            setError(e.message || "Could not save contact");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="bg-card space-y-3 rounded-xl p-4">
            <div className="flex flex-col gap-2">
                <div>
                    <input
                        className={`border border-border rounded px-3 py-2 w-full ${
                            validationErrors.name ? 'border-red-500 bg-red-50' : 'border-border'
                        }`}
                        placeholder="Name *"
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                            if (validationErrors.name) {
                                setValidationErrors(prev => ({ ...prev, name: '' }));
                            }
                        }}
                        required
                    />
                    {validationErrors.name && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>
                    )}
                </div>

                <div>
                    <input
                        className={`border rounded px-3 py-2 w-full ${
                            validationErrors.email ? 'border-red-500 bg-red-50' : 'border-border'
                        }`}
                        placeholder="Email (e.g., john@company.com)"
                        type="email"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            if (validationErrors.email) {
                                setValidationErrors(prev => ({ ...prev, email: '' }));
                            }
                        }}
                    />
                    {validationErrors.email && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
                    )}
                </div>

                <div>
                    <input
                        className={`border rounded px-3 py-2 w-full ${
                            validationErrors.phone ? 'border-red-500 bg-red-50' : 'border-border'
                        }`}
                        placeholder="Phone (e.g., +1-555-123-4567)"
                        type="tel"
                        value={phone}
                        onChange={(e) => {
                            setPhone(e.target.value);
                            if (validationErrors.phone) {
                                setValidationErrors(prev => ({ ...prev, phone: '' }));
                            }
                        }}
                    />
                    {validationErrors.phone && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.phone}</p>
                    )}
                </div>

                <div>
                    <input
                        className={`border rounded px-3 py-2 w-full ${
                            validationErrors.linkedin ? 'border-red-500 bg-red-50' : 'border-border'
                        }`}
                        placeholder="LinkedIn (URL or username)"
                        value={linkedin}
                        onChange={(e) => {
                            setLinkedin(e.target.value);
                            if (validationErrors.linkedin) {
                                setValidationErrors(prev => ({ ...prev, linkedin: '' }));
                            }
                        }}
                    />
                    {validationErrors.linkedin && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.linkedin}</p>
                    )}
                </div>

                <div>
                    <input
                        className={`border rounded px-3 py-2 w-full ${
                            validationErrors.company ? 'border-red-500 bg-red-50' : 'border-border'
                        }`}
                        placeholder="Company"
                        value={company}
                        onChange={(e) => {
                            setCompany(e.target.value);
                            if (validationErrors.company) {
                                setValidationErrors(prev => ({ ...prev, company: '' }));
                            }
                        }}
                    />
                    {validationErrors.company && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.company}</p>
                    )}
                </div>

                <select
                    className="border rounded px-3 py-2 w-full border-border"
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
                className="w-full px-4 py-2 bg-primary text-black rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 hover:cursor-pointer"
                disabled={loading}
            >
                {loading ? (
                    <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Adding Contact...
                    </span>
                ) : "Add Contact"}
            </button>
        </form>
    );
}