"use client";

import { Bell, Clock } from "lucide-react";
import { useUpcomingReminders } from "@/hooks/useReminders";
import Link from "next/link";

export default function RemindersWidget() {
  const { data: upcomingReminders, isLoading } = useUpcomingReminders({
    limit: 5,
    days: 7
  });

  if (isLoading) {
    return (
      <div className="bg-card rounded-xm shadow-sm border p-4">
        <div className="animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-32 mb-3"></div>
          <div className="space-y-2">
            {[1, 2].map(i => (
              <div key={i} className="h-8 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const reminders = upcomingReminders || [];
  const pendingReminders = reminders.filter(r => r.status === 'PENDING');
  const overdueReminders = pendingReminders.filter(r => new Date(r.dueDate) < new Date());
  const todayReminders = pendingReminders.filter(r => 
    new Date(r.dueDate).toDateString() === new Date().toDateString()
  );

  const displayReminders = pendingReminders.slice(0, 3);

  return (
    <div className="bg-card rounded-sm border border-border">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-600" />
          <h3 className="font-medium">Upcoming Reminders</h3>
          {(overdueReminders.length > 0 || todayReminders.length > 0) && (
            <div className="flex items-center gap-1">
              {overdueReminders.length > 0 && (
                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                  {overdueReminders.length} overdue
                </span>
              )}
              {todayReminders.length > 0 && (
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                  {todayReminders.length} today
                </span>
              )}
            </div>
          )}
        </div>
        <Link 
          href="/dashboard/reminders" 
          className="text-sm font-medium text-primary hover:text-blue-700 transition-colors"
        >
          View all →
        </Link>
      </div>
      
      <div className="p-4">
        {displayReminders.length === 0 ? (
          <div className="text-center  py-6">
            <Clock className="w-8 h-8 mx-auto mb-2 " />
            <p className="text-sm">No upcoming reminders</p>
            <p className="text-xs ">You&apos;re all caught up!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayReminders.map((reminder) => {
              const isOverdue = new Date(reminder.dueDate) < new Date();
              const isToday = new Date(reminder.dueDate).toDateString() === new Date().toDateString();
              
              return (
                <div key={reminder.id} className="flex items-start gap-3 p-2 rounded-sm hover:bg-card-hover">
                  <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                    isOverdue ? 'bg-red-500' : 
                    isToday ? 'bg-yellow-500' : 
                    'bg-blue-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium ">
                      {reminder.title}
                    </div>
                    <div className="text-xs ">
                      {reminder.title}
                    </div>
                    <div className={`text-xs mt-1 ${
                      isOverdue ? 'text-red-600' : 
                      isToday ? 'text-yellow-600' : 
                      ''
                    }`}>
                      {isOverdue ? '⚠️ Overdue' : isToday ? 'Due today' : `Due ${new Date(reminder.dueDate).toLocaleDateString()}`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}