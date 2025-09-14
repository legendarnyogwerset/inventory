#!/usr/bin/env python3
"""
Inventarz QR Scanner - Skrypt uruchomieniowy
Automatycznie uruchamia lokalny serwer HTTP dla aplikacji
"""

import os
import sys
import webbrowser
import http.server
import socketserver
import socket
from pathlib import Path

# Konfiguracja
DEFAULT_PORT = 8000
APP_NAME = "Inventarz QR Scanner"

def find_free_port(start_port=DEFAULT_PORT):
    """Znajdź wolny port do uruchomienia serwera"""
    for port in range(start_port, start_port + 100):
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind(('localhost', port))
                return port
        except OSError:
            continue
    return None

def check_files():
    """Sprawdź czy wszystkie wymagane pliki istnieją"""
    required_files = ['index.html', 'app.js', 'style.css']
    missing_files = []
    
    for file in required_files:
        if not Path(file).exists():
            missing_files.append(file)
    
    if missing_files:
        print(f"❌ Brakujące pliki: {', '.join(missing_files)}")
        print("   Upewnij się, że wszystkie pliki aplikacji są w tym samym folderze.")
        return False
    
    print("✅ Wszystkie wymagane pliki znalezione")
    return True

def start_server(port):
    """Uruchom lokalny serwer HTTP"""
    try:
        handler = http.server.SimpleHTTPRequestHandler
        httpd = socketserver.TCPServer(("localhost", port), handler)
        
        print(f"🚀 Uruchamianie {APP_NAME}...")
        print(f"📡 Serwer uruchomiony na: http://localhost:{port}")
        print(f"📱 Otwórz przeglądarkę i przejdź do adresu powyżej")
        print(f"⏹️  Naciśnij Ctrl+C aby zatrzymać serwer")
        print("-" * 50)
        
        # Automatycznie otwórz przeglądarkę
        webbrowser.open(f'http://localhost:{port}')
        
        # Uruchom serwer
        httpd.serve_forever()
        
    except KeyboardInterrupt:
        print("\n🛑 Zatrzymywanie serwera...")
        httpd.shutdown()
        print("✅ Serwer zatrzymany")
    except Exception as e:
        print(f"❌ Błąd uruchomienia serwera: {e}")
        return False
    
    return True

def show_help():
    """Pokaż instrukcje użytkowania"""
    print(f"""
{APP_NAME} - Skrypt uruchomieniowy

Użycie:
    python start.py [port]

Argumenty:
    port    Numer portu (domyślnie: {DEFAULT_PORT})

Przykłady:
    python start.py         # Uruchom na porcie {DEFAULT_PORT}
    python start.py 3000    # Uruchom na porcie 3000

Wymagania:
    - Python 3.6+
    - Pliki: index.html, app.js, style.css

Alternatywne sposoby uruchomienia:
    python -m http.server 8000
    npx serve .
    
Uwagi:
    - Aplikacja wymaga dostępu do kamery
    - Używaj przeglądarki obsługującej WebRTC
    - Dla HTTPS użyj: python -m ssl_server 8000
""")

def main():
    """Główna funkcja aplikacji"""
    print(f"🔧 {APP_NAME} - Setup")
    print("=" * 40)
    
    # Sprawdź argumenty
    if len(sys.argv) > 1:
        if sys.argv[1] in ['-h', '--help', 'help']:
            show_help()
            return
        
        try:
            port = int(sys.argv[1])
            if port < 1024 or port > 65535:
                raise ValueError("Port musi być w zakresie 1024-65535")
        except ValueError as e:
            print(f"❌ Błędny port: {e}")
            return
    else:
        port = find_free_port()
        if not port:
            print("❌ Nie można znaleźć wolnego portu")
            return
    
    # Sprawdź pliki
    if not check_files():
        return
    
    # Pokaż informacje o systemie
    print(f"🐍 Python: {sys.version.split()[0]}")
    print(f"📁 Katalog: {os.getcwd()}")
    print(f"🌐 Port: {port}")
    print()
    
    # Uruchom serwer
    if not start_server(port):
        print("❌ Nie udało się uruchomić serwera")
        return
    
    print("👋 Dziękujemy za użycie aplikacji!")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n🛑 Przerwano przez użytkownika")
    except Exception as e:
        print(f"❌ Nieoczekiwany błąd: {e}")
        sys.exit(1)