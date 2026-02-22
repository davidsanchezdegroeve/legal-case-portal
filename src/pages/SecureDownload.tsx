import React, { useState } from 'react';
import { ShieldCheck, Lock, Download, AlertCircle, Loader2 } from 'lucide-react';

export default function SecureDownload() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isUnlocked, setIsUnlocked] = useState(false);

    // This is the file name in the Supabase bucket
    const fileName = "CONFIDENTIAL_EVIDENCE_BUNDLE.zip";
    // This is the hardcoded password
    const securePassword = "legal-access-2025";
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);

    const handleUnlock = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === securePassword) {
            setIsUnlocked(true);
            setError('');
        } else {
            setError('Incorrect password. Access denied.');
            setIsUnlocked(false);
        }
    };

    return (
        <div className="min-h-screen bg-bg-app flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-900/10 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-900/10 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="glass-panel w-full max-w-md rounded-3xl p-8 relative z-10 border border-slate-700/50 shadow-2xl">

                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-slate-700">
                        {isUnlocked ? (
                            <ShieldCheck className="w-8 h-8 text-emerald-400" />
                        ) : (
                            <Lock className="w-8 h-8 text-blue-400" />
                        )}
                    </div>
                    <h1 className="text-2xl font-bold text-text-main mb-2">Secure Evidence Gateway</h1>
                    <p className="text-text-muted text-sm px-4">
                        {isUnlocked
                            ? "Access granted. The confidential file is now available for download."
                            : "This file is protected. Please enter the access password provided by your legal counsel."}
                    </p>
                </div>

                {!isUnlocked ? (
                    <form onSubmit={handleUnlock} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                                Access Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-text-main placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                                placeholder="••••••••••••"
                                required
                            />
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-rose-400 bg-rose-500/10 p-3 rounded-lg border border-rose-500/20 text-sm">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 mt-4"
                        >
                            <Lock className="w-4 h-4" /> Unlock File
                        </button>
                    </form>
                ) : (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 flex items-center justify-between">
                            <div className="truncate pr-4">
                                <p className="text-sm font-medium text-text-main truncate">{fileName}</p>
                                <p className="text-xs text-text-muted mt-1">Encrypted Evidence Package</p>
                            </div>
                            <span className="text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded text-xs font-bold border border-emerald-500/20">VERIFIED</span>
                        </div>

                        <div className="relative w-full">
                            <button
                                onClick={async () => {
                                    try {
                                        setIsDownloading(true);
                                        setDownloadProgress(0);

                                        const publicUrl = `https://amsxzshsxqyubutmwfhn.supabase.co/storage/v1/object/public/conf/${fileName}`;

                                        // Use XHR to track download progress properly
                                        const blob = await new Promise<Blob>((resolve, reject) => {
                                            const xhr = new XMLHttpRequest();
                                            xhr.open('GET', publicUrl, true);
                                            xhr.responseType = 'blob';

                                            xhr.onprogress = (event) => {
                                                if (event.lengthComputable) {
                                                    const percentComplete = Math.round((event.loaded / event.total) * 100);
                                                    setDownloadProgress(percentComplete);
                                                }
                                            };

                                            xhr.onload = () => {
                                                if (xhr.status >= 200 && xhr.status < 300) {
                                                    resolve(xhr.response);
                                                } else {
                                                    reject(new Error(`HTTP status ${xhr.status}`));
                                                }
                                            };

                                            xhr.onerror = () => reject(new Error("Network error"));
                                            xhr.send();
                                        });

                                        // Create a blob and simulate a click to force the browser to save it
                                        const url = URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = fileName;
                                        document.body.appendChild(a);
                                        a.click();
                                        document.body.removeChild(a);
                                        URL.revokeObjectURL(url);
                                    } catch (err) {
                                        console.error("Download failed:", err);
                                        alert("There was an error downloading the file. Please check if the file exists in the vault.");
                                    } finally {
                                        setIsDownloading(false);
                                        setTimeout(() => setDownloadProgress(0), 1000); // Reset after a tiny delay
                                    }
                                }}
                                disabled={isDownloading}
                                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 disabled:cursor-not-allowed text-white font-medium py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 group relative overflow-hidden"
                            >
                                {isDownloading && (
                                    <div
                                        className="absolute left-0 top-0 bottom-0 bg-white/20 transition-all duration-300 ease-out"
                                        style={{ width: `${downloadProgress}%` }}
                                    ></div>
                                )}

                                <div className="relative z-10 flex items-center gap-2">
                                    {isDownloading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Downloading... {downloadProgress > 0 ? `${downloadProgress}%` : ''}
                                        </>
                                    ) : (
                                        <>
                                            <Download className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                                            Download Original Evidence
                                        </>
                                    )}
                                </div>
                            </button>
                        </div>

                        <p className="text-xs text-center text-slate-500 mt-4">
                            By downloading this file, you agree to the confidentiality terms of the proceedings.
                        </p>
                    </div>
                )}
            </div>

            <div className="absolute bottom-6 left-0 right-0 text-center">
                <p className="text-xs text-slate-600 font-medium tracking-widest uppercase">
                    Secure Defense Portal • Case #19813448
                </p>
            </div>
        </div>
    );
}
