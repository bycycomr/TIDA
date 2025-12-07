import { useEffect, useRef, useState, useCallback } from 'react';
import { HandLandmarker, FilesetResolver, HandLandmarkerResult } from '@mediapipe/tasks-vision';

export interface NormalizedLandmarks {
    landmarks: number[]; // Flattened array of [x, y, z] coordinates
    handedness: string; // 'Left' or 'Right'
}

export interface UseHandTrackingReturn {
    canvasRef: React.RefObject<HTMLCanvasElement>;
    isReady: boolean;
    currentLandmarks: NormalizedLandmarks | null;
    error: string | null;
}

export const useHandTracking = (
    videoRef: React.RefObject<HTMLVideoElement>,
    enabled: boolean = true
): UseHandTrackingReturn => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const handLandmarkerRef = useRef<HandLandmarker | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    const [isReady, setIsReady] = useState(false);
    const [currentLandmarks, setCurrentLandmarks] = useState<NormalizedLandmarks | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Initialize MediaPipe Hand Landmarker
    useEffect(() => {
        const initHandLandmarker = async () => {
            try {
                const vision = await FilesetResolver.forVisionTasks(
                    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
                );

                const handLandmarker = await HandLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
                        delegate: 'GPU',
                    },
                    runningMode: 'VIDEO',
                    numHands: 1,
                    minHandDetectionConfidence: 0.5,
                    minHandPresenceConfidence: 0.5,
                    minTrackingConfidence: 0.5,
                });

                handLandmarkerRef.current = handLandmarker;
                setIsReady(true);
            } catch (err) {
                console.error('MediaPipe initialization error:', err);
                setError('El takibi başlatılamadı: ' + (err instanceof Error ? err.message : 'Bilinmeyen hata'));
            }
        };

        initHandLandmarker();

        return () => {
            if (handLandmarkerRef.current) {
                handLandmarkerRef.current.close();
            }
        };
    }, []);

    // Normalize landmarks to a flat array
    const normalizeLandmarks = useCallback((result: HandLandmarkerResult): NormalizedLandmarks | null => {
        if (!result.landmarks || result.landmarks.length === 0) {
            return null;
        }

        const landmarks = result.landmarks[0]; // Take first hand
        const handedness = result.handedness[0]?.[0]?.categoryName || 'Unknown';

        // Flatten landmarks: [x1, y1, z1, x2, y2, z2, ...]
        const flatLandmarks: number[] = [];
        landmarks.forEach((landmark) => {
            flatLandmarks.push(landmark.x, landmark.y, landmark.z);
        });

        return {
            landmarks: flatLandmarks,
            handedness,
        };
    }, []);

    // Draw hand skeleton on canvas
    const drawHandSkeleton = useCallback((result: HandLandmarkerResult) => {
        const canvas = canvasRef.current;
        const video = videoRef.current;

        if (!canvas || !video) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw landmarks and connections
        if (result.landmarks && result.landmarks.length > 0) {
            const landmarks = result.landmarks[0];

            // Define hand connections (MediaPipe standard)
            const connections = [
                [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
                [0, 5], [5, 6], [6, 7], [7, 8], // Index
                [0, 9], [9, 10], [10, 11], [11, 12], // Middle
                [0, 13], [13, 14], [14, 15], [15, 16], // Ring
                [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
                [5, 9], [9, 13], [13, 17], // Palm
            ];

            // Draw connections
            ctx.strokeStyle = '#e879f9';
            ctx.lineWidth = 2;
            connections.forEach(([start, end]) => {
                const startPoint = landmarks[start];
                const endPoint = landmarks[end];

                ctx.beginPath();
                ctx.moveTo(startPoint.x * canvas.width, startPoint.y * canvas.height);
                ctx.lineTo(endPoint.x * canvas.width, endPoint.y * canvas.height);
                ctx.stroke();
            });

            // Draw landmarks
            landmarks.forEach((landmark) => {
                const x = landmark.x * canvas.width;
                const y = landmark.y * canvas.height;

                ctx.beginPath();
                ctx.arc(x, y, 5, 0, 2 * Math.PI);
                ctx.fillStyle = '#38bdf8';
                ctx.fill();

                // Add glow effect
                ctx.shadowBlur = 10;
                ctx.shadowColor = '#38bdf8';
                ctx.fill();
                ctx.shadowBlur = 0;
            });
        }
    }, [videoRef]);

    // Process video frames
    useEffect(() => {
        if (!enabled || !isReady || !videoRef.current || !handLandmarkerRef.current) {
            return;
        }

        const video = videoRef.current;
        let lastVideoTime = -1;

        const processFrame = () => {
            if (!video || !handLandmarkerRef.current) return;

            const currentTime = video.currentTime;

            // Only process if video time has changed
            if (currentTime !== lastVideoTime) {
                lastVideoTime = currentTime;

                try {
                    const result = handLandmarkerRef.current.detectForVideo(video, performance.now());

                    // Draw skeleton
                    drawHandSkeleton(result);

                    // Update landmarks
                    const normalized = normalizeLandmarks(result);
                    setCurrentLandmarks(normalized);
                } catch (err) {
                    console.error('Hand detection error:', err);
                }
            }

            animationFrameRef.current = requestAnimationFrame(processFrame);
        };

        processFrame();

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [enabled, isReady, videoRef, drawHandSkeleton, normalizeLandmarks]);

    return {
        canvasRef,
        isReady,
        currentLandmarks,
        error,
    };
};
