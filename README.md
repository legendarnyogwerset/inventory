# Inventarz QR Scanner - Finalna Wersja

## Opis
Profesjonalna aplikacja webowa do zarządzania inventarzem domowym przy użyciu kodów QR. Umożliwia skanowanie przedmiotów z kodami DOM, przypisywanie ich do pudełek oraz eksport danych do CSV.

## Funkcjonalności

### 🚀 Podstawowe
- **Skanowanie QR kodów** - Obsługa kodów DOM (format: DOM001, DOM002, itp.)
- **Tryb pudełek** - Skanowanie kodów pudełek do przypisania przedmiotów
- **Zarządzanie inventarzem** - Dodawanie, edycja, usuwanie przedmiotów
- **Lokalny storage** - Automatyczny zapis danych w przeglądarce

### 📊 Widoki i filtrowanie
- **Widok tabelkowy** - Sortowanie, filtrowanie po wszystkich kolumnach
- **Widok kart** - Bardziej wizualny sposób przeglądania
- **Wyszukiwanie** - Szukanie po kodzie, nazwie, pudełku
- **Filtry** - Filtrowanie po konkretnych pudełkach

### 📤 Eksport
- **CSV export** - Gotowy do importu do Google Sheets
- **Kopiowanie do schowka** - Szybkie kopiowanie danych
- **Konfigurowalne opcje** - Wybór kolumn do eksportu
- **Podgląd** - Podgląd danych przed eksportem

### 🔧 Zaawansowane
- **PWA** - Instalacja jako aplikacja na telefonie
- **Przełączanie kamer** - Obsługa przedniej i tylnej kamery
- **Audio/vibration feedback** - Potwierdzenia skanowania
- **Debouncing** - Zapobieganie przypadkowym wielokrotnym skanom
- **Error handling** - Obsługa błędów kamery i uprawnień

## Instalacja

### 1. Pobierz pliki
```
inventarz-qr/
├── index.html
├── app.js
├── style.css
├── manifest.json
└── README.md
```

### 2. Hosting lokalny
**Opcja A - Python:**
```bash
cd inventarz-qr
python -m http.server 8000
```

**Opcja B - Node.js:**
```bash
npx serve .
```

**Opcja C - Live Server (VS Code):**
- Zainstaluj rozszerzenie "Live Server"
- Kliknij "Go Live" w VS Code

### 3. Dostęp
Otwórz przeglądarkę i przejdź do:
```
http://localhost:8000
```

## Użytkowanie

### Pierwsze uruchomienie
1. **Pozwól na dostęp do kamery** - Jest wymagany do skanowania
2. **Wybierz kartę "Scanner"** - Rozpocznij od skanowania
3. **Kliknij "Rozpocznij skanowanie"** - Aktywuj kamerę

### Skanowanie przedmiotów
1. **Tryb przedmiotu** (domyślny):
   - Skanuj kod DOM przedmiotu (np. DOM001)
   - Po rozpoznaniu zobaczysz szczegóły
   - Kliknij "Skanuj pudełko" aby przypisać

2. **Tryb pudełka**:
   - Skanuj kod pudełka
   - Przedmiot zostanie automatycznie przypisany
   - Powrót do trybu przedmiotu

### Zarządzanie danymi
- **Lista** - Przeglądaj wszystkie przedmioty
- **Wyszukiwanie** - Użyj pola wyszukiwania
- **Filtrowanie** - Wybierz konkretne pudełko
- **Sortowanie** - Kliknij nagłówki kolumn

### Eksport do Google Sheets
1. **Przejdź do karty "Eksport"**
2. **Skonfiguruj opcje** - Wybierz co eksportować
3. **Kliknij "Pobierz CSV"** - Pobierz plik
4. **Otwórz Google Sheets** - Zaimportuj CSV

## Konfiguracja Google Sheets

### Import CSV
1. Otwórz Google Sheets
2. Plik → Importuj → Prześlij → Wybierz CSV
3. Ustawienia importu:
   - Separator: Przecinek
   - Kodowanie: UTF-8

### Automatyczna synchronizacja (opcjonalnie)
Możesz skonfigurować Google Apps Script do automatycznego importu:
```javascript
function importCSV() {
  // Kod do automatycznego importu z URL
}
```

## Struktura danych

### Format CSV
```csv
Serial,Item,Box,LastSeen,BoxChanged
DOM001,Nazwa przedmiotu,PUDEŁKO01,2025-09-14 12:00:00,2025-09-14 12:30:00
```

### Pola danych
- **Serial** - Kod DOM (wymagany, unikalny)
- **Item** - Nazwa przedmiotu (opcjonalna)
- **Box** - Kod pudełka (opcjonalny)
- **LastSeen** - Ostatnie skanowanie
- **BoxChanged** - Ostatnia zmiana pudełka

## Rozwiązywanie problemów

### Kamera nie działa
1. Sprawdź uprawnienia w przeglądarce
2. Upewnij się, że używasz HTTPS lub localhost
3. Sprawdź czy kamera nie jest używana przez inną aplikację

### Dane nie zapisują się
1. Sprawdź czy localStorage jest włączony
2. Wyczyść cache przeglądarki
3. Sprawdź czy masz wystarczająco miejsca

### QR kody nie są rozpoznawane
1. Sprawdź oświetlenie
2. Trzymaj kod w odpowiedniej odległości
3. Upewnij się, że kod ma format DOM###

### Eksport nie działa
1. Sprawdź czy przeglądarka obsługuje pobieranie
2. Wyłącz blokowanie popup-ów
3. Sprawdź folder Downloads

## Zaawansowane funkcje

### Kody klawiaturowe
- **Escape** - Zamknij modal
- **Enter** - Zatwierdź formularz

### PWA (Progressive Web App)
- Zainstaluj aplikację na telefonie
- Działa offline po pierwszym załadowaniu
- Szybszy dostęp z ekranu głównego

### Backup danych
Dane można wyeksportować jako:
1. **CSV** - Do Google Sheets
2. **JSON** - Pełny backup z konsoli przeglądarki:
```javascript
console.log(JSON.stringify(JSON.parse(localStorage.getItem('qr_inventory_data'))));
```

## Bezpieczeństwo

- **Lokalne przechowywanie** - Dane nie opuszczają twojego urządzenia
- **HTTPS** - Wymagane do dostępu do kamery
- **Brak śledzenia** - Aplikacja nie wysyła danych zewnętrznie

## Kompatybilność

### Przeglądarki
- ✅ Chrome 70+
- ✅ Firefox 65+
- ✅ Safari 12+
- ✅ Edge 79+

### Systemy
- ✅ Windows 10+
- ✅ macOS 10.14+
- ✅ iOS 12+
- ✅ Android 8+

## Wsparcie

W przypadku problemów:
1. Sprawdź konsolę przeglądarki (F12)
2. Sprawdź czy wszystkie pliki są załadowane
3. Sprawdź uprawnienia kamery

## Wersja
**v2.0.0** - Finalna wersja z pełną obsługą błędów i optymalizacją wydajności.

## Autor
Profesjonalny informatyk specjalizujący się w aplikacjach QR.