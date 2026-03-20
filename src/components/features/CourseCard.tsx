"use client";

import React from "react";
import Link from "next/link";
import { PlayCircle, Clock, BookOpen } from "lucide-react";
import { ROIBadge } from "./ROIBadge";

interface CourseCardProps {
  id: string;
  title: string;
  instructor: string;
  thumbnail: string;
  progress?: number;
  duration?: string;
  modules?: number;
  roiScore?: number;
}

export function CourseCard({
  id,
  title,
  instructor,
  thumbnail,
  progress,
  duration,
  modules,
  roiScore,
}: CourseCardProps) {
  return (
    <Link 
      href={`/dashboard/course/${id}`}
      className="group block animate-fade-in-up"
    >
      <div className="relative h-full flex flex-col rounded-[24px] glass-panel bg-white/5 dark:bg-zinc-950/40 border border-white/10 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-violet-500/10 hover:-translate-y-1 hover:border-violet-500/30">
        
        {/* Glow behind card on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/0 via-fuchsia-600/0 to-indigo-600/0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 z-0" />

        {/* Thumbnail Section */}
        <div className="relative aspect-video w-full overflow-hidden bg-zinc-800/50 z-10">
          <img 
            src={thumbnail} 
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />
          
          {/* Play Button Overlay on Hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-white/20 backdrop-blur-md rounded-full p-3 shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-100">
              <PlayCircle className="h-8 w-8 text-white" />
            </div>
          </div>

          {/* Progress Bar (if applicable) */}
          {progress !== undefined && (
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/50 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-r-full" 
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* ROI Badge */}
          {roiScore !== undefined && (
            <div className="absolute top-4 left-4 z-20">
              <ROIBadge score={roiScore} />
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex flex-col flex-1 p-5 z-10">
          <div className="mb-1 text-xs font-semibold text-violet-500 dark:text-violet-400">
            {instructor}
          </div>
          <h3 className="text-lg flex-1 font-bold text-foreground leading-tight group-hover:text-violet-500 transition-colors line-clamp-2 mb-4">
            {title}
          </h3>
          
          <div className="flex items-center gap-4 text-xs font-medium text-foreground/60 w-full pt-4 border-t border-white/10 mt-auto">
            {duration && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {duration}
              </div>
            )}
            {modules && (
              <div className="flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" />
                {modules} modules
              </div>
            )}
            
            {progress !== undefined && (
              <div className="ml-auto font-bold text-foreground/90">
                {progress}%
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
