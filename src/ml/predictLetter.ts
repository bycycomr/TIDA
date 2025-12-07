import * as tf from '@tensorflow/tfjs';
import { getModel } from './modelLoader';

// Turkish Sign Language alphabet (29 letters)
export const TSL_ALPHABET = [
    'A', 'B', 'C', 'Ç', 'D', 'E', 'F', 'G', 'Ğ', 'H',
    'I', 'İ', 'J', 'K', 'L', 'M', 'N', 'O', 'Ö', 'P',
    'R', 'S', 'Ş', 'T', 'U', 'Ü', 'V', 'Y', 'Z'
];

export interface PredictionResult {
    letter: string;
    confidence: number;
    allPredictions: Array<{ letter: string; confidence: number }>;
}

/**
 * Normalize landmarks to prepare for model input
 * @param landmarks Flattened array of [x, y, z] coordinates (63 values for 21 landmarks)
 * @returns Normalized tensor
 */
const normalizeLandmarks = (landmarks: number[]): tf.Tensor2D => {
    // Convert to tensor
    const tensor = tf.tensor2d([landmarks], [1, landmarks.length]);

    // Normalize to [0, 1] range (landmarks are already in relative coordinates)
    // Additional normalization: center around wrist (landmark 0)
    const wristX = landmarks[0];
    const wristY = landmarks[1];
    const wristZ = landmarks[2];

    const normalized: number[] = [];
    for (let i = 0; i < landmarks.length; i += 3) {
        normalized.push(
            landmarks[i] - wristX,     // x relative to wrist
            landmarks[i + 1] - wristY, // y relative to wrist
            landmarks[i + 2] - wristZ  // z relative to wrist
        );
    }

    return tf.tensor2d([normalized], [1, normalized.length]);
};

/**
 * Predict letter from hand landmarks
 * @param landmarks Flattened array of hand landmarks
 * @returns Prediction result with letter and confidence
 */
export const predictLetter = async (landmarks: number[]): Promise<PredictionResult | null> => {
    const model = getModel();

    if (!model) {
        console.warn('Model not loaded');
        return null;
    }

    if (landmarks.length !== 63) {
        console.error('Invalid landmarks length. Expected 63, got:', landmarks.length);
        return null;
    }

    try {
        // Normalize landmarks
        const inputTensor = normalizeLandmarks(landmarks);

        // Make prediction
        const prediction = model.predict(inputTensor) as tf.Tensor;
        const probabilities = await prediction.data();

        // Clean up tensors
        inputTensor.dispose();
        prediction.dispose();

        // Get top predictions
        const predictions = Array.from(probabilities)
            .map((confidence, index) => ({
                letter: TSL_ALPHABET[index] || `Unknown_${index}`,
                confidence,
            }))
            .sort((a, b) => b.confidence - a.confidence);

        const topPrediction = predictions[0];

        return {
            letter: topPrediction.letter,
            confidence: topPrediction.confidence,
            allPredictions: predictions.slice(0, 5), // Top 5 predictions
        };
    } catch (error) {
        console.error('Prediction error:', error);
        return null;
    }
};

/**
 * Mock prediction for testing without a trained model
 * This will be replaced once the actual model is trained
 */
export const mockPredictLetter = (landmarks: number[]): PredictionResult => {
    // Simple mock: randomly select a letter with varying confidence
    const randomIndex = Math.floor(Math.random() * TSL_ALPHABET.length);
    const confidence = 0.6 + Math.random() * 0.4; // 0.6 to 1.0

    return {
        letter: TSL_ALPHABET[randomIndex],
        confidence,
        allPredictions: TSL_ALPHABET.slice(0, 5).map((letter, i) => ({
            letter,
            confidence: confidence - i * 0.1,
        })),
    };
};
