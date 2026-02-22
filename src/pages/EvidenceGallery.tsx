import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const dynamic = 'force-dynamic';
import { UploadCloud, FileText, ExternalLink, ShieldCheck, FileBadge, TrendingUp, MessageSquare, Lock, Folders, Scale, X, Download } from 'lucide-react';
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
    evidence_files?: unknown;
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
                    .select('*')
                    .order('created_at', { ascending: false });

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
            <div className="max-w-6xl mx-auto pb-12 flex items-center justify-center min-h-[50vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-text-muted font-medium tracking-wide">Decrypting vault contents...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto pb-12">
            <header className="mb-10 flex flex-col gap-1">
                <p className="text-sm font-medium text-text-muted tracking-wide uppercase">Secure Repository</p>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <h1 className="text-3xl font-bold text-text-main">Evidence Vault</h1>
                    {isLawyerOrAdmin && (
                        <button
                            onClick={() => setShowUpload(!showUpload)}
                            className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl transition-colors shadow-lg shadow-primary/20 w-full md:w-auto font-medium"
                        >
                            {showUpload ? 'Cancel Upload' : <><UploadCloud className="w-5 h-5" /> Upload Evidence</>}
                        </button>
                    )}
                </div>
            </header>

            {/* Upload Area */}
            {showUpload && isLawyerOrAdmin && (
                <div className="glass-panel p-6 rounded-2xl mb-10 border border-blue-500/30">
                    <h3 className="text-lg font-semibold text-text-main mb-6">Upload New Document to Vault</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <DualLanguageInput
                                label="Document Title"
                                value={title}
                                onChange={setTitle}
                                onTranslated={setTitleAr}
                                placeholder="e.g. GOSI Certificate"
                            />
                            <div>
                                <label className="text-sm font-medium text-text-muted ml-1 block mb-1">Verification Code (If applicable)</label>
                                <input type="text" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} placeholder="e.g. 109884831" className="w-full bg-bg-surface/80 border border-slate-700 rounded-xl px-4 py-2.5 text-text-main placeholder:text-slate-600 focus:border-blue-500 outline-none" />
                            </div>
                        </div>

                        <div className="flex flex-col justify-end">
                            <div className="border border-dashed border-slate-600 rounded-xl p-6 text-center bg-bg-surface hover:bg-slate-800/50 transition">
                                <FileBadge className="w-8 h-8 text-text-muted mx-auto mb-3" />
                                <p className="text-sm text-text-muted mb-4">Select the PDF file containing the evidence.</p>
                                <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="block w-full text-sm text-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600/20 file:text-blue-400 hover:file:bg-blue-600/30 cursor-pointer" />
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end pt-6 border-t border-slate-800">
                        <button onClick={handleUpload} disabled={isUploading || !file} className="bg-white text-slate-900 hover:bg-slate-200 disabled:opacity-50 font-medium px-8 py-2.5 rounded-xl transition-colors">
                            {isUploading ? 'Uploading & Encrypting...' : 'Secure Upload to Vault'}
                        </button>
                    </div>
                </div>
            )}

            {/* Grid */}
            {documents.length === 0 ? (
                <div className="text-center py-20 glass-panel rounded-3xl border border-slate-800/50">
                    <Folders className="w-12 h-12 text-slate-600 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium text-text-muted">Vault is empty</h3>
                    <p className="text-text-muted text-sm mt-2">No evidence documents have been securely uploaded yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {documents.map((doc) => {
                        console.log('Fila actual (Vault):', doc);
                        const parsedFiles = parseFiles(doc.evidence_files);
                        return (
                            <div
                                key={doc.id}
                                className="glass-panel rounded-2xl flex flex-col h-full group border border-slate-800 hover:border-slate-700 transition overflow-hidden cursor-pointer"
                                onClick={() => setSelectedEvidence(doc)}
                            >

                                {/* Hero Image Snippet */}
                                {doc._snippetSignedUrl ? (
                                    <div className="w-full h-48 bg-slate-900 border-b border-slate-800 relative">
                                        <img
                                            src={doc._snippetSignedUrl}
                                            alt={`Highlight for ${doc.title}`}
                                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#151822] to-transparent"></div>
                                    </div>
                                ) : (
                                    <div className="h-4"></div> // Top padding if no image
                                )}

                                <div className="p-5 flex flex-col flex-1">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                                            {doc.category === 'Communication' && <MessageSquare className="w-6 h-6 text-blue-400" />}
                                            {doc.category === 'Financial' && <TrendingUp className="w-6 h-6 text-amber-400" />}
                                            {doc.category === 'Government' && <FileText className="w-6 h-6 text-emerald-400" />}
                                            {doc.category === 'Audio' && <UploadCloud className="w-6 h-6 text-purple-400" />}
                                            {!['Communication', 'Financial', 'Government', 'Audio'].includes(doc.category) && <FileText className="w-6 h-6 text-blue-400" />}
                                        </div>
                                        <div className="text-[10px] font-bold bg-bg-surface-hover text-text-main px-2 py-1 rounded uppercase tracking-wider border border-border-default shadow-sm">
                                            {doc.category}
                                        </div>
                                    </div>

                                    <h4 className="text-lg font-bold text-text-main mb-2 leading-tight">
                                        {doc.title}
                                    </h4>
                                    <p className="text-xs text-text-muted font-arabic mb-4 line-clamp-2" dir="rtl">{doc.arabic_translation}</p>

                                    {/* Bilingual Legal Significance */}
                                    {(doc.legal_significance_en || doc.legal_significance_ar) && (
                                        <div className="my-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-sm">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Scale className="w-4 h-4 text-amber-500" />
                                                <span className="font-semibold text-text-main">Legal Context</span>
                                            </div>
                                            {doc.legal_significance_en && <p className="text-text-main mb-3">{doc.legal_significance_en}</p>}
                                            {doc.legal_significance_ar && <p className="text-text-main font-arabic border-t border-slate-700/50 pt-2" dir="rtl">{doc.legal_significance_ar}</p>}
                                        </div>
                                    )}

                                    {/* Special CSV UI Callout */}
                                    {(doc.title.includes('CSV') || doc.file_url?.endsWith('.csv')) && (
                                        <div className="my-4 border border-rose-500/30 rounded-xl overflow-hidden bg-rose-500/5">
                                            <div className="bg-rose-500/20 px-3 py-2 border-b border-rose-500/30 flex justify-between items-center">
                                                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Key Audit Findings</span>
                                                <span className="text-[10px] text-rose-500">Extracted from source</span>
                                            </div>
                                            <div className="p-3">
                                                <table className="w-full text-xs text-left text-text-muted">
                                                    <thead>
                                                        <tr className="border-b border-rose-500/20 text-rose-400">
                                                            <th className="font-medium pb-2 w-20">Date</th>
                                                            <th className="font-medium pb-2">Log Entry</th>
                                                            <th className="font-medium pb-2 text-right">Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-800/50">
                                                        <tr>
                                                            <td className="py-2 text-text-muted">Jan 15</td>
                                                            <td className="py-2">Funds Transfer Initiated</td>
                                                            <td className="py-2 text-right text-emerald-400">Cleared</td>
                                                        </tr>
                                                        <tr className="bg-rose-500/10">
                                                            <td className="py-2 text-rose-300 font-medium">Feb 12</td>
                                                            <td className="py-2 text-rose-300 font-medium">Partnership Dissolution Notice</td>
                                                            <td className="py-2 text-right text-rose-400 font-bold">Executed</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="py-2 text-text-muted">Mar 01</td>
                                                            <td className="py-2">Account Frozen</td>
                                                            <td className="py-2 text-right text-amber-400">Pending</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    {/* Evidence Integrity Banner */}
                                    {doc.verification_code && (
                                        <div className="mt-auto bg-bg-surface p-3 rounded-xl border border-emerald-500/20 flex items-center justify-between mb-4 mt-4">
                                            <div className="flex items-center gap-2">
                                                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                                <span className="text-xs text-emerald-500 font-medium">Verified Gov Document</span>
                                            </div>
                                            <span className="text-xs text-text-muted font-mono">CODE: {doc.verification_code}</span>
                                        </div>
                                    )}

                                    <div className="mt-auto pt-4 flex flex-col gap-2">
                                        {parsedFiles.length > 0 ? (
                                            parsedFiles.map((fileName: string, index: number) => (
                                                <a
                                                    key={index}
                                                    href={`https://amsxzshsxqyubutmwfhn.supabase.co/storage/v1/object/public/evidence-vault/${fileName}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="w-full py-2.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 justify-center rounded-xl flex items-center gap-2 text-sm font-medium transition-colors border border-blue-500/20"
                                                >
                                                    <Download className="w-4 h-4" /> Ver {fileName}
                                                </a>
                                            ))
                                        ) : doc.file_url ? (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleViewDocument(doc.file_url!);
                                                }}
                                                className="w-full py-2.5 bg-bg-surface hover:bg-slate-800 text-text-main justify-center rounded-xl flex items-center gap-2 text-sm font-medium transition-colors border border-slate-800 hover:border-slate-700"
                                            >
                                                <ExternalLink className="w-4 h-4" /> View Original Document
                                            </button>
                                        ) : (
                                            <button
                                                disabled
                                                onClick={(e) => e.stopPropagation()}
                                                className="w-full py-2.5 bg-bg-surface/50 text-text-muted justify-center rounded-xl flex items-center gap-2 text-sm font-medium border border-slate-800/50 cursor-not-allowed"
                                            >
                                                <Lock className="w-4 h-4" /> Offline Evidence
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm"
                    onClick={() => setSelectedEvidence(null)}>
                    <div
                        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-bg-surface rounded-2xl overflow-hidden shadow-2xl border border-slate-700"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setSelectedEvidence(null)}
                            className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/80 rounded-full text-text-main transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Explanation Above Image */}
                        <div className="p-6 sm:p-8 bg-slate-900 border-b border-slate-800 shrink-0">
                            <h3 className="text-xl font-bold text-text-main mb-3 pr-8">{selectedEvidence.title}</h3>
                            {(selectedEvidence.legal_significance_en || selectedEvidence.legal_significance_ar) ? (
                                <div className="space-y-3">
                                    {selectedEvidence.legal_significance_en && (
                                        <p className="text-sm text-text-muted leading-relaxed bg-black/20 p-3 rounded-lg border border-slate-700/50">
                                            {selectedEvidence.legal_significance_en}
                                        </p>
                                    )}
                                    {selectedEvidence.legal_significance_ar && (
                                        <p className="text-sm text-text-muted leading-relaxed font-arabic text-right bg-black/20 p-3 rounded-lg border border-slate-700/50" dir="rtl">
                                            {selectedEvidence.legal_significance_ar}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-text-muted italic">No legal context provided.</p>
                            )}
                        </div>

                        {/* Screenshot */}
                        <div className="flex-1 overflow-auto bg-black p-4 flex items-center justify-center min-h-[40vh]">
                            {selectedEvidence._snippetSignedUrl ? (
                                <img
                                    src={selectedEvidence._snippetSignedUrl}
                                    alt={selectedEvidence.title}
                                    className="max-w-full max-h-full object-contain rounded"
                                />
                            ) : (
                                <div className="text-center text-text-muted">
                                    <FileBadge className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                    <p>No screenshot available for this evidence.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
