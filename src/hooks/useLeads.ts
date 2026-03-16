"use client";

import { useState, useEffect, useCallback } from "react";
import { LeadStatusType } from "@/lib/constants";
import { toast } from "sonner";

export function useLeads() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/leads");
      if (!response.ok) throw new Error("Failed to fetch leads");
      const data = await response.json();
      setLeads(data);
    } catch (error) {
      console.error(error);
      toast.error("Could not load leads");
    } finally {
      setLoading(false);
    }
  }, []);

  const updateLeadStatus = async (leadId: string, newStatus: LeadStatusType) => {
    // Optimistic Update
    const oldLeads = [...leads];
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
    );

    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Update failed");
      
      const updatedLead = await response.json();
      // Sync with server response
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? updatedLead : l))
      );
    } catch (error) {
      setLeads(oldLeads);
      toast.error("Failed to update lead status");
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  return { leads, loading, fetchLeads, updateLeadStatus };
}
