export interface SiloSensor {
  temperature: number; // °C
  humidity: number; // %
  pestActivity: 'none' | 'low' | 'moderate' | 'high';
  co2Level?: number; // ppm
}

export interface Silo {
  id: string;
  name: string;
  lat: number;
  lng: number;
  grainType: string;
  grainAmount: number; // tonnes
  capacity: number; // tonnes
  sensors: SiloSensor;
  status: 'normal' | 'warning' | 'critical';
  lastUpdated: string;
  ownerPhone?: string;
}

export const SILOS: Silo[] = [
  {
    id: 'silo-001',
    name: 'Thanjavur Silo A1',
    lat: 10.7870,
    lng: 79.1378,
    grainType: 'Rice (Ponni)',
    grainAmount: 420,
    capacity: 500,
    sensors: { temperature: 28.5, humidity: 62, pestActivity: 'none', co2Level: 380 },
    status: 'normal',
    lastUpdated: '2026-02-09T08:30:00',
  },
  {
    id: 'silo-002',
    name: 'Thanjavur Silo A2',
    lat: 10.7900,
    lng: 79.1420,
    grainType: 'Wheat',
    grainAmount: 310,
    capacity: 500,
    sensors: { temperature: 34.2, humidity: 78, pestActivity: 'moderate', co2Level: 520 },
    status: 'warning',
    lastUpdated: '2026-02-09T08:28:00',
  },
  {
    id: 'silo-003',
    name: 'Madurai Storage B1',
    lat: 9.9252,
    lng: 78.1198,
    grainType: 'Maize',
    grainAmount: 180,
    capacity: 300,
    sensors: { temperature: 30.1, humidity: 55, pestActivity: 'low', co2Level: 400 },
    status: 'normal',
    lastUpdated: '2026-02-09T08:25:00',
  },
  {
    id: 'silo-004',
    name: 'Coimbatore Silo C1',
    lat: 11.0168,
    lng: 76.9558,
    grainType: 'Rice (Basmati)',
    grainAmount: 490,
    capacity: 500,
    sensors: { temperature: 38.7, humidity: 85, pestActivity: 'high', co2Level: 680 },
    status: 'critical',
    lastUpdated: '2026-02-09T08:32:00',
  },
  {
    id: 'silo-005',
    name: 'Trichy Silo D1',
    lat: 10.7905,
    lng: 78.7047,
    grainType: 'Millet (Ragi)',
    grainAmount: 220,
    capacity: 400,
    sensors: { temperature: 27.3, humidity: 48, pestActivity: 'none', co2Level: 350 },
    status: 'normal',
    lastUpdated: '2026-02-09T08:20:00',
  },
  {
    id: 'silo-006',
    name: 'Salem Storage E1',
    lat: 11.6643,
    lng: 78.1460,
    grainType: 'Groundnut',
    grainAmount: 150,
    capacity: 250,
    sensors: { temperature: 31.5, humidity: 70, pestActivity: 'low', co2Level: 410 },
    status: 'normal',
    lastUpdated: '2026-02-09T08:18:00',
  },
  {
    id: 'silo-007',
    name: 'Erode Silo F1',
    lat: 11.3410,
    lng: 77.7172,
    grainType: 'Turmeric',
    grainAmount: 95,
    capacity: 200,
    sensors: { temperature: 36.0, humidity: 82, pestActivity: 'moderate', co2Level: 590 },
    status: 'warning',
    lastUpdated: '2026-02-09T08:15:00',
  },
  {
    id: 'silo-008',
    name: 'Tirunelveli Silo G1',
    lat: 8.7139,
    lng: 77.7567,
    grainType: 'Rice (Seeraga Samba)',
    grainAmount: 340,
    capacity: 400,
    sensors: { temperature: 29.8, humidity: 60, pestActivity: 'none', co2Level: 370 },
    status: 'normal',
    lastUpdated: '2026-02-09T08:22:00',
  },
  {
    id: 'silo-009',
    name: 'Vellore Silo H1',
    lat: 12.9165,
    lng: 79.1325,
    grainType: 'Maize',
    grainAmount: 260,
    capacity: 350,
    sensors: { temperature: 33.2, humidity: 72, pestActivity: 'low', co2Level: 450 },
    status: 'warning',
    lastUpdated: '2026-02-20T10:00:00',
  },
  {
    id: 'silo-010',
    name: 'Kancheepuram Silo I1',
    lat: 12.8342,
    lng: 79.7036,
    grainType: 'Rice (Ponni)',
    grainAmount: 380,
    capacity: 500,
    sensors: { temperature: 29.0, humidity: 58, pestActivity: 'none', co2Level: 360 },
    status: 'normal',
    lastUpdated: '2026-02-20T10:05:00',
  },
  {
    id: 'silo-011',
    name: 'Tiruppur Silo J1',
    lat: 11.1085,
    lng: 77.3411,
    grainType: 'Groundnut',
    grainAmount: 110,
    capacity: 200,
    sensors: { temperature: 37.8, humidity: 80, pestActivity: 'high', co2Level: 720 },
    status: 'critical',
    lastUpdated: '2026-02-20T10:10:00',
  },
  {
    id: 'silo-012',
    name: 'Dindigul Silo K1',
    lat: 10.3624,
    lng: 77.9695,
    grainType: 'Millet (Bajra)',
    grainAmount: 195,
    capacity: 300,
    sensors: { temperature: 28.0, humidity: 52, pestActivity: 'none', co2Level: 340 },
    status: 'normal',
    lastUpdated: '2026-02-20T10:15:00',
  },
];

export const TAMIL_NADU_CENTER = { lat: 10.8505, lng: 78.6 };

export function getStatusColor(status: Silo['status']): string {
  switch (status) {
    case 'normal': return 'hsl(142, 50%, 45%)';
    case 'warning': return 'hsl(35, 70%, 55%)';
    case 'critical': return 'hsl(0, 72%, 55%)';
  }
}

export function getPestColor(level: SiloSensor['pestActivity']): string {
  switch (level) {
    case 'none': return 'hsl(142, 50%, 45%)';
    case 'low': return 'hsl(200, 60%, 50%)';
    case 'moderate': return 'hsl(35, 70%, 55%)';
    case 'high': return 'hsl(0, 72%, 55%)';
  }
}
