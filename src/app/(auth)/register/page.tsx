"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthCard } from "@/components/ui/auth-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<"STUDENT" | "INSTRUCTOR">("STUDENT");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            full_name: `${firstName} ${lastName}`,
            role: role,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) throw authError;

      // Note: If email confirmation is enabled, the user might stay on this page with a "Check your email" message.
      // For now, let's assume auto-confirm or redirect to success.
      alert("Registration successful! Please check your email for confirmation.");
      router.push("/login");
    } catch (err: any) {
      setError(err.message || "Failed to create account.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-violet-600/20 blur-[120px]" />
      </div>

      <AuthCard
        title="Create an account"
        subtitle="Join our platform to start learning or teaching today."
      >
        <form onSubmit={handleRegister} className="space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium">
              {error}
            </div>
          )}

          {/* Role Selector */}
          <div className="flex p-1 bg-white/5 border border-white/10 rounded-xl mb-6 backdrop-blur-sm">
            <button
              type="button"
              onClick={() => setRole("STUDENT")}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${
                role === "STUDENT"
                  ? "bg-white text-black shadow-lg"
                  : "text-foreground/60 hover:text-foreground hover:bg-white/10"
              }`}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => setRole("INSTRUCTOR")}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${
                role === "INSTRUCTOR"
                  ? "bg-white text-black shadow-lg"
                  : "text-foreground/60 hover:text-foreground hover:bg-white/10"
              }`}
            >
              Instructor
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              type="text"
              placeholder="Jane"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <Input
              label="Last Name"
              type="text"
              placeholder="Doe"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>

          <Input
            label="Email Address"
            type="email"
            placeholder="jane@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <Input
            label="Password"
            type="password"
            placeholder="Create a strong password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />

          <Button type="submit" className="w-full mt-6" isLoading={isLoading}>
            Create {role === "INSTRUCTOR" ? "Instructor" : "Student"} Account
          </Button>

          <p className="text-center text-sm text-foreground/60 mt-6">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-foreground hover:text-violet-400 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </form>
      </AuthCard>
    </div>
  );
}
