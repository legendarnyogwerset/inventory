# QR Inventarz v3.0 - Ultimate Edition 🚀

## 🎯 Co nowego w v3.0

### **TRYB BATCH** 📦
- **Skanowanie wielu przedmiotów do jednego pudełka** bez wychodzenia z kamery
- Automatyczne przypisywanie - zeskanuj pudełko raz, potem tylko przedmioty
- Licznik przedmiotów w czasie rzeczywistym
- Blokada duplikatów w sesji (opcjonalnie)
- Szybkie wyjście z trybu batch

### **SESJE SKANOWANIA** 🎯
- **Śledzenie tylko tego co zeskanowalem** w bieżącej sesji
- **Eksport CSV tylko z sesji** - idealne do porównania z dużą bazą danych
- Historia ostatnich skanów z czasem
- Funkcja UNDO - cofnij ostatni skan
- Statystyki sesji w czasie rzeczywistym

### **MOBILE-FIRST** 📱
- **Powiększone przyciski** minimum 44px (Apple guidelines)
- **Sticky navigation** na dole na mobilkach
- **Responsywne video** - dopasowuje się do ekranu
- **Touch-friendly** - wszystko łatwo dotknąć
- **Lepsze układy** - kolumny na małych ekranach

### **UX IMPROVEMENTS** ✨
- **Skróty klawiszowe**: Ctrl+B (batch), Ctrl+Z (undo), Ctrl+N (nowa sesja)
- **Różne dźwięki** dla różnych typów skanów
- **Lepsze debouncing** - rozdzielne opóźnienia dla item/box/batch
- **Animacje wizualne** - różne dla każdego typu skanu
- **Pomoc kontekstowa** - przycisk ? z skrótami

## 🚀 Quick Start

### 1. **Pobierz pliki:**
```
qr-inventarz-v3/
├── index_ultimate.html     ← Nowy HTML
├── app_ultimate.js         ← Nowa logika
├── style.css               ← Użyj istniejący
├── mobile_enhancements.css ← Dodatkowe style mobile
├── manifest.json           ← PWA manifest
└── ikony...               ← Opcjonalne
```

### 2. **Uruchom:**
```bash
python -m http.server 8000
# lub
python start.py
```

### 3. **Użytkuj:**
1. **Rozpocznij skanowanie** 📱
2. **Wybierz tryb:**
   - **Pojedynczy** - skanuj przedmiot → pudełko
   - **Batch** - skanuj pudełko → wiele przedmiotów
3. **Eksportuj sesję** 📤 - tylko to co zeskanowałeś

## 🔥 Workflow dla Batch Mode

### **Scenariusz:** Masz pudełko "KUCHEN01" i chcesz przypisać do niego 10 przedmiotów

```
1. 🚀 Rozpocznij skanowanie
2. 📦 Kliknij "Tryb Batch" 
3. 📷 Zeskanuj kod pudełka "KUCHEN01"
   ✅ Batch: KUCHEN01 (0 przedmiotów)
4. 📷 Skanuj kody DOM: DOM001, DOM002, DOM003...
   ✅ DOM001 → KUCHEN01 (1)
   ✅ DOM002 → KUCHEN01 (2)
   ✅ DOM003 → KUCHEN01 (3)
   ...
5. 🏁 Kliknij "Zakończ tryb batch"
6. 📤 Eksport → "Pobierz CSV (sesja)" = tylko te 10 przedmiotów
```

## 📱 Mobile Experience

### **Nawigacja:**
- **Na dole ekranu** - łatwiej dosięgnąć kciukiem
- **Duże ikony** - 📱📋📤
- **Sticky przyciski** - zawsze widoczne

### **Skanowanie:**
- **Większe przyciski** - łatwiejsze trafianie
- **Responsive video** - dopasowuje się do ekranu
- **Touch feedback** - wibracje + dźwięki

### **Zarządzanie:**
- **Swipe table** - przewijanie tabeli palcem
- **Sticky result area** - wyniki na dole ekranu
- **Big tap targets** - minimum 44px

## 🎯 Eksport Sesji vs Wszystkich

### **Eksport wszystkich:**
```csv
Serial,Item,Box,LastSeen,BoxChanged
DOM001,Szklanki,KUCHNIA01,2025-09-14 12:00:00,2025-09-14 12:00:00
DOM002,Kubki,KUCHNIA01,2025-09-10 10:00:00,2025-09-10 10:00:00
DOM003,Talerze,,2025-09-05 09:00:00,
... (wszystkie 1000+ przedmiotów)
```

### **Eksport sesji:**
```csv
Serial,Item,Box,LastSeen,BoxChanged
DOM001,Szklanki,KUCHNIA01,2025-09-14 12:00:00,2025-09-14 12:00:00
DOM007,Widelce,KUCHNIA01,2025-09-14 12:01:00,2025-09-14 12:01:00
DOM015,Noże,KUCHNIA01,2025-09-14 12:02:00,2025-09-14 12:02:00
(tylko 3 zeskanowane przedmioty)
```

**= Idealne do porównania z dużą bazą danych!** 🎯

## ⌨️ Skróty Klawiszowe

| Skrót | Akcja |
|-------|-------|
| `Ctrl + B` | Przełącz tryb batch |
| `Ctrl + Z` | Cofnij ostatni skan |
| `Ctrl + N` | Nowa sesja |
| `Escape` | Zamknij modal |

## 🔧 Konfiguracja

### **Debounce delays:**
```javascript
SCAN_DEBOUNCE_DELAY = {
    ITEM: 1500,    // 1.5s dla przedmiotów
    BOX: 800,      // 0.8s dla pudełek  
    BATCH: 1000    // 1s dla batch mode
}
```

### **Session settings:**
```javascript
MAX_SESSION_HISTORY = 50;  // Max 50 skanów w historii
preventDuplicatesInSession = true;  // Blokuj duplikaty
```

## 📊 Monitoring Sesji

### **Liczniki na żywo:**
- **Przedmioty zeskanowane** w bieżącej sesji
- **Czas sesji** od rozpoczęcia
- **Pudełka użyte** w sesji
- **Historia ostatnich skanów**

### **Statystyki:**
```
Wszystkie przedmioty: 1247
Sesja - przedmioty: 23
Sesja - pudełka: 3
Czas sesji: 324s
```

## 🎨 Nowe Style

### **Session highlighting:**
```css
.session-item {
    background-color: rgba(var(--color-success-rgb), 0.1);
    border-left: 4px solid var(--color-success);
}
```

### **Batch mode animations:**
```css
.batch-flash {
    animation: batchFlash 0.6s ease-in-out;
}

.scanner-mode--batch {
    animation: batchPulse 2s ease-in-out infinite;
}
```

## 🔀 Migracja z v2.0

### **Dane:**
- ✅ **Kompatybilne** - stara baza danych działa
- ✅ **Automatyczne** - aplikacja sama załaduje dane
- ✅ **Bezpieczne** - kopia zapasowa w localStorage

### **Pliki:**
```bash
# Zastąp te pliki:
index.html → index_ultimate.html
app.js → app_ultimate.js

# Dodaj nowy plik:
mobile_enhancements.css

# Zostaw bez zmian:
style.css
manifest.json
```

## 🐛 Troubleshooting

### **Batch mode nie działa:**
- Sprawdź czy zaczynasz od pudełka
- Sprawdź format kodów DOM (DOM001, DOM002...)
- Wyłącz/włącz blokadę duplikatów

### **Mobilka źle wygląda:**
- Sprawdź czy dołączyłeś `mobile_enhancements.css`
- Wyczyść cache przeglądarki
- Sprawdź viewport meta tag

### **Sesje nie zapisują się:**
- Sprawdź sessionStorage w dev tools
- Sprawdź czy nie używasz trybu incognito
- Sprawdź błędy w console

### **Eksport sesji pusty:**
- Upewnij się że coś zeskanowałeś w sesji
- Sprawdź czy sesja jest aktywna
- Spróbuj "Nowa sesja"

## 🚀 Performance Tips

### **Dla dużych baz (1000+ przedmiotów):**
```javascript
// Wyłącz ciężkie animacje
@media (prefers-reduced-motion: reduce) {
    .success-flash, .batch-flash { animation: none; }
}

// Zmniejsz historię sesji
MAX_SESSION_HISTORY = 20;
```

### **Dla wolnych urządzeń:**
```javascript
// Zwiększ debounce
SCAN_DEBOUNCE_DELAY.ITEM = 2000;

// Zmniejsz rozdzielczość kamery
constraints.video.width = { ideal: 640 };
constraints.video.height = { ideal: 480 };
```

## 📈 Roadmap v4.0

- 🔄 **Sync z Google Sheets** - automatyczny
- 📊 **Dashboard** - statystyki, wykresy
- 🏷️ **Kategorie** - organizacja przedmiotów
- 🔍 **Wyszukiwanie głosowe** - "znajdź DOM001"
- 📱 **Offline mode** - PWA bez internetu
- 🎯 **Bulk operations** - masowe edycje

## 💡 Pro Tips

### **Workflow dla przeprowadzki:**
1. **Nowa sesja** dla każdego pokoju
2. **Tryb batch** dla każdego pudełka
3. **Eksport sesji** po każdym pokoju
4. **Porównaj** z główną bazą

### **Szybkie przypisywanie:**
- Tryb batch = skanuj raz pudełko, resztę automatycznie
- Ctrl+Z = szybkie cofnięcie błędów
- Blokada duplikatów = nie zeskanujesz dwa razy

### **Mobile best practices:**
- Trzymaj telefon poziomo dla lepszego skanowania
- Użyj tylnej kamery (lepsza jakość)
- Dobra jasność - kamera potrzebuje światła

---

## 🎉 **QR Inventarz v3.0 - najlepsze rozwiązanie do zarządzania domowym inventarzem!**

**Features:**
- ✅ Tryb batch
- ✅ Sesje skanowania  
- ✅ Mobile-first design
- ✅ Eksport tylko sesji
- ✅ Skróty klawiszowe
- ✅ Lepsze UX
- ✅ PWA support
- ✅ Offline capable

**Gotowe do hostingu online i używania! 🚀**