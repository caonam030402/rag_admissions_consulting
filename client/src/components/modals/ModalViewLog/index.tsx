import React from "react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Button,
  Chip,
} from "@heroui/react";
import { FileText } from "@phosphor-icons/react";
import { EStatusUpload } from "@/enums/adminChat";

/**
 * Log entry interface for system logs
 */
export interface ILogEntry {
  /** Timestamp when log was created */
  timestamp: string;
  /** Log message content */
  message: string;
  /** Type of log entry - affects styling */
  type: 'info' | 'error' | 'success';
}

/**
 * Props for the ModalViewLog component
 */
export interface IModalViewLogProps {
  /** Controls modal visibility */
  isOpen: boolean;
  /** Callback when modal open state changes */
  onOpenChange: () => void;
  /** Name of the file to display in header */
  fileName?: string;
  /** Upload status - affects the status chip */
  status?: EStatusUpload;
  /** Array of log entries to display */
  logs?: ILogEntry[];
}

/**
 * Modal component for displaying file upload logs with color-coded entries
 */
export default function ModalViewLog({
  isOpen,
  onOpenChange,
  fileName,
  status,
  logs = [],
}: IModalViewLogProps) {
  /**
   * Get styling for a log entry based on its type
   */
  const getLogStyles = (type: ILogEntry['type']) => {
    const styles = {
      container: '',
      text: '',
    };
    
    switch (type) {
      case 'error':
        styles.container = 'bg-danger-50 border-l-4 border-danger-500';
        styles.text = 'text-danger-600';
        break;
      case 'success':
        styles.container = 'bg-success-50 border-l-4 border-success-500';
        styles.text = 'text-success-600';
        break;
      default: // info
        styles.container = 'bg-default-50 border-l-4 border-default-300';
        styles.text = 'text-default-600';
    }
    
    return styles;
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <FileText size={24} />
                <span>Logs for {fileName || 'Unknown File'}</span>
              </div>
              <div className="text-sm text-default-500">
                {status === EStatusUpload.UPLOADED ? (
                  <Chip size="sm" variant="flat" color="success">Uploaded</Chip>
                ) : (
                  <Chip size="sm" variant="flat" color="danger">Failed</Chip>
                )}
              </div>
            </ModalHeader>
            
            <ModalBody>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {logs.length > 0 ? (
                  logs.map((log, index) => {
                    const styles = getLogStyles(log.type);
                    
                    return (
                      <div
                        key={index}
                        className={`p-3 rounded-md ${styles.container}`}
                      >
                        <div className="flex justify-between">
                          <span className={`font-medium ${styles.text}`}>
                            {log.type.toUpperCase()}
                          </span>
                          <span className="text-xs text-default-500">{log.timestamp}</span>
                        </div>
                        <p className="mt-1 text-sm">{log.message}</p>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-8 text-center text-default-500">
                    No logs available for this item
                  </div>
                )}
              </div>
            </ModalBody>
            
            <ModalFooter>
              <Button color="primary" onPress={onOpenChange}>
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
} 