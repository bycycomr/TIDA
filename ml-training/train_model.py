"""
Model Training Script
Trains an MLP classifier for Turkish Sign Language recognition
"""

import argparse
import numpy as np
import pandas as pd
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, confusion_matrix
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
import matplotlib.pyplot as plt
import json

# Turkish alphabet
TSL_ALPHABET = [
    'A', 'B', 'C', 'Ç', 'D', 'E', 'F', 'G', 'Ğ', 'H',
    'I', 'İ', 'J', 'K', 'L', 'M', 'N', 'O', 'Ö', 'P',
    'R', 'S', 'Ş', 'T', 'U', 'Ü', 'V', 'Y', 'Z'
]


def load_data(csv_path: Path):
    """
    Load landmarks from CSV
    """
    print("Loading data...")
    df = pd.read_csv(csv_path)
    
    # Separate features and labels
    X = df.drop('label', axis=1).values
    y = df['label'].values
    
    print(f"Loaded {len(X)} samples with {X.shape[1]} features")
    print(f"Classes: {sorted(set(y))}")
    
    return X, y


def create_model(input_shape: int, num_classes: int):
    """
    Create MLP model
    """
    model = keras.Sequential([
        layers.Input(shape=(input_shape,)),
        
        # First hidden layer
        layers.Dense(256, activation='relu'),
        layers.BatchNormalization(),
        layers.Dropout(0.3),
        
        # Second hidden layer
        layers.Dense(128, activation='relu'),
        layers.BatchNormalization(),
        layers.Dropout(0.3),
        
        # Third hidden layer
        layers.Dense(64, activation='relu'),
        layers.BatchNormalization(),
        layers.Dropout(0.2),
        
        # Output layer
        layers.Dense(num_classes, activation='softmax')
    ])
    
    return model


def plot_training_history(history, output_dir: Path):
    """
    Plot training history
    """
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 4))
    
    # Accuracy
    ax1.plot(history.history['accuracy'], label='Train')
    ax1.plot(history.history['val_accuracy'], label='Validation')
    ax1.set_title('Model Accuracy')
    ax1.set_xlabel('Epoch')
    ax1.set_ylabel('Accuracy')
    ax1.legend()
    ax1.grid(True)
    
    # Loss
    ax2.plot(history.history['loss'], label='Train')
    ax2.plot(history.history['val_loss'], label='Validation')
    ax2.set_title('Model Loss')
    ax2.set_xlabel('Epoch')
    ax2.set_ylabel('Loss')
    ax2.legend()
    ax2.grid(True)
    
    plt.tight_layout()
    plt.savefig(output_dir / 'training_history.png', dpi=150)
    print(f"Training history plot saved to {output_dir / 'training_history.png'}")


def train_model(input_path: Path, output_path: Path, epochs: int = 100, batch_size: int = 32):
    """
    Train the model
    """
    print("=" * 60)
    print("Model Training")
    print("=" * 60)
    
    # Load data
    X, y = load_data(input_path)
    
    # Encode labels
    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(y)
    num_classes = len(label_encoder.classes_)
    
    print(f"\nNumber of classes: {num_classes}")
    print(f"Classes: {label_encoder.classes_}")
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
    )
    
    print(f"\nTraining samples: {len(X_train)}")
    print(f"Testing samples: {len(X_test)}")
    
    # Create model
    model = create_model(X.shape[1], num_classes)
    
    # Compile model
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=0.001),
        loss='sparse_categorical_crossentropy',
        metrics=['accuracy']
    )
    
    print("\nModel architecture:")
    model.summary()
    
    # Callbacks
    callbacks = [
        keras.callbacks.EarlyStopping(
            monitor='val_loss',
            patience=15,
            restore_best_weights=True
        ),
        keras.callbacks.ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=5,
            min_lr=1e-6
        )
    ]
    
    # Train model
    print("\nTraining model...")
    history = model.fit(
        X_train, y_train,
        validation_data=(X_test, y_test),
        epochs=epochs,
        batch_size=batch_size,
        callbacks=callbacks,
        verbose=1
    )
    
    # Evaluate model
    print("\nEvaluating model...")
    test_loss, test_accuracy = model.evaluate(X_test, y_test, verbose=0)
    print(f"Test accuracy: {test_accuracy:.4f}")
    print(f"Test loss: {test_loss:.4f}")
    
    # Predictions
    y_pred = np.argmax(model.predict(X_test), axis=1)
    
    # Classification report
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=label_encoder.classes_))
    
    # Save model
    output_path.mkdir(parents=True, exist_ok=True)
    model_path = output_path / 'model.h5'
    model.save(model_path)
    print(f"\nModel saved to {model_path}")
    
    # Save label encoder
    label_mapping = {i: label for i, label in enumerate(label_encoder.classes_)}
    with open(output_path / 'label_mapping.json', 'w', encoding='utf-8') as f:
        json.dump(label_mapping, f, indent=2, ensure_ascii=False)
    
    # Save training history
    plot_training_history(history, output_path)
    
    # Save metadata
    metadata = {
        'num_classes': num_classes,
        'classes': label_encoder.classes_.tolist(),
        'input_shape': X.shape[1],
        'test_accuracy': float(test_accuracy),
        'test_loss': float(test_loss),
        'epochs_trained': len(history.history['loss']),
        'total_samples': len(X),
        'train_samples': len(X_train),
        'test_samples': len(X_test)
    }
    
    with open(output_path / 'model_metadata.json', 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)
    
    print("\n" + "=" * 60)
    print("Training completed successfully!")
    print(f"Model saved to: {output_path}")
    print("=" * 60)


def main():
    parser = argparse.ArgumentParser(description='Train TSL recognition model')
    parser.add_argument('--input', type=str, required=True, help='Input CSV file (landmarks)')
    parser.add_argument('--output', type=str, default='./model', help='Output directory')
    parser.add_argument('--epochs', type=int, default=100, help='Number of epochs')
    parser.add_argument('--batch-size', type=int, default=32, help='Batch size')
    
    args = parser.parse_args()
    
    input_path = Path(args.input)
    output_path = Path(args.output)
    
    train_model(input_path, output_path, args.epochs, args.batch_size)


if __name__ == '__main__':
    main()
