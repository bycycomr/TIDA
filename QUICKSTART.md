# 🚀 Quick Start Guide - Türk İşaret Dili Okuyucu

## Hızlı Başlangıç (Türkçe)

### 1. Uygulamayı Çalıştırma

Uygulama şu anda **geliştirme modunda** çalışıyor:

```
http://localhost:5173
```

Tarayıcınızda bu adresi açın.

### 2. İlk Kullanım

1. **Kamera İzni**: Tarayıcı kamera izni isteyecek - "İzin Ver" seçeneğini seçin
2. **El Tespiti**: Elinizi kamera önünde tutun
3. **Harf Gösterme**: Türk İşaret Dili alfabesinden bir harf gösterin
4. **Tahmin**: Uygulama harfi algılayacak ve ekranda gösterecek
5. **Ekleme**: "Harfi Ekle" butonuna tıklayarak metne ekleyin

### 3. Kontroller

- **Harfi Ekle**: Algılanan harfi metne ekler
- **Boşluk**: Metne boşluk ekler
- **Sil**: Son karakteri siler
- **Tümünü Temizle**: Tüm metni temizler
- **Metni Oku**: Metni Türkçe sesli okur

### 4. Önemli Notlar

⚠️ **Şu anda mock (sahte) tahminler kullanılıyor!**

Gerçek model için:
1. Veri setinizi hazırlayın
2. `ml-training/` klasöründeki eğitim pipeline'ını çalıştırın
3. Modeli export edin
4. `src/App.tsx` dosyasındaki gerçek model kodunu aktif edin

---

## Quick Start (English)

### 1. Running the Application

The application is currently running in **development mode**:

```
http://localhost:5173
```

Open this address in your browser.

### 2. First Use

1. **Camera Permission**: Browser will request camera access - click "Allow"
2. **Hand Detection**: Hold your hand in front of the camera
3. **Show Letter**: Display a letter from the Turkish Sign Language alphabet
4. **Prediction**: App will detect and display the letter
5. **Add**: Click "Harfi Ekle" (Add Letter) to add to text

### 3. Controls

- **Harfi Ekle** (Add Letter): Adds detected letter to text
- **Boşluk** (Space): Adds space to text
- **Sil** (Delete): Removes last character
- **Tümünü Temizle** (Clear All): Clears all text
- **Metni Oku** (Read Text): Reads text aloud in Turkish

### 4. Important Notes

⚠️ **Currently using mock predictions!**

For real model:
1. Prepare your dataset
2. Run the training pipeline in `ml-training/`
3. Export the model
4. Activate real model code in `src/App.tsx`

---

## Dataset Hazırlama (Preparing Dataset)

### Veri Seti Formatı (Dataset Format)

Veri setinizi şu formatlardan birinde hazırlayın:

**Seçenek 1: Klasörler halinde resimler**
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

**Seçenek 2: Video dosyaları**
```
dataset/
├── A.mp4
├── B.mp4
└── ...
```

### Eğitim Adımları (Training Steps)

```bash
# 1. Python bağımlılıklarını yükle
cd ml-training
pip install -r requirements.txt

# 2. Veri setini hazırla
python prepare_dataset.py --input /path/to/dataset --output ./processed_data

# 3. Landmark'ları çıkar
python extract_landmarks.py --input ./processed_data --output ./landmarks.csv

# 4. Modeli eğit
python train_model.py --input ./landmarks.csv --output ./model

# 5. TensorFlow.js formatına export et
python export_model.py --input ./model --output ../public/model
```

### Gerçek Modeli Aktif Etme (Activating Real Model)

`src/App.tsx` dosyasında şu satırların yorumunu kaldırın:

```typescript
// Şu satırları aktif edin:
import { loadModel, predictLetter } from './ml/predictLetter';

// useEffect içinde:
loadModel().catch((error) => {
  console.error('Failed to load model:', error);
});

// handleLandmarksDetected içinde:
predictLetter(landmarks).then((prediction) => {
  if (prediction) {
    addPrediction(prediction.letter, prediction.confidence);
  }
});
```

---

## Sorun Giderme (Troubleshooting)

### Kamera Çalışmıyor
- Tarayıcı izinlerini kontrol edin
- HTTPS kullanın (bazı tarayıcılarda gerekli)
- Başka bir uygulama kamerayı kullanıyor olabilir

### El Algılanmıyor
- Işıklandırmanın iyi olduğundan emin olun
- Elinizi kamera çerçevesinde net tutun
- Kameradan uzaklığı ayarlayın

### Ses Çıkmıyor
- Tarayıcı uyumluluğunu kontrol edin (Chrome/Edge önerilir)
- Sistem ses ayarlarını kontrol edin
- Türkçe dil paketi yüklü olmalı

---

## İletişim (Contact)

Sorularınız için GitHub'da issue açabilirsiniz.

**Başarılar! 🎉**
