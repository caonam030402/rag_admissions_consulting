import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import React from "react";

import { ENameCookie } from "@/constants/common";
import type { IQueryGetApi } from "@/types";
import http from "@/utils/http";

// Types
export interface DataSource {
    id: string;
    name: string;
    description?: string;
    type: "web_crawl" | "file_upload" | "manual_input";
    sourceUrl?: string;
    filePath?: string;
    status: "pending" | "processing" | "completed" | "failed";
    documentsCount: number;
    vectorsCount: number;
    uploadedBy: string;
    uploaderEmail: string;
    processingStartedAt?: string;
    processingCompletedAt?: string;
    errorMessage?: string;
    metadata?: Record<string, any>;
    createdAt: string;
    updatedAt: string;
}

export interface CreateDataSourceRequest {
    type: "website" | "pdf" | "csv" | "manual";
    name: string;
    description?: string;
    url?: string; // for website
    title?: string; // for manual
    content?: string; // for manual
    file?: File; // for pdf/csv
    uploaderEmail?: string;
    uploadedBy?: string;
    metadata?: Record<string, any>;
}

export interface DataSourceListResponse {
    data: DataSource[];
    hasNextPage: boolean;
    totalItems: number;
    totalPages: number;
    currentPage: number;
}

// Query Keys
export const DATA_SOURCE_QUERY_KEYS = {
    all: ["data-sources"] as const,
    lists: () => [...DATA_SOURCE_QUERY_KEYS.all, "list"] as const,
    list: (params: any) => [...DATA_SOURCE_QUERY_KEYS.lists(), params] as const,
    details: () => [...DATA_SOURCE_QUERY_KEYS.all, "detail"] as const,
    detail: (id: string) => [...DATA_SOURCE_QUERY_KEYS.details(), id] as const,
};

// API Endpoints
const ENDPOINTS = {
    DATA_SOURCES: "data-sources",
    UPLOAD: "data-sources/upload",
    PROCESS: (id: string) => `data-sources/${id}/process`,
};

// Service Functions
export const dataSourceService = {
    // Get all data sources with pagination
    async getDataSources(query: IQueryGetApi) {
        const params = new URLSearchParams();

        // Add pagination
        if (query.pagination?.page) {
            params.append('page', query.pagination.page.toString());
        }
        if (query.pagination?.limit) {
            params.append('limit', query.pagination.limit.toString());
        }

        // Add filters directly as expected by DataSource API
        if (query.filters?.search) {
            params.append('search', query.filters.search);
        }
        if (query.filters?.source) {
            params.append('source', query.filters.source);
        }
        if (query.filters?.status) {
            params.append('status', query.filters.status);
        }

        console.log('🔍 API Query:', query);
        console.log('🔧 Filters Detail:', {
            hasFilters: !!query.filters,
            search: query.filters?.search,
            source: query.filters?.source,
            status: query.filters?.status,
            searchLength: query.filters?.search?.length,
        });
        console.log('🌐 API URL:', `${ENDPOINTS.DATA_SOURCES}?${params.toString()}`);

        const response = await http.get<DataSourceListResponse>(
            `${ENDPOINTS.DATA_SOURCES}?${params.toString()}`,
        );

        console.log('📊 API Response:', response.payload);
        console.log('📊 Response Detail:', {
            hasData: !!response.payload?.data,
            dataLength: response.payload?.data?.length,
            totalItems: response.payload?.totalItems,
            totalPages: response.payload?.totalPages,
            currentPage: response.payload?.currentPage,
        });

        return response.payload;
    },

    // Get single data source
    async getDataSource(id: string) {
        const response = await http.get<DataSource>(
            `${ENDPOINTS.DATA_SOURCES}/${id}`,
        );
        return response.payload;
    },

    // Universal upload function
    async uploadDataSource(data: CreateDataSourceRequest) {
        const formData = new FormData();

        // Add required fields
        formData.append("type", data.type);
        formData.append("name", data.name);

        // Add optional fields
        if (data.description) {
            formData.append("description", data.description);
        }

        if (data.url) {
            formData.append("url", data.url);
        }

        if (data.title) {
            formData.append("title", data.title);
        }

        if (data.content) {
            formData.append("content", data.content);
        }

        if (data.file) {
            formData.append("file", data.file);
        }

        if (data.uploaderEmail) {
            formData.append("uploaderEmail", data.uploaderEmail);
        }

        if (data.uploadedBy) {
            formData.append("uploadedBy", data.uploadedBy);
        }

        if (data.metadata) {
            formData.append("metadata", JSON.stringify(data.metadata));
        }

        // Get token for authorization
        const token = Cookies.get(ENameCookie.ACCESS_TOKEN);

        // Use fetch directly for multipart/form-data
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}${ENDPOINTS.UPLOAD}`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            },
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || "Upload failed");
        }

        return response.json();
    },

    // Process data source manually
    async processDataSource(id: string) {
        const response = await http.post<DataSource>(ENDPOINTS.PROCESS(id), {});
        return response.payload;
    },

    // Delete data source
    async deleteDataSource(id: string) {
        const response = await http.delete<void>(
            `${ENDPOINTS.DATA_SOURCES}/${id}`,
            {},
        );
        return response.payload;
    },
};

// React Query Hooks
export function useDataSources(
    query: IQueryGetApi = { pagination: { page: 1, limit: 10 } },
    enablePolling = true, // Auto-poll for status updates
) {
    const result = useQuery({
        queryKey: DATA_SOURCE_QUERY_KEYS.list(query),
        queryFn: () => dataSourceService.getDataSources(query),
        staleTime: 30 * 1000, // 30 seconds for polling
        refetchInterval: enablePolling ? 10 * 1000 : false, // Poll every 10 seconds if enabled
        refetchIntervalInBackground: false, // Only poll when tab is active
    });

    // Auto-disable polling when no processing items
    React.useEffect(() => {
        if (result.data?.data) {
            const hasProcessingItems = result.data.data.some(
                (item) => item.status === "processing" || item.status === "pending"
            );

            // If no processing items, disable polling temporarily
            if (!hasProcessingItems && enablePolling) {
                // You can add custom logic here if needed
            }
        }
    }, [result.data, enablePolling]);

    return result;
}

export function useDataSource(id: string, enabled = true) {
    return useQuery({
        queryKey: DATA_SOURCE_QUERY_KEYS.detail(id),
        queryFn: () => dataSourceService.getDataSource(id),
        enabled: !!id && enabled,
        staleTime: 2 * 60 * 1000, // 2 minutes
        refetchInterval: (data) => {
            // Poll every 5 seconds if status is processing/pending
            if (data?.status === "processing" || data?.status === "pending") {
                return 5 * 1000;
            }
            return false;
        },
        refetchIntervalInBackground: false,
    });
}

export function useUploadDataSource() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: dataSourceService.uploadDataSource,
        onSuccess: () => {
            // Invalidate and refetch data sources list
            queryClient.invalidateQueries({
                queryKey: DATA_SOURCE_QUERY_KEYS.lists(),
            });
        },
    });
}

export function useProcessDataSource() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: dataSourceService.processDataSource,
        onSuccess: (data) => {
            // Update specific data source
            queryClient.setQueryData(DATA_SOURCE_QUERY_KEYS.detail(data.id), data);

            // Invalidate lists to refetch
            queryClient.invalidateQueries({
                queryKey: DATA_SOURCE_QUERY_KEYS.lists(),
            });
        },
    });
}

export function useDeleteDataSource() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: dataSourceService.deleteDataSource,
        onSuccess: (_, deletedId) => {
            // Remove from cache
            queryClient.removeQueries({
                queryKey: DATA_SOURCE_QUERY_KEYS.detail(deletedId),
            });

            // Invalidate lists
            queryClient.invalidateQueries({
                queryKey: DATA_SOURCE_QUERY_KEYS.lists(),
            });
        },
    });
}

// Manual refresh hook
export function useRefreshDataSources() {
    const queryClient = useQueryClient();

    return React.useCallback(() => {
        queryClient.invalidateQueries({
            queryKey: DATA_SOURCE_QUERY_KEYS.lists(),
        });
    }, [queryClient]);
}
