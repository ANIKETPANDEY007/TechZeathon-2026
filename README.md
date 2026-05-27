# FallingDown AI — Elder Care Monitoring Platform

FallingDown AI is a state-of-the-art non-wearable elder care monitoring platform. It turns any home smart camera or webcam into a real-time safety guardian. Using background differencing and computer vision heuristics, the platform detects physical falls and acoustic distress sounds without requiring the resident to wear tracking tags or pendants.

---

## 🏗️ Architecture

The platform consists of three main components:
1. **Flask API Backend (`app.py`)**: Namespaced under `/api/v1/`, this Python backend connects to a MongoDB instance (with memory fallback), manages twilio dispatch threads asynchronously, applies rate limits, sanitizes user leads, and uses the Google Gemini `gemini-2.0-flash` model.
2. **Edge Client Tracker (`pose_detector.py`)**: A Python-based edge vision processor utilizing OpenCV to analyze motion trajectories, calculate centroid rates, and report incidents using authorization headers.
3. **Monolithic Dashboard (`index.html`)**: A dark-mode, glassmorphic single-page web app implementing local PIN security guards (`1234` by default), Stored XSS protection, persistent session chatbot history, PWA manifests, and native browser-based live webcam differencing fall/distress alerts.

---

## 📦 File Structure

```
.
├── app.py                  # Namespaced Flask API Server
├── pose_detector.py        # Edge client visual processor
├── config.py               # Central environment configurations
├── models.py               # MongoDB collection indexes
├── middleware.py           # Rate limiters & input sanitization
├── index.html              # Secure Monolithic UI Dashboard (PWA)
├── requirements.txt        # Python package dependencies
├── .env.example            # Environment variables configuration template
├── .gitignore              # Git ignored paths filters
└── README.md               # Product documentation
```

---

## ⚙️ Quick Start

### 1. Configure the Environment
Copy the example environment file and update with your API keys:
```bash
cp .env.example .env
```

**Team Members:**
- Aniket Pandey (Frontend and Backend)

Set up your variables:
* `GEMINI_API_KEY`: Google AI Studio API Key.
* `MONGO_URI`: MongoDB connection string.
* `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_NUMBER`: Credentials to send WhatsApp notifications.
* `CAREGIVER_WHATSAPP_NUMBER`: Recipient phone number (e.g. `whatsapp:+91XXXXXXXXXX`).

### 2. Run the Backend API
Install dependencies:
```bash
pip install -r requirements.txt
```

Launch the Flask backend:
```bash
python app.py
```
*The server logs actions directly to `fallingdown.log` and the standard console.*

### 3. Open the Frontend
Simply open `index.html` in any web browser. To test the dashboard:
1. Navigate to `#dashboard`.
2. Enter the default access PIN: `1234`.
3. Use the **Start Web Feed** button to test the native camera tracking on your laptop!

### 4. Run the Edge Vision Client
Run the edge processor script:
```bash
python pose_detector.py
```
*Make sure to configure the correct API keys in your `detector_config.json` before connecting to a secured production backend.*
