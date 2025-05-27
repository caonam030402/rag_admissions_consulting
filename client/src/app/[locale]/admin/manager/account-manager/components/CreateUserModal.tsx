"use client";

import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import {
  type CreateUserFormValues,
  createUserSchema,
  defaultValues,
} from "@/validations/userValidation";

import { useAccountManager } from "./AccountManagerContext";

export default function CreateUserModal() {
  const { createUser, setShowCreateModal } = useAccountManager();

  const form = useForm<CreateUserFormValues>({
    defaultValues,
    resolver: zodResolver(createUserSchema),
    mode: "onChange",
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  const onSubmit = async (formData: CreateUserFormValues) => {
    try {
      await createUser(formData);
    } catch (error: any) {
      console.error("Failed to create user:", error);
      if (error?.errors) {
        // Process API validation errors from the service
        const apiErrors = error.errors;
        Object.keys(apiErrors).forEach((key) => {
          toast.error(apiErrors[key]);

          // Set form field errors
          form.setError(key as keyof CreateUserFormValues, {
            message: apiErrors[key],
          });
        });
      }
    }
  };

  return (
    <Modal isOpen onClose={() => setShowCreateModal(false)} size="md">
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>Create New Account</ModalHeader>
          <ModalBody>
            <div className="space-y-10">
              <Input
                {...register("email")}
                label="Email"
                labelPlacement="outside"
                placeholder="user@example.com"
                isInvalid={!!errors.email}
                errorMessage={errors.email?.message}
              />

              <Input
                {...register("firstName")}
                label="First Name"
                labelPlacement="outside"
                placeholder="John"
                isInvalid={!!errors.firstName}
                errorMessage={errors.firstName?.message}
              />

              <Input
                {...register("lastName")}
                label="Last Name"
                labelPlacement="outside"
                placeholder="Doe"
                isInvalid={!!errors.lastName}
                errorMessage={errors.lastName?.message}
              />

              <Input
                {...register("password")}
                label="Password"
                labelPlacement="outside"
                type="password"
                placeholder="********"
                isInvalid={!!errors.password}
                errorMessage={errors.password?.message}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="default"
              onPress={() => setShowCreateModal(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button color="primary" type="submit" isLoading={isSubmitting}>
              Create Account
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
