import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface PageWithBackProps {
  children: React.ReactNode;
  backTo?: string;
}

export function PageWithBack({ children, backTo = "/" }: PageWithBackProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-10 bg-background border-b px-5">
        <div className="container flex items-center h-14">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(backTo)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="container pt-16 pb-20 px-5">{children}</main>
    </div>
  );
}
