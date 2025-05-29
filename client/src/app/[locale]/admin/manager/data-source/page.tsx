"use client";

import { useDisclosure } from "@heroui/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import React, { useState } from "react";
import toast from "react-hot-toast";

import ModalAddKnowledge from "@/components/modals/ModalAddKnowledge";
import ModalRealTimeLogs from "@/components/modals/ModalRealTimeLogs";
import ModalViewLog from "@/components/modals/ModalViewLog";
import { EStatusUpload } from "@/enums/adminChat";
import { useDataSourceWebSocket } from "@/hooks/useDataSourceWebSocket";
import {
  type CreateDataSourceRequest,
  type DataSource,
  useDataSources,
  useRefreshDataSources,
  useUploadDataSource,
} from "@/services/dataSource";

import DataSourceDetail from "./components/DataSourceDetail";
import DataSourceList, {
  type ITableDataset,
} from "./components/DataSourceList";

// Helper function for log type
const getLogType = (status: string): "success" | "error" | "info" => {
  if (status === "completed") return "success";
  if (status === "failed") return "error";
  return "info";
};

// Convert DataSource to ITableDataset format
const convertToTableDataset = (dataSource: DataSource): ITableDataset => {
  const getSourceType = (type: string) => {
    switch (type) {
      case "web_crawl":
        return "Website";
      case "file_upload":
        return "File";
      case "manual_input":
        return "Manual";
      default:
        return "Unknown";
    }
  };

  // Updated status mapping to handle all states
  const getStatus = (status: string): EStatusUpload => {
    switch (status) {
      case "completed":
        return EStatusUpload.UPLOADED;
      case "failed":
        return EStatusUpload.FAILED;
      case "processing":
      case "pending":
        return EStatusUpload.UPLOADING; // Show as uploading for processing states
      default:
        return EStatusUpload.UPLOADED;
    }
  };

  // Enhanced status message for logs
  const getStatusMessage = (ds: DataSource) => {
    if (ds.status === "processing") {
      return "🔄 Processing in progress...";
    }
    if (ds.status === "pending") {
      return "⏳ Waiting to process...";
    }
    if (ds.status === "completed") {
      return `✅ Completed: ${ds.documentsCount || 0} docs, ${ds.vectorsCount || 0} vectors`;
    }
    if (ds.status === "failed") {
      return `❌ Failed: ${ds.errorMessage || "Unknown error"}`;
    }
    return "📄 Created";
  };

  return {
    id: dataSource.id,
    name: dataSource.name,
    url: dataSource.sourceUrl || "",
    source: getSourceType(dataSource.type),
    usedBy: "RAG System",
    status: getStatus(dataSource.status),
    lastUpdated: new Date(dataSource.updatedAt).toLocaleString(),
    logs: [
      {
        timestamp: new Date(dataSource.createdAt).toLocaleString(),
        message: "📄 Data source created",
        type: "info" as const,
      },
      ...(dataSource.processingStartedAt
        ? [
      {
              timestamp: new Date(
                dataSource.processingStartedAt,
              ).toLocaleString(),
              message: "🚀 Processing started",
              type: "info" as const,
      },
          ]
        : []),
      // Only show completion/status log for current status
      ...(dataSource.status === "processing" ||
      dataSource.status === "pending" ||
      (dataSource.status === "completed" && dataSource.processingCompletedAt) ||
      (dataSource.status === "failed" && dataSource.processingCompletedAt)
        ? [
      {
              timestamp: dataSource.processingCompletedAt
                ? new Date(dataSource.processingCompletedAt).toLocaleString()
                : new Date().toLocaleString(),
              message: getStatusMessage(dataSource),
              type: getLogType(dataSource.status),
      },
          ]
        : []),
    ],
  };
};

/**
 * Data Source Management Page Component
 */
export default function DataSourcePage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Modal state management
  const addKnowledgeModal = useDisclosure();
  const logModal = useDisclosure();
  const realTimeLogsModal = useDisclosure();

  // WebSocket for real-time logs
  const { isConnected, getLogsForDataSource, clearAllLogs } =
    useDataSourceWebSocket();

  // State management
  const [selectedItem, setSelectedItem] = useState<ITableDataset | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "detail">("list");
  const [selectedDataSource, setSelectedDataSource] =
    useState<ITableDataset | null>(null);

  // Get parameters from URL
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const searchTerm = searchParams.get("search") || "";
  const sourceFilter = searchParams.get("source") || "all";
  const statusFilter = searchParams.get("status") || "all";

  // Query and mutations
  const {
    data: dataSourcesResponse,
    isLoading,
    error,
    refetch,
  } = useDataSources(
    {
      pagination: {
        page: currentPage,
        limit: 10, // Match backend default
      },
      filters: {
        ...(searchTerm && { search: searchTerm }),
        ...(sourceFilter && sourceFilter !== "all" && { source: sourceFilter }),
        ...(statusFilter && statusFilter !== "all" && { status: statusFilter }),
      },
    },
    true,
  ); // Enable auto-polling

  const refreshDataSources = useRefreshDataSources();
  const uploadMutation = useUploadDataSource();

  // Check if any data sources are processing
  const hasProcessingItems =
    dataSourcesResponse?.data?.some(
      (item) => item.status === "processing" || item.status === "pending",
    ) || false;

  // Convert API response to table format
  const tableData: ITableDataset[] = dataSourcesResponse?.data
    ? dataSourcesResponse.data.map(convertToTableDataset)
    : [];

  // Use pagination info from API response
  const totalPages = dataSourcesResponse?.totalPages || 1;
  const totalItems = dataSourcesResponse?.totalItems || 0;

  // Debug logging
  console.log("🔍 Debug Info:", {
    searchTerm,
    sourceFilter,
    statusFilter,
    currentPage,
    apiResponse: dataSourcesResponse,
    totalItems,
    totalPages,
    dataLength: tableData.length,
  });

  /**
   * Handles adding new knowledge
   * @param data Knowledge data to add
   */
  const handleAddKnowledge = async (data: any): Promise<void> => {
    try {
      // Prepare upload data
      const uploadData: CreateDataSourceRequest = {
        type: data.type,
        name: data.name || `${data.type} - ${new Date().toLocaleString()}`,
        description: data.description,
        url: data.url,
        title: data.title,
        content: data.content,
        file: data.file,
        uploaderEmail: session?.user?.email || "",
        uploadedBy: session?.user?.id || "",
        metadata: {
          uploadedAt: new Date().toISOString(),
          userAgent: navigator.userAgent,
        },
      };

      // Call upload mutation
      await uploadMutation.mutateAsync(uploadData);

      toast.success("Knowledge source uploaded successfully!");
    } catch (uploadError: any) {
      console.error("Failed to add knowledge:", uploadError);
      toast.error(uploadError.message || "Failed to upload knowledge source");
      throw uploadError;
    }
  };

  /**
   * Handles page change
   * @param page New page number
   */
  const handlePageChange = (page: number) => {
    router.push(
      `${pathname}?page=${page}&search=${searchTerm}&source=${sourceFilter}&status=${statusFilter}`,
    );
  };

  /**
   * Handles search term change with debounce
   * @param search New search term
   */
  const handleSearchChange = (search: string) => {
    router.push(
      `${pathname}?page=1&search=${encodeURIComponent(search)}&source=${sourceFilter}&status=${statusFilter}`,
    );
  };

  /**
   * Handles source filter change
   * @param source New source filter
   */
  const handleSourceFilterChange = (source: string) => {
    router.push(
      `${pathname}?page=1&search=${encodeURIComponent(searchTerm)}&source=${source}&status=${statusFilter}`,
    );
  };

  /**
   * Handles status filter change
   * @param status New status filter
   */
  const handleStatusFilterChange = (status: string) => {
    router.push(
      `${pathname}?page=1&search=${encodeURIComponent(searchTerm)}&source=${sourceFilter}&status=${status}`,
    );
  };

  /**
   * Handles clicking on data source name to view details
   * @param item Dataset item to view details for
   */
  const handleViewDetail = (item: ITableDataset) => {
    setSelectedDataSource(item);
    setViewMode("detail");
  };

  /**
   * Handles going back to list view
   */
  const handleBackToList = () => {
    setViewMode("list");
    setSelectedDataSource(null);
  };

  /**
   * Opens log modal for the selected item
   * @param item Dataset item to view logs for
   */
  const handleViewLog = (item: ITableDataset) => {
    setSelectedItem(item);
    logModal.onOpen();
  };

  /**
   * Opens real-time logs modal for the selected item
   * @param item Dataset item to view real-time logs for
   */
  const handleViewRealTimeLogs = (item: ITableDataset) => {
    setSelectedItem(item);
    realTimeLogsModal.onOpen();
  };

  /**
   * Opens add knowledge modal
   */
  const handleOpenAddKnowledge = () => {
    addKnowledgeModal.onOpen();
  };

  /**
   * Manual refresh function
   */
  const handleRefresh = () => {
    refreshDataSources();
    toast.success("Data refreshed!");
  };

  // Handle error state
  if (error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center">
        <div className="mb-4 text-lg text-red-600">
          Failed to load data sources
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          className="rounded bg-primary-500 px-4 py-2 text-white hover:bg-primary-600"
        >
          Retry
        </button>
      </div>
    );
  }

  // Show detail view if in detail mode
  if (viewMode === "detail" && selectedDataSource) {
    return (
      <DataSourceDetail
        dataSource={{
          ...selectedDataSource,
          totalQuestions: 133, // TODO: Get from API
          questions: [], // TODO: Load from API
        }}
        onBack={handleBackToList}
        onAddKnowledge={handleAddKnowledge}
      />
    );
  }

  // Show list view
  return (
    <div>
      <DataSourceList
        data={tableData}
        onViewDetail={handleViewDetail}
        onViewLog={handleViewLog}
        onViewRealTimeLogs={handleViewRealTimeLogs}
        onAddKnowledge={handleOpenAddKnowledge}
        onRefresh={handleRefresh}
        hasProcessingItems={hasProcessingItems}
        refreshKey={0} // Not needed with React Query
        // Pagination props
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        isLoading={isLoading}
        onPageChange={handlePageChange}
        onSearchChange={handleSearchChange}
        onSourceFilterChange={handleSourceFilterChange}
        onStatusFilterChange={handleStatusFilterChange}
        // Current filter values from URL
        currentSearchTerm={searchTerm}
        currentSourceFilter={sourceFilter}
        currentStatusFilter={statusFilter}
      />

      {/* Modals */}
      <ModalAddKnowledge
        isOpen={addKnowledgeModal.isOpen}
        onOpenChange={addKnowledgeModal.onOpenChange}
        onAdd={handleAddKnowledge}
      />

      <ModalViewLog
        isOpen={logModal.isOpen}
        onOpenChange={logModal.onOpenChange}
        fileName={selectedItem?.name}
        status={selectedItem?.status}
        logs={selectedItem?.logs}
      />

      <ModalRealTimeLogs
        isOpen={realTimeLogsModal.isOpen}
        onOpenChange={realTimeLogsModal.onOpenChange}
        dataSourceId={selectedItem?.id || ""}
        dataSourceName={selectedItem?.name || ""}
        logs={selectedItem ? getLogsForDataSource(selectedItem.id) : []}
        isConnected={isConnected}
        onClearAllLogs={clearAllLogs}
      />
    </div>
  );
}
