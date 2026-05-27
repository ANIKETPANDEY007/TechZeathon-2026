# FallingDown AI 🛡️

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Twilio](https://img.shields.io/badge/Twilio-F22F46?style=for-the-badge&logo=Twilio&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Gemini_AI-8E75B2?style=for-the-badge&logo=googlebard&logoColor=white)

FallingDown AI is a privacy-first, edge-computed elder care monitoring platform that transforms ordinary smart cameras into intelligent emergency guardians. Built with an emphasis on proactive intelligence rather than simple recording, it utilizes advanced skeletal tracking to detect rapid downward motion or unusual resting postures indicative of a fall. The system operates entirely locally for maximum privacy, features an audio-only mode for sensitive areas, and immediately triggers an automated escalation chain—alerting caregivers and family members via WhatsApp with vital evidence the moment an incident occurs.

## ✨ Features

- **Automated Fall Detection:** Real-time skeletal motion analysis to identify critical falls within 3 seconds.
- **Privacy-First Edge AI:** Video processing happens locally. No video stream is sent to the cloud.
- **Audio Safety Mode:** A zero-video, acoustic-only monitoring mode tailored for highly private zones like bathrooms.
- **Instant WhatsApp Alerts:** Automatic multi-tier escalation (duty nurse -> family) with blurred evidence photos powered by Twilio.
- **Hardware Agnostic:** Retrofits effortlessly into existing IP/RTSP camera networks without the need for wearables.
- **Live Monitoring Dashboard:** An enterprise-grade, single-page dashboard featuring live frame viewing, analytics, API polling, and an integrated Gemini AI chatbot assistant.

## 📸 Screenshots

> *Add screenshots of the live dashboard, landing page, and WhatsApp alert here.*
> 
> ![Dashboard Placeholder](https://via.placeholder.com/800x450.png?text=Dashboard+Screenshot)

## 🚀 Setup Guide

Follow these steps to run the FallingDown AI platform locally.

### Step 1: Clone the Repository
```bash
git clone https://github.com/ANIKETPANDEY007/TechZeathon-2026.git
cd "TechZeathon-2026"
```

### Step 2: Install Requirements
Make sure you have Python 3 installed. Then install the necessary dependencies:
```bash
pip install flask flask-cors python-dotenv twilio google-generativeai werkzeug
```

### Step 3: Set Environment Variables
Create a `.env` file in the root directory and configure the following variables for Twilio and Gemini integrations:
```env
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
CAREGIVER_WHATSAPP_NUMBER=whatsapp:+91XXXXXXXXXX
CAREGIVER2_WHATSAPP_NUMBER=whatsapp:+91XXXXXXXXXX
CAREGIVER3_WHATSAPP_NUMBER=whatsapp:+91XXXXXXXXXX
PUBLIC_URL=http://localhost:5000
GEMINI_API_KEY=your_gemini_api_key
```

### Step 4: Run the Backend
Start the Flask application which runs the API and serves the uploaded images.
```bash
python app.py
```
*The server will start running on `http://localhost:5000`.*

### Step 5: Open the Frontend
Since the frontend is a zero-build Single Page Application, simply locate the `index (1).html` file in your project folder and open it directly in your web browser (Chrome, Edge, Firefox, etc.).
```bash
# Example on macOS:
open "index (1).html"
```

---

## 🏆 Credits

Built with ❤️ for **TechZeathon 2026** by the **Three Fall Team**, Haldia Institute of Technology.

**Team Members:**
- Aniket Pandey (Frontend and Backend ) 
- 
