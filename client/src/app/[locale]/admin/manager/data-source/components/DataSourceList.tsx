import {
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
} from "@heroui/react";
import {
  ArrowClockwise,
  DotsThree,
  Eye,
  Lightning,
  Plus,
  Trash,
} from "@phosphor-icons/react";
import React from "react";
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
}: DataSourceListProps) {
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
   * Renders clickable name with arrow
   * @param item Dataset item
   */
  const renderNameWithLink = (item: ITableDataset) => (
    <button
      type="button"
      className="text-left transition-colors hover:text-primary-500"
      onClick={() => onViewDetail(item)}
    >
      <div className="flex items-center gap-2">
        <span>{item.name}</span>
        <span className="text-gray-400">›</span>
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

  // Table column definitions with status column
  const tableColumns = [
    { key: "name", label: "NAME", render: renderNameWithLink },
    { key: "source", label: "SOURCE", render: renderSourceChip },
    { key: "status", label: "STATUS", render: renderStatusChip },
    { key: "usedBy", label: "USED BY", render: renderUsedBy },
    { key: "lastUpdated", label: "LAST UPDATED" },
    { key: "action", label: "", render: renderActionMenu },
  ];

  return (
    <div>
      {/* Header section matching the UI */}
      <div className="mb-6">
        <h1 className="mb-2 text-2xl font-semibold">Data sources</h1>
        <p className="mb-4 text-gray-600">
          Lyro will use the knowledge you add here to answer customer questions.
        </p>

        {/* Search and filter section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Input placeholder="Search by keyword or URL" className="w-64" />
            <div className="flex items-center gap-2">
              <span className="text-sm">Show: All</span>
              <span className="text-sm">Sources: All</span>
              <span className="text-sm">Used by: All</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="light" size="sm">
              Test Lyro
            </Button>
            <Button color="primary" size="sm" onPress={onAddKnowledge}>
              Activate
            </Button>
          </div>
        </div>
      </div>

      {/* Results section */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-600">Results: {data.length}</div>
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

      {/* Data table */}
      <div>
        <TableList data={data} columns={tableColumns} key={refreshKey} />
      </div>
    </div>
  );
}
