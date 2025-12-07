import * as tf from '@tensorflow/tfjs';

let model: tf.LayersModel | null = null;

export const loadModel = async (modelPath: string = '/model/model.json'): Promise<tf.LayersModel> => {
    try {
        if (model) {
            return model;
        }

        console.log('Loading TensorFlow.js model from:', modelPath);
        model = await tf.loadLayersModel(modelPath);
        console.log('Model loaded successfully');

        return model;
    } catch (error) {
        console.error('Error loading model:', error);
        throw new Error('Model yüklenemedi: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
    }
};

export const getModel = (): tf.LayersModel | null => {
    return model;
};

export const unloadModel = () => {
    if (model) {
        model.dispose();
        model = null;
    }
};
