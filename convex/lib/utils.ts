/**
 * Helper pour filtrer les documents soft-deleted
 */
export function notDeleted<T extends { deletedAt?: number }>(docs: T[]): T[] {
  return docs.filter((d) => !d.deletedAt);
}

/**
 * Generate a unique reference number
 */
export function generateReferenceNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `REQ-${timestamp}-${random}`;
}

/**
 * Calculate profile completion score
 */
export function calculateCompletionScore(profile: {
  identity: {
    firstName?: string;
    lastName?: string;
    birthDate?: number;
    birthPlace?: string;
    gender?: string;
    nationality?: string;
  };
  passportInfo?: { number?: string };
  addresses?: {
    residence?: object;
    homeland?: object;
  };
  contacts?: {
    phone?: string;
    email?: string;
    emergency?: unknown[];
  };
  family?: {
    maritalStatus?: string;
  };
}): number {
  let filled = 0;
  let total = 0;

  // Identity (core fields)
  total += 6;
  if (profile.identity.firstName) filled++;
  if (profile.identity.lastName) filled++;
  if (profile.identity.birthDate) filled++;
  if (profile.identity.birthPlace) filled++;
  if (profile.identity.gender) filled++;
  if (profile.identity.nationality) filled++;

  // Passport
  total += 1;
  if (profile.passportInfo?.number) filled++;

  // Addresses
  total += 2;
  if (profile.addresses?.residence) filled++;
  if (profile.addresses?.homeland) filled++;

  // Contacts
  total += 3;
  if (profile.contacts?.phone) filled++;
  if (profile.contacts?.email) filled++;
  if (profile.contacts?.emergency && profile.contacts.emergency.length > 0)
    filled++;

  // Family
  total += 1;
  if (profile.family?.maritalStatus) filled++;

  return Math.round((filled / total) * 100);
}
