"use client";

import React, { useState } from "react";
import { CourseCard } from "@/components/features/CourseCard";
import { PlayCircle, Award, Users, DollarSign, BookOpen } from "lucide-react";

// Placeholder mock data
const ENROLLED_COURSES = [
  {
    id: "css-mastery",
    title: "Advanced Tailwind CSS Animations & Glassmorphism",
    instructor: "Sarah Jenkins",
    thumbnail: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80",
    progress: 68,
    duration: "4h 20m",
    modules: 12,
  },
  {
    id: "react-patterns",
    title: "React Server Components Architecture",
    instructor: "Mark O'Brien",
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80",
    progress: 12,
    duration: "8h 45m",
    modules: 24,
  },
  {
    id: "figma-design",
    title: "UI/UX Foundations for Developers",
    instructor: "Elena Rodriguez",
    thumbnail: "https://images.unsplash.com/photo-1618761714954-0b8cd0026356?auto=format&fit=crop&w=800&q=80",
    progress: 0,
    duration: "3h 15m",
    modules: 8,
  }
];

export default function DashboardPage() {
  // Toggle for previewing Student vs Instructor view
  const [role, setRole] = useState<"STUDENT" | "INSTRUCTOR">("STUDENT");

  return (
    <div className="space-y-8 pb-12">
      {/* Temporary Role Toggle for Dev Preview */}
      <div className="flex justify-end pt-2">
        <button 
          onClick={() => setRole(role === "STUDENT" ? "INSTRUCTOR" : "STUDENT")}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-colors"
        >
          Previewing as: {role} (Click to switch)
        </button>
      </div>

      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/60">
          Hello, Jane.
        </h1>
        <p className="text-foreground/60 text-lg">
          {role === "STUDENT" ? "Ready to dive back into learning?" : "Here's your teaching summary for today."}
        </p>
      </div>

      {role === "STUDENT" ? (
        // STUDENT VIEW
        <>
          {/* Continue Learning Banner */}
          <div className="relative overflow-hidden rounded-[32px] glass-panel bg-gradient-to-r from-violet-600/20 to-indigo-600/20 border border-violet-500/20 p-6 sm:p-10 animate-fade-in-up">
            <div className="absolute top-[-50%] right-[-10%] w-[60%] h-[200%] bg-gradient-to-b from-white/10 to-transparent rotate-12 pointer-events-none" />
            
            <div className="relative z-10 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
              <div className="space-y-4 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/20 text-violet-400 text-xs font-bold uppercase tracking-wider border border-violet-500/20">
                  <PlayCircle className="h-4 w-4" />
                  Continue Learning
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold leading-tight">
                  Advanced Tailwind CSS Animations & Glassmorphism
                </h2>
                <div className="flex items-center gap-4 text-sm font-medium text-foreground/70">
                  <span>Module 4: Keyframe Transitions</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-foreground/30" />
                  <span className="text-violet-400">68% Complete</span>
                </div>
              </div>
              
              <button className="shrink-0 px-8 py-4 bg-white text-black dark:bg-white dark:text-zinc-950 font-bold rounded-2xl shadow-xl shadow-white/10 hover:shadow-2xl hover:scale-105 hover:bg-zinc-200 transition-all duration-300">
                Resume Course
              </button>
            </div>
          </div>

          {/* Enrolled Courses Grid */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Enrolled Courses</h3>
              <button className="text-sm font-semibold text-violet-500 hover:text-violet-400">
                View all
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {ENROLLED_COURSES.map((course, index) => (
                <div key={course.id} style={{ animationDelay: `${index * 100}ms` }}>
                  <CourseCard {...course} />
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        // INSTRUCTOR VIEW
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-fade-in-up">
            <div className="glass-panel bg-white/5 p-6 rounded-[24px] border border-white/10 hover:border-violet-500/30 transition-colors">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-violet-500/20 rounded-xl text-violet-400">
                  <DollarSign className="h-6 w-6" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground/60">Total Revenue</span>
                  <span className="text-2xl font-bold">$12,450.00</span>
                </div>
              </div>
              <div className="text-sm text-emerald-400 font-medium">+14% from last month</div>
            </div>

            <div className="glass-panel bg-white/5 p-6 rounded-[24px] border border-white/10 hover:border-indigo-500/30 transition-colors" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-400">
                  <Users className="h-6 w-6" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground/60">Active Students</span>
                  <span className="text-2xl font-bold">1,842</span>
                </div>
              </div>
              <div className="text-sm text-emerald-400 font-medium">+82 new this week</div>
            </div>

            <div className="glass-panel bg-white/5 p-6 rounded-[24px] border border-white/10 hover:border-fuchsia-500/30 transition-colors" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-fuchsia-500/20 rounded-xl text-fuchsia-400">
                  <Award className="h-6 w-6" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground/60">Course Rating</span>
                  <span className="text-2xl font-bold">4.9/5.0</span>
                </div>
              </div>
              <div className="text-sm text-foreground/50 font-medium">Based on 430 reviews</div>
            </div>
          </div>

          {/* Managed Courses List */}
          <div className="space-y-6 mt-10">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Your Managed Courses</h3>
              <button className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-violet-600/20">
                + Create New Course
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {ENROLLED_COURSES.slice(0, 2).map((course, index) => (
                <div key={course.id} style={{ animationDelay: `${index * 150}ms` }}>
                  <CourseCard {...course} progress={undefined} />
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
