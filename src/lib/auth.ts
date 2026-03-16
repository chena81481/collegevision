import prisma from "./prisma";
import { CounselorRole } from "./constants";

export async function getCounselor(id: string) {
  return await prisma.counselor.findUnique({
    where: { id }
  });
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
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    select: { ownerCounselorId: true }
  });

  return lead?.ownerCounselorId === counselorId;
}

export async function getLeadFilters(counselorId: string) {
  const counselor = await getCounselor(counselorId);
  if (!counselor) return { ownerCounselorId: 'none' };

  if (counselor.role === CounselorRole.ADMIN) return {}; // No filter for admins

  return { ownerCounselorId: counselorId }; // Filter by ownership for counselors
}
