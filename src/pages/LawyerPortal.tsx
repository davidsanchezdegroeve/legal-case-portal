import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Scale, Briefcase, ChevronRight, PenTool } from 'lucide-react';
import { DualLanguageInput } from '../components/ui/DualLanguageInput';

export default function LawyerPortal() {
    const { profile } = useAuth();
    const isLawyer = profile?.role === 'lawyer';

    const [requests, setRequests] = useState<any[]>([]);
    const [activeRequest, setActiveRequest] = useState<string | null>(null);
    const [recommendation, setRecommendation] = useState('');
    const [recommendationAr, setRecommendationAr] = useState('');

    useEffect(() => {
        // Basic mock initialization map
        setRequests([
            {
                id: 'req_1',
                title: 'Strategy against "Feb 12th" covert dissolution',
                description: 'Need urgent advice on the legality of dissolving the entity behind my back while locking me out of my emails.',
                status: 'pending',
                recommendation: '',
                arabic_translation: ''
            },
            {
                id: 'req_2',
                title: 'Review of GOSI Salary Gaps',
                description: 'Please review the gap in my GOSI and compare against the company bank transfers to establish calculated debt.',
                status: 'replied',
                recommendation: 'Based on Saudi labor law, the employer is liable for the full stated salary in the GOSI register regardless of private verbal agreements.',
                arabic_translation: 'بناءً على قانون العمل السعودي، يتحمل صاحب العمل المسؤولية...'
            }
        ]);
    }, []);

    const handleSaveRecommendation = async (reqId: string) => {
        // Real implementation would save to DB legal_dashboard table
        setRequests(reqs => reqs.map(r =>
            r.id === reqId ? { ...r, recommendation, arabic_translation: recommendationAr, status: 'replied' } : r
        ));
        setActiveRequest(null);
        setRecommendation('');
        setRecommendationAr('');
    };

    return (
        <div className="max-w-6xl mx-auto flex h-[calc(100vh-8rem)] gap-6">

            <div className="w-1/3 flex flex-col gap-4">
                <header className="mb-4">
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Briefcase className="w-6 h-6 text-emerald-500" /> My Requests</h1>
                    <p className="text-slate-400 text-sm">Action items requiring legal counsel advice.</p>
                </header>

                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                    {requests.map(req => (
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
                                <ChevronRight className={`w-4 h-4 ${activeRequest === req.id ? 'text-blue-400' : 'text-slate-500'}`} />
                            </div>
                            <h4 className="text-slate-100 font-semibold mb-1 line-clamp-2">{req.title}</h4>
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 glass-panel rounded-3xl p-8 relative overflow-hidden flex flex-col border border-slate-700">
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none -mt-20"></div>

                {activeRequest ? (
                    <>
                        {requests.filter(r => r.id === activeRequest).map(req => (
                            <div key={req.id} className="h-full flex flex-col">
                                <div className="mb-8">
                                    <h2 className="text-2xl font-bold text-white mb-4">{req.title}</h2>
                                    <div className="bg-[#151822]/80 p-5 rounded-xl border border-slate-800">
                                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Admin Request Context</h4>
                                        <p className="text-slate-300 leading-relaxed">{req.description}</p>
                                    </div>
                                </div>

                                <div className="flex-1 max-h-[500px]">
                                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                        <PenTool className="w-5 h-5 text-amber-500" /> Counsel Recommendation
                                    </h3>

                                    {/* If they are an Admin, they should only view it maybe, or read-only. For now we assume a Lawyer is using this to type it. */}
                                    <div className="bg-[#151822] p-6 rounded-2xl border border-slate-800">
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
                                                className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-6 py-2.5 rounded-xl transition-colors shadow-lg shadow-emerald-900/20 flex items-center gap-2"
                                            >
                                                Submit Counsel
                                                <Scale className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center text-slate-500">
                        <Scale className="w-16 h-16 opacity-20 mb-4" />
                        <h3 className="text-xl font-medium text-slate-300">Select a Request</h3>
                        <p className="mt-2 max-w-sm mx-auto">Click on a pending request from the left panel to review the details and provide your legal recommendation.</p>
                    </div>
                )}
            </div>

        </div>
    );
}
