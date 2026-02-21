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
                <span className="text-[10px] bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-400 px-1.5 py-0.5 rounded uppercase tracking-wider font-semibold border border-blue-200 dark:border-blue-800/50 mt-0.5 shrink-0">
                    Original: {originalLang.substring(0, 2)}
                </span>
                <span className="text-text-main leading-snug">{original}</span>
            </div>
            {translated && (
                <div className="pl-3 border-l-2 border-slate-300 dark:border-slate-700/50 ml-1 mt-1">
                    <span className="text-[10px] bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-500 px-1.5 py-0.5 rounded uppercase tracking-wider font-semibold border border-amber-200 dark:border-amber-800/50 mr-2 inline-block -translate-y-0.5">
                        {originalLang === 'english' ? 'AR' : 'EN'}
                    </span>
                    <span className="text-text-muted leading-snug" dir={originalLang === 'english' ? 'rtl' : 'ltr'}>{translated}</span>
                </div>
            )}
        </div>
    );
}
