import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

import { Scale, FileText, ArrowRight, Map, History, Verified, ShieldCheck, ShieldAlert, FileWarning, Gavel, AlertTriangle, X } from 'lucide-react';
import { TranslatedText } from '../components/ui/TranslatedText';
import { useAuth } from '../contexts/AuthContext';

interface AuthLog {
    id: string;
    email: string;
    event_type: string;
    created_at: string;
}

interface Claim {
    id: string;
    item: string;
    status: string;
    calculated_debt: number | null;
    actual_paid_sar: number | null;
    created_at: string;
}

export default function Dashboard() {
    const { profile, session } = useAuth();
    const [totalDebt, setTotalDebt] = useState<number>(0);
    const [claimsData, setClaimsData] = useState<Claim[]>([]);
    const [showDebtModal, setShowDebtModal] = useState(false);
    const [unpaidWeeks, setUnpaidWeeks] = useState<number>(0);
    const [evidenceCount, setEvidenceCount] = useState<number>(0);
    const [authLogs, setAuthLogs] = useState<AuthLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const isSystemAdmin = session?.user?.email?.toLowerCase() === 'davidsanchezdegroeve@gmail.com';

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
                    setClaimsData(claims as Claim[]);

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

                // Fetch auth logs if admin
                if (isSystemAdmin) {
                    const { data: logsData, error: logsError } = await supabase
                        .from('auth_logs')
                        .select('*')
                        .order('created_at', { ascending: false })
                        .limit(20);

                    if (!logsError && logsData) {
                        setAuthLogs(logsData as AuthLog[]);
                    }
                }

            } catch (err) {
                console.error("Dashboard fetching error: ", err);
            } finally {
                setIsLoading(false);
            }
        }
        loadDashboardData();
    }, [isSystemAdmin]);

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
                        <p className="text-primary font-bold text-xs tracking-widest uppercase mt-1">David Sanchez vs. Gustavo Madico</p>
                    </div>
                </header>

                {/* Executive Summary */}
                <div className="glass-card rounded-2xl p-6 mb-8 border border-primary/20 bg-gradient-to-br from-bg-surface to-bg-surface-hover shadow-lg">
                    <h3 className="text-lg font-bold text-text-main flex items-center gap-2 mb-3">
                        <FileText className="w-5 h-5 text-primary" />
                        Executive Summary & Core Objectives
                    </h3>
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1 space-y-3">
                            <p className="text-sm text-text-muted leading-relaxed">
                                <strong className="text-text-main">The Core Dispute:</strong> The opposing party initiated a covert dissolution on <strong className="text-rose-400">February 12th</strong> while presenting a predatory 36-page Founders Agreement designed to trap equity and force a nominal value sale via Article 80.
                            </p>
                            <p className="text-sm text-text-muted leading-relaxed">
                                <strong className="text-text-main">Financial Damages:</strong> Currently illegally withholding <strong className="text-accent-neon">9,500 SAR</strong> (6,000 SAR base salary + 3,500 SAR apartment rent) while establishing a verifiable opportunity cost of <strong className="text-accent-neon">45,000 SAR/month</strong> forfeited from eMcREY to build this startup full-time since January 17th.
                            </p>
                        </div>
                        <div className="flex-1 p-4 bg-bg-surface border border-border-default/50 rounded-xl">
                            <TranslatedText
                                original="Objective: Leverage the documented bad faith actions to bypass the Article 80 traps and exit with fair severance compounding the opportunity cost, or return under a totally rewritten, legally safe agreement."
                                translated="الهدف: الاستفادة من تصرفات سوء النية الموثقة لتجاوز فخاخ المادة 80 والخروج بتعويض عادل يغطي تكلفة الفرصة البديلة، أو العودة بموجب اتفاقية قانونية آمنة تمت صياغتها بالكامل من جديد."
                            />
                        </div>
                    </div>
                </div>

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
                    <div onClick={() => setShowDebtModal(true)} className="glass-card rounded-2xl p-6 relative overflow-hidden group hover:border-primary/50 cursor-pointer transition-colors">
                        <p className="text-text-muted text-xs font-bold uppercase tracking-wider mb-4 flex justify-between items-center">
                            Total Calculated Debt
                            <span className="text-[10px] bg-primary/20 text-primary px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                VIEW BREAKDOWN <ArrowRight className="w-3 h-3" />
                            </span>
                        </p>
                        <div className="flex items-end gap-2">
                            <span className="text-4xl font-black text-text-main group-hover:text-primary transition-colors">{formatCurrency(totalDebt)}</span>
                        </div>
                        <p className="text-[10px] text-text-muted mt-2 font-medium group-hover:text-text-muted/80 transition-colors">Includes 9,500 SAR withheld + 45k/mo opportunity loss</p>
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
                {/* Bad Faith & Agreement Red Flags */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="glass-card rounded-2xl p-6 border-l-4 border-l-rose-500 border-rose-500/30 bg-rose-950/10">
                        <h3 className="text-lg font-bold text-text-main flex items-center gap-2 mb-4">
                            <ShieldAlert className="w-5 h-5 text-rose-500" />
                            Bad Faith Actions
                        </h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 border-b border-border-default/50 pb-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0"></div>
                                <div>
                                    <p className="text-sm font-bold text-text-main">Covert Dissolution</p>
                                    <p className="text-xs text-text-muted">Initiated secretly on February 12th.</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3 border-b border-border-default/50 pb-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0"></div>
                                <div>
                                    <p className="text-sm font-bold text-text-main">Financial Withholding</p>
                                    <p className="text-xs text-text-muted">9,500 SAR withheld (6,000 salary + 3,500 rent).</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3 border-b border-border-default/50 pb-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0"></div>
                                <div>
                                    <p className="text-sm font-bold text-text-main">Bank Monopolization</p>
                                    <p className="text-xs text-text-muted">Exclusive control seized to choke off funds.</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0"></div>
                                <div>
                                    <p className="text-sm font-bold text-text-main">Third-Party Deception</p>
                                    <p className="text-xs text-text-muted">Lied to landlord and circumvented legal counsel.</p>
                                </div>
                            </li>
                        </ul>
                    </div>

                    <div className="glass-card rounded-2xl p-6 border-l-4 border-l-accent-amber border-accent-amber/30 bg-accent-amber/5">
                        <h3 className="text-lg font-bold text-text-main flex items-center gap-2 mb-4">
                            <FileWarning className="w-5 h-5 text-accent-amber" />
                            Founders Agreement Traps
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="bg-bg-surface p-3 rounded-xl border border-border-default">
                                <p className="text-[11px] font-black text-accent-amber uppercase tracking-wider mb-1">Vesting Start</p>
                                <p className="text-[10px] text-text-muted leading-relaxed">Ignores Pre-Jan 17th full-time investment.</p>
                            </div>
                            <div className="bg-bg-surface p-3 rounded-xl border border-border-default">
                                <p className="text-[11px] font-black text-accent-amber uppercase tracking-wider mb-1">Article 80 Trap</p>
                                <p className="text-[10px] text-text-muted leading-relaxed">Links KSA labor dismissal to Bad Leaver forfeiture.</p>
                            </div>
                            <div className="bg-bg-surface p-3 rounded-xl border border-border-default">
                                <p className="text-[11px] font-black text-accent-amber uppercase tracking-wider mb-1">Fake Debt</p>
                                <p className="text-[10px] text-text-muted leading-relaxed">Manufactured financial hurdles against David.</p>
                            </div>
                            <div className="bg-bg-surface p-3 rounded-xl border border-border-default">
                                <p className="text-[11px] font-black text-accent-amber uppercase tracking-wider mb-1">Nominal Value</p>
                                <p className="text-[10px] text-text-muted leading-relaxed">Forces equity sale at par value upon forced exit.</p>
                            </div>
                            <div className="bg-bg-surface p-3 rounded-xl border border-border-default">
                                <p className="text-[11px] font-black text-accent-amber uppercase tracking-wider mb-1">10-Day Cure</p>
                                <p className="text-[10px] text-text-muted leading-relaxed">Impossible window to rectify alleged material breaches.</p>
                            </div>
                            <div className="bg-bg-surface p-3 rounded-xl border border-border-default">
                                <p className="text-[11px] font-black text-accent-amber uppercase tracking-wider mb-1">Spanish Amendment</p>
                                <p className="text-[10px] text-text-muted leading-relaxed">Isolates David from Saudi legal protections.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sunday Meeting Scenarios */}
                <div className="glass-card rounded-2xl p-8 mb-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent-neon to-accent-amber"></div>
                    <div className="flex justify-between items-center mb-6">
                        <h4 className="text-xl font-black text-text-main flex items-center gap-2">
                            <Gavel className="w-5 h-5 text-primary" /> Sunday Meeting Scenarios
                        </h4>
                        <span className="px-3 py-1 bg-bg-surface border border-border-default text-text-muted rounded-full text-[10px] font-bold tracking-widest">STRATEGY MATRIX</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                        {/* VS Divider */}
                        <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-bg-surface border border-border-default items-center justify-center text-[10px] font-black text-text-muted z-10">VS</div>

                        {/* Scenario A */}
                        <div className="bg-bg-surface p-6 rounded-2xl border border-border-default flex flex-col h-full hover:border-primary/50 transition-colors shadow-sm">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-lg text-xs font-black uppercase tracking-widest self-start mb-4">
                                Scenario A
                            </div>
                            <h5 className="text-lg font-bold text-text-main mb-1">Stay in the company</h5>
                            <p className="text-sm font-medium text-primary mb-6">(New Conditions)</p>
                            <ul className="space-y-3 mt-auto">
                                <li className="flex items-start gap-2 text-sm text-text-muted">
                                    <ArrowRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                    Demand removal of Article 80 link.
                                </li>
                                <li className="flex items-start gap-2 text-sm text-text-muted">
                                    <ArrowRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                    Require FMV (Fair Market Value) for equity.
                                </li>
                                <li className="flex items-start gap-2 text-sm text-text-muted">
                                    <ArrowRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                    Immediate payment of 9,500 SAR debt.
                                </li>
                            </ul>
                        </div>

                        {/* Scenario B */}
                        <div className="bg-bg-surface p-6 rounded-2xl border border-border-default flex flex-col h-full hover:border-emerald-500/50 transition-colors shadow-sm">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-black uppercase tracking-widest self-start mb-4">
                                Scenario B
                            </div>
                            <h5 className="text-lg font-bold text-text-main mb-1">Exit with fair compensation</h5>
                            <p className="text-sm font-medium text-emerald-500 mb-6">(Severance & Settlement)</p>
                            <ul className="space-y-3 mt-auto">
                                <li className="flex items-start gap-2 text-sm text-text-muted">
                                    <ArrowRight className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                    Calculate 45K SAR/mo opportunity cost.
                                </li>
                                <li className="flex items-start gap-2 text-sm text-text-muted">
                                    <ArrowRight className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                    Negotiate buyout of early equity.
                                </li>
                                <li className="flex items-start gap-2 text-sm text-text-muted">
                                    <ArrowRight className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                    Sign mutual non-disparagement NDA.
                                </li>
                            </ul>
                        </div>
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
                                    <p className="text-[10px] font-black text-text-main">RESIGNATION</p>
                                    <p className="text-[9px] text-text-muted font-bold">SEP 17</p>
                                </div>
                            </div>
                            {/* Milestone 2 */}
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-4 h-4 bg-primary rounded-full ring-4 ring-bg-surface border-2 border-primary/20"></div>
                                <div className="text-center">
                                    <p className="text-[10px] font-black text-text-main">FINAL DAY</p>
                                    <p className="text-[9px] text-text-muted font-bold">JAN 17</p>
                                </div>
                            </div>
                            {/* Milestone 3 */}
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-4 h-4 bg-primary rounded-full ring-4 ring-bg-surface border-2 border-primary/20 shadow-[0_0_10px_#137fec]"></div>
                                <div className="text-center">
                                    <p className="text-[10px] font-black text-text-main">DISSOLUTION</p>
                                    <p className="text-[9px] text-primary font-bold">FEB 12</p>
                                </div>
                            </div>
                            {/* Milestone 4 */}
                            <div className="flex flex-col items-center gap-3 -mt-4">
                                <div className="w-12 h-12 rounded-xl glass-card border border-primary flex items-center justify-center neon-glow-primary bg-primary/10 relative">
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent-amber rounded-full animate-ping"></div>
                                    <Scale className="w-6 h-6 text-primary" />
                                </div>
                                <div className="text-center mt-2">
                                    <p className="text-[10px] font-black text-primary tracking-widest">PRE-TRIAL</p>
                                    <p className="text-[9px] text-text-muted font-bold">CURRENT STAGE</p>
                                </div>
                            </div>
                            {/* Milestone 5 */}
                            <div className="flex flex-col items-center gap-3 opacity-40">
                                <div className="w-4 h-4 bg-border-hover rounded-full ring-4 ring-bg-surface"></div>
                                <div className="text-center">
                                    <p className="text-[10px] font-black text-text-main">MEDIATION</p>
                                    <p className="text-[9px] text-text-muted font-bold">TBD</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* System Access Logs (David Only) */}
                {isSystemAdmin && (
                    <div className="glass-card rounded-2xl p-8 mb-8 flex-1 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.05)]">
                        <div className="flex justify-between items-center mb-6">
                            <h4 className="text-xl font-bold text-text-main flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-emerald-500" /> System Access Logs
                            </h4>
                            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-bold tracking-widest">ADMIN VIEW</span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-border-default text-text-muted text-[10px] uppercase tracking-wider">
                                        <th className="pb-3 px-4 font-bold">Time</th>
                                        <th className="pb-3 px-4 font-bold">User</th>
                                        <th className="pb-3 px-4 font-bold text-right">Event</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-default/50">
                                    {authLogs.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="py-8 text-center text-text-muted text-xs">No access logs found.</td>
                                        </tr>
                                    ) : (
                                        authLogs.map(log => (
                                            <tr key={log.id} className="hover:bg-bg-surface-hover/50 transition-colors">
                                                <td className="py-3 px-4 text-text-muted whitespace-nowrap text-xs">
                                                    {new Date(log.created_at).toLocaleString()}
                                                </td>
                                                <td className="py-3 px-4 font-medium text-text-main text-xs">
                                                    {log.email}
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${log.event_type === 'login' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                                                        {log.event_type}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
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
                                original="This portal organizes the evidence timeline and financial claims of David Sanchez De Groeve against partner Gustavo regarding Rommaana / Pomegranate Technologies Spain S.L. The core assertion is that Gustavo enacted a covert dissolution on February 12th in bad faith, deliberately withheld 9,500 SAR in owed compensation, and attempted to coerce the signing of a predatory Founders Agreement after David forfeited a 45K SAR/month position to join the venture."
                                translated="تنظم هذه البوابة التسلسل الزمني للأدلة والمطالبات المالية لـ ديفيد سانشيز دي جروف ضد الشريك جوستافو فيما يتعلق بشركة رمانة / Pomegranate Technologies Spain. التأكيد الأساسي هو أن جوستافو نفذ حلًا سريًا في 12 فبراير بسوء نية، وحجب عمدًا 9500 ريال سعودي، وحاول إجبار توقيع اتفاقية مؤسسين مفترسة."
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

            {/* Financial Breakdown Modal */}
            {showDebtModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pb-20 sm:pb-6 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-background-dark/80 backdrop-blur-sm" onClick={() => setShowDebtModal(false)}></div>
                    <div className="glass-card w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-primary/30 shadow-[0_0_40px_rgba(19,127,236,0.15)] relative overflow-hidden animate-in slide-in-from-bottom-4 duration-500">

                        {/* Modal Header */}
                        <div className="p-6 md:p-8 flex items-center justify-between border-b border-border-default/50 bg-bg-surface/50">
                            <div>
                                <h2 className="text-2xl font-black text-text-main flex items-center gap-3 tracking-tight">
                                    <Scale className="w-6 h-6 text-primary" />
                                    Financial Damages Breakdown
                                </h2>
                                <p className="text-xs text-text-muted mt-2 uppercase tracking-widest font-bold">Line-item verified claims backing {formatCurrency(totalDebt)}</p>
                            </div>
                            <button
                                onClick={() => setShowDebtModal(false)}
                                className="p-2 bg-background-dark/50 hover:bg-rose-500/20 text-text-muted hover:text-rose-400 rounded-xl transition-all border border-border-default hover:border-rose-500/30"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 bg-background-dark/30">
                            <div className="w-full overflow-x-auto">
                                <table className="w-full text-left text-sm whitespace-nowrap md:whitespace-normal">
                                    <thead>
                                        <tr className="border-b border-border-default text-text-muted/70">
                                            <th className="pb-3 pt-2 font-bold uppercase tracking-wider text-[10px] px-4">Claim Item</th>
                                            <th className="pb-3 pt-2 font-bold uppercase tracking-wider text-[10px] px-4">Status</th>
                                            <th className="pb-3 pt-2 font-bold uppercase tracking-wider text-[10px] px-4 text-right">Actual Paid</th>
                                            <th className="pb-3 pt-2 font-bold uppercase tracking-wider text-[10px] px-4 text-right text-primary">Calculated Debt</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border-default/30">
                                        {claimsData.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()).map((claim, idx) => (
                                            <tr key={claim.id || idx} className="group hover:bg-white/5 transition-colors">
                                                <td className="py-4 px-4 font-medium text-text-main">
                                                    {claim.item}
                                                    {claim.item.includes('Opportunity') && <span className="ml-2 text-[9px] bg-accent-neon/10 text-accent-neon px-2 py-0.5 rounded uppercase tracking-wider">Major Element</span>}
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span className={`text-[10px] px-2.5 py-1 rounded-md font-bold uppercase tracking-widest ${claim.status === 'Not Received' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : claim.status === 'Received' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-accent-amber/10 text-accent-amber border border-accent-amber/20'}`}>
                                                        {claim.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 text-right font-medium text-text-muted">
                                                    {claim.actual_paid_sar !== null && claim.actual_paid_sar !== undefined ? formatCurrency(claim.actual_paid_sar) : '-'}
                                                </td>
                                                <td className="py-4 px-4 text-right font-black text-primary group-hover:text-accent-neon transition-colors">
                                                    {claim.calculated_debt ? formatCurrency(claim.calculated_debt) : '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-border-default bg-bg-surface-hover/50 flex flex-col md:flex-row items-center justify-between gap-4">
                            <p className="text-xs text-text-muted max-w-md leading-relaxed">
                                <strong className="text-text-main">Notice:</strong> These figures represent actual direct damages and opportunity cost backed by the Evidence Vault. They do not include supplementary punitive damages for bad faith under Saudi Law.
                            </p>
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Cumulative Proven Debt</p>
                                <p className="text-3xl font-black text-primary drop-shadow-[0_0_15px_rgba(19,127,236,0.5)]">{formatCurrency(totalDebt)}</p>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}
