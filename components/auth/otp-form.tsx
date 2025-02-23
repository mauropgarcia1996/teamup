import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface OtpFormProps {
  onVerify: (otp: string) => Promise<void>;
}

export function OtpForm({ onVerify }: OtpFormProps) {
  const [otp, setOtp] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onVerify(otp);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2 text-center">
        <h3 className="font-medium">Enter Verification Code</h3>
        <p className="text-sm text-muted-foreground">
          We sent a code to your phone number
        </p>
      </div>
      <div className="space-y-2">
        <Input
          placeholder="Enter code"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          type="text"
          maxLength={6}
          className="text-center text-lg tracking-widest"
        />
      </div>
      <Button type="submit" className="w-full" disabled={otp.length !== 6}>
        Verify
      </Button>
    </form>
  );
}
