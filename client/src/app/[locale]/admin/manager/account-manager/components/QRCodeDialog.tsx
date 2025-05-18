"use client";

import { Button } from "@heroui/button";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";
import React from "react";

import { useAccountManager } from "./AccountManagerContext";

export default function QRCodeDialog() {
  const { qrCodeData, setShowQRModal, setQRCodeData } = useAccountManager();

  const handleClose = () => {
    setShowQRModal(false);
    setQRCodeData(null);
  };

  return (
    <Modal isOpen onClose={handleClose}>
      <ModalContent>
        <ModalHeader>Google Authenticator Setup</ModalHeader>
        <ModalBody>
          <div className="flex flex-col items-center space-y-4">
            <p className="text-center">
              Scan this QR code with Google Authenticator app to set up
              two-factor authentication.
            </p>

            {qrCodeData?.qrCodeUrl && (
              <div className="rounded-lg border bg-white p-4">
                <img
                  src={qrCodeData.qrCodeUrl}
                  alt="QR Code for Google Authenticator"
                  width={200}
                  height={200}
                />
              </div>
            )}

            <div className="w-full">
              <h3 className="mb-1 text-sm font-bold">Secret Code:</h3>
              <div className="select-all rounded bg-gray-100 p-2 text-center font-mono">
                {qrCodeData?.secretCode}
              </div>
            </div>

            <div className="text-sm text-gray-600">
              <p>
                If you can't scan the QR code, you can manually enter the secret
                code in your Google Authenticator app.
              </p>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
