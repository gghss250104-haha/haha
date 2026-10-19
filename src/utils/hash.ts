/**
 * Generate a deterministic safe string ID and hash using SHA-256 via Web Crypto API.
 */
export async function sha256(message: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Creates a unique valid Firestore document ID from nickname and password.
 * Distinguishes users even with identical nicknames if passwords differ.
 */
export async function generateStudentId(nickname: string, password: string): Promise<string> {
  const rawKey = `${nickname.trim().toLowerCase()}__${password.trim()}`;
  const hash = await sha256(rawKey);
  // Safe alphanumeric ID matching Firestore rules ^[a-zA-Z0-9_\-]+$
  return `stu_${hash.slice(0, 24)}`;
}

export async function hashPassword(password: string): Promise<string> {
  return sha256(`salt_circulatory_${password.trim()}`);
}
