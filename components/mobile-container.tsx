interface MobileContainerProps {
  children: React.ReactNode;
}

export function MobileContainer({ children }: MobileContainerProps) {
  return (
    <div className="mx-auto w-full max-w-md px-5 pb-5 pt-20">{children}</div>
  );
}
