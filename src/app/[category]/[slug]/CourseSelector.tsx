"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, IndianRupee, Clock, ArrowRight, ShieldCheck } from 'lucide-react';

interface CourseSelectorProps {
  courses: any[];
  initialCourseId: string;
}

export default function CourseSelector({ courses, initialCourseId }: CourseSelectorProps) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(initialCourseId);

  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedId(id);
    // Update URL without full refresh to switch course context
    const url = new URL(window.location.href);
    url.searchParams.set('course', id);
    router.push(url.toString(), { scroll: false });
  };

  return (
    <div className="relative group max-w-md">
      <select 
        value={selectedId}
        onChange={handleCourseChange}
        className="w-full bg-white/10 hover:bg-white/15 border border-white/20 rounded-2xl px-6 py-4 text-white font-bold appearance-none cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-teal-400 group-hover:border-white/30"
      >
        {courses.map(course => (
          <option key={course.id} value={course.id} className="text-slate-900 bg-white font-medium">
            {course.name}
          </option>
        ))}
      </select>
      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">
        <ChevronRight className="w-5 h-5 rotate-90" />
      </div>
    </div>
  );
}
