import { supabase } from '@/integrations/supabase/client';

export type SiloActionType = 'ventilate' | 'treat';

/**
 * Logs a silo action (ventilate / treat) to the `silo_actions` table in Supabase.
 * This is fire-and-forget — any error is silently swallowed so the UI
 * works even if the table does not yet exist.
 */
export async function logSiloAction(siloId: string, action: SiloActionType): Promise<void> {
    try {
        await (supabase as any)
            .from('silo_actions')
            .insert({ silo_id: siloId, action, performed_at: new Date().toISOString() });
    } catch {
        // Silently ignore — table may not exist yet
    }
}
