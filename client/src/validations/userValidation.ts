import { z } from "zod";

export const createUserSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["admin", "user"], {
        required_error: "Please select a role",
    }),
    status: z
        .object({
            id: z.number(),
            name: z.string(),
        })
        .optional(),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;

export const defaultValues: CreateUserFormValues = {
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    role: "user",
    status: {
        id: 1, // Default to Active status
        name: "Active",
    },
}; 