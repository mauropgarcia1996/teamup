import { toast } from "sonner";
import type { ToastMessage } from "@/types/shared";

export function useToast() {
  const showToast = ({ title, description, type }: ToastMessage) => {
    switch (type) {
      case "success":
        toast.success(title, {
          description,
        });
        break;
      case "error":
        toast.error(title, {
          description,
        });
        break;
      case "warning":
        toast.warning(title, {
          description,
        });
        break;
      default:
        toast.info(title, {
          description,
        });
    }
  };

  return {
    showToast,
    success: (title: string, description?: string) =>
      showToast({ title, description, type: "success" }),
    error: (title: string, description?: string) =>
      showToast({ title, description, type: "error" }),
    warning: (title: string, description?: string) =>
      showToast({ title, description, type: "warning" }),
    info: (title: string, description?: string) =>
      showToast({ title, description, type: "info" }),
  };
}
