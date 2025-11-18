"use client";

import { useState } from "react";
import { Briefcase, Building2, Calendar, Pin, Timer, Plus } from "lucide-react";
import { Job } from "@/hooks/useJobs";
import AddReminder from "./AddReminder";
import ReminderItem from "./ReminderItem";

const statusColors: Record<string, string> = {
  SAVED: "bg-gray-100 text-gray-700",
  APPLIED: "bg-blue-100 text-blue-700",
  SCREEN: "bg-purple-100 text-purple-700",
  INTERVIEWING: "bg-yellow-100 text-yellow-700",
  OFFER: "bg-green-100 text-green-700",
  WITHDRAWN: "bg-orange-100 text-orange-700",
  GHOSTED: "bg-gray-100 text-gray-600",
  REJECTED: "bg-rose-100 text-rose-700",
  default: "bg-gray-100 text-gray-700",
};

const jobTypeLabels: Record<string, string> = {
  PART_TIME: "Part Time",
  FULL_TIME: "Full Time",
  INTERNSHIP: "Internship",
  CONTRACT: "Contract",
};

interface JobProps {
  job: Job;
  onEdit: (jobId: string) => void;
  onDelete: (jobId: string) => void;
}

export default function JobComponent({ job, onEdit, onDelete }: JobProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAddReminder, setShowAddReminder] = useState(false);
  const key = (job.status || "default").toUpperCase();
  const badge = statusColors[key] || statusColors.default;

  const reminders = job.reminders || [];
  const hasReminders = reminders.length > 0;
  
  // Calculate reminder statistics
  const pendingReminders = reminders.filter(r => r.status === 'PENDING');
  const overdueReminders = pendingReminders.filter(r => new Date(r.dueDate) < new Date());
  const todayReminders = pendingReminders.filter(r => 
    new Date(r.dueDate).toDateString() === new Date().toDateString()
  );

  return (
    <div className={`bg-card border border-border rounded-sm shadow-sm p-3 transition-all hover:border-border ${
      isExpanded && reminders?.length ? 'shadow-lg' : 'hover:shadow-md'
    }`}>
      <div className="flex items-center justify-between gap-6">
        {/* Left content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm font-semibold">
              {job.title}
            </h3>
            <span
              className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap ${badge}`}
            >
              {job.status}
            </span>
          </div>
          
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {job.company && (
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 flex-shrink-0" />
                <span>{job.company}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span>
                {new Date(job.createdAt).toLocaleDateString()}
              </span>
            </div>
            
            {job.location && (
              <div className="flex items-center gap-2">
                <Pin className="w-4 h-4 flex-shrink-0" />
                <span>{job.location}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 flex-shrink-0" />
              <span>{job.jobType ? jobTypeLabels[job.jobType] || job.jobType : 'Not specified'}</span>
            </div>
            
            {hasReminders && (
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className={`flex items-center gap-2 px-2 py-1 rounded-sm transition-colors hover:cursor-pointer ${
                  overdueReminders.length > 0 
                    ? 'text-red-600 hover:bg-red-50' 
                    : todayReminders.length > 0
                    ? 'text-yellow-600 hover:bg-yellow-50'
                    : 'text-blue-600 hover:bg-blue-50'
                }`}
              >
                <Timer className="w-4 h-4 flex-shrink-0" />
                <span>
                  {pendingReminders.length > 0 
                    ? `${pendingReminders.length} pending`
                    : `${reminders.length} reminder${reminders.length > 1 ? 's' : ''}`
                  }
                  {overdueReminders.length > 0 && ` (${overdueReminders.length} overdue)`}
                  {todayReminders.length > 0 && !overdueReminders.length && ` (${todayReminders.length} today)`}
                </span>
                <span className="text-xs">{isExpanded ? '▲' : '▼'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setShowAddReminder(true)}
            className="flex items-center gap-1 text-sm font-medium hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-md transition-colors hover:cursor-pointer"
            title="Add reminder"
          >
            <Plus className="w-4 h-4" />
            Reminder
          </button>
          <button
            className="text-sm font-medium hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-md transition-colors hover:cursor-pointer"
            onClick={() => onEdit(job.id)}
          >
            Edit
          </button>
          <button
            className="text-sm font-medium hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-md transition-colors hover:cursor-pointer"
            onClick={() => onDelete(job.id)}
          >
            Delete
          </button>
        </div>
      </div>

      {/* Expanded reminders section */}
      {isExpanded && hasReminders && (
        <div className="mt-4 pt-3 border-t border-border">
          <div className="flex items-center gap-2 mb-3 text-sm font-medium">
            <Timer className="w-4 h-4" />
            <span>Reminders Details</span>
          </div>
          
          {reminders && reminders.length > 0 ? (
            <div className="space-y-3">
              {reminders.map((reminder) => (
                <ReminderItem 
                  key={reminder.id}
                  reminder={reminder}
                />
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground py-3 text-center bg-gray-50 rounded-md">
              No reminders found
            </div>
          )}
        </div>
      )}
      
      {/* Add Reminder Modal */}
      <AddReminder 
        isOpen={showAddReminder}
        onClose={() => setShowAddReminder(false)}
        job={job}
      />
    </div>
  );
}
