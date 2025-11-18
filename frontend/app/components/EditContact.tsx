"use client";

import { useState } from "react";
import { X } from "lucide-react";
import {
    useUpdateContact,
    Contact
} from "@/hooks/useContacts";


export default function EditContact({ isOpen, onClose, contact }: { readonly isOpen: boolean; readonly onClose: () => void; readonly contact: Contact }) {
    const [editForm, setEditForm] = useState({
        name: contact.name || "",
        company: contact.company || "",
        email: contact.email || "",
        phone: contact.phone || "",
        linkedin: contact.linkedin || "",
        status: contact.status || "REACHED_OUT" as Contact["status"]
    });

    const updateContactMutation = useUpdateContact();

    const handleUpdateContact = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!contact) return;

        if (!editForm.name.trim()) {
            return;
        }

        if (!editForm.company.trim()) {
            return;
        }

        try {
            await updateContactMutation.mutateAsync({
                id: contact.id,
                data: {
                    name: editForm.name,
                    company: editForm.company,
                    email: editForm.email || undefined,
                    phone: editForm.phone || undefined,
                    linkedin: editForm.linkedin || undefined,
                    status: editForm.status,
                },
            });
            onClose(); // Close the modal after successful update
        } catch (e: unknown) {
            alert(e instanceof Error ? e.message : "Failed to update contact");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <button
                type="button"
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
                aria-label="Close modal"
            />

            {/* Modal Content */}
            <div className="relative bg-card rounded-lg p-6 w-full max-w-md mx-4 shadow-xl border border-border">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-primary">Edit Contact</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 hover:cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleUpdateContact} className="space-y-4">
                    <div>
                        <label htmlFor="edit-name" className="block text-sm font-medium mb-1">
                            Name *
                        </label>
                        <input
                            id="edit-name"
                            type="text"
                            value={editForm.name}
                            onChange={(e) => {
                                setEditForm(prev => ({ ...prev, name: e.target.value }));
                            }}
                            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter contact name"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="edit-company" className="block text-sm font-medium mb-1">
                            Company *
                        </label>
                        <input
                            id="edit-company"
                            type="text"
                            value={editForm.company}
                            onChange={(e) => {
                                setEditForm(prev => ({ ...prev, company: e.target.value }));
                            }}
                            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter company name"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="edit-email" className="block text-sm font-medium mb-1">
                            Email
                        </label>
                        <input
                            id="edit-email"
                            type="email"
                            value={editForm.email}
                            onChange={(e) => {
                                setEditForm(prev => ({ ...prev, email: e.target.value }));
                            }}
                            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter email address"
                        />
                    </div>

                    <div>
                        <label htmlFor="edit-phone" className="block text-sm font-medium mb-1">
                            Phone
                        </label>
                        <input
                            id="edit-phone"
                            type="tel"
                            value={editForm.phone}
                            onChange={(e) => {
                                setEditForm(prev => ({ ...prev, phone: e.target.value }));
                            }}
                            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter phone number"
                        />
                    </div>

                    <div>
                        <label htmlFor="edit-linkedin" className="block text-sm font-medium mb-1">
                            LinkedIn
                        </label>
                        <input
                            id="edit-linkedin"
                            type="text"
                            value={editForm.linkedin}
                            onChange={(e) => {
                                setEditForm(prev => ({ ...prev, linkedin: e.target.value }));
                            }}
                            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter LinkedIn profile"
                        />
                    </div>

                    <div>
                        <label htmlFor="edit-status" className="block text-sm font-medium mb-1">
                            Status
                        </label>
                        <select
                            id="edit-status"
                            value={editForm.status}
                            onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value as Contact["status"] }))}
                            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-card"
                        >
                            <option value="REACHED_OUT">Reached Out</option>
                            <option value="IN_CONTACT">In Contact</option>
                            <option value="NOT_INTERESTED">Not Interested</option>
                            <option value="INTERESTED">Interested</option>
                            <option value="FOLLOW_UP">Follow Up</option>
                        </select>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 rounded-md bg-gray-800 text-gray-100 transition-colors hover:cursor-pointer hover:bg-gray-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={updateContactMutation.isPending}
                            className="flex-1 px-4 py-2 bg-secondary text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors hover:cursor-pointer"
                        >
                            {updateContactMutation.isPending ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Updating...
                                </span>
                            ) : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
