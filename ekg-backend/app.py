#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
EKG Ritim Tanıma Backend Servisi
Profesyonel EKG analizi için NeuroKit2 kullanır
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import neurokit2 as nk
from scipy import signal
import base64
from io import BytesIO
from PIL import Image
import logging
import traceback

# Flask uygulaması
app = Flask(__name__)
CORS(app)  # Frontend'den erişim için

# Logging ayarları
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EKGAnalyzer:
    """Profesyonel EKG Analiz Sınıfı"""
    
    def __init__(self):
        self.sampling_rate = 500  # Hz
        self.min_heart_rate = 30
        self.max_heart_rate = 250
        
    def extract_signal_from_image(self, image_array):
        """
        Görüntüden EKG sinyalini çıkarır
        1. HSV renk uzayına çevir
        2. Yeşil/sarı EKG çizgilerini filtrele
        3. Sinyal dizisine dönüştür
        """
        try:
            # BGR'den HSV'ye çevir
            hsv = cv2.cvtColor(image_array, cv2.COLOR_BGR2HSV)
            
            # EKG monitörlerinde yaygın renk aralıkları
            # Yeşil tonları (çoğu monitör)
            lower_green = np.array([40, 50, 50])
            upper_green = np.array([80, 255, 255])
            mask_green = cv2.inRange(hsv, lower_green, upper_green)
            
            # Sarı tonları (bazı monitörler)
            lower_yellow = np.array([20, 100, 100])
            upper_yellow = np.array([40, 255, 255])
            mask_yellow = cv2.inRange(hsv, lower_yellow, upper_yellow)
            
            # Turkuaz tonları (Philips monitörler)
            lower_cyan = np.array([80, 50, 50])
            upper_cyan = np.array([100, 255, 255])
            mask_cyan = cv2.inRange(hsv, lower_cyan, upper_cyan)
            
            # Maskeleri birleştir
            combined_mask = cv2.bitwise_or(mask_green, mask_yellow)
            combined_mask = cv2.bitwise_or(combined_mask, mask_cyan)
            
            # Gürültüyü temizle
            kernel = np.ones((3,3), np.uint8)
            combined_mask = cv2.morphologyEx(combined_mask, cv2.MORPH_CLOSE, kernel)
            combined_mask = cv2.morphologyEx(combined_mask, cv2.MORPH_OPEN, kernel)
            
            # Sinyal çıkarımı - her X koordinatı için en yüksek Y değerini bul
            height, width = combined_mask.shape
            signal_data = []
            
            for x in range(width):
                column = combined_mask[:, x]
                white_pixels = np.where(column == 255)[0]
                
                if len(white_pixels) > 0:
                    # En üstteki beyaz piksel (EKG çizgisi)
                    y_value = height - white_pixels[0]  # Y koordinatını ters çevir
                    signal_data.append(y_value)
                else:
                    # Önceki değeri kullan veya ortalama
                    if signal_data:
                        signal_data.append(signal_data[-1])
                    else:
                        signal_data.append(height // 2)
            
            # Sinyali normalize et
            if len(signal_data) > 0:
                signal_array = np.array(signal_data, dtype=np.float64)
                signal_array = (signal_array - np.mean(signal_array)) / np.std(signal_array)
                return signal_array
            else:
                return None
                
        except Exception as e:
            logger.error(f"Sinyal çıkarım hatası: {str(e)}")
            return None
    
    def clean_signal(self, raw_signal):
        """
        Sinyali temizler ve filtreler
        """
        try:
            if raw_signal is None or len(raw_signal) < 100:
                return None
            
            # Baseline drift removal (High-pass filter)
            sos_high = signal.butter(4, 0.5, btype='high', fs=self.sampling_rate, output='sos')
            filtered_signal = signal.sosfilt(sos_high, raw_signal)
            
            # Powerline interference removal (Notch filter 50Hz)
            sos_notch = signal.iirnotch(50, 30, fs=self.sampling_rate)
            filtered_signal = signal.filtfilt(sos_notch[0], sos_notch[1], filtered_signal)
            
            # Low-pass filter (Anti-aliasing)
            sos_low = signal.butter(4, 40, btype='low', fs=self.sampling_rate, output='sos')
            filtered_signal = signal.sosfilt(sos_low, filtered_signal)
            
            return filtered_signal
            
        except Exception as e:
            logger.error(f"Sinyal temizleme hatası: {str(e)}")
            return raw_signal
    
    def analyze_ecg_professional(self, clean_signal):
        """
        NeuroKit2 ile profesyonel EKG analizi
        """
        try:
            if clean_signal is None or len(clean_signal) < 200:
                return self._create_error_result("Yetersiz sinyal verisi")
            
            # NeuroKit2 ile EKG işleme
            signals, info = nk.ecg_process(clean_signal, sampling_rate=self.sampling_rate)
            
            # R-peaks tespiti
            r_peaks = info["ECG_R_Peaks"]
            
            if len(r_peaks) < 2:
                return self._create_error_result("R dalgası tespit edilemedi")
            
            # Kalp hızı hesaplama
            rr_intervals = np.diff(r_peaks) / self.sampling_rate  # saniye cinsinden
            heart_rates = 60 / rr_intervals  # BPM
            avg_heart_rate = np.mean(heart_rates)
            
            # Ritim düzenliliği analizi
            rr_std = np.std(rr_intervals)
            cv_rr = rr_std / np.mean(rr_intervals)  # Coefficient of variation
            
            # QRS genişliği analizi (yaklaşık)
            qrs_duration = self._estimate_qrs_duration(signals, r_peaks)
            
            # Ritim sınıflandırması
            rhythm_analysis = self._classify_rhythm(avg_heart_rate, cv_rr, qrs_duration, len(r_peaks))
            
            # HRV analizi
            hrv_analysis = nk.hrv_time(r_peaks, sampling_rate=self.sampling_rate)
            
            return {
                "success": True,
                "rhythm": rhythm_analysis,
                "heart_rate": {
                    "average": round(avg_heart_rate, 1),
                    "min": round(np.min(heart_rates), 1),
                    "max": round(np.max(heart_rates), 1),
                    "variability": round(cv_rr * 100, 2)  # Yüzde olarak
                },
                "signal_quality": self._assess_signal_quality(clean_signal, r_peaks),
                "r_peaks_count": len(r_peaks),
                "qrs_duration": round(qrs_duration, 1),
                "hrv_metrics": {
                    "rmssd": round(hrv_analysis["HRV_RMSSD"].iloc[0], 2) if not hrv_analysis.empty else None,
                    "sdnn": round(hrv_analysis["HRV_SDNN"].iloc[0], 2) if not hrv_analysis.empty else None
                },
                "confidence": self._calculate_confidence(clean_signal, r_peaks, cv_rr)
            }
            
        except Exception as e:
            logger.error(f"EKG analiz hatası: {str(e)}")
            return self._create_error_result(f"Analiz hatası: {str(e)}")
    
    def _estimate_qrs_duration(self, signals, r_peaks):
        """QRS süresini tahmin eder"""
        try:
            qrs_durations = []
            for r_peak in r_peaks:
                # R peak etrafında QRS kompleksini analiz et
                start = max(0, r_peak - 40)  # ~80ms öncesi
                end = min(len(signals), r_peak + 40)  # ~80ms sonrası
                
                qrs_segment = signals["ECG_Clean"].iloc[start:end]
                # QRS başlangıç ve bitişini bul (basitleştirilmiş)
                threshold = np.std(qrs_segment) * 0.1
                above_threshold = np.abs(qrs_segment) > threshold
                
                if np.any(above_threshold):
                    duration = np.sum(above_threshold) / self.sampling_rate * 1000  # ms
                    qrs_durations.append(duration)
            
            return np.mean(qrs_durations) if qrs_durations else 100  # Default 100ms
            
        except:
            return 100  # Default değer
    
    def _classify_rhythm(self, heart_rate, cv_rr, qrs_duration, r_peak_count):
        """Ritim sınıflandırması"""
        
        # Temel sınıflandırma kuralları
        if heart_rate < 50:
            if cv_rr < 0.1:
                rhythm_type = "Sinüs Bradikardisi"
                urgency = "caution"
                description = "Düzenli ama yavaş kalp ritmi"
                treatment = "Altta yatan neden araştırılmalı, atropin düşünülebilir"
            else:
                rhythm_type = "Düzensiz Bradikardi"
                urgency = "warning"
                description = "Yavaş ve düzensiz ritim"
                treatment = "Kardiyoloji konsültasyonu, pacemaker değerlendirmesi"
                
        elif heart_rate > 150:
            if qrs_duration > 120:  # Geniş QRS
                rhythm_type = "Ventriküler Taşikardi"
                urgency = "critical"
                description = "Geniş QRS'li hızlı ritim - hayatı tehdit edici"
                treatment = "ACİL! Kardiyoversiyon, amiodaron, defibrilasyon hazırlığı"
            else:  # Dar QRS
                if cv_rr < 0.1:
                    rhythm_type = "Supraventriküler Taşikardi"
                    urgency = "warning"
                    description = "Dar QRS'li düzenli hızlı ritim"
                    treatment = "Valsalva manevrası, adenozin, kardiyoversiyon"
                else:
                    rhythm_type = "Atriyal Fibrilasyon (Hızlı Yanıt)"
                    urgency = "warning"
                    description = "Hızlı düzensiz ritim"
                    treatment = "Rate kontrolü (beta-bloker, diltiazem), antikoagülasyon"
                    
        elif 100 <= heart_rate <= 150:
            if cv_rr > 0.15:
                rhythm_type = "Atriyal Fibrilasyon"
                urgency = "caution"
                description = "Düzensiz R-R intervalleri, P dalgası yok"
                treatment = "Antikoagülasyon değerlendirmesi, rate/ritim kontrolü"
            else:
                rhythm_type = "Sinüs Taşikardisi"
                urgency = "normal"
                description = "Düzenli ama hızlı sinüs ritmi"
                treatment = "Altta yatan neden araştırılmalı (ateş, dehidratasyon, stres)"
                
        else:  # 50-100 BPM
            if cv_rr > 0.15:
                rhythm_type = "Atriyal Fibrilasyon (Kontrollü Yanıt)"
                urgency = "caution"
                description = "Düzensiz ritim, normal kalp hızı"
                treatment = "Antikoagülasyon durumu değerlendirilmeli"
            elif cv_rr < 0.05:
                rhythm_type = "Normal Sinüs Ritmi"
                urgency = "normal"
                description = "Düzenli P-QRS-T kompleksleri"
                treatment = "Tedavi gerekmez"
            else:
                rhythm_type = "Sinüs Aritmisi"
                urgency = "normal"
                description = "Hafif düzensiz sinüs ritmi (genellikle normal)"
                treatment = "Genellikle tedavi gerekmez"
        
        return {
            "name": rhythm_type,
            "urgency": urgency,
            "description": description,
            "treatment": treatment
        }
    
    def _assess_signal_quality(self, signal, r_peaks):
        """Sinyal kalitesini değerlendir"""
        try:
            # SNR hesaplama
            signal_power = np.mean(signal ** 2)
            noise_estimate = np.var(np.diff(signal))
            snr = 10 * np.log10(signal_power / noise_estimate) if noise_estimate > 0 else 50
            
            # R-peak tutarlılığı
            peak_consistency = len(r_peaks) / (len(signal) / self.sampling_rate) * 60  # Expected peaks per minute
            
            if snr > 20 and 40 < peak_consistency < 200:
                return "Mükemmel"
            elif snr > 15 and 30 < peak_consistency < 250:
                return "İyi"
            elif snr > 10:
                return "Orta"
            else:
                return "Zayıf"
                
        except:
            return "Bilinmiyor"
    
    def _calculate_confidence(self, signal, r_peaks, cv_rr):
        """Analiz güvenilirliğini hesapla"""
        try:
            # Sinyal uzunluğu faktörü
            length_factor = min(len(signal) / 1000, 1.0)  # 2 saniye optimal
            
            # R-peak sayısı faktörü
            peak_factor = min(len(r_peaks) / 5, 1.0)  # En az 5 peak istenir
            
            # Düzenlilik faktörü
            regularity_factor = max(0, 1 - cv_rr * 2)  # Düzenli ritimler daha güvenilir
            
            # Genel güven skoru
            confidence = (length_factor + peak_factor + regularity_factor) / 3 * 100
            
            return min(max(confidence, 30), 95)  # %30-95 arası sınırla
            
        except:
            return 70  # Default değer
    
    def _create_error_result(self, error_message):
        """Hata durumu için sonuç oluştur"""
        return {
            "success": False,
            "error": error_message,
            "rhythm": {
                "name": "Analiz Edilemedi",
                "urgency": "error",
                "description": error_message,
                "treatment": "EKG görüntüsünü daha net çekin veya farklı açıdan deneyin"
            },
            "confidence": 0
        }

# Global analyzer instance
analyzer = EKGAnalyzer()

@app.route('/health', methods=['GET'])
def health_check():
    """Servis sağlık kontrolü"""
    return jsonify({"status": "healthy", "service": "EKG Analyzer"})

@app.route('/analyze-ecg', methods=['POST'])
def analyze_ecg():
    """
    EKG görüntüsünü analiz eder
    POST body: {"image": "base64_encoded_image"}
    """
    try:
        # JSON verisini al
        data = request.get_json()
        
        if not data or 'image' not in data:
            return jsonify({"error": "Görüntü verisi bulunamadı"}), 400
        
        # Base64 görüntüyü decode et
        image_data = data['image']
        if image_data.startswith('data:image'):
            image_data = image_data.split(',')[1]
        
        # Base64'ü numpy array'e çevir
        image_bytes = base64.b64decode(image_data)
        image = Image.open(BytesIO(image_bytes))
        image_array = np.array(image)
        
        # BGR formatına çevir (OpenCV için)
        if len(image_array.shape) == 3:
            image_array = cv2.cvtColor(image_array, cv2.COLOR_RGB2BGR)
        
        logger.info(f"Görüntü alındı: {image_array.shape}")
        
        # 1. Sinyal çıkarımı
        raw_signal = analyzer.extract_signal_from_image(image_array)
        if raw_signal is None:
            return jsonify({
                "success": False,
                "error": "EKG sinyali tespit edilemedi",
                "suggestion": "Monitördeki EKG çizgisinin daha net görünmesini sağlayın"
            }), 400
        
        logger.info(f"Sinyal çıkarıldı: {len(raw_signal)} nokta")
        
        # 2. Sinyal temizleme
        clean_signal = analyzer.clean_signal(raw_signal)
        
        # 3. Profesyonel analiz
        result = analyzer.analyze_ecg_professional(clean_signal)
        
        logger.info(f"Analiz tamamlandı: {result.get('rhythm', {}).get('name', 'Bilinmiyor')}")
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Analiz hatası: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            "success": False,
            "error": "Sunucu hatası",
            "details": str(e)
        }), 500

if __name__ == '__main__':
    print("🏥 EKG Analiz Servisi Başlatılıyor...")
    print("📊 NeuroKit2 ile profesyonel EKG analizi")
    print("🌐 http://localhost:5000")
    
    app.run(host='0.0.0.0', port=5000, debug=True)