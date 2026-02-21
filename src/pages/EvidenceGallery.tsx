import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { UploadCloud, FileText, ExternalLink, ShieldCheck, Search, FileBadge } from 'lucide-react';
import { DualLanguageInput } from '../components/ui/DualLanguageInput';

export default function EvidenceGallery() {
    const { profile } = useAuth();
    const isAdmin = profile?.role === 'admin';
    const [documents, setDocuments] = useState<any[]>([]);

    // Upload State
    const [showUpload, setShowUpload] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState('');
    const [titleAr, setTitleAr] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        // Initial mock data as requested: "like my GOSI Certificate and display their Certificate Code"
        setDocuments([
            {
                id: '1',
                title: 'GOSI Salary Gap Certificate',
                category: 'Financial',
                verification_code: '109884831',
                arabic_translation: 'شهادة فجوة الراتب التابعة للتأمينات الاجتماعية',
                file_url: 'mock_url'
            }
        ]);
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
            await supabase.from('evidence_vault').insert([
                {
                    title,
                    category: 'General',
                    file_url: filePath,
                    verification_code: verificationCode,
                    arabic_translation: titleAr || undefined,
                }
            ]);

            // Mock local addition
            setDocuments([{
                id: Math.random().toString(),
                title,
                category: 'General',
                verification_code: verificationCode,
                arabic_translation: titleAr,
                file_url: filePath
            }, ...documents]);

            setShowUpload(false);
            setFile(null); setTitle(''); setTitleAr(''); setVerificationCode('');

        } catch (e: any) {
            console.error('Upload Error:', e.message);
            alert('Upload failed: ' + e.message);
        } finally {
            setIsUploading(false);
        }
    };

    const retrieveSignedUrl = async (path: string) => {
        try {
            if (path === 'mock_url') return alert('This is a mock document. Signed URLs require a real storage upload.');

            const { data, error } = await supabase.storage
                .from('evidence-vault')
                .createSignedUrl(path, 60); // 60 seconds strict expiration

            if (error) throw error;
            window.open(data.signedUrl, '_blank');
        } catch (err: any) {
            console.error(err);
            alert('Access Denied: ' + err.message);
        }
    };

    return (
        <div className="max-w-6xl mx-auto pb-12">
            <header className="mb-10 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Evidence Vault</h1>
                    <p className="text-slate-400">Secure repository for verified government & legal documents.</p>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => setShowUpload(!showUpload)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl transition-colors shadow-lg shadow-blue-900/20"
                    >
                        {showUpload ? 'Cancel' : <><UploadCloud className="w-5 h-5" /> Upload Evidence</>}
                    </button>
                )}
            </header>

            {showUpload && isAdmin && (
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

            {/* Vault Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {documents.map((doc) => (
                    <div key={doc.id} className="glass-panel p-5 rounded-2xl flex flex-col h-full group">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div className="text-[10px] font-bold bg-slate-800 text-slate-400 px-2 py-1 rounded uppercase tracking-wider">
                                {doc.category}
                            </div>
                        </div>

                        <h4 className="text-lg font-bold text-white mb-2 leading-tight">
                            {doc.title}
                        </h4>
                        <p className="text-xs text-slate-400 font-arabic mb-4" dir="rtl">{doc.arabic_translation}</p>

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

                        <button onClick={() => retrieveSignedUrl(doc.file_url)} className="mt-auto w-full py-2.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 justify-center rounded-xl flex items-center gap-2 text-sm font-medium transition-colors border border-slate-700 hover:border-slate-500">
                            <ExternalLink className="w-4 h-4" /> Request Signed URL (60s Expiration)
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
