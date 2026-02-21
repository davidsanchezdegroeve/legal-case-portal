import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

import { TrendingUp, AlertTriangle, ShieldCheck, Scale, FileText } from 'lucide-react';
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
            <div className="max-w-6xl mx-auto pb-12 flex items-center justify-center min-h-[50vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-text-muted font-medium tracking-wide">Retrieving latest case data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto pb-12">
            <header className="mb-8 flex flex-col gap-1">
                <p className="text-sm font-medium text-text-muted tracking-wide uppercase">Premium Case Access</p>
                <h1 className="text-3xl font-bold text-text-main">Good Morning, {profile?.full_name?.split(' ')[0] || 'Counsel'}</h1>
                <p className="text-text-muted text-sm mt-1 font-medium">{profile?.role === 'admin' ? 'System Administrator' : 'Lead Attorney • Senior Partner'}</p>
            </header>

            {/* Economic Duress Monitor Alert */}
            {unpaidWeeks > 0 && (
                <div className="mb-8 glass-panel border-red-500/30 bg-red-950/20 p-5 rounded-2xl flex items-start gap-4 shadow-lg shadow-red-900/10">
                    <div className="bg-red-500/20 p-3 rounded-xl shrink-0">
                        <AlertTriangle className="w-6 h-6 text-red-400" />
                    </div>
                    <div>
                        <h3 className="text-red-400 font-semibold text-lg flex items-center gap-2">
                            Economic Duress Alert
                            <span className="text-xs bg-red-500/20 px-2 py-0.5 rounded-full text-red-300">CRITICAL</span>
                        </h3>
                        <p className="text-text-muted mt-1">
                            Opposing party has marked <strong>{unpaidWeeks} weekly payments</strong> as 'Not Received'. This establishes a deliberate starvation strategy indicative of bad faith negotiations.
                        </p>
                    </div>
                </div>
            )}

            {/* Primary KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Debt Card */}
                <div className="bg-bg-surface p-5 rounded-xl shadow-sm border border-border-default flex flex-col gap-3 transition-transform hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                        <span className="text-amber-500 bg-amber-500/10 p-2 rounded-lg">
                            <TrendingUp className="w-5 h-5" />
                        </span>
                        <span className="text-[10px] font-bold text-rose-500 bg-rose-500/10 px-2 py-1 rounded-full uppercase tracking-tighter border border-rose-500/20">Critical</span>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Total Calculated Debt</p>
                        <p className="text-3xl font-bold text-text-main mt-1">{formatCurrency(totalDebt)}</p>
                    </div>
                </div>

                {/* Evidence Card */}
                <div className="bg-bg-surface p-5 rounded-xl shadow-sm border border-border-default flex flex-col gap-3 transition-transform hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                        <span className="text-primary bg-primary/10 p-2 rounded-lg">
                            <ShieldCheck className="w-5 h-5" />
                        </span>
                        <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full uppercase tracking-tighter border border-emerald-500/20">Verified</span>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Verified Evidence</p>
                        <p className="text-3xl font-bold text-text-main mt-1">{evidenceCount}</p>
                    </div>
                </div>

                {/* Risk Level Card */}
                <div className="bg-bg-surface p-5 rounded-xl shadow-sm border border-border-default flex flex-col gap-3 transition-transform hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                        <span className="text-emerald-500 bg-emerald-500/10 p-2 rounded-lg">
                            <Scale className="w-5 h-5" />
                        </span>
                        <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded-full uppercase tracking-tighter border border-amber-500/20">Active</span>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Legal Risk Level</p>
                        <p className="text-3xl font-bold text-text-main mt-1">High</p>
                    </div>
                </div>
            </div>

            {/* Case Summary Panel */}
            <h2 className="text-xl font-semibold text-text-main mb-4 mt-12 flex items-center gap-2">
                <FileText className="w-5 h-5 text-text-muted" /> Executive Summary
            </h2>
            <div className="glass-panel p-6 rounded-2xl">
                <div className="prose prose-invert max-w-none text-text-muted">
                    <TranslatedText
                        original="This portal organizes the evidence timeline and financial claims against the opposing partner. The core assertion is that the partner enacted a covert dissolution on February 12th in bad faith, subsequently restricting financial resources to coerce an unfavorable settlement."
                        translated="تنظم هذه البوابة التسلسل الزمني للأدلة والمطالبات المالية ضد الشريك المعارض. التأكيد الأساسي هو أن الشريك نفذ حل الشركة سراً في 12 فبراير بسوء نية، وقام بعد ذلك بتقييد الموارد المالية لإجبار تسوية غير المواتية."
                    />
                </div>
            </div>
        </div>
    );
}
