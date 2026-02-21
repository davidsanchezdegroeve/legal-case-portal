import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { UploadCloud, FileText, ExternalLink, ShieldCheck, FileBadge, TrendingUp, MessageSquare, Lock, Folders } from 'lucide-react';
import { DualLanguageInput } from '../components/ui/DualLanguageInput';

export interface EvidenceDoc {
    id: string;
    title: string;
    description: string;
    category: string;
    file_url: string | null;
    created_at: string;
    uploaded_by: string;
    verification_code?: string;
    arabic_translation?: string;
}

export default function EvidenceGallery() {
    const [documents, setDocuments] = useState<EvidenceDoc[]>([]);
    const [filter, setFilter] = useState('all');
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
                if (data) setDocuments(data as unknown as EvidenceDoc[]);
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

        } catch (e: any) {
            console.error('Upload Error:', e.message);
            alert('Upload failed: ' + e.message);
        } finally {
            setIsUploading(false);
        }
    };


    const filteredDocs = documents.filter(doc => filter === 'all' || doc.category === filter);

    if (isLoading) {
        return (
            <div className="max-w-6xl mx-auto pb-12 flex items-center justify-center min-h-[50vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-400 font-medium tracking-wide">Decrypting vault contents...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto pb-12">
            <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Evidence Vault</h1>
                    <p className="text-slate-400">Secure repository of all documentation verifying the claims.</p>
                </div>
                {isLawyerOrAdmin && (
                    <button
                        onClick={() => setShowUpload(!showUpload)}
                        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl transition-colors shadow-lg shadow-blue-900/20 w-full md:w-auto font-medium"
                    >
                        {showUpload ? 'Cancel Upload' : <><UploadCloud className="w-5 h-5" /> Upload Evidence</>}
                    </button>
                )}
            </header>

            {/* Upload Area */}
            {showUpload && isLawyerOrAdmin && (
                <div className="glass-panel p-6 rounded-2xl mb-10 border border-blue-500/30">
                    <h3 className="text-lg font-semibold text-white mb-6">Upload New Document to Vault</h3>
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
                                <label className="text-sm font-medium text-slate-300 ml-1 block mb-1">Verification Code (If applicable)</label>
                                <input type="text" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} placeholder="e.g. 109884831" className="w-full bg-[#151822]/80 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 placeholder:text-slate-600 focus:border-blue-500 outline-none" />
                            </div>
                        </div>

                        <div className="flex flex-col justify-end">
                            <div className="border border-dashed border-slate-600 rounded-xl p-6 text-center bg-[#151822] hover:bg-slate-800/50 transition">
                                <FileBadge className="w-8 h-8 text-slate-500 mx-auto mb-3" />
                                <p className="text-sm text-slate-400 mb-4">Select the PDF file containing the evidence.</p>
                                <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600/20 file:text-blue-400 hover:file:bg-blue-600/30 cursor-pointer" />
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

            {/* Filters */}
            <div className="flex overflow-x-auto pb-4 mb-6 gap-2 no-scrollbar">
                {['all', 'Communication', 'Financial', 'Government', 'Audio'].map(cat => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filter === cat ? 'bg-blue-600/20 text-blue-400 border border-blue-500/50' : 'bg-[#151822] text-slate-400 border border-slate-800 hover:border-slate-700'}`}
                    >
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                ))}
            </div>

            {/* Grid */}
            {filteredDocs.length === 0 ? (
                <div className="text-center py-20 glass-panel rounded-3xl border border-slate-800/50">
                    <Folders className="w-12 h-12 text-slate-600 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium text-slate-300">Vault is empty</h3>
                    <p className="text-slate-500 text-sm mt-2">No evidence documents have been securely uploaded yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDocs.map((doc) => (
                        <div key={doc.id} className="glass-panel p-5 rounded-2xl flex flex-col h-full group border border-slate-800 hover:border-slate-700 transition">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                                    {doc.category === 'Communication' && <MessageSquare className="w-6 h-6 text-blue-400" />}
                                    {doc.category === 'Financial' && <TrendingUp className="w-6 h-6 text-amber-400" />}
                                    {doc.category === 'Government' && <FileText className="w-6 h-6 text-emerald-400" />}
                                    {doc.category === 'Audio' && <UploadCloud className="w-6 h-6 text-purple-400" />}
                                    {!['Communication', 'Financial', 'Government', 'Audio'].includes(doc.category) && <FileText className="w-6 h-6 text-blue-400" />}
                                </div>
                                <div className="text-[10px] font-bold bg-slate-800 text-slate-400 px-2 py-1 rounded uppercase tracking-wider">
                                    {doc.category}
                                </div>
                            </div>

                            <h4 className="text-lg font-bold text-white mb-2 leading-tight">
                                {doc.title}
                            </h4>
                            <p className="text-xs text-slate-400 font-arabic mb-4 line-clamp-2" dir="rtl">{doc.arabic_translation}</p>

                            {/* Evidence Integrity Banner */}
                            {doc.verification_code && (
                                <div className="mt-auto bg-[#151822] p-3 rounded-xl border border-emerald-500/20 flex items-center justify-between mb-4 mt-4">
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                        <span className="text-xs text-emerald-500 font-medium">Verified Gov Document</span>
                                    </div>
                                    <span className="text-xs text-slate-500 font-mono">CODE: {doc.verification_code}</span>
                                </div>
                            )}

                            <div className="mt-auto pt-4">
                                {doc.file_url ? (
                                    <a
                                        href={doc.file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full py-2.5 bg-[#151822] hover:bg-slate-800 text-slate-200 justify-center rounded-xl flex items-center gap-2 text-sm font-medium transition-colors border border-slate-800 hover:border-slate-700"
                                    >
                                        <ExternalLink className="w-4 h-4" /> View Original Document
                                    </a>
                                ) : (
                                    <button disabled className="w-full py-2.5 bg-[#151822]/50 text-slate-500 justify-center rounded-xl flex items-center gap-2 text-sm font-medium border border-slate-800/50 cursor-not-allowed">
                                        <Lock className="w-4 h-4" /> Offline Evidence
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
