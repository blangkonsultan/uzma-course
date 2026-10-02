"use client";

import { useFormStatus } from "react-dom";
import { Button, ButtonProps } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface SubmitButtonProps extends Omit<ButtonProps, "disabled"> {
  pendingText?: string;
}

export function SubmitButton({ 
  children, 
  pendingText = "Menyimpan...", 
  ...props 
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button 
      type="submit" 
      disabled={pending} 
      {...props}
    >
      {pending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>{pendingText}</span>
        </>
      ) : (
        children
      )}
    </Button>
  );
}
