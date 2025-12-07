import React from 'react';

interface LiveLetterProps {
    letter: string | null;
    confidence: number;
}

export const LiveLetter: React.FC<LiveLetterProps> = ({ letter, confidence }) => {
    return (
        <div className="glass-card p-8">
            <h3 className="text-lg font-semibold text-white/70 mb-4 text-center">
                Algılanan Harf
            </h3>

            <div className="relative">
                <div className="text-center">
                    {letter ? (
                        <>
                            <div className="text-8xl font-bold text-gradient animate-glow mb-4">
                                {letter}
                            </div>
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-full max-w-xs bg-white/10 rounded-full h-2 overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-300"
                                        style={{ width: `${confidence * 100}%` }}
                                    />
                                </div>
                                <span className="text-sm text-white/70 font-mono min-w-[3rem]">
                                    {(confidence * 100).toFixed(0)}%
                                </span>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4 opacity-30">👋</div>
                            <p className="text-white/50">El bekleniyor...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
