import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Plus, AlertOctagon, FileCheck, CircleDot, FileEdit } from 'lucide-react';
import { TranslatedText } from '../components/ui/TranslatedText';
import { DualLanguageInput } from '../components/ui/DualLanguageInput';

interface TimelineEvent {
    id: string;
    timestamp: string;
    event_title: string;
    description: string;
    is_bad_faith_indicator: boolean;
    arabic_translation?: string;
}

export default function Timeline() {
    const { profile } = useAuth();
    const isAdmin = profile?.role === 'admin';
    const [events, setEvents] = useState<TimelineEvent[]>([]);
    const [showAdd, setShowAdd] = useState(false);

    // New event state
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [descArabic, setDescArabic] = useState('');
    const [isBadFaith, setIsBadFaith] = useState(false);

    useEffect(() => {
        // For MVP, we use mock hardcoded initial state combining with Supabase fetch later.
        setEvents([
            {
                id: '2',
                timestamp: new Date().toISOString(),
                event_title: 'Current Date - Legal Hold',
                description: 'Waiting for shareholder response to initial litigation letter.',
                is_bad_faith_indicator: false,
                arabic_translation: 'في انتظار رد المساهم على خطاب التقاضي الأولي.'
            },
            {
                id: '1',
                timestamp: '2024-02-12T00:00:00Z',
                event_title: 'Feb 12th Secret Dissolution',
                description: 'Opposing partner covertly initiated company dissolution without notifying the board.',
                is_bad_faith_indicator: true,
                arabic_translation: 'شرع الشريك المعارض سراً في حل الشركة دون إخطار مجلس الإدارة.'
            }
        ]);
    }, []);

    const handleAddSubmit = async () => {
        if (!title || !desc) return;
        const newEvent: TimelineEvent = {
            id: Math.random().toString(),
            timestamp: new Date().toISOString(),
            event_title: title,
            description: desc,
            arabic_translation: descArabic || undefined,
            is_bad_faith_indicator: isBadFaith
        };

        try {
            await supabase.from('timeline_events').insert([
                {
                    timestamp: newEvent.timestamp,
                    event_title: newEvent.event_title,
                    description: newEvent.description,
                    arabic_translation: newEvent.arabic_translation,
                    is_bad_faith_indicator: newEvent.is_bad_faith_indicator
                }
            ]);
            // Even if DB fails in mock mode, add to UI
        } catch (e) {
            console.error(e);
        }
        setEvents([newEvent, ...events]);
        setShowAdd(false);
        setTitle(''); setDesc(''); setDescArabic(''); setIsBadFaith(false);
    };

    return (
        <div className="max-w-4xl mx-auto pb-12">
            <header className="mb-10 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Event Timeline</h1>
                    <p className="text-slate-400">Chronological ledger of legal and operational incidents.</p>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => setShowAdd(!showAdd)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl transition-colors shadow-lg shadow-blue-900/20"
                    >
                        {showAdd ? 'Cancel' : <><Plus className="w-5 h-5" /> Add Incident</>}
                    </button>
                )}
            </header>

            {showAdd && isAdmin && (
                <div className="glass-panel p-6 rounded-2xl mb-10 border border-blue-500/30 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px] -z-10 pointer-events-none"></div>
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2"><FileEdit className="w-5 h-5 text-blue-400" /> Log New Incident</h3>

                    <div className="space-y-5">
                        <div>
                            <label className="text-sm font-medium text-slate-300 ml-1 block mb-1">Event Title</label>
                            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Email intercepted" className="w-full bg-[#151822]/80 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 focus:border-blue-500 outline-none" />
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

                        <label className="flex items-center gap-3 bg-[#151822] p-4 rounded-xl border border-slate-800 cursor-pointer hover:border-slate-700 transition">
                            <input type="checkbox" checked={isBadFaith} onChange={(e) => setIsBadFaith(e.target.checked)} className="w-5 h-5 rounded border-slate-600 text-red-500 focus:ring-red-500/50 bg-slate-800" />
                            <div>
                                <span className="text-white font-medium block">Flag as Bad Faith Indicator</span>
                                <span className="text-xs text-slate-400">Will highlight this event as a critical breach of fiduciary duty.</span>
                            </div>
                        </label>

                        <button onClick={handleAddSubmit} className="bg-white text-slate-900 hover:bg-slate-200 font-medium px-6 py-2.5 rounded-xl w-full transition-colors mt-2">
                            Save Incident Record
                        </button>
                    </div>
                </div>
            )}

            {/* Timeline Render */}
            <div className="relative pl-8 sm:pl-32 py-6 space-y-12 before:absolute before:inset-0 before:ml-12 sm:before:ml-[7.5rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-700 before:to-transparent">

                {events.map((event, idx) => (
                    <div key={event.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        {/* Timeline Marker */}
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#0f111a] bg-[#1a1d29] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute left-2 sm:left-[6.2rem] md:left-1/2 -translate-x-1/2 transition-transform duration-300 group-hover:scale-110 z-10">
                            {event.is_bad_faith_indicator ? (
                                <div className="w-full h-full bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                                    <AlertOctagon className="w-4 h-4 text-red-400" />
                                </div>
                            ) : (
                                <div className="w-full h-full bg-blue-500/10 rounded-full flex items-center justify-center border border-slate-600">
                                    <CircleDot className="w-4 h-4 text-blue-400" />
                                </div>
                            )}
                        </div>

                        {/* Content Box */}
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] glass-panel p-5 rounded-2xl relative shadow-lg transition-transform duration-300 group-hover:-translate-y-1">
                            <div className="flex items-center justify-between mb-3">
                                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                                    {new Date(event.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </div>
                                {event.is_bad_faith_indicator && (
                                    <span className="text-[10px] font-bold bg-red-500/20 text-red-400 px-2 py-1 rounded-full uppercase tracking-wider border border-red-500/30">
                                        Bad Faith
                                    </span>
                                )}
                            </div>

                            <h4 className={`text-lg font-bold mb-3 ${event.is_bad_faith_indicator ? 'text-red-300' : 'text-slate-100'}`}>
                                {event.event_title}
                            </h4>

                            <TranslatedText
                                original={event.description}
                                translated={event.arabic_translation}
                                className="text-sm border-t border-slate-800/50 pt-3"
                            />
                        </div>
                    </div>
                ))}

            </div>
        </div>
    );
}
