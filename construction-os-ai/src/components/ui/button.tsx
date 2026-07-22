import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-control text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-primary-500 text-white shadow-soft hover:bg-primary-600 active:scale-[0.98]",
        secondary:
          "bg-primary-50 text-primary-700 hover:bg-primary-100 active:scale-[0.98] dark:bg-white/5 dark:text-primary-200 dark:hover:bg-white/10",
        outline:
          "border border-black/10 bg-transparent hover:bg-black/[0.03] active:scale-[0.98] dark:border-white/10 dark:hover:bg-white/5",
        ghost: "hover:bg-black/[0.04] active:scale-[0.98] dark:hover:bg-white/5",
        danger: "bg-danger text-white shadow-soft hover:bg-danger/90 active:scale-[0.98]",
        link: "text-primary-600 underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-9 px-3.5 text-[13px]",
        md: "h-11 px-5",
        lg: "h-13 px-7 text-base",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />
  );
}

export { Button, buttonVariants };
