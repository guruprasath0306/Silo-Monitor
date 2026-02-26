import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Silo, SiloSensor, SILOS } from '@/data/silos';

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
    ownerPhone: row.owner_phone ?? undefined,
  });

  const fetchSilos = async () => {
    const { data, error: fetchError } = await supabase
      .from('silos')
      .select('*')
      .order('name');

    if (fetchError) {
      setError(fetchError.message);
      // Show static silos as fallback so the map isn't empty
      setSilos(SILOS);
      setLoading(false);
      return;
    }

    if (data && data.length > 0) {
      // Supabase has data — use it (this is the source of truth for all devices)
      setSilos(data.map(mapRow));
      setLoading(false);
    } else {
      // First time: table is empty — seed it with the 12 static silos
      const seedRows = SILOS.map((s) => ({
        name: s.name,
        latitude: s.lat,
        longitude: s.lng,
        grain_type: s.grainType,
        grain_amount: s.grainAmount,
        capacity: s.capacity,
        status: s.status,
        temperature: s.sensors.temperature,
        humidity: s.sensors.humidity,
        pest_activity: s.sensors.pestActivity,
        co2_level: s.sensors.co2Level ?? null,
        last_updated: s.lastUpdated,
        owner_phone: s.ownerPhone ?? null,
      }));

      const { error: seedError } = await supabase.from('silos').insert(seedRows);

      if (seedError) {
        console.warn('Seeding failed, using static data:', seedError.message);
        setSilos(SILOS);
        setLoading(false);
        return;
      }

      // Fetch again to get real DB-assigned UUIDs
      const { data: seeded } = await supabase.from('silos').select('*').order('name');
      setSilos(seeded ? seeded.map(mapRow) : SILOS);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSilos();

    // Realtime subscription — keeps all devices in sync
    const channel = supabase
      .channel('silos-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'silos' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setSilos((prev) => {
              // Avoid duplicates (in case the adding device also optimistically added it)
              if (prev.some((s) => s.id === payload.new.id)) return prev;
              return [...prev, mapRow(payload.new)];
            });
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

  return { silos, setSilos, loading, error, refetch: fetchSilos };
}
