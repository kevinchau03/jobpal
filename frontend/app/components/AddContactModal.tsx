"use client";
import { useState } from "react";
import { X } from "lucide-react";
import { useCreateContact, CreateContactData } from "@/hooks/useContacts";

type Props = {
    isOpen: boolean;
    onClose: () => void;
};

export default function AddContactModal({ isOpen, onClose }: Props) {
    const [name, setName] = useState("");
    const [company, setCompany] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [linkedin, setLinkedin] = useState("");
    const [status, setStatus] = useState<CreateContactData["status"]>("REACHED_OUT");
    const [error, setError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    const createContactMutation = useCreateContact();

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePhone = (phone: string): boolean => {
        const cleanPhone = phone.replace(/\D/g, '');
        return cleanPhone.length >= 10 && cleanPhone.length <= 15;
    };

    const validateForm = () => {
        const errors: Record<string, string> = {};

        if (!name.trim()) {
            errors.name = "Name is required";
        } else if (name.trim().length < 2) {
            errors.name = "Name must be at least 2 characters";
        }

        if (!company.trim()) {
            errors.company = "Company is required";
        } else if (company.trim().length < 2) {
            errors.company = "Company must be at least 2 characters";
        }

        if (email && !validateEmail(email)) {
            errors.email = "Please enter a valid email address";
        }

        if (phone && !validatePhone(phone)) {
            errors.phone = "Please enter a valid phone number (10-15 digits)";
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const resetForm = () => {
        setName("");
        setCompany("");
        setEmail("");
        setPhone("");
        setLinkedin("");
        setStatus("REACHED_OUT");
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
            await createContactMutation.mutateAsync({
                name: name.trim(),
                company: company.trim(),
                email: email.trim() || undefined,
                phone: phone.trim() || undefined,
                linkedin: linkedin.trim() || undefined,
                status,
            });

            resetForm();
            onClose();
        } catch (e: any) {
            setError(e.message || "Could not save contact");
        }
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">

            {/* Modal Content */}
            <div className="relative bg-card rounded-lg p-6 w-full max-w-md mx-4 shadow-xl border border-border">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Add New Contact</h3>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors hover:cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="contact-name" className="block text-sm font-medium mb-1">
                            Name *
                        </label>
                        <input
                            id="contact-name"
                            type="text"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                if (validationErrors.name) {
                                    setValidationErrors(prev => ({ ...prev, name: '' }));
                                }
                            }}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${validationErrors.name ? 'border-red-500 bg-red-50' : 'border-border'
                                }`}
                            placeholder="e.g., John Doe"
                            required
                        />
                        {validationErrors.name && (
                            <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="contact-company" className="block text-sm font-medium mb-1">
                            Company *
                        </label>
                        <input
                            id="contact-company"
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
                            required
                        />
                        {validationErrors.company && (
                            <p className="text-red-500 text-xs mt-1">{validationErrors.company}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="contact-email" className="block text-sm font-medium mb-1">
                            Email
                        </label>
                        <input
                            id="contact-email"
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (validationErrors.email) {
                                    setValidationErrors(prev => ({ ...prev, email: '' }));
                                }
                            }}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${validationErrors.email ? 'border-red-500 bg-red-50' : 'border-border'
                                }`}
                            placeholder="e.g., john@company.com"
                        />
                        {validationErrors.email && (
                            <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="contact-phone" className="block text-sm font-medium mb-1">
                            Phone
                        </label>
                        <input
                            id="contact-phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => {
                                setPhone(e.target.value);
                                if (validationErrors.phone) {
                                    setValidationErrors(prev => ({ ...prev, phone: '' }));
                                }
                            }}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${validationErrors.phone ? 'border-red-500 bg-red-50' : 'border-border'
                                }`}
                            placeholder="e.g., +1-555-123-4567"
                        />
                        {validationErrors.phone && (
                            <p className="text-red-500 text-xs mt-1">{validationErrors.phone}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="contact-linkedin" className="block text-sm font-medium mb-1">
                            LinkedIn
                        </label>
                        <input
                            id="contact-linkedin"
                            type="text"
                            value={linkedin}
                            onChange={(e) => setLinkedin(e.target.value)}
                            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., john-doe"
                        />
                    </div>

                    <div>
                        <label htmlFor="contact-status" className="block text-sm font-medium mb-1">
                            Status
                        </label>
                        <select
                            id="contact-status"
                            value={status}
                            onChange={(e) => setStatus(e.target.value as any)}
                            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-card"
                        >
                            <option value="REACHED_OUT">Reached Out</option>
                            <option value="IN_CONTACT">In Contact</option>
                            <option value="NOT_INTERESTED">Not Interested</option>
                            <option value="INTERESTED">Interested</option>
                            <option value="FOLLOW_UP">Follow Up</option>
                        </select>
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
                            disabled={createContactMutation.isPending}
                            className="flex-1 px-4 py-2 bg-secondary text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors hover:cursor-pointer"
                        >
                            {createContactMutation.isPending ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Adding...
                                </span>
                            ) : "Add Contact"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
