interface MobileContainerProps {
  children: React.ReactNode;
}

export function MobileContainer({ children }: MobileContainerProps) {
  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-md relative">
        <div className="h-full px-5 md:border-x border-border">{children}</div>
      </div>
    </div>
  );
}
