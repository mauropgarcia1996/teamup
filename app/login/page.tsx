"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PhoneForm } from "@/components/auth/phone-form";
import { ProfileForm } from "@/components/auth/profile-form";
import { OtpForm } from "@/components/auth/otp-form";
import { useToast } from "@/hooks/use-toast";
import type { PhoneFormValues, ProfileFormValues } from "@/lib/schemas";
import type { Country } from "@/types/shared";

const countries: Country[] = [{ flag: "🇦🇷", code: "+54" }];

export default function LoginPage() {
  const [showOTP, setShowOTP] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [phoneData, setPhoneData] = useState<PhoneFormValues | null>(null);
  const supabase = createClient();
  const router = useRouter();
  const toast = useToast();

  async function onSubmitPhone(data: PhoneFormValues) {
    try {
      const fullPhoneNumber = `${data.countryCode}${data.phoneNumber}`;

      // Check if user exists
      const { data: users } = await supabase
        .from("users")
        .select("*")
        .eq("phone_number", fullPhoneNumber.replace(/\+/g, ""))
        .maybeSingle();

      if (!users || users.first_name === "first_name") {
        setIsNewUser(!users);
      }

      setPhoneData(data);

      if (!users) {
        // New user, show profile form
        toast.info("Please complete your profile");
      } else {
        // Existing user, send OTP directly
        const { error } = await supabase.auth.signInWithOtp({
          phone: fullPhoneNumber,
        });
        if (error) throw error;
        setShowOTP(true);
        toast.success("Verification code sent", "Please check your phone");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(
        "Failed to process phone number",
        error instanceof Error ? error.message : undefined,
      );
    }
  }

  async function onSubmitProfile(data: ProfileFormValues) {
    try {
      if (!phoneData) throw new Error("Phone data is missing");

      const fullPhoneNumber = `${phoneData.countryCode}${phoneData.phoneNumber}`;
      const { error } = await supabase.auth.signInWithOtp({
        phone: fullPhoneNumber,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
          },
        },
      });
      if (error) throw error;
      setShowOTP(true);
      toast.success("Profile created", "Please check your phone");
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error(
        "Failed to create profile",
        error instanceof Error ? error.message : undefined,
      );
    }
  }

  async function onVerifyOtp(otpValue: string) {
    try {
      if (!phoneData) throw new Error("Phone data is missing");

      const fullPhoneNumber = `${phoneData.countryCode}${phoneData.phoneNumber}`;
      const {
        data: { session },
        error,
      } = await supabase.auth.verifyOtp({
        phone: fullPhoneNumber,
        token: otpValue,
        type: "sms",
      });

      if (error) throw error;

      toast.success("Successfully logged in");
      router.replace("/");
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error(
        "Failed to verify code",
        error instanceof Error ? error.message : undefined,
      );
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Welcome to Team Up
          </CardTitle>
          <CardDescription className="text-center">
            {!showOTP
              ? "Enter your phone number to get started"
              : "Enter the verification code sent to your phone"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showOTP ? (
            isNewUser ? (
              <ProfileForm
                onSubmit={onSubmitProfile}
                initialValues={{
                  firstName: "",
                  lastName: "",
                  countryCode: phoneData?.countryCode ?? "+54",
                  phoneNumber: phoneData?.phoneNumber ?? "",
                }}
              />
            ) : (
              <PhoneForm onSubmit={onSubmitPhone} countries={countries} />
            )
          ) : (
            <OtpForm onVerify={onVerifyOtp} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
