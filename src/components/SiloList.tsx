import { Silo, getStatusColor } from '@/data/silos';
import { Thermometer, Droplets, Bug, AlertTriangle, CheckCircle, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface SiloListProps {
  silos: Silo[];
  selectedId: string | null;
  onSelect: (silo: Silo) => void;
}

const ROLE_COLORS: Record<string, string> = {
  admin: 'hsl(0, 72%, 55%)',
  manager: 'hsl(35, 70%, 55%)',
  operator: 'hsl(200, 60%, 50%)',
  viewer: 'hsl(142, 50%, 45%)',
};

const SiloList = ({ silos, selectedId, onSelect }: SiloListProps) => {
  const { user, logout } = useAuth();
  const statusOrder = { critical: 0, warning: 1, normal: 2 };
  const sorted = [...silos].sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

  return (
    <div className="h-full bg-card border-r border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <h1 className="text-xl font-bold text-foreground tracking-tight">🌾 Silo Monitor</h1>
        <p className="text-xs text-muted-foreground mt-1">Tamil Nadu Grain Storage Network</p>
        <div className="flex gap-3 mt-3">
          {(['normal', 'warning', 'critical'] as const).map((s) => (
            <div key={s} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getStatusColor(s) }} />
              <span className="text-xs text-muted-foreground capitalize">{s}</span>
              <span className="text-xs font-mono text-foreground">
                {silos.filter((x) => x.status === s).length}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {sorted.map((silo) => (
          <button
            key={silo.id}
            onClick={() => onSelect(silo)}
            className={`w-full text-left p-3 border-b border-border transition-colors hover:bg-muted ${selectedId === silo.id ? 'bg-muted' : ''
              }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-foreground truncate pr-2">{silo.name}</span>
              {silo.status === 'critical' ? (
                <AlertTriangle size={14} className="text-destructive flex-shrink-0" />
              ) : silo.status === 'warning' ? (
                <AlertTriangle size={14} className="text-warning flex-shrink-0" />
              ) : (
                <CheckCircle size={14} className="text-success flex-shrink-0" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-2">{silo.grainType}</p>
            <div className="flex gap-3 text-xs font-mono">
              <span className="flex items-center gap-1 text-sensor-temp">
                <Thermometer size={11} /> {silo.sensors.temperature}°
              </span>
              <span className="flex items-center gap-1 text-sensor-humidity">
                <Droplets size={11} /> {silo.sensors.humidity}%
              </span>
              <span className="flex items-center gap-1 text-sensor-pest">
                <Bug size={11} /> {silo.sensors.pestActivity}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* User Info Footer */}
      {user && (
        <div className="border-t border-border p-3 bg-card flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground truncate">{user.email}</p>
            <span
              className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
              style={{
                backgroundColor: `${ROLE_COLORS[user.role] ?? '#888'}25`,
                color: ROLE_COLORS[user.role] ?? '#888',
              }}
            >
              {user.role}
            </span>
          </div>
          <button
            onClick={logout}
            className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default SiloList;
