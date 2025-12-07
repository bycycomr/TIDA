import { useState, useEffect, useCallback, useRef } from 'react';
import { CameraView } from './components/CameraView';
import { LiveLetter } from './components/LiveLetter';
import { TextArea } from './components/TextArea';
import { Controls } from './components/Controls';
import { useLetterBuffer } from './hooks/useLetterBuffer';
import { useTTS } from './hooks/useTTS';
import { mockPredictLetter } from './ml/predictLetter';
// import { loadModel, predictLetter } from './ml/predictLetter'; // Uncomment when model is ready

function App() {
  const [text, setText] = useState('');
  const { currentLetter, confidence, addPrediction, reset: resetBuffer } = useLetterBuffer(10, 0.6, 0.7);
  const { speak, isSpeaking, isSupported: ttsSupported } = useTTS();
  const lastCommittedLetterRef = useRef<string | null>(null);

  // Handle landmarks from camera
  const handleLandmarksDetected = useCallback((landmarks: number[]) => {
    if (landmarks.length !== 63) return;

    // TODO: Replace with actual model prediction when ready
    // For now, using mock prediction
    const prediction = mockPredictLetter(landmarks);

    if (prediction) {
      addPrediction(prediction.letter, prediction.confidence);
    }

    // Uncomment when model is ready:
    // predictLetter(landmarks).then((prediction) => {
    //   if (prediction) {
    //     addPrediction(prediction.letter, prediction.confidence);
    //   }
    // });
  }, [addPrediction]);

  // Commit current letter to text
  const handleCommitLetter = useCallback(() => {
    if (currentLetter && currentLetter !== lastCommittedLetterRef.current) {
      setText((prev) => prev + currentLetter);
      lastCommittedLetterRef.current = currentLetter;

      // Reset buffer after commit
      setTimeout(() => {
        resetBuffer();
        lastCommittedLetterRef.current = null;
      }, 500);
    }
  }, [currentLetter, resetBuffer]);

  // Text manipulation
  const handleAddSpace = useCallback(() => {
    setText((prev) => prev + ' ');
    lastCommittedLetterRef.current = null;
  }, []);

  const handleBackspace = useCallback(() => {
    setText((prev) => prev.slice(0, -1));
    lastCommittedLetterRef.current = null;
  }, []);

  const handleClear = useCallback(() => {
    setText('');
    resetBuffer();
    lastCommittedLetterRef.current = null;
  }, [resetBuffer]);

  const handleSpeak = useCallback(() => {
    if (text.trim()) {
      speak(text);
    }
  }, [text, speak]);

  // Load model on mount
  useEffect(() => {
    // TODO: Uncomment when model is ready
    // loadModel().catch((error) => {
    //   console.error('Failed to load model:', error);
    // });
  }, []);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <header className="text-center space-y-4 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold text-gradient animate-glow">
            Türk İşaret Dili Okuyucu
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Kamera ile işaret dili harflerini algılayın, metne dönüştürün ve sesli okutun
          </p>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Camera */}
          <div className="lg:col-span-2 space-y-6 animate-slide-up">
            <CameraView onLandmarksDetected={handleLandmarksDetected} />

            {/* Mobile: Show LiveLetter here */}
            <div className="lg:hidden">
              <LiveLetter letter={currentLetter} confidence={confidence} />
            </div>
          </div>

          {/* Right Column - Controls */}
          <div className="space-y-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            {/* Desktop: Show LiveLetter here */}
            <div className="hidden lg:block">
              <LiveLetter letter={currentLetter} confidence={confidence} />
            </div>

            <TextArea text={text} />

            <Controls
              onAddSpace={handleAddSpace}
              onBackspace={handleBackspace}
              onClear={handleClear}
              onSpeak={handleSpeak}
              onCommitLetter={handleCommitLetter}
              isSpeaking={isSpeaking}
              canSpeak={ttsSupported}
              hasText={text.length > 0}
              currentLetter={currentLetter}
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-white/40 text-sm pt-8 border-t border-white/10">
          <p>
            Türk İşaret Dili Alfabesi Okuyucu • Tarayıcı Tabanlı ML • Gizlilik Odaklı
          </p>
          <p className="mt-2 text-xs">
            Tüm işlemler cihazınızda gerçekleşir, hiçbir veri sunucuya gönderilmez
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
