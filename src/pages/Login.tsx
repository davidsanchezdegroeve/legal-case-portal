import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Shield, Lock, Mail, Loader2 } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isResetMode, setIsResetMode] = useState(false);
    const [resetEmailSent, setResetEmailSent] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            navigate('/');
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to sign in. Please check your credentials.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/update-password`,
            });
            if (error) throw error;
            setResetEmailSent(true);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to send reset email.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-bg-base">
            {/* Background glow effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="w-full max-w-md z-10 p-4">
                <div className="glass-panel p-8 sm:p-10 rounded-3xl shadow-2xl relative overflow-hidden">
                    {/* Top accent line */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-amber-400 to-amber-500"></div>

                    <div className="flex flex-col items-center mb-10 mt-2">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1a1d29] to-[#232736] border border-slate-700/50 flex items-center justify-center shadow-lg mb-6 shadow-black/50">
                            <Shield className="w-8 h-8 text-amber-400" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-text-main mb-2">Legal Defense</h1>
                        <p className="text-text-muted text-sm font-medium">Secure Strategy & Evidence Portal</p>
                    </div>

                    {isResetMode ? (
                        <form onSubmit={handleResetPassword} className="space-y-5">
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-400 flex items-center">
                                    <span>{error}</span>
                                </div>
                            )}

                            {resetEmailSent ? (
                                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-sm text-emerald-400 text-center space-y-3">
                                    <p>Reset link sent to <strong>{email}</strong>.</p>
                                    <p>Please check your inbox (and spam folder) to set a new password.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="text-text-muted text-sm text-center mb-2">
                                        Enter your email address and we'll send you a link to reset your password.
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-text-muted block ml-1">Email Address</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Mail className="h-5 w-5 text-text-muted" />
                                            </div>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full pl-11 pr-4 py-3 bg-bg-surface/80 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-text-main placeholder-slate-500 transition-all outline-none"
                                                placeholder="admin@legal.local"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading || !email}
                                        className="w-full bg-amber-600 hover:bg-amber-500 text-text-main font-medium py-3 rounded-xl transition-all shadow-lg shadow-amber-900/40 mt-4 flex items-center justify-center gap-2 border border-amber-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Send Reset Link'}
                                    </button>
                                </>
                            )}

                            <div className="text-center mt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsResetMode(false);
                                        setResetEmailSent(false);
                                        setError(null);
                                    }}
                                    className="text-sm text-text-muted hover:text-text-main transition-colors"
                                >
                                    Cancel and return to login
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleLogin} className="space-y-5">
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-400 flex items-center">
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-text-muted block ml-1">Email Address</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-text-muted" />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-bg-surface/80 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-text-main placeholder-slate-500 transition-all outline-none"
                                        placeholder="admin@legal.local"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between ml-1">
                                    <label className="text-sm font-medium text-text-muted block">Password</label>
                                    <button
                                        type="button"
                                        onClick={() => setIsResetMode(true)}
                                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                                    >
                                        Forgot Password?
                                    </button>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-text-muted" />
                                    </div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-bg-surface/80 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-text-main placeholder-slate-500 transition-all outline-none"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-text-main font-medium py-3 rounded-xl transition-all shadow-lg shadow-blue-900/40 mt-4 flex items-center justify-center gap-2 group border border-blue-500/50"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <>Sign into Portal <Shield className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" /></>
                                )}
                            </button>
                        </form>
                    )}

                    <div className="mt-8 pt-6 border-t border-slate-800/50 text-center">
                        <p className="text-xs text-text-muted">
                            Access restricted to authorized legal counsel and administration.<br />All activity is logged and monitored.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
