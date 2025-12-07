import React from 'react';

interface ControlsProps {
    onAddSpace: () => void;
    onBackspace: () => void;
    onClear: () => void;
    onSpeak: () => void;
    onCommitLetter: () => void;
    isSpeaking: boolean;
    canSpeak: boolean;
    hasText: boolean;
    currentLetter: string | null;
}

export const Controls: React.FC<ControlsProps> = ({
    onAddSpace,
    onBackspace,
    onClear,
    onSpeak,
    onCommitLetter,
    isSpeaking,
    canSpeak,
    hasText,
    currentLetter,
}) => {
    return (
        <div className="glass-card p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white/70 mb-4">
                Kontroller
            </h3>

            {/* Letter Commit Button */}
            <div className="space-y-2">
                <button
                    onClick={onCommitLetter}
                    disabled={!currentLetter}
                    className="w-full glass-button disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                    <div className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Harfi Ekle {currentLetter && `(${currentLetter})`}</span>
                    </div>
                </button>
                <p className="text-xs text-white/40 text-center">
                    Algılanan harfi metne eklemek için tıklayın
                </p>
            </div>

            {/* Text Editing Controls */}
            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={onAddSpace}
                    className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg
                     transition-all duration-200 hover:scale-105 active:scale-95"
                >
                    <div className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h8" />
                        </svg>
                        <span>Boşluk</span>
                    </div>
                </button>

                <button
                    onClick={onBackspace}
                    disabled={!hasText}
                    className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg
                     transition-all duration-200 hover:scale-105 active:scale-95
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                    <div className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
                        </svg>
                        <span>Sil</span>
                    </div>
                </button>
            </div>

            {/* Clear All */}
            <button
                onClick={onClear}
                disabled={!hasText}
                className="w-full px-4 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg
                   transition-all duration-200 hover:scale-105 active:scale-95
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
                <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Tümünü Temizle</span>
                </div>
            </button>

            {/* TTS Controls */}
            <div className="pt-4 border-t border-white/10">
                <button
                    onClick={onSpeak}
                    disabled={!hasText || !canSpeak || isSpeaking}
                    className="w-full glass-button disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                    <div className="flex items-center justify-center gap-2">
                        {isSpeaking ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Konuşuyor...</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                </svg>
                                <span>Metni Oku</span>
                            </>
                        )}
                    </div>
                </button>

                {!canSpeak && (
                    <p className="text-xs text-yellow-400 mt-2 text-center">
                        Tarayıcınız metin okuma özelliğini desteklemiyor
                    </p>
                )}
            </div>
        </div>
    );
};
