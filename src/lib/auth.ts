import { createAdminClient } from "@/utils/supabase/admin";
import { CounselorRole } from "./constants";

export async function getCounselor(id: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('counselors')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) return null;
  return data;
}

export async function isAdmin(id: string) {
  const counselor = await getCounselor(id);
  return counselor?.role === CounselorRole.ADMIN;
}

export async function canAccessLead(counselorId: string, leadId: string) {
  const counselor = await getCounselor(counselorId);
  if (!counselor) return false;

  // Admins see everything
  if (counselor.role === CounselorRole.ADMIN) return true;

  // Counselors see only their own leads
  const supabase = createAdminClient();
  const { data: lead, error } = await supabase
    .from('leads')
    .select('ownerCounselorId')
    .eq('id', leadId)
    .single();

  if (error) return false;
  return lead?.ownerCounselorId === counselorId;
}

export async function getLeadFilters(counselorId: string) {
  const counselor = await getCounselor(counselorId);
  if (!counselor) return { ownerCounselorId: 'none' };

  if (counselor.role === CounselorRole.ADMIN) return {}; // No filter for admins

  return { ownerCounselorId: counselorId }; // Filter by ownership for counselors
}
