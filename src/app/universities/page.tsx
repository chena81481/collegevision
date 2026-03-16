"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { FilterSidebar } from "@/components/features/FilterSidebar";
import { UniversityCard } from "@/components/features/UniversityCard";
import { CompareDock } from "@/components/features/CompareDock";
import { University, MOCK_UNIVERSITIES } from "@/lib/mockData";

function UniversitiesDirectory() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  
  const [filteredUnis, setFilteredUnis] = useState<University[]>(MOCK_UNIVERSITIES);
  const [selectedForCompare, setSelectedForCompare] = useState<University[]>([]);
  
  // Simulate Initial Load Skeleton/Prefetch
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch delay for perceived performance & progressive disclosure
    const timer = setTimeout(() => setIsLoading(false), 800);
    
    if (query) {
      setFilteredUnis(MOCK_UNIVERSITIES.filter(u => u.name.toLowerCase().includes(query.toLowerCase())));
    } else {
      setFilteredUnis(MOCK_UNIVERSITIES);
    }
    
    return () => clearTimeout(timer);
  }, [query]);

  const toggleCompare = (uni: University) => {
    setSelectedForCompare(prev => {
      if (prev.find(u => u.id === uni.id)) {
        return prev.filter(u => u.id !== uni.id);
      }
      if (prev.length >= 4) return prev; // Max 4 slots
      return [...prev, uni];
    });
  };

  const handleFilterChange = (filters: any) => {
    // Advanced filtering logic will go here
    // For now, it just triggers the skeleton loader
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 500);
  };

  return (
    <>
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
        
        {/* Left: Sticky Filter Sidebar */}
        <FilterSidebar onFilterChange={handleFilterChange} resultCount={filteredUnis.length} />

        {/* Right: Directory Grid */}
        <div className="flex-1 space-y-6 min-w-0">
          
          <div className="flex items-end justify-between border-b border-white/10 pb-4">
            <div>
              <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-indigo-400">
                Explore Universities
              </h1>
              {query && (
                <p className="text-foreground/60 mt-1">Showing results for <span className="text-white font-semibold">"{query}"</span></p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-6 w-full">
            {isLoading ? (
              // Skeleton Loaders
              [1, 2, 3].map((i) => (
                <div key={i} className="w-full h-48 rounded-[28px] glass-panel bg-white/5 border border-white/5 animate-pulse flex p-6 gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-white/10" />
                  <div className="flex-1 space-y-4 py-1">
                    <div className="w-1/3 h-6 bg-white/10 rounded" />
                    <div className="w-1/4 h-4 bg-white/10 rounded" />
                    <div className="grid grid-cols-2 gap-4 mt-8">
                      <div className="w-full h-12 bg-white/5 rounded" />
                      <div className="w-full h-12 bg-white/5 rounded" />
                    </div>
                  </div>
                </div>
              ))
            ) : filteredUnis.length > 0 ? (
              filteredUnis.map((uni, idx) => (
                <div key={uni.id} className="animate-fade-in-up" style={{ animationDelay: `${idx * 100}ms` }}>
                  <UniversityCard 
                    university={uni} 
                    onCompareToggle={toggleCompare}
                    isCompared={!!selectedForCompare.find(u => u.id === uni.id)}
                  />
                </div>
              ))
            ) : (
              <div className="py-20 text-center space-y-4">
                <div className="text-6xl">🔍</div>
                <h3 className="text-2xl font-bold">No exact matches found</h3>
                <p className="text-foreground/60">Try adjusting your filters or search terms.</p>
              </div>
            )}
          </div>
        </div>

      </main>

      {/* Floating Compare Widget */}
      <CompareDock 
        selectedUniversties={selectedForCompare} 
        onRemove={toggleCompare} 
      />
    </>
  );
}

export default function UniversitiesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pt-16">
      <Navbar />
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center animate-pulse text-violet-500 font-bold">
          Loading Directory...
        </div>
      }>
        <UniversitiesDirectory />
      </Suspense>
    </div>
  );
}
