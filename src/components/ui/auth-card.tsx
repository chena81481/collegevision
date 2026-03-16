import React from "react";

interface AuthCardProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthCard({ children, title, subtitle }: AuthCardProps) {
  return (
    <div className="relative w-full max-w-md animate-fade-in-up">
      {/* Abstract Glowing Background Element */}
      <div className="absolute -inset-1 rounded-[32px] bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 opacity-20 blur-xl animate-glow-pulse" />
      
      {/* Glassmorphism Card */}
      <div className="relative flex flex-col items-center justify-center p-8 sm:p-10 rounded-[32px] glass-panel bg-white/5 dark:bg-zinc-950/40 backdrop-blur-2xl border border-white/20 shadow-2xl overflow-hidden">
        
        {/* Subtle Inner Highlight */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        
        <div className="w-full text-left mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-sm text-foreground/60 font-medium">
              {subtitle}
            </p>
          )}
        </div>
        
        <div className="w-full space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
}
