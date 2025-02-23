"use client";

import { EmailForm } from "@/components/auth/email-form";
import { OtpForm } from "@/components/auth/otp-form";
import { ProfileForm } from "@/components/auth/profile-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { ProfileFormValues } from "@/lib/schemas";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const [showOTP, setShowOTP] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();
  const toast = useToast();

  async function onSubmitEmail(data: { email: string }) {
    try {
      // Check if user exists
      const { data: users } = await supabase
        .from("users")
        .select("*")
        .eq("email", data.email)
        .maybeSingle();

      if (!users || users.first_name === "first_name") {
        setIsNewUser(!users);
      }

      setEmail(data.email);

      if (!users) {
        // New user, show profile form
        toast.info("Please complete your profile");
      } else {
        // Existing user, send OTP directly
        const { error } = await supabase.auth.signInWithOtp({
          email: data.email,
        });
        if (error) throw error;
        setShowOTP(true);
        toast.success("Verification code sent", "Please check your email");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(
        "Failed to process email",
        error instanceof Error ? error.message : undefined,
      );
    }
  }

  async function onSubmitProfile(data: ProfileFormValues) {
    try {
      if (!email) throw new Error("Email is missing");

      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
          },
        },
      });
      if (error) throw error;
      setShowOTP(true);
      toast.success("Profile created", "Please check your email");
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
      if (!email) throw new Error("Email is missing");

      const {
        data: { session },
        error,
      } = await supabase.auth.verifyOtp({
        email: email,
        token: otpValue,
        type: "email",
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
              ? "Enter your email to get started"
              : "Enter the verification code sent to your email"}
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
                  email: email ?? "",
                }}
              />
            ) : (
              <EmailForm onSubmit={onSubmitEmail} />
            )
          ) : (
            <OtpForm onVerify={onVerifyOtp} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
