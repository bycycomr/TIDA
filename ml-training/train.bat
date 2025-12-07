@echo off
echo ======================================================================
echo TURK ISARET DILI MODEL EGITIM PIPELINE'I
echo ======================================================================
echo.

cd /d "%~dp0"

echo [1/5] Python kurulumu kontrol ediliyor...
python --version
if errorlevel 1 (
    echo HATA: Python bulunamadi! Lutfen Python 3.8+ yukleyin.
    pause
    exit /b 1
)
echo.

echo [2/5] Gerekli paketler yukleniyor...
pip install -r requirements.txt
if errorlevel 1 (
    echo HATA: Paket yukleme basarisiz!
    pause
    exit /b 1
)
echo.

echo [3/5] Kaggle veri seti indiriliyor ve egitim baslatiliyor...
echo NOT: Bu islem uzun surebilir (30-60 dakika)
echo.
python train_complete.py
if errorlevel 1 (
    echo HATA: Egitim basarisiz!
    pause
    exit /b 1
)

echo.
echo ======================================================================
echo BASARILI! Model egitimi tamamlandi.
echo ======================================================================
echo.
echo Model konumu: ..\public\model
echo.
echo Sonraki adimlar:
echo 1. src\App.tsx dosyasindaki gercek model kodunu aktif edin
echo 2. Development server'i yeniden baslatin
echo 3. Tarayicida http://localhost:5173 adresini acin
echo.
pause
