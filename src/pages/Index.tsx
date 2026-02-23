import { useCallback, useState } from 'react';
import { GoogleMap, useJsApiLoader, OverlayViewF, OverlayView } from '@react-google-maps/api';
import { TAMIL_NADU_CENTER, Silo, getStatusColor } from '@/data/silos';
import { useSilos } from '@/hooks/useSilos';
import SiloInfoPanel from '@/components/SiloInfoPanel';
import SiloList from '@/components/SiloList';
import ManageSilos from '@/components/ManageSilos';
import ChangeCredentials from '@/components/ChangeCredentials';
import { getCurrentUser } from '@/lib/credentials';
import { Settings, Plus, Menu, User, LogOut } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useNavigate } from 'react-router-dom';

const MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#1a1d23' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1d23' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#5a6270' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#2d3240' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#252830' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1a1d23' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1117' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
];

const containerStyle = { width: '100%', height: '100%' };

const SiloMarker = ({ silo, isSelected, onClick }: { silo: Silo; isSelected: boolean; onClick: () => void }) => {
  const color = getStatusColor(silo.status);
  const size = isSelected ? 48 : 38;

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center transition-transform duration-200 hover:scale-110"
      style={{ transform: isSelected ? 'scale(1.15)' : undefined }}
      title={silo.name}
    >
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        {/* Silo body */}
        <rect x="14" y="16" width="20" height="24" rx="2" fill={color} fillOpacity="0.85" stroke={color} strokeWidth="1.5" />
        {/* Silo dome */}
        <ellipse cx="24" cy="16" rx="10" ry="6" fill={color} fillOpacity="0.65" stroke={color} strokeWidth="1.5" />
        {/* Grain lines */}
        <line x1="18" y1="28" x2="30" y2="28" stroke={`${color}`} strokeOpacity="0.4" strokeWidth="1" />
        <line x1="18" y1="32" x2="30" y2="32" stroke={`${color}`} strokeOpacity="0.4" strokeWidth="1" />
        <line x1="18" y1="36" x2="30" y2="36" stroke={`${color}`} strokeOpacity="0.4" strokeWidth="1" />
        {/* Base */}
        <rect x="12" y="39" width="24" height="3" rx="1" fill={color} fillOpacity="0.5" />
        {silo.status === 'critical' && (
          <circle cx="38" cy="10" r="6" fill="hsl(0, 72%, 55%)" className="animate-sensor-blink" />
        )}
      </svg>
      <span
        className="text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5 whitespace-nowrap"
        style={{ backgroundColor: `${color}30`, color }}
      >
        {silo.sensors.temperature}°C | {silo.sensors.humidity}%
      </span>
    </button>
  );
};

const Index = () => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [selectedSilo, setSelectedSilo] = useState<Silo | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [showManageSilos, setShowManageSilos] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const { silos, loading: silosLoading, error: silosError } = useSilos();

  const handleLogout = () => {
    sessionStorage.removeItem('auth');
    navigate('/login');
  };

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: 'AIzaSyAbjdHGqv709iK21S2Zj3u3MUJu9xBnfIQ',
  });

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const handleSiloSelect = (silo: Silo) => {
    setSelectedSilo(silo);
    map?.panTo({ lat: silo.lat, lng: silo.lng });
    map?.setZoom(12);
  };

  if (!isLoaded || silosLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">
            {silosLoading ? 'Loading Silo Data...' : 'Loading Silo Network Map...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden relative">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-[280px] xl:w-[300px] flex-shrink-0">
        <SiloList
          silos={silos}
          selectedId={selectedSilo?.id ?? null}
          onSelect={handleSiloSelect}
        />
      </div>

      {/* Map Area */}
      <div className="flex-1 relative">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={TAMIL_NADU_CENTER}
          zoom={7}
          onLoad={onLoad}
          options={{
            styles: MAP_STYLES,
            disableDefaultUI: true,
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
          }}
        >
          {silos.map((silo) => (
            <OverlayViewF
              key={silo.id}
              position={{ lat: silo.lat, lng: silo.lng }}
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            >
              <SiloMarker
                silo={silo}
                isSelected={selectedSilo?.id === silo.id}
                onClick={() => handleSiloSelect(silo)}
              />
            </OverlayViewF>
          ))}
        </GoogleMap>

        {/* Mobile & Tablet Menu Button */}
        <div className="absolute top-3 left-3 z-10 lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <button className="bg-card/90 backdrop-blur-sm border border-border p-2.5 rounded-xl shadow-lg hover:bg-muted transition-colors">
                <Menu size={20} />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[280px] sm:w-[300px]">
              <SiloList
                silos={silos}
                selectedId={selectedSilo?.id ?? null}
                onSelect={(silo) => {
                  handleSiloSelect(silo);
                }}
              />
            </SheetContent>
          </Sheet>
        </div>

        {/* Info Panel */}
        {selectedSilo && (
          <SiloInfoPanel silo={selectedSilo} onClose={() => setSelectedSilo(null)} />
        )}

        {/* Top Stats Bar */}
        <div className="absolute top-3 z-10 flex gap-2 overflow-x-auto pb-1 hide-scrollbar"
          style={{ left: '3.25rem', right: '3.25rem', maxWidth: 'calc(100% - 7rem)' }}>
          {[
            { label: 'Total Silos', value: silos.length },
            { label: 'Alerts', value: silos.filter((s) => s.status !== 'normal').length },
            { label: 'Critical', value: silos.filter((s) => s.status === 'critical').length },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-card/90 backdrop-blur-sm border border-border rounded-lg px-2.5 py-1.5 min-w-[80px] sm:min-w-[100px] flex-shrink-0"
            >
              <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              <p className="text-lg sm:text-xl font-bold font-mono text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* User Profile & Logout — top right, always visible */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
          <button
            onClick={() => setShowCredentials(true)}
            className="bg-card/90 backdrop-blur-sm border border-border flex items-center gap-2 px-2.5 py-2 rounded-xl shadow-lg hover:bg-muted transition-colors text-xs font-medium"
            title="Change credentials"
          >
            <User size={15} className="text-primary flex-shrink-0" />
            <span className="hidden sm:inline max-w-[120px] truncate text-muted-foreground">
              {currentUser?.email ?? currentUser?.role ?? 'Profile'}
            </span>
          </button>
          <button
            onClick={handleLogout}
            className="bg-card/90 backdrop-blur-sm border border-border p-2.5 rounded-xl shadow-lg hover:bg-destructive/20 hover:border-destructive/50 hover:text-destructive transition-colors"
            title="Sign out"
          >
            <LogOut size={15} />
          </button>
        </div>

        {/* Manage Silos Open Button — bottom right */}
        {!showManageSilos && (
          <div className="absolute bottom-6 right-4 z-10">
            <button
              onClick={() => setShowManageSilos(true)}
              className="bg-primary text-primary-foreground px-4 py-2.5 rounded-xl font-semibold shadow-xl hover:brightness-110 transition-all flex items-center gap-2 text-sm"
            >
              <Settings size={16} />
              <span>Manage Silos</span>
            </button>
          </div>
        )}
      </div>

      {/* Manage Silos Panel */}
      <ManageSilos
        silos={silos}
        isOpen={showManageSilos}
        onClose={() => setShowManageSilos(false)}
      />

      {/* Change Credentials Modal */}
      <ChangeCredentials
        isOpen={showCredentials}
        onClose={() => setShowCredentials(false)}
      />
    </div>
  );
};

export default Index;