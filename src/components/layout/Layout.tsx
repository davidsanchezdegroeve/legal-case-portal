import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutDashboard, Clock, FileBadge, Scale, LogOut, Menu, X } from 'lucide-react';

const Layout = () => {
    const { profile, signOut } = useAuth();
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
        { path: '/lawyer', icon: <Scale className="w-5 h-5" />, label: 'Lawyer Portal' },
    ];

    return (
        <div className="flex h-screen bg-[#0f111a] text-slate-100 overflow-hidden font-sans">
            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed md:static inset-y-0 left-0 w-64 border-r border-slate-800 bg-[#151822] flex-col z-40 transform transition-transform duration-300 ease-in-out md:translate-x-0 flex ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 flex items-center justify-between">
                    <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-amber-500 flex items-center justify-center shadow-lg">
                            <Scale className="w-4 h-4 text-white" />
                        </span>
                        Legal Portal
                    </h1>
                    <button
                        className="md:hidden text-slate-400 hover:text-white"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
                    <div className="text-[10px] font-bold text-slate-500 px-3 mb-4 uppercase tracking-wider">Navigation</div>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all ${isActive
                                    ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
                                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
                                }`
                            }
                        >
                            {item.icon}
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800 mt-auto">
                    <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-800/30 border border-slate-700/50">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex flex-shrink-0 items-center justify-center font-bold text-sm text-amber-500 uppercase">
                            {profile?.role?.[0] || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{profile?.full_name || 'Authorized User'}</p>
                            <p className="text-xs text-slate-400 capitalize">{profile?.role}</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="mt-2 w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-400 font-medium hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                        <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
                <header className="h-16 border-b border-slate-800 bg-[#0f111a]/80 backdrop-blur-md flex items-center px-4 md:px-8 justify-between z-10 w-full">
                    <div className="flex items-center gap-3">
                        <button
                            className="md:hidden p-2 -ml-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <div className="font-medium text-sm text-slate-400 md:ml-0">Overview</div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700"></div>
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
