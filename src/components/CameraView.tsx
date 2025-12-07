import React from 'react';
import { useWebcam } from '../hooks/useWebcam';
import { useHandTracking } from '../hooks/useHandTracking';

interface CameraViewProps {
    onLandmarksDetected?: (landmarks: number[]) => void;
}

export const CameraView: React.FC<CameraViewProps> = ({ onLandmarksDetected }) => {
    const { videoRef, isLoading, error, hasPermission } = useWebcam();
    const { canvasRef, isReady, currentLandmarks, error: trackingError } = useHandTracking(
        videoRef,
        hasPermission
    );

    // Pass landmarks to parent component
    React.useEffect(() => {
        if (currentLandmarks && onLandmarksDetected) {
            onLandmarksDetected(currentLandmarks.landmarks);
        }
    }, [currentLandmarks, onLandmarksDetected]);

    return (
        <div className="glass-card p-6 space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gradient">Kamera Görünümü</h2>
                <div className="flex items-center gap-2">
                    {isLoading && (
                        <div className="flex items-center gap-2 text-primary-400">
                            <div className="w-2 h-2 bg-primary-400 rounded-full animate-pulse"></div>
                            <span className="text-sm">Başlatılıyor...</span>
                        </div>
                    )}
                    {hasPermission && !isReady && (
                        <div className="flex items-center gap-2 text-accent-400">
                            <div className="w-2 h-2 bg-accent-400 rounded-full animate-pulse"></div>
                            <span className="text-sm">El takibi yükleniyor...</span>
                        </div>
                    )}
                    {hasPermission && isReady && (
                        <div className="flex items-center gap-2 text-green-400">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-sm">Hazır</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="relative aspect-video bg-black/50 rounded-xl overflow-hidden">
                {error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-red-500/10 backdrop-blur-sm">
                        <div className="text-center p-6">
                            <svg
                                className="w-16 h-16 mx-auto mb-4 text-red-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                            </svg>
                            <p className="text-red-400 font-semibold mb-2">Kamera Hatası</p>
                            <p className="text-white/70 text-sm">{error}</p>
                        </div>
                    </div>
                )}

                {trackingError && (
                    <div className="absolute top-4 left-4 right-4 bg-yellow-500/20 backdrop-blur-sm border border-yellow-500/30 rounded-lg p-3">
                        <p className="text-yellow-400 text-sm">{trackingError}</p>
                    </div>
                )}

                <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    playsInline
                    muted
                />

                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full"
                />

                {currentLandmarks && (
                    <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2">
                        <p className="text-xs text-white/70">
                            El tespit edildi: <span className="text-primary-400 font-semibold">{currentLandmarks.handedness}</span>
                        </p>
                    </div>
                )}
            </div>

            <div className="text-center text-sm text-white/50">
                <p>Elinizi kamera önünde tutun</p>
            </div>
        </div>
    );
};
