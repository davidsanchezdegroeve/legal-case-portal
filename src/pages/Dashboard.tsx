import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

import { TrendingUp, AlertTriangle, ShieldCheck, Scale, FileText } from 'lucide-react';
import { TranslatedText } from '../components/ui/TranslatedText';

export default function Dashboard() {
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
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-text-main mb-2">Legal Strategy Overview</h1>
                <p className="text-text-muted">High-level summary of the shareholder dispute case.</p>
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
                <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <h3 className="text-text-muted font-medium tracking-wide text-sm uppercase">Total Calculated Debt</h3>
                        <div className="p-2 bg-bg-surface rounded-lg border border-slate-800">
                            <TrendingUp className="w-5 h-5 text-amber-500" />
                        </div>
                    </div>
                    <div className="relative z-10">
                        <div className="text-4xl font-bold text-text-main mb-1">
                            {formatCurrency(totalDebt)}
                        </div>
                        <p className="text-xs text-text-muted">Includes all GOSI salary gaps & accrued rates</p>
                    </div>
                </div>

                <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <h3 className="text-text-muted font-medium tracking-wide text-sm uppercase">Verified Evidence</h3>
                        <div className="p-2 bg-bg-surface rounded-lg border border-slate-800">
                            <ShieldCheck className="w-5 h-5 text-blue-400" />
                        </div>
                    </div>
                    <div className="relative z-10">
                        <div className="text-4xl font-bold text-text-main mb-1">{evidenceCount}</div>
                        <p className="text-xs text-text-muted">Government & Official Documents in Vault</p>
                    </div>
                </div>

                <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <h3 className="text-text-muted font-medium tracking-wide text-sm uppercase">Legal Risk Level</h3>
                        <div className="p-2 bg-bg-surface rounded-lg border border-slate-800">
                            <Scale className="w-5 h-5 text-emerald-400" />
                        </div>
                    </div>
                    <div className="relative z-10">
                        <div className="text-4xl font-bold text-emerald-400 mb-1">High</div>
                        <p className="text-xs text-text-muted">Based on recent hostile correspondence</p>
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
