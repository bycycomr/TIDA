import React from 'react';

interface TextAreaProps {
    text: string;
    onTextChange?: (text: string) => void;
}

export const TextArea: React.FC<TextAreaProps> = ({ text, onTextChange }) => {
    return (
        <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white/70 mb-4">
                Oluşturulan Metin
            </h3>

            <div className="relative">
                <textarea
                    value={text}
                    onChange={(e) => onTextChange?.(e.target.value)}
                    className="w-full h-40 glass-input resize-none font-mono text-lg"
                    placeholder="Harfler burada görünecek..."
                    readOnly={!onTextChange}
                />

                {text.length > 0 && (
                    <div className="absolute bottom-2 right-2 text-xs text-white/40">
                        {text.length} karakter
                    </div>
                )}
            </div>

            {!text && (
                <p className="text-sm text-white/40 mt-2 text-center">
                    İşaret dili harflerini gösterin, metin otomatik oluşacak
                </p>
            )}
        </div>
    );
};
