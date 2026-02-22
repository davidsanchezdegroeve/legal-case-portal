import { Building, Landmark, Users, Briefcase, FileText } from 'lucide-react';
import { TranslatedText } from '../components/ui/TranslatedText';

export default function Founders() {
    return (
        <div className="max-w-6xl mx-auto pb-12">
            <header className="mb-8 flex flex-col gap-1">
                <p className="text-sm font-medium text-text-muted tracking-wide uppercase">Corporate Intelligence</p>
                <h1 className="text-3xl font-bold text-text-main">Founders & Corporate Structure</h1>
                <p className="text-text-muted text-sm mt-1 font-medium">Financial footprint, entities, and asset locations.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Entities Card */}
                <div className="bg-bg-surface p-6 rounded-2xl shadow-sm border border-border-default flex flex-col gap-4">
                    <div className="flex items-center gap-3 border-b border-border-default pb-4">
                        <div className="bg-primary/10 p-2.5 rounded-xl">
                            <Building className="w-5 h-5 text-primary" />
                        </div>
                        <h2 className="text-lg font-semibold text-text-main">Corporate Entities & Jurisdictions</h2>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-semibold text-text-main">🇸🇦 Saudi Arabia (KSA)</h3>
                            <p className="text-xs text-text-muted mt-1">Rommaana Technologies Co. / Rummanat Al Taqniyat</p>
                            <p className="text-xs text-text-muted">MISA License, CR, ZACTA VAT Registered. Reincorporation ~Feb 2025.</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-text-main">🇦🇪 UAE (ADGM - Abu Dhabi)</h3>
                            <p className="text-xs text-text-muted mt-1">POMEGRANATE TECHNOLOGIES HOLDINGS LIMITED</p>
                            <p className="text-xs text-text-muted">Incorporated Sep 2023. Acts as holding company.</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-text-main">🇪🇸 Spain</h3>
                            <p className="text-xs text-text-muted mt-1">Pomegranate Technologies Spain SL</p>
                            <p className="text-xs text-text-muted">Used for European operations and applying for public funds.</p>
                        </div>
                    </div>
                </div>

                {/* Bank Accounts Card */}
                <div className="bg-bg-surface p-6 rounded-2xl shadow-sm border border-border-default flex flex-col gap-4">
                    <div className="flex items-center gap-3 border-b border-border-default pb-4">
                        <div className="bg-emerald-500/10 p-2.5 rounded-xl">
                            <Landmark className="w-5 h-5 text-emerald-500" />
                        </div>
                        <h2 className="text-lg font-semibold text-text-main">Financial Institutions ("Where the Money Is")</h2>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-semibold text-text-main">Riyadh Bank (KSA)</h3>
                            <p className="text-xs text-text-muted mt-1">SME Credit Cards and Petty Cash Prepaid Cards.</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-text-main">STC Bank (KSA)</h3>
                            <p className="text-xs text-text-muted mt-1">Account details found under founder files.</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-text-main">Zand Bank (UAE)</h3>
                            <p className="text-xs text-text-muted mt-1">Account opening documents for ADGM Holding company.</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-text-main">CaixaBank (Spain)</h3>
                            <p className="text-xs text-text-muted mt-1">Invoices and digital banking records for the Spanish entity.</p>
                        </div>
                    </div>
                </div>

                {/* Revenue Sources Card */}
                <div className="bg-bg-surface p-6 rounded-2xl shadow-sm border border-border-default flex flex-col gap-4">
                    <div className="flex items-center gap-3 border-b border-border-default pb-4">
                        <div className="bg-amber-500/10 p-2.5 rounded-xl">
                            <Briefcase className="w-5 h-5 text-amber-500" />
                        </div>
                        <h2 className="text-lg font-semibold text-text-main">Revenue Sources & Liquid Assets</h2>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-semibold text-text-main">Public Funds & Government Grants</h3>
                            <ul className="text-xs text-text-muted mt-1 list-disc list-inside">
                                <li>Spain: ENISA, ICEXNEXT, IVF (Instituto Valenciano de Finanzas), IVACE InnovaTeic, EMPYME</li>
                                <li>Saudi: NTDP (National Technology Development Program)</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-text-main">B2B Client Contracts</h3>
                            <p className="text-xs text-text-muted mt-1">FlyAKeel, Al Mabeet, OYOROOMS, Al Hokair, Viavii</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-text-main">Investors & Accelerators</h3>
                            <p className="text-xs text-text-muted mt-1">500 Startups, Flat6Labs, WAED (Due Diligence Data Room prep)</p>
                        </div>
                    </div>
                </div>

                {/* Key Stakeholders Card */}
                <div className="bg-bg-surface p-6 rounded-2xl shadow-sm border border-border-default flex flex-col gap-4">
                    <div className="flex items-center gap-3 border-b border-border-default pb-4">
                        <div className="bg-blue-500/10 p-2.5 rounded-xl">
                            <Users className="w-5 h-5 text-blue-500" />
                        </div>
                        <h2 className="text-lg font-semibold text-text-main">Key Individuals & Stakeholders</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-sm text-text-muted">DS</div>
                            <div>
                                <h3 className="text-sm font-semibold text-text-main">David Sanchez De Groeve</h3>
                                <p className="text-xs text-text-muted">Founder / Partner</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-sm text-text-muted">GM</div>
                            <div>
                                <h3 className="text-sm font-semibold text-text-main">Gustavo Alberto Madico Villarroel</h3>
                                <p className="text-xs text-text-muted">Founder / Partner / Managing Director</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl">
                <h2 className="text-lg font-semibold text-text-main mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-text-muted" /> Strategic Legal Notes
                </h2>
                <div className="prose prose-invert max-w-none text-text-muted">
                    <TranslatedText
                        original="Target subpoenas to Riyadh Bank, Zand Bank, and CaixaBank using the specific entity names. Audit the holding company (Pomegranate Technologies Holdings Limited) in ADGM to trace equity investments. Investigate grant disbursement records from ENISA, IVF, and NTDP."
                        translated="توجيه مذكرات استدعاء لكل من بنك الرياض، بنك زاند، وCaixaBank باستخدام أسماء الكيانات المحددة. مراجعة الشركة القابضة (Pomegranate Technologies Holdings Limited) في سوق أبوظبي العالمي لتتبع الاستثمارات في الأسهم. التحقيق في سجلات صرف المنح من ENISA، IVF، وNTDP."
                    />
                </div>
            </div>
        </div>
    );
}
