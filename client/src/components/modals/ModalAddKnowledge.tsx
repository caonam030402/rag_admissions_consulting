import {
  Card,
  CardBody,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
} from "@heroui/react";
import { FileCsv, FileText, Globe, PencilSimple } from "@phosphor-icons/react";
import React, { useState } from "react";
import toast from "react-hot-toast";

import Button from "@/components/common/Button";

/**
 * Knowledge source types
 */
export enum KnowledgeSourceType {
  WEBSITE = "website",
  PDF = "pdf",
  CSV = "csv",
  MANUAL = "manual",
}

/**
 * Add Knowledge Modal Component
 */
interface ModalAddKnowledgeProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (data: any) => Promise<void>;
}

export default function ModalAddKnowledge({
  isOpen,
  onOpenChange,
  onAdd,
}: ModalAddKnowledgeProps) {
  const [selectedType, setSelectedType] = useState<KnowledgeSourceType | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    url: "",
    title: "",
    content: "",
    name: "",
    description: "",
    file: null as File | null,
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, file }));
    }
  };

  const resetForm = () => {
    setSelectedType(null);
    setFormData({
      url: "",
      title: "",
      content: "",
      name: "",
      description: "",
      file: null,
    });
  };

  const handleSubmit = async () => {
    if (!selectedType) return;

    setIsLoading(true);
    try {
      let submitData;

      // Check for name field
      if (!formData.name) {
        toast.error("Please enter a name for this knowledge source");
        return;
      }

      switch (selectedType) {
        case KnowledgeSourceType.WEBSITE:
          if (!formData.url) {
            toast.error("Please enter a website URL");
            return;
          }
          submitData = {
            type: "website",
            url: formData.url,
            name: formData.name,
            description: formData.description,
          };
          break;

        case KnowledgeSourceType.PDF:
        case KnowledgeSourceType.CSV:
          if (!formData.file) {
            toast.error("Please select a file");
            return;
          }
          submitData = {
            type: selectedType,
            file: formData.file,
            name: formData.name,
            description: formData.description,
          };
          break;

        case KnowledgeSourceType.MANUAL:
          if (!formData.title || !formData.content) {
            toast.error("Please fill in both title and content");
            return;
          }
          submitData = {
            type: "manual",
            title: formData.title,
            content: formData.content,
            name: formData.name,
            description: formData.description,
          };
          break;

        default:
          return;
      }

      await onAdd(submitData);
      onOpenChange(false);
      resetForm();
      toast.success("Knowledge added successfully");
    } catch (error) {
      toast.error("Failed to add knowledge");
    } finally {
      setIsLoading(false);
    }
  };

  const renderSourceOptions = () => (
    <div className="grid grid-cols-2 gap-4">
      <Card
        isPressable
        isHoverable
        className={`cursor-pointer ${
          selectedType === KnowledgeSourceType.WEBSITE
            ? "border-primary-500 bg-primary-50"
            : ""
        }`}
        onPress={() => setSelectedType(KnowledgeSourceType.WEBSITE)}
      >
        <CardBody className="p-6 text-center">
          <Globe size={32} className="mx-auto mb-3 text-primary-500" />
          <h3 className="mb-1 font-semibold">Website URL</h3>
          <p className="text-sm text-gray-600">
            Provide the URL of your site to feed Lyro with knowledge from it.
          </p>
        </CardBody>
      </Card>

      <Card
        isPressable
        isHoverable
        className={`cursor-pointer ${
          selectedType === KnowledgeSourceType.MANUAL
            ? "border-primary-500 bg-primary-50"
            : ""
        }`}
        onPress={() => setSelectedType(KnowledgeSourceType.MANUAL)}
      >
        <CardBody className="p-6 text-center">
          <PencilSimple size={32} className="mx-auto mb-3 text-primary-500" />
          <h3 className="mb-1 font-semibold">Add manually</h3>
          <p className="text-sm text-gray-600">
            Manually write your own specific Q&A.
          </p>
        </CardBody>
      </Card>

      <Card
        isPressable
        isHoverable
        className={`cursor-pointer ${
          selectedType === KnowledgeSourceType.PDF
            ? "border-primary-500 bg-primary-50"
            : ""
        }`}
        onPress={() => setSelectedType(KnowledgeSourceType.PDF)}
      >
        <CardBody className="p-6 text-center">
          <FileText size={32} className="mx-auto mb-3 text-primary-500" />
          <h3 className="mb-1 font-semibold">Import PDF file</h3>
          <p className="text-sm text-gray-600">
            Upload PDF documents to extract knowledge.
          </p>
        </CardBody>
      </Card>

      <Card
        isPressable
        isHoverable
        className={`cursor-pointer ${
          selectedType === KnowledgeSourceType.CSV
            ? "border-primary-500 bg-primary-50"
            : ""
        }`}
        onPress={() => setSelectedType(KnowledgeSourceType.CSV)}
      >
        <CardBody className="p-6 text-center">
          <FileCsv size={32} className="mx-auto mb-3 text-primary-500" />
          <h3 className="mb-1 font-semibold">Import CSV file</h3>
          <p className="text-sm text-gray-600">
            Add multiple Q&As from CSV file at once.
          </p>
        </CardBody>
      </Card>
    </div>
  );

  const renderForm = () => {
    const commonFields = (
      <div className="space-y-4">
        <Input
          label="Name"
          placeholder="Enter a name for this knowledge source"
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          isRequired
        />
        <Textarea
          label="Description (Optional)"
          placeholder="Enter a description for this knowledge source"
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          minRows={2}
        />
      </div>
    );

    switch (selectedType) {
      case KnowledgeSourceType.WEBSITE:
        return (
          <div className="space-y-4">
            {commonFields}
            <Input
              label="Website URL"
              placeholder="https://example.com"
              value={formData.url}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, url: e.target.value }))
              }
              isRequired
            />
          </div>
        );

      case KnowledgeSourceType.MANUAL:
        return (
          <div className="space-y-4">
            {commonFields}
            <Input
              label="Title"
              placeholder="Enter Q&A title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              isRequired
            />
            <Textarea
              label="Content"
              placeholder="Enter your Q&A content"
              value={formData.content}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, content: e.target.value }))
              }
              minRows={4}
              isRequired
            />
          </div>
        );

      case KnowledgeSourceType.PDF:
        return (
          <div className="space-y-4">
            {commonFields}
            <div>
              <label
                htmlFor="pdf-upload"
                className="mb-2 block text-sm font-medium"
              >
                Upload PDF File *
              </label>
              <input
                id="pdf-upload"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-primary-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-700 hover:file:bg-primary-100"
                required
              />
              {formData.file && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: {formData.file.name}
                </p>
              )}
            </div>
          </div>
        );

      case KnowledgeSourceType.CSV:
        return (
          <div className="space-y-4">
            {commonFields}
            <div>
              <label
                htmlFor="csv-upload"
                className="mb-2 block text-sm font-medium"
              >
                Upload CSV File *
              </label>
              <input
                id="csv-upload"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-primary-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-700 hover:file:bg-primary-100"
                required
              />
              {formData.file && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: {formData.file.name}
                </p>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) resetForm();
      }}
      size="2xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <h2>Add more knowledge</h2>
              <p className="text-sm font-normal text-gray-600">
                Choose how you want to provide Lyro with knowledge.
              </p>
            </ModalHeader>
            <ModalBody>
              {!selectedType ? renderSourceOptions() : renderForm()}
            </ModalBody>
            <ModalFooter>
              {selectedType && (
                <Button
                  color="default"
                  variant="light"
                  onPress={() => setSelectedType(null)}
                >
                  Back
                </Button>
              )}
              <Button
                color="primary"
                onPress={selectedType ? handleSubmit : onClose}
                isLoading={isLoading}
                isDisabled={!selectedType}
              >
                {selectedType ? "Add Knowledge" : "Cancel"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
