import { ConvexError } from "convex/values";

/**
 * Error codes for the application
 */
export const ErrorCode = {
  // Auth
  NOT_AUTHENTICATED: "NOT_AUTHENTICATED",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  USER_INACTIVE: "USER_INACTIVE",
  INSUFFICIENT_PERMISSIONS: "INSUFFICIENT_PERMISSIONS",

  // Orgs
  ORG_NOT_FOUND: "ORG_NOT_FOUND",
  ORG_SLUG_EXISTS: "ORG_SLUG_EXISTS",
  MEMBER_ALREADY_EXISTS: "MEMBER_ALREADY_EXISTS",
  MEMBER_NOT_FOUND: "MEMBER_NOT_FOUND",
  CANNOT_REMOVE_SELF: "CANNOT_REMOVE_SELF",

  // Services
  SERVICE_NOT_FOUND: "SERVICE_NOT_FOUND",
  SERVICE_SLUG_EXISTS: "SERVICE_SLUG_EXISTS",
  SERVICE_ALREADY_ACTIVATED: "SERVICE_ALREADY_ACTIVATED",
  SERVICE_NOT_AVAILABLE: "SERVICE_NOT_AVAILABLE",

  // Requests
  REQUEST_NOT_FOUND: "REQUEST_NOT_FOUND",
  REQUEST_NOT_DRAFT: "REQUEST_NOT_DRAFT",
  REQUEST_CANNOT_CANCEL: "REQUEST_CANNOT_CANCEL",

  // Appointments
  SLOT_NOT_AVAILABLE: "SLOT_NOT_AVAILABLE",
  SLOT_FULLY_BOOKED: "SLOT_FULLY_BOOKED",
  SLOT_HAS_BOOKINGS: "SLOT_HAS_BOOKINGS",
  APPOINTMENT_ALREADY_EXISTS: "APPOINTMENT_ALREADY_EXISTS",
  APPOINTMENT_ALREADY_CANCELLED: "APPOINTMENT_ALREADY_CANCELLED",

  // Documents
  DOCUMENT_NOT_FOUND: "DOCUMENT_NOT_FOUND",

  // Profiles
  PROFILE_NOT_FOUND: "PROFILE_NOT_FOUND",
  PROFILE_ALREADY_EXISTS: "PROFILE_ALREADY_EXISTS",

  // Posts
  POST_NOT_FOUND: "POST_NOT_FOUND",
  POST_SLUG_EXISTS: "POST_SLUG_EXISTS",
  POST_DOCUMENT_REQUIRED: "POST_DOCUMENT_REQUIRED",

  // Generic
  NOT_FOUND: "NOT_FOUND",
  ALREADY_EXISTS: "ALREADY_EXISTS",
  VALIDATION_ERROR: "VALIDATION_ERROR",
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

/**
 * Create a standardized ConvexError
 */
export function error(code: ErrorCode, message?: string): ConvexError<string> {
  return new ConvexError(message ?? code);
}

/**
 * Throw if condition is false
 */
export function ensure(
  condition: unknown,
  code: ErrorCode,
  message?: string
): asserts condition {
  if (!condition) {
    throw error(code, message);
  }
}
