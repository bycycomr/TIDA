import { useState, useEffect, useCallback } from 'react';

export interface UseTTSReturn {
    speak: (text: string) => void;
    isSpeaking: boolean;
    isSupported: boolean;
    error: string | null;
    voices: SpeechSynthesisVoice[];
    selectedVoice: SpeechSynthesisVoice | null;
    setSelectedVoice: (voice: SpeechSynthesisVoice) => void;
}

export const useTTS = (): UseTTSReturn => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isSupported, setIsSupported] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

    // Check browser support
    useEffect(() => {
        if ('speechSynthesis' in window) {
            setIsSupported(true);

            // Load voices
            const loadVoices = () => {
                const availableVoices = window.speechSynthesis.getVoices();
                setVoices(availableVoices);

                // Try to find Turkish voice
                const turkishVoice = availableVoices.find(
                    (voice) => voice.lang.startsWith('tr') || voice.lang.startsWith('tr-TR')
                );

                if (turkishVoice) {
                    setSelectedVoice(turkishVoice);
                } else if (availableVoices.length > 0) {
                    // Fallback to first available voice
                    setSelectedVoice(availableVoices[0]);
                    setError('Türkçe ses bulunamadı. Varsayılan ses kullanılıyor.');
                }
            };

            // Voices may load asynchronously
            loadVoices();
            window.speechSynthesis.onvoiceschanged = loadVoices;
        } else {
            setIsSupported(false);
            setError('Tarayıcınız metin okuma özelliğini desteklemiyor.');
        }
    }, []);

    const speak = useCallback((text: string) => {
        if (!isSupported) {
            setError('Metin okuma desteklenmiyor.');
            return;
        }

        if (!text.trim()) {
            return;
        }

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        // Set Turkish language
        utterance.lang = 'tr-TR';

        // Use selected voice if available
        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }

        // Configure speech parameters
        utterance.rate = 1.0; // Normal speed
        utterance.pitch = 1.0; // Normal pitch
        utterance.volume = 1.0; // Full volume

        // Event handlers
        utterance.onstart = () => {
            setIsSpeaking(true);
            setError(null);
        };

        utterance.onend = () => {
            setIsSpeaking(false);
        };

        utterance.onerror = (event) => {
            setIsSpeaking(false);
            setError('Metin okuma hatası: ' + event.error);
            console.error('Speech synthesis error:', event);
        };

        // Speak
        window.speechSynthesis.speak(utterance);
    }, [isSupported, selectedVoice]);

    return {
        speak,
        isSpeaking,
        isSupported,
        error,
        voices,
        selectedVoice,
        setSelectedVoice,
    };
};
