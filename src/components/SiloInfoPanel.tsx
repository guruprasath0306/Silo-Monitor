import { useState } from 'react';
import { Silo, getStatusColor, getPestColor } from '@/data/silos';
import { Thermometer, Droplets, Bug, Wheat, Package, Wind, X, MapPin, Phone, Trash2, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { logSiloAction, SiloActionType } from '@/hooks/useSiloAction';
import { toast } from 'sonner';

interface SiloInfoPanelProps {
  silo: Silo;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

interface ActionConfig {
  type: SiloActionType;
  label: string;
  icon: React.ReactNode;
  description: string;
  confirmLabel: string;
  successMessage: (name: string) => string;
  warning?: (silo: Silo) => string | null;
}

const ACTIONS: ActionConfig[] = [
  {
    type: 'ventilate',
    label: 'Ventilate',
    icon: <Wind size={20} className="text-blue-400" />,
    description: 'This will activate the aeration system to regulate temperature and CO₂ levels in the silo.',
    confirmLabel: 'Start Ventilation',
    successMessage: (name) => `✅ Ventilation started for ${name}`,
    warning: (silo) => {
      if (silo.sensors.temperature <= 35 && (silo.sensors.co2Level ?? 0) <= 500) {
        return 'Temperature and CO₂ levels appear normal — ventilation may not be necessary right now.';
      }
      return null;
    },
  },
  {
    type: 'treat',
    label: 'Treat',
    icon: <Bug size={20} className="text-orange-400" />,
    description: 'This will initiate a pest control treatment (fumigation) for the silo.',
    confirmLabel: 'Confirm Treatment',
    successMessage: (name) => `🛡️ Pest treatment initiated for ${name}`,
    warning: (silo) => {
      if (silo.sensors.pestActivity === 'none') {
        return 'No pest activity detected — treatment may not be required at this time.';
      }
      return null;
    },
  },
];

const SiloInfoPanel = ({ silo, onClose, onDelete }: SiloInfoPanelProps) => {
  const { canDelete } = useAuth();
  const [activeAction, setActiveAction] = useState<SiloActionType | null>(null);
  const [confirming, setConfirming] = useState(false);
  const fillPercent = Math.round((silo.grainAmount / silo.capacity) * 100);

  const handleConfirm = async () => {
    if (!activeAction) return;
    setConfirming(true);
    const config = ACTIONS.find((a) => a.type === activeAction)!;
    await logSiloAction(silo.id, activeAction);
    toast.success(config.successMessage(silo.name));
    setConfirming(false);
    setActiveAction(null);
  };

  const handleCancel = () => {
    setActiveAction(null);
  };

  const currentConfig = ACTIONS.find((a) => a.type === activeAction);
  const warningMessage = currentConfig?.warning?.(silo) ?? null;

  return (
    <div className="absolute bottom-0 left-0 right-0 md:top-4 md:bottom-auto md:left-auto md:right-4 z-10 w-full md:w-[380px] lg:w-[400px] bg-card border-t md:border border-border rounded-t-2xl md:rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh] md:max-h-[calc(100vh-2rem)]">
      {/* Header */}
      <div
        className="p-4 flex items-center justify-between"
        style={{ borderBottom: `2px solid ${getStatusColor(silo.status)}` }}
      >
        <div>
          <h2 className="text-foreground font-bold text-lg">{silo.name}</h2>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${silo.lat},${silo.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground text-xs font-mono hover:text-primary hover:underline"
            title="Open in Google Maps"
          >
            {silo.lat.toFixed(4)}°N, {silo.lng.toFixed(4)}°E
          </a>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="px-2 py-1 rounded text-xs font-bold uppercase tracking-wider"
            style={{
              backgroundColor: `${getStatusColor(silo.status)}20`,
              color: getStatusColor(silo.status),
            }}
          >
            {silo.status}
          </span>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">

        {/* Inline Confirmation Dialog */}
        {activeAction && currentConfig && (
          <div className="m-4 rounded-xl border border-border bg-muted/60 backdrop-blur-sm p-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2 mb-2">
              {currentConfig.icon}
              <p className="font-bold text-foreground text-sm">{currentConfig.label} — {silo.name}</p>
            </div>
            <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
              {currentConfig.description}
            </p>

            {warningMessage && (
              <div className="flex items-start gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-3 py-2 mb-3">
                <AlertTriangle size={13} className="text-yellow-400 mt-0.5 shrink-0" />
                <p className="text-xs text-yellow-300 leading-relaxed">{warningMessage}</p>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="flex-1 py-1.5 text-xs font-semibold rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={confirming}
                className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-60 transition-opacity flex items-center justify-center gap-1.5"
              >
                {confirming ? (
                  <span className="animate-pulse">Processing…</span>
                ) : (
                  <>
                    <CheckCircle size={13} />
                    {currentConfig.confirmLabel}
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Sensor Grid */}
        <div className="p-4 grid grid-cols-2 gap-3">
          {/* Temperature */}
          <div className="bg-muted rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Thermometer size={16} className="text-sensor-temp" />
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Temperature</span>
            </div>
            <p className="text-2xl font-bold font-mono text-foreground">
              {silo.sensors.temperature}°C
            </p>
            <p className="text-xs text-muted-foreground">
              {silo.sensors.temperature > 35 ? '⚠ Above threshold' : '✓ Normal range'}
            </p>
          </div>

          {/* Humidity */}
          <div className="bg-muted rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Droplets size={16} className="text-sensor-humidity" />
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Humidity</span>
            </div>
            <p className="text-2xl font-bold font-mono text-foreground">
              {silo.sensors.humidity}%
            </p>
            <p className="text-xs text-muted-foreground">
              {silo.sensors.humidity > 75 ? '⚠ Too humid' : '✓ Normal range'}
            </p>
          </div>

          {/* Pest Activity */}
          <div className="bg-muted rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Bug size={16} className="text-sensor-pest" />
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Pest Activity</span>
            </div>
            <p
              className="text-2xl font-bold font-mono capitalize"
              style={{ color: getPestColor(silo.sensors.pestActivity) }}
            >
              {silo.sensors.pestActivity}
            </p>
          </div>

          {/* CO2 */}
          <div className="bg-muted rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Wind size={16} className="text-accent" />
              <span className="text-xs text-muted-foreground uppercase tracking-wide">CO₂ Level</span>
            </div>
            <p className="text-2xl font-bold font-mono text-foreground">
              {silo.sensors.co2Level ?? '—'} <span className="text-sm text-muted-foreground">ppm</span>
            </p>
          </div>
        </div>

        {/* Grain Info */}
        <div className="px-4 pb-4">
          <div className="bg-muted rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Wheat size={16} className="text-sensor-grain" />
                <span className="text-sm font-semibold text-foreground">{silo.grainType}</span>
              </div>
              <div className="flex items-center gap-1">
                <Package size={14} className="text-muted-foreground" />
                <span className="text-sm font-mono text-foreground">
                  {silo.grainAmount}/{silo.capacity}t
                </span>
              </div>
            </div>
            {/* Fill bar */}
            <div className="w-full h-3 bg-background rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${fillPercent}%`,
                  backgroundColor: fillPercent > 90 ? 'hsl(0, 72%, 55%)' : fillPercent > 70 ? 'hsl(35, 70%, 55%)' : 'hsl(142, 50%, 45%)',
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1 text-right">{fillPercent}% filled</p>
          </div>
        </div>

        {/* Footer — Action Buttons */}
        <div className="px-4 pb-3 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Last updated: {new Date(silo.lastUpdated).toLocaleTimeString()}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveAction('ventilate')}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition-all ${activeAction === 'ventilate'
                  ? 'bg-blue-500 text-white shadow-[0_0_8px_2px_rgba(59,130,246,0.4)]'
                  : 'bg-primary text-primary-foreground hover:opacity-90'
                }`}
            >
              Ventilate
            </button>
            <button
              onClick={() => setActiveAction('treat')}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition-all ${activeAction === 'treat'
                  ? 'bg-orange-500 text-white shadow-[0_0_8px_2px_rgba(249,115,22,0.4)]'
                  : 'bg-secondary text-secondary-foreground hover:opacity-90'
                }`}
            >
              Treat
            </button>
          </div>
        </div>

        {/* Owner Contact */}
        {silo.ownerPhone && (
          <div className="px-4 pb-3">
            <div className="bg-muted rounded-lg px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-0.5">Owner Contact</p>
                <a
                  href={`tel:${silo.ownerPhone.replace(/\s+/g, '')}`}
                  className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
                >
                  {silo.ownerPhone}
                </a>
              </div>
              <a
                href={`tel:${silo.ownerPhone.replace(/\s+/g, '')}`}
                className="w-10 h-10 rounded-full bg-green-500/15 flex items-center justify-center hover:bg-green-500/30 transition-colors"
                title="Call owner"
              >
                <Phone size={18} className="text-green-500" />
              </a>
            </div>
          </div>
        )}

        {/* Google Maps Link */}
        <div className="px-4 pb-4 pb-safe">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${silo.lat},${silo.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-border text-xs font-semibold text-muted-foreground hover:text-primary hover:border-primary hover:bg-primary/5 transition-colors"
          >
            <MapPin size={14} />
            Open in Google Maps
          </a>
        </div>

        {/* Delete Silo */}
        {canDelete && onDelete && (
          <div className="px-4 pb-4">
            <button
              onClick={() => {
                if (confirm(`Delete "${silo.name}"? This cannot be undone.`)) {
                  onDelete(silo.id);
                  onClose();
                }
              }}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-destructive/40 text-xs font-semibold text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
            >
              <Trash2 size={14} />
              Delete Silo
            </button>
          </div>
        )}
      </div>{/* end scrollable content */}
    </div>
  );
};

export default SiloInfoPanel;
