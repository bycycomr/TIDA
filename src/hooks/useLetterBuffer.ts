import { useState, useEffect, useRef } from 'react';

export interface UseLetterBufferReturn {
    currentLetter: string | null;
    confidence: number;
    addPrediction: (letter: string, confidence: number) => void;
    reset: () => void;
}

export const useLetterBuffer = (
    windowSize: number = 10,
    minConfidence: number = 0.6,
    consistencyThreshold: number = 0.7
): UseLetterBufferReturn => {
    const [currentLetter, setCurrentLetter] = useState<string | null>(null);
    const [confidence, setConfidence] = useState<number>(0);
    const bufferRef = useRef<Array<{ letter: string; confidence: number }>>([]);

    const addPrediction = (letter: string, predictionConfidence: number) => {
        // Only add if confidence is above minimum
        if (predictionConfidence < minConfidence) {
            return;
        }

        // Add to buffer
        bufferRef.current.push({ letter, confidence: predictionConfidence });

        // Keep buffer size limited
        if (bufferRef.current.length > windowSize) {
            bufferRef.current.shift();
        }

        // Analyze buffer for consistency
        if (bufferRef.current.length >= windowSize) {
            const letterCounts = new Map<string, number>();
            let totalConfidence = 0;

            bufferRef.current.forEach(({ letter: l, confidence: c }) => {
                letterCounts.set(l, (letterCounts.get(l) || 0) + 1);
                totalConfidence += c;
            });

            // Find most common letter
            let maxCount = 0;
            let mostCommonLetter = '';

            letterCounts.forEach((count, letter) => {
                if (count > maxCount) {
                    maxCount = count;
                    mostCommonLetter = letter;
                }
            });

            // Check if letter is consistent enough
            const consistency = maxCount / windowSize;
            const avgConfidence = totalConfidence / windowSize;

            if (consistency >= consistencyThreshold && avgConfidence >= minConfidence) {
                setCurrentLetter(mostCommonLetter);
                setConfidence(avgConfidence);
            } else {
                setCurrentLetter(null);
                setConfidence(0);
            }
        }
    };

    const reset = () => {
        bufferRef.current = [];
        setCurrentLetter(null);
        setConfidence(0);
    };

    return {
        currentLetter,
        confidence,
        addPrediction,
        reset,
    };
};
