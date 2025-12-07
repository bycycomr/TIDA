import { useEffect, useRef, useState } from 'react';

export interface UseWebcamReturn {
    videoRef: React.RefObject<HTMLVideoElement>;
    isLoading: boolean;
    error: string | null;
    hasPermission: boolean;
}

export const useWebcam = (): UseWebcamReturn => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasPermission, setHasPermission] = useState(false);

    useEffect(() => {
        let stream: MediaStream | null = null;

        const initWebcam = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Request camera access
                stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: { ideal: 1280 },
                        height: { ideal: 720 },
                        facingMode: 'user',
                    },
                    audio: false,
                });

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await videoRef.current.play();
                    setHasPermission(true);
                }
            } catch (err) {
                console.error('Webcam error:', err);
                if (err instanceof Error) {
                    if (err.name === 'NotAllowedError') {
                        setError('Kamera erişimi reddedildi. Lütfen tarayıcı ayarlarından kamera iznini etkinleştirin.');
                    } else if (err.name === 'NotFoundError') {
                        setError('Kamera bulunamadı. Lütfen cihazınızın kameraya sahip olduğundan emin olun.');
                    } else {
                        setError('Kamera başlatılamadı: ' + err.message);
                    }
                } else {
                    setError('Bilinmeyen bir hata oluştu.');
                }
                setHasPermission(false);
            } finally {
                setIsLoading(false);
            }
        };

        initWebcam();

        // Cleanup
        return () => {
            if (stream) {
                stream.getTracks().forEach((track) => track.stop());
            }
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
        };
    }, []);

    return {
        videoRef,
        isLoading,
        error,
        hasPermission,
    };
};
