import {
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Select,
  SelectItem,
} from "@heroui/react";
import {
  ArrowClockwise,
  DotsThree,
  Eye,
  FunnelSimple,
  Lightning,
  Plus,
  Trash,
} from "@phosphor-icons/react";
import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import Button from "@/components/common/Button";
import TableList from "@/components/common/Table";
import type { ILogEntry } from "@/components/modals/ModalViewLog";
import type { EStatusUpload } from "@/enums/adminChat";

/**
 * Dataset item interface
 */
export interface ITableDataset {
  id: string;
  name: string;
  url: string;
  source: string;
  usedBy: string;
  lastUpdated: string;
  status: EStatusUpload;
  logs?: ILogEntry[];
}

interface DataSourceListProps {
  data: ITableDataset[];
  onViewDetail: (item: ITableDataset) => void;
  onViewLog: (item: ITableDataset) => void;
  onViewRealTimeLogs?: (item: ITableDataset) => void;
  onAddKnowledge: () => void;
  onRefresh?: () => void;
  refreshKey: number;
  hasProcessingItems?: boolean;
  // Pagination props
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  isLoading?: boolean;
  onPageChange?: (page: number) => void;
  onSearchChange?: (search: string) => void;
  onSourceFilterChange?: (source: string) => void;
  onStatusFilterChange?: (status: string) => void;
  // Current filter values
  currentSearchTerm?: string;
  currentSourceFilter?: string;
  currentStatusFilter?: string;
}

export default function DataSourceList({
  data,
  onViewDetail,
  onViewLog,
  onViewRealTimeLogs,
  onAddKnowledge,
  onRefresh,
  refreshKey,
  hasProcessingItems,
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  isLoading = false,
  onPageChange,
  onSearchChange,
  onSourceFilterChange,
  onStatusFilterChange,
  currentSearchTerm = "",
  currentSourceFilter = "all",
  currentStatusFilter = "all",
}: DataSourceListProps) {
  // Local search state for immediate UI update
  const [localSearchTerm, setLocalSearchTerm] = useState(currentSearchTerm);
  const [searchDebounceTimer, setSearchDebounceTimer] =
    useState<NodeJS.Timeout | null>(null);

  // Sync local state with prop when it changes
  useEffect(() => {
    setLocalSearchTerm(currentSearchTerm);
  }, [currentSearchTerm]);

  // Handle search change - immediate UI update with debounced API call
  const handleSearchChange = (value: string) => {
    // Update local state immediately for UI responsiveness
    setLocalSearchTerm(value);

    // Clear existing timer
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
    }

    // Set new timer for API call
    const timer = setTimeout(() => {
      onSearchChange?.(value);
    }, 500); // 500ms debounce for API call

    setSearchDebounceTimer(timer);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
      }
    };
  }, [searchDebounceTimer]);

  // Handle source filter change
  const handleSourceFilterChange = (source: string) => {
    onSourceFilterChange?.(source);
  };

  // Handle status filter change
  const handleStatusFilterChange = (status: string) => {
    onStatusFilterChange?.(status);
  };

  // Client-side filtering for immediate UI feedback (will be replaced by server data)
  const displayData = useMemo(() => {
    if (onSearchChange) {
      // If server-side filtering is enabled, just return the data as-is
      return data;
    }

    // Fallback to client-side filtering
    return data.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(localSearchTerm.toLowerCase()) ||
        item.url.toLowerCase().includes(localSearchTerm.toLowerCase());

      const matchesSource =
        currentSourceFilter === "all" || item.source === currentSourceFilter;

      const matchesStatus =
        currentStatusFilter === "all" ||
        (() => {
          if (currentStatusFilter === "completed")
            return item.logs?.some((log) => log.message.includes("✅"));
          if (currentStatusFilter === "failed")
            return item.logs?.some((log) => log.message.includes("❌"));
          if (currentStatusFilter === "processing")
            return item.logs?.some((log) => log.message.includes("🔄"));
          if (currentStatusFilter === "pending")
            return item.logs?.some((log) => log.message.includes("⏳"));
          return true;
        })();

      return matchesSearch && matchesSource && matchesStatus;
    });
  }, [
    data,
    localSearchTerm,
    currentSourceFilter,
    currentStatusFilter,
    onSearchChange,
  ]);

  /**
   * Handles re-sync of a dataset item
   * @param item Dataset item to re-sync
   */
  const handleReSync = (item: ITableDataset) => {
    console.log("Re-syncing item:", item.id);
    toast.success(`${item.name} re-sync started`);
    // TODO: Implement actual re-sync functionality
  };

  /**
   * Handles deletion of a dataset item
   * @param item Dataset item to delete
   */
  const handleDelete = (item: ITableDataset) => {
    console.log("Deleting item:", item.id);
    toast.success(`${item.name} deleted successfully`);
    // TODO: Implement actual delete functionality
  };

  /**
   * Renders source chip for an item
   * @param item Dataset item
   */
  const renderSourceChip = (item: ITableDataset) => (
    <Chip size="sm" variant="flat" color="primary">
      {item.source}
    </Chip>
  );

  /**
   * Renders used by tags for an item
   * @param item Dataset item
   */
  const renderUsedBy = (item: ITableDataset) => {
    const tags = item.usedBy.split(", ");
    return (
      <div className="flex flex-wrap gap-1">
        {tags.map((tag, index) => (
          <Chip key={index} size="sm" variant="flat" color="success">
            {tag}
          </Chip>
        ))}
      </div>
    );
  };

  /**
   * Renders clickable name with arrow - truncated for mobile
   * @param item Dataset item
   */
  const renderNameWithLink = (item: ITableDataset) => (
    <button
      type="button"
      className="text-left transition-colors hover:text-primary-500"
      onClick={() => onViewDetail(item)}
    >
      <div className="flex items-center gap-2">
        <span className="max-w-[200px] truncate sm:max-w-none">
          {item.name}
        </span>
        <span className="shrink-0 text-gray-400">›</span>
      </div>
    </button>
  );

  /**
   * Renders status chip with proper colors and icons
   * @param item Dataset item
   */
  const renderStatusChip = (item: ITableDataset) => {
    // Get original status from logs to show detailed status
    const latestLog = item.logs?.[item.logs.length - 1];
    let statusText = "Unknown";
    let color:
      | "default"
      | "primary"
      | "secondary"
      | "success"
      | "warning"
      | "danger" = "default";
    let icon = "";

    // Determine status from latest log message
    if (latestLog?.message.includes("🔄 Processing")) {
      statusText = "Processing";
      color = "primary";
      icon = "🔄";
    } else if (latestLog?.message.includes("⏳ Waiting")) {
      statusText = "Pending";
      color = "warning";
      icon = "⏳";
    } else if (latestLog?.message.includes("✅ Completed")) {
      statusText = "Completed";
      color = "success";
      icon = "✅";
    } else if (latestLog?.message.includes("❌ Failed")) {
      statusText = "Failed";
      color = "danger";
      icon = "❌";
    } else {
      statusText = "Created";
      color = "default";
      icon = "📄";
    }

    return (
      <Chip size="sm" variant="flat" color={color}>
        <span className="flex items-center gap-1">
          <span>{icon}</span>
          <span>{statusText}</span>
        </span>
      </Chip>
    );
  };

  /**
   * Renders action dropdown menu for an item
   * @param item Dataset item
   */
  const renderActionMenu = (item: ITableDataset) => (
    <Dropdown>
      <DropdownTrigger>
        <Button variant="light" size="xxs">
          <DotsThree size={25} />
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Actions">
        <DropdownItem
          key="resync"
          startContent={
            <ArrowClockwise size={20} className="text-primary-500" />
          }
          onPress={() => handleReSync(item)}
        >
          Re-sync
        </DropdownItem>
        <DropdownItem
          key="view"
          startContent={<Eye size={20} className="text-primary-500" />}
          onPress={() => onViewLog(item)}
        >
          View Log
        </DropdownItem>
        <DropdownItem
          key="viewRealTimeLogs"
          startContent={<Lightning size={20} className="text-primary-500" />}
          onPress={() => onViewRealTimeLogs?.(item)}
        >
          View Real-Time Logs
        </DropdownItem>
        <DropdownItem
          key="delete"
          startContent={<Trash size={20} className="text-danger-500" />}
          className="text-danger-500"
          onPress={() => handleDelete(item)}
        >
          Delete
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );

  // Table column definitions with responsive design
  const tableColumns = [
    {
      key: "name",
      label: "NAME",
      render: renderNameWithLink,
    },
    {
      key: "source",
      label: "SOURCE",
      render: renderSourceChip,
    },
    {
      key: "status",
      label: "STATUS",
      render: renderStatusChip,
    },
    {
      key: "usedBy",
      label: "USED BY",
      render: renderUsedBy,
    },
    {
      key: "lastUpdated",
      label: "LAST UPDATED",
    },
    {
      key: "action",
      label: "",
      render: renderActionMenu,
    },
  ];

  return (
    <div className="flex h-full flex-col">
      {/* Header section */}
      <div className="mb-6">
        <h1 className="mb-2 text-2xl font-semibold">Data sources</h1>
        <p className="mb-4 text-gray-600">
          Lyro will use the knowledge you add here to answer customer questions.
        </p>

        {/* Search and filter section - Mobile responsive */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Left side - Search and filters */}
          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
            <Input
              placeholder="Search by keyword or URL"
              className="w-full sm:w-64"
              value={localSearchTerm}
              isDisabled={isLoading}
              onChange={(e) => handleSearchChange(e.target.value)}
              startContent={
                <FunnelSimple size={16} className="text-gray-400" />
              }
            />

            <div className="flex flex-wrap items-center gap-2">
              <Select
                size="sm"
                placeholder="All Sources"
                className="w-32"
                selectedKeys={currentSourceFilter ? [currentSourceFilter] : []}
                isDisabled={isLoading}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  handleSourceFilterChange(selected || "all");
                }}
                items={[
                  { key: "all", label: "All Sources" },
                  { key: "Website", label: "Website" },
                  { key: "File", label: "File" },
                  { key: "Manual", label: "Manual" },
                ]}
              >
                {(item: any) => (
                  <SelectItem key={item.key}>{item.label}</SelectItem>
                )}
              </Select>

              <Select
                size="sm"
                placeholder="All Status"
                className="w-32"
                selectedKeys={currentStatusFilter ? [currentStatusFilter] : []}
                isDisabled={isLoading}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  handleStatusFilterChange(selected || "all");
                }}
                items={[
                  { key: "all", label: "All Status" },
                  { key: "completed", label: "Completed" },
                  { key: "processing", label: "Processing" },
                  { key: "pending", label: "Pending" },
                  { key: "failed", label: "Failed" },
                ]}
              >
                {(item: any) => (
                  <SelectItem key={item.key}>{item.label}</SelectItem>
                )}
              </Select>
            </div>
          </div>

        </div>
      </div>

      {/* Results section */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-600">
            {onSearchChange ? (
              // Server-side pagination
              <>
                Results: {displayData.length} of {totalItems}
                {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
              </>
            ) : (
              // Client-side filtering
              <>
                Results: {displayData.length}
                {displayData.length !== data.length && ` (of ${data.length})`}
              </>
            )}
          </div>
          {hasProcessingItems && (
            <div className="flex items-center gap-2">
              <div className="size-2 animate-pulse rounded-full bg-blue-500" />
              <span className="text-sm text-blue-600">
                {(() => {
                  const processingCount = data.filter((item) =>
                    item.logs?.some(
                      (log) =>
                        log.message.includes("🔄 Processing") ||
                        log.message.includes("⏳ Waiting"),
                    ),
                  ).length;
                  return `${processingCount} item${processingCount > 1 ? "s" : ""} processing...`;
                })()}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button
              size="sm"
              variant="light"
              startContent={<ArrowClockwise size={16} />}
              onPress={onRefresh}
              isLoading={isLoading}
            >
              Refresh
            </Button>
          )}
          <Button
            size="sm"
            startContent={<Plus size={20} />}
            color="primary"
            variant="light"
            onPress={onAddKnowledge}
          >
            Add
          </Button>
        </div>
      </div>

      {/* Data table - Flex-1 to take remaining space */}
      <div className="min-h-0 flex-1">
        <TableList
          data={displayData}
          columns={tableColumns}
          key={refreshKey}
          isLoading={isLoading}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}
