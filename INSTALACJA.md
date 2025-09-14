# INSTALACJA I URUCHOMIENIE - Instrukcja techniczna

## Struktura plików

Po pobraniu wszystkich plików, twoja struktura folderów powinna wyglądać tak:

```
inventarz-qr/
├── index.html          # Główny plik HTML
├── app.js             # Główna logika aplikacji  
├── style.css          # Style CSS (użyj istniejący)
├── manifest.json      # Manifest PWA
├── start.py           # Skrypt Python do uruchomienia
├── start.bat          # Skrypt Windows do uruchomienia  
├── README.md          # Dokumentacja
├── icon-192.png       # Ikona 192x192 (opcjonalna)
├── icon-512.png       # Ikona 512x512 (opcjonalna)
└── INSTALACJA.md      # Ten plik
```

## Metody uruchomienia

### 🐍 Python (ZALECANE)

**Automatyczne uruchomienie:**
```bash
python start.py
```

**Manualne uruchomienie:**
```bash
python -m http.server 8000
```

**Windows - podwójne kliknięcie:**
```
start.bat
```

### 🌐 Node.js

```bash
npx serve .
```

lub z zainstalowanym serve:
```bash
npm install -g serve
serve .
```

### 🚀 Inne opcje

**PHP:**
```bash
php -S localhost:8000
```

**Live Server (VS Code):**
1. Zainstaluj rozszerzenie "Live Server"
2. Otwórz folder w VS Code  
3. Kliknij "Go Live"

## Problemy i rozwiązania

### 🔒 Problemy z kamerą

**Błąd: "Camera access denied"**
- Przejdź do ustawień przeglądarki
- Znajdź ustawienia kamery/mikrofonu
- Dodaj localhost do zaufanych stron

**Chrome:**
1. Adres: `chrome://settings/content/camera`
2. Dodaj: `http://localhost:8000`

**Firefox:**
1. Adres: `about:preferences#privacy`
2. Znajdź "Permissions" → "Camera"
3. Dodaj localhost

### 🌐 Problemy z HTTPS

Niektóre przeglądarki wymagają HTTPS dla kamery:

**Python z SSL:**
```python
# ssl_server.py
import http.server
import ssl

httpd = http.server.HTTPServer(('localhost', 8000), http.server.SimpleHTTPRequestHandler)
httpd.socket = ssl.wrap_socket(httpd.socket, certfile='./server.pem', server_side=True)
httpd.serve_forever()
```

**Generowanie certyfikatu:**
```bash
openssl req -new -x509 -keyout server.pem -out server.pem -days 365 -nodes
```

### 💾 Problemy z localStorage

**Sprawdzenie w konsoli:**
```javascript
// Sprawdź dane
console.log(localStorage.getItem('qr_inventory_data'));

// Usuń dane
localStorage.removeItem('qr_inventory_data');

// Backup danych
const backup = localStorage.getItem('qr_inventory_data');
```

### 📱 Problemy z PWA

**Instalacja nie działa:**
1. Sprawdź czy manifest.json ładuje się poprawnie
2. Sprawdź czy ikony istnieją
3. Sprawdź console na błędy

**Manifest sprawdzenie:**
```javascript
// W konsoli przeglądarki
fetch('/manifest.json').then(r => r.json()).then(console.log);
```

## Optymalizacja wydajności

### 🚀 Szybkość skanowania

**Zmniejsz rozdzielczość kamery (app.js, linia ~XXX):**
```javascript
const constraints = {
    video: {
        facingMode: 'environment',
        width: { ideal: 640 },    // Zmień z 1280
        height: { ideal: 480 }    // Zmień z 720
    }
};
```

**Zwiększ debounce delay:**
```javascript
const SCAN_DEBOUNCE_DELAY = 3000; // Zwiększ z 2000ms
```

### 💾 Zarządzanie pamięcią

**Czyszczenie danych:**
```javascript
// Usuń stare dane (>30 dni)
function cleanOldData() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    inventoryData = inventoryData.filter(item => {
        const lastSeen = new Date(item.lastSeen || '1970-01-01');
        return lastSeen > thirtyDaysAgo;
    });
    
    saveToLocalStorage();
}
```

### 📊 Duże zbiory danych

**Wirtualizacja tabeli** (dla >1000 przedmiotów):
```javascript
// Renderuj tylko widoczne elementy
function renderVirtualizedTable() {
    const startIndex = Math.floor(scrollTop / rowHeight);
    const endIndex = Math.min(startIndex + visibleCount, filteredData.length);
    // Renderuj tylko zakres startIndex-endIndex
}
```

## Backup i migracja

### 💾 Export pełnych danych

**Konsola przeglądarki:**
```javascript
// Pełny backup
const fullBackup = {
    data: JSON.parse(localStorage.getItem('qr_inventory_data')),
    timestamp: new Date().toISOString(),
    version: '2.0.0'
};

// Pobierz jako plik
const blob = new Blob([JSON.stringify(fullBackup, null, 2)], {type: 'application/json'});
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'inventarz_backup.json';
a.click();
```

### 📥 Import danych

```javascript
// Import z pliku JSON
function importBackup(jsonString) {
    try {
        const backup = JSON.parse(jsonString);
        localStorage.setItem('qr_inventory_data', JSON.stringify(backup.data));
        location.reload();
    } catch (error) {
        console.error('Import failed:', error);
    }
}
```

## Integracja z Google Sheets

### 📊 Google Apps Script

**Stwórz nowy script w Google Sheets:**
```javascript
function importCSV() {
  const csvUrl = 'YOUR_CSV_URL'; // URL do CSV na serwerze
  const response = UrlFetchApp.fetch(csvUrl);
  const csvData = response.getContentText();
  
  const sheet = SpreadsheetApp.getActiveSheet();
  const rows = csvData.split('\n').map(row => row.split(','));
  
  sheet.clear();
  sheet.getRange(1, 1, rows.length, rows[0].length).setValues(rows);
}

// Automatyczne odświeżanie co godzinę
function createTrigger() {
  ScriptApp.newTrigger('importCSV')
    .timeBased()
    .everyHours(1)
    .create();
}
```

### 🔗 Webhook integration

**Jeśli masz serwer:**
```javascript
// app.js - dodaj do funkcji saveToLocalStorage()
function syncWithGoogleSheets() {
    const csvData = generateCSVContent();
    
    fetch('YOUR_WEBHOOK_URL', {
        method: 'POST',
        headers: {
            'Content-Type': 'text/csv',
        },
        body: csvData
    }).catch(err => console.warn('Sync failed:', err));
}
```

## Debugowanie

### 🔍 Console commands

```javascript
// Sprawdź stan aplikacji
console.log('Inventory data:', inventoryData);
console.log('Filtered data:', filteredData);
console.log('Current mode:', currentScanMode);
console.log('Camera devices:', cameras);

// Testuj funkcje
handleQRCode('DOM999');  // Test item scan
handleBoxScan('TESTBOX'); // Test box scan

// Statystyki
console.log('Total items:', inventoryData.length);
console.log('Items with boxes:', inventoryData.filter(i => i.box).length);
```

### 📱 Mobile debugging

**Chrome DevTools:**
1. Podłącz telefon przez USB
2. Włącz Developer Options → USB Debugging
3. Chrome → More tools → Remote devices
4. Otwórz localhost na telefonie

**Safari (iOS):**
1. Settings → Safari → Advanced → Web Inspector
2. Podłącz iPhone do Mac
3. Safari → Develop → [Your iPhone]

## Security

### 🔒 HTTPS w produkcji

**Nginx config:**
```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    location / {
        root /path/to/inventarz-qr;
        index index.html;
    }
}
```

### 🛡️ Content Security Policy

**Dodaj do index.html:**
```html
<meta http-equiv="Content-Security-Policy" content="
    default-src 'self';
    script-src 'self' https://cdn.jsdelivr.net;
    style-src 'self' 'unsafe-inline';
    media-src 'self';
">
```

## Wsparcie

### 📞 Diagnostyka

1. **Sprawdź console (F12)** - Szukaj błędów
2. **Network tab** - Sprawdź czy pliki ładują się poprawnie
3. **Application tab** - Sprawdź localStorage i manifest
4. **Camera permissions** - Sprawdź w ustawieniach przeglądarki

### 🔧 Najczęstsze problemy

| Problem | Rozwiązanie |
|---------|-------------|
| Kamera nie działa | Sprawdź uprawnienia, używaj HTTPS |
| Dane się nie zapisują | Wyczyść localStorage, sprawdź miejsce |
| QR nie skanuje | Lepsze oświetlenie, właściwy format |
| PWA nie instaluje | Sprawdź manifest.json i ikony |
| Export CSV nie działa | Wyłącz blokadę popup-ów |

### 📧 Logi dla wsparcia

```javascript
// Generuj raport diagnostyczny
function generateDiagnosticReport() {
    return {
        userAgent: navigator.userAgent,
        localStorage: !!window.localStorage,
        camera: !!navigator.mediaDevices,
        dataCount: inventoryData.length,
        lastError: window.lastError || 'none',
        timestamp: new Date().toISOString()
    };
}
```

---

**Sukces!** 🎉 Twoja aplikacja powinna teraz działać bezproblemowo.

Jeśli napotkasz problemy, sprawdź sekcję rozwiązywania problemów powyżej.