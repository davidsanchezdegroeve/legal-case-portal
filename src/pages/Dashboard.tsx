import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

import { TrendingUp, AlertTriangle, Scale, FileText, ArrowRight, Map, History, Verified } from 'lucide-react';
import { TranslatedText } from '../components/ui/TranslatedText';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
    const { profile } = useAuth();
    const [totalDebt, setTotalDebt] = useState<number>(0);
    const [unpaidWeeks, setUnpaidWeeks] = useState<number>(0);
    const [evidenceCount, setEvidenceCount] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadDashboardData() {
            try {
                // Fetch financial claims to calculate total debt
                const { data: claims, error: claimsError } = await supabase
                    .from('financial_claims')
                    .select('*');

                if (claimsError) throw claimsError;

                if (claims) {
                    const total = claims.reduce((sum, current) => sum + (current.calculated_debt || 0), 0);
                    setTotalDebt(total);

                    // Check for economic duress markers
                    const unpaid = claims.filter(c => c.status === 'Not Received' && c.item.includes('Weekly Payment')).length;
                    setUnpaidWeeks(unpaid);
                }

                // Fetch evidence block count
                const { count, error: evidenceError } = await supabase
                    .from('evidence_vault')
                    .select('*', { count: 'exact', head: true });

                if (evidenceError) throw evidenceError;

                if (count !== null) setEvidenceCount(count);

            } catch (err) {
                console.error("Dashboard fetching error: ", err);
            } finally {
                setIsLoading(false);
            }
        }
        loadDashboardData();
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'SAR',
            maximumSignificantDigits: 3,
            notation: 'compact',
        }).format(amount);
    };

    if (isLoading) {
        return (
            <div className="w-full flex items-center justify-center min-h-[50vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-text-muted font-medium tracking-wide">Retrieving case intelligence...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col xl:flex-row gap-8 pb-12 animate-in fade-in duration-700">
            {/* Main Stage */}
            <div className="flex-1 min-w-0 flex flex-col">
                <header className="flex justify-between items-end mb-8 pl-1">
                    <div>
                        <h2 className="text-3xl font-black text-text-main tracking-tight">Case Dashboard</h2>
                        <p className="text-primary font-bold text-xs tracking-widest uppercase mt-1">Global Logistics vs. Sovereign Trust</p>
                    </div>
                </header>

                {/* Economic Duress Monitor Alert */}
                {unpaidWeeks > 0 && (
                    <div className="glass-card neon-border-amber rounded-2xl p-6 mb-8 relative overflow-hidden group shadow-lg">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <AlertTriangle className="w-[120px] h-[120px] text-accent-amber" />
                        </div>
                        <div className="flex flex-col md:flex-row gap-6 items-center relative z-10">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle className="text-accent-amber fill-accent-amber w-5 h-5" />
                                    <span className="text-accent-amber font-black text-xs uppercase tracking-widest">Critical Threat Detected</span>
                                </div>
                                <h3 className="text-2xl font-bold text-text-main mb-2 italic">Economic Duress Alert</h3>
                                <p className="text-text-muted text-sm leading-relaxed max-w-2xl">
                                    Financial coercion patterns identified. Opposing party has marked <strong>{unpaidWeeks} weekly payments</strong> as 'Not Received'. This establishes a deliberate starvation strategy indicative of bad faith negotiations.
                                    <span className="text-accent-amber font-semibold underline cursor-pointer ml-2">Immediate injunction recommended.</span>
                                </p>
                            </div>
                            <div className="flex flex-col gap-2 w-full md:w-auto">
                                <button className="bg-accent-amber text-black px-6 py-3 rounded-xl font-black text-sm hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                                    ACTIVATE REVIEW
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                                <button className="glass-card px-6 py-2 rounded-xl font-bold text-xs text-text-muted hover:text-text-main transition-colors border-transparent hover:border-border-hover">
                                    IGNORE
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Primary KPI Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Debt Card */}
                    <div className="glass-card rounded-2xl p-6 relative overflow-hidden group hover:border-border-hover transition-colors">
                        <p className="text-text-muted text-xs font-bold uppercase tracking-wider mb-4">Total Calculated Debt</p>
                        <div className="flex items-end gap-2">
                            <span className="text-4xl font-black text-text-main">{formatCurrency(totalDebt)}</span>
                            <span className="text-accent-neon text-xs font-bold mb-1 flex items-center">
                                <TrendingUp className="w-4 h-4 mr-1" /> 12.4%
                            </span>
                        </div>
                        <div className="mt-5 h-1.5 w-full bg-border-default/50 rounded-full overflow-hidden">
                            <div className="h-full bg-accent-neon w-[65%] rounded-full shadow-[0_0_10px_rgba(0,242,255,0.6)]"></div>
                        </div>
                    </div>

                    {/* Evidence Card */}
                    <div className="glass-card rounded-2xl p-6 relative overflow-hidden group hover:border-border-hover transition-colors">
                        <p className="text-text-muted text-xs font-bold uppercase tracking-wider mb-4">Verified Evidence</p>
                        <div className="flex items-center justify-between">
                            <div className="flex items-end gap-2">
                                <span className="text-4xl font-black text-primary">{evidenceCount}</span>
                                <span className="text-sm font-bold text-text-muted mb-1 uppercase">Items</span>
                            </div>
                            <div className="relative w-12 h-12">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle className="stroke-current text-border-default/50" cx="24" cy="24" fill="none" r="20" strokeWidth="4"></circle>
                                    <circle className="stroke-current text-primary" cx="24" cy="24" fill="none" r="20" strokeDasharray="125, 125" strokeLinecap="round" strokeWidth="4"></circle>
                                </svg>
                            </div>
                        </div>
                        <p className="text-[10px] text-primary/70 mt-3 italic font-bold tracking-wide">100% AUTHENTICATED VIA VAULT</p>
                    </div>

                    {/* Risk Level Card */}
                    <div className="glass-card rounded-2xl p-6 border-r-4 border-accent-amber/80 bg-accent-amber/5 relative overflow-hidden group">
                        <p className="text-accent-amber/70 text-xs font-bold uppercase tracking-wider mb-4">Legal Risk Level</p>
                        <div className="flex items-center gap-3">
                            <span className="text-4xl font-black text-accent-amber drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">HIGH</span>
                            <div className="flex gap-1.5">
                                <div className="w-1.5 h-6 bg-accent-amber rounded-full shadow-[0_0_5px_rgba(245,158,11,0.8)]"></div>
                                <div className="w-1.5 h-6 bg-accent-amber rounded-full shadow-[0_0_5px_rgba(245,158,11,0.8)]"></div>
                                <div className="w-1.5 h-6 bg-accent-amber rounded-full shadow-[0_0_5px_rgba(245,158,11,0.8)]"></div>
                                <div className="w-1.5 h-6 bg-border-default/30 rounded-full"></div>
                            </div>
                        </div>
                        <p className="text-[10px] text-accent-amber mt-4 font-bold tracking-tight uppercase shadow-sm">Critical Vulnerability Detected</p>
                    </div>
                </div>

                {/* Case Progress Map Section */}
                <div className="glass-card rounded-2xl p-8 mb-8 flex-1">
                    <div className="flex justify-between items-center mb-10">
                        <h4 className="text-xl font-bold text-text-main flex items-center gap-2">
                            <Map className="w-5 h-5 text-primary" /> Case Progress Map
                        </h4>
                        <div className="flex gap-2">
                            <span className="px-3 py-1 bg-border-default/50 rounded-full text-[10px] font-bold text-text-muted">Q3 FISCAL</span>
                            <span className="px-3 py-1 bg-primary/20 text-primary border border-primary/20 rounded-full text-[10px] font-bold tracking-widest">ACTIVE</span>
                        </div>
                    </div>

                    {/* Futuristic Timeline Map */}
                    <div className="relative py-12 px-6">
                        {/* Connecting Line */}
                        <div className="absolute h-[2px] w-[calc(100%-3rem)] bg-border-default top-1/2 left-6 -translate-y-1/2"></div>
                        <div className="absolute h-[2px] w-[50%] bg-primary top-1/2 left-6 -translate-y-1/2 shadow-[0_0_15px_#137fec]"></div>

                        <div className="flex justify-between relative z-10 w-full">
                            {/* Milestone 1 */}
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-4 h-4 bg-primary rounded-full ring-4 ring-bg-surface border-2 border-primary/20"></div>
                                <div className="text-center">
                                    <p className="text-[10px] font-black text-text-main">FILING</p>
                                    <p className="text-[9px] text-text-muted font-bold">JAN 12</p>
                                </div>
                            </div>
                            {/* Milestone 2 */}
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-4 h-4 bg-primary rounded-full ring-4 ring-bg-surface border-2 border-primary/20 shadow-[0_0_10px_#137fec]"></div>
                                <div className="text-center">
                                    <p className="text-[10px] font-black text-text-main">DISCOVERY</p>
                                    <p className="text-[9px] text-primary font-bold">FEB 28</p>
                                </div>
                            </div>
                            {/* Milestone 3 */}
                            <div className="flex flex-col items-center gap-3 -mt-4">
                                <div className="w-12 h-12 rounded-xl glass-card border border-primary flex items-center justify-center neon-glow-primary bg-primary/10">
                                    <Scale className="w-6 h-6 text-primary" />
                                </div>
                                <div className="text-center mt-2">
                                    <p className="text-[10px] font-black text-primary tracking-widest">PRE-TRIAL</p>
                                    <p className="text-[9px] text-text-muted font-bold">CURRENT STAGE</p>
                                </div>
                            </div>
                            {/* Milestone 4 */}
                            <div className="flex flex-col items-center gap-3 opacity-40">
                                <div className="w-4 h-4 bg-border-hover rounded-full ring-4 ring-bg-surface"></div>
                                <div className="text-center">
                                    <p className="text-[10px] font-black text-text-main">MEDIATION</p>
                                    <p className="text-[9px] text-text-muted font-bold">TBD</p>
                                </div>
                            </div>
                            {/* Milestone 5 */}
                            <div className="flex flex-col items-center gap-3 opacity-40">
                                <div className="w-4 h-4 bg-border-hover rounded-full ring-4 ring-bg-surface"></div>
                                <div className="text-center">
                                    <p className="text-[10px] font-black text-text-main">VERDICT</p>
                                    <p className="text-[9px] text-text-muted font-bold">TBD</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Sidebar Case Summary */}
            <aside className="w-full xl:w-96 flex flex-col shrink-0">
                <div className="glass-card rounded-2xl p-6 h-full flex flex-col">
                    <h3 className="text-lg font-black mb-6 flex items-center gap-2 text-text-main border-b border-border-default pb-4">
                        <FileText className="text-primary w-5 h-5" />
                        Executive Summary
                    </h3>

                    <div className="space-y-8 flex-1">
                        <section className="bg-bg-base/50 p-5 rounded-xl border border-border-default">
                            <TranslatedText
                                original="This portal organizes the evidence timeline and financial claims against the opposing partner. The core assertion is that the partner enacted a covert dissolution on February 12th in bad faith, subsequently restricting financial resources to coerce an unfavorable settlement."
                                translated="تنظم هذه البوابة التسلسل الزمني للأدلة والمطالبات المالية ضد الشريك المعارض. التأكيد الأساسي هو أن الشريك نفذ حل الشركة سراً في 12 فبراير بسوء نية، وقام بعد ذلك بتقييد الموارد المالية لإجبار تسوية غير المواتية."
                            />
                        </section>

                        <section>
                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-4">Lead Counsel</p>
                            <div className="flex items-center gap-4 mb-4 glass-card p-3 rounded-xl border-border-default/50">
                                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-black text-sm border border-primary/20">
                                    {profile?.full_name ? profile.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'AA'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-text-main truncate">{profile?.full_name || 'Abdulaziz Al-Zahrani'}</p>
                                    <p className="text-[10px] text-text-muted uppercase tracking-wider">{profile?.role === 'admin' ? 'System Administrator' : 'Lead Attorney'}</p>
                                </div>
                            </div>
                        </section>

                        <section className="glass-card rounded-xl p-5 border-border-default/50">
                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-4">Upcoming Deadlines</p>
                            <div className="space-y-4">
                                <div className="border-l-2 border-primary pl-4 py-1">
                                    <p className="text-sm font-bold text-text-main">Final Deposition</p>
                                    <p className="text-[10px] text-text-muted font-medium mt-1 uppercase">Oct 24 • 09:00 AM</p>
                                </div>
                                <div className="border-l-2 border-accent-amber pl-4 py-1">
                                    <p className="text-sm font-bold text-text-main">Duress Response</p>
                                    <p className="text-[10px] text-text-muted font-medium mt-1 uppercase">Oct 26 • 05:00 PM</p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-4">Recent Activity</p>
                            <div className="space-y-4">
                                <div className="flex gap-3 items-start">
                                    <History className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                                    <p className="text-[11px] text-text-muted leading-relaxed"><span className="font-bold text-text-main">New Exhibit</span> filed by Defense Counsel.</p>
                                </div>
                                <div className="flex gap-3 items-start">
                                    <Verified className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                                    <p className="text-[11px] text-text-muted leading-relaxed"><span className="font-bold text-text-main">Asset Audit</span> completed for Sub-Entity 4.</p>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </aside>
        </div>
    );
}
