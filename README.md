# 🤟 Türk İşaret Dili Okuyucu (Turkish Sign Language Reader)

A browser-based, privacy-focused Turkish Sign Language (TSL) alphabet reader that uses your webcam and on-device machine learning to recognize sign language letters in real-time.

![TSL Reader](https://img.shields.io/badge/Status-MVP-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-Latest-orange)

## ✨ Features

- 📹 **Real-time Hand Tracking**: Uses MediaPipe Hands for accurate hand landmark detection
- 🧠 **On-Device ML**: All processing happens in your browser - no data sent to servers
- 🔤 **29 Turkish Letters**: Recognizes the complete Turkish alphabet (A-Z including Ç, Ğ, İ, Ö, Ş, Ü)
- 🗣️ **Text-to-Speech**: Converts recognized text to speech in Turkish
- 📱 **Mobile-Friendly**: Responsive design works on desktop and mobile devices
- 🎨 **Premium UI**: Modern glassmorphism design with smooth animations
- 🔒 **Privacy-First**: No external servers, all processing is local

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Modern web browser with webcam support
- Python 3.8+ (for training the ML model)

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd TİDA
```

2. **Install dependencies**
```bash
npm install
```

3. **Run development server**
```bash
npm run dev
```

4. **Open in browser**
Navigate to `http://localhost:5173`

## 🧪 Using the Application

1. **Grant Camera Permission**: Allow the browser to access your webcam
2. **Show Hand Signs**: Position your hand in front of the camera
3. **See Predictions**: The app will detect and display the recognized letter
4. **Commit Letters**: Click "Harfi Ekle" to add the letter to your text
5. **Build Text**: Use controls to add spaces, delete, or clear text
6. **Listen**: Click "Metni Oku" to hear the text spoken in Turkish

## 🤖 Training Your Own Model

The application currently uses mock predictions for demonstration. To train a real model:

### Step 1: Prepare Your Dataset

Organize your Turkish Sign Language dataset in one of these formats:

**Option A: Image Folders**
```
dataset/
├── A/
│   ├── img001.jpg
│   ├── img002.jpg
│   └── ...
├── B/
│   └── ...
└── ...
```

**Option B: Video Files**
```
dataset/
├── A.mp4
├── B.mp4
└── ...
```

### Step 2: Install Python Dependencies

```bash
cd ml-training
pip install -r requirements.txt
```

### Step 3: Run Training Pipeline

```bash
# 1. Prepare dataset
python prepare_dataset.py --input /path/to/your/dataset --output ./processed_data

# 2. Extract landmarks
python extract_landmarks.py --input ./processed_data --output ./landmarks.csv

# 3. Train model
python train_model.py --input ./landmarks.csv --output ./model

# 4. Export to TensorFlow.js
python export_model.py --input ./model --output ../public/model
```

### Step 4: Update Frontend Code

In `src/App.tsx`, uncomment the real model loading code:

```typescript
// Uncomment these lines:
import { loadModel, predictLetter } from './ml/predictLetter';

// In useEffect:
loadModel().catch((error) => {
  console.error('Failed to load model:', error);
});

// In handleLandmarksDetected:
predictLetter(landmarks).then((prediction) => {
  if (prediction) {
    addPrediction(prediction.letter, prediction.confidence);
  }
});
```

## 📁 Project Structure

```
TİDA/
├── src/
│   ├── components/          # React components
│   │   ├── CameraView.tsx   # Webcam + hand tracking
│   │   ├── LiveLetter.tsx   # Current letter display
│   │   ├── TextArea.tsx     # Text output
│   │   └── Controls.tsx     # Control buttons
│   ├── hooks/               # Custom React hooks
│   │   ├── useWebcam.ts     # Webcam access
│   │   ├── useHandTracking.ts # MediaPipe integration
│   │   ├── useLetterBuffer.ts # Prediction smoothing
│   │   └── useTTS.ts        # Text-to-speech
│   ├── ml/                  # ML utilities
│   │   ├── modelLoader.ts   # TensorFlow.js model loader
│   │   └── predictLetter.ts # Prediction logic
│   ├── App.tsx              # Main application
│   └── index.css            # Styles
├── ml-training/             # Python training pipeline
│   ├── prepare_dataset.py   # Dataset preparation
│   ├── extract_landmarks.py # Landmark extraction
│   ├── train_model.py       # Model training
│   ├── export_model.py      # TF.js export
│   └── requirements.txt     # Python dependencies
├── public/
│   └── model/               # Trained model (after export)
└── README.md
```

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **MediaPipe Hands** for hand tracking
- **TensorFlow.js** for ML inference
- **Web Speech API** for TTS

### ML Pipeline
- **Python 3.8+**
- **MediaPipe** for landmark extraction
- **TensorFlow/Keras** for model training
- **TensorFlow.js Converter** for web deployment

## 🎯 Model Architecture

- **Input**: 63 features (21 hand landmarks × 3 coordinates)
- **Architecture**: Multi-Layer Perceptron (MLP)
  - Dense layer (256 units, ReLU)
  - Dense layer (128 units, ReLU)
  - Dense layer (64 units, ReLU)
  - Output layer (29 units, Softmax)
- **Output**: 29 classes (Turkish alphabet)

## 📊 Turkish Sign Language Alphabet

The model recognizes all 29 letters of the Turkish alphabet:

```
A, B, C, Ç, D, E, F, G, Ğ, H, I, İ, J, K, L, M, N, O, Ö, P, R, S, Ş, T, U, Ü, V, Y, Z
```

## 🔧 Configuration

### Prediction Settings

Adjust prediction sensitivity in `src/hooks/useLetterBuffer.ts`:

```typescript
const { currentLetter, confidence, addPrediction } = useLetterBuffer(
  10,    // windowSize: Number of predictions to buffer
  0.6,   // minConfidence: Minimum confidence threshold
  0.7    // consistencyThreshold: Required consistency ratio
);
```

### MediaPipe Settings

Adjust hand detection in `src/hooks/useHandTracking.ts`:

```typescript
const handLandmarker = await HandLandmarker.createFromOptions(vision, {
  numHands: 1,                        // Number of hands to detect
  minHandDetectionConfidence: 0.5,    // Detection threshold
  minHandPresenceConfidence: 0.5,     // Presence threshold
  minTrackingConfidence: 0.5,         // Tracking threshold
});
```

## 🐛 Troubleshooting

### Camera Not Working
- Ensure browser has camera permissions
- Try using HTTPS (required for camera access on some browsers)
- Check if another application is using the camera

### Hand Not Detected
- Ensure good lighting
- Keep hand clearly visible in frame
- Try adjusting distance from camera

### TTS Not Working
- Check browser compatibility (Chrome/Edge recommended)
- Ensure Turkish language pack is installed on your system
- Try selecting a different voice in browser settings

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [MediaPipe](https://mediapipe.dev/) for hand tracking
- [TensorFlow.js](https://www.tensorflow.org/js) for browser ML
- Turkish Sign Language community

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

**Note**: This is an MVP (Minimum Viable Product). The mock prediction will be replaced with a real trained model once you provide your dataset and complete the training pipeline.
