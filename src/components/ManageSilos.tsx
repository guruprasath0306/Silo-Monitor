import { useState } from 'react';
import { Silo, getStatusColor } from '@/data/silos';
import { X, Plus, Trash2, Wheat, MapPin, ShieldAlert } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface ManageSilosProps {
    silos: Silo[];
    isOpen: boolean;
    onClose: () => void;
}

const GRAIN_TYPES = ['Rice', 'Wheat', 'Maize', 'Millet'];

const ManageSilos = ({ silos, isOpen, onClose }: ManageSilosProps) => {
    const { user, canManage, canDelete } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        lat: '',
        lng: '',
        grainType: 'Rice',
        amount: '',
        capacity: '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleGrainTypeSelect = (type: string) => {
        setFormData((prev) => ({ ...prev, grainType: type }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.from('silos').insert({
                name: formData.name,
                latitude: parseFloat(formData.lat),
                longitude: parseFloat(formData.lng),
                grain_type: formData.grainType,
                grain_amount: parseFloat(formData.amount),
                capacity: parseFloat(formData.capacity),
                status: 'normal',
                temperature: 25, // Default
                humidity: 50, // Default
                pest_activity: 'none', // Default
                co2_level: 400, // Default
            });

            if (error) throw error;

            toast.success('Silo added successfully');
            setFormData({
                name: '',
                location: '',
                lat: '',
                lng: '',
                grainType: 'Rice',
                amount: '',
                capacity: '',
            });
        } catch (error: any) {
            toast.error('Failed to add silo: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this silo?')) return;

        try {
            const { error } = await supabase.from('silos').delete().eq('id', id);
            if (error) throw error;
            toast.success('Silo deleted successfully');
        } catch (error: any) {
            toast.error('Failed to delete silo: ' + error.message);
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
                    className="p-2 hover:bg-muted rounded-full transition-colors"
                >
                    <X size={24} className="text-muted-foreground" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 pb-safe">

                {/* Role Notice for restricted roles */}
                {!canManage && (
                    <div className="flex items-center gap-3 bg-muted rounded-xl border border-border px-4 py-3">
                        <ShieldAlert size={18} className="text-warning flex-shrink-0" />
                        <p className="text-sm text-muted-foreground">
                            You have <strong className="text-foreground capitalize">{user?.role}</strong> access — view only.
                        </p>
                    </div>
                )}

                {/* Add New Silo Form — admin/manager only */}
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

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground">Latitude *</label>
                                    <input
                                        required
                                        type="number"
                                        step="any"
                                        name="lat"
                                        value={formData.lat}
                                        onChange={handleInputChange}
                                        placeholder="e.g. 13.0827"
                                        className="w-full min-h-[44px] px-3 py-2.5 bg-muted rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground">Longitude *</label>
                                    <input
                                        required
                                        type="number"
                                        step="any"
                                        name="lng"
                                        value={formData.lng}
                                        onChange={handleInputChange}
                                        placeholder="e.g. 80.2707"
                                        className="w-full min-h-[44px] px-3 py-2.5 bg-muted rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
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
                                className="bg-card border border-border rounded-xl p-3 flex items-center gap-3 shadow-sm"
                            >
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
                                        title="Open in Google Maps"
                                    >
                                        {silo.lat.toFixed(4)}, {silo.lng.toFixed(4)}
                                    </a>
                                    <span className="text-xs text-muted-foreground"> · {silo.grainType}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span
                                        className="px-2 py-0.5 rounded text-[10px] font-medium uppercase"
                                        style={{
                                            backgroundColor: `${getStatusColor(silo.status)}20`,
                                            color: getStatusColor(silo.status),
                                        }}
                                    >
                                        {silo.status}
                                    </span>
                                    {canDelete && (
                                        <button
                                            onClick={() => handleDelete(silo.id)}
                                            className="p-2 text-destructive/80 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                            title="Delete silo (Admin only)"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageSilos;
