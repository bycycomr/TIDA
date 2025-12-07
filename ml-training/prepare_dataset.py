"""
Dataset Preparation Script
Organizes and validates the Turkish Sign Language dataset
"""

import os
import argparse
import shutil
from pathlib import Path
from typing import List, Dict
import json

# Turkish alphabet
TSL_ALPHABET = [
    'A', 'B', 'C', 'Ç', 'D', 'E', 'F', 'G', 'Ğ', 'H',
    'I', 'İ', 'J', 'K', 'L', 'M', 'N', 'O', 'Ö', 'P',
    'R', 'S', 'Ş', 'T', 'U', 'Ü', 'V', 'Y', 'Z'
]

SUPPORTED_IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.bmp', '.webp'}
SUPPORTED_VIDEO_EXTENSIONS = {'.mp4', '.avi', '.mov', '.mkv'}


def validate_dataset_structure(input_path: Path) -> Dict[str, List[Path]]:
    """
    Validate and categorize dataset files
    
    Returns:
        Dictionary mapping labels to file paths
    """
    dataset = {}
    
    if not input_path.exists():
        raise ValueError(f"Input path does not exist: {input_path}")
    
    # Check if it's a folder-based dataset
    if input_path.is_dir():
        for item in input_path.iterdir():
            if item.is_dir() and item.name in TSL_ALPHABET:
                # Folder-based dataset (e.g., A/, B/, ...)
                label = item.name
                files = []
                
                for file in item.iterdir():
                    if file.suffix.lower() in SUPPORTED_IMAGE_EXTENSIONS:
                        files.append(file)
                    elif file.suffix.lower() in SUPPORTED_VIDEO_EXTENSIONS:
                        files.append(file)
                
                if files:
                    dataset[label] = files
                    print(f"Found {len(files)} files for label '{label}'")
            
            elif item.is_file():
                # Video files named by letter (e.g., A.mp4, B.mp4)
                label = item.stem.upper()
                if label in TSL_ALPHABET and item.suffix.lower() in SUPPORTED_VIDEO_EXTENSIONS:
                    dataset[label] = [item]
                    print(f"Found video file for label '{label}'")
    
    if not dataset:
        raise ValueError("No valid dataset found. Please check the input path and format.")
    
    return dataset


def prepare_dataset(input_path: Path, output_path: Path):
    """
    Prepare and organize dataset
    """
    print("=" * 60)
    print("Turkish Sign Language Dataset Preparation")
    print("=" * 60)
    
    # Validate input
    dataset = validate_dataset_structure(input_path)
    
    # Create output directory
    output_path.mkdir(parents=True, exist_ok=True)
    
    # Copy and organize files
    organized_dataset = {}
    
    for label, files in dataset.items():
        label_dir = output_path / label
        label_dir.mkdir(exist_ok=True)
        
        organized_files = []
        
        for i, file in enumerate(files):
            # Copy file with standardized naming
            new_name = f"{label}_{i:04d}{file.suffix}"
            dest = label_dir / new_name
            
            shutil.copy2(file, dest)
            organized_files.append(str(dest.relative_to(output_path)))
        
        organized_dataset[label] = organized_files
        print(f"Organized {len(organized_files)} files for '{label}'")
    
    # Save metadata
    metadata = {
        'alphabet': TSL_ALPHABET,
        'num_classes': len(organized_dataset),
        'dataset': organized_dataset,
        'total_files': sum(len(files) for files in organized_dataset.values())
    }
    
    metadata_path = output_path / 'metadata.json'
    with open(metadata_path, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)
    
    print("\n" + "=" * 60)
    print(f"Dataset prepared successfully!")
    print(f"Total classes: {metadata['num_classes']}")
    print(f"Total files: {metadata['total_files']}")
    print(f"Output directory: {output_path}")
    print(f"Metadata saved to: {metadata_path}")
    print("=" * 60)


def main():
    parser = argparse.ArgumentParser(description='Prepare TSL dataset')
    parser.add_argument('--input', type=str, required=True, help='Input dataset path')
    parser.add_argument('--output', type=str, default='./processed_data', help='Output directory')
    
    args = parser.parse_args()
    
    input_path = Path(args.input)
    output_path = Path(args.output)
    
    prepare_dataset(input_path, output_path)


if __name__ == '__main__':
    main()
