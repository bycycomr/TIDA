# 🎓 Model Eğitim Rehberi - Kaggle Veri Seti

Bu rehber, Kaggle'daki Türk İşaret Dili veri setini kullanarak modeli eğitmeniz için adım adım talimatlar içerir.

## 📋 Gereksinimler

- Python 3.8 veya üzeri
- pip (Python paket yöneticisi)
- En az 4GB RAM
- En az 2GB boş disk alanı
- İnternet bağlantısı (veri seti indirmek için)

## 🚀 Hızlı Başlangıç (Windows)

### Yöntem 1: Otomatik Eğitim (Önerilen)

1. **Kaggle API Kurulumu** (İlk kez yapılacak):
   ```
   a. https://www.kaggle.com/settings/account adresine gidin
   b. "Create New API Token" butonuna tıklayın
   c. İndirilen kaggle.json dosyasını şu konuma kopyalayın:
      C:\Users\KULLANICI_ADINIZ\.kaggle\kaggle.json
   ```

2. **Eğitimi Başlatın**:
   ```bash
   cd ml-training
   train.bat
   ```

3. **Bekleyin**: Eğitim 30-60 dakika sürebilir. Kahve molası verin! ☕

### Yöntem 2: Manuel Adımlar

```bash
# 1. ml-training klasörüne gidin
cd ml-training

# 2. Bağımlılıkları yükleyin
pip install -r requirements.txt

# 3. Eğitimi başlatın
python train_complete.py
```

## 📊 Eğitim Süreci

Script otomatik olarak şu adımları gerçekleştirir:

### 1️⃣ Paket Kurulumu
- kagglehub
- mediapipe
- tensorflow
- opencv-python
- ve diğerleri...

### 2️⃣ Veri Seti İndirme
```
Kaynak: kaggle.com/datasets/berkaykocaoglu/tr-sign-language
```

### 3️⃣ Veri Hazırlama
- Resimleri organize eder
- Her harf için klasör oluşturur
- Metadata dosyası oluşturur

### 4️⃣ Landmark Çıkarma
- MediaPipe Hands kullanır
- Her resimden 21 el landmark'ı çıkarır
- Normalize eder ve CSV'ye kaydeder

### 5️⃣ Model Eğitimi
- MLP (Multi-Layer Perceptron) oluşturur
- 29 sınıf (Türk alfabesi) için eğitir
- Early stopping ile overfitting'i önler
- En iyi modeli kaydeder

### 6️⃣ TensorFlow.js Export
- Keras modelini TF.js formatına dönüştürür
- `../public/model/` klasörüne kopyalar

## 📁 Çıktı Dosyaları

Eğitim tamamlandığında şu dosyalar oluşur:

```
ml-training/
├── processed_data/          # İşlenmiş veri seti
│   ├── A/
│   ├── B/
│   └── ...
├── landmarks.csv            # Çıkarılmış landmark'lar
├── model/                   # Eğitilmiş Keras modeli
│   ├── model.h5
│   ├── model_metadata.json
│   ├── label_mapping.json
│   └── training_history.png
└── ...

public/model/                # TensorFlow.js modeli (web için)
├── model.json
├── group1-shard1of1.bin
├── model_metadata.json
└── label_mapping.json
```

## ✅ Eğitim Sonrası

### 1. Model Kodunu Aktif Edin

`src/App.tsx` dosyasını açın ve şu değişiklikleri yapın:

**Şu satırları bulun:**
```typescript
import { mockPredictLetter } from './ml/predictLetter';
// import { loadModel, predictLetter } from './ml/predictLetter';
```

**Şu şekilde değiştirin:**
```typescript
// import { mockPredictLetter } from './ml/predictLetter';
import { loadModel, predictLetter } from './ml/predictLetter';
```

**useEffect içinde şu satırları bulun:**
```typescript
// TODO: Uncomment when model is ready
// loadModel().catch((error) => {
//   console.error('Failed to load model:', error);
// });
```

**Şu şekilde değiştirin:**
```typescript
loadModel().catch((error) => {
  console.error('Failed to load model:', error);
});
```

**handleLandmarksDetected içinde şu satırları bulun:**
```typescript
// TODO: Replace with actual model prediction when ready
const prediction = mockPredictLetter(landmarks);

if (prediction) {
  addPrediction(prediction.letter, prediction.confidence);
}
```

**Şu şekilde değiştirin:**
```typescript
predictLetter(landmarks).then((prediction) => {
  if (prediction) {
    addPrediction(prediction.letter, prediction.confidence);
  }
});
```

### 2. Development Server'ı Yeniden Başlatın

Terminal'de `Ctrl+C` ile durdurun, ardından:
```bash
npm run dev
```

### 3. Test Edin!

Tarayıcıda `http://localhost:5173` adresini açın ve gerçek model ile test edin!

## 🐛 Sorun Giderme

### Kaggle API Hatası
```
Error: Could not find kaggle.json
```
**Çözüm**: Kaggle API token'ınızı doğru konuma kopyalayın:
```
C:\Users\KULLANICI_ADINIZ\.kaggle\kaggle.json
```

### Bellek Hatası
```
MemoryError: Unable to allocate array
```
**Çözüm**: `train_complete.py` içinde batch_size değerini azaltın:
```python
train_model(landmarks_file, model_dir, epochs=100, batch_size=16)  # 32'den 16'ya
```

### GPU Hatası
```
Could not load dynamic library 'cudart64_110.dll'
```
**Çözüm**: Bu normal, CPU ile eğitim yapılacak. Daha yavaş ama çalışır.

### MediaPipe Hatası
```
No hands detected
```
**Çözüm**: Veri setindeki bazı resimler el içermiyor olabilir. Script bunları otomatik atlar.

## 📈 Model Performansı

Eğitim tamamlandığında şu bilgileri göreceksiniz:

- **Test Accuracy**: Model doğruluğu (örn: %95)
- **Training History**: Grafik olarak kaydedilir
- **Classification Report**: Her harf için detaylı metrikler

## 🎯 İpuçları

1. **Daha İyi Doğruluk İçin**:
   - Epoch sayısını artırın (100 → 150)
   - Daha fazla veri ekleyin
   - Data augmentation kullanın

2. **Daha Hızlı Eğitim İçin**:
   - Batch size'ı artırın (32 → 64)
   - Epoch sayısını azaltın (100 → 50)
   - GPU kullanın (CUDA kurulumu gerekir)

3. **Overfitting'i Önlemek İçin**:
   - Dropout oranını artırın
   - Early stopping patience değerini ayarlayın
   - Validation split oranını artırın

## 📞 Yardım

Sorun yaşarsanız:
1. Hata mesajını tam olarak okuyun
2. `ml-training/` klasöründeki log dosyalarını kontrol edin
3. GitHub'da issue açın

## 🎉 Başarılar!

Model eğitimi tamamlandığında, gerçek zamanlı Türk İşaret Dili tanıma sisteminiz hazır olacak!

---

**Not**: İlk eğitim en uzun sürer. Sonraki eğitimlerde veri seti zaten indirilmiş olacağı için daha hızlı olur.
