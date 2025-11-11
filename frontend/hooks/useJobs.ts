import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

// Types
export interface Job {
  id: string;
  title: string;
  company: string | null;
  location: string | null;
  jobType: 'PART_TIME' | 'FULL_TIME' | 'INTERNSHIP' | 'CONTRACT' | null;
  status: 'SAVED' | 'APPLIED' | 'SCREEN' | 'INTERVIEWING' | 'OFFER' | 'WITHDRAWN' | 'GHOSTED' | 'REJECTED';
  createdAt: string;
  reminders?: JobReminder[];
  _count?: {
    reminders: number;
  };
}

export interface JobReminder {
  id: string;
  title: string;
  description: string | null;
  type: 'FOLLOW_UP' | 'INTERVIEW' | 'ASSESSMENT' | 'DEADLINE' | 'CALL' | 'EMAIL' | 'OTHER';
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  dueDate: string;
  createdAt: string;
  updatedAt: string;
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

export interface CreateReminderData {
  title: string;
  description?: string;
  type: JobReminder['type'];
  dueDate: string;
}

// Query Keys
export const jobKeys = {
  all: ['jobs'] as const,
  lists: () => [...jobKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...jobKeys.lists(), { filters }] as const,
  details: () => [...jobKeys.all, 'detail'] as const,
  detail: (id: string) => [...jobKeys.details(), id] as const,
  summary: () => [...jobKeys.all, 'summary'] as const,
  reminders: () => [...jobKeys.all, 'reminders'] as const,
  upcomingReminders: (params?: { limit?: number; days?: number }) => 
    [...jobKeys.reminders(), 'upcoming', params] as const,
};

// Hooks
export const useJobs = (params?: { limit?: number; cursor?: string; status?: string }) => {
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

export const useUpcomingReminders = (params?: { limit?: number; days?: number }) => {
  const queryParams = new URLSearchParams();
  if (params?.limit) queryParams.set('limit', params.limit.toString());
  if (params?.days) queryParams.set('days', params.days.toString());
  
  const queryString = queryParams.toString();
  const url = `/api/jobs/reminders/upcoming${queryString ? `?${queryString}` : ''}`;

  return useQuery({
    queryKey: jobKeys.upcomingReminders(params),
    queryFn: () => api<(JobReminder & { job: { id: string; title: string; company: string | null } })[]>(url),
    staleTime: 1000 * 60 * 1, // 1 minute
  });
};

export const useJobReminders = (jobId: string) => {
  return useQuery({
    queryKey: [...jobKeys.detail(jobId), 'reminders'],
    queryFn: () => api<JobReminder[]>(`/api/jobs/${jobId}/reminders`),
    staleTime: 1000 * 60 * 2, // 2 minutes
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

export const useCreateReminder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobId, data }: { jobId: string; data: CreateReminderData }) =>
      api<JobReminder>(`/api/jobs/${jobId}/reminders`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: (_, { jobId }) => {
      // Invalidate job details and reminders
      queryClient.invalidateQueries({ queryKey: jobKeys.detail(jobId) });
      queryClient.invalidateQueries({ queryKey: [...jobKeys.detail(jobId), 'reminders'] });
      queryClient.invalidateQueries({ queryKey: jobKeys.upcomingReminders() });
      // IMPORTANT: Invalidate job lists so reminder counts update in job cards
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
    },
  });
};

export const useUpdateReminder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      jobId, 
      reminderId, 
      data 
    }: { 
      jobId: string; 
      reminderId: string; 
      data: Partial<CreateReminderData & { status: JobReminder['status'] }> 
    }) =>
      api<JobReminder>(`/api/jobs/${jobId}/reminders/${reminderId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: (_, { jobId }) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: jobKeys.detail(jobId) });
      queryClient.invalidateQueries({ queryKey: [...jobKeys.detail(jobId), 'reminders'] });
      queryClient.invalidateQueries({ queryKey: jobKeys.upcomingReminders() });
      // IMPORTANT: Invalidate job lists so reminder counts update in job cards
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
    },
  });
};

export const useDeleteReminder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobId, reminderId }: { jobId: string; reminderId: string }) =>
      api(`/api/jobs/${jobId}/reminders/${reminderId}`, { method: 'DELETE' }),
    onSuccess: (_, { jobId }) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: jobKeys.detail(jobId) });
      queryClient.invalidateQueries({ queryKey: [...jobKeys.detail(jobId), 'reminders'] });
      queryClient.invalidateQueries({ queryKey: jobKeys.upcomingReminders() });
      // IMPORTANT: Invalidate job lists so reminder counts update in job cards
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
    },
  });
};