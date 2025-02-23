import * as z from "zod";

const phoneRegex = new RegExp(
  /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/,
);

export const PhoneFormSchema = z.object({
  countryCode: z.string().min(1, "Please select a country code"),
  phoneNumber: z.string().regex(phoneRegex, "Invalid phone number format"),
});

export const GameFormSchema = z.object({
  date: z.date(),
  location: z.string().min(3, "Location must be at least 3 characters"),
  playersRequired: z.number().min(2, "At least 2 players required"),
  description: z.string().optional(),
});

export const emailFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const profileFormSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
});

export type PhoneFormValues = z.infer<typeof PhoneFormSchema>;
export type GameFormValues = z.infer<typeof GameFormSchema>;
export type EmailFormValues = z.infer<typeof emailFormSchema>;
export type ProfileFormValues = z.infer<typeof profileFormSchema>;
