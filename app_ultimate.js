// Enhanced QR Scanner Inventory App - ULTIMATE VERSION
// Author: Professional Developer for Adaś (DJ Werset)
// Version: 3.0.0 - Production Ready with Batch Mode & Sessions

/* ======================
   GLOBAL VARIABLES & CONSTANTS
   ====================== */

// Core scanning variables
let qrScanner = null;
let isScanning = false;
let lastScannedItem = null;
let currentScanMode = 'item'; // 'item', 'box', 'batch'
let inventoryData = [];
let filteredData = [];
let currentSort = { field: 'serial', direction: 'asc' };
let currentView = 'table';
let audioContext = null;
let lastScanTime = 0;
let cameras = [];
let currentCameraIndex = 0;
let scanningActive = false;

// SESSION & BATCH MODE VARIABLES
let currentSession = null;
let sessionScans = []; // Array of {type, serial, box, timestamp, id}
let batchMode = false;
let batchTargetBox = null;
let batchScannedItems = new Set();
let preventDuplicatesInSession = true;
let sessionStartTime = null;

// Constants
const SCAN_MODES = {
    ITEM: 'item',
    BOX: 'box',
    BATCH: 'batch'
};

const SCAN_DEBOUNCE_DELAY = {
    ITEM: 1500,
    BOX: 800,
    BATCH: 1000
};

const LOCAL_STORAGE_KEY = 'qr_inventory_data';
const SESSION_STORAGE_KEY = 'qr_inventory_session';
const DOM_CODE_PATTERN = /^DOM\d{3,}$/i;
const MAX_SESSION_HISTORY = 50;

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
   SESSION MANAGEMENT
   ====================== */

function startNewSession() {
    const sessionId = `SESSION_${Date.now()}`;
    currentSession = {
        id: sessionId,
        startTime: new Date().toISOString(),
        endTime: null,
        itemsScanned: 0,
        boxesUsed: new Set(),
        totalItems: 0
    };
    
    sessionScans = [];
    batchScannedItems.clear();
    sessionStartTime = Date.now();
    
    saveSessionToStorage();
    updateSessionUI();
    
    console.log('🎯 Started new session:', sessionId);
    showMessage('Nowa sesja skanowania rozpoczęta', 'success');
}

function endCurrentSession() {
    if (currentSession) {
        currentSession.endTime = new Date().toISOString();
        currentSession.itemsScanned = sessionScans.filter(s => s.type === 'item').length;
        currentSession.totalItems = batchScannedItems.size;
        
        saveSessionToStorage();
        updateSessionUI();
        
        const duration = Math.round((Date.now() - sessionStartTime) / 1000);
        showMessage(`Sesja zakończona • ${currentSession.totalItems} przedmiotów • ${duration}s`, 'info');
    }
}

function addToSession(type, serial, box = null) {
    const scanEntry = {
        id: Date.now(),
        type: type,
        serial: serial.toUpperCase(),
        box: box,
        timestamp: getCurrentTimestamp(),
        sessionTime: Date.now() - sessionStartTime
    };
    
    sessionScans.push(scanEntry);
    
    if (type === 'item') {
        batchScannedItems.add(serial.toUpperCase());
        currentSession.itemsScanned++;
        
        if (box) {
            currentSession.boxesUsed.add(box);
        }
    }
    
    // Limit session history
    if (sessionScans.length > MAX_SESSION_HISTORY) {
        sessionScans = sessionScans.slice(-MAX_SESSION_HISTORY);
    }
    
    saveSessionToStorage();
    updateSessionUI();
}

function getSessionCSV(options = {}) {
    const {
        includeItemNames = true,
        includeTimestamps = true,
        onlySessionItems = true
    } = options;
    
    let headers = ['Serial'];
    if (includeItemNames) headers.push('Item');
    headers.push('Box');
    if (includeTimestamps) headers.push('LastSeen', 'BoxChanged', 'SessionTime');
    
    const rows = [headers.join(',')];
    
    const sessionItems = onlySessionItems 
        ? Array.from(batchScannedItems)
        : inventoryData.map(item => item.serial);
    
    sessionItems.forEach(serial => {
        const item = findItemBySerial(serial);
        if (item) {
            let row = [escapeCSV(item.serial)];
            if (includeItemNames) row.push(escapeCSV(item.item));
            row.push(escapeCSV(item.box));
            if (includeTimestamps) {
                row.push(escapeCSV(item.lastSeen));
                row.push(escapeCSV(item.boxChanged));
                
                // Add session time
                const sessionScan = sessionScans.find(s => s.serial === serial && s.type === 'item');
                row.push(sessionScan ? `${Math.round(sessionScan.sessionTime/1000)}s` : '');
            }
            rows.push(row.join(','));
        }
    });
    
    return rows.join('\n');
}

function removeLastScan() {
    if (sessionScans.length === 0) {
        showMessage('Brak skanów do cofnięcia', 'error');
        return;
    }
    
    const lastScan = sessionScans.pop();
    
    if (lastScan.type === 'item') {
        batchScannedItems.delete(lastScan.serial);
        
        // Remove from batch if in batch mode
        if (batchMode && lastScan.box) {
            const item = findItemBySerial(lastScan.serial);
            if (item && item.box === lastScan.box) {
                updateItem(lastScan.serial, { box: '', boxChanged: '' });
            }
        }
    }
    
    saveSessionToStorage();
    updateSessionUI();
    applyFilters();
    renderInventoryView();
    
    showMessage(`Cofnięto: ${lastScan.serial}`, 'info');
    vibrateDevice([100, 50, 100]);
}

function saveSessionToStorage() {
    try {
        const sessionData = {
            currentSession,
            sessionScans: sessionScans.slice(-MAX_SESSION_HISTORY),
            batchScannedItems: Array.from(batchScannedItems),
            batchMode,
            batchTargetBox
        };
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
    } catch (error) {
        console.warn('Failed to save session:', error);
    }
}

function loadSessionFromStorage() {
    try {
        const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (stored) {
            const data = JSON.parse(stored);
            currentSession = data.currentSession;
            sessionScans = data.sessionScans || [];
            batchScannedItems = new Set(data.batchScannedItems || []);
            batchMode = data.batchMode || false;
            batchTargetBox = data.batchTargetBox || null;
            
            if (currentSession && currentSession.startTime) {
                sessionStartTime = new Date(currentSession.startTime).getTime();
            }
            
            return true;
        }
    } catch (error) {
        console.warn('Failed to load session:', error);
    }
    return false;
}

/* ======================
   BATCH MODE FUNCTIONS
   ====================== */

function startBatchMode(targetBox = null) {
    batchMode = true;
    batchTargetBox = targetBox;
    currentScanMode = SCAN_MODES.BATCH;
    
    updateScannerMode();
    updateSessionUI();
    
    if (targetBox) {
        showMessage(`Tryb batch: ${targetBox}`, 'success');
    } else {
        showMessage('Tryb batch aktywny - najpierw skanuj pudełko', 'info');
    }
}

function exitBatchMode() {
    const itemCount = batchScannedItems.size;
    
    batchMode = false;
    batchTargetBox = null;
    currentScanMode = SCAN_MODES.ITEM;
    
    updateScannerMode();
    updateSessionUI();
    
    if (itemCount > 0) {
        showMessage(`Batch zakończony: ${itemCount} przedmiotów`, 'success');
    }
}

function setBatchTarget(boxCode) {
    batchTargetBox = boxCode;
    updateScannerMode();
    updateSessionUI();
    showMessage(`Cel batch: ${boxCode}`, 'success');
}

/* ======================
   AUDIO SYSTEM (Enhanced)
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

function playBatchSuccessSound() {
    playBeep(1200, 150, 0.25);
    setTimeout(() => playBeep(800, 100, 0.2), 200);
}

function playBoxSuccessSound() {
    playBeep(600, 400, 0.3);
}

function playErrorSound() {
    playBeep(300, 100, 0.2);
}

function playSessionSound() {
    playBeep(800, 100, 0.2);
    setTimeout(() => playBeep(1000, 100, 0.2), 150);
    setTimeout(() => playBeep(1200, 100, 0.2), 300);
}

/* ======================
   VIBRATION FEEDBACK (Enhanced)
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

function vibrateSuccess() {
    vibrateDevice(200);
}

function vibrateBatchSuccess() {
    vibrateDevice([100, 50, 100]);
}

function vibrateError() {
    vibrateDevice([50, 50, 50, 50, 50]);
}

function vibrateBoxSuccess() {
    vibrateDevice([200, 100, 200]);
}

/* ======================
   VISUAL FEEDBACK (Enhanced)
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
        const icon = overlay.querySelector('.scan-success-icon');
        if (icon) icon.textContent = '✅';
        overlay.classList.remove('hidden');
        setTimeout(() => {
            overlay.classList.add('hidden');
        }, 1000);
    }
}

function showBatchAnimation() {
    const video = document.getElementById('qr-video');
    const overlay = document.getElementById('scan-overlay');
    
    if (video) {
        video.classList.add('batch-flash');
        setTimeout(() => {
            video.classList.remove('batch-flash');
        }, 600);
    }
    
    if (overlay) {
        const icon = overlay.querySelector('.scan-success-icon');
        if (icon) icon.textContent = '📦➕';
        overlay.classList.remove('hidden');
        setTimeout(() => {
            overlay.classList.add('hidden');
            if (icon) icon.textContent = '✅';
        }, 800);
    }
}

function showBoxAnimation() {
    const video = document.getElementById('qr-video');
    const overlay = document.getElementById('scan-overlay');
    
    if (video) {
        video.classList.add('box-flash');
        setTimeout(() => {
            video.classList.remove('box-flash');
        }, 1000);
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
   DATA MANAGEMENT (Enhanced)
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
   CAMERA MANAGEMENT (Enhanced)
   ====================== */

async function getCameraDevices() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        cameras = devices.filter(device => device.kind === 'videoinput');
        
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
                width: { ideal: 1280, min: 640 },
                height: { ideal: 720, min: 480 }
            }
        };

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
   QR SCANNING (Enhanced)
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
                const debounceDelay = getDebounceDelay();
                
                if (now - lastScanTime > debounceDelay) {
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

function getDebounceDelay() {
    if (batchMode) {
        return batchTargetBox ? SCAN_DEBOUNCE_DELAY.BATCH : SCAN_DEBOUNCE_DELAY.BOX;
    }
    return currentScanMode === SCAN_MODES.BOX ? SCAN_DEBOUNCE_DELAY.BOX : SCAN_DEBOUNCE_DELAY.ITEM;
}

function stopScanning() {
    scanningActive = false;
}

function handleQRCode(data) {
    console.log('QR Code detected:', data);
    
    if (batchMode) {
        handleBatchScan(data);
    } else if (currentScanMode === SCAN_MODES.ITEM) {
        handleItemScan(data);
    } else if (currentScanMode === SCAN_MODES.BOX) {
        handleBoxScan(data);
    }
}

function handleBatchScan(data) {
    if (!batchTargetBox) {
        // First scan in batch mode should be box
        if (DOM_CODE_PATTERN.test(data)) {
            showMessage('W trybie batch najpierw skanuj pudełko', 'error');
            playErrorSound();
            vibrateError();
            return;
        }
        setBatchTarget(data);
        playBoxSuccessSound();
        vibrateBoxSuccess();
        showBoxAnimation();
        addToSession('box', data);
        return;
    }
    
    // Subsequent scans should be DOM items
    if (!DOM_CODE_PATTERN.test(data)) {
        showMessage('Teraz skanuj kody DOM przedmiotów', 'error');
        playErrorSound();
        vibrateError();
        return;
    }
    
    const serial = data.toUpperCase();
    
    // Check for duplicates in session
    if (preventDuplicatesInSession && batchScannedItems.has(serial)) {
        showMessage(`${serial} już zeskanowany w tej sesji`, 'warning');
        playErrorSound();
        vibrateError();
        return;
    }
    
    // Process item
    let item = findItemBySerial(serial);
    if (!item) {
        item = addNewItem(serial, '', batchTargetBox);
    } else {
        updateItem(serial, {
            box: batchTargetBox,
            lastSeen: getCurrentTimestamp(),
            boxChanged: getCurrentTimestamp()
        });
    }
    
    addToSession('item', serial, batchTargetBox);
    
    // Feedback
    playBatchSuccessSound();
    vibrateBatchSuccess();
    showBatchAnimation();
    
    const itemCount = batchScannedItems.size;
    showMessage(`${serial} → ${batchTargetBox} (${itemCount})`, 'success');
    
    // Update views
    applyFilters();
    renderInventoryView();
    updateStats();
}

function handleItemScan(serial) {
    if (!DOM_CODE_PATTERN.test(serial)) {
        playErrorSound();
        vibrateError();
        showMessage(`Nieprawidłowy format kodu: ${serial}`, 'error');
        return;
    }
    
    playSuccessSound();
    vibrateSuccess();
    showGreenAnimation();
    
    const normalizedSerial = serial.toUpperCase();
    let item = findItemBySerial(normalizedSerial);
    
    if (item) {
        updateItem(normalizedSerial, { lastSeen: getCurrentTimestamp() });
    }
    
    addToSession('item', normalizedSerial, item ? item.box : '');
    
    const resultArea = document.getElementById('result-area');
    const resultTitle = document.getElementById('result-title');
    const resultContent = document.getElementById('result-content');
    const scanBoxBtn = document.getElementById('scan-box-btn');
    const addNewBtn = document.getElementById('add-new-btn');
    const editBtn = document.getElementById('edit-item-btn');
    const batchBtn = document.getElementById('batch-mode-btn');
    
    if (!resultArea || !resultTitle || !resultContent) return;

    if (item) {
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
        if (batchBtn) batchBtn.classList.remove('hidden');
        
        lastScannedItem = item;
        showMessage(`Zaktualizowano: ${item.serial}`, 'success');
    } else {
        resultTitle.textContent = 'Nowy przedmiot';
        resultContent.innerHTML = `
            <p>Kod <strong>${normalizedSerial}</strong> nie został znaleziony w bazie danych.</p>
            <p>Czy chcesz dodać nowy przedmiot?</p>
        `;
        
        if (scanBoxBtn) scanBoxBtn.classList.add('hidden');
        if (addNewBtn) addNewBtn.classList.remove('hidden');
        if (editBtn) editBtn.classList.add('hidden');
        if (batchBtn) batchBtn.classList.add('hidden');
        
        lastScannedItem = { serial: normalizedSerial };
    }
    
    resultArea.classList.remove('hidden');
    
    applyFilters();
    renderInventoryView();
    updateStats();
}

function handleBoxScan(boxCode) {
    console.log('Handling box scan:', boxCode);
    
    playBoxSuccessSound();
    vibrateBoxSuccess();
    showBoxAnimation();
    
    if (!lastScannedItem || !lastScannedItem.serial) {
        showMessage('Najpierw zeskanuj przedmiot', 'error');
        return;
    }

    const item = updateItem(lastScannedItem.serial, { 
        box: boxCode, 
        boxChanged: getCurrentTimestamp() 
    });
    
    if (item) {
        addToSession('assignment', item.serial, boxCode);
        showMessage(`${item.serial} przeniesiony do ${boxCode}`, 'success');
        
        currentScanMode = SCAN_MODES.ITEM;
        updateScannerMode();
        
        const resultArea = document.getElementById('result-area');
        if (resultArea) resultArea.classList.add('hidden');
        
        lastScannedItem = null;
        
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

    if (batchMode) {
        modeElement.className = 'scanner-mode scanner-mode--batch';
        modeElement.innerHTML = `
            <div class="mode-icon">📦</div>
            <div class="mode-text">Tryb Batch</div>
            <div class="mode-instruction">
                ${batchTargetBox 
                    ? `Skanuj przedmioty → ${batchTargetBox}` 
                    : 'Najpierw zeskanuj kod pudełka'
                }
            </div>
        `;
    } else if (currentScanMode === SCAN_MODES.ITEM) {
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

function updateSessionUI() {
    // Update session counter
    const sessionCounter = document.getElementById('session-counter');
    if (sessionCounter) {
        const duration = sessionStartTime ? Math.round((Date.now() - sessionStartTime) / 1000) : 0;
        sessionCounter.textContent = `Sesja: ${batchScannedItems.size} przedmiotów • ${duration}s`;
    }
    
    // Update batch info
    const batchInfo = document.getElementById('batch-info');
    if (batchInfo) {
        if (batchMode && batchTargetBox) {
            batchInfo.classList.remove('hidden');
            batchInfo.innerHTML = `
                <div class="batch-target">📦 ${batchTargetBox}</div>
                <div class="batch-count">${batchScannedItems.size} przedmiotów</div>
            `;
        } else {
            batchInfo.classList.add('hidden');
        }
    }
    
    // Update recent scans
    const recentScans = document.getElementById('recent-scans');
    if (recentScans) {
        const recent = sessionScans.slice(-5).reverse();
        recentScans.innerHTML = recent.map(scan => {
            const icon = scan.type === 'item' ? '📱' : '📦';
            const timeStr = `${Math.round(scan.sessionTime / 1000)}s`;
            return `<div class="recent-scan">${icon} ${scan.serial} ${scan.box ? `→ ${scan.box}` : ''} <small>${timeStr}</small></div>`;
        }).join('');
    }
    
    // Update undo button
    const undoBtn = document.getElementById('undo-btn');
    if (undoBtn) {
        undoBtn.disabled = sessionScans.length === 0;
    }
}

/* ======================
   FILTERING AND SORTING (Enhanced)
   ====================== */

function applyFilters() {
    const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
    const boxFilter = document.getElementById('box-filter')?.value || '';
    const sessionOnlyFilter = document.getElementById('session-only-filter')?.checked || false;
    
    filteredData = inventoryData.filter(item => {
        const matchesSearch = !searchTerm || 
            item.serial.toLowerCase().includes(searchTerm) ||
            item.item.toLowerCase().includes(searchTerm) ||
            item.box.toLowerCase().includes(searchTerm);
            
        const matchesBox = !boxFilter || item.box === boxFilter;
        
        const matchesSession = !sessionOnlyFilter || batchScannedItems.has(item.serial);
        
        return matchesSearch && matchesBox && matchesSession;
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
        const sessionText = document.getElementById('session-only-filter')?.checked 
            ? ` (tylko z sesji)` 
            : '';
        countElement.textContent = `Wyświetlonych: ${filteredData.length} z ${inventoryData.length} przedmiotów${sessionText}`;
    }
}

function updateBoxFilter() {
    const select = document.getElementById('box-filter');
    if (!select) return;
    
    const boxes = [...new Set(inventoryData.map(item => item.box).filter(box => box))].sort();
    const currentValue = select.value;
    
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
   VIEW MANAGEMENT (Enhanced)
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

    tbody.innerHTML = filteredData.map(item => {
        const isInSession = batchScannedItems.has(item.serial);
        const rowClass = isInSession ? 'session-item' : '';
        
        return `
            <tr class="${rowClass}">
                <td class="table-serial">
                    ${isInSession ? '🎯 ' : ''}${item.serial}
                </td>
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
        `;
    }).join('');
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

    container.innerHTML = filteredData.map(item => {
        const isInSession = batchScannedItems.has(item.serial);
        const cardClass = isInSession ? 'item-card session-item' : 'item-card';
        
        return `
            <div class="${cardClass}">
                <div class="item-header">
                    <span class="item-serial">
                        ${isInSession ? '🎯 ' : ''}${item.serial}
                    </span>
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
        `;
    }).join('');
}

/* ======================
   EXPORT FUNCTIONALITY (Enhanced)
   ====================== */

function updateStats() {
    const totalItems = inventoryData.length;
    const itemsWithBox = inventoryData.filter(item => item.box).length;
    const itemsWithoutBox = totalItems - itemsWithBox;
    const totalBoxes = new Set(inventoryData.map(item => item.box).filter(box => box)).size;
    const sessionItems = batchScannedItems.size;
    const sessionBoxes = currentSession ? currentSession.boxesUsed.size : 0;
    
    document.getElementById('total-items').textContent = totalItems;
    document.getElementById('items-with-box').textContent = itemsWithBox;
    document.getElementById('items-without-box').textContent = itemsWithoutBox;
    document.getElementById('total-boxes').textContent = totalBoxes;
    
    // Session stats
    const sessionStats = document.getElementById('session-stats');
    if (sessionStats) {
        sessionStats.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">Sesja - przedmioty:</span>
                <span class="stat-value">${sessionItems}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Sesja - pudełka:</span>
                <span class="stat-value">${sessionBoxes}</span>
            </div>
        `;
    }
}

function generateCSVContent(sessionOnly = false) {
    const includeEmptyBoxes = document.getElementById('include-empty-boxes')?.checked ?? true;
    const includeTimestamps = document.getElementById('include-timestamps')?.checked ?? true;
    const includeItemNames = document.getElementById('include-item-names')?.checked ?? true;
    
    let headers = ['Serial'];
    if (includeItemNames) headers.push('Item');
    headers.push('Box');
    if (includeTimestamps) headers.push('LastSeen', 'BoxChanged');
    
    let data = sessionOnly 
        ? inventoryData.filter(item => batchScannedItems.has(item.serial))
        : inventoryData;
        
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

function updateCSVPreview(sessionOnly = false) {
    const preview = document.getElementById('export-preview-content');
    if (preview) {
        const csvContent = generateCSVContent(sessionOnly);
        const lines = csvContent.split('\n');
        const previewLines = lines.slice(0, 10);
        if (lines.length > 10) {
            previewLines.push(`... i ${lines.length - 10} więcej linii`);
        }
        preview.textContent = previewLines.join('\n');
    }
}

function exportCSV(sessionOnly = false) {
    try {
        const csvContent = generateCSVContent(sessionOnly);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            const timestamp = new Date().toISOString().slice(0, 10);
            const suffix = sessionOnly ? '_sesja' : '';
            
            link.setAttribute('href', url);
            link.setAttribute('download', `inventarz${suffix}_${timestamp}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            const itemCount = sessionOnly ? batchScannedItems.size : inventoryData.length;
            showMessage(`CSV pobrany (${itemCount} przedmiotów)`, 'success');
        } else {
            throw new Error('Download not supported');
        }
    } catch (error) {
        console.error('Export failed:', error);
        showMessage('Błąd eksportu CSV', 'error');
    }
}

async function copyCSVToClipboard(sessionOnly = false) {
    try {
        const csvContent = generateCSVContent(sessionOnly);
        await navigator.clipboard.writeText(csvContent);
        const itemCount = sessionOnly ? batchScannedItems.size : inventoryData.length;
        showMessage(`CSV skopiowany (${itemCount} przedmiotów)`, 'success');
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
    (serial ? itemInput : serialInput).focus();
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
            // Remove from session if present
            batchScannedItems.delete(serial);
            sessionScans = sessionScans.filter(scan => scan.serial !== serial);
            
            saveSessionToStorage();
            updateSessionUI();
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
   MESSAGE SYSTEM (Enhanced)
   ====================== */

function showMessage(text, type = 'info', duration = 3000) {
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
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('nav-btn--active');
    });
    document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('nav-btn--active');
    
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('tab--active');
    });
    document.getElementById(`${tabName}-tab`)?.classList.add('tab--active');
    
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
   EVENT LISTENERS (Enhanced)
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
    
    // Session controls
    const newSessionBtn = document.getElementById('new-session-btn');
    const endSessionBtn = document.getElementById('end-session-btn');
    const undoBtn = document.getElementById('undo-btn');
    
    if (newSessionBtn) {
        newSessionBtn.addEventListener('click', () => {
            if (currentSession && sessionScans.length > 0) {
                if (!confirm('Rozpocząć nową sesję? Bieżąca zostanie zakończona.')) {
                    return;
                }
                endCurrentSession();
            }
            startNewSession();
            playSessionSound();
        });
    }
    
    if (endSessionBtn) {
        endSessionBtn.addEventListener('click', () => {
            if (currentSession) {
                endCurrentSession();
            }
        });
    }
    
    if (undoBtn) {
        undoBtn.addEventListener('click', removeLastScan);
    }
    
    // Batch mode controls
    const batchModeBtn = document.getElementById('batch-mode-btn');
    const exitBatchBtn = document.getElementById('exit-batch-btn');
    const duplicateToggle = document.getElementById('prevent-duplicates');
    
    if (batchModeBtn) {
        batchModeBtn.addEventListener('click', () => {
            startBatchMode();
        });
    }
    
    if (exitBatchBtn) {
        exitBatchBtn.addEventListener('click', () => {
            exitBatchMode();
        });
    }
    
    if (duplicateToggle) {
        duplicateToggle.addEventListener('change', (e) => {
            preventDuplicatesInSession = e.target.checked;
        });
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
    const sessionOnlyFilter = document.getElementById('session-only-filter');
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
    
    if (sessionOnlyFilter) {
        sessionOnlyFilter.addEventListener('change', () => {
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
    const exportSessionCsvBtn = document.getElementById('export-session-csv-btn');
    const copyCsvBtn = document.getElementById('copy-csv-btn');
    const copySessionCsvBtn = document.getElementById('copy-session-csv-btn');
    const previewCsvBtn = document.getElementById('preview-csv-btn');
    const previewSessionCsvBtn = document.getElementById('preview-session-csv-btn');
    
    if (exportCsvBtn) {
        exportCsvBtn.addEventListener('click', () => exportCSV(false));
    }
    
    if (exportSessionCsvBtn) {
        exportSessionCsvBtn.addEventListener('click', () => exportCSV(true));
    }
    
    if (copyCsvBtn) {
        copyCsvBtn.addEventListener('click', () => copyCSVToClipboard(false));
    }
    
    if (copySessionCsvBtn) {
        copySessionCsvBtn.addEventListener('click', () => copyCSVToClipboard(true));
    }
    
    if (previewCsvBtn) {
        previewCsvBtn.addEventListener('click', () => updateCSVPreview(false));
    }
    
    if (previewSessionCsvBtn) {
        previewSessionCsvBtn.addEventListener('click', () => updateCSVPreview(true));
    }
    
    // Export options
    document.querySelectorAll('#export-tab input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            updateCSVPreview(false);
            updateCSVPreview(true);
        });
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
                updateItem(serial, { 
                    item: itemName, 
                    box: box,
                    boxChanged: box !== existingItem.box ? getCurrentTimestamp() : existingItem.boxChanged
                });
                showMessage(`Zaktualizowano ${serial}`, 'success');
            } else {
                addNewItem(serial, itemName, box);
                showMessage(`Dodano ${serial}`, 'success');
            }
            
            hideItemModal();
            applyFilters();
            renderInventoryView();
            updateStats();
            updateBoxFilter();
            
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
        } else if (e.key === 'b' && e.ctrlKey) {
            e.preventDefault();
            if (!batchMode) {
                startBatchMode();
            } else {
                exitBatchMode();
            }
        } else if (e.key === 'z' && e.ctrlKey) {
            e.preventDefault();
            removeLastScan();
        } else if (e.key === 'n' && e.ctrlKey) {
            e.preventDefault();
            startNewSession();
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
   INITIALIZATION (Enhanced)
   ====================== */

function initializeApp() {
    console.log('Initializing QR Scanner Inventory App v3.0.0');
    
    // Load data
    inventoryData = loadFromLocalStorage();
    filteredData = [...inventoryData];
    
    // Load or start session
    if (!loadSessionFromStorage()) {
        startNewSession();
    }
    
    // Initialize audio
    initAudioContext();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize views
    applyFilters();
    renderInventoryView();
    updateStats();
    updateBoxFilter();
    updateCSVPreview(false);
    updateCSVPreview(true);
    updateScannerMode();
    updateSessionUI();
    
    // Check camera availability
    getCameraDevices().then(cameras => {
        if (cameras.length === 0) {
            showMessage('Nie znaleziono kamer', 'warning');
        }
    });
    
    // Show welcome message
    if (currentSession && sessionScans.length === 0) {
        showMessage('QR Inventarz v3.0 gotowy!', 'success');
    }
    
    console.log('App initialized successfully');
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (currentSession && !currentSession.endTime) {
        endCurrentSession();
    }
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