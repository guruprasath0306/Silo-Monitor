import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Wheat, ChevronDown, Lock, Mail, AlertCircle } from 'lucide-react';

const ROLES = [
    { value: 'admin', label: 'Administrator', description: 'Full system access' },
    { value: 'manager', label: 'Farm Manager', description: 'Manage silos & reports' },
    { value: 'operator', label: 'Operator', description: 'Monitor & update readings' },
    { value: 'viewer', label: 'Viewer', description: 'Read-only access' },
];

export default function Login() {
    const navigate = useNavigate();
    const [emailOrUsername, setEmailOrUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotSent, setForgotSent] = useState(false);

    const selectedRole = ROLES.find((r) => r.value === role);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!emailOrUsername || !password || !role) {
            setError('Please fill in all fields including role selection.');
            return;
        }

        setLoading(true);
        // Simulate auth — accepts any non-empty credentials
        await new Promise((res) => setTimeout(res, 800));
        sessionStorage.setItem('auth', JSON.stringify({ email: emailOrUsername, role }));
        navigate('/');
        setLoading(false);
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!forgotEmail) return;
        setLoading(true);
        await new Promise((res) => setTimeout(res, 1000));
        setForgotSent(true);
        setLoading(false);
    };

    if (showForgotPassword) {
        return (
            <div className="login-bg min-h-screen flex items-center justify-center p-4">
                <div className="login-card w-full max-w-md">
                    <div className="login-card-inner">
                        {/* Logo */}
                        <div className="flex flex-col items-center mb-8">
                            <div className="logo-ring mb-4">
                                <Wheat size={32} className="text-primary" />
                            </div>
                            <h1 className="text-2xl font-bold text-foreground tracking-tight">Reset Password</h1>
                            <p className="text-muted-foreground text-sm mt-1">
                                We'll send a reset link to your email
                            </p>
                        </div>

                        {forgotSent ? (
                            <div className="success-banner">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                        <span className="text-primary text-lg">✓</span>
                                    </div>
                                    <div>
                                        <p className="text-foreground font-medium text-sm">Reset link sent!</p>
                                        <p className="text-muted-foreground text-xs mt-0.5">
                                            Check your inbox at <strong>{forgotEmail}</strong>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleForgotPassword} className="space-y-4">
                                <div className="input-group">
                                    <label className="input-label">Email Address</label>
                                    <div className="input-wrapper">
                                        <Mail size={16} className="input-icon" />
                                        <input
                                            type="email"
                                            className="login-input"
                                            placeholder="you@farmsense.io"
                                            value={forgotEmail}
                                            onChange={(e) => setForgotEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <button type="submit" className="login-btn" disabled={loading}>
                                    {loading ? <span className="btn-spinner" /> : 'Send Reset Link'}
                                </button>
                            </form>
                        )}

                        <button
                            onClick={() => { setShowForgotPassword(false); setForgotSent(false); setForgotEmail(''); }}
                            className="back-link mt-6"
                        >
                            ← Back to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="login-bg min-h-screen flex items-center justify-center p-4">
            {/* Animated background orbs */}
            <div className="orb orb-1" />
            <div className="orb orb-2" />
            <div className="orb orb-3" />

            <div className="login-card w-full max-w-md">
                <div className="login-card-inner">
                    {/* Logo & Branding */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="logo-ring mb-4">
                            <Wheat size={32} className="text-primary" />
                        </div>
                        <h1 className="text-2xl font-bold text-foreground tracking-tight">FarmSense Hub</h1>
                        <p className="text-muted-foreground text-sm mt-1">Silo Monitoring System</p>
                    </div>

                    {/* Error Banner */}
                    {error && (
                        <div className="error-banner">
                            <AlertCircle size={16} className="flex-shrink-0 text-destructive" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        {/* Email / Username */}
                        <div className="input-group">
                            <label className="input-label">Email or Username</label>
                            <div className="input-wrapper">
                                <Mail size={16} className="input-icon" />
                                <input
                                    id="email"
                                    type="text"
                                    className="login-input"
                                    placeholder="admin@farmsense.io"
                                    value={emailOrUsername}
                                    onChange={(e) => setEmailOrUsername(e.target.value)}
                                    autoComplete="username"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="input-group">
                            <label className="input-label">Password</label>
                            <div className="input-wrapper">
                                <Lock size={16} className="input-icon" />
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    className="login-input pr-10"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    className="eye-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Role Selection */}
                        <div className="input-group">
                            <label className="input-label">Role</label>
                            <div className="relative">
                                <button
                                    type="button"
                                    id="role-select"
                                    className={`role-select-btn ${roleDropdownOpen ? 'ring-2 ring-primary border-primary' : ''}`}
                                    onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                                >
                                    {selectedRole ? (
                                        <span className="flex flex-col items-start">
                                            <span className="text-foreground text-sm font-medium">{selectedRole.label}</span>
                                            <span className="text-muted-foreground text-xs">{selectedRole.description}</span>
                                        </span>
                                    ) : (
                                        <span className="text-muted-foreground text-sm">Select your role...</span>
                                    )}
                                    <ChevronDown
                                        size={16}
                                        className={`text-muted-foreground transition-transform duration-200 ${roleDropdownOpen ? 'rotate-180' : ''}`}
                                    />
                                </button>

                                {roleDropdownOpen && (
                                    <div className="role-dropdown">
                                        {ROLES.map((r) => (
                                            <button
                                                key={r.value}
                                                type="button"
                                                className={`role-option ${role === r.value ? 'role-option-active' : ''}`}
                                                onClick={() => {
                                                    setRole(r.value);
                                                    setRoleDropdownOpen(false);
                                                }}
                                            >
                                                <span className="font-medium text-sm text-foreground">{r.label}</span>
                                                <span className="text-xs text-muted-foreground">{r.description}</span>
                                                {role === r.value && <span className="role-check">✓</span>}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Login Button */}
                        <button type="submit" className="login-btn mt-2" disabled={loading}>
                            {loading ? (
                                <span className="flex items-center gap-2 justify-center">
                                    <span className="btn-spinner" />
                                    Authenticating...
                                </span>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    {/* Forgot Password */}
                    <div className="flex justify-center mt-5">
                        <button
                            type="button"
                            className="forgot-link"
                            onClick={() => setShowForgotPassword(true)}
                        >
                            Forgot password?
                        </button>
                    </div>


                </div>
            </div>
        </div>
    );
}
