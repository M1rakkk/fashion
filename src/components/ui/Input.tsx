import React from "react";
import clsx from "clsx";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={clsx(
          "w-full p-3 rounded-lg bg-[var(--input)] text-white placeholder-[var(--muted-foreground)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
