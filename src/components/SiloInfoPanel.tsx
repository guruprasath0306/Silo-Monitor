import { Silo, getStatusColor, getPestColor } from '@/data/silos';
import { Thermometer, Droplets, Bug, Wheat, Package, Wind, X, MapPin } from 'lucide-react';

interface SiloInfoPanelProps {
  silo: Silo;
  onClose: () => void;
}

const SiloInfoPanel = ({ silo, onClose }: SiloInfoPanelProps) => {
  const fillPercent = Math.round((silo.grainAmount / silo.capacity) * 100);

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

        {/* Footer */}
        <div className="px-4 pb-3 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Last updated: {new Date(silo.lastUpdated).toLocaleTimeString()}
          </p>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 text-xs font-semibold rounded bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
              Ventilate
            </button>
            <button className="px-3 py-1.5 text-xs font-semibold rounded bg-secondary text-secondary-foreground hover:opacity-90 transition-opacity">
              Treat
            </button>
          </div>
        </div>

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
      </div>{/* end scrollable content */}
    </div>
  );
};

export default SiloInfoPanel;
