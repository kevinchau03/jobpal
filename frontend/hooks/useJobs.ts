import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Reminder } from './useReminders';

// Types
export interface Job {
  id: string;
  title: string;
  company: string | null;
  location: string | null;
  jobType: 'PART_TIME' | 'FULL_TIME' | 'INTERNSHIP' | 'CONTRACT' | null;
  status: 'SAVED' | 'APPLIED' | 'SCREEN' | 'INTERVIEWING' | 'OFFER' | 'WITHDRAWN' | 'GHOSTED' | 'REJECTED';
  createdAt: string;
  reminders?: Reminder[];
  _count?: {
    reminders: number;
  };
}

export interface JobSummary {
  total: number;
  SAVED: number;
  APPLIED: number;
  SCREEN: number;
  INTERVIEWING: number;
  OFFER: number;
  WITHDRAWN: number;
  GHOSTED: number;
  REJECTED: number;
}

export interface CreateJobData {
  title: string;
  company?: string;
  location?: string;
  jobType?: Job['jobType'];
  status?: Job['status'];
}

// Filter types for job queries
export interface JobFilters {
  limit?: number;
  cursor?: string;
  status?: string;
}

// Re-export types from useReminders for backward compatibility
export type { Reminder, CreateReminderData } from './useReminders';

// Query Keys
export const jobKeys = {
  all: ['jobs'] as const,
  lists: () => [...jobKeys.all, 'list'] as const,
  list: (filters: JobFilters) => [...jobKeys.lists(), { filters }] as const,
  details: () => [...jobKeys.all, 'detail'] as const,
  detail: (id: string) => [...jobKeys.details(), id] as const,
  summary: () => [...jobKeys.all, 'summary'] as const,
};

// Hooks
export const useJobs = (params?: JobFilters) => {
  const queryParams = new URLSearchParams();
  if (params?.limit) queryParams.set('limit', params.limit.toString());
  if (params?.cursor) queryParams.set('cursor', params.cursor);
  if (params?.status) queryParams.set('status', params.status);
  
  const queryString = queryParams.toString();
  const url = `/api/jobs${queryString ? `?${queryString}` : ''}`;

  return useQuery({
    queryKey: jobKeys.list(params || {}),
    queryFn: () => api<{ items: Job[]; nextCursor: string | null }>(url),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useJob = (id: string) => {
  return useQuery({
    queryKey: jobKeys.detail(id),
    queryFn: () => api<Job>(`/api/jobs/${id}`),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useJobSummary = () => {
  return useQuery({
    queryKey: jobKeys.summary(),
    queryFn: () => api<JobSummary>('/api/jobs/summary'),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Mutations
export const useCreateJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateJobData) =>
      api<Job>('/api/jobs', {
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
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
      queryClient.invalidateQueries({ queryKey: jobKeys.summary() });
    },
  });
};

export const useUpdateJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateJobData> }) =>
      api<Job>(`/api/jobs/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: (data) => {
      // Update specific job in cache
      queryClient.setQueryData(jobKeys.detail(data.id), data);
      // Invalidate lists and summary
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
      queryClient.invalidateQueries({ queryKey: jobKeys.summary() });
    },
  });
};

export const useDeleteJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      api(`/api/jobs/${id}`, { method: 'DELETE' }),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: jobKeys.detail(deletedId) });
      // Invalidate lists and summary
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
      queryClient.invalidateQueries({ queryKey: jobKeys.summary() });
    },
  });
};

// Re-export reminder hooks from useReminders for backward compatibility
export {
  useReminders,
  useRemindersByJob,
  useRemindersByContact,
  useUpcomingReminders,
  useCreateReminder,
  useUpdateReminder,
  useDeleteReminder,
} from './useReminders';