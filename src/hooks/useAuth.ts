import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'admin' | 'manager' | 'operator' | 'viewer';

export interface AuthUser {
    email: string;
    role: UserRole;
}

/**
 * Returns the currently logged-in user from sessionStorage (set at login).
 * Also listens for Supabase auth state changes for real sign-out events.
 */
export function useAuth() {
    const getUser = (): AuthUser | null => {
        try {
            const raw = sessionStorage.getItem('auth');
            return raw ? (JSON.parse(raw) as AuthUser) : null;
        } catch {
            return null;
        }
    };

    const [user, setUser] = useState<AuthUser | null>(getUser);

    useEffect(() => {
        // Keep state in sync when sessionStorage changes (e.g. logout in another tab)
        const onStorage = () => setUser(getUser());
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    const logout = () => {
        sessionStorage.removeItem('auth');
        setUser(null);
        supabase.auth.signOut(); // best-effort; non-blocking
        window.location.href = '/login';
    };

    const canManage = user?.role === 'admin' || user?.role === 'manager';
    const canDelete = user?.role === 'admin';

    return { user, logout, canManage, canDelete };
}
