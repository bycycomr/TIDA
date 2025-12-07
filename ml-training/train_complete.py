"""
Complete Training Pipeline with Kaggle Dataset
Downloads TR Sign Language dataset and trains the model
"""

import os
import sys
from pathlib import Path

print("=" * 70)
print("TÜRK İŞARET DİLİ MODEL EĞİTİM PİPELINE'I")
print("=" * 70)

# Step 1: Install required packages
print("\n[1/6] Gerekli paketler yükleniyor...")
print("-" * 70)

required_packages = [
    'kagglehub',
    'mediapipe==0.10.9',
    'opencv-python==4.8.1.78',
    'numpy==1.24.3',
    'pandas==2.0.3',
    'tensorflow==2.15.0',
    'tensorflowjs==4.14.0',
    'scikit-learn==1.3.2',
    'matplotlib==3.8.2',
    'Pillow==10.1.0'
]

import subprocess

for package in required_packages:
    try:
        if '==' in package:
            pkg_name = package.split('==')[0]
        else:
            pkg_name = package
        __import__(pkg_name.replace('-', '_'))
        print(f"✓ {package} zaten yüklü")
    except ImportError:
        print(f"⚙ {package} yükleniyor...")
        subprocess.check_call([sys.executable, '-m', 'pip', 'install', package, '-q'])
        print(f"✓ {package} yüklendi")

# Step 2: Download dataset
print("\n[2/6] Kaggle veri seti indiriliyor...")
print("-" * 70)

import kagglehub

try:
    path = kagglehub.dataset_download("berkaykocaoglu/tr-sign-language")
    print(f"✓ Veri seti indirildi: {path}")
except Exception as e:
    print(f"✗ Veri seti indirme hatası: {e}")
    print("\nKaggle kimlik doğrulaması gerekebilir:")
    print("1. https://www.kaggle.com/settings/account adresinden API token oluşturun")
    print("2. kaggle.json dosyasını ~/.kaggle/ klasörüne kopyalayın")
    sys.exit(1)

dataset_path = Path(path)
print(f"Veri seti konumu: {dataset_path}")

# Step 3: Prepare dataset
print("\n[3/6] Veri seti hazırlanıyor...")
print("-" * 70)

from prepare_dataset import prepare_dataset

output_dir = Path("./processed_data")
try:
    prepare_dataset(dataset_path, output_dir)
    print("✓ Veri seti hazırlandı")
except Exception as e:
    print(f"✗ Veri seti hazırlama hatası: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Step 4: Extract landmarks
print("\n[4/6] Hand landmark'lar çıkarılıyor...")
print("-" * 70)

from extract_landmarks import extract_landmarks

landmarks_file = Path("./landmarks.csv")
try:
    extract_landmarks(output_dir, landmarks_file, max_frames_per_video=100)
    print("✓ Landmark'lar çıkarıldı")
except Exception as e:
    print(f"✗ Landmark çıkarma hatası: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Step 5: Train model
print("\n[5/6] Model eğitiliyor...")
print("-" * 70)

from train_model import train_model

model_dir = Path("./model")
try:
    train_model(landmarks_file, model_dir, epochs=100, batch_size=32)
    print("✓ Model eğitildi")
except Exception as e:
    print(f"✗ Model eğitme hatası: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Step 6: Export to TensorFlow.js
print("\n[6/6] Model TensorFlow.js formatına dönüştürülüyor...")
print("-" * 70)

from export_model import export_model

tfjs_output = Path("../public/model")
try:
    export_model(model_dir, tfjs_output)
    print("✓ Model export edildi")
except Exception as e:
    print(f"✗ Model export hatası: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Success!
print("\n" + "=" * 70)
print("✅ EĞİTİM TAMAMLANDI!")
print("=" * 70)
print(f"\n📊 Model konumu: {tfjs_output}")
print(f"📁 Landmark verisi: {landmarks_file}")
print(f"🎯 Eğitim klasörü: {model_dir}")
print("\n🚀 Sonraki adımlar:")
print("1. src/App.tsx dosyasındaki gerçek model kodunu aktif edin")
print("2. Development server'ı yeniden başlatın: npm run dev")
print("3. Tarayıcıda http://localhost:5173 adresini açın")
print("\n" + "=" * 70)
