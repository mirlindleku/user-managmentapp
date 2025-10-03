import * as React from "react";

type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
};

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
}: DialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-10 w-full max-w-md rounded-lg border bg-white p-4 shadow-xl">
        {title && <h3 className="text-lg font-semibold">{title}</h3>}
        {description && (
          <p className="mt-1 text-sm text-gray-600">{description}</p>
        )}
        <div className="mt-4">{children}</div>
        {footer && <div className="mt-6 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

export function useDialogState(initial = false) {
  const [open, setOpen] = React.useState<boolean>(initial);
  const onOpenChange = (v: boolean) => setOpen(v);
  return { open, setOpen, onOpenChange } as const;
}
