import cv2
import mediapipe as mp
import numpy as np
import requests
import time
import os
import sys
import json
import signal
import threading
import speech_recognition as sr
from datetime import datetime
from collections import deque
import math

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
FALL_FRAME_THRESHOLD = CONFIG.get('fall_frame_threshold', 5)  
ALERT_COOLDOWN_SECONDS = CONFIG.get('alert_cooldown_seconds', 5)
AUDIO_ENABLED = CONFIG.get('audio_enabled', True)

# Global Tracking States
latest_status = "SAFE"
alert_triggered = False
last_alert_time = 0
audio_listening = True
cap = None

# Voice alerts rolling window
distress_timestamps = deque()
voice_normal_active = False
voice_critical_active = False

# Lock for multi-threaded variable access
data_lock = threading.Lock()

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

    headers = {'Content-Type': 'application/json'}
    if API_KEY:
        headers['X-API-Key'] = API_KEY

    try:
        url = f"{API_BASE}/api/v1/incident" # Change this endpoint if your Flask backend uses /api/incident instead
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
    global audio_listening, distress_timestamps, voice_normal_active, voice_critical_active
    
    r = sr.Recognizer()
    try:
        mic = sr.Microphone()
    except Exception as ex:
        print(f"❌ Failed to acquire microphone hardware: {ex}. Audio tracking disabled.")
        return

    print("🎙️ Audio distress listener started. Calibrating...")
    with mic as source:
        r.adjust_for_ambient_noise(source, duration=2)
    print("✅ Privacy Mode Active: Monitoring for distress keywords (e.g., 'help', 'help me')...")

    voice_keywords = ["help", "help me", "i fell", "fallen", "emergency", "save me", "can't get up"]

    while audio_listening:
        try:
            with mic as source:
                audio = r.listen(source, timeout=5, phrase_time_limit=5)
            
            text = r.recognize_google(audio).lower()
            print(f"👂 Heard: '{text}'")

            if any(kw in text for kw in voice_keywords):
                now = time.time()
                with data_lock:
                    distress_timestamps.append(now)
                    
                    # Clean up timestamps older than 60 seconds
                    while distress_timestamps and distress_timestamps[0] < now - 60:
                        distress_timestamps.popleft()
                    
                    count = len(distress_timestamps)
                    timestamp_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                    print(f"🎙️ Distress keyword heard! Time: {timestamp_str}, Current count: {count}")
                    
                    if count == 1:
                        print("🎙️ Heard distress once - monitoring for confirmation...")
                    
                    # 2 TIMES HELP = NORMAL FALL
                    elif count == 2:
                        print("🔔 AUDIO ALERT: Normal Fall Detected (Heard Help 2 times)")
                        voice_normal_active = True
                        send_incident(
                            fall_detected=True,
                            movement_status="normal_fall_audio",
                            is_critical=False,
                            location=f"{CAMERA_LOCATION} (Audio Zone)"
                        )
                    
                    # 3 TIMES HELP = CRITICAL FALL
                    elif count >= 3:
                        print("🚨 AUDIO ALERT: Critical Fall Detected! (Heard Help 3+ times)")
                        voice_critical_active = True
                        send_incident(
                            fall_detected=True,
                            movement_status="critical_fall_audio",
                            is_critical=True,
                            location=f"{CAMERA_LOCATION} (Audio Zone)"
                        )
                        distress_timestamps.clear()
                        
        except sr.WaitTimeoutError:
            pass 
        except sr.UnknownValueError:
            pass
        except sr.RequestError as e:
            print(f"⚠️ Speech Recognition service failure: {e}")
        except Exception as e:
            if audio_listening:
                print(f"⚠️ Audio listener exception: {e}")
                time.sleep(2)

# =========================
# BACKEND CONNECTION RETRY
# =========================
def wait_for_backend():
    attempts = CONFIG.get('reconnect_attempts', 5)
    delay = CONFIG.get('reconnect_delay_seconds', 3)
    
    print(f"📡 Testing connection to Flask backend...")
    
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
    global cap, alert_triggered, voice_normal_active, voice_critical_active, distress_timestamps
    
    wait_for_backend()

    if AUDIO_ENABLED:
        audio_thread = threading.Thread(target=audio_listener, daemon=True)
        audio_thread.start()
    else:
        print("Static configuration has 'audio_enabled': false. Audio thread disabled.")

    cap = cv2.VideoCapture(CAMERA_INDEX)
    if not cap.isOpened():
        print(f"❌ Error: Could not open Video Capture index: {CAMERA_INDEX}")
        return

    mp_pose = mp.solutions.pose
    pose = mp_pose.Pose(
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5
    )

    print("\n=============================================")
    print("🚀 FallingDown AI - Active Guardian Mode")
    print("=============================================")
    print("Keyboard bindings on feed screen:")
    print("  'f' : Force trigger Fall incident")
    print("  'a' : Force trigger Audio distress incident")
    print("  'r' : Reset alert status to SAFE")
    print("  'q' : Quit client")
    print("=============================================\n")

    hip_y_history = deque(maxlen=5)
    consecutive_fall_frames = 0
    prev_frame_time = time.time()

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            print("❌ Capture frame empty. Exiting feed loop.")
            break

        frame = cv2.flip(frame, 1)
        display_frame = frame.copy()
        h, w, _ = frame.shape

        current_time = time.time()
        time_elapsed = current_time - prev_frame_time
        fps = 1.0 / time_elapsed if time_elapsed > 0 else 0.0
        prev_frame_time = current_time

        with data_lock:
            while distress_timestamps and distress_timestamps[0] < current_time - 60:
                distress_timestamps.popleft()
            voice_alert_count = len(distress_timestamps)

        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = pose.process(rgb_frame)

        person_detected = False
        trunk_angle = 0.0
        aspect_ratio = 0.0
        vertical_drop_speed = 0.0

        cond_a = False  
        cond_b = False  
        cond_c = False  

        bbox_x1, bbox_y1, bbox_x2, bbox_y2 = 0, 0, 0, 0

        if results.pose_landmarks:
            landmarks = results.pose_landmarks.landmark
            
            l_shoulder = landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value]
            r_shoulder = landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value]
            l_hip = landmarks[mp_pose.PoseLandmark.LEFT_HIP.value]
            r_hip = landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value]

            shoulder_mid_x = ((l_shoulder.x + r_shoulder.x) / 2.0) * w
            shoulder_mid_y = ((l_shoulder.y + r_shoulder.y) / 2.0) * h
            hip_mid_x = ((l_hip.x + r_hip.x) / 2.0) * w
            hip_mid_y = ((l_hip.y + r_hip.y) / 2.0) * h

            dx = shoulder_mid_x - hip_mid_x
            dy = shoulder_mid_y - hip_mid_y
            
            trunk_angle = math.degrees(math.atan2(abs(dx), abs(dy)))
            if trunk_angle > 50.0:
                cond_a = True

            visible_x = []
            visible_y = []
            for lm in landmarks:
                if lm.visibility > 0.5:
                    visible_x.append(lm.x * w)
                    visible_y.append(lm.y * h)

            if visible_x:
                person_detected = True
                x_min, x_max = min(visible_x), max(visible_x)
                y_min, y_max = min(visible_y), max(visible_y)
                
                bbox_x1 = int(max(0, x_min))
                bbox_y1 = int(max(0, y_min))
                bbox_x2 = int(min(w, x_max))
                bbox_y2 = int(min(h, y_max))

                bw = bbox_x2 - bbox_x1
                bh = bbox_y2 - bbox_y1
                aspect_ratio = bw / (bh if bh > 0 else 1)
                
                if aspect_ratio > 1.2:
                    cond_b = True

            hip_y_history.append(hip_mid_y)
            if len(hip_y_history) >= 4:
                vertical_drop_speed = hip_y_history[-1] - hip_y_history[-4]
                if vertical_drop_speed > 80.0:
                    cond_c = True

        fall_confirmed_this_frame = False
        if person_detected:
            conditions_met = sum([cond_a, cond_b, cond_c]) >= 2
            if conditions_met:
                consecutive_fall_frames += 1
            else:
                consecutive_fall_frames = 0
            
            if consecutive_fall_frames >= FALL_FRAME_THRESHOLD:
                fall_confirmed_this_frame = True
        else:
            consecutive_fall_frames = 0

        if fall_confirmed_this_frame:
            status_label = "FALL DETECTED!"
            status_color = (0, 0, 255)
            send_incident(
                fall_detected=True,
                movement_status="fall_detected",
                is_critical=True,
                location=CAMERA_LOCATION,
                frame=frame
            )
        elif voice_critical_active:
            status_label = "AUDIO CRITICAL FALL"
            status_color = (0, 0, 255) 
        elif voice_normal_active:
            status_label = "AUDIO NORMAL FALL"
            status_color = (0, 165, 255) 
        elif alert_triggered:
            status_label = "FALL DETECTED!"
            status_color = (0, 0, 255)
        else:
            status_label = "SAFE"
            status_color = (0, 255, 0) 

        # Border for entire frame
        if status_label in ["FALL DETECTED!", "AUDIO CRITICAL FALL"] or fall_confirmed_this_frame:
            cv2.rectangle(display_frame, (0, 0), (w, h), (0, 0, 255), 4)

        if person_detected:
            if status_label in ["FALL DETECTED!", "AUDIO CRITICAL FALL"] or fall_confirmed_this_frame:
                # 🔴 NEW FEATURE: Draw heavy square around the fallen person
                cv2.rectangle(display_frame, (bbox_x1, bbox_y1), (bbox_x2, bbox_y2), (0, 0, 255), 5) 
                
                # Background for the text label to make it pop
                cv2.rectangle(display_frame, (bbox_x1, bbox_y1 - 35), (bbox_x1 + 220, bbox_y1), (0, 0, 255), -1)
                cv2.putText(display_frame, "FALL DETECTED HERE!", (bbox_x1 + 5, bbox_y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
            else:
                cv2.rectangle(display_frame, (bbox_x1, bbox_y1), (bbox_x2, bbox_y2), (0, 255, 0), 2)
                cv2.putText(display_frame, "✅ SAFE", (bbox_x1, max(15, bbox_y1 - 10)), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
        else:
            cv2.putText(display_frame, "👤 No person in frame", (20, h - 50), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)

        # Draw Status HUD Panel
        cv2.rectangle(display_frame, (10, 10), (320, 120), (0, 0, 0), -1)
        
        trunk_str = f"Trunk: {trunk_angle:.1f}°" if person_detected else "Trunk: N/A"
        ar_str = f"AR: {aspect_ratio:.2f}" if person_detected else "AR: N/A"
        voice_str = f"Voice Alerts: {voice_alert_count}/60s"

        cv2.putText(display_frame, f"STATUS: {status_label}", (20, 35), cv2.FONT_HERSHEY_SIMPLEX, 0.6, status_color, 2)
        cv2.putText(display_frame, trunk_str, (20, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
        cv2.putText(display_frame, ar_str, (20, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
        cv2.putText(display_frame, voice_str, (20, 100), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)

        cv2.putText(display_frame, f"FPS: {fps:.1f}", (10, h - 15), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)

        cv2.imshow("FallingDown AI - Live Guardian Feed", display_frame)

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
                fall_detected=True,
                movement_status="critical_fall_audio",
                is_critical=True,
                location=f"{CAMERA_LOCATION} (Manual Audio Sim)"
            )
            with data_lock:
                voice_critical_active = True
        elif key == ord('r'):
            print("🔄 Resetting alert state to SAFE")
            alert_triggered = False
            consecutive_fall_frames = 0
            hip_y_history.clear()
            with data_lock:
                distress_timestamps.clear()
                voice_normal_active = False
                voice_critical_active = False

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
