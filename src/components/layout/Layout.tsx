import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { LayoutDashboard, Clock, FileBadge, Scale, LogOut, Menu, X, Sun, Moon, Users } from 'lucide-react';

const Layout = () => {
    const { profile, signOut } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    const navItems = [
        { path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
        { path: '/timeline', icon: <Clock className="w-5 h-5" />, label: 'Timeline Events' },
        { path: '/evidence', icon: <FileBadge className="w-5 h-5" />, label: 'Evidence Vault' },
        { path: '/founders', icon: <Users className="w-5 h-5" />, label: 'Founders' },
        { path: '/lawyer', icon: <Scale className="w-5 h-5" />, label: 'Lawyer Portal' },
    ];

    return (
        <div className="flex h-screen bg-bg-base text-text-main overflow-hidden font-sans">
            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed md:static inset-y-0 left-0 w-64 border-r border-slate-800 bg-bg-surface flex-col z-40 transform transition-transform duration-300 ease-in-out md:translate-x-0 flex ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 flex items-center justify-between">
                    <h1
                        onClick={() => {
                            navigate('/dashboard');
                            setIsMobileMenuOpen(false);
                        }}
                        className="text-[13px] font-bold tracking-widest uppercase text-text-main flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                    >
                        <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
                            <Scale className="w-4 h-4 text-primary" />
                        </span>
                        Legal Portal
                    </h1>
                    <button
                        className="md:hidden text-text-muted hover:text-text-main"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
                    <div className="text-[10px] font-bold text-text-muted px-3 mb-4 uppercase tracking-wider">Navigation</div>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all ${isActive
                                    ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm'
                                    : 'text-text-muted hover:bg-bg-surface-hover hover:text-text-main border border-transparent'
                                }`
                            }
                        >
                            {item.icon}
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800 mt-auto">
                    <button
                        onClick={() => {
                            navigate('/profile');
                            setIsMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-bg-surface-hover border border-border-default hover:border-primary/50 transition-all text-left mb-2"
                    >
                        {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt="Avatar" className="w-8 h-8 rounded-full object-cover shadow-md" />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-700 flex flex-shrink-0 items-center justify-center font-bold text-sm text-amber-500 uppercase">
                                {profile?.role?.[0] || 'U'}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-text-main truncate">{profile?.full_name || 'User Profile'}</p>
                            <p className="text-xs text-text-muted capitalize">{profile?.role}</p>
                        </div>
                    </button>
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-muted font-medium hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                        <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
                <header className="h-16 border-b border-border-default bg-bg-surface/90 backdrop-blur-md flex items-center px-4 md:px-8 justify-between z-10 w-full">
                    <div className="flex items-center gap-3">
                        <button
                            className="md:hidden p-2 -ml-2 text-text-muted hover:text-text-main rounded-lg hover:bg-slate-800 transition-colors"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <div className="font-medium text-sm text-text-muted md:ml-0">Overview</div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleTheme}
                            className="p-2 text-text-muted hover:text-text-main hover:bg-bg-surface-hover rounded-full transition-colors"
                            aria-label="Toggle Theme"
                        >
                            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>

                        {profile?.company_logo_url ? (
                            <img src={profile.company_logo_url} alt="Company Logo" className="h-8 max-w-[120px] object-contain" />
                        ) : profile?.company_name ? (
                            <div className="text-sm font-bold text-text-muted">{profile.company_name}</div>
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 cursor-pointer" onClick={() => navigate('/profile')}></div>
                        )}
                    </div>
                </header>
                <div className="flex-1 overflow-auto p-8 relative">
                    {/* Subtle background glow */}
                    <div className="absolute top-0 left-0 w-full h-96 bg-blue-900/10 blur-[100px] -z-10 pointer-events-none"></div>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
