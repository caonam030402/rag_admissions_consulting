import { Chip, Input, useDisclosure } from "@heroui/react";
import { ArrowLeft, LinkSimple } from "@phosphor-icons/react";
import React, { useState } from "react";

import Button from "@/components/common/Button";
import TableList from "@/components/common/Table";
import ModalAddKnowledge from "@/components/modals/ModalAddKnowledge";
import type { EStatusUpload } from "@/enums/adminChat";

/**
 * Question item interface for detail view
 */
interface IQuestionItem {
  id: string;
  question: string;
  source: string;
  usedBy: string;
  lastUpdated: string;
}

/**
 * Data source detail interface
 */
interface IDataSourceDetail {
  id: string;
  name: string;
  url: string;
  source: string;
  usedBy: string;
  lastUpdated: string;
  status: EStatusUpload;
  totalQuestions: number;
  questions: IQuestionItem[];
}

interface DataSourceDetailProps {
  dataSource: IDataSourceDetail;
  onBack: () => void;
  onAddKnowledge: (data: any) => Promise<void>;
}

// Mock data for questions
const mockQuestions: IQuestionItem[] = [
  {
    id: "1",
    question: "How often are the Terms of Service for Cursor updated?",
    source: "Website",
    usedBy: "Lyro, Copilot",
    lastUpdated: "May 27, 2025, 7:50 PM",
  },
  {
    id: "2",
    question: "What types of emails may Cursor send me?",
    source: "Website",
    usedBy: "Lyro, Copilot",
    lastUpdated: "May 27, 2025, 7:50 PM",
  },
  {
    id: "3",
    question: "How does Anysphere process payments for the Cursor service?",
    source: "Website",
    usedBy: "Lyro, Copilot",
    lastUpdated: "May 27, 2025, 7:50 PM",
  },
  {
    id: "4",
    question: "What will the arbitrator's decision include?",
    source: "Website",
    usedBy: "Lyro, Copilot",
    lastUpdated: "May 27, 2025, 7:50 PM",
  },
  {
    id: "5",
    question:
      "What information may I be required to provide when registering for a Cursor account?",
    source: "Website",
    usedBy: "Lyro, Copilot",
    lastUpdated: "May 27, 2025, 7:50 PM",
  },
  {
    id: "6",
    question:
      "Can I assign or transfer the Terms or my rights under the Terms without Anysphere's pri...",
    source: "Website",
    usedBy: "Lyro, Copilot",
    lastUpdated: "May 27, 2025, 7:50 PM",
  },
  {
    id: "7",
    question:
      "What happens if I reject a future change to the Arbitration Agreement?",
    source: "Website",
    usedBy: "Lyro, Copilot",
    lastUpdated: "May 27, 2025, 7:50 PM",
  },
  {
    id: "8",
    question: "What are the arbitrator's obligations?",
    source: "Website",
    usedBy: "Lyro, Copilot",
    lastUpdated: "May 27, 2025, 7:50 PM",
  },
];

export default function DataSourceDetail({
  dataSource,
  onBack,
  onAddKnowledge,
}: DataSourceDetailProps) {
  const addKnowledgeModal = useDisclosure();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredQuestions, setFilteredQuestions] = useState(mockQuestions);

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredQuestions(mockQuestions);
    } else {
      const filtered = mockQuestions.filter((item) =>
        item.question.toLowerCase().includes(query.toLowerCase()),
      );
      setFilteredQuestions(filtered);
    }
  };

  /**
   * Renders source chip for an item
   * @param item Question item
   */
  const renderSourceChip = (item: IQuestionItem) => (
    <Chip size="sm" variant="flat" color="primary">
      {item.source}
    </Chip>
  );

  /**
   * Renders used by tags for an item
   * @param item Question item
   */
  const renderUsedBy = (item: IQuestionItem) => {
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

  // Table column definitions
  const tableColumns = [
    { key: "question", label: "QUESTION" },
    { key: "source", label: "SOURCE", render: renderSourceChip },
    { key: "usedBy", label: "USED BY", render: renderUsedBy },
    { key: "lastUpdated", label: "LAST UPDATED" },
  ];

  return (
    <div>
      {/* Header with back button and data source info */}
      <div className="mb-6">
        <div className="mb-4 flex items-center gap-3">
          <Button
            variant="light"
            size="sm"
            startContent={<ArrowLeft size={20} />}
            onPress={onBack}
          >
            Back
          </Button>

          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded bg-blue-100">
              <LinkSimple size={16} className="text-blue-600" />
            </div>
            <h1 className="text-xl font-semibold">{dataSource.name}</h1>
            <Button
              variant="light"
              size="sm"
              startContent={<LinkSimple size={16} />}
              onPress={() => window.open(dataSource.url, "_blank")}
            >
              Open
            </Button>
          </div>
        </div>

        <p className="mb-4 text-gray-600">
          Based on the content from the URL, Lyro will be able to answer the
          following questions.
        </p>

        {/* Search and actions section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Input
              placeholder="Search question"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-64"
            />
            <div className="flex items-center gap-2">
              <span className="text-sm">Used by: All</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              color="primary"
              size="sm"
              onPress={addKnowledgeModal.onOpen}
            >
              Add more knowledge
            </Button>
            <Button color="primary" size="sm">
              Activate
            </Button>
          </div>
        </div>
      </div>

      {/* Results section */}
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Results: {filteredQuestions.length}
        </div>
      </div>

      {/* Questions table */}
      <div>
        <TableList data={filteredQuestions} columns={tableColumns} />
      </div>

      {/* Add Knowledge Modal */}
      <ModalAddKnowledge
        isOpen={addKnowledgeModal.isOpen}
        onOpenChange={addKnowledgeModal.onOpenChange}
        onAdd={onAddKnowledge}
      />
    </div>
  );
}
