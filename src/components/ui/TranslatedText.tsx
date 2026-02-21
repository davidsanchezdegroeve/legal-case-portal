interface TranslatedTextProps {
    original: string;
    translated?: string | null;
    originalLang?: 'english' | 'arabic';
    className?: string;
}

export function TranslatedText({ original, translated, originalLang = 'english', className = '' }: TranslatedTextProps) {
    return (
        <div className={`flex flex-col gap-1.5 ${className}`}>
            <div className="flex items-start gap-2">
                <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded uppercase tracking-wider font-semibold border border-blue-300 mt-0.5 shrink-0">
                    Original: {originalLang.substring(0, 2)}
                </span>
                <span className="text-text-main leading-snug">{original}</span>
            </div>
            {translated && (
                <div className="pl-3 border-l-2 border-slate-300 ml-1 mt-1">
                    <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded uppercase tracking-wider font-semibold border border-amber-300 mr-2 inline-block -translate-y-0.5">
                        {originalLang === 'english' ? 'AR' : 'EN'}
                    </span>
                    <span className="text-text-muted leading-snug" dir={originalLang === 'english' ? 'rtl' : 'ltr'}>{translated}</span>
                </div>
            )}
        </div>
    );
}
