"use client";

import { Building2, Calendar, Phone, Mail } from "lucide-react";
import { Contact } from "@/hooks/useContacts";

const statusColors: Record<string, string> = {
  REACHED_OUT: "bg-blue-100 text-blue-700",
  IN_CONTACT: "bg-purple-100 text-purple-700",
  NOT_INTERESTED: "bg-gray-100 text-gray-700",
  INTERESTED: "bg-green-100 text-green-700",
  FOLLOW_UP: "bg-yellow-100 text-yellow-700",
  default: "bg-gray-100 text-gray-700",
};

interface ContactComponentProps {
  readonly contact: Contact;
  readonly onEdit: (contactId: string) => void;
  readonly onDelete: (contactId: string) => void;
}

export default function ContactComponent({ contact, onEdit, onDelete }: ContactComponentProps) {
  const key = (contact.status || "default").toUpperCase();
  const badge = statusColors[key] || statusColors.default;

  return (
    <div className={`bg-card border border-border rounded-sm shadow-sm p-3 transition-all hover:border-border hover:shadow-md`}>
      <div className="flex items-center justify-between gap-6">
        {/* Left content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm font-semibold">
              {contact.name}
            </h3>
            <span
              className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap ${badge}`}
            >
              {contact.status}
            </span>
          </div>
          
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {contact.company && (
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 flex-shrink-0" />
                <span>{contact.company}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span>
                {new Date(contact.createdAt).toLocaleDateString()}
              </span>
            </div>
            
            {contact.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span>{contact.email}</span>
              </div>
            )}
            
            {contact.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>{contact.phone}</span>
              </div>
            )}
            
            {contact.linkedin && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span>{contact.linkedin}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right actions */}
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => onEdit(contact.id)}
            className="px-3 py-1 text-xs font-medium bg-blue-500 text-white rounded-sm hover:bg-blue-600 transition-colors hover:cursor-pointer"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(contact.id)}
            className="px-3 py-1 text-xs font-medium bg-red-500 text-white rounded-sm hover:bg-red-600 transition-colors hover:cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
