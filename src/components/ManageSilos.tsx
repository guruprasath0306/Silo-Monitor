import { useEffect, useState } from 'react';
import { Silo, getStatusColor } from '@/data/silos';
import { X, Trash2, Wheat, MapPin, ShieldAlert, Pencil, Check, Navigation } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface ManageSilosProps {
    silos: Silo[];
    isOpen: boolean;
    onClose: () => void;
    onSiloAdded?: (silo: Silo) => void;
    onSiloDeleted?: (id: string) => void;
    onSiloUpdated?: (silo: Silo) => void;
    /** True when parent is in map-pick mode */
    pickingLocation?: boolean;
    onTogglePickLocation?: () => void;
    /** Coords pushed from a map click — auto-fills lat/lng */
    pickedCoords?: { lat: number; lng: number } | null;
}

const GRAIN_TYPES = ['Rice', 'Wheat', 'Maize', 'Millet'];

const ManageSilos = ({
    silos, isOpen, onClose,
    onSiloAdded, onSiloDeleted, onSiloUpdated,
    pickingLocation, onTogglePickLocation, pickedCoords,
}: ManageSilosProps) => {
    const { user, canManage, canDelete } = useAuth();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '', location: '', lat: '', lng: '',
        grainType: 'Rice', amount: '', capacity: '', phone: '',
    });

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editData, setEditData] = useState<{
        name: string; grainType: string; amount: string; capacity: string; phone: string;
    }>({ name: '', grainType: 'Rice', amount: '', capacity: '', phone: '' });

    // Auto-fill lat/lng when the user clicks on the map (in pick mode)
    useEffect(() => {
        if (pickedCoords) {
            setFormData((prev) => ({
                ...prev,
                lat: pickedCoords.lat.toFixed(6),
                lng: pickedCoords.lng.toFixed(6),
            }));
        }
    }, [pickedCoords]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleGrainTypeSelect = (type: string) => {
        setFormData((prev) => ({ ...prev, grainType: type }));
    };

    // ─── ADD new silo (local-first, Supabase in background) ─────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const now = new Date().toISOString();

            const newSilo: Silo = {
                id: `local-${Date.now()}`,
                name: formData.name,
                lat: parseFloat(formData.lat),
                lng: parseFloat(formData.lng),
                grainType: formData.grainType,
                grainAmount: parseFloat(formData.amount),
                capacity: parseFloat(formData.capacity),
                sensors: { temperature: 25, humidity: 50, pestActivity: 'none', co2Level: 400 },
                status: 'normal',
                lastUpdated: now,
                ownerPhone: formData.phone || undefined,
            };
            onSiloAdded?.(newSilo);
            toast.success(`"${formData.name}" added to map!`);
            setFormData({ name: '', location: '', lat: '', lng: '', grainType: 'Rice', amount: '', capacity: '', phone: '' });

            // Turn off pick mode after adding
            if (pickingLocation) onTogglePickLocation?.();

            supabase.from('silos').insert({
                name: newSilo.name,
                latitude: newSilo.lat,
                longitude: newSilo.lng,
                grain_type: newSilo.grainType,
                grain_amount: newSilo.grainAmount,
                capacity: newSilo.capacity,
                status: 'normal',
                temperature: 25,
                humidity: 50,
                pest_activity: 'none',
                co2_level: 400,
                last_updated: now,
                owner_phone: formData.phone || null,
            }).then(({ error }) => {
                if (error) console.warn('Supabase sync failed:', error.message);
            });

        } catch (error: any) {
            toast.error('Failed to add silo: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // ─── DELETE ──────────────────────────────────────────────────────────────
    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this silo?')) return;
        onSiloDeleted?.(id);
        toast.success('Silo deleted');
        supabase.from('silos').delete().eq('id', id).then(({ error }) => {
            if (error) console.warn('Supabase delete failed:', error.message);
        });
    };

    // ─── EDIT ────────────────────────────────────────────────────────────────
    const startEdit = (silo: Silo) => {
        setEditingId(silo.id);
        setEditData({
            name: silo.name,
            grainType: silo.grainType,
            amount: String(silo.grainAmount),
            capacity: String(silo.capacity),
            phone: silo.ownerPhone ?? '',
        });
    };

    const handleUpdate = (silo: Silo) => {
        const now = new Date().toISOString();
        const updated: Silo = {
            ...silo,
            name: editData.name,
            grainType: editData.grainType,
            grainAmount: parseFloat(editData.amount) || silo.grainAmount,
            capacity: parseFloat(editData.capacity) || silo.capacity,
            ownerPhone: editData.phone || undefined,
            lastUpdated: now,
        };
        onSiloUpdated?.(updated);
        toast.success(`"${updated.name}" updated!`);
        setEditingId(null);

        if (!silo.id.startsWith('local-')) {
            supabase.from('silos').update({
                name: updated.name,
                grain_type: updated.grainType,
                grain_amount: updated.grainAmount,
                capacity: updated.capacity,
                owner_phone: updated.ownerPhone ?? null,
                last_updated: now,
            }).eq('id', silo.id).then(({ error }) => {
                if (error) console.warn('Supabase update failed:', error.message);
            });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="absolute top-0 right-0 h-full w-full sm:w-[420px] md:w-[440px] bg-background border-l border-border shadow-2xl z-20 flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-border flex items-center justify-between bg-card">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Manage Silos</h2>
                    <p className="text-muted-foreground text-sm">{silos.length} silos registered</p>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-xl transition-colors border border-transparent hover:border-destructive/30"
                    title="Close"
                >
                    <X size={22} className="text-muted-foreground" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 pb-safe">

                {!canManage && (
                    <div className="flex items-center gap-3 bg-muted rounded-xl border border-border px-4 py-3">
                        <ShieldAlert size={18} className="text-warning flex-shrink-0" />
                        <p className="text-sm text-muted-foreground">
                            You have <strong className="text-foreground capitalize">{user?.role}</strong> access — view only.
                        </p>
                    </div>
                )}

                {/* Add New Silo Form */}
                {canManage && (
                    <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
                        <h3 className="font-semibold text-lg mb-4">Add New Silo</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">Silo Name *</label>
                                <input
                                    required
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Chennai Silo G7"
                                    className="w-full min-h-[44px] px-3 py-2.5 bg-muted rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">Location Name</label>
                                <input
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Chennai, Tamil Nadu"
                                    className="w-full min-h-[44px] px-3 py-2.5 bg-muted rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>

                            {/* Lat / Lng with Pick from Map button */}
                            <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-medium text-muted-foreground">Coordinates *</label>
                                    {onTogglePickLocation && (
                                        <button
                                            type="button"
                                            onClick={onTogglePickLocation}
                                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${pickingLocation
                                                ? 'bg-primary text-primary-foreground border-primary animate-pulse'
                                                : 'bg-muted text-muted-foreground border-border hover:border-primary hover:text-primary'
                                                }`}
                                        >
                                            <Navigation size={12} />
                                            {pickingLocation ? 'Click on map…' : 'Pick on Map'}
                                        </button>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        required
                                        type="number"
                                        step="any"
                                        name="lat"
                                        value={formData.lat}
                                        onChange={handleInputChange}
                                        placeholder="Latitude"
                                        className="w-full min-h-[44px] px-3 py-2.5 bg-muted rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                    <input
                                        required
                                        type="number"
                                        step="any"
                                        name="lng"
                                        value={formData.lng}
                                        onChange={handleInputChange}
                                        placeholder="Longitude"
                                        className="w-full min-h-[44px] px-3 py-2.5 bg-muted rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                                {pickingLocation && (
                                    <p className="text-xs text-primary mt-1">
                                        📍 Tap any spot on the map to set the exact location
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-muted-foreground">Grain Type</label>
                                <div className="flex flex-wrap gap-2">
                                    {GRAIN_TYPES.map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => handleGrainTypeSelect(type)}
                                            className={`px-3 py-1.5 rounded-lg text-sm transition-colors border ${formData.grainType === type
                                                ? 'bg-primary/10 border-primary text-primary font-medium'
                                                : 'bg-muted border-transparent text-muted-foreground hover:bg-muted/80'
                                                }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground">Amount (tons) *</label>
                                    <input
                                        required
                                        type="number"
                                        name="amount"
                                        value={formData.amount}
                                        onChange={handleInputChange}
                                        placeholder="e.g. 200"
                                        className="w-full min-h-[44px] px-3 py-2.5 bg-muted rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground">Capacity (tons) *</label>
                                    <input
                                        required
                                        type="number"
                                        name="capacity"
                                        value={formData.capacity}
                                        onChange={handleInputChange}
                                        placeholder="e.g. 500"
                                        className="w-full min-h-[44px] px-3 py-2.5 bg-muted rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">Owner Mobile Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder="e.g. +91 98765 43210"
                                    className="w-full min-h-[44px] px-3 py-2.5 bg-muted rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                                ) : (
                                    <>
                                        <MapPin size={18} />
                                        Add Silo to Map
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                )}

                {/* Registered Silos List */}
                <div className="space-y-3">
                    <h3 className="font-semibold text-lg">Registered Silos</h3>
                    <div className="space-y-3">
                        {silos.map((silo) => (
                            <div
                                key={silo.id}
                                className="bg-card border border-border rounded-xl shadow-sm overflow-hidden"
                            >
                                <div className="p-3 flex items-center gap-3">
                                    <div
                                        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                                        style={{ backgroundColor: `${getStatusColor(silo.status)}20` }}
                                    >
                                        <Wheat size={20} style={{ color: getStatusColor(silo.status) }} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-sm truncate">{silo.name}</h4>
                                        <a
                                            href={`https://www.google.com/maps/search/?api=1&query=${silo.lat},${silo.lng}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-muted-foreground truncate hover:text-primary hover:underline"
                                        >
                                            {silo.lat.toFixed(4)}, {silo.lng.toFixed(4)}
                                        </a>
                                        <span className="text-xs text-muted-foreground"> · {silo.grainType}</span>
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                        <span
                                            className="px-2 py-0.5 rounded text-[10px] font-medium uppercase"
                                            style={{
                                                backgroundColor: `${getStatusColor(silo.status)}20`,
                                                color: getStatusColor(silo.status),
                                            }}
                                        >
                                            {silo.status}
                                        </span>
                                        {canManage && (
                                            <button
                                                onClick={() => editingId === silo.id ? setEditingId(null) : startEdit(silo)}
                                                className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                title="Edit silo"
                                            >
                                                <Pencil size={15} />
                                            </button>
                                        )}
                                        {canDelete && (
                                            <button
                                                onClick={() => handleDelete(silo.id)}
                                                className="p-2 text-destructive/80 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                                title="Delete silo"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Inline edit form */}
                                {editingId === silo.id && (
                                    <div className="border-t border-border bg-muted/40 p-3 space-y-3">
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Edit Silo</p>

                                        <div className="space-y-1">
                                            <label className="text-xs text-muted-foreground">Name</label>
                                            <input
                                                value={editData.name}
                                                onChange={(e) => setEditData(p => ({ ...p, name: e.target.value }))}
                                                className="w-full min-h-[40px] px-3 py-2 bg-background rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-xs text-muted-foreground">Grain Type</label>
                                            <div className="flex flex-wrap gap-1.5">
                                                {GRAIN_TYPES.map((type) => (
                                                    <button
                                                        key={type}
                                                        type="button"
                                                        onClick={() => setEditData(p => ({ ...p, grainType: type }))}
                                                        className={`px-2.5 py-1 rounded-lg text-xs transition-colors border ${editData.grainType === type
                                                            ? 'bg-primary/10 border-primary text-primary font-medium'
                                                            : 'bg-background border-border text-muted-foreground hover:bg-muted'
                                                            }`}
                                                    >
                                                        {type}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="space-y-1">
                                                <label className="text-xs text-muted-foreground">Amount (tons)</label>
                                                <input
                                                    type="number"
                                                    value={editData.amount}
                                                    onChange={(e) => setEditData(p => ({ ...p, amount: e.target.value }))}
                                                    className="w-full min-h-[40px] px-3 py-2 bg-background rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs text-muted-foreground">Capacity (tons)</label>
                                                <input
                                                    type="number"
                                                    value={editData.capacity}
                                                    onChange={(e) => setEditData(p => ({ ...p, capacity: e.target.value }))}
                                                    className="w-full min-h-[40px] px-3 py-2 bg-background rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-xs text-muted-foreground">Owner Mobile</label>
                                            <input
                                                type="tel"
                                                value={editData.phone}
                                                onChange={(e) => setEditData(p => ({ ...p, phone: e.target.value }))}
                                                placeholder="+91 98765 43210"
                                                className="w-full min-h-[40px] px-3 py-2 bg-background rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            />
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleUpdate(silo)}
                                                className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
                                            >
                                                <Check size={15} />
                                                Save Changes
                                            </button>
                                            <button
                                                onClick={() => setEditingId(null)}
                                                className="px-4 py-2 bg-muted rounded-lg text-sm text-muted-foreground hover:text-foreground border border-border transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="border-t border-border p-4 bg-card flex-shrink-0">
                <button
                    onClick={onClose}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-muted hover:bg-muted/80 border border-border text-sm font-semibold text-muted-foreground hover:text-foreground transition-all"
                >
                    <X size={16} />
                    Close Panel
                </button>
            </div>
        </div>
    );
};

export default ManageSilos;
