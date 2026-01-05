# Reklam Yerləri (Ad Spaces) Bələdçisi

Bu sənəd, saytda mövcud olan bütün reklam yerlərinin siyahısını, ölçülərini və istifadə qaydalarını ehtiva edir.

## 📐 Ölçülər və Formatlar

### Desktop Banner Reklamlar

| Ad Space | Slug | Ölçü (px) | Format | Yerləşmə |
|----------|------|-----------|--------|----------|
| Header Top | `header-top-desktop` | 728x90 | Leaderboard | Navbar üstündə |
| Header Bottom | `header-bottom-desktop` | 728x90 | Leaderboard | Navbar altında |
| Footer Top | `footer-top` | 728x90 | Leaderboard | Footer üstündə |
| Footer Bottom | `footer-bottom` | 728x90 | Leaderboard | Footer altında |
| In-Content Top | `in-content-top` | 728x90 | Leaderboard | Məzmunun yuxarısında |
| In-Content Middle | `in-content-middle` | 728x90 | Leaderboard | Məzmunun ortasında |

### Sidebar Reklamlar

| Ad Space | Slug | Ölçü (px) | Format | Yerləşmə |
|----------|------|-----------|--------|----------|
| Sidebar Top | `sidebar-top-desktop` | 300x250 | Medium Rectangle | Sidebar üstündə |
| Sidebar Bottom | `sidebar-bottom-desktop` | 300x250 | Medium Rectangle | Sidebar altında |

### Hero Center

| Ad Space | Slug | Ölçü (px) | Format | Yerləşmə |
|----------|------|-----------|--------|----------|
| Hero Center | `hero-center` | 400x300 (responsive) | Custom | Hero bölümünün mərkəzində |

### Mobil Reklamlar

| Ad Space | Slug | Ölçü (px) | Format | Yerləşmə |
|----------|------|-----------|--------|----------|
| Mobile Banner Top | `mobile-banner-top` | 320x50 | Mobile Banner | Mobil cihazlarda yuxarıda |
| Mobile Banner Bottom | `mobile-banner-bottom` | 320x50 | Mobile Banner | Mobil cihazlarda aşağıda |

### Native Reklamlar

| Ad Space | Slug | Ölçü (px) | Format | Yerləşmə |
|----------|------|-----------|--------|----------|
| Native Article Top | `native-article-top` | 300x250 | Native | Məqalə səhifəsində yuxarıda |
| Native Article Middle | `native-article-middle` | 300x250 | Native | Məqalə səhifəsində ortada |
| Native Sidebar | `native-sidebar` | 300x250 | Native | Məqalə səhifəsində sidebar-da |

## 🎨 Reklam Formatları

### Banner Reklamlar
- **Format**: JPG, PNG, WebP
- **Ölçü**: Yuxarıdakı cədvəldə göstərilən ölçülər
- **Fayl ölçüsü**: Maksimum 500KB (tövsiyə olunan: 100-200KB)
- **Aspect Ratio**: Ölçülərə uyğun

### Native Reklamlar
- **Format**: JPG, PNG, WebP
- **Ölçü**: 300x250px
- **Fayl ölçüsü**: Maksimum 300KB
- **Xüsusiyyət**: Məzmunla harmonik görünməlidir

## 📱 Responsive Davranış

- **Desktop Banner'lar**: Yalnız desktop cihazlarda görünür (lg breakpoint və yuxarı)
- **Mobil Banner'lar**: Yalnız mobil cihazlarda görünür (lg breakpoint-dən aşağı)
- **Hero Center**: Bütün cihazlarda görünür, ölçü responsive-dir
- **Native Reklamlar**: Bütün cihazlarda görünür

## 🚀 İstifadə Qaydaları

### Admin Paneldə Reklam Əlavə Etmək

1. **Admin Panel** → **Reklamlar** bölməsinə gedin
2. **Ad Spaces** sekmesində mövcud reklam yerlərini görə bilərsiniz
3. **Ads** sekmesində yeni reklam yaradın:
   - **Ad Space**: İstədiyiniz reklam yerini seçin
   - **Type**: Banner, Native, Text, Video və ya Sponsored
   - **Image URL**: Reklam şəklini yükləyin və URL-i daxil edin
   - **Link URL**: Reklama klik edildikdə açılacaq link
   - **Start Date / End Date**: Reklamın aktiv olacağı tarix aralığı
   - **Is Active**: Reklamı aktiv edin

### Reklam Yükləmə Tövsiyələri

1. **Şəkil Optimizasiyası**:
   - PNG formatından istifadə edin (şəffaf fon üçün)
   - JPG formatından istifadə edin (kiçik fayl ölçüsü üçün)
   - WebP formatından istifadə edin (ən yaxşı sıxılma)

2. **Fayl Ölçüsü**:
   - Desktop banner'lar: 100-200KB
   - Mobil banner'lar: 50-100KB
   - Native reklamlar: 100-200KB

3. **Şəkil Keyfiyyəti**:
   - Minimum 72 DPI
   - RGB rəng rejimi
   - Optimize edilmiş şəkillər

## 📊 Reklam Statistikaları

Admin paneldə **Analytics** sekmesində reklam statistikalarını görə bilərsiniz:
- **Click Count**: Reklama klik sayı
- **Impression Count**: Reklamın görüntülənmə sayı
- **CTR**: Click-through rate (klik nisbəti)

## ⚠️ Qeydlər

1. Reklamlar yalnız **aktiv** olduqda görünür
2. Tarix aralığı daxilində olan reklamlar avtomatik aktiv olur
3. Eyni Ad Space üçün birdən çox aktiv reklam varsa, ilk yaradılan göstərilir
4. Reklamlar lazy loading ilə yüklənir (performans üçün)
5. Mobil cihazlarda desktop banner'lar gizlənir və əksinə

## 🔧 Texniki Detallar

- **Component**: `AdBanner`
- **Service**: `adsService`
- **Collection**: `ad_spaces` və `ads`
- **Position Types**: `header`, `sidebar`, `footer`, `in-content`, `hero-center`, `mobile-banner`, `native`

## 📝 Script İstifadəsi

Bütün reklam yerlərini avtomatik yaratmaq üçün:

```bash
npm run seed:ad-spaces
```

Bu script bütün reklam yerlərini database-ə əlavə edəcək.

