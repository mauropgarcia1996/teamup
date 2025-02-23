export interface Country {
  flag: string;
  code: string;
}

export interface ToastMessage {
  title: string;
  description?: string;
  type: "success" | "error" | "info" | "warning";
}

export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}
