import { useState } from 'react';
import { useLocation, Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { LayoutDashboard, Clock, FileBadge, Scale, LogOut, Menu, X, Sun, Moon, Users } from 'lucide-react';

import { BackgroundAnimation } from '../ui/BackgroundAnimation';

const Layout = () => {
    const { profile, signOut } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
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

    const getPageTitle = () => {
        const path = location.pathname;
        if (path.includes('/dashboard')) return 'Dashboard';
        if (path.includes('/timeline')) return 'Timeline Events';
        if (path.includes('/evidence')) return 'Evidence Vault';
        if (path.includes('/lawyer')) return 'Lawyer Portal';
        if (path.includes('/founders')) return 'Founders';
        if (path.includes('/profile')) return 'User Profile';
        return 'Dashboard';
    };

    return (
        <div className={`flex h-screen w-full overflow-hidden text-text-main font-display relative ${theme === 'dark' ? 'gradient-mesh bg-background-dark' : 'bg-background-light'}`}>
            <BackgroundAnimation />
            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed md:static inset-y-0 left-0 w-72 glass-sidebar flex-col p-6 z-40 transform transition-transform duration-300 ease-in-out md:translate-x-0 flex ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center gap-3 mb-10 justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary rounded-lg p-2.5 flex items-center justify-center neon-glow-primary">
                            <Scale className="text-white w-6 h-6" />
                        </div>
                        <div className="cursor-pointer hover:opacity-80 transition-opacity" onClick={() => {
                            navigate('/dashboard');
                            setIsMobileMenuOpen(false);
                        }}>
                            <h1 className="text-xl font-extrabold tracking-tight text-text-main leading-tight">ELITE LEGAL</h1>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-primary font-bold">Case Portal v2.0</p>
                        </div>
                    </div>
                    <button
                        className="md:hidden text-text-muted hover:text-text-main"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <nav className="flex flex-col gap-2 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-4 px-4 py-3.5 rounded-xl font-medium transition-all text-sm ${isActive
                                    ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm'
                                    : 'text-text-muted hover:bg-text-main/5 hover:text-text-main border border-transparent'
                                }`
                            }
                        >
                            {item.icon}
                            <span className="font-semibold">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="mt-auto pt-6 border-t border-text-main/5 space-y-3">
                    <div
                        onClick={() => {
                            navigate('/profile');
                            setIsMobileMenuOpen(false);
                        }}
                        className={`flex items-center gap-3 p-3 rounded-xl glass-card border shadow-sm cursor-pointer transition-colors ${location.pathname.includes('/profile') ? 'border-primary bg-primary/10' : 'border-text-main/10 hover:border-primary/50'}`}
                    >
                        {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt="Avatar" className="w-10 h-10 rounded-lg object-cover shadow-inner" />
                        ) : (
                            <div className="w-10 h-10 rounded-lg bg-bg-surface flex flex-shrink-0 items-center justify-center font-bold text-sm text-accent-amber uppercase shadow-inner">
                                {profile?.role?.[0] || 'U'}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-text-main truncate">{profile?.full_name || 'User Profile'}</p>
                            <p className="text-[10px] text-text-muted capitalize truncate">{profile?.role}</p>
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleLogout();
                            }}
                            className="p-2 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                            title="Sign Out"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
                <header className="flex justify-between items-center p-6 md:p-8 shrink-0 relative z-10 glass-card mx-4 mt-4 md:mx-8 md:mt-8 rounded-2xl">
                    <div className="flex items-center gap-4">
                        <button
                            className="md:hidden p-2 -ml-2 text-text-muted hover:text-text-main rounded-lg hover:bg-text-main/10 transition-colors"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <div>
                            <h2 className="text-2xl md:text-3xl font-black text-text-main tracking-tight uppercase">{getPageTitle()}</h2>
                            <p className="text-text-muted text-xs font-bold tracking-widest mt-1">SECURE PORTAL OVERVIEW</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleTheme}
                            className="p-3 text-text-muted hover:text-primary bg-text-main/5 hover:bg-primary/10 rounded-xl transition-all border border-text-main/5"
                            aria-label="Toggle Theme"
                        >
                            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-auto p-4 md:p-8 relative custom-scrollbar">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
