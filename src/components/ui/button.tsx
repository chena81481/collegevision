import React, { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "primary",
      size = "md",
      isLoading,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "relative inline-flex items-center justify-center font-semibold tracking-wide transition-all duration-300 ease-out focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden";

    const variants = {
      primary:
        "bg-white text-black hover:bg-zinc-200 focus:ring-zinc-400 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 dark:focus:ring-white/50",
      secondary:
        "bg-zinc-800 text-white hover:bg-zinc-700 focus:ring-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700",
      outline:
        "border border-white/20 bg-transparent text-foreground hover:bg-white/10 focus:ring-white/30 backdrop-blur-sm",
      ghost:
        "bg-transparent text-foreground hover:bg-white/10 hover:text-white focus:ring-white/30",
    };

    const sizes = {
      sm: "h-9 px-4 text-xs rounded-lg",
      md: "h-11 px-6 text-sm rounded-xl",
      lg: "h-14 px-8 text-base rounded-2xl",
    };

    const isPrimary = variant === "primary";

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className} group`}
        {...props}
      >
        {/* Animated Glow Effect built into Primary buttons */}
        {isPrimary && (
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 opacity-0 transition-opacity duration-300 group-hover:opacity-10 dark:opacity-0 dark:group-hover:opacity-20" />
        )}

        <span
          className={`relative z-10 flex items-center justify-center gap-2 ${
            isLoading ? "opacity-0" : "opacity-100"
          }`}
        >
          {children}
        </span>

        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
