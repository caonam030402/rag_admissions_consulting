"use client";

import { DotsThree, Upload } from "@phosphor-icons/react";
import React from "react";

import Button from "@/components/common/Button";
import TableList from "@/components/common/Table";

interface ITableDataset {
  id: string;
  name: string;
  dimension: string;
  lmmEmbedding: string;
  createdBy: string;
  createdAt: string;
}

const mockData = [
  {
    id: "1",
    name: "Document A",
    dimension: 768,
    lmmEmbedding: "[0.12, -0.34, 0.56, ...]",
    createdBy: "Alice",
    createdAt: "2025-04-17 10:30:00",
  },
  {
    id: "2",
    name: "Document B",
    dimension: 512,
    lmmEmbedding: "[0.23, 0.45, -0.67, ...]",
    createdBy: "Bob",
    createdAt: "2025-04-16 15:45:00",
  },
  {
    id: "3",
    name: "Image X",
    dimension: 1024,
    lmmEmbedding: "[0.89, -0.12, 0.33, ...]",
    createdBy: "Charlie",
    createdAt: "2025-04-15 08:20:00",
  },
  {
    id: "4",
    name: "Video Clip Y",
    dimension: 2048,
    lmmEmbedding: "[0.01, 0.77, -0.44, ...]",
    createdBy: "Diana",
    createdAt: "2025-04-14 17:05:00",
  },
  {
    id: "5",
    name: "Audio Sample Z",
    dimension: 384,
    lmmEmbedding: "[0.66, -0.33, 0.22, ...]",
    createdBy: "Ethan",
    createdAt: "2025-04-13 12:00:00",
  },
  {
    id: "5",
    name: "Audio Sample Z",
    dimension: 384,
    lmmEmbedding: "[0.66, -0.33, 0.22, ...]",
    createdBy: "Ethan",
    createdAt: "2025-04-13 12:00:00",
  },
  {
    id: "5",
    name: "Audio Sample Z",
    dimension: 384,
    lmmEmbedding: "[0.66, -0.33, 0.22, ...]",
    createdBy: "Ethan",
    createdAt: "2025-04-13 12:00:00",
  },
  {
    id: "5",
    name: "Audio Sample Z",
    dimension: 384,
    lmmEmbedding: "[0.66, -0.33, 0.22, ...]",
    createdBy: "Ethan",
    createdAt: "2025-04-13 12:00:00",
  },
  {
    id: "5",
    name: "Audio Sample Z",
    dimension: 384,
    lmmEmbedding: "[0.66, -0.33, 0.22, ...]",
    createdBy: "Ethan",
    createdAt: "2025-04-13 12:00:00",
  },
  {
    id: "4",
    name: "Video Clip Y",
    dimension: 2048,
    lmmEmbedding: "[0.01, 0.77, -0.44, ...]",
    createdBy: "Diana",
    createdAt: "2025-04-14 17:05:00",
  },
  {
    id: "5",
    name: "Audio Sample Z",
    dimension: 384,
    lmmEmbedding: "[0.66, -0.33, 0.22, ...]",
    createdBy: "Ethan",
    createdAt: "2025-04-13 12:00:00",
  },
  {
    id: "5",
    name: "Audio Sample Z",
    dimension: 384,
    lmmEmbedding: "[0.66, -0.33, 0.22, ...]",
    createdBy: "Ethan",
    createdAt: "2025-04-13 12:00:00",
  },
  {
    id: "5",
    name: "Audio Sample Z",
    dimension: 384,
    lmmEmbedding: "[0.66, -0.33, 0.22, ...]",
    createdBy: "Ethan",
    createdAt: "2025-04-13 12:00:00",
  },
  {
    id: "5",
    name: "Audio Sample Z",
    dimension: 384,
    lmmEmbedding: "[0.66, -0.33, 0.22, ...]",
    createdBy: "Ethan",
    createdAt: "2025-04-13 12:00:00",
  },
  {
    id: "5",
    name: "Audio Sample Z",
    dimension: 384,
    lmmEmbedding: "[0.66, -0.33, 0.22, ...]",
    createdBy: "Ethan",
    createdAt: "2025-04-13 12:00:00",
  },
  {
    id: "4",
    name: "Video Clip Y",
    dimension: 2048,
    lmmEmbedding: "[0.01, 0.77, -0.44, ...]",
    createdBy: "Diana",
    createdAt: "2025-04-14 17:05:00",
  },
  {
    id: "5",
    name: "Audio Sample Z",
    dimension: 384,
    lmmEmbedding: "[0.66, -0.33, 0.22, ...]",
    createdBy: "Ethan",
    createdAt: "2025-04-13 12:00:00",
  },
  {
    id: "5",
    name: "Audio Sample Z",
    dimension: 384,
    lmmEmbedding: "[0.66, -0.33, 0.22, ...]",
    createdBy: "Ethan",
    createdAt: "2025-04-13 12:00:00",
  },
  {
    id: "5",
    name: "Audio Sample Z",
    dimension: 384,
    lmmEmbedding: "[0.66, -0.33, 0.22, ...]",
    createdBy: "Ethan",
    createdAt: "2025-04-13 12:00:00",
  },
  {
    id: "5",
    name: "Audio Sample Z",
    dimension: 384,
    lmmEmbedding: "[0.66, -0.33, 0.22, ...]",
    createdBy: "Ethan",
    createdAt: "2025-04-13 12:00:00",
  },
  {
    id: "5",
    name: "Audio Sample Z",
    dimension: 384,
    lmmEmbedding: "[0.66, -0.33, 0.22, ...]",
    createdBy: "Ethan",
    createdAt: "2025-04-13 12:00:00",
  },
];

export default function page() {
  const listColumnsTable = [
    {
      key: "name",
      label: "NAME",
    },
    {
      key: "dimension",
      label: "DIMENSION",
    },
    {
      key: "lmmEmbedding",
      label: "LMM EMBEDDING",
    },
    {
      key: "createdBy",
      label: "CREATED BY",
    },
    {
      key: "createdAt",
      label: "CREATED AT",
    },
    {
      key: "action",
      label: "ACTION",
      render: () => (
        <div className="flex items-center gap-5">
          <Button variant="light" size="xxs">
            <DotsThree size={25} />
          </Button>
        </div>
      ),
    },
  ];
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xl">Dataset</div>
        </div>
        <Button size="sm" startContent={<Upload size={20} />} color="primary">
          Upload file
        </Button>
      </div>
      <div className="mt-5">
        <TableList
          // rowAction={(item) =>
          //   handleOpenPage({ id: item.id, type: item.docsType })
          // }
          data={mockData}
          columns={listColumnsTable}
          removeWrapper
        />
      </div>
    </div>
  );
}
