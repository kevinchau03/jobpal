import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

// Types
export interface Contact {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  linkedin: string | null;
  company: string;
  status: 'REACHED_OUT' | 'IN_CONTACT' | 'NOT_INTERESTED' | 'INTERESTED' | 'FOLLOW_UP';
  reminders?: Reminder[];
  createdAt: string;
}


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

export interface ContactSummary {
  total: number;
  REACHED_OUT: number;
  IN_CONTACT: number;
  NOT_INTERESTED: number;
  INTERESTED: number;
  FOLLOW_UP: number;
}

export interface CreateContactData {
  name: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  company: string;
  status?: Contact['status'];
}

export interface CreateReminderData {
  title: string;
  description?: string;
  type: Reminder['type'];
  dueDate: string;
}

// Query Keys
export const contactKeys = {
  all: ['contacts'] as const,
  lists: () => [...contactKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...contactKeys.lists(), { filters }] as const,
  details: () => [...contactKeys.all, 'detail'] as const,
  detail: (id: string) => [...contactKeys.details(), id] as const,
  summary: () => [...contactKeys.all, 'summary'] as const,
  reminders: () => [...contactKeys.all, 'reminders'] as const,
  upcomingReminders: (params?: { limit?: number; days?: number }) => 
    [...contactKeys.reminders(), 'upcoming', params] as const,
};

// Hooks
export const useContacts = (params?: { limit?: number; cursor?: string; status?: string }) => {
  const queryParams = new URLSearchParams();
  if (params?.limit) queryParams.set('limit', params.limit.toString());
  if (params?.cursor) queryParams.set('cursor', params.cursor);
  if (params?.status) queryParams.set('status', params.status);
  
  const queryString = queryParams.toString();
  const url = `/api/contacts${queryString ? `?${queryString}` : ''}`;

  return useQuery({
    queryKey: contactKeys.list(params || {}),
    queryFn: () => api<{ items: Contact[]; nextCursor: string | null }>(url),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useContact = (id: string) => {
  return useQuery({
    queryKey: contactKeys.detail(id),
    queryFn: () => api<Contact>(`/api/contacts/${id}`),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useContactSummary = () => {
  return useQuery({
    queryKey: contactKeys.summary(),
    queryFn: () => api<ContactSummary>('/api/contacts/summary'),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Mutations
export const useCreateContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateContactData) =>
      api<Contact>('/api/contacts', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      // Dispatch event for exp bubble animation
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('exp-gained', { detail: { amount: 10 } }));
      }
      // Invalidate user so server-side exp is refetched
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
      queryClient.invalidateQueries({ queryKey: contactKeys.summary() });
    },
  });
};

export const useUpdateContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateContactData> }) =>
      api<Contact>(`/api/contacts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: (data) => {
      // Update specific contact in cache
      queryClient.setQueryData(contactKeys.detail(data.id), data);
      // Invalidate lists and summary
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
      queryClient.invalidateQueries({ queryKey: contactKeys.summary() });
    },
  });
};

export const useDeleteContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      api(`/api/contacts/${id}`, { method: 'DELETE' }),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: contactKeys.detail(deletedId) });
      // Invalidate lists and summary
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
      queryClient.invalidateQueries({ queryKey: contactKeys.summary() });
    },
  });
};

export const useReminders = (contactId?: string) => {
  return useQuery({
    queryKey: contactId ? [...contactKeys.detail(contactId), 'reminders'] : ['reminders', 'all'],
    queryFn: () => api<Reminder[]>('/api/reminders'),
    staleTime: 1000 * 60 * 2, // 2 minutes
    select: contactId ? (data: Reminder[]) => data.filter(reminder => 
      reminder.contact?.id === contactId
    ) : undefined,
  });
};

export const useUpcomingReminders = (params?: { limit?: number; days?: number }) => {
  const queryParams = new URLSearchParams();
  if (params?.limit) queryParams.set('limit', params.limit.toString());
  if (params?.days) queryParams.set('days', params.days.toString());
  
  const queryString = queryParams.toString();
  const url = `/api/reminders/upcoming${queryString ? `?${queryString}` : ''}`;

  return useQuery({
    queryKey: contactKeys.upcomingReminders(params),
    queryFn: () => api<(Reminder & { contact: { id: string; title: string; company: string | null } })[]>(url),
    staleTime: 1000 * 60 * 1, // 1 minute
  });
};


export const useCreateReminder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ contactId, data }: { contactId?: string; data: CreateReminderData & { jobId?: string; contactId?: string } }) =>
      api<Reminder>('/api/reminders', {
        method: 'POST',
        body: JSON.stringify({ ...data, contactId }),
      }),
    onSuccess: (_, { contactId }) => {
      // Dispatch event for exp bubble animation
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('exp-gained', { detail: { amount: 5 } }));
      }
      // Invalidate user so server-side exp is refetched
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
      // Invalidate reminder-related queries
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      queryClient.invalidateQueries({ queryKey: contactKeys.upcomingReminders() });
      if (contactId) {
        queryClient.invalidateQueries({ queryKey: contactKeys.detail(contactId) });
        queryClient.invalidateQueries({ queryKey: [...contactKeys.detail(contactId), 'reminders'] });
      }
      // IMPORTANT: Invalidate job lists so reminder counts update in job cards
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
    },
  });
};

export const useUpdateReminder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      reminderId, 
      data,
      contactId
    }: { 
      reminderId: string; 
      data: Partial<CreateReminderData & { status: Reminder['status']; jobId?: string; contactId?: string }>;
      contactId?: string;
    }) =>
      api<Reminder>(`/api/reminders/${reminderId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: (_, { contactId }) => {
      // Invalidate reminder-related queries
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      queryClient.invalidateQueries({ queryKey: contactKeys.upcomingReminders() });
      if (contactId) {
        queryClient.invalidateQueries({ queryKey: contactKeys.detail(contactId) });
        queryClient.invalidateQueries({ queryKey: [...contactKeys.detail(contactId), 'reminders'] });
      }
      // IMPORTANT: Invalidate job lists so reminder counts update in job cards
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
    },
  });
};

export const useDeleteReminder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reminderId, contactId }: { reminderId: string; contactId?: string }) =>
      api(`/api/reminders/${reminderId}`, { method: 'DELETE' }),
    onSuccess: (_, { contactId }) => {
      // Invalidate reminder-related queries
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      queryClient.invalidateQueries({ queryKey: contactKeys.upcomingReminders() });
      if (contactId) {
        queryClient.invalidateQueries({ queryKey: contactKeys.detail(contactId) });
        queryClient.invalidateQueries({ queryKey: [...contactKeys.detail(contactId), 'reminders'] });
      }
      // IMPORTANT: Invalidate contact lists so reminder counts update in contact cards
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
    },
  });
};