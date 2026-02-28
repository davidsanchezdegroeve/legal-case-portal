import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Plus, AlertOctagon, CircleDot, FileEdit, FileText, FileWarning, X, Landmark } from 'lucide-react';
import { DualLanguageInput } from '../components/ui/DualLanguageInput';

interface TimelineEvent {
    id: string;
    timestamp: string;
    event_title: string;
    description: string;
    is_bad_faith_indicator: boolean;
    arabic_translation?: string;
    category?: 'general' | 'contract' | 'bad_faith' | 'milestone' | 'financial' | 'vesting'; // Extended types
}

export default function Timeline() {
    const { profile } = useAuth();
    const isAdmin = profile?.role === 'admin';
    const [events, setEvents] = useState<TimelineEvent[]>([]);
    const [showAdd, setShowAdd] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'bad_faith' | 'contract' | 'milestone' | 'financial' | 'general' | 'vesting'>('all');
    const [zoomScale, setZoomScale] = useState(1);
    const timelineRef = useRef<HTMLDivElement>(null);

    // Zoom wheel handler
    useEffect(() => {
        const el = timelineRef.current;
        if (!el) return;

        const handleWheel = (e: WheelEvent) => {
            // Usually, holding Ctrl/Cmd while wheeling indicates zoom
            if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) {
                e.preventDefault();
                setZoomScale(prev => {
                    const newScale = prev - (e.deltaY * 0.005);
                    return Math.max(1, Math.min(newScale, 15)); // between 1x and 15x zoom
                });
            } else {
                // Even without modifier, if we want to zoom over time:
                e.preventDefault();
                setZoomScale(prev => {
                    const newScale = prev - (e.deltaY * 0.005);
                    return Math.max(1, Math.min(newScale, 15));
                });
            }
        };

        el.addEventListener('wheel', handleWheel, { passive: false });
        return () => el.removeEventListener('wheel', handleWheel);
    }, [isLoading, events, filter]);

    // New event state
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [descArabic, setDescArabic] = useState('');
    const [isBadFaith, setIsBadFaith] = useState(false);

    useEffect(() => {
        async function fetchTimeline() {
            try {
                const { data, error } = await supabase
                    .from('timeline_events')
                    .select('*')
                    .order('timestamp', { ascending: false });

                if (error) throw error;

                // Comprehensive Static Context Events
                const staticEvents: TimelineEvent[] = [
                    // Foundation & Historical
                    {
                        id: 'hist-2',
                        timestamp: '2023-07-15T12:00:00Z', // Approx mid-july
                        event_title: 'Entity Established in Spain',
                        description: 'Pomegranate Technologies Spain S.L. (Rommaana) was established as a legal entity in Spain.',
                        is_bad_faith_indicator: false,
                        category: 'milestone'
                    },
                    {
                        id: 'hist-3-orig', // Renamed original hist-3 to avoid ID collision
                        timestamp: '2023-09-01T12:00:00Z',
                        event_title: 'Gustavo Vesting Start',
                        description: 'Gustavo Madico’s vesting start date as defined in the original Spanish Founders\' Agreement.',
                        is_bad_faith_indicator: false,
                        category: 'vesting'
                    },
                    {
                        id: 'hist-4',
                        timestamp: '2023-09-17T12:00:00Z',
                        event_title: 'Resignation Submitted',
                        description: 'Formal resignation submitted to eMcREY CEO. Forfeited 45,000 SAR/month position.',
                        arabic_translation: 'تم تقديم الاستقالة الرسمية إلى الرئيس التنفيذي لشركة eMcREY. تم التنازل عن منصب راتبه 45,000 ريال سعودي شهريًا.',
                        is_bad_faith_indicator: false,
                        category: 'milestone'
                    },
                    {
                        id: 'hist-5',
                        timestamp: '2024-01-17T17:00:00Z',
                        event_title: 'Vesting Officially Began (David)',
                        description: 'David Sanchez De Groeve\'s vesting schedule officially began in the original Spanish Founders\' Agreement. Final working day at eMcREY.',
                        is_bad_faith_indicator: false,
                        category: 'vesting'
                    },
                    {
                        id: 'hist-6',
                        timestamp: '2024-02-01T10:00:00Z',
                        event_title: 'Proposed Backdated Vesting',
                        description: 'The backdated Vesting Commencement Date proposed in the revised, safe drafts of the Founders Agreement to protect David\'s equity.',
                        is_bad_faith_indicator: false,
                        category: 'vesting'
                    },
                    {
                        id: 'hist-7',
                        timestamp: '2024-09-21T10:00:00Z',
                        event_title: 'SAFE Note Investment',
                        description: 'SAFE Note investment agreement with Jaume Cases Marco, establishing a $7,000,000 valuation cap.',
                        is_bad_faith_indicator: false,
                        category: 'contract'
                    },
                    {
                        id: 'hist-8',
                        timestamp: '2024-11-21T10:00:00Z',
                        event_title: 'SAFE Note Funds Secured',
                        description: 'Approximate date the purchase amount of 1,750 Euros was provided under the SAFE Note.',
                        is_bad_faith_indicator: false,
                        category: 'financial'
                    },
                    {
                        id: 'hist-9',
                        timestamp: '2024-12-26T10:00:00Z',
                        event_title: 'First Cliff Extension Amendment',
                        description: 'Entered into the first Spanish Amendment, explicitly extending the cliff period to "12 months following the Closing Date of the Financing Event". Proves precedent of using financing to delay shares, not reset start dates.',
                        is_bad_faith_indicator: false,
                        category: 'vesting'
                    },
                    {
                        id: 'hist-10',
                        timestamp: '2024-12-31T10:00:00Z',
                        event_title: 'Dec 2024 Financing Round',
                        description: 'The closing date of the financing round referenced in the First Cliff Extension Amendment. Proves they were raising rounds 14 months before the dispute.',
                        is_bad_faith_indicator: false,
                        category: 'financial'
                    },
                    {
                        id: 'hist-11',
                        timestamp: '2025-02-20T10:00:00Z',
                        event_title: 'Initial Backdated Vesting Proposal',
                        description: 'A backdated vesting date initially proposed in one of Gustavo\'s earlier drafts before the Bilingual final.',
                        is_bad_faith_indicator: false,
                        category: 'vesting'
                    },
                    {
                        id: 'hist-12',
                        timestamp: '2025-06-26T10:00:00Z',
                        event_title: 'Saudi AoA Commercial Registration',
                        description: 'Official Commercial Registration (CR) Issue Date (28/11/1446 AH) proving the company was legally registered in KSA long before Gustavo attempted to reset the vesting to Feb 2026.',
                        is_bad_faith_indicator: false,
                        category: 'milestone'
                    },
                    {
                        id: 'hist-13',
                        timestamp: '2025-09-01T10:00:00Z',
                        event_title: 'Second Amendment Retroactive Date',
                        description: 'The backdated "Entered into as of" date applied to the January 2026 Cliff Extension, attempting to cover a December 2025 financing round retroactively.',
                        is_bad_faith_indicator: true,
                        category: 'vesting'
                    },
                    {
                        id: 'hist-14',
                        timestamp: '2025-10-07T10:00:00Z',
                        event_title: 'Saudi AoA Notarized',
                        description: 'Date the Saudi Articles of Association (AoA) were officially agreed and notarized (15/04/1447 AH).',
                        is_bad_faith_indicator: false,
                        category: 'contract'
                    },
                    {
                        id: 'hist-15',
                        timestamp: '2025-12-20T10:00:00Z',
                        event_title: 'Dec 2025 Financing Round',
                        description: 'A financing round closing date referenced in both the January 2026 Amendment and the draft Saudi Founders\' Agreement.',
                        is_bad_faith_indicator: false,
                        category: 'milestone'
                    },

                    // Recent Amendments & The Conflict (Jan-March 2026)
                    {
                        id: 'recent-1',
                        timestamp: '2026-01-08T10:00:00Z',
                        event_title: 'Second Cliff Extension Signed',
                        description: 'Actual signature date where Gustavo had David physically sign the backdated Spanish "Cliff Extension" to delay receipt of shares, proving double-counting when he later tried to reset the vesting start date in Saudi.',
                        is_bad_faith_indicator: true,
                        category: 'vesting'
                    },
                    {
                        id: 'recent-2',
                        timestamp: '2026-02-08T10:00:00Z',
                        event_title: 'MISA Correction Request Submitted',
                        description: 'Official Request sent to MISA to correct David\'s name. Signed physically with Gustavo. This explicitly invalidates the claim that David began an "unauthorized absence" on this exact day.',
                        is_bad_faith_indicator: false,
                        category: 'milestone'
                    },
                    {
                        id: 'recent-3',
                        timestamp: '2026-02-12T09:00:00Z',
                        event_title: 'False "Unauthorized Absence" Claim',
                        description: 'Company (via Abdulelah) falsely claimed David had an "unauthorized absence" between Feb 8-12.',
                        is_bad_faith_indicator: true,
                        category: 'bad_faith'
                    },
                    {
                        id: 'recent-4',
                        timestamp: '2026-02-15T14:00:00Z',
                        event_title: 'Predatory Founders Agreement',
                        description: 'Gustavo presented a heavily modified 36-page agreement containing Article 80 traps, vesting manipulation, and forced nominal value sale clauses.',
                        arabic_translation: 'قدم غوستافو اتفاقية معدلة بشدة من 36 صفحة تحتوي على فخاخ المادة 80.',
                        is_bad_faith_indicator: true,
                        category: 'contract'
                    },
                    {
                        id: 'recent-5',
                        timestamp: '2026-02-16T10:00:00Z',
                        event_title: 'Salary Transfers Halted',
                        description: 'Gustavo unilaterally halted weekly salary transfers.',
                        is_bad_faith_indicator: true,
                        category: 'bad_faith'
                    },
                    {
                        id: 'recent-6',
                        timestamp: '2026-02-18T11:00:00Z',
                        event_title: 'Monsha\'at Legal Advisory',
                        description: 'Attended official legal advisory session at Monsha\'at Support Center with Advisor Hind Al-Shehri.',
                        is_bad_faith_indicator: false,
                        category: 'milestone'
                    },
                    {
                        id: 'recent-7',
                        timestamp: '2026-02-21T21:00:00Z',
                        event_title: 'Legal Prep with Abdulaziz',
                        description: 'Met with lawyer Abdulaziz (with Loay) to begin formal legal preparation.',
                        is_bad_faith_indicator: false,
                        category: 'milestone'
                    },
                    {
                        id: 'recent-8',
                        timestamp: '2026-02-23T10:00:00Z',
                        event_title: 'Safe Founders Agreement Drafted',
                        description: 'Date applied to David\'s fully revised and legally safe "Founders Agreement" draft.',
                        is_bad_faith_indicator: false,
                        category: 'contract'
                    },
                    {
                        id: 'recent-9',
                        timestamp: '2026-02-24T10:00:00Z',
                        event_title: 'Digital Lockout Executed',
                        description: 'Gustavo executed a hostile "Digital Lockout," revoking access to Google Workspace Admin, Google Cloud, and other infrastructure.',
                        is_bad_faith_indicator: true,
                        category: 'bad_faith'
                    },
                    {
                        id: 'recent-10',
                        timestamp: '2026-02-25T14:00:00Z',
                        event_title: 'Proposal for Formal Meeting',
                        description: 'Proposed formal meeting with Gustavo to discuss separation and the lockout.',
                        is_bad_faith_indicator: false,
                        category: 'milestone'
                    },
                    {
                        id: 'recent-11',
                        timestamp: '2026-02-26T13:23:00Z',
                        event_title: 'Retaliatory Formal Notice',
                        description: 'Abdulelah sent retaliatory "Formal Notice" accusing David of unauthorized absence.',
                        is_bad_faith_indicator: true,
                        category: 'bad_faith'
                    },
                    {
                        id: 'recent-12',
                        timestamp: '2026-02-26T16:31:00Z',
                        event_title: '24-Hour Legal Demand Served',
                        description: 'Lawyer Abdulaziz officially served the 24-hour legal demand for 9,500 SAR to Gustavo\'s mobile.',
                        is_bad_faith_indicator: false,
                        category: 'milestone'
                    },
                    {
                        id: 'recent-13',
                        timestamp: '2026-02-27T10:00:00Z',
                        event_title: 'Rent Due & Housing Denied',
                        description: '3,500 SAR personal apartment rent due. Gustavo explicitly denied the existence of the housing allowance.',
                        is_bad_faith_indicator: true,
                        category: 'bad_faith'
                    },
                    {
                        id: 'recent-14',
                        timestamp: '2026-02-27T16:31:00Z',
                        event_title: 'Legal Demand Expires',
                        description: 'Exact expiration time of the 24-hour formal legal demand served to Gustavo.',
                        is_bad_faith_indicator: false,
                        category: 'milestone'
                    },
                    {
                        id: 'recent-15',
                        timestamp: 'new Date().toISOString()',
                        event_title: 'Hotel Accommodation Paid',
                        description: 'Current date in timeline; hotel accommodation was paid up by this date.',
                        is_bad_faith_indicator: false,
                        category: 'general'
                    },
                    {
                        id: 'recent-16',
                        timestamp: '2026-03-01T10:00:00Z',
                        event_title: 'Impending Deadlines',
                        description: 'Abdulelah deadline to return to office. "Executive Summary: Settlement & Reinstatement Proposal" prepared for HR negotiation.',
                        is_bad_faith_indicator: false,
                        category: 'milestone'
                    },

                    // Future Targets
                    {
                        id: 'future-1',
                        timestamp: '2026-11-26T10:00:00Z',
                        event_title: 'First Fiscal Year End',
                        description: 'Official First Fiscal Year End Date (16/06/1448 AH) according to the Saudi AoA.',
                        is_bad_faith_indicator: false,
                        category: 'milestone'
                    },
                    {
                        id: 'future-2',
                        timestamp: '2026-12-01T10:00:00Z', // Assuming Dec 1st for placeholder
                        event_title: 'Cliff Expiration',
                        description: 'Expiration date of David\'s extended "Cliff" based on the January 8, 2026 Amendment.',
                        is_bad_faith_indicator: false,
                        category: 'vesting'
                    },
                    {
                        id: 'future-3',
                        timestamp: '2028-02-01T10:00:00Z',
                        event_title: 'Bad Leaver Lock-in Expiration',
                        description: 'Date David\'s 24-month "Bad Leaver" lock-in would have expired if he had signed Gustavo\'s hostile 2026 draft.',
                        is_bad_faith_indicator: false,
                        category: 'vesting'
                    },
                ];

                // Fix the dynamic timestamp for the "Present" event
                staticEvents.find(e => e.id === 'recent-15')!.timestamp = new Date().toISOString();

                const combinedEvents = [...staticEvents, ...(data || []).map(e => ({ ...e, category: e.is_bad_faith_indicator ? 'bad_faith' : 'general' } as TimelineEvent))];
                combinedEvents.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

                setEvents(combinedEvents);
            } catch (err) {
                console.error("Error fetching timeline:", err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchTimeline();
    }, []);

    const filteredEvents = events.filter(event => {
        if (filter === 'all') return true;
        if (filter === 'bad_faith') return event.is_bad_faith_indicator;
        return event.category === filter;
    });

    // Timeline Calculation Helpers
    const getTimelineMetrics = () => {
        if (filteredEvents.length === 0) return { min: 0, max: 0, range: 1 };

        const times = filteredEvents.map(e => new Date(e.timestamp).getTime());
        const rawMin = Math.min(...times);
        // Add a 5% buffer on the left for the earliest event
        const minTime = rawMin;

        const maxTime = Math.max(...times);
        const range = maxTime - minTime;
        return { min: minTime, max: maxTime, range: range === 0 ? 1 : range };
    };

    const { min, range } = getTimelineMetrics();

    const formatAxisDate = (timeMs: number) => {
        return new Date(timeMs).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    const getPositionPercent = (timestamp: string) => {
        const time = new Date(timestamp).getTime();
        // Calculate percentage, ensuring it stays between 5% and 95% for visual padding
        const rawPercent = ((time - min) / range) * 100;
        return Math.max(5, Math.min(95, rawPercent));
    };

    const getEventIcon = (event: TimelineEvent) => {
        if (event.category === 'contract') return <FileText className="w-5 h-5 text-accent-amber" />;
        if (event.is_bad_faith_indicator) return <FileWarning className="w-5 h-5 text-rose-500" />;
        if (event.category === 'milestone') return <CircleDot className="w-5 h-5 text-primary" />;
        if (event.category === 'financial') return <Landmark className="w-5 h-5 text-emerald-400" />;
        return <AlertOctagon className="w-5 h-5 text-blue-400" />;
    };

    const handleAddSubmit = async () => {
        if (!title || !desc) return;
        const newEvent = {
            timestamp: new Date().toISOString(),
            event_title: title,
            description: desc,
            arabic_translation: descArabic || undefined,
            is_bad_faith_indicator: isBadFaith
        };

        try {
            const { data, error } = await supabase
                .from('timeline_events')
                .insert([newEvent])
                .select()
                .single();

            if (error) throw error;
            const typedData = data as TimelineEvent;
            if (typedData) setEvents([typedData, ...events]);

            setShowAdd(false);
            setTitle(''); setDesc(''); setDescArabic(''); setIsBadFaith(false);
        } catch (e: unknown) {
            console.error(e);
            const errorMessage = e instanceof Error ? e.message : 'Unknown error occurred';
            alert("Failed to add incident: " + errorMessage);
        }
    };


    if (isLoading) {
        return (
            <div className="w-full pb-12 flex items-center justify-center min-h-[50vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-text-muted font-medium tracking-wide">Loading timeline records...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full pb-12">
            <header className="mb-10 flex flex-col gap-1">
                <p className="text-sm font-medium text-text-muted tracking-wide uppercase">Historical Ledger</p>
                <div className="flex justify-between items-end">
                    <h1 className="text-3xl font-bold text-text-main">Event Timeline</h1>
                    {isAdmin && (
                        <button
                            onClick={() => setShowAdd(!showAdd)}
                            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-xl transition-colors shadow-lg shadow-primary/20"
                        >
                            {showAdd ? 'Cancel' : <><Plus className="w-5 h-5" /> Add Incident</>}
                        </button>
                    )}
                </div>
            </header>

            {showAdd && isAdmin && (
                <div className="glass-panel p-6 rounded-2xl mb-10 border border-blue-500/30 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px] -z-10 pointer-events-none"></div>
                    <h3 className="text-lg font-semibold text-text-main mb-6 flex items-center gap-2"><FileEdit className="w-5 h-5 text-blue-400" /> Log New Incident</h3>

                    <div className="space-y-5">
                        <div>
                            <label className="text-sm font-medium text-text-muted ml-1 block mb-1">Event Title</label>
                            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Email intercepted" className="w-full bg-bg-surface/80 border border-slate-700 rounded-xl px-4 py-2.5 text-text-main focus:border-blue-500 outline-none" />
                        </div>

                        <DualLanguageInput
                            label="Detailed Description"
                            value={desc}
                            onChange={setDesc}
                            onTranslated={setDescArabic}
                            sourceLang="english"
                            isTextArea
                            placeholder="Log the details of the event..."
                        />

                        <label className="flex items-center gap-3 bg-bg-surface p-4 rounded-xl border border-slate-800 cursor-pointer hover:border-slate-700 transition">
                            <input type="checkbox" checked={isBadFaith} onChange={(e) => setIsBadFaith(e.target.checked)} className="w-5 h-5 rounded border-slate-600 text-red-500 focus:ring-red-500/50 bg-slate-800" />
                            <div>
                                <span className="text-text-main font-medium block">Flag as Bad Faith Indicator</span>
                                <span className="text-xs text-text-muted">Will highlight this event as a critical breach of fiduciary duty.</span>
                            </div>
                        </label>

                        <button onClick={handleAddSubmit} className="bg-white text-slate-900 hover:bg-slate-200 font-medium px-6 py-2.5 rounded-xl w-full transition-colors mt-2">
                            Save Incident Record
                        </button>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-8">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-colors ${filter === 'all' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-bg-surface text-text-muted hover:bg-bg-surface-hover hover:text-text-main border border-border-default/50'} `}
                >
                    All Events
                </button>
                <button
                    onClick={() => setFilter('bad_faith')}
                    className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2 ${filter === 'bad_faith' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border border-rose-500/20'} `}
                >
                    <AlertOctagon className="w-3.5 h-3.5" />
                    Bad Faith
                </button>
                <button
                    onClick={() => setFilter('contract')}
                    className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-colors ${filter === 'contract' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-bg-surface text-text-muted hover:bg-bg-surface-hover hover:text-text-main border border-border-default/50'} `}
                >
                    Contracts & Agreements
                </button>
                <button
                    onClick={() => setFilter('vesting')}
                    className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-colors ${filter === 'vesting' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-bg-surface text-text-muted hover:bg-bg-surface-hover hover:text-text-main border border-border-default/50'} `}
                >
                    Vesting & Cliffs
                </button>
                <div className="ml-auto text-xs text-text-muted flex items-center space-x-2">
                    <span className="font-bold bg-bg-surface px-3 py-1.5 rounded-full border border-border-default/50">🔎 Scroll wheel to zoom</span>
                </div>
                <button
                    onClick={() => setFilter('financial')}
                    className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-colors ${filter === 'financial' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-bg-surface text-text-muted hover:bg-bg-surface-hover hover:text-text-main border border-border-default/50'} `}
                >
                    Financial
                </button>
                <button
                    onClick={() => setFilter('milestone')}
                    className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-colors ${filter === 'milestone' ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' : 'bg-bg-surface text-text-muted hover:bg-bg-surface-hover hover:text-text-main border border-border-default/50'} `}
                >
                    Milestones
                </button>
            </div>

            {/* Horizontal Timeline Render */}
            {filteredEvents.length === 0 ? (
                <div className="text-center py-20 glass-card rounded-3xl border border-border-default shadow-sm">
                    <CircleDot className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-bold text-text-muted">No events found</h3>
                    <p className="text-text-muted text-sm mt-2">The timeline ledger is currently empty.</p>
                </div>
            ) : (
                <div
                    ref={timelineRef}
                    className="relative w-full py-64 overflow-x-auto custom-scrollbar bg-bg-surface/30 rounded-[48px] border border-border-default/50"
                >
                    <div
                        className="min-w-[800px] relative px-12 h-24 flex items-center transition-all duration-300 ease-out"
                        style={{ width: `${Math.max(100, 100 * zoomScale)}% ` }}
                    >

                        {/* The Axis Line */}
                        <div className="absolute left-8 right-8 h-1.5 bg-border-default/50 rounded-full top-1/2 -translate-y-1/2">
                            {/* Gradient Fill */}
                            <div className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-primary/50 via-accent-neon/50 to-primary/50 rounded-full" style={{ width: '100%' }}></div>
                        </div>

                        {/* Vesting & Cliff Period Bars */}
                        {(filter === 'all' || filter === 'vesting') && (() => {
                            // Ensure period lines are only rendered if their bounds fall within the visible range or overlap it
                            // Actually, getPositionPercent handles clamping / placement relative to the calculated metrics, and css%left/width manages layout naturally. 
                            const vestingStartPos = getPositionPercent('2024-01-17T17:00:00Z');
                            const vestingEndPos = getPositionPercent('2028-01-17T17:00:00Z');
                            const cliffEndPos = getPositionPercent('2026-12-01T10:00:00Z');

                            // Only render the bars if the axis isn't zoomed past them (i.e. if range is narrow and dates are far outside)
                            // Even if zoomed out,%widths work fine.
                            const vestingWidth = Math.max(0, vestingEndPos - vestingStartPos);
                            const cliffWidth = Math.max(0, cliffEndPos - vestingStartPos);

                            return (
                                <>
                                    <div
                                        className="absolute h-4 bg-indigo-500/20 border border-indigo-500/40 rounded-full transition-all duration-500 flex items-center justify-center backdrop-blur-sm"
                                        style={{ left: `${vestingStartPos}%`, width: `${vestingWidth}%`, top: 'calc(50% - 92px)' }}
                                    >
                                        <span className="text-[9px] font-black text-indigo-300 uppercase tracking-widest whitespace-nowrap px-2">4-Year Vesting Period (Original)</span>
                                    </div>
                                    <div
                                        className="absolute h-4 bg-purple-500/20 border border-purple-500/40 rounded-full transition-all duration-500 flex items-center justify-center backdrop-blur-sm"
                                        style={{ left: `${vestingStartPos}%`, width: `${cliffWidth}%`, top: 'calc(50% + 92px)' }}
                                    >
                                        <span className="text-[9px] font-black text-purple-300 uppercase tracking-widest whitespace-nowrap px-2">Extended Cliff (Amendment)</span>
                                    </div>
                                </>
                            );
                        })()}

                        {/* Events */}
                        {(() => {
                            // Pre-calculate positions and resolve collisions
                            const MIN_DISTANCE_PCT = 2.5; // Minimum percentage distance between markers
                            const positions = filteredEvents.map(event => ({
                                id: event.id,
                                originalPos: getPositionPercent(event.timestamp),
                                pos: getPositionPercent(event.timestamp)
                            })).sort((a, b) => a.pos - b.pos);

                            // Iterative collision resolution (Relaxation method)
                            for (let iteration = 0; iteration < 5; iteration++) {
                                for (let i = 0; i < positions.length - 1; i++) {
                                    const current = positions[i];
                                    const next = positions[i + 1];

                                    if (next.pos - current.pos < MIN_DISTANCE_PCT) {
                                        const overlap = MIN_DISTANCE_PCT - (next.pos - current.pos);
                                        // Push apart
                                        current.pos = Math.max(2, current.pos - (overlap / 2));
                                        next.pos = Math.min(98, next.pos + (overlap / 2));
                                    }
                                }
                            }

                            // Map resolved positions back to original event order for rendering
                            const resolvedPositionsMap = new Map(positions.map(p => [p.id, p.pos]));

                            return filteredEvents.map((event, index) => {
                                const leftPos = resolvedPositionsMap.get(event.id) || getPositionPercent(event.timestamp);
                                // Alternate up and down for visual clarity if they are close
                                const isTop = index % 2 === 0;

                                const hoveredIndex = hoveredId ? filteredEvents.findIndex(e => e.id === hoveredId) : -1;
                                let translateXOffset = 0;
                                let scaleMultiplier = 1;

                                if (hoveredIndex !== -1) {
                                    if (index === hoveredIndex) {
                                        scaleMultiplier = 2.5;
                                    } else {
                                        const diff = index - hoveredIndex;
                                        // Base push amount
                                        const pushAmount = 45;
                                        const decay = Math.max(0, 5 - Math.abs(diff)); // 4, 3, 2, 1, 0
                                        // Creates a natural curve where immediate neighbors are pushed the most
                                        const actualPush = pushAmount + (decay * 5);

                                        translateXOffset = index < hoveredIndex ? -actualPush : actualPush;

                                        // Neighbors also scale up slightly to complete the magnifier curve!
                                        if (Math.abs(diff) === 1) scaleMultiplier = 1.6;
                                        else if (Math.abs(diff) === 2) scaleMultiplier = 1.25;
                                    }
                                }

                                // Prevent tooltip clipping on edges
                                let tooltipClasses = "-translate-x-1/2";
                                let tooltipOrigin = isTop ? "bottom" : "top";

                                if (leftPos < 15) {
                                    tooltipClasses = "-translate-x-[15%]";
                                    tooltipOrigin = isTop ? "bottom-left" : "top-left";
                                } else if (leftPos > 85) {
                                    tooltipClasses = "-translate-x-[85%]";
                                    tooltipOrigin = isTop ? "bottom-right" : "top-right";
                                }

                                return (
                                    <div
                                        key={event.id}
                                        className="absolute transform transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] group"
                                        style={{
                                            left: `${leftPos}% `,
                                            transform: `translateX(calc(-50%+ ${translateXOffset}px))`,
                                            zIndex: hoveredId === event.id ? 60 : (scaleMultiplier > 1 ? 50 : 10)
                                        }}
                                    >
                                        {/* Invisible hit area for hover trap */}
                                        <div
                                            className="absolute -inset-10 cursor-pointer z-20 rounded-full"
                                            onMouseEnter={() => setHoveredId(event.id)}
                                            onMouseLeave={() => setHoveredId(null)}
                                            onClick={() => setSelectedEvent(event)}
                                        ></div>

                                        {/* The interactive numerical marker on the line (scales independently) */}
                                        <div
                                            className={`w-8 h-8-ml-4-mt-4 rounded-full border-2 bg-background-dark flex items-center justify-center transition-all duration-500 relative pointer-events-none z-10 ${event.is_bad_faith_indicator ? 'border-rose-500 shadow-rose-500/30' : 'border-primary shadow-primary/30'} ${hoveredId === event.id ? (event.is_bad_faith_indicator ? 'shadow-[0_0_30px_rgba(244,63,94,0.6)] bg-rose-950/50' : 'shadow-[0_0_30px_rgba(59,130,246,0.6)] bg-primary-950/20') : ''} `}
                                            style={{ transform: `scale(${scaleMultiplier})` }}
                                        >
                                            <span className={`text-[10px] font-black tracking-tighter transition-opacity duration-500 ${hoveredId === event.id ? 'opacity-100' : 'opacity-80'} ${event.is_bad_faith_indicator ? 'text-rose-500' : 'text-primary'} `}>
                                                {index + 1}
                                            </span>
                                        </div>

                                        {/* Hover Tooltip (Magnifier Effect Descriptor) */}
                                        <div className={`absolute left-0 ${tooltipClasses} ${isTop ? 'bottom-[48px]' : 'top-[48px]'} w-80 pointer-events-none transition-all duration-500 z-50 origin-${tooltipOrigin} `}
                                            style={{
                                                opacity: hoveredId === event.id ? 1 : 0,
                                                transform: hoveredId === event.id ? 'translateY(0) scale(1)' : `translateY(${isTop ? '15px' : '-15px'}) scale(0.95)`,
                                            }}>
                                            <div className={`glass-card p-5 rounded-2xl shadow-[0_20px_50px_rgba(0, 0, 0, 0.6)] border ${event.is_bad_faith_indicator ? 'border-rose-500/60 bg-rose-950/40 backdrop-blur-2xl' : 'border-primary/50 bg-background-dark/95 backdrop-blur-2xl'} `}>
                                                <div className="flex items-center gap-2 mb-3">
                                                    {getEventIcon(event)}
                                                    <span className="text-[11px] font-black uppercase tracking-widest text-text-muted">
                                                        {new Date(event.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                </div>
                                                <h4 className={`text-base font-black mb-2 leading-tight ${event.is_bad_faith_indicator ? 'text-rose-400' : 'text-text-main'} `}>
                                                    {event.event_title}
                                                </h4>
                                                <p className="text-[13px] text-text-muted leading-relaxed">
                                                    {event.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        })()}

                        {/* Baseline Labels */}
                        <div className="absolute left-8 -bottom-8 text-[10px] font-bold text-text-muted uppercase tracking-widest">
                            {formatAxisDate(min)}
                        </div>
                        <div className="absolute right-8 -bottom-8 text-[10px] font-bold text-text-muted uppercase tracking-widest">
                            {formatAxisDate(min + range)}
                        </div>
                    </div>
                </div>
            )}

            {/* Complete Event List View */}
            {filteredEvents.length > 0 && (
                <div className="mt-8 glass-card rounded-2xl border border-border-default/50 overflow-hidden">
                    <div className="p-6 border-b border-border-default/50 bg-bg-surface flex items-center gap-3">
                        <FileText className="text-primary w-5 h-5" />
                        <h3 className="text-lg font-black tracking-widest uppercase text-text-main">
                            Complete Event Ledger
                        </h3>
                    </div>
                    <div className="divide-y divide-border-default/30">
                        {filteredEvents.map((event, index) => (
                            <div
                                key={event.id}
                                className={`p-6 transition-colors flex gap-6 cursor-pointer group ${event.is_bad_faith_indicator ? 'hover:bg-rose-500/5' : 'hover:bg-bg-surface-hover'} `}
                                onClick={() => setSelectedEvent(event)}
                                onMouseEnter={() => setHoveredId(event.id)}
                                onMouseLeave={() => setHoveredId(null)}
                            >
                                {/* Marker / Number */}
                                <div className="flex-shrink-0 flex flex-col items-center mt-1">
                                    <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-black text-sm transition-all duration-300 ${event.is_bad_faith_indicator ? 'border-rose-500 text-rose-500 group-hover:bg-rose-500 group-hover:text-background-dark' : 'border-primary text-primary group-hover:bg-primary group-hover:text-background-dark'} ${hoveredId === event.id ? 'scale-110 shadow-lg' : ''} ${hoveredId === event.id && event.is_bad_faith_indicator ? 'bg-rose-500 text-background-dark shadow-rose-500/40' : ''} ${hoveredId === event.id && !event.is_bad_faith_indicator ? 'bg-primary text-background-dark shadow-primary/40' : 'bg-background-dark'} `}>
                                        {index + 1}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        {getEventIcon(event)}
                                        <span className="text-xs font-black tracking-widest uppercase text-text-muted">
                                            {new Date(event.timestamp).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                        </span>
                                        {event.is_bad_faith_indicator && (
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center gap-1">
                                                <AlertOctagon className="w-3 h-3" />
                                                Red Flag
                                            </span>
                                        )}
                                    </div>
                                    <h4 className={`text-xl font-bold mb-2 ${event.is_bad_faith_indicator ? 'text-rose-400' : 'text-text-main group-hover:text-primary transition-colors'} `}>
                                        {event.event_title}
                                    </h4>
                                    <p className="text-sm text-text-muted leading-relaxed">
                                        {event.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Event Detail Modal */}
            {selectedEvent && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background-dark/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedEvent(null)}>
                    <div
                        className={`w-full max-w-xl glass-card rounded-2xl border flex flex-col overflow-hidden max-h-[90vh] shadow-2xl ${selectedEvent.is_bad_faith_indicator ? 'border-rose-500/40 shadow-rose-900/20' : 'border-primary/30 shadow-primary/10'} `}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className={`px-6 py-4 flex items-center justify-between border-b ${selectedEvent.is_bad_faith_indicator ? 'border-rose-500/20 bg-rose-500/5' : 'border-border-default bg-bg-surface/50'} `}>
                            <div className="flex items-center gap-3">
                                {getEventIcon(selectedEvent)}
                                <span className="text-xs font-bold tracking-widest uppercase text-text-muted">
                                    {new Date(selectedEvent.timestamp).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </span>
                            </div>
                            <button
                                onClick={() => setSelectedEvent(null)}
                                className="p-1.5 rounded-lg hover:bg-bg-surface-hover text-text-muted hover:text-text-main transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto">
                            <h2 className={`text-2xl font-black mb-4 ${selectedEvent.is_bad_faith_indicator ? 'text-rose-400' : 'text-text-main'} `}>
                                {selectedEvent.event_title}
                            </h2>

                            {selectedEvent.is_bad_faith_indicator && (
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-widest mb-6">
                                    <AlertOctagon className="w-4 h-4" />
                                    Bad Faith / Breach of Duty
                                </div>
                            )}

                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2 border-b border-border-default pb-2">Description</h4>
                                    <p className="text-sm text-text-main leading-relaxed whitespace-pre-wrap">
                                        {selectedEvent.description}
                                    </p>
                                </div>

                                {selectedEvent.arabic_translation && (
                                    <div>
                                        <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2 border-b border-border-default pb-2">Translation (الترجمة)</h4>
                                        <p className="text-sm text-text-muted leading-relaxed font-arabic whitespace-pre-wrap" dir="rtl">
                                            {selectedEvent.arabic_translation}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
