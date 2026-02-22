import { useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

export const BackgroundAnimation = () => {
    const location = useLocation();
    const { theme } = useTheme();
    const path = location.pathname;

    // We only want these animations to be truly visible in dark mode
    // In light mode, they will be very subtle or we can just use the base background
    const opacity = theme === 'dark' ? 'opacity-100' : 'opacity-20';

    const renderAnimation = () => {
        if (path.includes('/dashboard')) {
            return (
                <div className={`absolute inset-0 overflow-hidden pointer-events-none ${opacity}`}>
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPPHBhdGggZD0iTTAgMGgxdjQwSDB6TTAgMGg0MHYxSDB6IiBmaWxsPSJyZ2JhKDE5LCAxMjcsIDIzNiwgMC4wNSkiLz48L3N2Zz4=')] opacity-30 animate-[pulse_10s_ease-in-out_infinite]"></div>
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] animate-[pulse_8s_ease-in-out_infinite_alternate]"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent-neon/5 rounded-full blur-[120px] animate-[pulse_12s_ease-in-out_infinite_alternate-reverse]"></div>
                </div>
            );
        }

        if (path.includes('/timeline')) {
            return (
                <div className={`absolute inset-0 overflow-hidden pointer-events-none ${opacity}`}>
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/20 to-transparent"></div>
                    <div className="absolute left-1/4 top-1/3 w-64 h-64 border border-primary/10 rounded-full animate-[spin_30s_linear_infinite]"></div>
                    <div className="absolute right-1/4 bottom-1/3 w-96 h-96 border border-accent-amber/5 rounded-full animate-[spin_40s_linear_infinite_reverse]"></div>
                </div>
            );
        }

        if (path.includes('/evidence')) {
            return (
                <div className={`absolute inset-0 overflow-hidden pointer-events-none ${opacity}`}>
                    <div className="absolute inset-0 flex items-center justify-center opacity-5">
                        <div className="w-[800px] h-[800px] border-2 border-emerald-500 rounded-lg transform rotate-45 animate-[pulse_15s_ease-in-out_infinite]"></div>
                    </div>
                    <div className="absolute top-0 right-0 w-[60vw] h-[60vh] bg-emerald-500/5 rounded-bl-full blur-[100px] animate-[pulse_10s_ease-in-out_infinite_alternate]"></div>
                </div>
            );
        }

        if (path.includes('/lawyer')) {
            return (
                <div className={`absolute inset-0 overflow-hidden pointer-events-none ${opacity}`}>
                    <div className="absolute top-1/2 left-1/4 w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 animate-[pulse_12s_ease-in-out_infinite_alternate]"></div>
                    <div className="absolute top-1/2 right-1/4 w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] bg-accent-amber/5 rounded-full blur-[120px] -translate-y-1/2 animate-[pulse_15s_ease-in-out_infinite_alternate-reverse]"></div>
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48L3N2Zz4=')] opacity-50"></div>
                </div>
            );
        }

        if (path.includes('/founders')) {
            return (
                <div className={`absolute inset-0 overflow-hidden pointer-events-none ${opacity}`}>
                    <div className="absolute top-1/4 left-1/3 w-0 h-0 border-l-[150px] border-l-transparent border-r-[150px] border-r-transparent border-b-[260px] border-b-accent-amber/5 animate-[spin_60s_linear_infinite] origin-bottom"></div>
                    <div className="absolute bottom-1/4 right-1/3 w-0 h-0 border-l-[200px] border-l-transparent border-r-[200px] border-r-transparent border-b-[346px] border-b-primary/5 animate-[spin_90s_linear_infinite_reverse] origin-bottom"></div>
                </div>
            );
        }

        // Default layout background (mesh)
        return null;
    };

    return (
        <div className="fixed inset-0 z-0 pointer-events-none">
            {renderAnimation()}
        </div>
    );
};
