import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const dynamic = 'force-dynamic';
import { Scale, Briefcase, ChevronRight, PenTool, Download, Activity, FileText } from 'lucide-react';
import { DualLanguageInput } from '../components/ui/DualLanguageInput';
import { useAuth } from '../contexts/AuthContext';

const parseFiles = (filesData: unknown): string[] => {
    if (!filesData) return [];
    if (Array.isArray(filesData)) return filesData as string[];
    if (typeof filesData === 'string') {
        try { return JSON.parse(filesData); } catch { return []; }
    }
    return [];
};

interface LegalRequest {
    id: string;
    title: string;
    description: string;
    status: 'pending' | 'replied';
    recommendation: string;
    arabic_translation: string;
    evidence_files: string[] | null;
}

interface DownloadLog {
    id: string;
    file_name: string;
    downloaded_at: string;
    user_agent: string;
}

export default function LawyerPortal() {
    const { user } = useAuth();

    const [requests, setRequests] = useState<LegalRequest[]>([]);
    const [activeRequest, setActiveRequest] = useState<string | null>(null);
    const [recommendation, setRecommendation] = useState('');
    const [recommendationAr, setRecommendationAr] = useState('');

    const [viewMode, setViewMode] = useState<'requests' | 'logs'>('requests');
    const [downloadLogs, setDownloadLogs] = useState<DownloadLog[]>([]);

    useEffect(() => {
        async function fetchRequests() {
            if (!user) return;
            try {
                // 1. Fetch all base requests
                const { data: requestsData, error: reqError } = await supabase
                    .from('legal_dashboard')
                    .select('*, evidence_files')
                    .order('updated_at', { ascending: false });

                console.log("DATA_DEBUG:", requestsData);

                if (reqError) throw reqError;

                // 2. Fetch specific responses for this lawyer
                const { data: responsesData, error: resError } = await supabase
                    .from('lawyer_responses')
                    .select('*')
                    .eq('lawyer_id', user.id);

                if (resError) throw resError;

                if (requestsData) {
                    const mappedRequests = requestsData.map(row => {
                        const myResponse = responsesData?.find(r => r.request_id === row.id);

                        return {
                            id: row.id,
                            title: row.my_requests ? (row.my_requests.length > 60 ? row.my_requests.substring(0, 60) + '...' : row.my_requests) : 'Legal Request',
                            description: row.my_requests || 'No description provided.',
                            status: (myResponse ? 'replied' : 'pending') as 'pending' | 'replied',
                            recommendation: myResponse?.recommendation || '',
                            arabic_translation: myResponse?.arabic_translation || '',
                            evidence_files: row.evidence_files as unknown as string[] | null
                        };
                    });
                    setRequests(mappedRequests);
                }

                // 3. Fetch download logs
                const { data: logsData, error: logsError } = await supabase
                    .from('download_logs')
                    .select('*')
                    .order('downloaded_at', { ascending: false })
                    .limit(50);

                if (logsData) {
                    setDownloadLogs(logsData as DownloadLog[]);
                }
                if (logsError) {
                    console.error("Error fetching logs:", logsError);
                }
            } catch (err) {
                console.error("Error fetching legal requests:", err);
            }
        }
        fetchRequests();
    }, [user]);

    const handleSaveRecommendation = async (reqId: string) => {
        if (!user) return;
        try {
            // Check if response exists for this specific lawyer on this request
            const { data: existing } = await supabase
                .from('lawyer_responses')
                .select('id')
                .eq('request_id', reqId)
                .eq('lawyer_id', user.id)
                .single();

            if (existing) {
                const { error } = await supabase
                    .from('lawyer_responses')
                    .update({
                        recommendation: recommendation,
                        arabic_translation: recommendationAr,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', existing.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('lawyer_responses')
                    .insert({
                        request_id: reqId,
                        lawyer_id: user.id,
                        recommendation: recommendation,
                        arabic_translation: recommendationAr,
                        updated_at: new Date().toISOString()
                    });
                if (error) throw error;
            }

            setRequests(reqs => reqs.map(r =>
                r.id === reqId ? { ...r, recommendation, arabic_translation: recommendationAr, status: 'replied' } : r
            ));
            setActiveRequest(null);
            setRecommendation('');
            setRecommendationAr('');
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Unknown error';
            console.error('Error saving recommendation:', msg);
            alert('Failed to save counsel recommendation: ' + msg);
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto flex h-[calc(100vh-8rem)] gap-8 animate-in fade-in duration-700">

            <div className="w-1/3 flex flex-col gap-6">
                <header className="flex flex-col gap-3">
                    <p className="text-xs font-bold text-primary tracking-widest uppercase drop-shadow-[0_0_8px_rgba(19,127,236,0.8)]">Counsel Actions</p>
                    <div className="flex bg-slate-200/50 dark:bg-background-dark/50 rounded-xl p-1.5 border border-border-default shadow-inner">
                        <button
                            onClick={() => setViewMode('requests')}
                            className={`flex-1 py-3 text-xs font-bold tracking-widest uppercase rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${viewMode === 'requests' ? 'bg-primary text-white shadow-[0_0_15px_rgba(19,127,236,0.5)]' : 'text-text-muted hover:text-text-main hover:bg-bg-surface-hover'}`}
                        >
                            <Briefcase className="w-4 h-4" /> Requests
                        </button>
                        <button
                            onClick={() => setViewMode('logs')}
                            className={`flex-1 py-3 text-xs font-bold tracking-widest uppercase rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${viewMode === 'logs' ? 'bg-accent-amber text-background-dark shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'text-text-muted hover:text-text-main hover:bg-bg-surface-hover'}`}
                        >
                            <Activity className="w-4 h-4" /> Audit Logs
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto space-y-4 pr-3 custom-scrollbar">
                    {viewMode === 'requests' ? (
                        requests.map(req => (
                            <button
                                key={req.id}
                                onClick={() => { setActiveRequest(req.id); setRecommendation(req.recommendation); setRecommendationAr(req.arabic_translation); }}
                                className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 ${activeRequest === req.id
                                    ? 'bg-primary/10 border-primary shadow-[0_0_20px_rgba(19,127,236,0.2)]'
                                    : 'glass-card hover:border-border-hover shadow-sm hover:shadow-md'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-sm border ${req.status === 'pending' ? 'bg-accent-amber/10 text-accent-amber border-accent-amber/30 shadow-[0_0_8px_rgba(245,158,11,0.2)]' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.2)]'}`}>
                                        {req.status}
                                    </span>
                                    <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${activeRequest === req.id ? 'text-primary translate-x-1' : 'text-text-muted'}`} />
                                </div>
                                <h4 className={`font-bold mb-1 line-clamp-2 leading-relaxed tracking-wide text-sm ${activeRequest === req.id ? 'text-text-main' : 'text-text-muted/90'}`}>{req.title}</h4>
                            </button>
                        ))
                    ) : (
                        downloadLogs.length > 0 ? (
                            downloadLogs.map(log => (
                                <div key={log.id} className="w-full text-left p-4 rounded-xl border glass-card hover:border-border-hover transition-colors">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="text-[10px] text-accent-amber font-black tracking-widest bg-accent-amber/10 border border-accent-amber/20 px-2.5 py-1 rounded inline-block shadow-[0_0_10px_rgba(245,158,11,0.1)]">
                                            {new Date(log.downloaded_at).toLocaleString()}
                                        </div>
                                    </div>
                                    <div className="text-text-main text-sm font-bold mb-2 truncate" title={log.file_name}>
                                        <Activity className="w-3.5 h-3.5 inline mr-1.5 text-primary" />
                                        {log.file_name}
                                    </div>
                                    <div className="text-text-muted text-[10px] bg-slate-100 dark:bg-background-dark/80 p-2.5 rounded-lg border border-border-default break-all font-mono leading-relaxed">
                                        {log.user_agent}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center p-12 text-text-muted glass-card rounded-2xl border-dashed">
                                <Activity className="w-10 h-10 opacity-20 mx-auto mb-4 text-primary" />
                                <p className="font-bold tracking-widest uppercase text-xs">No Audit Logs</p>
                            </div>
                        )
                    )}
                </div>
            </div>

            <div className="flex-1 glass-card rounded-3xl p-10 relative overflow-hidden flex flex-col shadow-2xl">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -mt-32 -mr-32"></div>

                {activeRequest ? (
                    <>
                        {requests.filter(r => r.id === activeRequest).map(req => {
                            console.log('Fila actual:', req);
                            const parsedFiles = parseFiles(req.evidence_files);
                            return (
                                <div key={req.id} className="h-full flex flex-col relative z-10 animate-in fade-in slide-in-from-right-8 duration-500">
                                    <div className="mb-8">
                                        <h2 className="text-3xl font-black text-text-main mb-6 tracking-tight leading-tight">{req.title}</h2>
                                        <div className="bg-slate-50 dark:bg-background-dark/40 p-6 rounded-2xl border border-border-default shadow-inner relative overflow-hidden">
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/50"></div>
                                            <h4 className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-3">
                                                <FileText className="w-4 h-4" /> Admin Request Context
                                            </h4>
                                            <p className="text-text-muted leading-relaxed text-sm font-medium">{req.description}</p>
                                        </div>

                                        {parsedFiles.length > 0 && (
                                            <div className="mt-6 bg-slate-50 dark:bg-background-dark/40 p-6 rounded-2xl border border-border-default shadow-inner">
                                                <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                                    <Briefcase className="w-4 h-4" /> Attached Evidence Assets
                                                </h4>
                                                <div className="flex flex-wrap gap-3">
                                                    {parsedFiles.map((fileName: string, index: number) => (
                                                        <a
                                                            key={index}
                                                            href={`https://amsxzshsxqyubutmwfhn.supabase.co/storage/v1/object/public/evidence-vault/${fileName}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:text-white px-5 py-2.5 rounded-xl border border-emerald-500/20 transition-all text-xs font-bold tracking-widest uppercase hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                            ASSET {index + 1}
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-h-0 flex flex-col">
                                        <h3 className="text-xl font-black text-text-main mb-5 flex items-center gap-3 tracking-tight">
                                            <PenTool className="w-6 h-6 text-accent-amber drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                                            Counsel Recommendation
                                        </h3>

                                        <div className="bg-slate-50 dark:bg-background-dark/60 p-8 rounded-3xl border border-primary/20 shadow-inner flex flex-col flex-1 dark:shadow-[inset_0_0_30px_rgba(0,0,0,0.5)]">
                                            <div className="flex-1 min-h-0">
                                                <DualLanguageInput
                                                    label="Formal Legal Response"
                                                    value={recommendation}
                                                    onChange={setRecommendation}
                                                    onTranslated={setRecommendationAr}
                                                    placeholder="State your advice based on current legal framework & Fiduciary Duty..."
                                                    isTextArea
                                                />
                                            </div>
                                            <div className="mt-6 flex justify-end pt-6 border-t border-border-default shrink-0">
                                                <button
                                                    onClick={() => handleSaveRecommendation(req.id)}
                                                    className="bg-primary hover:bg-primary-hover text-white font-black tracking-widest uppercase text-sm px-8 py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(19,127,236,0.3)] hover:shadow-[0_0_25px_rgba(19,127,236,0.5)] flex items-center gap-2"
                                                >
                                                    Transmit Counsel
                                                    <Scale className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center text-text-muted relative z-10">
                        <div className="relative mb-6">
                            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
                            <Scale className="w-20 h-20 text-primary relative z-10 opacity-80" />
                        </div>
                        <h3 className="text-3xl font-black text-text-main tracking-tight mb-2">No Request Selected</h3>
                        <p className="mt-2 max-w-sm mx-auto text-sm font-medium tracking-wide leading-relaxed">Select a pending request from the actions panel to review details and formulate a legal recommendation.</p>
                    </div>
                )}
            </div>

        </div>
    );
}
