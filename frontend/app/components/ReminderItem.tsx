"use client";

import { useState } from "react";
import { Check, X, Clock, Edit3, Trash2 } from "lucide-react";
import { Reminder, useUpdateReminder, useDeleteReminder } from "@/hooks/useReminders";

interface ReminderItemProps {
  reminder: Reminder;
  jobId?: string;
  contactId?: string;
}

const reminderTypeIcons: Record<Reminder['type'], string> = {
  'FOLLOW_UP': '📞',
  'INTERVIEW': '🎯', 
  'ASSESSMENT': '📝',
  'DEADLINE': '⏰',
  'CALL': '☎️',
  'EMAIL': '📧',
  'OTHER': '📌'
};

export default function ReminderItem({ reminder, jobId, contactId }: ReminderItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const updateReminderMutation = useUpdateReminder();
  const deleteReminderMutation = useDeleteReminder();

  const isOverdue = new Date(reminder.dueDate) < new Date() && reminder.status === 'PENDING';
  const isDueToday = new Date(reminder.dueDate).toDateString() === new Date().toDateString();
  
  const handleMarkComplete = async () => {
    try {
      await updateReminderMutation.mutateAsync({
        reminderId: reminder.id,
        data: { status: 'COMPLETED' as const }
      });
    } catch (error) {
      console.error("Failed to mark reminder as complete:", error);
    }
  };

  const handleMarkPending = async () => {
    try {
      await updateReminderMutation.mutateAsync({
        reminderId: reminder.id,
        data: { status: 'PENDING' as const }
      });
    } catch (error) {
      console.error("Failed to mark reminder as pending:", error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this reminder?')) {
      try {
        await deleteReminderMutation.mutateAsync(reminder.id);
      } catch (error) {
        console.error("Failed to delete reminder:", error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="rounded-sm transition-all">
      <div className="p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm">
                {reminderTypeIcons[reminder.type]}
              </span>
              <span className={`font-medium text-sm ${
                reminder.status === 'COMPLETED' ? 'line-through text-gray-500' : ''
              }`}>
                {reminder.title}
              </span>
            </div>
            
            {reminder.description && (
              <div className={`text-sm text-gray-600 mb-2 ${
                isExpanded ? '' : 'line-clamp-1'
              } ${
                reminder.status === 'COMPLETED' ? 'line-through' : ''
              }`}>
                {reminder.description}
              </div>
            )}
            
            <div className="flex items-center gap-3 text-xs">
              <span className={`font-medium ${
                isOverdue ? 'text-red-600' : 
                isDueToday ? 'text-yellow-600' : 
                'text-gray-600'
              }`}>
                {isOverdue ? '⚠️ Overdue' : 'Due'}: {formatDate(reminder.dueDate)}
              </span>
              
              <span className="text-gray-400">•</span>
              
              <span className="capitalize text-gray-500">
                {reminder.type.replace('_', ' ').toLowerCase()}
              </span>
              
              {reminder.description && (
                <>
                  <span className="text-gray-400">•</span>
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    {isExpanded ? 'Less' : 'More'}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {reminder.status === 'PENDING' ? (
              <button
                onClick={handleMarkComplete}
                disabled={updateReminderMutation.isPending}
                className="p-1.5 text-green-600 hover:bg-green-100 rounded transition-colors"
                title="Mark as complete"
              >
                <Check className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleMarkPending}
                disabled={updateReminderMutation.isPending}
                className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                title="Mark as pending"
              >
                <Clock className="w-4 h-4" />
              </button>
            )}
            
            <button
              onClick={handleDelete}
              disabled={deleteReminderMutation.isPending}
              className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors"
              title="Delete reminder"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}