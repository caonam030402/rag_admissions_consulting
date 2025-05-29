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
        <div className="flex flex-col items-center justify-between gap-2 p-2 sm:flex-row">
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages || 1}
            {totalPages > 1 && ` (${dataArray.length} items shown)`}
          </div>
          <Pagination
            isCompact
            showControls
            showShadow
            color="primary"
            page={currentPage}
            total={totalPages || 1}
            onChange={onPageChange}
            isDisabled={totalPages <= 1}
          />
        </div>
      );
    }

    // Client-side pagination (fallback)
    return (
      <div className="flex flex-col items-center justify-between gap-2 p-2 sm:flex-row">
        <div className="text-sm text-gray-600">
          Total {dataArray.length} item{dataArray.length !== 1 ? "s" : ""}
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
            wrapper: "h-full overflow-auto",
            table: "min-w-full",
            thead: "sticky top-0 z-10",
            tbody: "overflow-auto",
        }}
        isHeaderSticky
        {...props}
        isStriped
          aria-label="Data sources table"
      >
        <TableHeader columns={columns}>
          {(column) => (
              <TableColumn
                key={column.key}
                className={cn(
                  "bg-white/80 backdrop-blur-sm",
                  // Make certain columns responsive
                  column.key === "usedBy" && "hidden sm:table-cell",
                  column.key === "lastUpdated" && "hidden md:table-cell",
                )}
              >
                {column.label}
              </TableColumn>
          )}
        </TableHeader>
        <TableBody
            emptyContent={
              <div className="py-8 text-center">
                <div className="mb-2 text-gray-500">No data sources found</div>
                <div className="text-sm text-gray-400">
                  {isLoading
                    ? "Loading..."
                    : "Try adjusting your search or filters"}
                </div>
              </div>
            }
          isLoading={isLoading}
            items={dataArray || []}
        >
          {(item: any) => (
            <TableRow
              onClick={() => rowAction && rowAction(item)}
                className={cn(
                  "border-b hover:bg-primary-50/50 group/row-table transition-colors",
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
                        "px-3 py-2",
                        // Hide certain columns on mobile
                        columnKey === "usedBy" && "hidden sm:table-cell",
                        columnKey === "lastUpdated" && "hidden md:table-cell",
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

      {/* Bottom pagination - only show if needed */}
      {dataArray.length > 0 && bottomContent}
    </div>
  );
}
