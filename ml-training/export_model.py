"""
Model Export Script
Exports trained Keras model to TensorFlow.js format
"""

import argparse
import json
from pathlib import Path
import tensorflow as tf
import tensorflowjs as tfjs


def export_model(input_path: Path, output_path: Path):
    """
    Export model to TensorFlow.js format
    """
    print("=" * 60)
    print("Model Export to TensorFlow.js")
    print("=" * 60)
    
    # Load model
    model_path = input_path / 'model.h5'
    if not model_path.exists():
        raise ValueError(f"Model file not found: {model_path}")
    
    print(f"Loading model from {model_path}...")
    model = tf.keras.models.load_model(model_path)
    
    print("\nModel architecture:")
    model.summary()
    
    # Create output directory
    output_path.mkdir(parents=True, exist_ok=True)
    
    # Export to TensorFlow.js
    print(f"\nExporting to TensorFlow.js format...")
    tfjs.converters.save_keras_model(model, str(output_path))
    
    print(f"Model exported to {output_path}")
    
    # Copy metadata and label mapping
    metadata_path = input_path / 'model_metadata.json'
    label_mapping_path = input_path / 'label_mapping.json'
    
    if metadata_path.exists():
        import shutil
        shutil.copy2(metadata_path, output_path / 'model_metadata.json')
        print(f"Metadata copied to {output_path / 'model_metadata.json'}")
    
    if label_mapping_path.exists():
        import shutil
        shutil.copy2(label_mapping_path, output_path / 'label_mapping.json')
        print(f"Label mapping copied to {output_path / 'label_mapping.json'}")
    
    print("\n" + "=" * 60)
    print("Export completed successfully!")
    print(f"TensorFlow.js model saved to: {output_path}")
    print("\nTo use in your web app:")
    print(f"1. Copy the contents of {output_path} to your public/model/ directory")
    print(f"2. Load the model using: tf.loadLayersModel('/model/model.json')")
    print("=" * 60)


def main():
    parser = argparse.ArgumentParser(description='Export model to TensorFlow.js')
    parser.add_argument('--input', type=str, required=True, help='Input directory (trained model)')
    parser.add_argument('--output', type=str, default='../public/model', help='Output directory')
    
    args = parser.parse_args()
    
    input_path = Path(args.input)
    output_path = Path(args.output)
    
    export_model(input_path, output_path)


if __name__ == '__main__':
    main()
