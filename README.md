# อัลกุรอาน มุคตะศ็อร - พร้อมคำแปลภาษาไทยและอังกฤษ

เว็บแอปพลิเคชันสำหรับอ่านอัลกุรอาน พร้อมคำแปลมุคตะศ็อร (ภาษาไทย) และ Mukhtasar (ภาษาอังกฤษ) ใช้งานผ่านเบราว์เซอร์ ไม่ต้องติดตั้ง

## คุณสมบัติ

- แสดงข้อความอัลกุรอานภาษาอาหรับ (อุษมานี) พร้อมคำแปลภาษาไทยและอังกฤษ
- เลือกซูเราะห์ได้ทั้ง 114 ซูเราะห์ พร้อมค้นหา
- แสดงผล 2 แบบ: การ์ด (Card View) และมุศหัฟ (Mushaf View)
- เปิด/ปิดการแสดงผลภาษาอาหรับ ภาษาไทย และภาษาอังกฤษได้
- ปรับขนาดตัวอักษรได้
- ค้นหาคำในซูเราะห์
- ข้ามไปยังอายะฮ์ที่ต้องการ
- เล่นเสียงอ่านอายะฮ์ (Mishary Al-Afasy) — ทีละอายะฮ์หรือทั้งซูเราะห์
- บุ๊กมาร์กอายะฮ์ที่ชอบ (บันทึกใน Local Storage)
- คัดลอกข้อความอายะฮ์
- แสดงชื่อซูเราะห์ภาษาอังกฤษและจำนวนอายะฮ์ (ไม่มีป้ายประเภทซูเราะห์)
- เปลี่ยนฟอนต์ภาษาอาหรับได้ (Uthmanic Hafs, KFGQPC Nastaleeq, PDMS Saleem Quran)
- รองรับคีย์บอร์ด: ลูกศรซ้าย/ขวาเปลี่ยนซูเราะห์, Escape ปิด modal

## ไฟล์หลัก

| ไฟล์ | คำอธิบาย |
|------|----------|
| `index.html` | หน้าแอปพลิเคชัน (HTML + CSS + JS) |
| `thai-mukhtasar.js` | ข้อมูลคำแปลภาษาไทย (มุคตะศ็อร) |
| `english-mukhtasar.js` | ข้อมูลคำแปลภาษาอังกฤษ (Mukhtasar) |
| `surah_data.js` | ข้อมูลซูเราะห์ทั้ง 114 ซูเราะห์ |
| `quran_uthmani_data.js` | ข้อความอัลกุรอานภาษาอาหรับ (ร่างอุษมานี) |
| `fonts/` | ฟอนต์ภาษาอาหรับ |

## วิธีใช้งาน

เปิดไฟล์ `index.html` ในเบราว์เซอร์ (Chrome, Firefox, Edge)

หรือใช้ Live Server / Static Server:

```bash
# Python
python -m http.server 8080

# Node.js (npx)
npx serve .
```

## การเล่นเสียง

เสียงอ่านมาจาก `https://cdn.islamic.network/quran/audio/128/ar.alafasy/` (Mishary Al-Afasy) ต้องมีการเชื่อมต่ออินเทอร์เน็ต

## แหล่งข้อมูล

- ข้อความอัลกุรอาน: [Tanzil.net](https://tanzil.net) (Uthmani)
- คำแปลภาษาไทย: มุคตะศ็อร — สรุปความหมายอัลกุรอานภาษาไทย
- คำแปลภาษาอังกฤษ: The Mukhtasar in English
- เสียงอ่าน: [EveryDayQuran.com](https://everydayquran.com) / Islamic Network

---

# Al-Qur'an Mukhtasar - with Thai and English Translation

A web application for reading the Quran with Mukhtasar Thai translation and English Mukhtasar translation. Runs in the browser with no installation required.

## Features

- Arabic Quran text (Uthmani script) with Thai and English translations
- All 114 surahs with search
- Two display modes: Card View and Mushaf View
- Toggle Arabic/Thai/English visibility
- Adjustable font size
- In-surah search
- Jump to specific ayah
- Audio recitation (Mishary Al-Afasy) — per verse or full surah
- Bookmark favorite ayahs (saved in Local Storage)
- Copy ayah text
- Previous/Next surah navigation
- Switchable Arabic fonts (Uthmanic Hafs, KFGQPC Nastaleeq, PDMS Saleem Quran)
- Keyboard shortcuts: Left/Right arrows for surah navigation, Escape to close modals

## Main Files

| File | Description |
|------|-------------|
| `index.html` | Application page (HTML + CSS + JS) |
| `thai-mukhtasar.js` | Thai translation data (Mukhtasar) |
| `english-mukhtasar.js` | English translation data (Mukhtasar) |
| `surah_data.js` | All 114 surah metadata |
| `quran_uthmani_data.js` | Arabic Quran text (Uthmani script) |
| `fonts/` | Arabic fonts |

## Usage

Open `index.html` in a browser (Chrome, Firefox, Edge).

Or use a static server:

```bash
# Python
python -m http.server 8080

# Node.js (npx)
npx serve .
```

## Audio

Recitations are streamed from `https://cdn.islamic.network/quran/audio/128/ar.alafasy/` (Mishary Al-Afasy). Internet connection required.

## Data Sources

- Quran text: [Tanzil.net](https://tanzil.net) (Uthmani)
- Thai translation: Mukhtasar Thai Tafsir
- English translation: The Mukhtasar in English
- Audio: [EveryDayQuran.com](https://everydayquran.com) / Islamic Network
