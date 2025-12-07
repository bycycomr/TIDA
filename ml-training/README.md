# Turkish Sign Language (TSL) Alphabet Reader - ML Training Pipeline

This directory contains the offline training pipeline for the TSL alphabet recognition model.

## Directory Structure

```
ml-training/
├── prepare_dataset.py      # Load and organize dataset
├── extract_landmarks.py    # Extract hand landmarks using MediaPipe
├── train_model.py          # Train MLP classifier
├── export_model.py         # Export to TensorFlow.js format
├── requirements.txt        # Python dependencies
└── README.md              # This file
```

## Prerequisites

- Python 3.8+
- pip

## Installation

```bash
pip install -r requirements.txt
```

## Dataset Format

The training pipeline expects one of the following dataset formats:

### Option 1: Image Folders
```
dataset/
├── A/
│   ├── img001.jpg
│   ├── img002.jpg
│   └── ...
├── B/
│   ├── img001.jpg
│   └── ...
└── ...
```

### Option 2: Video Files
```
dataset/
├── A.mp4
├── B.mp4
└── ...
```

### Option 3: Pre-extracted Landmarks (CSV)
```
landmarks.csv
```
With columns: `label, x0, y0, z0, x1, y1, z1, ..., x20, y20, z20`

## Usage

### Step 1: Prepare Dataset

```bash
python prepare_dataset.py --input /path/to/dataset --output ./processed_data
```

### Step 2: Extract Landmarks

```bash
python extract_landmarks.py --input ./processed_data --output ./landmarks.csv
```

### Step 3: Train Model

```bash
python train_model.py --input ./landmarks.csv --output ./model
```

### Step 4: Export to TensorFlow.js

```bash
python export_model.py --input ./model --output ../public/model
```

## Model Architecture

The model is a simple Multi-Layer Perceptron (MLP):
- Input: 63 features (21 landmarks × 3 coordinates)
- Hidden layers: 2-3 dense layers with ReLU activation
- Output: 29 classes (Turkish alphabet)
- Activation: Softmax

## Turkish Sign Language Alphabet

The model recognizes 29 letters:
A, B, C, Ç, D, E, F, G, Ğ, H, I, İ, J, K, L, M, N, O, Ö, P, R, S, Ş, T, U, Ü, V, Y, Z

## Notes

- The pipeline uses MediaPipe Hands for landmark extraction
- Landmarks are normalized relative to the wrist (landmark 0)
- The model assumes static hand poses (not dynamic gestures)
- For best results, ensure good lighting and clear hand visibility in training data
