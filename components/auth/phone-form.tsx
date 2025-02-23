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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { PhoneFormSchema } from "@/lib/schemas";
import type { PhoneFormValues } from "@/lib/schemas";
import type { Country } from "@/types/shared";

interface PhoneFormProps {
  onSubmit: (data: PhoneFormValues) => Promise<void>;
  countries: Country[];
}

export function PhoneForm({ onSubmit, countries }: PhoneFormProps) {
  const form = useForm<PhoneFormValues>({
    resolver: zodResolver(PhoneFormSchema),
    defaultValues: {
      countryCode: "+54",
      phoneNumber: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex gap-2">
          <FormField
            control={form.control}
            name="countryCode"
            render={({ field }) => (
              <FormItem className="w-[100px]">
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="🌍" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.flag} {country.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input placeholder="Phone number" {...field} type="tel" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" className="w-full">
          Continue
        </Button>
      </form>
    </Form>
  );
}
