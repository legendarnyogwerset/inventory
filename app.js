// Enhanced QR Scanner Inventory App - Final Version
// Author: Professional Developer
// Version: 2.0.0

/* ======================
   GLOBAL VARIABLES
   ====================== */

let qrScanner = null;
let isScanning = false;
let lastScannedItem = null;
let currentScanMode = 'item'; // 'item' or 'box'
let inventoryData = [];
let filteredData = [];
let currentSort = { field: 'serial', direction: 'asc' };
let currentView = 'table'; // 'table' or 'cards'
let audioContext = null;
let scanDebounceTimer = null;
let lastScanTime = 0;
let cameras = [];
let currentCameraIndex = 0;
let scanningActive = false;

// Constants
const SCAN_MODES = {
    ITEM: 'item',
    BOX: 'box'
};

const SCAN_DEBOUNCE_DELAY = 2000; // 2 seconds between scans
const LOCAL_STORAGE_KEY = 'qr_inventory_data';
const DOM_CODE_PATTERN = /^DOM\d{3,}$/i;

// Initial data - will be loaded from localStorage or default
const INITIAL_DATA = [
    {"serial": "DOM001", "item": "", "box": "", "lastSeen": "2025-09-14 00:00:00", "boxChanged": "2025-09-15 00:00:00"},
    {"serial": "DOM004", "item": "Szklanki", "box": "", "lastSeen": "", "boxChanged": ""},
    {"serial": "DOM005", "item": "Węgielki do shisky IZZY COCO", "box": "", "lastSeen": "", "boxChanged": ""},
    {"serial": "DOM006", "item": "Kufel od Agi", "box": "", "lastSeen": "", "boxChanged": ""},
    {"serial": "DOM008", "item": "Skarbonka Serduszko", "box": "", "lastSeen": "", "boxChanged": ""},
    {"serial": "DOM009", "item": "Układanki od Mamy tosi", "box": "", "lastSeen": "", "boxChanged": ""},
    {"serial": "DOM010", "item": "SHISHA", "box": "", "lastSeen": "", "boxChanged": ""},
    {"serial": "DOM011", "item": "2x Torba OKO HORUSA i ok 25x przeterminowane zaproszenia na event asstera", "box": "", "lastSeen": "", "boxChanged": ""},
    {"serial": "DOM012", "item": "Swieczki male", "box": "", "lastSeen": "", "boxChanged": ""},
    {"serial": "DOM013", "item": "Kadzidełka", "box": "", "lastSeen": "", "boxChanged": ""},
    {"serial": "DOM014", "item": "Welna czarna", "box": "", "lastSeen": "", "boxChanged": ""},
    {"serial": "DOM015", "item": "Płyn do maszyny do dymu", "box": "", "lastSeen": "", "boxChanged": ""},
    {"serial": "DOM017", "item": "Welna ruzowa", "box": "", "lastSeen": "", "boxChanged": ""},
    {"serial": "DOM018", "item": "Wełna teczowa, welna zielona, szydelko i druciki wyswagowane", "box": "", "lastSeen": "", "boxChanged": ""},
    {"serial": "DOM019", "item": "Kieliszki do whisky x6", "box": "", "lastSeen": "", "boxChanged": ""},
    {"serial": "DOM022", "item": "Czapka banan", "box": "", "lastSeen": "", "boxChanged": ""},
    {"serial": "DOM023", "item": "Komiks hiphowoy od Madi", "box": "", "lastSeen": "", "boxChanged": ""},
    {"serial": "DOM026", "item": "Karton od aparatu Tostera", "box": "", "lastSeen": "", "boxChanged": ""},
    {"serial": "DOM029", "item": "Zegarek od starego", "box": "", "lastSeen": "", "boxChanged": ""},
    {"serial": "DOM032", "item": "Munchkin OG", "box": "", "lastSeen": "", "boxChanged": ""},
    {"serial": "DOM033", "item": "Kabel do zasilania glosniki/piecyk", "box": "", "lastSeen": "", "boxChanged": ""},
    {"serial": "DOM035", "item": "Czerwone światełko rowerowe DUNLOP", "box": "", "lastSeen": "", "boxChanged": ""},
    {"serial": "DOM036", "item": "Munchkin Steampunk", "box": "", "lastSeen": "", "boxChanged": ""},
    {"serial": "DOM039", "item": "Zestaw alkoholowy - 2x mini limoncello i ZAPASOWE PIWO", "box": "", "lastSeen": "", "boxChanged": ""},
    {"serial": "DOM040", "item": "Gikerek", "box": "", "lastSeen": "", "boxChanged": ""},
    {"serial": "DOM060", "item": "Ladowarka indukcyjna baseus", "box": "", "lastSeen": "", "boxChanged": ""},
    {"serial": "DOM061", "item": "Pojemnik na odpady medyczne z wenflonami w srodku", "box": "", "lastSeen": "", "boxChanged": ""},
    {"serial": "DOM062", "item": "Zapasowy maly iqos", "box": "", "lastSeen": "", "boxChanged": ""},
    {"serial": "DOM063", "item": "Pan Bulwa", "box": "", "lastSeen": "", "boxChanged": ""},
    {"serial": "DOM064", "item": "Czerwony spray", "box": "", "lastSeen": "", "boxChanged": ""},
    {"serial": "DOM065", "item": "Glosniczek JBL GO", "box": "", "lastSeen": "", "boxChanged": ""},
    {"serial": "DOM066", "item": "Piwny Kubek", "box": "", "lastSeen": "", "boxChanged": ""},
    {"serial": "DOM067", "item": "Plyn LIZARD do czyszczenia podstrunnicy", "box": "", "lastSeen": "", "boxChanged": ""},
    {"serial": "DOM068", "item": "Maszynka do baniek", "box": "", "lastSeen": "", "boxChanged": ""},
    {"serial": "DOM069", "item": "POO CURLING", "box": "", "lastSeen": "", "boxChanged": ""},
    {"serial": "DOM070", "item": "Płyn do robienia baniek", "box": "", "lastSeen": "", "boxChanged": ""}
];

/* ======================
   AUDIO SYSTEM
   ====================== */

function initAudioContext() {
    if (!audioContext) {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.warn('Audio context not supported:', error);
            return false;
        }
    }
    
    // Resume audio context if suspended (required by some browsers)
    if (audioContext.state === 'suspended') {
        audioContext.resume().catch(err => console.warn('Failed to resume audio context:', err));
    }
    
    return true;
}

function playBeep(frequency = 800, duration = 200, volume = 0.3) {
    if (!audioContext || !initAudioContext()) return;

    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration / 1000);
    } catch (error) {
        console.warn('Error playing beep:', error);
    }
}

function playSuccessSound() {
    playBeep(1000, 200, 0.3);
}

function playBoxSuccessSound() {
    playBeep(600, 400, 0.3);
}

function playErrorSound() {
    playBeep(300, 100, 0.2);
}

/* ======================
   VIBRATION FEEDBACK
   ====================== */

function vibrateDevice(pattern = 200) {
    if ('vibrate' in navigator) {
        try {
            navigator.vibrate(pattern);
        } catch (error) {
            console.warn('Vibration not supported:', error);
        }
    }
}

/* ======================
   VISUAL FEEDBACK
   ====================== */

function showGreenAnimation() {
    const video = document.getElementById('qr-video');
    const overlay = document.getElementById('scan-overlay');
    
    if (video) {
        video.classList.add('success-flash');
        setTimeout(() => {
            video.classList.remove('success-flash');
        }, 800);
    }
    
    if (overlay) {
        overlay.classList.remove('hidden');
        setTimeout(() => {
            overlay.classList.add('hidden');
        }, 1000);
    }
}

function showGreenBoxAnimation() {
    const video = document.getElementById('qr-video');
    const overlay = document.getElementById('scan-overlay');
    
    if (video) {
        video.classList.add('success-flash');
        setTimeout(() => {
            video.classList.remove('success-flash');
        }, 800);
    }
    
    if (overlay) {
        const icon = overlay.querySelector('.scan-success-icon');
        if (icon) icon.textContent = '📦✅';
        overlay.classList.remove('hidden');
        setTimeout(() => {
            overlay.classList.add('hidden');
            if (icon) icon.textContent = '✅';
        }, 1200);
    }
}

/* ======================
   DATA MANAGEMENT
   ====================== */

function saveToLocalStorage() {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(inventoryData));
        return true;
    } catch (error) {
        console.error('Failed to save to localStorage:', error);
        showMessage('Błąd zapisu danych lokalnych', 'error');
        return false;
    }
}

function loadFromLocalStorage() {
    try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
            }
        }
    } catch (error) {
        console.error('Failed to load from localStorage:', error);
    }
    return INITIAL_DATA;
}

function getCurrentTimestamp() {
    return new Date().toISOString().slice(0, 19).replace('T', ' ');
}

function findItemBySerial(serial) {
    return inventoryData.find(item => 
        item.serial.toLowerCase() === serial.toLowerCase()
    );
}

function updateItem(serial, updates) {
    const index = inventoryData.findIndex(item => 
        item.serial.toLowerCase() === serial.toLowerCase()
    );
    
    if (index !== -1) {
        inventoryData[index] = { ...inventoryData[index], ...updates };
        saveToLocalStorage();
        return inventoryData[index];
    }
    return null;
}

function addNewItem(serial, itemName = '', box = '') {
    const newItem = {
        serial: serial.toUpperCase(),
        item: itemName,
        box: box,
        lastSeen: getCurrentTimestamp(),
        boxChanged: box ? getCurrentTimestamp() : ''
    };
    
    inventoryData.push(newItem);
    saveToLocalStorage();
    return newItem;
}

function deleteItem(serial) {
    const index = inventoryData.findIndex(item => 
        item.serial.toLowerCase() === serial.toLowerCase()
    );
    
    if (index !== -1) {
        inventoryData.splice(index, 1);
        saveToLocalStorage();
        return true;
    }
    return false;
}

/* ======================
   CAMERA MANAGEMENT
   ====================== */

async function getCameraDevices() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        cameras = devices.filter(device => device.kind === 'videoinput');
        
        // Update switch camera button visibility
        const switchBtn = document.getElementById('switch-camera-btn');
        if (switchBtn) {
            switchBtn.classList.toggle('hidden', cameras.length <= 1);
        }
        
        return cameras;
    } catch (error) {
        console.error('Error getting camera devices:', error);
        return [];
    }
}

async function requestCameraPermission() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());
        return true;
    } catch (error) {
        console.error('Camera permission denied:', error);
        showMessage('Dostęp do kamery jest wymagany do skanowania', 'error');
        return false;
    }
}

async function startCamera() {
    try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('Camera API not supported');
        }

        await getCameraDevices();
        
        const constraints = {
            video: {
                facingMode: currentCameraIndex === 0 ? 'environment' : 'user',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        };

        // Use specific camera if available
        if (cameras.length > 0 && cameras[currentCameraIndex]) {
            constraints.video.deviceId = { exact: cameras[currentCameraIndex].deviceId };
        }

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        const video = document.getElementById('qr-video');
        
        if (video) {
            video.srcObject = stream;
            video.classList.add('camera-scanning');
            
            return new Promise((resolve, reject) => {
                video.onloadedmetadata = () => {
                    video.play()
                        .then(() => resolve(stream))
                        .catch(reject);
                };
                video.onerror = () => reject(new Error('Video load failed'));
            });
        }
        
        throw new Error('Video element not found');
    } catch (error) {
        console.error('Error starting camera:', error);
        throw error;
    }
}

function stopCamera() {
    const video = document.getElementById('qr-video');
    if (video && video.srcObject) {
        const stream = video.srcObject;
        stream.getTracks().forEach(track => track.stop());
        video.srcObject = null;
        video.classList.remove('camera-scanning');
    }
}

async function switchCamera() {
    if (cameras.length <= 1) return;
    
    currentCameraIndex = (currentCameraIndex + 1) % cameras.length;
    
    if (isScanning) {
        stopCamera();
        try {
            await startCamera();
            startScanning();
        } catch (error) {
            console.error('Error switching camera:', error);
            showMessage('Błąd przełączania kamery', 'error');
        }
    }
}

/* ======================
   QR SCANNING
   ====================== */

function startScanning() {
    if (scanningActive) return;
    
    const video = document.getElementById('qr-video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!video || !ctx) {
        console.error('Video or canvas context not available');
        return;
    }

    scanningActive = true;
    
    function scan() {
        if (!scanningActive || video.readyState !== video.HAVE_ENOUGH_DATA) {
            if (scanningActive) {
                requestAnimationFrame(scan);
            }
            return;
        }

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        try {
            const code = jsQR(imageData.data, imageData.width, imageData.height);
            
            if (code && code.data) {
                const now = Date.now();
                // Debounce scanning to prevent multiple scans
                if (now - lastScanTime > SCAN_DEBOUNCE_DELAY) {
                    lastScanTime = now;
                    handleQRCode(code.data.trim());
                }
            }
        } catch (error) {
            console.warn('QR scanning error:', error);
        }

        if (scanningActive) {
            requestAnimationFrame(scan);
        }
    }

    requestAnimationFrame(scan);
}

function stopScanning() {
    scanningActive = false;
}

function handleQRCode(data) {
    console.log('QR Code detected:', data);
    
    if (currentScanMode === SCAN_MODES.ITEM) {
        handleItemScan(data);
    } else if (currentScanMode === SCAN_MODES.BOX) {
        handleBoxScan(data);
    }
}

function handleItemScan(serial) {
    // Validate DOM code format
    if (!DOM_CODE_PATTERN.test(serial)) {
        playErrorSound();
        vibrateDevice([100, 100, 100]);
        showMessage(`Nieprawidłowy format kodu: ${serial}`, 'error');
        return;
    }
    
    // Feedback
    playSuccessSound();
    vibrateDevice(200);
    showGreenAnimation();
    
    const item = findItemBySerial(serial);
    const resultArea = document.getElementById('result-area');
    const resultTitle = document.getElementById('result-title');
    const resultContent = document.getElementById('result-content');
    const scanBoxBtn = document.getElementById('scan-box-btn');
    const addNewBtn = document.getElementById('add-new-btn');
    const editBtn = document.getElementById('edit-item-btn');
    
    if (!resultArea || !resultTitle || !resultContent) return;

    if (item) {
        // Update last seen
        updateItem(item.serial, { lastSeen: getCurrentTimestamp() });
        
        resultTitle.textContent = 'Znaleziono przedmiot';
        resultContent.innerHTML = `
            <p><strong>Kod:</strong> ${item.serial}</p>
            <p><strong>Nazwa:</strong> ${item.item || 'Brak nazwy'}</p>
            <p><strong>Pudełko:</strong> ${item.box || 'Nie przypisane'}</p>
            <p><strong>Ostatnio widziano:</strong> ${item.lastSeen}</p>
        `;
        
        if (scanBoxBtn) scanBoxBtn.classList.remove('hidden');
        if (addNewBtn) addNewBtn.classList.add('hidden');
        if (editBtn) editBtn.classList.remove('hidden');
        
        lastScannedItem = item;
        showMessage(`Zaktualizowano: ${item.serial}`, 'success');
    } else {
        resultTitle.textContent = 'Nowy przedmiot';
        resultContent.innerHTML = `
            <p>Kod <strong>${serial}</strong> nie został znaleziony w bazie danych.</p>
            <p>Czy chcesz dodać nowy przedmiot?</p>
        `;
        
        if (scanBoxBtn) scanBoxBtn.classList.add('hidden');
        if (addNewBtn) addNewBtn.classList.remove('hidden');
        if (editBtn) editBtn.classList.add('hidden');
        
        lastScannedItem = { serial: serial };
    }
    
    resultArea.classList.remove('hidden');
    
    // Update list view if visible
    if (currentView) {
        applyFilters();
        renderInventoryView();
    }
}

function handleBoxScan(boxCode) {
    console.log('Handling box scan:', boxCode);
    
    // Feedback
    playBoxSuccessSound();
    vibrateDevice(300);
    showGreenBoxAnimation();
    
    if (!lastScannedItem || !lastScannedItem.serial) {
        showMessage('Najpierw zeskanuj przedmiot', 'error');
        return;
    }

    const item = updateItem(lastScannedItem.serial, { 
        box: boxCode, 
        boxChanged: getCurrentTimestamp() 
    });
    
    if (item) {
        showMessage(`${item.serial} przeniesiony do ${boxCode}`, 'success');
        
        // Reset scan mode and hide results
        currentScanMode = SCAN_MODES.ITEM;
        updateScannerMode();
        
        const resultArea = document.getElementById('result-area');
        if (resultArea) resultArea.classList.add('hidden');
        
        lastScannedItem = null;
        
        // Update list view
        applyFilters();
        renderInventoryView();
        updateStats();
    } else {
        showMessage('Błąd aktualizacji pudełka', 'error');
    }
}

/* ======================
   SCANNER MODE MANAGEMENT
   ====================== */

function updateScannerMode() {
    const modeElement = document.getElementById('scanner-mode');
    if (!modeElement) return;

    if (currentScanMode === SCAN_MODES.ITEM) {
        modeElement.className = 'scanner-mode scanner-mode--item';
        modeElement.innerHTML = `
            <div class="mode-icon">📱</div>
            <div class="mode-text">Skanuj przedmiot</div>
            <div class="mode-instruction">Zeskanuj kod DOM przedmiotu</div>
        `;
    } else {
        modeElement.className = 'scanner-mode scanner-mode--box';
        modeElement.innerHTML = `
            <div class="mode-icon">📦</div>
            <div class="mode-text">Skanuj pudełko</div>
            <div class="mode-instruction">Zeskanuj kod pudełka dla: ${lastScannedItem?.serial || 'przedmiotu'}</div>
        `;
    }
}

/* ======================
   FILTERING AND SORTING
   ====================== */

function applyFilters() {
    const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
    const boxFilter = document.getElementById('box-filter')?.value || '';
    
    filteredData = inventoryData.filter(item => {
        const matchesSearch = !searchTerm || 
            item.serial.toLowerCase().includes(searchTerm) ||
            item.item.toLowerCase().includes(searchTerm) ||
            item.box.toLowerCase().includes(searchTerm);
            
        const matchesBox = !boxFilter || item.box === boxFilter;
        
        return matchesSearch && matchesBox;
    });
    
    updateResultsCount();
}

function sortInventory(field) {
    if (currentSort.field === field) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.field = field;
        currentSort.direction = 'asc';
    }
    
    filteredData.sort((a, b) => {
        let aVal = a[field] || '';
        let bVal = b[field] || '';
        
        // Handle dates
        if (field === 'lastSeen' || field === 'boxChanged') {
            aVal = new Date(aVal || '1970-01-01');
            bVal = new Date(bVal || '1970-01-01');
        }
        
        if (aVal < bVal) return currentSort.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return currentSort.direction === 'asc' ? 1 : -1;
        return 0;
    });
    
    updateSortHeaders();
    renderInventoryView();
}

function updateSortHeaders() {
    document.querySelectorAll('.sortable').forEach(th => {
        th.classList.remove('sorted');
        const icon = th.querySelector('.sort-icon');
        if (icon) icon.textContent = '↕️';
    });
    
    const currentTh = document.querySelector(`[data-sort="${currentSort.field}"]`);
    if (currentTh) {
        currentTh.classList.add('sorted');
        const icon = currentTh.querySelector('.sort-icon');
        if (icon) {
            icon.textContent = currentSort.direction === 'asc' ? '↑' : '↓';
        }
    }
}

function updateResultsCount() {
    const countElement = document.getElementById('results-count');
    if (countElement) {
        countElement.textContent = `Wyświetlonych: ${filteredData.length} z ${inventoryData.length} przedmiotów`;
    }
}

function updateBoxFilter() {
    const select = document.getElementById('box-filter');
    if (!select) return;
    
    const boxes = [...new Set(inventoryData.map(item => item.box).filter(box => box))].sort();
    const currentValue = select.value;
    
    // Clear and rebuild options
    select.innerHTML = '<option value="">Wszystkie pudełka</option>';
    
    boxes.forEach(box => {
        const option = document.createElement('option');
        option.value = box;
        option.textContent = box;
        if (box === currentValue) option.selected = true;
        select.appendChild(option);
    });
}

/* ======================
   VIEW MANAGEMENT
   ====================== */

function switchView(viewType) {
    currentView = viewType;
    
    const cardViewBtn = document.getElementById('card-view-btn');
    const tableViewBtn = document.getElementById('table-view-btn');
    const cardsContainer = document.getElementById('cards-container');
    const tableContainer = document.getElementById('table-container');
    
    if (viewType === 'cards') {
        cardViewBtn?.classList.remove('btn--outline');
        cardViewBtn?.classList.add('btn--primary');
        tableViewBtn?.classList.remove('btn--primary');
        tableViewBtn?.classList.add('btn--outline');
        cardsContainer?.classList.remove('hidden');
        tableContainer?.classList.add('hidden');
    } else {
        tableViewBtn?.classList.remove('btn--outline');
        tableViewBtn?.classList.add('btn--primary');
        cardViewBtn?.classList.remove('btn--primary');
        cardViewBtn?.classList.add('btn--outline');
        tableContainer?.classList.remove('hidden');
        cardsContainer?.classList.add('hidden');
    }
    
    renderInventoryView();
}

function renderInventoryView() {
    if (currentView === 'table') {
        renderTableView();
    } else {
        renderCardView();
    }
}

function renderTableView() {
    const tbody = document.getElementById('inventory-tbody');
    if (!tbody) return;

    if (filteredData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    <h3>Nie znaleziono przedmiotów</h3>
                    <p>Spróbuj zmienić filtry lub dodać nowe przedmioty</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filteredData.map(item => `
        <tr>
            <td class="table-serial">${item.serial}</td>
            <td class="table-item-name ${!item.item ? 'table-item-name--empty' : ''}">
                ${item.item || 'Brak nazwy'}
            </td>
            <td class="table-box ${!item.box ? 'table-box--empty' : ''}">
                ${item.box || 'Nie przypisane'}
            </td>
            <td>${item.lastSeen || '-'}</td>
            <td>${item.boxChanged || '-'}</td>
            <td class="table-actions">
                <button class="btn btn-icon btn--outline" onclick="editItem('${item.serial}')" title="Edytuj">
                    ✏️
                </button>
                <button class="btn btn-icon btn--outline" onclick="deleteItemConfirm('${item.serial}')" title="Usuń">
                    🗑️
                </button>
            </td>
        </tr>
    `).join('');
}

function renderCardView() {
    const container = document.getElementById('cards-container');
    if (!container) return;

    if (filteredData.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>Nie znaleziono przedmiotów</h3>
                <p>Spróbuj zmienić filtry lub dodać nowe przedmioty</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filteredData.map(item => `
        <div class="item-card">
            <div class="item-header">
                <span class="item-serial">${item.serial}</span>
                <div class="table-actions">
                    <button class="btn btn-icon btn--outline" onclick="editItem('${item.serial}')" title="Edytuj">
                        ✏️
                    </button>
                    <button class="btn btn-icon btn--outline" onclick="deleteItemConfirm('${item.serial}')" title="Usuń">
                        🗑️
                    </button>
                </div>
            </div>
            <div class="item-name">${item.item || 'Brak nazwy'}</div>
            <div class="item-details">
                <div>Ostatnio widziano: ${item.lastSeen || 'Nigdy'}</div>
                <div>Zmiana pudełka: ${item.boxChanged || 'Nigdy'}</div>
            </div>
            <div class="item-box ${!item.box ? 'item-box--empty' : ''}">
                ${item.box || 'Nie przypisane'}
            </div>
        </div>
    `).join('');
}

/* ======================
   EXPORT FUNCTIONALITY
   ====================== */

function updateStats() {
    const totalItems = inventoryData.length;
    const itemsWithBox = inventoryData.filter(item => item.box).length;
    const itemsWithoutBox = totalItems - itemsWithBox;
    const totalBoxes = new Set(inventoryData.map(item => item.box).filter(box => box)).size;
    
    document.getElementById('total-items').textContent = totalItems;
    document.getElementById('items-with-box').textContent = itemsWithBox;
    document.getElementById('items-without-box').textContent = itemsWithoutBox;
    document.getElementById('total-boxes').textContent = totalBoxes;
}

function generateCSVContent() {
    const includeEmptyBoxes = document.getElementById('include-empty-boxes')?.checked ?? true;
    const includeTimestamps = document.getElementById('include-timestamps')?.checked ?? true;
    const includeItemNames = document.getElementById('include-item-names')?.checked ?? true;
    
    let headers = ['Serial'];
    if (includeItemNames) headers.push('Item');
    headers.push('Box');
    if (includeTimestamps) headers.push('LastSeen', 'BoxChanged');
    
    let data = inventoryData;
    if (!includeEmptyBoxes) {
        data = data.filter(item => item.box);
    }
    
    const rows = [headers.join(',')];
    
    data.forEach(item => {
        let row = [escapeCSV(item.serial)];
        if (includeItemNames) row.push(escapeCSV(item.item));
        row.push(escapeCSV(item.box));
        if (includeTimestamps) row.push(escapeCSV(item.lastSeen), escapeCSV(item.boxChanged));
        rows.push(row.join(','));
    });
    
    return rows.join('\n');
}

function escapeCSV(value) {
    if (!value) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

function updateCSVPreview() {
    const preview = document.getElementById('export-preview-content');
    if (preview) {
        const csvContent = generateCSVContent();
        const lines = csvContent.split('\n');
        const previewLines = lines.slice(0, 10); // Show first 10 lines
        if (lines.length > 10) {
            previewLines.push(`... i ${lines.length - 10} więcej linii`);
        }
        preview.textContent = previewLines.join('\n');
    }
}

function exportCSV() {
    try {
        const csvContent = generateCSVContent();
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `inventarz_${new Date().toISOString().slice(0, 10)}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            showMessage('CSV został pobrany', 'success');
        } else {
            throw new Error('Download not supported');
        }
    } catch (error) {
        console.error('Export failed:', error);
        showMessage('Błąd eksportu CSV', 'error');
    }
}

async function copyCSVToClipboard() {
    try {
        const csvContent = generateCSVContent();
        await navigator.clipboard.writeText(csvContent);
        showMessage('CSV skopiowany do schowka', 'success');
    } catch (error) {
        console.error('Copy failed:', error);
        showMessage('Błąd kopiowania do schowka', 'error');
    }
}

/* ======================
   MODAL MANAGEMENT
   ====================== */

function showItemModal(serial = '', item = '', box = '') {
    const modal = document.getElementById('item-modal');
    const title = document.getElementById('modal-title');
    const serialInput = document.getElementById('item-serial');
    const itemInput = document.getElementById('item-name');
    const boxInput = document.getElementById('item-box');
    
    if (!modal) return;
    
    title.textContent = serial ? 'Edytuj przedmiot' : 'Dodaj nowy przedmiot';
    serialInput.value = serial;
    serialInput.readOnly = !!serial;
    itemInput.value = item;
    boxInput.value = box;
    
    modal.classList.remove('hidden');
    serialInput.focus();
}

function hideItemModal() {
    const modal = document.getElementById('item-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function editItem(serial) {
    const item = findItemBySerial(serial);
    if (item) {
        showItemModal(item.serial, item.item, item.box);
    }
}

function deleteItemConfirm(serial) {
    if (confirm(`Czy na pewno chcesz usunąć przedmiot ${serial}?`)) {
        if (deleteItem(serial)) {
            showMessage(`Usunięto ${serial}`, 'success');
            applyFilters();
            renderInventoryView();
            updateStats();
            updateBoxFilter();
        } else {
            showMessage('Błąd usuwania przedmiotu', 'error');
        }
    }
}

/* ======================
   MESSAGE SYSTEM
   ====================== */

function showMessage(text, type = 'info', duration = 3000) {
    // Remove existing messages
    document.querySelectorAll('.message').forEach(msg => msg.remove());
    
    const message = document.createElement('div');
    message.className = `message message--${type}`;
    message.textContent = text;
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        if (message.parentNode) {
            message.remove();
        }
    }, duration);
}

/* ======================
   TAB MANAGEMENT
   ====================== */

function switchTab(tabName) {
    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('nav-btn--active');
    });
    document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('nav-btn--active');
    
    // Update tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('tab--active');
    });
    document.getElementById(`${tabName}-tab`)?.classList.add('tab--active');
    
    // Update content based on tab
    if (tabName === 'list') {
        applyFilters();
        renderInventoryView();
        updateBoxFilter();
    } else if (tabName === 'export') {
        updateStats();
        updateCSVPreview();
    }
}

/* ======================
   EVENT LISTENERS
   ====================== */

function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.getAttribute('data-tab');
            if (tab) switchTab(tab);
        });
    });
    
    // Scanner controls
    const startScanBtn = document.getElementById('start-scan-btn');
    const stopScanBtn = document.getElementById('stop-scan-btn');
    const switchCameraBtn = document.getElementById('switch-camera-btn');
    
    if (startScanBtn) {
        startScanBtn.addEventListener('click', async () => {
            try {
                if (!await requestCameraPermission()) return;
                
                startScanBtn.classList.add('hidden');
                stopScanBtn?.classList.remove('hidden');
                
                await startCamera();
                startScanning();
                isScanning = true;
                
                updateScannerStatus('Skanowanie aktywne...', 'success');
            } catch (error) {
                console.error('Failed to start scanner:', error);
                showMessage('Błąd uruchomienia skanera', 'error');
                
                startScanBtn.classList.remove('hidden');
                stopScanBtn?.classList.add('hidden');
            }
        });
    }
    
    if (stopScanBtn) {
        stopScanBtn.addEventListener('click', () => {
            stopScanning();
            stopCamera();
            isScanning = false;
            
            startScanBtn?.classList.remove('hidden');
            stopScanBtn.classList.add('hidden');
            
            updateScannerStatus('Scanner zatrzymany', 'info');
        });
    }
    
    if (switchCameraBtn) {
        switchCameraBtn.addEventListener('click', switchCamera);
    }
    
    // Result actions
    const scanBoxBtn = document.getElementById('scan-box-btn');
    const addNewBtn = document.getElementById('add-new-btn');
    const editItemBtn = document.getElementById('edit-item-btn');
    
    if (scanBoxBtn) {
        scanBoxBtn.addEventListener('click', () => {
            currentScanMode = SCAN_MODES.BOX;
            updateScannerMode();
        });
    }
    
    if (addNewBtn) {
        addNewBtn.addEventListener('click', () => {
            if (lastScannedItem) {
                showItemModal(lastScannedItem.serial);
            }
        });
    }
    
    if (editItemBtn) {
        editItemBtn.addEventListener('click', () => {
            if (lastScannedItem) {
                editItem(lastScannedItem.serial);
            }
        });
    }
    
    // List controls
    const searchInput = document.getElementById('search-input');
    const boxFilter = document.getElementById('box-filter');
    const refreshBtn = document.getElementById('refresh-btn');
    const tableViewBtn = document.getElementById('table-view-btn');
    const cardViewBtn = document.getElementById('card-view-btn');
    
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                applyFilters();
                renderInventoryView();
            }, 300);
        });
    }
    
    if (boxFilter) {
        boxFilter.addEventListener('change', () => {
            applyFilters();
            renderInventoryView();
        });
    }
    
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            applyFilters();
            renderInventoryView();
            updateBoxFilter();
            showMessage('Lista odświeżona', 'success');
        });
    }
    
    if (tableViewBtn) {
        tableViewBtn.addEventListener('click', () => switchView('table'));
    }
    
    if (cardViewBtn) {
        cardViewBtn.addEventListener('click', () => switchView('cards'));
    }
    
    // Table sorting
    document.querySelectorAll('.sortable').forEach(th => {
        th.addEventListener('click', () => {
            const field = th.getAttribute('data-sort');
            if (field) {
                sortInventory(field);
            }
        });
    });
    
    // Export controls
    const exportCsvBtn = document.getElementById('export-csv-btn');
    const copyCsvBtn = document.getElementById('copy-csv-btn');
    const previewCsvBtn = document.getElementById('preview-csv-btn');
    
    if (exportCsvBtn) {
        exportCsvBtn.addEventListener('click', exportCSV);
    }
    
    if (copyCsvBtn) {
        copyCsvBtn.addEventListener('click', copyCSVToClipboard);
    }
    
    if (previewCsvBtn) {
        previewCsvBtn.addEventListener('click', updateCSVPreview);
    }
    
    // Export options
    document.querySelectorAll('#export-tab input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', updateCSVPreview);
    });
    
    // Modal controls
    const itemForm = document.getElementById('item-form');
    const cancelModalBtn = document.getElementById('cancel-modal-btn');
    
    if (itemForm) {
        itemForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const serial = document.getElementById('item-serial').value.trim().toUpperCase();
            const itemName = document.getElementById('item-name').value.trim();
            const box = document.getElementById('item-box').value.trim();
            
            if (!serial) {
                showMessage('Kod DOM jest wymagany', 'error');
                return;
            }
            
            if (!DOM_CODE_PATTERN.test(serial)) {
                showMessage('Nieprawidłowy format kodu DOM', 'error');
                return;
            }
            
            const existingItem = findItemBySerial(serial);
            
            if (existingItem) {
                // Update existing item
                updateItem(serial, { 
                    item: itemName, 
                    box: box,
                    boxChanged: box !== existingItem.box ? getCurrentTimestamp() : existingItem.boxChanged
                });
                showMessage(`Zaktualizowano ${serial}`, 'success');
            } else {
                // Add new item
                addNewItem(serial, itemName, box);
                showMessage(`Dodano ${serial}`, 'success');
            }
            
            hideItemModal();
            applyFilters();
            renderInventoryView();
            updateStats();
            updateBoxFilter();
            
            // Clear result area if this was the last scanned item
            if (lastScannedItem && lastScannedItem.serial === serial) {
                const resultArea = document.getElementById('result-area');
                if (resultArea) resultArea.classList.add('hidden');
                lastScannedItem = null;
            }
        });
    }
    
    if (cancelModalBtn) {
        cancelModalBtn.addEventListener('click', hideItemModal);
    }
    
    // Modal backdrop click
    const modal = document.getElementById('item-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideItemModal();
            }
        });
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideItemModal();
        }
    });
    
    // Prevent page refresh on form submission
    document.addEventListener('submit', (e) => {
        if (e.target.id === 'item-form') {
            e.preventDefault();
        }
    });
}

function updateScannerStatus(message, type = 'info') {
    const statusElement = document.getElementById('scanner-status');
    if (statusElement) {
        statusElement.innerHTML = `<div class="status status--${type}"><span>${message}</span></div>`;
        statusElement.classList.remove('hidden');
    }
}

/* ======================
   INITIALIZATION
   ====================== */

function initializeApp() {
    console.log('Initializing QR Scanner Inventory App v2.0.0');
    
    // Load data
    inventoryData = loadFromLocalStorage();
    filteredData = [...inventoryData];
    
    // Initialize audio
    initAudioContext();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize views
    applyFilters();
    renderInventoryView();
    updateStats();
    updateBoxFilter();
    updateCSVPreview();
    updateScannerMode();
    
    // Check camera availability
    getCameraDevices().then(cameras => {
        if (cameras.length === 0) {
            showMessage('Nie znaleziono kamer', 'warning');
        }
    });
    
    console.log('App initialized successfully');
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    stopScanning();
    stopCamera();
    if (audioContext) {
        audioContext.close();
    }
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}