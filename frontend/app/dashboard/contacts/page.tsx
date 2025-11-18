"use client";

import { useState } from "react";
import { Users, Plus } from "lucide-react";
import AddContactModal from "../../components/AddContactModal";
import EditContact from "../../components/EditContact";
import ContactComponent from "../../components/Contact";
import {
  useContacts,
  useDeleteContact,
  Contact
} from "@/hooks/useContacts";

export default function ContactsPage() {
  // React Query hooks
  const { data: contactsData, isLoading: loading, error } = useContacts();
  const deleteContactMutation = useDeleteContact();

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);


  const contacts = contactsData?.items || [];
  const err = error?.message || null;

  const handleDeleteContact = async (contactId: string) => {
    if (!confirm("Are you sure you want to delete this contact?")) return;

    try {
      await deleteContactMutation.mutateAsync(contactId);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to delete contact");
    }
  };

  const handleEditContact = async (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    if (contact) {
      setEditingContact(contact);
    }
  }

  if (loading && contacts.length === 0) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary">Contacts</h1>
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
        <h1 className="text-3xl font-bold text-secondary">Contacts</h1>
        <p className="mt-2 text-gray-600">
          {contacts.length} {contacts.length === 1 ? "contact" : "contacts"}
        </p>
      </div>

      {/* Add Contact Button */}
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center">
          <div className="rounded-sm bg-card px-4 py-2 mr-4 text-red-400 border border-red-400">
            <span>{contacts.filter(contact => contact.status === "NOT_INTERESTED").length} Not Interested</span>
          </div>
          <div className="rounded-sm bg-card px-4 py-2 text-green-400 border border-green-400">
            <span>{contacts.filter(contact => contact.status === "INTERESTED").length} Interested</span>
          </div>
          <div className="rounded-sm bg-card px-4 py-2 ml-4 text-blue-400 border border-blue-400">
            <span>{contacts.filter(contact => contact.status === "IN_CONTACT").length} In Contact</span>
          </div>
          <div className="rounded-sm bg-card px-4 py-2 ml-4 text-yellow-400 border border-yellow-400">
            <span>{contacts.filter(contact => contact.status === "REACHED_OUT").length} Reached Out</span>
          </div>
          <div className="rounded-sm bg-card px-4 py-2 ml-4 text-purple-400 border border-purple-400">
            <span>{contacts.filter(contact => contact.status === "FOLLOW_UP").length} Follow Up</span>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] rounded-sm hover:opacity-90 transition-opacity hover:cursor-pointer text-black"
        >
          <Plus className="w-4 h-4" />
          Add New Contact
        </button>
      </div>

      {contacts.length === 0 ? (
        <div className="bg-card border border-border rounded-sm shadow-sm p-3 text-center">
          <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No contacts found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {contacts.map((contact) => (
            <ContactComponent
              key={contact.id}
              contact={contact}
              onEdit={handleEditContact}
              onDelete={handleDeleteContact}
            />
          ))}
        </div>
      )}


      {/* Add Contact Modal */}
      <AddContactModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />

      {editingContact && (
        <EditContact
          key={editingContact.id}
          isOpen={!!editingContact}
          onClose={() => setEditingContact(null)}
          contact={editingContact}
        />
      )}
    </div>
  );
}