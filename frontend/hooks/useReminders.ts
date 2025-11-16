import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

// Types
export interface Reminder {
  id: string;
  title: string;
  description: string | null;
  type: 'FOLLOW_UP' | 'INTERVIEW' | 'ASSESSMENT' | 'DEADLINE' | 'CALL' | 'EMAIL' | 'OTHER';
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  job?: {
    id: string;
    title: string;
    company: string | null;
  };
  contact?: {
    id: string;
    name: string;
    company: string;
  };
}

export interface CreateReminderData {
  title: string;
  description?: string;
  type: Reminder['type'];
  dueDate: string;
  jobId?: string;
  contactId?: string;
}

// Query Keys
export const reminderKeys = {
  all: ['reminders'] as const,
  lists: () => [...reminderKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...reminderKeys.lists(), { filters }] as const,
  details: () => [...reminderKeys.all, 'detail'] as const,
  detail: (id: string) => [...reminderKeys.details(), id] as const,
  upcoming: (params?: { limit?: number; days?: number }) => 
    [...reminderKeys.all, 'upcoming', params] as const,
  byJob: (jobId: string) => [...reminderKeys.all, 'job', jobId] as const,
  byContact: (contactId: string) => [...reminderKeys.all, 'contact', contactId] as const,
};

// Hooks
export const useReminders = (params?: { 
  limit?: number; 
  cursor?: string; 
  status?: Reminder['status'];
  type?: Reminder['type'];
  jobId?: string;
  contactId?: string;
}) => {
  const queryParams = new URLSearchParams();
  if (params?.limit) queryParams.set('limit', params.limit.toString());
  if (params?.cursor) queryParams.set('cursor', params.cursor);
  if (params?.status) queryParams.set('status', params.status);
  if (params?.type) queryParams.set('type', params.type);
  
  const queryString = queryParams.toString();
  const url = `/api/reminders${queryString ? `?${queryString}` : ''}`;

  return useQuery({
    queryKey: reminderKeys.list(params || {}),
    queryFn: () => api<{ items: Reminder[]; nextCursor: string | null }>(url),
    staleTime: 1000 * 60 * 2, // 2 minutes
    select: (data) => {
      let filteredItems = data.items;
      
      // Client-side filtering for job or contact
      if (params?.jobId) {
        filteredItems = filteredItems.filter(reminder => reminder.job?.id === params.jobId);
      }
      if (params?.contactId) {
        filteredItems = filteredItems.filter(reminder => reminder.contact?.id === params.contactId);
      }
      
      return {
        items: filteredItems,
        nextCursor: data.nextCursor
      };
    },
  });
};

export const useRemindersByJob = (jobId: string) => {
  return useQuery({
    queryKey: reminderKeys.byJob(jobId),
    queryFn: () => api<{ items: Reminder[]; nextCursor: string | null }>('/api/reminders'),
    staleTime: 1000 * 60 * 2, // 2 minutes
    select: (data) => data.items.filter(reminder => reminder.job?.id === jobId),
  });
};

export const useRemindersByContact = (contactId: string) => {
  return useQuery({
    queryKey: reminderKeys.byContact(contactId),
    queryFn: () => api<{ items: Reminder[]; nextCursor: string | null }>('/api/reminders'),
    staleTime: 1000 * 60 * 2, // 2 minutes
    select: (data) => data.items.filter(reminder => reminder.contact?.id === contactId),
  });
};

export const useUpcomingReminders = (params?: { limit?: number; days?: number }) => {
  const queryParams = new URLSearchParams();
  if (params?.limit) queryParams.set('limit', params.limit.toString());
  if (params?.days) queryParams.set('days', params.days.toString());
  
  const queryString = queryParams.toString();
  const url = `/api/reminders/upcoming${queryString ? `?${queryString}` : ''}`;

  return useQuery({
    queryKey: reminderKeys.upcoming(params),
    queryFn: () => api<Reminder[]>(url),
    staleTime: 1000 * 60 * 1, // 1 minute
  });
};

export const useReminder = (id: string) => {
  return useQuery({
    queryKey: reminderKeys.detail(id),
    queryFn: () => api<Reminder>(`/api/reminders/${id}`),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// Mutations
export const useCreateReminder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReminderData) =>
      api<Reminder>('/api/reminders', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: (newReminder, data) => {
      // Dispatch event for exp bubble animation
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('exp-gained', { detail: { amount: 5 } }));
      }
      // Invalidate user so server-side exp is refetched
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
      
      // Invalidate all reminder queries
      queryClient.invalidateQueries({ queryKey: reminderKeys.all });
      
      // Invalidate specific entity queries if applicable
      if (data.jobId) {
        queryClient.invalidateQueries({ queryKey: reminderKeys.byJob(data.jobId) });
        queryClient.invalidateQueries({ queryKey: ['jobs', 'detail', data.jobId] });
        queryClient.invalidateQueries({ queryKey: ['jobs', 'list'] });
      }
      if (data.contactId) {
        queryClient.invalidateQueries({ queryKey: reminderKeys.byContact(data.contactId) });
        queryClient.invalidateQueries({ queryKey: ['contacts', 'detail', data.contactId] });
        queryClient.invalidateQueries({ queryKey: ['contacts', 'list'] });
      }
    },
  });
};

export const useUpdateReminder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      reminderId, 
      data 
    }: { 
      reminderId: string; 
      data: Partial<CreateReminderData & { status: Reminder['status'] }>
    }) =>
      api<Reminder>(`/api/reminders/${reminderId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: (updatedReminder) => {
      // Update specific reminder in cache
      queryClient.setQueryData(reminderKeys.detail(updatedReminder.id), updatedReminder);
      
      // Invalidate all reminder queries
      queryClient.invalidateQueries({ queryKey: reminderKeys.all });
      
      // Invalidate specific entity queries if applicable
      if (updatedReminder.job?.id) {
        queryClient.invalidateQueries({ queryKey: reminderKeys.byJob(updatedReminder.job.id) });
        queryClient.invalidateQueries({ queryKey: ['jobs', 'detail', updatedReminder.job.id] });
        queryClient.invalidateQueries({ queryKey: ['jobs', 'list'] });
      }
      if (updatedReminder.contact?.id) {
        queryClient.invalidateQueries({ queryKey: reminderKeys.byContact(updatedReminder.contact.id) });
        queryClient.invalidateQueries({ queryKey: ['contacts', 'detail', updatedReminder.contact.id] });
        queryClient.invalidateQueries({ queryKey: ['contacts', 'list'] });
      }
    },
  });
};

export const useDeleteReminder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reminderId: string) =>
      api(`/api/reminders/${reminderId}`, { method: 'DELETE' }),
    onMutate: async (reminderId) => {
      // Optimistically remove from cache
      queryClient.removeQueries({ queryKey: reminderKeys.detail(reminderId) });
      return { reminderId };
    },
    onSuccess: (_, reminderId) => {
      // Invalidate all reminder queries
      queryClient.invalidateQueries({ queryKey: reminderKeys.all });
      
      // Note: We can't easily determine which job/contact this reminder belonged to
      // after deletion, so we invalidate all job and contact queries
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
};