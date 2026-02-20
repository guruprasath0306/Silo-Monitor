// Default credentials (fallback if user hasn't changed them)
export const DEFAULT_CREDENTIALS: Record<string, { email: string; password: string }> = {
  admin:    { email: 'admin@farmsense.io',    password: 'admin123' },
  manager:  { email: 'manager@farmsense.io',  password: 'manager123' },
  operator: { email: 'operator@farmsense.io', password: 'operator123' },
  viewer:   { email: 'viewer@farmsense.io',   password: 'viewer123' },
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
