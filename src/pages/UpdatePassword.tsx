import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Shield, Lock, Loader2, KeyRound } from 'lucide-react';

const UpdatePassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    // Check if we are really in a recovery session
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                // Not logged in or recovery link expired/invalid
                setError("Your password reset link is invalid or has expired. Please request a new one.");
            }
        });

        // Setup listener for the recovery event to grab the session from the URL hash automatically
        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (event) => {
                if (event === 'PASSWORD_RECOVERY') {
                    // It's a valid recovery flow
                } else if (event === 'SIGNED_IN' && window.location.hash.includes('type=recovery')) {
                    // Valid recovery flow workaround
                }
            }
        );

        return () => authListener.subscription.unsubscribe();
    }, []);

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            // Password updated successfully! Now redirect them to dashboard.
            navigate('/dashboard');
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update password. Please try again.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-bg-base">
            {/* Background glow effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-600/20 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="w-full max-w-md z-10 p-4">
                <div className="glass-panel p-8 sm:p-10 rounded-3xl shadow-2xl relative overflow-hidden text-center">
                    {/* Top accent line */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-blue-500"></div>

                    <div className="flex flex-col items-center mb-10 mt-2">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1a1d29] to-[#232736] border border-slate-700/50 flex items-center justify-center shadow-lg mb-6 shadow-black/50">
                            <KeyRound className="w-8 h-8 text-emerald-400" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-text-main mb-2">Update Password</h1>
                        <p className="text-text-muted text-sm font-medium">Please enter your new secure password.</p>
                    </div>

                    <form onSubmit={handleUpdatePassword} className="space-y-5 text-left">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-400 flex items-center">
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text-muted block ml-1">New Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-text-muted" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-bg-surface/80 border border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-text-main placeholder-slate-500 transition-all outline-none"
                                    placeholder="••••••••"
                                    required
                                    disabled={error === "Your password reset link is invalid or has expired. Please request a new one."}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text-muted block ml-1">Confirm New Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-text-muted" />
                                </div>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-bg-surface/80 border border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-text-main placeholder-slate-500 transition-all outline-none"
                                    placeholder="••••••••"
                                    required
                                    disabled={error === "Your password reset link is invalid or has expired. Please request a new one."}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || error === "Your password reset link is invalid or has expired. Please request a new one."}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-text-main font-medium py-3 rounded-xl transition-all shadow-lg shadow-emerald-900/40 mt-4 flex items-center justify-center gap-2 group border border-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>Set New Password <Shield className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" /></>
                            )}
                        </button>

                        {error && error.includes('invalid') && (
                            <div className="text-center mt-4">
                                <button
                                    type="button"
                                    onClick={() => navigate('/login')}
                                    className="text-sm text-text-muted hover:text-text-main transition-colors"
                                >
                                    Return to login to request a new link
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UpdatePassword;
