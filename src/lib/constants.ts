/**
 * Constants and Enums for Client Components
 * These mirror the Prisma enums but are available at runtime in the browser.
 */

export const LeadStatus = {
  NEW_LEAD: "NEW_LEAD",
  CONTACTED: "CONTACTED",
  PROPOSAL: "PROPOSAL",
  WON: "WON",
  LOST: "LOST",
} as const;

export type LeadStatusType = keyof typeof LeadStatus;

export const LeadSource = {
  DIRECT: "DIRECT",
  REFERRAL: "REFERRAL",
  ORGANIC: "ORGANIC",
  PAID_ADS: "PAID_ADS",
  SOCIAL_MEDIA: "SOCIAL_MEDIA",
} as const;

export type LeadSourceType = keyof typeof LeadSource;

export const LeadPriority = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  URGENT: "URGENT",
} as const;

export type LeadPriorityType = keyof typeof LeadPriority;

export const ActivityType = {
  CREATED: "CREATED",
  STATUS_CHANGED: "STATUS_CHANGED",
  CONTACTED: "CONTACTED",
  NOTE_ADDED: "NOTE_ADDED",
  ASSIGNED: "ASSIGNED",
  UPDATED: "UPDATED",
  TASK_CREATED: "TASK_CREATED",
  TASK_COMPLETED: "TASK_COMPLETED",
} as const;

export type ActivityTypeType = keyof typeof ActivityType;
