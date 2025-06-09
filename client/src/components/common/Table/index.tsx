import {
  getKeyValue,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  type TableProps,
  TableRow,
} from "@heroui/react";
import { useMemo } from "react";

import { cn } from "@/libs/utils";

interface IProps extends TableProps {
  columns: {
    key: string;
    label: string;
    render?: (data: any) => JSX.Element;
    width?: string;
  }[];
  data: Iterable<unknown> | undefined;
  isLoading?: boolean;
  rowAction?: (row: any) => void;
  // Pagination props
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export default function TableList({
  data,
  columns,
  isLoading,
  rowAction,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  ...props
}: IProps) {
  const dataArray = Array.from(data || []);

  const bottomContent = useMemo(() => {
    // Server-side pagination - always show if onPageChange is provided
    if (onPageChange) {
      return (
        <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-200 bg-gray-50/50 px-6 py-4 sm:flex-row">
          <div className="text-sm font-medium text-gray-600">
            Page <span className="text-gray-900">{currentPage}</span> of{" "}
            <span className="text-gray-900">{totalPages || 1}</span>
            {totalPages > 1 && (
              <span className="ml-2 text-gray-500">
                ({dataArray.length} items shown)
              </span>
            )}
          </div>
          <Pagination
            isCompact
            showControls
            showShadow
            color="primary"
            page={currentPage}
            total={totalPages || 1}
            onChange={onPageChange}
            isDisabled={isLoading || totalPages <= 1}
            classNames={{
              wrapper: "gap-0 overflow-visible",
              item: "w-8 h-8 text-sm font-medium",
              cursor: "bg-primary-500 text-white font-semibold shadow-md",
            }}
          />
        </div>
      );
    }

    // Client-side pagination (fallback)
    return (
      <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-200 bg-gray-50/50 px-6 py-4 sm:flex-row">
        <div className="text-sm font-medium text-gray-600">
          Total <span className="text-gray-900">{dataArray.length}</span> item
          {dataArray.length !== 1 ? "s" : ""}
        </div>
        {dataArray.length > 10 && (
          <Pagination
            isCompact
            showControls
            showShadow
            color="primary"
            page={1}
            total={Math.ceil(dataArray.length / 10)}
            onChange={() => {}}
            classNames={{
              wrapper: "gap-0 overflow-visible",
              item: "w-8 h-8 text-sm font-medium",
              cursor: "bg-primary-500 text-white font-semibold shadow-md",
            }}
          />
        )}
      </div>
    );
  }, [dataArray.length, currentPage, totalPages, onPageChange]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-hidden">
        <Table
          classNames={{
            base: "h-full",
            wrapper: "h-full overflow-auto shadow-none",
            table: "min-w-full table-fixed", // Add table-fixed for consistent column widths
            thead: "sticky top-0 z-10 bg-white/95 backdrop-blur-sm",
            tbody: "overflow-auto",
          }}
          isHeaderSticky
          {...props}
          isStriped
          isLoading={isLoading}
          aria-label="Data sources table"
        >
          <TableHeader columns={columns}>
            {(column) => (
              <TableColumn
                key={column.key}
                className={cn(
                  "bg-gray-50/80 backdrop-blur-sm border-b border-gray-200 font-semibold text-gray-700 text-xs uppercase tracking-wider py-4 px-6",
                  // Make certain columns responsive
                  column.key === "usedBy" && "hidden sm:table-cell",
                  column.key === "lastUpdated" && "hidden md:table-cell",
                )}
                style={{ width: column.width }}
              >
                {column.label}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody
            emptyContent={
              <div className="py-16 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                  <svg
                    className="h-8 w-8 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div className="mb-2 text-lg font-medium text-gray-900">
                  No data sources found
                </div>
                <div className="text-sm text-gray-500">
                  Try adjusting your search criteria or add a new data source to get started
                </div>
              </div>
            }
            items={dataArray}
          >
            {(item: any) => (
              <TableRow
                onClick={() => rowAction && rowAction(item)}
                className={cn(
                  "border-b border-gray-100 hover:bg-gradient-to-r hover:from-primary-50/30 hover:to-blue-50/30 group/row-table transition-all duration-200 ease-in-out",
                  {
                    "cursor-pointer": !!rowAction,
                  },
                )}
                key={item.key || item.id}
              >
                {(columnKey) => {
                  const col = columns.find(
                    (column) => column.key === columnKey,
                  );

                  return (
                    <TableCell
                      className={cn(
                        "px-6 py-4 text-sm",
                        // Hide certain columns on mobile
                        columnKey === "usedBy" && "hidden sm:table-cell",
                        columnKey === "lastUpdated" && "hidden md:table-cell",
                        // Special styling for different column types
                        columnKey === "name" && "font-medium text-gray-900",
                        columnKey === "lastUpdated" && "text-gray-500 font-mono text-xs",
                      )}
                    >
                      {col?.render
                        ? col?.render(item)
                        : getKeyValue(item, columnKey)}
                    </TableCell>
                  );
                }}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Enhanced bottom pagination - only show if needed */}
      {(dataArray.length > 0 || isLoading) && bottomContent}
    </div>
  );
}
