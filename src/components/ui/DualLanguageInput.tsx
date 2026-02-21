import { useState } from 'react';
import { translateText } from '../../lib/translate';
import { Languages, Loader2, Sparkles } from 'lucide-react';

interface DualLanguageInputProps {
    label: string;
    value: string;
    onChange: (val: string) => void;
    onTranslated: (translatedVal: string) => void;
    sourceLang?: 'english' | 'arabic';
    placeholder?: string;
    isTextArea?: boolean;
}

export function DualLanguageInput({
    label, value, onChange, onTranslated, sourceLang = 'english', placeholder, isTextArea = false
}: DualLanguageInputProps) {
    const [isTranslating, setIsTranslating] = useState(false);
    const [hasTranslated, setHasTranslated] = useState(false);

    const handleBlur = async () => {
        if (!value || hasTranslated) return;
        setIsTranslating(true);
        try {
            const result = await translateText(value, sourceLang, sourceLang === 'english' ? 'arabic' : 'english');
            onTranslated(result);
            setHasTranslated(true);
        } finally {
            setIsTranslating(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        onChange(e.target.value);
        if (hasTranslated) setHasTranslated(false); // Reset translation flag if they edit again
    };

    const inputClasses = "w-full bg-bg-surface/80 border border-slate-700 rounded-xl pl-4 pr-11 py-2.5 text-text-main focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all placeholder:text-slate-600";

    return (
        <div className="space-y-1.5">
            <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-text-muted ml-1">{label}</label>
                <span className="text-[10px] text-text-muted flex items-center gap-1">
                    Auto-translates on blur <Sparkles className="w-3 h-3" />
                </span>
            </div>
            <div className="relative group">
                {isTextArea ? (
                    <textarea
                        value={value}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder={placeholder}
                        className={`${inputClasses} min-h-[100px] resize-y`}
                    />
                ) : (
                    <input
                        type="text"
                        value={value}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder={placeholder}
                        className={inputClasses}
                    />
                )}

                <div className="absolute right-3 top-3 text-text-muted group-focus-within:text-blue-400 transition-colors">
                    {isTranslating ? (
                        <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
                    ) : (
                        <Languages className="w-5 h-5 opacity-50" />
                    )}
                </div>
            </div>
        </div>
    );
}
