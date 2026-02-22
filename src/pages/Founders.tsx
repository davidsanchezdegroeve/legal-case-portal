import { Building, Landmark, Users, Briefcase, FileText } from 'lucide-react';
import { TranslatedText } from '../components/ui/TranslatedText';

const INVESTORS = [
    { name: 'Juan David Peña', amount: '€50,000', equity: '0.13%' },
    { name: 'Pedro Jimenez', amount: '€40,000', equity: '0.32%' },
    { name: 'Roland Wong', amount: '€29,846', equity: '0.67%' },
    { name: 'Jaume Cases', amount: '€21,618', equity: '0.39%' },
    { name: 'Adrian Sposari', amount: '€19,990', equity: '0.42%' },
    { name: 'Albert Catala', amount: '€15,000', equity: '0.13%' },
    { name: 'Jordi Casanova', amount: '€14,974', equity: '0.26%' },
    { name: 'Raquel Garrido', amount: '€14,132', equity: '0.10%' },
    { name: 'Aaron Clemente', amount: '€13,800', equity: '0.13%' },
    { name: 'Jeronimo Martí', amount: '€10,970', equity: '0.16%' },
    { name: 'Miguel Rincón', amount: '€10,970', equity: '0.16%' },
    { name: 'Jose Manuel Palomo', amount: '€10,000', equity: '0.16%' },
    { name: 'Enrique Alacreu', amount: '€10,000', equity: '0.16%' },
    { name: 'Christoph Hanser', amount: '€7,500', equity: '0.13%' },
    { name: 'David Herrera', amount: '€7,500', equity: '0.13%' },
    { name: 'Manuel Fuertes', amount: '€6,632', equity: '0.10%' },
];

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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2 bg-bg-surface p-6 rounded-2xl shadow-sm border border-border-default flex flex-col gap-4">
                    <div className="flex items-center gap-3 border-b border-border-default pb-4">
                        <div className="bg-indigo-500/10 p-2.5 rounded-xl">
                            <Users className="w-5 h-5 text-indigo-500" />
                        </div>
                        <h2 className="text-lg font-semibold text-text-main">Equity Structure & Angel Syndicate</h2>
                    </div>
                    <p className="text-sm text-text-muted">
                        The current equity structure is supported by a consolidated Angel Syndicate of 16 private investors. This group provides both the initial capital base and strategic industry expertise.
                    </p>
                    <div className="overflow-x-auto mt-2">
                        <table className="w-full text-sm text-left whitespace-nowrap">
                            <thead className="text-xs text-text-muted uppercase bg-bg-base/50">
                                <tr>
                                    <th className="px-4 py-3 rounded-tl-lg font-semibold">Investor Name</th>
                                    <th className="px-4 py-3 font-semibold">Total Investment (€)</th>
                                    <th className="px-4 py-3 rounded-tr-lg font-semibold">Equity Stake (%)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-default">
                                {INVESTORS.map((inv, i) => (
                                    <tr key={i} className="hover:bg-bg-base/30 transition-colors">
                                        <td className="px-4 py-2.5 text-text-main font-medium">{inv.name}</td>
                                        <td className="px-4 py-2.5 text-text-muted">{inv.amount}</td>
                                        <td className="px-4 py-2.5 text-text-muted">{inv.equity}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-bg-surface p-6 rounded-2xl shadow-sm border border-border-default flex flex-col gap-4">
                    <div className="flex items-center gap-3 border-b border-border-default pb-4">
                        <div className="bg-rose-500/10 p-2.5 rounded-xl">
                            <Landmark className="w-5 h-5 text-rose-500" />
                        </div>
                        <h2 className="text-lg font-semibold text-text-main">Venture Capital & Institutional Status</h2>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-semibold text-text-main">Pipeline Entities</h3>
                            <p className="text-xs text-text-muted mt-1">500 Startups, Flat6Labs, WAED.</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-text-main">Status</h3>
                            <p className="text-xs text-text-muted mt-1">Active Evaluation / Non-Funded.</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-text-main">Disclosure</h3>
                            <p className="text-xs text-text-muted mt-1 leading-relaxed">
                                While several Venture Capital firms and institutional accelerators have conducted preliminary due diligence and valuation exercises, no institutional capital has been secured or finalized over the past 24 months. The company remains exclusively funded by the aforementioned private syndicate and operational revenue.
                            </p>
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
                        original="The entity's capital structure is currently comprised of the founding team and a syndicate of 16 angel investors. It is important to clarify for audit and due diligence purposes that despite ongoing negotiations and high-level interest from institutional VCs and accelerators between 2024 and 2026, no formal investment rounds have been closed with these entities. Current financial stability is derived solely from private individual contributions and organic growth."
                        translated="يتكون هيكل رأس مال الكيان حاليًا من الفريق المؤسس ومجموعة من 16 مستثمرًا ملائكيًا. من المهم التوضيح لأغراض التدقيق والعناية الواجبة أنه على الرغم من المفاوضات الجارية والاهتمام عالي المستوى من أصحاب رأس المال الاستثماري المؤسسي والمسرعات بين عامي 2024 و 2026، لم يتم إغلاق أي جولات استثمارية رسمية مع هذه الكيانات. الاستقرار المالي الحالي مستمد حصريًا من المساهمات الفردية الخاصة والنمو العضوي."
                    />
                </div>
            </div>
        </div>
    );
}
