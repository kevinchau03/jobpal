"use client";

import { useState } from "react";
import { Calendar, Clock, AlertTriangle, CheckCircle, Plus } from "lucide-react";
import { useUpcomingReminders } from "@/hooks/useJobs";
import ReminderItem from "../../components/ReminderItem";

export default function UpcomingReminders() {
  const [showCompleted, setShowCompleted] = useState(false);
  
  // Get upcoming reminders for the next 7 days
  const { data: upcomingReminders, isLoading, error } = useUpcomingReminders({
    limit: 50,
    days: 7
  });

  if (isLoading) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-card/50 rounded w-48"></div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-20 bg-card/50 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-foreground/20 mx-auto mb-4" />
          <p className="text-foreground/60">Failed to load reminders</p>
        </div>
      </div>
    );
  }

  const reminders = upcomingReminders || [];
  const pendingReminders = reminders.filter(r => r.status === 'PENDING');
  const completedReminders = reminders.filter(r => r.status === 'COMPLETED');
  const overdueReminders = pendingReminders.filter(r => new Date(r.dueDate) < new Date());
  const todayReminders = pendingReminders.filter(r => 
    new Date(r.dueDate).toDateString() === new Date().toDateString()
  );

  return (
    <div className="p-6">
      <div className="space-y-8">
        
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl text-foreground">Reminders</h1>
          <p className=" text-sm">Next 7 days</p>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-6 rounded-lg bg-card border border-border hover:border-foreground/20 transition-colors">
            <div className="text-3xl font-light mb-1">{pendingReminders.length}</div>
            <div className="text-xs text-foreground/50 uppercase tracking-wider">Pending</div>
          </div>
          <div className="p-6 rounded-lg bg-card border border-red-500/20 hover:border-red-500/40 transition-colors">
            <div className="text-3xl font-light text-red-400 mb-1">{overdueReminders.length}</div>
            <div className="text-xs text-red-400/70 uppercase tracking-wider">Overdue</div>
          </div>
          <div className="p-6 rounded-lg bg-card border border-yellow-500/20 hover:border-yellow-500/40 transition-colors">
            <div className="text-3xl font-light text-yellow-400 mb-1">{todayReminders.length}</div>
            <div className="text-xs text-yellow-400/70 uppercase tracking-wider">Today</div>
          </div>
          <div className="p-6 rounded-lg bg-card border border-green-500/20 hover:border-green-500/40 transition-colors">
            <div className="text-3xl font-light text-green-400 mb-1">{completedReminders.length}</div>
            <div className="text-xs text-green-400/70 uppercase tracking-wider">Done</div>
          </div>
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center gap-2 py-2">
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground transition-colors"
          >
            <div className={`w-4 h-4 rounded border transition-all ${
              showCompleted 
                ? 'bg-primary border-primary' 
                : 'border-border'
            }`}>
              {showCompleted && <CheckCircle className="w-4 h-4 text-background" />}
            </div>
            Show completed
          </button>
        </div>

        {/* Reminders List */}
        <div className="space-y-6">
          {pendingReminders.length === 0 && completedReminders.length === 0 ? (
            <div className="py-16 text-center">
              <Clock className="w-16 h-16 text-foreground/10 mx-auto mb-4" />
              <h3 className="text-lg font-light text-foreground/80 mb-2">No upcoming reminders</h3>
              <p className="text-sm  max-w-md mx-auto">
                You're all caught up! Consider adding reminders to your active job applications.
              </p>
            </div>
          ) : (
            <>
              {/* Overdue */}
              {overdueReminders.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <h3 className="text-sm font-medium text-red-400 uppercase tracking-wider">
                      Overdue · {overdueReminders.length}
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {overdueReminders.map((reminder) => (
                      <div key={reminder.id} className="space-y-1">
                        <div className="text-xs px-4">
                          {reminder.title}
                        </div>
                        <ReminderItem 
                          reminder={reminder}
                          jobId={reminder.id}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Today */}
              {todayReminders.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-yellow-400" />
                    <h3 className="text-sm font-medium text-yellow-400 uppercase tracking-wider">
                      Due Today · {todayReminders.length}
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {todayReminders.map((reminder) => (
                      <div key={reminder.id} className="space-y-1">
                        <div className="text-xs px-4">
                          {reminder.title}
                        </div>
                        <ReminderItem 
                          reminder={reminder}
                          jobId={reminder.id}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Coming Up */}
              {pendingReminders.filter(r => !overdueReminders.includes(r) && !todayReminders.includes(r)).length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-medium text-primary uppercase tracking-wider">
                      Coming Up
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {pendingReminders
                      .filter(r => !overdueReminders.includes(r) && !todayReminders.includes(r))
                      .map((reminder) => (
                        <div key={reminder.id} className="space-y-1">
                          <div className="text-xs px-4">
                            {reminder.title}
                          </div>
                          <ReminderItem 
                            reminder={reminder}
                            jobId={reminder.id}
                          />
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}

              {/* Completed */}
              {showCompleted && completedReminders.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <h3 className="text-sm font-medium text-green-400 uppercase tracking-wider">
                      Completed · {completedReminders.length}
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {completedReminders.map((reminder) => (
                      <div key={reminder.id} className="space-y-1">
                        <div className="text-xs px-4">
                          {reminder.title}
                        </div>
                        <ReminderItem 
                          reminder={reminder}
                          jobId={reminder.id}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}