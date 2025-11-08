"use client"
import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import AddContactForm from "../../components/AddContacts";

type Contact = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  linkedin?: string | null;
  company: string;
  status: string;
  createdAt: string;
}

const statusColors = {
  default: "bg-gray-100 text-gray-700"
};

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const loadContacts = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const { items } = await api<{ items: Contact[]; nextCursor: string | null }>(
        "/api/contacts?limit=20"
      );
      setContacts(items);
    } catch (e: any) {
      setErr(e.message || "Failed to load contacts");
      setContacts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-secondary">Contacts</h1>
      <p>Manage your contacts here.</p>
      <AddContactForm onCreated={loadContacts} />
      <div className="mt-6 space-y-4">
        {contacts.length === 0 ? (
          <div className="bg-card rounded-sm shadow-sm border border-border p-12 text-center">
            <p className="">No contacts found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {contacts.map(contact => (
              <div
                key={contact.id}
                className="bg-card rounded-sm shadow-sm p-2 border border-border hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-medium">{contact.name}</p>
                    {contact.email && <p className="text-sm ">Email: {contact.email}</p>}
                    {contact.phone && <p className="text-sm ">Phone: {contact.phone}</p>}
                    {contact.company && <p className="text-sm ">Company: {contact.company}</p>}
                    {contact.linkedin && <p className="text-sm ">LinkedIn: {contact.linkedin}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

}