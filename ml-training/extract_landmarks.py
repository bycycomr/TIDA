"""
Landmark Extraction Script
Extracts hand landmarks from images/videos using MediaPipe
"""

import os
import argparse
import json
import cv2
import numpy as np
import pandas as pd
from pathlib import Path
from typing import List, Tuple, Optional
import mediapipe as mp

# Initialize MediaPipe Hands
mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils


def extract_landmarks_from_image(image_path: Path, hands) -> Optional[np.ndarray]:
    """
    Extract hand landmarks from a single image
    
    Returns:
        Numpy array of shape (63,) containing flattened landmarks, or None if no hand detected
    """
    # Read image
    image = cv2.imread(str(image_path))
    if image is None:
        print(f"Warning: Could not read image {image_path}")
        return None
    
    # Convert to RGB
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    
    # Process with MediaPipe
    results = hands.process(image_rgb)
    
    if not results.multi_hand_landmarks:
        return None
    
    # Get first hand
    hand_landmarks = results.multi_hand_landmarks[0]
    
    # Extract and flatten landmarks
    landmarks = []
    for landmark in hand_landmarks.landmark:
        landmarks.extend([landmark.x, landmark.y, landmark.z])
    
    return np.array(landmarks)


def extract_landmarks_from_video(video_path: Path, hands, max_frames: int = 100) -> List[np.ndarray]:
    """
    Extract hand landmarks from video frames
    
    Returns:
        List of landmark arrays
    """
    cap = cv2.VideoCapture(str(video_path))
    landmarks_list = []
    
    frame_count = 0
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
    # Sample frames evenly
    frame_interval = max(1, total_frames // max_frames)
    
    while cap.isOpened() and frame_count < max_frames:
        ret, frame = cap.read()
        if not ret:
            break
        
        # Skip frames based on interval
        if int(cap.get(cv2.CAP_PROP_POS_FRAMES)) % frame_interval != 0:
            continue
        
        # Convert to RGB
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Process with MediaPipe
        results = hands.process(frame_rgb)
        
        if results.multi_hand_landmarks:
            hand_landmarks = results.multi_hand_landmarks[0]
            
            # Extract and flatten landmarks
            landmarks = []
            for landmark in hand_landmarks.landmark:
                landmarks.extend([landmark.x, landmark.y, landmark.z])
            
            landmarks_list.append(np.array(landmarks))
            frame_count += 1
    
    cap.release()
    return landmarks_list


def normalize_landmarks(landmarks: np.ndarray) -> np.ndarray:
    """
    Normalize landmarks relative to wrist (landmark 0)
    """
    # Reshape to (21, 3)
    landmarks_reshaped = landmarks.reshape(21, 3)
    
    # Get wrist position
    wrist = landmarks_reshaped[0]
    
    # Normalize relative to wrist
    normalized = landmarks_reshaped - wrist
    
    # Flatten back
    return normalized.flatten()


def extract_landmarks(input_path: Path, output_path: Path, max_frames_per_video: int = 100):
    """
    Extract landmarks from all files in the dataset
    """
    print("=" * 60)
    print("Landmark Extraction")
    print("=" * 60)
    
    # Load metadata
    metadata_path = input_path / 'metadata.json'
    if not metadata_path.exists():
        raise ValueError(f"Metadata file not found: {metadata_path}")
    
    with open(metadata_path, 'r', encoding='utf-8') as f:
        metadata = json.load(f)
    
    # Initialize MediaPipe Hands
    hands = mp_hands.Hands(
        static_image_mode=True,
        max_num_hands=1,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5
    )
    
    # Prepare data storage
    all_landmarks = []
    all_labels = []
    
    # Process each label
    for label, files in metadata['dataset'].items():
        print(f"\nProcessing label: {label}")
        
        for file_rel_path in files:
            file_path = input_path / file_rel_path
            
            if not file_path.exists():
                print(f"Warning: File not found: {file_path}")
                continue
            
            # Check file type
            if file_path.suffix.lower() in ['.jpg', '.jpeg', '.png', '.bmp', '.webp']:
                # Image file
                landmarks = extract_landmarks_from_image(file_path, hands)
                if landmarks is not None:
                    normalized = normalize_landmarks(landmarks)
                    all_landmarks.append(normalized)
                    all_labels.append(label)
            
            elif file_path.suffix.lower() in ['.mp4', '.avi', '.mov', '.mkv']:
                # Video file
                landmarks_list = extract_landmarks_from_video(file_path, hands, max_frames_per_video)
                for landmarks in landmarks_list:
                    normalized = normalize_landmarks(landmarks)
                    all_landmarks.append(normalized)
                    all_labels.append(label)
        
        print(f"Extracted {sum(1 for l in all_labels if l == label)} samples for '{label}'")
    
    hands.close()
    
    # Convert to DataFrame
    landmark_columns = [f'{axis}{i}' for i in range(21) for axis in ['x', 'y', 'z']]
    df = pd.DataFrame(all_landmarks, columns=landmark_columns)
    df.insert(0, 'label', all_labels)
    
    # Save to CSV
    output_path.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(output_path, index=False)
    
    print("\n" + "=" * 60)
    print(f"Landmark extraction completed!")
    print(f"Total samples: {len(df)}")
    print(f"Output saved to: {output_path}")
    print("=" * 60)
    
    # Print class distribution
    print("\nClass distribution:")
    print(df['label'].value_counts().sort_index())


def main():
    parser = argparse.ArgumentParser(description='Extract hand landmarks from TSL dataset')
    parser.add_argument('--input', type=str, required=True, help='Input directory (processed dataset)')
    parser.add_argument('--output', type=str, default='./landmarks.csv', help='Output CSV file')
    parser.add_argument('--max-frames', type=int, default=100, help='Max frames per video')
    
    args = parser.parse_args()
    
    input_path = Path(args.input)
    output_path = Path(args.output)
    
    extract_landmarks(input_path, output_path, args.max_frames)


if __name__ == '__main__':
    main()
