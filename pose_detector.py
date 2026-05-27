import cv2
import numpy as np
import requests
import time
import os
import sys
import json
import signal
import threading
from datetime import datetime

# =========================
# CONFIGURATION MANAGEMENT
# =========================
def load_config():
    try:
        with open('detector_config.json', 'r') as f:
            print("📖 Loaded configuration from detector_config.json")
            return json.load(f)
    except FileNotFoundError:
        print("⚠️ detector_config.json not found. Using script defaults.")
        return {}

CONFIG = load_config()

# Read configurations
API_BASE = CONFIG.get('api_base', 'http://localhost:5000')
API_KEY = CONFIG.get('api_key', '')
CAMERA_INDEX = CONFIG.get('camera_index', 0)
CAMERA_LOCATION = CONFIG.get('camera_location', 'Camera 01')
FALL_FRAME_THRESHOLD = CONFIG.get('fall_frame_threshold', 8)
ALERT_COOLDOWN_SECONDS = CONFIG.get('alert_cooldown_seconds', 5)
AUDIO_ENABLED = CONFIG.get('audio_enabled', True)
DISTRESS_KEYWORDS = CONFIG.get('distress_keywords', [
    "help me", "help", "emergency", 
    "fall", "save me", "ouch", "i fell"
])

# Global Tracking States
latest_status = "SAFE"
alert_triggered = False
last_alert_time = 0
audio_listening = True
cap = None

# =========================
# SIGNAL TERMINATIONS
# =========================
def shutdown_handler(sig, frame):
    global audio_listening, cap
    print("\n🛑 Shutting down edge client gracefully...")
    audio_listening = False
    if cap is not None:
        cap.release()
    cv2.destroyAllWindows()
    sys.exit(0)

signal.signal(signal.SIGINT, shutdown_handler)
signal.signal(signal.SIGTERM, shutdown_handler)

# =========================
# INCIDENT DISPATCHER
# =========================
def send_incident(fall_detected, movement_status, is_critical, location, frame=None):
    global last_alert_time, alert_triggered
    current_time = time.time()
    
    if current_time - last_alert_time < ALERT_COOLDOWN_SECONDS:
        return
    last_alert_time = current_time

    image_filename = None
    if frame is not None:
        filename = f"incident_{int(time.time())}.jpg"
        temp_path = os.path.join("uploads", filename)
        os.makedirs("uploads", exist_ok=True)
        cv2.imwrite(temp_path, frame)
        image_filename = filename
        print(f"📸 Snapshot captured and saved locally as: {filename}")

    payload = {
        "fall": fall_detected,
        "movement": movement_status,
        "critical": is_critical,
        "location": location,
        "image_filename": image_filename
    }

    # Setup headers with API key authentication
    headers = {'Content-Type': 'application/json'}
    if API_KEY:
        headers['X-API-Key'] = API_KEY

    try:
        # target versioned API endpoint /api/v1/
        url = f"{API_BASE}/api/v1/incident"
        res = requests.post(url, json=payload, headers=headers, timeout=10)
        
        if res.status_code == 201:
            print(f"🚨 Incident logged successfully in backend: {movement_status.upper()}")
            alert_triggered = True
        else:
            print(f"❌ Failed to log incident: {res.status_code} - {res.text}")
    except Exception as e:
        print(f"❌ Connection error posting incident: {e}")

# =========================
# SPEECH AUDIO DISTRESS
# =========================
def audio_listener():
    global audio_listening
    try:
        import speech_recognition as sr
    except ImportError:
        print("❌ speech_recognition module not installed. Audio tracking disabled.")
        return

    r = sr.Recognizer()
    try:
        mic = sr.Microphone()
    except Exception as ex:
        print(f"❌ Failed to acquire microphone hardware: {ex}. Audio tracking disabled.")
        return

    print("🎙️ Audio distress listener started. Monitoring microphone...")

    while audio_listening:
        try:
            with mic as source:
                r.adjust_for_ambient_noise(source, duration=1)
                audio = r.listen(source, phrase_time_limit=3)
            
            text = r.recognize_google(audio).lower()
            print(f"🎙️ Heard: '{text}'")

            if any(kw in text for kw in DISTRESS_KEYWORDS):
                print("🚨 Distress keyword recognized via mic!")
                send_incident(
                    fall_detected=False,
                    movement_status="audio_only",
                    is_critical=True,
                    location=f"{CAMERA_LOCATION} (Voice Distress)"
                )
        except sr.UnknownValueError:
            pass
        except sr.RequestError as e:
            print(f"⚠️ Speech Recognition service failure: {e}")
        except Exception as e:
            if audio_listening:
                print(f"⚠️ Audio listener exception: {e}")
                time.sleep(1)

# =========================
# BACKEND CONNECTION RETRY
# =========================
def wait_for_backend():
    attempts = CONFIG.get('reconnect_attempts', 5)
    delay = CONFIG.get('reconnect_delay_seconds', 3)
    
    print(f"📡 Testing connection to Flask backend at {API_BASE}/api/v1/status...")
    
    for attempt in range(1, attempts + 1):
        try:
            res = requests.get(f"{API_BASE}/api/v1/status", timeout=3)
            if res.status_code == 200:
                print("✅ Successfully connected to backend API.")
                return True
        except Exception:
            pass
        print(f"⏳ Backend not ready. Attempt {attempt}/{attempts}. Retrying in {delay}s...")
        time.sleep(delay)
        
    print("⚠️ Backend unreachable after all attempts. Starting in offline local capture mode.")
    return False

# =========================
# MAIN EXECUTION
# =========================
def main():
    global cap, alert_triggered
    
    # Check backend readiness
    wait_for_backend()

    # Audio monitor initiation
    if AUDIO_ENABLED:
        audio_thread = threading.Thread(target=audio_listener, daemon=True)
        audio_thread.start()
    else:
        print("Static configuration has 'audio_enabled': false. Audio thread disabled.")

    # Initialize video capture index
    cap = cv2.VideoCapture(CAMERA_INDEX)
    if not cap.isOpened():
        print(f"❌ Error: Could not open Video Capture index: {CAMERA_INDEX}")
        return

    # Background subtractor
    backSub = cv2.createBackgroundSubtractorMOG2(history=300, varThreshold=25, detectShadows=True)

    print("\n=============================================")
    # Visual HUD settings
    print("🚀 FallingDown AI - Product-Grade Edge Client Active")
    print("=============================================")
    print("Keyboard bindings on feed screen:")
    print("  'f' : Force trigger Fall incident")
    print("  'a' : Force trigger Audio distress incident")
    print("  'r' : Reset alert status to SAFE")
    print("  'q' : Quit client")
    print("=============================================\n")

    prev_y = None
    consecutive_fall_frames = 0

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            print("❌ Capture frame empty. Exiting feed loop.")
            break

        frame = cv2.flip(frame, 1)
        display_frame = frame.copy()
        h, w, _ = frame.shape

        # Process frame details
        fgMask = backSub.apply(frame)
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        fgMask = cv2.morphologyEx(fgMask, cv2.MORPH_OPEN, kernel)
        fgMask = cv2.morphologyEx(fgMask, cv2.MORPH_CLOSE, kernel)

        fall_detected_this_frame = False

        # Find contours of moving subject
        contours, _ = cv2.findContours(fgMask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        if contours:
            large_contours = [c for c in contours if cv2.contourArea(c) > 3000]
            if large_contours:
                person_contour = max(large_contours, key=cv2.contourArea)
                x, y, bw, bh = cv2.boundingRect(person_contour)

                aspect_ratio = bw / (bh if bh > 0 else 1)
                is_horizontal = aspect_ratio > 1.2
                
                speed = 0
                if prev_y is not None:
                    speed = y - prev_y

                # Fall heuristics
                if is_horizontal and (speed > 35 or y > h * 0.45):
                    consecutive_fall_frames += 1
                else:
                    consecutive_fall_frames = max(0, consecutive_fall_frames - 1)

                if consecutive_fall_frames >= FALL_FRAME_THRESHOLD:
                    fall_detected_this_frame = True

                prev_y = y

                # Display bounding box HUD overlay
                box_color = (0, 0, 255) if fall_detected_this_frame or alert_triggered else (0, 255, 0)
                cv2.rectangle(display_frame, (x, y), (x + bw, y + bh), box_color, 2)
                cv2.circle(display_frame, (int(x + bw/2), int(y + bh/2)), 4, (255, 0, 0), -1)
                cv2.putText(display_frame, f"AR: {aspect_ratio:.2f}", (x, y - 25), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
                cv2.putText(display_frame, f"Speed: {speed}", (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
            else:
                consecutive_fall_frames = max(0, consecutive_fall_frames - 1)
        else:
            consecutive_fall_frames = max(0, consecutive_fall_frames - 1)

        # Trigger Alerts
        if fall_detected_this_frame:
            status_label = "FALL DETECTED!"
            status_color = (0, 0, 255)
            send_incident(
                fall_detected=True,
                movement_status="fall_detected",
                is_critical=True,
                location=CAMERA_LOCATION,
                frame=frame
            )
        elif alert_triggered:
            status_label = "ALERT ACTIVE"
            status_color = (0, 165, 255)
        else:
            status_label = "SAFE"
            status_color = (0, 255, 0)

        # Status text overlay
        cv2.rectangle(display_frame, (10, 10), (320, 60), (0, 0, 0), -1)
        cv2.putText(display_frame, f"STATUS: {status_label}", (20, 42), cv2.FONT_HERSHEY_SIMPLEX, 0.7, status_color, 2)

        # Draw frame
        cv2.imshow("FallingDown AI - Live Guardian Feed", display_frame)

        # Key captures
        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            break
        elif key == ord('f'):
            print("⌨️ Forced Fall incident Simulation...")
            send_incident(
                fall_detected=True,
                movement_status="fall_detected",
                is_critical=True,
                location=CAMERA_LOCATION,
                frame=frame
            )
        elif key == ord('a'):
            print("⌨️ Forced Audio distress Simulation...")
            send_incident(
                fall_detected=False,
                movement_status="audio_only",
                is_critical=True,
                location=f"{CAMERA_LOCATION} (Manual Audio Sim)"
            )
        elif key == ord('r'):
            print("🔄 Resetting alert state to SAFE")
            alert_triggered = False

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
