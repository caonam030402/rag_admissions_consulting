"use client";

import { Button } from "@heroui/button";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";
import React, { useState } from "react";

import { useAccountManager } from "./AccountManagerContext";

interface ActionButtonsProps {
  user: {
    id: number;
    email: string;
    secretCode: string;
  };
}

export default function ActionButtons({ user }: ActionButtonsProps) {
  const {
    deleteUser,
    resetPassword,
    replaceSecretCode,
    setQRCodeData,
    setShowQRModal,
  } = useAccountManager();

  const [isLoading, setIsLoading] = useState({
    delete: false,
    reset: false,
    viewQR: false,
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleResetPassword = async () => {
    try {
      setIsLoading((prev) => ({ ...prev, reset: true }));
      await resetPassword(user.id);
      alert(`Password has been reset for ${user.email}`);
    } catch (error) {
      console.error("Failed to reset password:", error);
    } finally {
      setIsLoading((prev) => ({ ...prev, reset: false }));
    }
  };

  const handleDelete = async () => {
    try {
      setIsLoading((prev) => ({ ...prev, delete: true }));
      await deleteUser(user.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error("Failed to delete user:", error);
    } finally {
      setIsLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  const handleViewQR = async () => {
    try {
      setIsLoading((prev) => ({ ...prev, viewQR: true }));
      if (user.secretCode) {
        const result = await replaceSecretCode(user.id);
        setQRCodeData(result);
        setShowQRModal(true);
      }
    } catch (error) {
      console.error("Failed to get QR code:", error);
    } finally {
      setIsLoading((prev) => ({ ...prev, viewQR: false }));
    }
  };

  return (
    <>
      <div className="flex space-x-2">
        <Button
          size="sm"
          color="warning"
          isLoading={isLoading.reset}
          onClick={handleResetPassword}
        >
          Reset Password
        </Button>

        <Button
          size="sm"
          color="danger"
          isLoading={isLoading.delete}
          onClick={() => setShowDeleteConfirm(true)}
        >
          Delete
        </Button>

        <Button
          size="sm"
          color="secondary"
          isLoading={isLoading.viewQR}
          onClick={handleViewQR}
        >
          View QR
        </Button>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
      >
        <ModalContent>
          <ModalHeader>Confirm Deletion</ModalHeader>
          <ModalBody>
            Are you sure you want to delete the account for {user.email}? This
            action cannot be undone.
          </ModalBody>
          <ModalFooter>
            <Button color="default" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button
              color="danger"
              isLoading={isLoading.delete}
              onClick={handleDelete}
            >
              Delete Account
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
