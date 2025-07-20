import * as React from "react";
import { cn } from "@/lib/utils";

// Add ButtonProps type if not present
export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "secondary" | "destructive";
};

export function Button({ className, variant = "default", ...props }: ButtonProps) {
  const base = "rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 shadow-sm";
  const variants = {
    default: "bg-blue-950 hover:bg-blue-900 text-white",
    outline: "border border-blue-600 text-blue-700 bg-white hover:bg-blue-50",
    secondary: "bg-blue-100 text-blue-700 hover:bg-blue-200",
    destructive: "bg-red-600 hover:bg-red-700 text-white"
  };
  return (
    <button
      className={cn(base, variants[variant], className)}
      {...props}
    />
  );
}

// Export other components here if needed, but do NOT export Button again
