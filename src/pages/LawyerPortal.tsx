import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const dynamic = 'force-dynamic';
import { Scale, Briefcase, ChevronRight, PenTool, Download, Activity } from 'lucide-react';
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
        <div className="max-w-6xl mx-auto flex h-[calc(100vh-8rem)] gap-6">

            <div className="w-1/3 flex flex-col gap-4">
                <header className="mb-2 flex flex-col gap-4">
                    <p className="text-sm font-medium text-text-muted tracking-wide uppercase">Counsel Actions</p>
                    <div className="flex bg-slate-800/50 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('requests')}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${viewMode === 'requests' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            <Briefcase className="w-4 h-4" /> Requests
                        </button>
                        <button
                            onClick={() => setViewMode('logs')}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${viewMode === 'logs' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            <Activity className="w-4 h-4" /> Audit Logs
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                    {viewMode === 'requests' ? (
                        requests.map(req => (
                            <button
                                key={req.id}
                                onClick={() => { setActiveRequest(req.id); setRecommendation(req.recommendation); }}
                                className={`w-full text-left p-5 rounded-2xl border transition-all ${activeRequest === req.id
                                    ? 'bg-blue-600/10 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.15)] glow'
                                    : 'glass-panel border-slate-700 hover:border-slate-500'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${req.status === 'pending' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'}`}>
                                        {req.status}
                                    </span>
                                    <ChevronRight className={`w-4 h-4 ${activeRequest === req.id ? 'text-blue-400' : 'text-text-muted'}`} />
                                </div>
                                <h4 className="text-text-main font-semibold mb-1 line-clamp-2">{req.title}</h4>
                            </button>
                        ))
                    ) : (
                        downloadLogs.length > 0 ? (
                            downloadLogs.map(log => (
                                <div key={log.id} className="w-full text-left p-4 rounded-2xl border glass-panel border-slate-700">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="text-xs text-amber-500 font-bold bg-amber-500/10 px-2 py-1 rounded inline-block">
                                            {new Date(log.downloaded_at).toLocaleString()}
                                        </div>
                                    </div>
                                    <div className="text-text-main text-sm font-medium mb-1 truncate" title={log.file_name}>
                                        <Activity className="w-3 h-3 inline mr-1 text-slate-400" />
                                        {log.file_name}
                                    </div>
                                    <div className="text-slate-500 text-[10px] bg-slate-900/50 p-2 rounded mt-2 break-all font-mono">
                                        {log.user_agent}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center p-8 text-slate-500 text-sm">
                                <Activity className="w-8 h-8 opacity-20 mx-auto mb-2" />
                                No download logs found yet.
                            </div>
                        )
                    )}
                </div>
            </div>

            <div className="flex-1 glass-panel rounded-3xl p-8 relative overflow-hidden flex flex-col border border-slate-700">
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none -mt-20"></div>

                {activeRequest ? (
                    <>
                        {requests.filter(r => r.id === activeRequest).map(req => {
                            console.log('Fila actual:', req);
                            const parsedFiles = parseFiles(req.evidence_files);
                            return (
                                <div key={req.id} className="h-full flex flex-col">
                                    <div className="mb-8">
                                        <h2 className="text-2xl font-bold text-text-main mb-4">{req.title}</h2>
                                        <div className="bg-bg-surface/80 p-5 rounded-xl border border-slate-800">
                                            <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Admin Request Context</h4>
                                            <p className="text-text-muted leading-relaxed">{req.description}</p>
                                        </div>

                                        {parsedFiles.length > 0 && (
                                            <div className="mt-4 bg-bg-surface/80 p-5 rounded-xl border border-slate-800">
                                                <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Attached Evidence</h4>
                                                <div className="flex flex-wrap gap-3">
                                                    {parsedFiles.map((fileName: string, index: number) => (
                                                        <a
                                                            key={index}
                                                            href={`https://amsxzshsxqyubutmwfhn.supabase.co/storage/v1/object/public/evidence-vault/${fileName}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 px-4 py-2 rounded-lg border border-blue-500/20 transition-colors text-sm font-medium"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                            Ver {fileName}
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 max-h-[500px]">
                                        <h3 className="text-lg font-semibold text-text-main mb-4 flex items-center gap-2">
                                            <PenTool className="w-5 h-5 text-amber-500" /> Counsel Recommendation
                                        </h3>

                                        {/* If they are an Admin, they should only view it maybe, or read-only. For now we assume a Lawyer is using this to type it. */}
                                        <div className="bg-bg-surface p-6 rounded-2xl border border-slate-800">
                                            <DualLanguageInput
                                                label="Type your legal recommendation"
                                                value={recommendation}
                                                onChange={setRecommendation}
                                                onTranslated={setRecommendationAr}
                                                placeholder="State your advice based on Saudi Labor Law & Fiduciary Duty..."
                                                isTextArea
                                            />
                                            <div className="mt-4 flex justify-end">
                                                <button
                                                    onClick={() => handleSaveRecommendation(req.id)}
                                                    className="bg-primary hover:bg-primary-hover text-white font-medium px-6 py-2.5 rounded-xl transition-colors shadow-lg shadow-primary/20 flex items-center gap-2"
                                                >
                                                    Submit Counsel
                                                    <Scale className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center text-text-muted">
                        <Scale className="w-16 h-16 opacity-20 mb-4" />
                        <h3 className="text-xl font-medium text-text-muted">Select a Request</h3>
                        <p className="mt-2 max-w-sm mx-auto">Click on a pending request from the left panel to review the details and provide your legal recommendation.</p>
                    </div>
                )}
            </div>

        </div>
    );
}
