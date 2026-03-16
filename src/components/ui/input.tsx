import React, { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, error, id, ...props }, ref) => {
    const internalId = React.useId();
    const inputId = id || internalId;

    const inputElement = (
      <div className="relative group">
        <input
          id={inputId}
          ref={ref}
          className={cn(
            "flex h-12 w-full rounded-xl border border-white/10 bg-white/5",
            "px-4 py-2 text-sm text-foreground placeholder:text-foreground/30",
            "transition-all duration-300 ease-out",
            "focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50",
            "hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-500/50 focus:ring-red-500/50",
            className
          )}
          {...props}
        />
        {/* Subtle bottom glow on focus */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-violet-500/0 to-transparent transition-opacity duration-300 group-focus-within:via-violet-500/50 opacity-0 group-focus-within:opacity-100" />
      </div>
    );

    if (!label) {
      return (
        <div className="flex flex-col space-y-1">
          {inputElement}
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
      );
    }

    return (
      <div className="flex flex-col space-y-2">
        <label
          htmlFor={inputId}
          className="text-xs font-semibold tracking-wide text-foreground/80 uppercase"
        >
          {label}
        </label>
        {inputElement}
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
