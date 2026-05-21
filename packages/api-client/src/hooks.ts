import useSWR, { SWRConfiguration } from 'swr';
import apiClient from './client';
import { PaginatedResponse } from './types';

// Generic fetcher
export const fetcher = (url: string) => apiClient.get(url).then((res) => res.data);

// Generic hooks
export function useGet<T>(url: string | null, config?: SWRConfiguration) {
  return useSWR<T>(url, fetcher, { revalidateOnFocus: false, ...config });
}

export function usePaginated<T>(url: string | null, config?: SWRConfiguration) {
  return useSWR<PaginatedResponse<T>>(url, fetcher, { revalidateOnFocus: false, ...config });
}

// Mutation helpers
export const apiPost = <T>(url: string, data?: unknown) =>
  apiClient.post<T>(url, data).then((res) => res.data);

export const apiPut = <T>(url: string, data?: unknown) =>
  apiClient.put<T>(url, data).then((res) => res.data);

export const apiPatch = <T>(url: string, data?: unknown) =>
  apiClient.patch<T>(url, data).then((res) => res.data);

export const apiDelete = <T>(url: string) =>
  apiClient.delete<T>(url).then((res) => res.data);
