import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const dynamic = 'force-dynamic';
import { UploadCloud, FileText, ExternalLink, ShieldCheck, FileBadge, TrendingUp, MessageSquare, Lock, Folders, Scale, X, Download, AlertTriangle } from 'lucide-react';
import { DualLanguageInput } from '../components/ui/DualLanguageInput';

const parseFiles = (filesData: unknown): string[] => {
    if (!filesData) return [];
    if (Array.isArray(filesData)) return filesData as string[];
    if (typeof filesData === 'string') {
        try { return JSON.parse(filesData); } catch { return []; }
    }
    return [];
};

export interface EvidenceDoc {
    id: string;
    title: string;
    description: string;
    category: string;
    file_url: string | null;
    evidence_files: string[] | null;
    created_at: string;
    uploaded_by: string;
    verification_code?: string;
    arabic_translation?: string;
    highlight_snippet_url?: string;
    legal_significance_en?: string;
    legal_significance_ar?: string;
    _snippetSignedUrl?: string; // Client-side only state
}

export default function EvidenceGallery() {
    const [documents, setDocuments] = useState<EvidenceDoc[]>([]);
    const [selectedEvidence, setSelectedEvidence] = useState<EvidenceDoc | null>(null);
    const [showUpload, setShowUpload] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const { profile } = useAuth();
    const isLawyerOrAdmin = profile?.role === 'lawyer' || profile?.role === 'admin';

    // Upload State
    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState('');
    const [titleAr, setTitleAr] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        async function fetchEvidence() {
            try {
                const { data, error } = await supabase
                    .from('evidence_vault')
                    .select('*, evidence_files')
                    .order('created_at', { ascending: false });

                console.log("DATA_DEBUG:", data);

                if (error) throw error;
                if (data) {
                    // Pre-fetch signed URLs for any highlight snippets
                    const docsWithSnippets = await Promise.all((data as unknown as EvidenceDoc[]).map(async (row) => {
                        const doc: EvidenceDoc = { ...row };

                        if (doc.highlight_snippet_url) {
                            const { data: snippetData } = await supabase.storage
                                .from('evidence-vault')
                                .createSignedUrl(doc.highlight_snippet_url, 3600); // 1 hour cache
                            if (snippetData) {
                                doc._snippetSignedUrl = snippetData.signedUrl;
                            }
                        }
                        return doc;
                    }));
                    setDocuments(docsWithSnippets);
                }
            } catch (err) {
                console.error("Error fetching evidence:", err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchEvidence();
    }, []);

    const handleUpload = async () => {
        if (!file || !title) return;
        setIsUploading(true);

        try {
            // 1. Upload to Supabase Storage
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('evidence-vault')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Insert DB Record
            const { data, error: dbError } = await supabase.from('evidence_vault').insert([
                {
                    title,
                    category: 'General',
                    file_url: filePath,
                    evidence_files: [filePath],
                    verification_code: verificationCode,
                    arabic_translation: titleAr || undefined,
                }
            ]).select().single();

            if (dbError) throw dbError;

            if (data) {
                setDocuments([data as unknown as EvidenceDoc, ...documents]);
            }

            setShowUpload(false);
            setFile(null); setTitle(''); setTitleAr(''); setVerificationCode('');

        } catch (e: unknown) {
            const errorMessage = e instanceof Error ? e.message : 'Unknown error occurred';
            console.error('Upload Error:', errorMessage);
            alert('Upload failed: ' + errorMessage);
        } finally {
            setIsUploading(false);
        }
    };

    const handleViewDocument = async (path: string) => {
        try {
            const { data, error } = await supabase.storage
                .from('evidence-vault')
                .createSignedUrl(path, 60);

            if (error) throw error;
            if (data?.signedUrl) {
                window.open(data.signedUrl, '_blank');
            } else {
                throw new Error("Could not generate URL");
            }
        } catch (e: unknown) {
            const errorMessage = e instanceof Error ? e.message : 'Unknown error occurred';
            console.error('Download Error:', errorMessage);
            alert('Failed to securely access document: ' + errorMessage);
        }
    };


    if (isLoading) {
        return (
            <div className="w-full flex items-center justify-center min-h-[50vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(19,127,236,0.6)]"></div>
                    <p className="text-text-muted font-bold tracking-widest uppercase text-xs">Decrypting vault contents...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto pb-12 animate-in fade-in duration-700">
            <header className="mb-10 flex flex-col gap-1">
                <p className="text-xs font-bold text-primary tracking-widest uppercase mb-1 drop-shadow-[0_0_8px_rgba(19,127,236,0.8)]">Secure Repository Access</p>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <h1 className="text-4xl font-black text-text-main tracking-tight">Evidence Vault</h1>
                    {isLawyerOrAdmin && (
                        <button
                            onClick={() => setShowUpload(!showUpload)}
                            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl transition-all font-bold tracking-wide text-sm ${showUpload ? 'bg-bg-surface-hover text-text-main border border-border-default hover:border-border-hover' : 'bg-primary text-white hover:bg-primary-hover shadow-[0_0_20px_rgba(19,127,236,0.4)] hover:shadow-[0_0_25px_rgba(19,127,236,0.6)] neon-glow-primary'}`}
                        >
                            {showUpload ? 'CANCEL SECURE UPLOAD' : <><UploadCloud className="w-5 h-5" /> INITIATE SECURE UPLOAD</>}
                        </button>
                    )}
                </div>
            </header>

            {/* Upload Area */}
            {showUpload && isLawyerOrAdmin && (
                <div className="glass-card p-8 rounded-2xl mb-10 border border-primary/30 neon-glow-primary bg-bg-surface/40 animate-in slide-in-from-top-4 duration-500">
                    <h3 className="text-xl font-black text-text-main mb-6 flex items-center gap-3">
                        <ShieldCheck className="w-6 h-6 text-primary" /> Transmit to Vault
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <DualLanguageInput
                                label="Document Title"
                                value={title}
                                onChange={setTitle}
                                onTranslated={setTitleAr}
                                placeholder="e.g. Authenticated GOSI Certificate"
                            />
                            <div>
                                <label className="text-xs font-bold text-text-muted uppercase tracking-widest ml-1 block mb-2">Verification Code (If applicable)</label>
                                <input type="text" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} placeholder="e.g. 109884831" className="w-full bg-background-dark/50 border border-border-default rounded-xl px-4 py-3 text-text-main placeholder:text-text-muted/50 focus:border-primary outline-none transition-colors shadow-inner" />
                            </div>
                        </div>

                        <div className="flex flex-col justify-end">
                            <div className="border-2 border-dashed border-border-hover rounded-xl p-8 text-center bg-bg-surface-hover/30 hover:bg-primary/5 hover:border-primary/50 transition-all cursor-pointer group relative overflow-hidden">
                                <FileBadge className="w-10 h-10 text-text-muted mx-auto mb-4 group-hover:text-primary transition-colors group-hover:scale-110 duration-500" />
                                <p className="text-sm font-bold text-text-main mb-2">Select Authenticated Payload</p>
                                <p className="text-[10px] uppercase text-text-muted mb-6 tracking-widest">PDF FORMAT REQUIRED FOR VAULT INGESTION</p>
                                <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                <div className="mx-auto bg-primary/10 text-primary px-6 py-2 rounded-lg text-sm font-bold inline-block border border-primary/20 group-hover:bg-primary/20 transition-colors">
                                    {file ? file.name : 'BROWSE FILES'}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end pt-6 border-t border-border-default">
                        <button onClick={handleUpload} disabled={isUploading || !file} className="bg-text-main text-background-dark hover:bg-text-muted disabled:opacity-50 font-black tracking-wide text-sm px-10 py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center gap-2">
                            {isUploading ? <><UploadCloud className="w-4 h-4 animate-bounce" /> ENCRYPTING & UPLOADING...</> : <><Lock className="w-4 h-4" /> COMMIT TO SECURE VAULT</>}
                        </button>
                    </div>
                </div>
            )}

            {/* Grid */}
            {documents.length === 0 ? (
                <div className="text-center py-24 glass-card rounded-3xl border border-border-default">
                    <div className="relative inline-block">
                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
                        <Folders className="w-16 h-16 text-primary relative z-10 mx-auto mb-6 opacity-80" />
                    </div>
                    <h3 className="text-2xl font-black text-text-main tracking-tight">Vault is Empty</h3>
                    <p className="text-text-muted text-sm mt-2 font-medium tracking-wide">Awaiting encrypted file ingestion from lead counsel.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {documents.map((doc) => {
                        console.log('Fila actual (Vault):', doc);
                        const parsedFiles = parseFiles(doc.evidence_files);
                        return (
                            <div
                                key={doc.id}
                                className="glass-card rounded-2xl flex flex-col h-full group hover:border-primary/40 hover:shadow-[0_0_30px_rgba(19,127,236,0.15)] transition-all duration-500 overflow-hidden cursor-pointer relative"
                                onClick={() => setSelectedEvidence(doc)}
                            >
                                {/* Highlight overlay on hover */}
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

                                {/* Hero Image Snippet */}
                                {doc._snippetSignedUrl ? (
                                    <div className="w-full h-48 bg-background-dark border-b border-border-default relative overflow-hidden">
                                        <img
                                            src={doc._snippetSignedUrl}
                                            alt={`Highlight for ${doc.title}`}
                                            className="w-full h-full object-cover opacity-60 group-hover:opacity-90 group-hover:scale-105 transition-all duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/20 to-transparent"></div>

                                        {/* Verification Badge Overlay */}
                                        {doc.verification_code && (
                                            <div className="absolute top-4 left-4 bg-background-dark/80 backdrop-blur-md border border-emerald-500/30 px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                                                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                                                <span className="text-[9px] font-black text-emerald-400 tracking-widest uppercase">Verified Auth</span>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="h-4 relative">
                                        {/* Verification Badge alternative if no image */}
                                        {doc.verification_code && (
                                            <div className="absolute top-2 left-4 px-2 flex items-center gap-1.5">
                                                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                                                <span className="text-[9px] font-black text-emerald-500 tracking-widest uppercase">Verified Auth</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="p-6 flex flex-col flex-1 relative z-10">
                                    <div className="flex items-start justify-between mb-5">
                                        <div className="w-12 h-12 rounded-xl bg-bg-surface-hover/50 border border-border-default flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-inner">
                                            {doc.category === 'Communication' && <MessageSquare className="w-6 h-6 text-primary" />}
                                            {doc.category === 'Financial' && <TrendingUp className="w-6 h-6 text-accent-amber" />}
                                            {doc.category === 'Government' && <FileText className="w-6 h-6 text-emerald-500" />}
                                            {doc.category === 'Audio' && <UploadCloud className="w-6 h-6 text-accent-neon" />}
                                            {!['Communication', 'Financial', 'Government', 'Audio'].includes(doc.category) && <FileText className="w-6 h-6 text-text-muted" />}
                                        </div>
                                        <div className="text-[9px] font-black bg-background-dark/60 text-text-muted px-2.5 py-1.5 rounded-lg uppercase tracking-[0.2em] border border-border-default shadow-sm backdrop-blur-md">
                                            {doc.category}
                                        </div>
                                    </div>

                                    <h4 className="text-xl font-black text-text-main mb-2 leading-tight group-hover:text-primary transition-colors">
                                        {doc.title}
                                    </h4>
                                    <p className="text-xs text-text-muted/80 font-arabic mb-5 line-clamp-2" dir="rtl">{doc.arabic_translation}</p>

                                    {/* Bilingual Legal Significance */}
                                    {(doc.legal_significance_en || doc.legal_significance_ar) && (
                                        <div className="my-5 p-4 rounded-xl bg-background-dark/40 border border-border-default text-sm shadow-inner overflow-hidden relative">
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-amber"></div>
                                            <div className="flex items-center gap-2 mb-3">
                                                <Scale className="w-4 h-4 text-accent-amber" />
                                                <span className="font-bold text-xs uppercase tracking-widest text-text-main">Legal Context</span>
                                            </div>
                                            {doc.legal_significance_en && <p className="text-text-muted text-xs leading-relaxed mb-3">{doc.legal_significance_en}</p>}
                                            {doc.legal_significance_ar && <p className="text-text-muted/80 text-xs leading-relaxed font-arabic border-t border-border-default/50 pt-3" dir="rtl">{doc.legal_significance_ar}</p>}
                                        </div>
                                    )}

                                    {/* Special CSV UI Callout */}
                                    {(doc.title.includes('CSV') || doc.file_url?.endsWith('.csv')) && (
                                        <div className="my-5 glass-card border-rose-500/30 rounded-xl overflow-hidden bg-rose-950/20 relative">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
                                            <div className="bg-rose-950/40 px-4 py-2.5 border-b border-rose-500/20 flex justify-between items-center">
                                                <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest flex items-center gap-2">
                                                    <AlertTriangle className="w-3 h-3" /> Key Audit Findings
                                                </span>
                                            </div>
                                            <div className="p-4 relative z-10">
                                                <table className="w-full text-xs text-left text-text-muted">
                                                    <thead>
                                                        <tr className="border-b border-border-default text-text-muted/70">
                                                            <th className="font-bold uppercase tracking-wider pb-2 w-20 text-[9px]">Date</th>
                                                            <th className="font-bold uppercase tracking-wider pb-2 text-[9px]">Log Entry</th>
                                                            <th className="font-bold uppercase tracking-wider pb-2 text-right text-[9px]">Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-border-default/50">
                                                        <tr className="group/row hover:bg-white/5 transition-colors">
                                                            <td className="py-2.5 text-text-muted font-medium">Jan 15</td>
                                                            <td className="py-2.5 font-medium">Funds Transfer Initiated</td>
                                                            <td className="py-2.5 text-right font-black text-emerald-400">CLEARED</td>
                                                        </tr>
                                                        <tr className="bg-rose-500/10 border-l-2 border-l-rose-500">
                                                            <td className="py-2.5 pl-2 text-rose-300 font-bold">Feb 12</td>
                                                            <td className="py-2.5 text-rose-300 font-bold">Partnership Dissolution Notice</td>
                                                            <td className="py-2.5 text-right font-black text-rose-400 tracking-wider">EXECUTED</td>
                                                        </tr>
                                                        <tr className="group/row hover:bg-white/5 transition-colors">
                                                            <td className="py-2.5 text-text-muted font-medium">Mar 01</td>
                                                            <td className="py-2.5 font-medium">Account Frozen</td>
                                                            <td className="py-2.5 text-right font-black text-accent-amber">PENDING</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-auto pt-6 flex flex-col gap-3 relative z-10">
                                        {parsedFiles.length > 0 ? (
                                            parsedFiles.map((fileName: string, index: number) => (
                                                <a
                                                    key={index}
                                                    href={`https://amsxzshsxqyubutmwfhn.supabase.co/storage/v1/object/public/evidence-vault/${fileName}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="w-full py-3 bg-primary/10 text-primary hover:bg-primary/20 hover:text-white justify-center rounded-xl flex items-center gap-2 text-xs font-black tracking-widest uppercase transition-all border border-primary/20 hover:shadow-[0_0_15px_rgba(19,127,236,0.3)]"
                                                >
                                                    <Download className="w-4 h-4" /> Download VER.{fileName.substring(0, 4)}
                                                </a>
                                            ))
                                        ) : doc.file_url ? (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleViewDocument(doc.file_url!);
                                                }}
                                                className="w-full py-3 bg-bg-surface-hover hover:bg-bg-surface text-text-main justify-center rounded-xl flex items-center gap-2 text-xs font-black tracking-widest uppercase transition-all border border-border-default shadow-sm hover:shadow-md"
                                            >
                                                <ExternalLink className="w-4 h-4" /> View Original
                                            </button>
                                        ) : (
                                            <button
                                                disabled
                                                onClick={(e) => e.stopPropagation()}
                                                className="w-full py-3 bg-background-dark/50 text-text-muted justify-center rounded-xl flex items-center gap-2 text-xs font-bold tracking-widest uppercase border border-border-default cursor-not-allowed opacity-70"
                                            >
                                                <Lock className="w-4 h-4" /> Offline Asset
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Modal */}
            {selectedEvidence && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-lg animate-in fade-in duration-300"
                    onClick={() => setSelectedEvidence(null)}>
                    <div
                        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col glass-card bg-background-dark/95 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-border-hover animate-in zoom-in-95 duration-300"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setSelectedEvidence(null)}
                            className="absolute top-6 right-6 z-10 p-2.5 bg-text-main/10 hover:bg-primary hover:text-white rounded-xl text-text-muted transition-all backdrop-blur-md"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Explanation Above Image */}
                        <div className="p-8 border-b border-border-default shrink-0 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="text-[10px] font-black bg-primary/20 text-primary px-3 py-1.5 rounded-lg uppercase tracking-[0.2em] border border-primary/20">
                                    {selectedEvidence.category}
                                </div>
                                {selectedEvidence.verification_code && (
                                    <div className="text-[10px] font-black bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-lg uppercase tracking-widest flex items-center gap-1.5 border border-emerald-500/20">
                                        <ShieldCheck className="w-3 h-3" /> VERIFIED
                                    </div>
                                )}
                            </div>
                            <h3 className="text-3xl font-black text-text-main mb-6 pr-12 leading-tight tracking-tight">{selectedEvidence.title}</h3>

                            {(selectedEvidence.legal_significance_en || selectedEvidence.legal_significance_ar) ? (
                                <div className="space-y-4 max-w-3xl relative z-10">
                                    {selectedEvidence.legal_significance_en && (
                                        <div className="flex items-start gap-4">
                                            <Scale className="w-5 h-5 text-accent-amber shrink-0 mt-1" />
                                            <p className="text-sm font-medium text-text-main/90 leading-relaxed">
                                                {selectedEvidence.legal_significance_en}
                                            </p>
                                        </div>
                                    )}
                                    {selectedEvidence.legal_significance_ar && (
                                        <div className="flex items-start gap-4 flex-row-reverse border-t border-border-default/50 pt-4">
                                            <Scale className="w-5 h-5 text-accent-amber shrink-0 mt-1" />
                                            <p className="text-sm font-medium text-text-main/80 leading-relaxed font-arabic text-right w-full" dir="rtl">
                                                {selectedEvidence.legal_significance_ar}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm font-medium text-text-muted italic relative z-10">No formalized contextual analysis currently associated with this exhibit.</p>
                            )}
                        </div>

                        {/* Screenshot */}
                        <div className="flex-1 overflow-auto bg-[#050608] p-4 flex items-center justify-center min-h-[40vh] relative custom-scrollbar">
                            <div className="absolute inset-0 pattern-grid-lg text-white/5 opacity-20 pointer-events-none"></div>
                            {selectedEvidence._snippetSignedUrl ? (
                                <img
                                    src={selectedEvidence._snippetSignedUrl}
                                    alt={selectedEvidence.title}
                                    className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl relative z-10 border border-border-default/30"
                                />
                            ) : (
                                <div className="text-center text-text-muted/50 relative z-10">
                                    <FileBadge className="w-20 h-20 mx-auto mb-6 opacity-30" />
                                    <p className="font-bold tracking-widest uppercase text-xs">VISUAL EVIDENCE UNAVAILABLE</p>
                                    <p className="text-[10px] mt-2 max-w-xs mx-auto">This asset requires original document extraction to view securely.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
