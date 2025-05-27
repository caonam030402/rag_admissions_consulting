import { Button } from "@heroui/button";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";
import { Warning } from "@phosphor-icons/react";
import React from "react";

import { useConfiguration } from "../ConfigurationContext";

export default function UnsavedChangesModal() {
  const { isModalOpen, confirmTabChange, cancelTabChange, saveChanges } =
    useConfiguration();

  const handleSaveAndContinue = async () => {
    await saveChanges();
    confirmTabChange();
  };

  const handleDiscardChanges = () => {
    confirmTabChange();
  };

  return (
    <Modal isOpen={isModalOpen} onClose={cancelTabChange}>
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <Warning size={20} className="text-warning" />
          <span>Unsaved Changes</span>
        </ModalHeader>
        <ModalBody>
          <p>
            You have unsaved changes. Would you like to save your changes before
            proceeding?
          </p>
        </ModalBody>
        <ModalFooter className="flex justify-end gap-2">
          <Button variant="flat" color="default" onClick={cancelTabChange}>
            Cancel
          </Button>
          <Button variant="flat" color="danger" onClick={handleDiscardChanges}>
            Discard Changes
          </Button>
          <Button color="primary" onClick={handleSaveAndContinue}>
            Save & Continue
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
