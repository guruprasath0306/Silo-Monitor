import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Silo, SiloSensor } from '@/data/silos';

export function useSilos() {
  const [silos, setSilos] = useState<Silo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mapRow = (row: any): Silo => ({
    id: row.id,
    name: row.name,
    lat: row.latitude,
    lng: row.longitude,
    grainType: row.grain_type,
    grainAmount: Number(row.grain_amount),
    capacity: Number(row.capacity),
    sensors: {
      temperature: Number(row.temperature),
      humidity: Number(row.humidity),
      pestActivity: row.pest_activity as SiloSensor['pestActivity'],
      co2Level: row.co2_level ? Number(row.co2_level) : undefined,
    },
    status: row.status as Silo['status'],
    lastUpdated: row.last_updated,
  });

  useEffect(() => {
    const fetchSilos = async () => {
      const { data, error: fetchError } = await supabase
        .from('silos')
        .select('*')
        .order('name');

      if (fetchError) {
        setError(fetchError.message);
        setLoading(false);
        return;
      }

      setSilos((data ?? []).map(mapRow));
      setLoading(false);
    };

    fetchSilos();

    // Realtime subscription
    const channel = supabase
      .channel('silos-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'silos' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setSilos((prev) => [...prev, mapRow(payload.new)]);
          } else if (payload.eventType === 'UPDATE') {
            setSilos((prev) =>
              prev.map((s) => (s.id === payload.new.id ? mapRow(payload.new) : s))
            );
          } else if (payload.eventType === 'DELETE') {
            setSilos((prev) => prev.filter((s) => s.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { silos, loading, error };
}
