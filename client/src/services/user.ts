import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { ENameLocalS } from "@/constants";
import { useQueryCommon } from "@/hooks/useQuery";
import type { IOptionRQ } from "@/types";
import { getLocalStorage, setLocalStorage } from "@/utils/clientStorage";
import http from "@/utils/http";
import type { CreateUserFormValues } from "@/validations/userValidation";

// Consistent User interface with role support
interface IUser {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  role?: { id: number; name: string } | string;
  secretCode?: string;
  google2faEnabled?: boolean;
  isVerified?: string;
}

interface UsersResponse {
  data: IUser[];
  hasNextPage: boolean;
}

interface QRCodeResponse {
  secretCode: string;
  qrCodeUrl: string;
}

export const userService = {
  // Get user profile
  useProfile: () => {
    const userLs = getLocalStorage({ key: ENameLocalS.PROFILE });
    const query = useQueryCommon<IUser>({
      url: "auth/me",
      queryKey: ["profile"],
      enabled: !userLs,
    });

    setLocalStorage({ key: ENameLocalS.PROFILE, value: query.data });
    return {
      ...query,
      user: (userLs as IUser) || (query.data as IUser),
    };
  },

  // Get one user by ID
  useGetOneUser: (userId: IUser["id"], option?: IOptionRQ) => {
    const query = useQueryCommon<IUser>({
      url: `users/${userId}`,
      queryKey: ["user", userId],
      ...option,
    });

    return {
      ...query,
      data: query.data,
    };
  },

  // Get all users with search filter
  useGetUsers: (searchTerm: string = "") => {
    return useQueryCommon<UsersResponse>({
      url: `users${searchTerm ? `?search=${searchTerm}` : ""}`,
      queryKey: ["users", searchTerm],
    });
  },

  // Create user mutation
  useCreateUser: () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: async (userData: CreateUserFormValues) => {
        const response = await http.post<{
          user: IUser;
          secretCode: string;
          qrCodeUrl: string;
        }>("users", { body: userData });
        return response.payload;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["users"] });
        toast.success("User created successfully");
      },
    });
  },

  // Delete user mutation
  useDeleteUser: () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: async (userId: number) => {
        await http.delete(`users/${userId}`, { body: {} });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["users"] });
        toast.success("User deleted successfully");
      },
    });
  },

  // Reset password mutation
  useResetPassword: () => {
    return useMutation({
      mutationFn: async (userId: number) => {
        await http.post(`users/${userId}/reset-password`, { body: {} });
      },
      onSuccess: () => {
        toast.success("Password has been reset");
      },
    });
  },

  // Toggle Google 2FA mutation
  useToggle2FA: () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: async ({
        userId,
        enabled,
      }: {
        userId: number;
        enabled: boolean;
      }) => {
        await http.post(`users/${userId}/2fa`, {
          body: { enabled },
        });
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ["users"] });
        toast.success(
          `2FA ${variables.enabled ? "enabled" : "disabled"} successfully`,
        );
      },
    });
  },

  // Replace secret code mutation
  useReplaceSecretCode: () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: async (userId: number) => {
        const response = await http.post<QRCodeResponse>(
          `users/${userId}/secret-code`,
          { body: {} },
        );
        return response.payload;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["users"] });
        toast.success("Secret code has been replaced");
      },
    });
  },
};
