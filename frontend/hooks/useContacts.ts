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
  createdAt: string;
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

// Query Keys
export const contactKeys = {
  all: ['contacts'] as const,
  lists: () => [...contactKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...contactKeys.lists(), { filters }] as const,
  details: () => [...contactKeys.all, 'detail'] as const,
  detail: (id: string) => [...contactKeys.details(), id] as const,
  summary: () => [...contactKeys.all, 'summary'] as const,
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
