# 📱 Offline (İnternetsiz) Kullanım Kılavuzu

## ✅ Evet, uygulama internet olmadan çalışır!

Uygulamanız **Service Worker** teknolojisi kullanıyor. Bu sayede:

### 🎯 Nasıl Çalışır?

1. **İlk Açılış (İnternet Gerekli):**
   - Uygulamayı ilk kez açtığınızda internet bağlantısı gerekir
   - Tüm dosyalar tarayıcı cache'ine kaydedilir
   - Bu işlem otomatiktir, sizin bir şey yapmanıza gerek yok

2. **Sonraki Açılışlar (İnternet Gereksiz):**
   - Artık internet olmasa bile uygulama çalışır
   - Dosyalar cache'den yüklenir
   - Tüm özellikler çalışır:
     - ✅ Algoritmalar
     - ✅ Doz hesaplamaları
     - ✅ CPR sayacı
     - ✅ Favoriler
     - ✅ Arama
     - ✅ Dark mode
     - ✅ Videolar (cache'de ise)

---

## 📋 Offline Kullanım İçin Adımlar

### 1. İlk Kurulum (Bir Kez)
```
1. Telefonunuzda Chrome/Edge tarayıcısını açın
2. Uygulamayı açın (internet bağlantısı olmalı)
3. Birkaç saniye bekleyin (cache doluyor)
4. Uygulamayı kapatın
5. İnterneti kapatın
6. Uygulamayı tekrar açın → Çalışır! ✅
```

### 2. Ana Ekrana Ekleme (Önerilir)
```
1. Chrome'da uygulamayı açın
2. Menü butonuna (⋮) tıklayın
3. "Ana ekrana ekle" / "Add to Home Screen" seçin
4. Artık uygulama gibi açılır
5. İnternet olmasa bile çalışır! ✅
```

---

## ⚠️ Önemli Notlar

### ✅ Çalışan Özellikler (Offline)
- Tüm algoritmalar
- Doz hesaplamaları
- CPR sayacı
- Favoriler (localStorage'da)
- Arama
- Dark mode ayarları
- Tüm görseller (EKG, tablolar vb.)

### ⚠️ Dikkat Edilmesi Gerekenler

1. **Videolar:**
   - Videolar büyük dosyalar olduğu için cache'de olmayabilir
   - Videoyu bir kez izlediyseniz cache'de kalır
   - İlk kez offline'da açmaya çalışırsanız video yüklenmeyebilir

2. **İlk Açılış:**
   - Uygulamayı hiç açmadıysanız, ilk açılışta internet gerekir
   - Cache dolu olduktan sonra internet gereksiz

3. **Güncellemeler:**
   - Uygulama güncellendiğinde internet gerekir
   - Güncelleme sonrası tekrar offline kullanılabilir

---

## 🔍 Test Etme

### Chrome DevTools ile Test:
```
1. Chrome'da F12 tuşuna basın
2. "Application" sekmesine gidin
3. Sol menüden "Service Workers" seçin
4. "Offline" kutusunu işaretleyin
5. Sayfayı yenileyin (F5)
6. Uygulama çalışmalı! ✅
```

### Telefonda Test:
```
1. Uygulamayı açın (internet açık)
2. Birkaç sayfa açın, algoritmalara bakın
3. Uçak modunu açın (Airplane Mode)
4. Uygulamayı kapatıp tekrar açın
5. Çalışmalı! ✅
```

---

## 🚀 İyileştirme Önerileri

Eğer daha iyi offline deneyim istiyorsanız:

1. **Video Cache'i:**
   - Videoları da cache'e ekledik
   - Ancak büyük dosyalar olduğu için ilk yükleme biraz zaman alabilir

2. **Cache Boyutu:**
   - Tarayıcılar genellikle 50-100 MB cache limiti koyar
   - Bu limit aşılırsa eski cache'ler silinebilir

3. **Güncelleme Stratejisi:**
   - Şu an "Network-first" stratejisi kullanılıyor
   - İnternet varsa güncel versiyon, yoksa cache'den

---

## ❓ Sık Sorulan Sorular

**S: Uygulama hiç açılmıyor offline'da?**
C: İlk kez açıyorsanız internet gerekir. Bir kez açtıktan sonra offline çalışır.

**S: Videolar açılmıyor?**
C: Videolar büyük dosyalar. Bir kez izledikten sonra cache'de kalır.

**S: Cache nasıl temizlenir?**
C: Chrome > Ayarlar > Gizlilik > Site verilerini temizle > [Uygulama adı] > Temizle

**S: Uygulama güncellendi, ne yapmalıyım?**
C: İnternet bağlantısıyla uygulamayı açın, otomatik güncellenir.

---

## 📊 Özet

✅ **Evet, uygulama internet olmadan çalışır!**
✅ İlk açılışta internet gerekir (cache için)
✅ Sonraki açılışlarda internet gereksiz
✅ Tüm temel özellikler offline çalışır
✅ Videolar bir kez izlendikten sonra cache'de kalır

**Uygulama production-ready (yayına hazır) ve offline çalışabilir durumda!** 🎉
