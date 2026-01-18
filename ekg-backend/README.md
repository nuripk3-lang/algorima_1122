# 🏥 Profesyonel EKG Analiz Backend

NeuroKit2 + OpenCV + Flask ile profesyonel EKG ritim tanıma sistemi.

## 🚀 Kurulum

### 1. Python Ortamı Hazırlama
```bash
# Python 3.8+ gerekli
python --version

# Virtual environment oluştur
python -m venv ekg-env

# Aktif et (Windows)
ekg-env\Scripts\activate

# Aktif et (Linux/Mac)
source ekg-env/bin/activate
```

### 2. Gerekli Paketleri Yükle
```bash
cd ekg-backend
pip install -r requirements.txt
```

### 3. Servisi Başlat
```bash
python app.py
```

Servis `http://localhost:5000` adresinde çalışacak.

## 📊 API Endpoints

### POST /analyze-ekg
EKG görüntüsü analiz eder.

**Request:**
```json
{
    "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
}
```

**Response:**
```json
{
    "rhythm": "Atriyal Fibrilasyon",
    "heart_rate": 95,
    "confidence": 87,
    "description": "Düzensiz R-R intervalleri...",
    "treatment": "Antikoagülasyon değerlendir...",
    "urgency": "warning",
    "details": {
        "rr_variability": 23.4,
        "qrs_width": 95,
        "p_waves": "Yok"
    }
}
```

### GET /health
Sistem sağlık kontrolü.

## 🔬 Analiz Süreci

1. **Görüntü Ön İşleme**: HSV renk uzayında filtreleme
2. **Sinyal Çıkarımı**: Piksel koordinatlarından 1D sinyal elde etme
3. **Sinyal Temizleme**: Bandpass filtre + gürültü temizleme
4. **NeuroKit2 Analizi**: R-peak tespiti + HRV analizi
5. **Ritim Sınıflandırması**: Kural tabanlı + makine öğrenmesi

## 🎯 Desteklenen Ritimler (25+ Ritim)

### 📊 Normal ve Sinüs Ritimleri
- ✅ Normal Sinüs Ritmi
- ⚡ Sinüs Taşikardisi
- 🐌 Sinüs Bradikardisi

### 🔄 Atriyal Ritimler
- 🌊 Atriyal Fibrilasyon
- 🪚 Atriyal Flutter
- ⚡ Atriyal Taşikardi
- 🔀 Multifocal Atriyal Taşikardi

### 🔗 Junctional Ritimler
- 🔄 Junctional Escape Ritmi
- ⚡ Accelerated Junctional Ritim

### ⚠️ Ventriküler Ritimler
- 🚨 Ventriküler Taşikardi
- 💥 Ventriküler Fibrilasyon
- 🐌 İdioventriküler Ritim
- 🌀 Polimorfik Ventriküler Taşikardi

### 🚀 Supraventriküler Taşikardiler
- ⚡ SVT (Supraventriküler Taşikardi)
- 🔄 AV Nodal Reentrant Taşikardi

### 🚧 Blok Ritimleri
- 1️⃣ 1. Derece AV Blok
- 2️⃣ 2. Derece AV Blok (Mobitz I/II)
- 3️⃣ 3. Derece AV Blok (Komplet)

### 🔧 Pacemaker Ritimleri
- 🤖 Pacemaker Ritmi (Normal)
- ⚠️ Pacemaker Malfonksiyonu

### 🆘 Acil Durumlar
- 💀 Asistoli
- 😵 Agonal Ritim
- ⚡ ST Elevasyonlu Taşikardi
- 🔺 WPW Sendromu ile Taşikardi
- 📊 Elektriksel Alternans

### 🤔 Özel Durumlar
- ❓ Belirsiz Ritim
- 🌀 Karmaşık Aritmiler

## 🛠️ Geliştirme

### Test Etme
```bash
# Sağlık kontrolü
curl http://localhost:5000/health

# Test görüntüsü ile analiz
curl -X POST http://localhost:5000/analyze-ekg \
  -H "Content-Type: application/json" \
  -d '{"image": "data:image/jpeg;base64,..."}'
```

### Production Deployment
```bash
# Gunicorn ile production server
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## 📋 Sistem Gereksinimleri

- Python 3.8+
- RAM: 2GB+
- CPU: 2 core+
- Disk: 1GB+

## ⚠️ Önemli Notlar

- Bu sistem yardımcı tanı amaçlıdır
- Kesin tanı için 12-lead EKG gereklidir
- Kritik durumlarda kardiyoloji konsültasyonu şarttır
- Görüntü kalitesi analiz doğruluğunu etkiler

## 🔧 Sorun Giderme

### Kamera Erişim Hatası
- Tarayıcı izinlerini kontrol edin
- HTTPS bağlantısı gerekebilir

### Backend Bağlantı Hatası
- Servisin çalıştığından emin olun
- CORS ayarlarını kontrol edin
- Firewall/antivirus kontrolü yapın

### Düşük Analiz Doğruluğu
- EKG çizgisini daha net gösterin
- Monitör parlaklığını artırın
- Kamera odağını ayarlayın