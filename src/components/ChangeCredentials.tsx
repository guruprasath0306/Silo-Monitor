import { useState } from 'react';
import { X, Eye, EyeOff, Lock, Mail, Shield, CheckCircle, AlertCircle, RotateCcw } from 'lucide-react';
import { getCredentials, updateCredentials, DEFAULT_CREDENTIALS, getCurrentUser } from '@/lib/credentials';

const ROLES = [
    { value: 'admin', label: 'Administrator' },
    { value: 'manager', label: 'Farm Manager' },
    { value: 'operator', label: 'Operator' },
    { value: 'viewer', label: 'Viewer' },
];

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function ChangeCredentials({ isOpen, onClose }: Props) {
    const currentUser = getCurrentUser();
    // Default to current user's role tab
    const [activeRole, setActiveRole] = useState(currentUser?.role ?? 'admin');

    const creds = getCredentials(activeRole);
    const [email, setEmail] = useState(creds.email);
    const [password, setPassword] = useState(creds.password);
    const [confirmPass, setConfirmPass] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [statusMsg, setStatusMsg] = useState('');

    const handleRoleChange = (role: string) => {
        setActiveRole(role);
        setStatus('idle');
        setStatusMsg('');
        const c = getCredentials(role);
        setEmail(c.email);
        setPassword(c.password);
        setConfirmPass('');
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('idle');

        if (!email.trim()) {
            setStatus('error');
            setStatusMsg('Email / username cannot be empty.');
            return;
        }
        if (password.length < 6) {
            setStatus('error');
            setStatusMsg('Password must be at least 6 characters.');
            return;
        }
        if (password !== confirmPass) {
            setStatus('error');
            setStatusMsg('Passwords do not match.');
            return;
        }

        updateCredentials(activeRole, email.trim(), password);
        setStatus('success');
        setStatusMsg(`Credentials updated for ${ROLES.find(r => r.value === activeRole)?.label}!`);
        setConfirmPass('');
    };

    const handleReset = () => {
        const def = DEFAULT_CREDENTIALS[activeRole];
        setEmail(def.email);
        setPassword(def.password);
        setConfirmPass('');
        setStatus('idle');
        setStatusMsg('');
    };

    if (!isOpen) return null;

    return (
        <div className="cc-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="cc-panel">
                {/* Header */}
                <div className="cc-header">
                    <div className="flex items-center gap-3">
                        <div className="cc-icon-wrap">
                            <Shield size={18} className="text-primary" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-foreground">Change Credentials</h2>
                            <p className="text-xs text-muted-foreground">Update login email & password per role</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="cc-close-btn">
                        <X size={18} />
                    </button>
                </div>

                {/* Role tabs */}
                <div className="cc-tabs">
                    {ROLES.map((r) => (
                        <button
                            key={r.value}
                            className={`cc-tab ${activeRole === r.value ? 'cc-tab-active' : ''}`}
                            onClick={() => handleRoleChange(r.value)}
                        >
                            {r.label}
                            {currentUser?.role === r.value && (
                                <span className="cc-you-badge">you</span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Form */}
                <form onSubmit={handleSave} className="cc-form">
                    {/* Status banner */}
                    {status !== 'idle' && (
                        <div className={`cc-banner ${status === 'success' ? 'cc-banner-success' : 'cc-banner-error'}`}>
                            {status === 'success' ? (
                                <CheckCircle size={15} />
                            ) : (
                                <AlertCircle size={15} />
                            )}
                            <span>{statusMsg}</span>
                        </div>
                    )}

                    {/* Email */}
                    <div className="cc-field">
                        <label className="cc-label">Email / Username</label>
                        <div className="cc-input-wrap">
                            <Mail size={15} className="cc-input-icon" />
                            <input
                                type="text"
                                className="cc-input"
                                placeholder="user@farmsense.io"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* New Password */}
                    <div className="cc-field">
                        <label className="cc-label">New Password</label>
                        <div className="cc-input-wrap">
                            <Lock size={15} className="cc-input-icon" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="cc-input pr-10"
                                placeholder="Min. 6 characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button type="button" className="cc-eye" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="cc-field">
                        <label className="cc-label">Confirm Password</label>
                        <div className="cc-input-wrap">
                            <Lock size={15} className="cc-input-icon" />
                            <input
                                type={showConfirm ? 'text' : 'password'}
                                className={`cc-input pr-10 ${confirmPass && confirmPass !== password ? 'cc-input-error' : ''}`}
                                placeholder="Re-enter password"
                                value={confirmPass}
                                onChange={(e) => setConfirmPass(e.target.value)}
                            />
                            <button type="button" className="cc-eye" onClick={() => setShowConfirm(!showConfirm)}>
                                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                        {confirmPass && confirmPass !== password && (
                            <p className="text-xs text-destructive mt-1">Passwords do not match</p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="cc-actions">
                        <button type="button" className="cc-reset-btn" onClick={handleReset} title="Reset to defaults">
                            <RotateCcw size={14} />
                            Reset to default
                        </button>
                        <button type="submit" className="cc-save-btn">
                            Save Changes
                        </button>
                    </div>
                </form>

                {/* Info footer */}
                <p className="text-xs text-muted-foreground text-center mt-4 pb-1">
                    Credentials are stored locally in your browser.
                </p>
            </div>
        </div>
    );
}
