import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ProfileFormSchema } from "@/lib/schemas";
import type { ProfileFormValues } from "@/lib/schemas";

interface ProfileFormProps {
  onSubmit: (data: ProfileFormValues) => Promise<void>;
  initialValues?: Partial<ProfileFormValues>;
}

export function ProfileForm({ onSubmit, initialValues }: ProfileFormProps) {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(ProfileFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      countryCode: "+54",
      phoneNumber: "",
      ...initialValues,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2 text-center">
          <h3 className="font-medium">Complete Your Profile</h3>
          <p className="text-sm text-muted-foreground">
            Please enter your name to continue
          </p>
        </div>
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="First name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Last name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          Continue
        </Button>
      </form>
    </Form>
  );
}
