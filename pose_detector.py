"""
FallingDown AI — pose_detector.py
MediaPipe Tasks API (v0.10+) — skeleton-based fall detection
"""
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

# MediaPipe Tasks API (works with mediapipe >=0.10)
import mediapipe as mp
from mediapipe.tasks import python as mp_python
from mediapipe.tasks.python import vision as mp_vision

# =========================
# CONFIGURATION
# =========================
def load_config():
    try:
        with open('detector_config.json', 'r') as f:
            print("📖 Loaded configuration from detector_config.json")
            return json.load(f)
    except FileNotFoundError:
        print("⚠️  detector_config.json not found. Using defaults.")
        return {}

CONFIG = load_config()

API_BASE           = CONFIG.get('api_base',            'http://localhost:5000')
API_KEY            = CONFIG.get('api_key',             '')
CAMERA_INDEX       = CONFIG.get('camera_index',        0)
CAMERA_LOCATION    = CONFIG.get('camera_location',     'Camera 01')
ALERT_COOLDOWN     = CONFIG.get('alert_cooldown_seconds', 30)
AUDIO_ENABLED      = CONFIG.get('audio_enabled',       True)
DISTRESS_KEYWORDS  = CONFIG.get('distress_keywords', [
    "help me", "help", "emergency", "fall", "save me", "ouch", "i fell"
])

# ── Fall detection thresholds ────────────────────────────────────────────────
# Spine angle from vertical (shoulder→hip line).
#   0° = upright,  90° = horizontal
SPINE_ANGLE_THRESHOLD = CONFIG.get('spine_angle_threshold', 50)

# Head-below-hip ratio (nose_y / hip_y in normalised [0,1] coords).
#   < 1.0 = head above hips (normal)
#   > 1.0 = head below hips (strong fall sign)
HEAD_BELOW_HIP_RATIO  = CONFIG.get('head_below_hip_ratio',  0.85)

# Consecutive frames where BOTH conditions are true before alert fires
FALL_FRAME_THRESHOLD  = CONFIG.get('fall_frame_threshold',  20)

# Path to the downloaded .task model file
MODEL_PATH = CONFIG.get('model_path', 'pose_landmarker.task')

# Landmark indices used by PoseLandmarker (33-point model)
IDX_NOSE           = 0
IDX_LEFT_SHOULDER  = 11
IDX_RIGHT_SHOULDER = 12
IDX_LEFT_HIP       = 23
IDX_RIGHT_HIP      = 24
# ─────────────────────────────────────────────────────────────────────────────

# Globals
alert_triggered = False
last_alert_time = 0
audio_listening = True
cap             = None


# =========================
# SIGNAL HANDLER
# =========================
def shutdown_handler(sig, frame):
    global audio_listening, cap
    print("\n🛑 Shutting down gracefully...")
    audio_listening = False
    if cap:
        cap.release()
    cv2.destroyAllWindows()
    sys.exit(0)

signal.signal(signal.SIGINT,  shutdown_handler)
signal.signal(signal.SIGTERM, shutdown_handler)


# =========================
# GEOMETRY
# =========================
def spine_angle_from_vertical(landmarks, img_w, img_h):
    """
    Returns (angle_deg, shoulder_px, hip_px, nose_px) or None if
    landmark confidence is too low.

    angle_deg:
        0°  = perfectly upright
        90° = fully horizontal (fallen)
    """
    ls   = landmarks[IDX_LEFT_SHOULDER]
    rs   = landmarks[IDX_RIGHT_SHOULDER]
    lh   = landmarks[IDX_LEFT_HIP]
    rh   = landmarks[IDX_RIGHT_HIP]
    nose = landmarks[IDX_NOSE]

    # Visibility is in .visibility  (Tasks API uses NormalizedLandmark)
    vis  = min(ls.visibility or 0, rs.visibility or 0,
               lh.visibility or 0, rh.visibility or 0)
    if vis < 0.5:
        return None

    # Convert to pixel coordinates
    sx = int((ls.x + rs.x) / 2 * img_w)
    sy = int((ls.y + rs.y) / 2 * img_h)
    hx = int((lh.x + rh.x) / 2 * img_w)
    hy = int((lh.y + rh.y) / 2 * img_h)
    nx = int(nose.x * img_w)
    ny = int(nose.y * img_h)

    # Angle from vertical
    dx  = sx - hx
    dy  = sy - hy   # negative when shoulder is ABOVE hip (normal standing)
    angle = float(np.degrees(np.arctan2(abs(dx), abs(dy) or 1)))

    # Head-below-hip ratio (normalised coords)
    hip_y_norm = (lh.y + rh.y) / 2
    hbh        = float(nose.y / hip_y_norm) if hip_y_norm > 0.01 else 0.0

    return angle, hbh, (sx, sy), (hx, hy), (nx, ny)


# =========================
# INCIDENT DISPATCHER
# =========================
def send_incident(fall_detected, movement_status, is_critical, location, frame=None):
    global last_alert_time, alert_triggered
    now = time.time()
    if now - last_alert_time < ALERT_COOLDOWN:
        return
    last_alert_time = now

    image_filename = None
    if frame is not None:
        fname = f"incident_{int(time.time())}.jpg"
        os.makedirs("uploads", exist_ok=True)
        cv2.imwrite(os.path.join("uploads", fname), frame)
        image_filename = fname
        print(f"📸 Snapshot saved: {fname}")

    headers = {"Content-Type": "application/json"}
    if API_KEY:
        headers["X-API-Key"] = API_KEY

    try:
        res = requests.post(
            f"{API_BASE}/api/v1/incident",
            json={"fall": fall_detected, "movement": movement_status,
                  "critical": is_critical, "location": location,
                  "image_filename": image_filename},
            headers=headers, timeout=10
        )
        if res.status_code == 201:
            print(f"🚨 Incident logged: {movement_status.upper()}")
            alert_triggered = True
        else:
            print(f"❌ Backend error: {res.status_code} — {res.text}")
    except Exception as e:
        print(f"❌ Connection error: {e}")


# =========================
# AUDIO DISTRESS
# =========================
def audio_listener():
    global audio_listening
    try:
        import speech_recognition as sr
    except ImportError:
        print("❌ speech_recognition not installed — audio disabled.")
        return
    r = sr.Recognizer()
    try:
        mic = sr.Microphone()
    except Exception as ex:
        print(f"❌ Mic error: {ex}")
        return

    print("🎙️  Audio listener active.")
    while audio_listening:
        try:
            with mic as src:
                r.adjust_for_ambient_noise(src, duration=1)
                audio = r.listen(src, phrase_time_limit=3)
            text = r.recognize_google(audio).lower()
            print(f"🎙️  Heard: '{text}'")
            if any(kw in text for kw in DISTRESS_KEYWORDS):
                print("🚨 Distress keyword!")
                send_incident(False, "audio_only", True,
                              f"{CAMERA_LOCATION} (Voice Distress)")
        except sr.UnknownValueError:
            pass
        except Exception as e:
            if audio_listening:
                time.sleep(1)


# =========================
# BACKEND PROBE
# =========================
def wait_for_backend():
    attempts = CONFIG.get('reconnect_attempts', 5)
    delay    = CONFIG.get('reconnect_delay_seconds', 3)
    print(f"📡 Connecting to {API_BASE} …")
    for i in range(1, attempts + 1):
        try:
            r = requests.get(f"{API_BASE}/api/v1/status", timeout=3)
            if r.status_code == 200:
                print("✅ Backend connected.")
                return True
        except Exception:
            pass
        print(f"⏳ Attempt {i}/{attempts} — retrying in {delay}s …")
        time.sleep(delay)
    print("⚠️  Backend unreachable — offline mode.")
    return False


# =========================
# DRAW SKELETON CONNECTIONS
# =========================
POSE_CONNECTIONS = [
    # Torso
    (11, 12), (11, 23), (12, 24), (23, 24),
    # Left arm
    (11, 13), (13, 15),
    # Right arm
    (12, 14), (14, 16),
    # Left leg
    (23, 25), (25, 27),
    # Right leg
    (24, 26), (26, 28),
]

def draw_skeleton(disp, landmarks, img_w, img_h, color=(0, 220, 50)):
    pts = {}
    for idx, lm in enumerate(landmarks):
        px = int(lm.x * img_w)
        py = int(lm.y * img_h)
        pts[idx] = (px, py)
        cv2.circle(disp, (px, py), 4, (255, 200, 0), -1)

    for (a, b) in POSE_CONNECTIONS:
        if a in pts and b in pts:
            cv2.line(disp, pts[a], pts[b], color, 2)


# =========================
# MAIN
# =========================
def main():
    global cap, alert_triggered

    # Check model file
    if not os.path.exists(MODEL_PATH):
        print(f"❌ Model file '{MODEL_PATH}' not found.")
        print("   Run this to download it:")
        print("   curl -L https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task -o pose_landmarker.task")
        sys.exit(1)

    wait_for_backend()

    if AUDIO_ENABLED:
        threading.Thread(target=audio_listener, daemon=True).start()

    cap = cv2.VideoCapture(CAMERA_INDEX)
    if not cap.isOpened():
        print(f"❌ Cannot open camera {CAMERA_INDEX}")
        return

    # ── Build MediaPipe Tasks PoseLandmarker ──────────────────────────────
    base_opts = mp_python.BaseOptions(model_asset_path=MODEL_PATH)
    pose_opts = mp_vision.PoseLandmarkerOptions(
        base_options=base_opts,
        running_mode=mp_vision.RunningMode.IMAGE,   # per-frame (static) mode
        num_poses=1,
        min_pose_detection_confidence=0.55,
        min_pose_presence_confidence=0.55,
        min_tracking_confidence=0.55,
    )
    landmarker = mp_vision.PoseLandmarker.create_from_options(pose_opts)

    print("\n" + "=" * 55)
    print("🚀 FallingDown AI  —  MediaPipe Tasks Fall Detector")
    print(f"   Spine angle threshold  : ≥ {SPINE_ANGLE_THRESHOLD}° from vertical")
    print(f"   Head / hip ratio guard : ≥ {HEAD_BELOW_HIP_RATIO}")
    print(f"   Consecutive frames     : {FALL_FRAME_THRESHOLD}")
    print(f"   Model                  : {MODEL_PATH}")
    print("=" * 55)
    print("  f → force fall   a → audio alert   r → reset   q → quit")
    print("=" * 55 + "\n")

    consecutive_fall_frames = 0
    angle_history            = []
    SMOOTH_LEN               = 5

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            print("❌ Empty frame — exiting.")
            break

        frame = cv2.flip(frame, 1)
        h, w  = frame.shape[:2]
        disp  = frame.copy()

        # ── Run MediaPipe ─────────────────────────────────────────────────
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB,
                            data=cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
        result   = landmarker.detect(mp_image)

        fall_this_frame = False
        spine_angle     = 0.0
        smoothed_angle  = 0.0
        hbh_ratio       = 0.0

        if result.pose_landmarks:
            landmarks = result.pose_landmarks[0]   # first person

            # Draw skeleton
            spine_color = (0, 0, 255) if fall_this_frame else \
                          (0, 140, 255) if smoothed_angle >= SPINE_ANGLE_THRESHOLD else \
                          (0, 220, 50)
            draw_skeleton(disp, landmarks, w, h, color=spine_color)

            # Compute spine angle + head/hip ratio
            info = spine_angle_from_vertical(landmarks, w, h)
            if info is not None:
                spine_angle, hbh_ratio, shoulder_px, hip_px, nose_px = info

                # Smooth angle
                angle_history.append(spine_angle)
                if len(angle_history) > SMOOTH_LEN:
                    angle_history.pop(0)
                smoothed_angle = np.mean(angle_history)

                # Draw spine line (coloured by severity)
                s_col = (0, 0, 255)   if smoothed_angle >= SPINE_ANGLE_THRESHOLD else \
                        (0, 220, 50)
                cv2.line(disp, shoulder_px, hip_px, s_col, 4)
                cv2.circle(disp, shoulder_px, 7, (255, 200, 0), -1)
                cv2.circle(disp, hip_px,      7, (255, 200, 0), -1)
                cv2.circle(disp, nose_px,     5, (255, 100, 100), -1)

                # ── Fall logic ───────────────────────────────────────────
                angle_ok = smoothed_angle >= SPINE_ANGLE_THRESHOLD
                head_ok  = hbh_ratio      >= HEAD_BELOW_HIP_RATIO

                if angle_ok and head_ok:
                    consecutive_fall_frames += 1
                elif angle_ok:
                    # Tilt alone — climb slower, never reach threshold solo
                    consecutive_fall_frames = min(
                        consecutive_fall_frames + 1,
                        FALL_FRAME_THRESHOLD - 1
                    )
                else:
                    consecutive_fall_frames = max(0, consecutive_fall_frames - 3)
                    if consecutive_fall_frames == 0:
                        angle_history.clear()

                if consecutive_fall_frames >= FALL_FRAME_THRESHOLD:
                    fall_this_frame = True

                # ── Info overlay ─────────────────────────────────────────
                ox, oy = shoulder_px[0] + 12, shoulder_px[1] - 12
                cv2.putText(disp, f"Spine: {smoothed_angle:.1f}° (≥{SPINE_ANGLE_THRESHOLD}°)",
                            (ox, oy),      cv2.FONT_HERSHEY_SIMPLEX, 0.48, (220, 220, 255), 1)
                cv2.putText(disp, f"H/Hip: {hbh_ratio:.2f} (≥{HEAD_BELOW_HIP_RATIO})",
                            (ox, oy + 16), cv2.FONT_HERSHEY_SIMPLEX, 0.44, (220, 220, 255), 1)
                cv2.putText(disp, f"Frames: {consecutive_fall_frames}/{FALL_FRAME_THRESHOLD}",
                            (ox, oy + 30), cv2.FONT_HERSHEY_SIMPLEX, 0.44, (220, 220, 255), 1)
            else:
                consecutive_fall_frames = max(0, consecutive_fall_frames - 1)
        else:
            consecutive_fall_frames = max(0, consecutive_fall_frames - 1)

        # ── Fire alert ────────────────────────────────────────────────────
        if fall_this_frame:
            status_label = "FALL DETECTED!"
            status_color = (0, 0, 255)
            send_incident(True, "fall_detected", True, CAMERA_LOCATION, frame=frame)
        elif alert_triggered:
            status_label = "ALERT ACTIVE"
            status_color = (0, 140, 255)
        else:
            status_label = "SAFE"
            status_color = (0, 220, 0)

        # ── Status bar ────────────────────────────────────────────────────
        cv2.rectangle(disp, (0, 0), (w, 56), (0, 0, 0), -1)
        cv2.putText(disp, f"STATUS: {status_label}",
                    (14, 36), cv2.FONT_HERSHEY_SIMPLEX, 0.9, status_color, 2)
        cv2.putText(disp,
                    f"Spine {smoothed_angle:.1f}°  H/Hip {hbh_ratio:.2f}  "
                    f"frames {consecutive_fall_frames}/{FALL_FRAME_THRESHOLD}",
                    (14, 53), cv2.FONT_HERSHEY_SIMPLEX, 0.38, (150, 150, 150), 1)

        cv2.imshow("FallingDown AI — Guardian Feed", disp)

        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            break
        elif key == ord('f'):
            print("⌨️  Forced fall …")
            send_incident(True, "fall_detected", True, CAMERA_LOCATION, frame=frame)
        elif key == ord('a'):
            print("⌨️  Forced audio distress …")
            send_incident(False, "audio_only", True,
                          f"{CAMERA_LOCATION} (Manual Audio Sim)")
        elif key == ord('r'):
            print("🔄  Reset → SAFE")
            alert_triggered          = False
            consecutive_fall_frames  = 0
            angle_history.clear()

    landmarker.close()
    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
