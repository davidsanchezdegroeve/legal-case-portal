/**
 * A mock translation service for the MVP.
 * In a real production environment, this would call the DeepL or Google Translate API.
 */

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function translateText(text: string, sourceLang: 'english' | 'arabic', targetLang: 'english' | 'arabic'): Promise<string> {
    if (!text) return '';
    if (sourceLang === targetLang) return text;

    // Simulate network latency
    await delay(800 + Math.random() * 500);

    if (targetLang === 'arabic') {
        // Basic mock translation mapping for UI testing
        const dictionary: Record<string, string> = {
            'dissolution': 'حل الشركة',
            'bad faith': 'سوء نية',
            'evidence': 'دليل',
            'contract': 'عقد',
            'debt': 'دين',
            'salary': 'راتب',
            'gosi': 'التأمينات الاجتماعية'
        };

        let translated = text;
        Object.keys(dictionary).forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            translated = translated.replace(regex, dictionary[word]);
        });

        // If it's just a generic sentence and wasn't mocked, prepend an Arabic marker
        if (translated === text) {
            return `[مترجم] ${text}`;
        }
        return translated;
    }

    return `[Translated to English] ${text}`;
}
