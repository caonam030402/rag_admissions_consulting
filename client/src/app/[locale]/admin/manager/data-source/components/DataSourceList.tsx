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
  Lightning,
  LinkSimple,
  MagnifyingGlass,
  Plus,
  Trash,
} from "@phosphor-icons/react";
import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import Button from "@/components/common/Button";
import Card from "@/components/common/Card";
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
  const renderSourceChip = (item: ITableDataset) => {
    const getSourceColor = (source: string) => {
      switch (source) {
        case "Website":
          return "primary";
        case "File":
          return "success";
        case "Manual":
          return "warning";
        default:
          return "default";
      }
    };

    return (
      <Chip
        size="sm"
        variant="flat"
        color={getSourceColor(item.source)}
        className="font-medium"
      >
        {item.source}
      </Chip>
    );
  };

  /**
   * Renders the 'Used By' cell
   * @param item Dataset item
   */
  const renderUsedBy = (item: ITableDataset) => {
    return (
      <div className="flex items-center gap-2">
        <div className="size-2 rounded-full bg-green-500" />
        <span className="text-sm font-medium text-gray-700">{item.usedBy}</span>
      </div>
    );
  };

  /**
   * Renders name with clickable link for viewing details
   * @param item Dataset item
   */
  const renderNameWithLink = (item: ITableDataset) => (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={() => onViewDetail(item)}
        className="text-left text-sm font-semibold text-blue-600 transition-colors hover:text-blue-800 hover:underline"
      >
        {item.name}
      </button>
      {item.url && (
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <LinkSimple size={12} />
          <span className="max-w-[200px] truncate">{item.url}</span>
        </div>
      )}
    </div>
  );

  /**
   * Renders status chip with appropriate color and icon
   * @param item Dataset item
   */
  const renderStatusChip = (item: ITableDataset) => {
    const getStatusConfig = (logs: ILogEntry[] | undefined) => {
      if (!logs || logs.length === 0)
        return { color: "default", text: "Unknown", icon: "⚪" };

      const lastLog = logs[logs.length - 1];

      if (lastLog.message.includes("✅")) {
        return { color: "success", text: "Completed", icon: "✅" };
      }
      if (lastLog.message.includes("❌")) {
        return { color: "danger", text: "Failed", icon: "❌" };
      }
      if (lastLog.message.includes("🔄")) {
        return { color: "primary", text: "Processing", icon: "🔄" };
      }
      if (lastLog.message.includes("⏳")) {
        return { color: "warning", text: "Pending", icon: "⏳" };
      }

      return { color: "default", text: "Created", icon: "📄" };
    };

    const { color, text, icon } = getStatusConfig(item.logs);

    return (
      <Chip
        size="sm"
        variant="flat"
        color={color as any}
        className="font-medium"
        startContent={<span className="text-xs">{icon}</span>}
      >
        {text}
      </Chip>
    );
  };

  /**
   * Renders action menu dropdown for each row
   * @param item Dataset item
   */
  const renderActionMenu = (item: ITableDataset) => (
    <Dropdown>
      <DropdownTrigger>
        <Button
          isIconOnly
          size="sm"
          variant="light"
          className="size-8 min-w-8 rounded-full transition-colors hover:bg-gray-100"
        >
          <DotsThree size={16} weight="bold" />
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Actions" className="border shadow-lg">
        <DropdownItem
          key="viewLog"
          startContent={<Eye size={16} className="text-gray-600" />}
          onPress={() => onViewLog(item)}
          className="hover:bg-gray-50"
        >
          View Log
        </DropdownItem>
        <DropdownItem
          key="viewRealTimeLogs"
          startContent={<Lightning size={16} className="text-primary-500" />}
          onPress={() => onViewRealTimeLogs?.(item)}
          className="hover:bg-primary-50"
        >
          View Real-Time Logs
        </DropdownItem>
        <DropdownItem
          key="delete"
          startContent={<Trash size={16} className="text-danger-500" />}
          className="text-danger-500 hover:bg-danger-50"
          onPress={() => handleDelete(item)}
        >
          Delete
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );

  // Table column definitions with fixed widths to prevent layout shift
  const tableColumns = [
    {
      key: "name",
      label: "NAME",
      render: renderNameWithLink,
      width: "35%", // Main content column
    },
    {
      key: "source",
      label: "SOURCE",
      render: renderSourceChip,
      width: "12%", // Fixed for chip
    },
    {
      key: "status",
      label: "STATUS",
      render: renderStatusChip,
      width: "15%", // Fixed for status chip
    },
    {
      key: "usedBy",
      label: "USED BY",
      render: renderUsedBy,
      width: "15%", // Fixed for used by
    },
    {
      key: "lastUpdated",
      label: "LAST UPDATED",
      width: "18%", // Fixed for date
    },
    {
      key: "action",
      label: "",
      render: renderActionMenu,
      width: "5%", // Fixed for action button
    },
  ];

  return (
    <div className="flex h-full flex-col space-y-4">
      {/* Results section with search query */}
      <Card>
        <div className="flex justify-between">
          <div className="flex items-center gap-4">
            <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center">
              <Input
                placeholder="Search by keyword or URL..."
                className="w-full sm:w-80"
                value={localSearchTerm}
                isDisabled={isLoading}
                onChange={(e) => handleSearchChange(e.target.value)}
                startContent={
                  <MagnifyingGlass size={18} className="text-gray-400" />
                }
                size="md"
              />

              <div className="flex flex-wrap items-center gap-3">
                <Select
                  size="md"
                  placeholder="All Sources"
                  className="w-40"
                  selectedKeys={
                    currentSourceFilter ? [currentSourceFilter] : []
                  }
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
                  size="md"
                  placeholder="All Status"
                  className="w-40"
                  selectedKeys={
                    currentStatusFilter ? [currentStatusFilter] : []
                  }
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

            {hasProcessingItems && (
              <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2">
                <div className="size-2 animate-pulse rounded-full bg-blue-500" />
                <span className="text-sm font-medium text-blue-700">
                  {(() => {
                    const processingCount = data.filter((item) =>
                      item.logs?.some(
                        (log) =>
                          log.message.includes("🔄 Processing") ||
                          log.message.includes("⏳ Waiting"),
                      ),
                    ).length;
                    return `${processingCount} item${processingCount > 1 ? "s" : ""} processing`;
                  })()}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {onRefresh && (
              <Button
                size="md"
                variant="bordered"
                startContent={<ArrowClockwise size={18} />}
                onPress={onRefresh}
                isLoading={isLoading}
                className="border-gray-300 font-medium transition-colors hover:border-gray-400 hover:bg-gray-50"
              >
                Refresh
              </Button>
            )}
            <Button
              size="md"
              startContent={<Plus size={20} />}
              color="primary"
              onPress={onAddKnowledge}
              className="from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 bg-gradient-to-r font-semibold shadow-md transition-shadow hover:shadow-lg"
            >
              Add Source
            </Button>
          </div>
        </div>
      </Card>

      {/* Enhanced Data table with modern styling */}
      <div className="">
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
