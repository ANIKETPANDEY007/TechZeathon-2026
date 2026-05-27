import cv2
import numpy as np
import requests
import time
import os
import threading
from datetime import datetime
import speech_recognition as sr

# API Config
API_BASE = "http://localhost:5000"

# Flags & State
latest_status = "SAFE"
alert_triggered = False
last_alert_time = 0
audio_listening = True

def send_incident(fall_detected, movement_status, is_critical, location, frame=None):
    global last_alert_time, alert_triggered
    current_time = time.time()
    # Cooldown of 5 seconds to prevent duplicate spamming
    if current_time - last_alert_time < 5:
        return
    last_alert_time = current_time

    image_filename = None
    if frame is not None:
        filename = f"incident_{int(time.time())}.jpg"
        temp_path = os.path.join("uploads", filename)
        # Ensure uploads directory exists
        os.makedirs("uploads", exist_ok=True)
        cv2.imwrite(temp_path, frame)
        image_filename = filename
        print(f"📸 Captured incident frame and saved as {filename}")

    payload = {
        "fall": fall_detected,
        "movement": movement_status,
        "critical": is_critical,
        "location": location,
        "image_filename": image_filename
    }

    try:
        res = requests.post(f"{API_BASE}/api/incident", json=payload)
        if res.status_code == 201:
            print(f"🚨 Incident successfully reported: {movement_status.upper()}")
            alert_triggered = True
        else:
            print(f"❌ Failed to report incident: {res.text}")
    except Exception as e:
        print(f"❌ Error connecting to backend: {e}")

def audio_listener():
    global audio_listening
    r = sr.Recognizer()
    mic = sr.Microphone()

    print("🎙️ Audio safety listener started. Listening for 'help me' or distress keywords...")

    while audio_listening:
        try:
            with mic as source:
                r.adjust_for_ambient_noise(source, duration=1)
                audio = r.listen(source, phrase_time_limit=3)
            
            # Recognize speech
            text = r.recognize_google(audio).lower()
            print(f"🎙️ Heard: '{text}'")

            distress_keywords = ["help me", "help", "emergency", "fall", "save me", "ouch", "help check"]
            if any(kw in text for kw in distress_keywords):
                print("🚨 Distress keyword detected! Sending alert...")
                send_incident(
                    fall_detected=False,
                    movement_status="audio_only",
                    is_critical=True,
                    location="Privacy Zone (Bathroom)"
                )
        except sr.UnknownValueError:
            # Audio was not clear enough
            pass
        except sr.RequestError as e:
            print(f"⚠️ Speech Recognition service error: {e}")
        except Exception as e:
            print(f"⚠️ Audio listener exception: {e}")
            time.sleep(1)

def main():
    global alert_triggered
    # Start audio listener thread
    audio_thread = threading.Thread(target=audio_listener, daemon=True)
    audio_thread.start()

    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("❌ Error: Could not open webcam.")
        return

    # Background subtractor for contour detection
    backSub = cv2.createBackgroundSubtractorMOG2(history=300, varThreshold=25, detectShadows=True)

    print("\n=============================================")
    print("🚀 FallingDown AI - Real-time Edge AI Client")
    print("=============================================")
    print("Key controls on Video Window:")
    print("  'f' : Force trigger Fall simulation")
    print("  'a' : Force trigger Audio distress simulation")
    print("  'r' : Reset status to SAFE")
    print("  'q' : Quit client")
    print("=============================================\n")

    # Fall detection state variables
    prev_y = None
    consecutive_fall_frames = 0

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            print("❌ Error: Failed to grab frame.")
            break

        # Flip horizontally for natural mirror view
        frame = cv2.flip(frame, 1)
        display_frame = frame.copy()
        h, w, _ = frame.shape

        # Apply background subtraction
        fgMask = backSub.apply(frame)

        # Clean up mask with morphological operations
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        fgMask = cv2.morphologyEx(fgMask, cv2.MORPH_OPEN, kernel)
        fgMask = cv2.morphologyEx(fgMask, cv2.MORPH_CLOSE, kernel)

        fall_detected_this_frame = False

        # Find contours of moving objects
        contours, _ = cv2.findContours(fgMask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        if contours:
            # Filter contours by size to find the person
            large_contours = [c for c in contours if cv2.contourArea(c) > 3000]
            if large_contours:
                # Get the largest moving contour (assumed to be the person)
                person_contour = max(large_contours, key=cv2.contourArea)
                x, y, bw, bh = cv2.boundingRect(person_contour)

                centroid_y = y + bh / 2
                aspect_ratio = bw / bh  # horizontal width / vertical height

                # Fall Detection Heuristics:
                # 1. High Aspect Ratio: When lying down, width is usually greater than height (aspect_ratio > 1.15)
                # 2. Vertical Speed: If the top of the bounding box drops rapidly
                is_horizontal = aspect_ratio > 1.15

                speed = 0
                if prev_y is not None:
                    speed = y - prev_y # positive means moving down

                # If moving down rapidly and aspect ratio is horizontal, or just aspect ratio is high and low in frame
                if is_horizontal and (speed > 40 or y > h * 0.4):
                    consecutive_fall_frames += 1
                else:
                    consecutive_fall_frames = max(0, consecutive_fall_frames - 1)

                # Trigger fall alert if conditions persist for 5 frames
                if consecutive_fall_frames >= 5:
                    fall_detected_this_frame = True

                prev_y = y

                # Draw bounding box and tracking metrics on the display
                box_color = (0, 0, 255) if fall_detected_this_frame or alert_triggered else (0, 255, 0)
                cv2.rectangle(display_frame, (x, y), (x + bw, y + bh), box_color, 2)
                cv2.circle(display_frame, (int(x + bw/2), int(y + bh/2)), 5, (255, 0, 0), -1)
                cv2.putText(display_frame, f"AR: {aspect_ratio:.2f}", (x, y - 25), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
                cv2.putText(display_frame, f"Speed: {speed}", (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
            else:
                consecutive_fall_frames = max(0, consecutive_fall_frames - 1)
        else:
            consecutive_fall_frames = max(0, consecutive_fall_frames - 1)

        # Handle Alert States
        if fall_detected_this_frame:
            status_label = "FALL DETECTED!"
            status_color = (0, 0, 255) # Red
            send_incident(
                fall_detected=True,
                movement_status="fall_detected",
                is_critical=True,
                location="Camera 01",
                frame=frame
            )
        elif alert_triggered:
            status_label = "ALERT ACTIVE"
            status_color = (0, 165, 255) # Orange
        else:
            status_label = "SAFE"
            status_color = (0, 255, 0) # Green

        # Overlay status panel on video feed
        cv2.rectangle(display_frame, (10, 10), (320, 60), (0, 0, 0), -1)
        cv2.putText(display_frame, f"STATUS: {status_label}", (20, 42), cv2.FONT_HERSHEY_SIMPLEX, 0.7, status_color, 2)

        # Show frame
        cv2.imshow("FallingDown AI - Live Guardian Feed", display_frame)

        # Handle key inputs
        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            break
        elif key == ord('f'):
            print("⌨️ Keyboard trigger: Fall Incident Simulating...")
            send_incident(
                fall_detected=True,
                movement_status="fall_detected",
                is_critical=True,
                location="Camera 01",
                frame=frame
            )
        elif key == ord('a'):
            print("⌨️ Keyboard trigger: Audio Distress Simulating...")
            send_incident(
                fall_detected=False,
                movement_status="audio_only",
                is_critical=True,
                location="Privacy Zone (Bathroom)"
            )
        elif key == ord('r'):
            print("🔄 Keyboard trigger: Reset state to SAFE")
            alert_triggered = False
            status_label = "SAFE"
            status_color = (0, 255, 0)

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
