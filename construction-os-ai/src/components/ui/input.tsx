import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-control border border-black/10 bg-white px-3.5 text-sm text-black/90 shadow-sm outline-none transition-colors placeholder:text-black/35 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/25 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/90 dark:placeholder:text-white/30",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
