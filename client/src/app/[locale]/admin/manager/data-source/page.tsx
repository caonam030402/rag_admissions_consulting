"use client";

import React, { useState } from "react";
import { DotsThree, Upload, Eye, Trash } from "@phosphor-icons/react";
import { 
  Chip, 
  useDisclosure, 
  Dropdown, 
  DropdownTrigger, 
  DropdownMenu, 
  DropdownItem 
} from "@heroui/react";
import toast from "react-hot-toast";

import Button from "@/components/common/Button";
import TableList from "@/components/common/Table";
import ModalUploadFile from "@/components/modals/ModalUploadFile";
import ModalViewLog from "@/components/modals/ModalViewLog";
import { uploadFiles } from "@/services/fileUpload";
import { EStatusUpload } from "@/enums/adminChat";
import { ILogEntry } from "@/components/modals/ModalViewLog";

/**
 * Dataset item interface
 */
interface ITableDataset {
  id: string;
  name: string;
  dimension: string;
  lmmEmbedding: string;
  createdBy: string;
  createdAt: string;
  status: EStatusUpload;
  logs?: ILogEntry[];
}

// Sample data for development and testing
const mockData: ITableDataset[] = [
  {
    id: "1",
    name: "Document A",
    dimension: "768",
    lmmEmbedding: "[0.12, -0.34, 0.56, ...]",
    createdBy: "Alice",
    status: EStatusUpload.UPLOADED,
    createdAt: "2025-04-17 10:30:00",
    logs: [
      { timestamp: "2025-04-17 10:29:30", message: "Starting document upload", type: "info" },
      { timestamp: "2025-04-17 10:29:45", message: "Validating document format", type: "info" },
      { timestamp: "2025-04-17 10:30:00", message: "Document uploaded successfully", type: "success" }
    ]
  },
  {
    id: "2",
    name: "Document B",
    dimension: "512",
    lmmEmbedding: "[0.23, 0.45, -0.67, ...]",
    createdBy: "Bob",
    status: EStatusUpload.FAILED,
    createdAt: "2025-04-16 15:45:00",
    logs: [
      { timestamp: "2025-04-16 15:44:30", message: "Starting document upload", type: "info" },
      { timestamp: "2025-04-16 15:44:45", message: "Validating document format", type: "info" },
      { timestamp: "2025-04-16 15:45:00", message: "Error: Invalid document format", type: "error" },
      { timestamp: "2025-04-16 15:45:00", message: "Upload failed: Please check file format and try again", type: "error" }
    ]
  },
  {
    id: "3",
    name: "Image X",
    dimension: "1024",
    lmmEmbedding: "[0.89, -0.12, 0.33, ...]",
    createdBy: "Charlie",
    status: EStatusUpload.UPLOADED,
    createdAt: "2025-04-15 08:20:00",
    logs: [
      { timestamp: "2025-04-15 08:19:30", message: "Starting image upload", type: "info" },
      { timestamp: "2025-04-15 08:19:45", message: "Validating image format", type: "info" },
      { timestamp: "2025-04-15 08:20:00", message: "Image uploaded successfully", type: "success" }
    ]
  },
  {
    id: "4",
    name: "Video Clip Y",
    dimension: "2048",
    lmmEmbedding: "[0.01, 0.77, -0.44, ...]",
    createdBy: "Diana",
    status: EStatusUpload.FAILED,
    createdAt: "2025-04-14 17:05:00",
    logs: [
      { timestamp: "2025-04-14 17:04:30", message: "Starting video upload", type: "info" },
      { timestamp: "2025-04-14 17:04:45", message: "Validating video format", type: "info" },
      { timestamp: "2025-04-14 17:05:00", message: "Error: File size exceeds limit", type: "error" },
      { timestamp: "2025-04-14 17:05:00", message: "Upload failed: File too large", type: "error" }
    ]
  },
  {
    id: "5",
    name: "Audio Sample Z",
    dimension: "384",
    lmmEmbedding: "[0.66, -0.33, 0.22, ...]",
    createdBy: "Ethan",
    status: EStatusUpload.UPLOADED,
    createdAt: "2025-04-13 12:00:00",
    logs: [
      { timestamp: "2025-04-13 11:59:30", message: "Starting audio upload", type: "info" },
      { timestamp: "2025-04-13 11:59:45", message: "Validating audio format", type: "info" },
      { timestamp: "2025-04-13 12:00:00", message: "Audio uploaded successfully", type: "success" }
    ]
  }
];

// Accepted file types for upload
const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  "text/plain",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/markdown",
  "text/html",
  "application/json",
];

/**
 * Data Source Management Page Component
 */
export default function DataSourcePage() {
  // Modal state management
  const uploadModal = useDisclosure();
  const logModal = useDisclosure();
  
  // State management
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedItem, setSelectedItem] = useState<ITableDataset | null>(null);
  
  /**
   * Handles file uploads to the server
   * @param files Files to upload
   */
  const handleUpload = async (files: File[]): Promise<any> => {
    try {
      const response = await uploadFiles(files, "/api/data-source/upload");
      
      // Refresh the data table after successful upload
      setRefreshKey(prev => prev + 1);
      
      return response;
    } catch (error) {
      console.error("Upload failed:", error);
      throw error;
    }
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
   * Handles deletion of a dataset item
   * @param item Dataset item to delete
   */
  const handleDelete = (item: ITableDataset) => {
    console.log("Deleting item:", item.id);
    toast.success(`${item.name} deleted successfully`);
    // TODO: Implement actual delete functionality
  };

  /**
   * Renders the status chip for an item
   * @param item Dataset item
   */
  const renderStatusChip = (item: ITableDataset) => {
    const statusColor = item.status === EStatusUpload.UPLOADED ? "success" : "danger";
    const statusText = item.status === EStatusUpload.UPLOADED ? "Uploaded" : "Failed";
    return <Chip size="sm" variant="flat" color={statusColor}>{statusText}</Chip>;
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
          key="view"
          startContent={<Eye size={20} className="text-primary-500" />}
          onPress={() => handleViewLog(item)}
        >
          View Log
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

  // Table column definitions
  const tableColumns = [
    { key: "name", label: "NAME" },
    { key: "dimension", label: "DIMENSION" },
    { key: "lmmEmbedding", label: "LMM EMBEDDING" },
    { key: "status", label: "STATUS", render: renderStatusChip },
    { key: "createdBy", label: "CREATED BY" },
    { key: "createdAt", label: "CREATED AT" },
    { key: "action", label: "ACTION", render: renderActionMenu },
  ];
  
  return (
    <div>
      {/* Header with title and upload button */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xl">Dataset</div>
        </div>
        <Button 
          size="sm" 
          startContent={<Upload size={20} />} 
          color="primary"
          onPress={uploadModal.onOpen}
        >
          Upload file
        </Button>
      </div>
      
      {/* Data table */}
      <div className="mt-5">
        <TableList
          data={mockData}
          columns={tableColumns}
          key={refreshKey}
        />
      </div>
      
      {/* Modals */}
      <ModalUploadFile 
        isOpen={uploadModal.isOpen} 
        onOpenChange={uploadModal.onOpenChange}
        onUpload={handleUpload}
        maxFileSize={5}
        acceptedFileTypes={ACCEPTED_FILE_TYPES}
      />
      
      <ModalViewLog 
        isOpen={logModal.isOpen}
        onOpenChange={logModal.onOpenChange}
        fileName={selectedItem?.name}
        status={selectedItem?.status}
        logs={selectedItem?.logs}
      />
    </div>
  );
}
