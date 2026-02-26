// Default credentials (admin only — other roles don't need credentials)
export const DEFAULT_CREDENTIALS: Record<string, { email: string; password: string }> = {
  admin: { email: 'guruprasathveeramuthu@gmail.com', password: 'guru@03' },
};

const STORAGE_KEY = 'farmsense_credentials';

/** Load all credentials from localStorage, merged over defaults */
export function loadAllCredentials(): Record<string, { email: string; password: string }> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_CREDENTIALS };
    const stored = JSON.parse(raw) as Record<string, { email: string; password: string }>;
    // Merge: stored values override defaults
    return Object.fromEntries(
      Object.keys(DEFAULT_CREDENTIALS).map((role) => [
        role,
        stored[role] ?? DEFAULT_CREDENTIALS[role],
      ])
    );
  } catch {
    return { ...DEFAULT_CREDENTIALS };
  }
}

/** Get credentials for a specific role */
export function getCredentials(role: string): { email: string; password: string } {
  return loadAllCredentials()[role] ?? DEFAULT_CREDENTIALS[role];
}

/** Update credentials for a specific role */
export function updateCredentials(
  role: string,
  email: string,
  password: string
): void {
  const all = loadAllCredentials();
  all[role] = { email, password };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));

  // Also update the active session email if it's the same role
  const session = sessionStorage.getItem('auth');
  if (session) {
    const parsed = JSON.parse(session);
    if (parsed.role === role) {
      sessionStorage.setItem('auth', JSON.stringify({ ...parsed, email }));
    }
  }
}

/** Reset all credentials to defaults */
export function resetAllCredentials(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/** Get the current logged-in user's info from session */
export function getCurrentUser(): { email: string; role: string } | null {
  try {
    const raw = sessionStorage.getItem('auth');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
