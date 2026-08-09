# Skin Disease Prediction

Bu proje, bir transfer learning (transfer öğrenmesi) çalışma ödevidir. 

PyTorch ve ConvNeXt mimarisi kullanılarak, 22 farklı cilt hastalığını sınıflandırmak üzere geliştirilmiş olan modelimiz, yapılan eğitim ve optimizasyonlar sonucunda **%99.3 doğruluk (accuracy)** oranına ulaşmıştır. 

Arayüz (Frontend) React ve Vite ile geliştirilmiş olup, arka uç (Backend) ise FastAPI ile hizmet vermektedir. Sisteme yüklenen resimler üzerinden hastalık tahmini yapılmakta ve ek olarak Grad-CAM tekniği ile modelin resimde odaklandığı bölgeler bir ısı haritası (heatmap) olarak sunulmaktadır.

## Nasıl Çalıştırılır?

### Backend (Python / FastAPI)
1. `backend` klasörüne gidin.
2. Gerekli kütüphaneleri yükleyin: `pip install -r requirements.txt`
3. Sunucuyu başlatın: `python main.py`
4. Backend `http://localhost:8000` adresinde çalışacaktır.

### Frontend (React / Vite)
1. `frontend` klasörüne gidin.
2. Bağımlılıkları yükleyin: `npm install`
3. Geliştirme sunucusunu başlatın: `npm run dev`
4. Arayüze tarayıcınızdan `http://localhost:5173` adresinden ulaşabilirsiniz.
