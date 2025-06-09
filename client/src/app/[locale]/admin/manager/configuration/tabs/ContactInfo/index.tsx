"use client";

import { Input, Textarea } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import Card from "@/components/common/Card";
import { chatbotConfigService } from "@/services/chatbot-config";

import { useConfiguration } from "../../ConfigurationContext";

const contactInfoSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  hotline: z.string().min(1, "Hotline is required"),
  website: z
    .string()
    .transform((val) => {
      if (!val || val.trim() === "") return "";

      // Add https:// if no protocol specified
      if (!val.startsWith("http://") && !val.startsWith("https://")) {
        return `https://${val}`;
      }
      return val;
    })
    .refine(
      (val) => {
        if (!val) return true; // Allow empty
        try {
          // eslint-disable-next-line no-new
          new URL(val);
          return true;
        } catch {
          return false;
        }
      },
      { message: "Please enter a valid website URL" },
    ),
  address: z.string().min(1, "Address is required"),
});

type ContactInfoFormValues = z.infer<typeof contactInfoSchema>;

const defaultValues: ContactInfoFormValues = {
  email: "",
  hotline: "",
  website: "",
  address: "",
};

export default function ContactInfo() {
  const { setIsDirty, registerSaveFunction, unregisterSaveFunction } =
    useConfiguration();
  const tabKey = useRef(3); // Contact Info tab key

  // Get current config data
  const { data: configData, isLoading } =
    chatbotConfigService.useGetActiveConfig();
  const updateContactInfo = chatbotConfigService.useUpdateContactInfo();

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<ContactInfoFormValues>({
    resolver: zodResolver(contactInfoSchema),
    defaultValues,
  });

  // Update form when config data loads
  useEffect(() => {
    if (configData?.contactInfo) {
      const formValues: ContactInfoFormValues = {
        email: configData.contactInfo.email || "",
        hotline: configData.contactInfo.hotline || "",
        website: configData.contactInfo.website || "",
        address: configData.contactInfo.address || "",
      };
      reset(formValues);
    }
  }, [configData, reset]);

  useEffect(() => {
    setIsDirty(isDirty);
  }, [isDirty, setIsDirty]);

  const saveConfiguration = async (): Promise<boolean> => {
    try {
      await handleSubmit(async (formData) => {
        const updateData = {
          contactInfo: {
            email: formData.email,
            hotline: formData.hotline,
            website: formData.website,
            address: formData.address,
          },
        };

        await updateContactInfo.mutateAsync(updateData);
        // toast.success("Contact information updated successfully");
      })();
      return true;
    } catch (error) {
      console.error("Save failed:", error);
      //   toast.error("Failed to update contact information");
      return false;
    }
  };

  // Register the save function when component mounts
  useEffect(() => {
    registerSaveFunction(tabKey.current, saveConfiguration);

    // Unregister when component unmounts
    return () => {
      unregisterSaveFunction(tabKey.current);
    };
  }, [registerSaveFunction, unregisterSaveFunction]);

  if (isLoading) {
    return (
      <Card className="h-[calc(100vh-210px)]">
        <div className="flex h-full items-center justify-center">
          <div>Loading contact information...</div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className="scroll h-[calc(100vh-160px)]"
      header={
        <div className="flex w-full justify-between">
          <div>
            <div>Contact Information</div>
            <p className="text-xs">
              Manage contact details that will be displayed to users for support
              and inquiries.
            </p>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-2">
        <div>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <Input
                label="Email"
                labelPlacement="outside"
                placeholder="example@university.edu"
                value={field.value}
                onChange={field.onChange}
                errorMessage={errors.email?.message}
                type="email"
                classNames={{
                  base: "mb-4",
                  label: "mb-2",
                }}
              />
            )}
          />
        </div>

        <div>
          <Controller
            name="hotline"
            control={control}
            render={({ field }) => (
              <Input
                label="Hotline"
                labelPlacement="outside"
                placeholder="+84-123-456-789"
                value={field.value}
                onChange={field.onChange}
                errorMessage={errors.hotline?.message}
                classNames={{
                  base: "mb-4",
                  label: "mb-2",
                }}
              />
            )}
          />
        </div>

        <div>
          <Controller
            name="website"
            control={control}
            render={({ field }) => (
              <Input
                label="Website"
                labelPlacement="outside"
                placeholder="donga.edu.vn or https://donga.edu.vn"
                description="Protocol (https://) will be added automatically if not provided"
                value={field.value}
                onChange={field.onChange}
                errorMessage={errors.website?.message}
                type="url"
                classNames={{
                  base: "mb-4",
                  label: "mb-2",
                }}
              />
            )}
          />
        </div>

        <div>
          <Controller
            name="address"
            control={control}
            render={({ field }) => (
              <Textarea
                label="Address"
                labelPlacement="outside"
                placeholder="Enter full address"
                value={field.value}
                onChange={field.onChange}
                errorMessage={errors.address?.message}
                minRows={3}
                classNames={{
                  base: "mb-4",
                  label: "mb-2",
                }}
              />
            )}
          />
        </div>
      </div>
    </Card>
  );
}
