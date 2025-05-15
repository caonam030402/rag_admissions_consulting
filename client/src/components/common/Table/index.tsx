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
}

export default function TableList({
  data,
  columns,
  isLoading,
  rowAction,
  ...props
}: IProps) {
  const bottomContent = useMemo(() => {
    return (
      <div className="flex items-center justify-between p-2">
        <div className="text-sm">Total 85 items</div>
        <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          page={2}
          total={2}
          onChange={() => {}}
        />
      </div>
    );
  }, []);

  return (
    <div>
      <Table
        classNames={{
          base: "max-h-[calc(100vh-200px)] scroll",
        }}
        isHeaderSticky
        {...props}
        isStriped
        aria-label="table-list"
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.key}>{column.label}</TableColumn>
          )}
        </TableHeader>
        <TableBody
          emptyContent={21312312321312}
          isLoading={isLoading}
          className="border"
          items={data || []}
        >
          {(item: any) => (
            <TableRow
              onClick={() => rowAction && rowAction(item)}
              className={cn("border-b hover:bg-primary-50/50 group/row-table", {
                "cursor-pointer": !!rowAction,
              })}
              key={item.key}
            >
              {(columnKey) => {
                const col = columns.find((column) => column.key === columnKey);
                return (
                  <TableCell>
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
      {bottomContent}
    </div>
  );
}
