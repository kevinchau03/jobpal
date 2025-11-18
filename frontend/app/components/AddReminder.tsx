"use client";

import { useState } from "react";
import { X, Bell } from "lucide-react";
import {
  useCreateReminder,
  CreateReminderData,
  Reminder,
  Job
} from "@/hooks/useJobs";
import { Contact } from "@/hooks/useContacts";

// Smart reminder templates based on job status
const getJobReminderTemplates = (status: Job['status']): Partial<CreateReminderData>[] => {
  const baseDate = new Date();
  
  switch (status) {
    case 'APPLIED':
      return [
        {
          title: "Follow up on application",
          type: "FOLLOW_UP",
          dueDate: new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 1 week
        },
        {
          title: "Check application status",
          type: "FOLLOW_UP", 
          dueDate: new Date(baseDate.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 2 weeks
        }
      ];
    case 'SCREEN':
      return [
        {
          title: "Prepare for phone screen",
          type: "INTERVIEW",
          dueDate: new Date(baseDate.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // tomorrow
        }
      ];
    case 'INTERVIEWING':
      return [
        {
          title: "Interview preparation",
          type: "INTERVIEW",
          dueDate: new Date(baseDate.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // tomorrow
        },
        {
          title: "Send thank you note",
          type: "EMAIL",
          dueDate: new Date(baseDate.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // tomorrow
        }
      ];
    case 'OFFER':
      return [
        {
          title: "Respond to job offer",
          type: "DEADLINE",
          dueDate: new Date(baseDate.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 3 days
        }
      ];
    default:
      return [
        {
          title: "Follow up",
          type: "FOLLOW_UP",
          dueDate: new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 1 week
        }
      ];
  }
};

// Smart reminder templates based on contact status
const getContactReminderTemplates = (status: Contact['status']): Partial<CreateReminderData>[] => {
  const baseDate = new Date();
  
  switch (status) {
    case 'REACHED_OUT':
      return [
        {
          title: "Follow up on initial contact",
          type: "FOLLOW_UP",
          dueDate: new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 1 week
        }
      ];
    case 'IN_CONTACT':
      return [
        {
          title: "Schedule coffee chat",
          type: "CALL",
          dueDate: new Date(baseDate.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 3 days
        },
        {
          title: "Send LinkedIn connection request",
          type: "OTHER",
          dueDate: new Date(baseDate.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // tomorrow
        }
      ];
    case 'INTERESTED':
      return [
        {
          title: "Set up informational interview",
          type: "INTERVIEW",
          dueDate: new Date(baseDate.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 2 days
        }
      ];
    case 'FOLLOW_UP':
      return [
        {
          title: "Follow up conversation",
          type: "FOLLOW_UP",
          dueDate: new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 1 week
        }
      ];
    default:
      return [
        {
          title: "Reach out to contact",
          type: "CALL",
          dueDate: new Date(baseDate.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 3 days
        }
      ];
  }
};

interface AddReminderProps {
  isOpen: boolean;
  onClose: () => void;
  job?: Job;
  contact?: Contact;
}

export default function AddReminder({ isOpen, onClose, job, contact }: AddReminderProps) {
  // Validation: ensure either job or contact is provided, but not both
  if (job && contact) {
    console.warn('AddReminder: Both job and contact provided. Using job.');
  }
  if (!job && !contact) {
    console.warn('AddReminder: Neither job nor contact provided.');
  }

  const [reminderForm, setReminderForm] = useState<CreateReminderData>({
    title: "",
    description: "",
    type: "FOLLOW_UP",
    dueDate: new Date().toISOString().split('T')[0] // today
  });

  const [showTemplates, setShowTemplates] = useState(true);
  const createReminderMutation = useCreateReminder();

  // Get appropriate templates based on entity type
  const templates = job 
    ? getJobReminderTemplates(job.status)
    : contact 
    ? getContactReminderTemplates(contact.status)
    : [];

  // Get entity info for display
  const entityInfo = job 
    ? { name: job.title, company: job.company }
    : contact 
    ? { name: contact.name, company: contact.company }
    : { name: '', company: null };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reminderForm.title.trim() || !reminderForm.dueDate) {
      return;
    }

    try {
      await createReminderMutation.mutateAsync({
        ...reminderForm,
        jobId: job?.id,
        contactId: contact?.id
      });
      
      // Reset form and close
      setReminderForm({
        title: "",
        description: "",
        type: "FOLLOW_UP",
        dueDate: new Date().toISOString().split('T')[0]
      });
      setShowTemplates(true);
      onClose();
    } catch (error) {
      console.error("Failed to create reminder:", error);
    }
  };

  const applyTemplate = (template: Partial<CreateReminderData>) => {
    setReminderForm(prev => ({
      ...prev,
      ...template
    }));
    setShowTemplates(false);
  };

  const reminderTypes: { value: Reminder['type']; label: string; icon: string }[] = [
    { value: "FOLLOW_UP", label: "Follow Up", icon: "📞" },
    { value: "INTERVIEW", label: "Interview", icon: "🎯" },
    { value: "ASSESSMENT", label: "Assessment", icon: "📝" },
    { value: "DEADLINE", label: "Deadline", icon: "⏰" },
    { value: "CALL", label: "Call", icon: "☎️" },
    { value: "EMAIL", label: "Email", icon: "📧" },
    { value: "OTHER", label: "Other", icon: "📌" }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold">Add Reminder</h2>
            <p className="text-sm mt-1">
              For: {entityInfo.name} {entityInfo.company && `at ${entityInfo.company}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Smart Templates */}
          {showTemplates && templates.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Bell className="w-4 h-4 text-blue-600" />
                <h3 className="font-medium text-sm">
                  {job ? 'Job-specific suggestions' : contact ? 'Contact suggestions' : 'Quick suggestions'}
                </h3>
              </div>
              <div className="space-y-2">
                {templates.map((template, index) => (
                  <button
                    key={index}
                    onClick={() => applyTemplate(template)}
                    className="w-full text-left p-3 border border-blue-200 rounded-lg transition-colors hover:cursor-pointer"
                  >
                    <div className="font-medium text-sm">{template.title}</div>
                    <div className="text-xs mt-1">
                      {template.type?.replace('_', ' ').toLowerCase()} • Due {new Date(template.dueDate || '').toLocaleDateString()}
                    </div>
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setShowTemplates(false)}
                className="text-sm text-blue-600 mt-3 hover:underline"
              >
                Create custom reminder instead
              </button>
            </div>
          )}

          {/* Custom Form */}
          {!showTemplates && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={reminderForm.title}
                  onChange={(e) => setReminderForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Follow up on application"
                  className="w-full p-3 border border-border bg-card rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  value={reminderForm.description}
                  onChange={(e) => setReminderForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Additional details (optional)"
                  rows={3}
                  className="w-full p-3 border border-border bg-card rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Type *
                  </label>
                  <select
                    value={reminderForm.type}
                    onChange={(e) => setReminderForm(prev => ({ ...prev, type: e.target.value as Reminder['type'] }))}
                    className="w-full p-3 border border-border bg-card rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    {reminderTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    value={reminderForm.dueDate}
                    onChange={(e) => setReminderForm(prev => ({ ...prev, dueDate: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full p-3 border border-border bg-card rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={createReminderMutation.isPending}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  {createReminderMutation.isPending ? "Creating..." : "Create Reminder"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowTemplates(true);
                    setReminderForm({
                      title: "",
                      description: "",
                      type: "FOLLOW_UP",
                      dueDate: new Date().toISOString().split('T')[0]
                    });
                  }}
                  className="px-4 py-3 border border-border bg-card rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back to Suggestions
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}