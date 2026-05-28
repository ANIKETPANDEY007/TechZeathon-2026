import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Camera, Record, HardDrives, Users,
  WarningCircle, ShieldCheck, BugBeetle, MicrophoneStage,
  ArrowsOut, ArrowsIn
} from '@phosphor-icons/react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useIncidents } from '../hooks/useIncidents';
import { useMLStatus } from '../hooks/useMLStatus';
import IncidentCard from '../components/IncidentCard';
import { postIncident, fetchLeads, uploadPhoto } from '../api/fallingdown';
import toast from 'react-hot-toast';
import { format, subDays } from 'date-fns';

const Dashboard = ({ user }) => {
  const navigate = useNavigate();
  const { logs, setLogs, latestStatus, isLoading: logsLoading } = useIncidents();
  const { isOnline, lastChecked } = useMLStatus();
  const [leads, setLeads] = useState([]);
  const [privacyMode, setPrivacyMode] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isLogExpanded, setIsLogExpanded] = useState(false);

  // Live feed webcam and speech states/refs
  const [isLiveFeedActive, setIsLiveFeedActive] = useState(false);
  const isLiveFeedActiveRef = useRef(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameIdRef = useRef(null);
  const bgModelRef = useRef(null);
  const prevYRef = useRef(null);
  const consecutiveFallFramesRef = useRef(0);
  const lastAlertTimeRef = useRef(0);
  const angleHistoryRef = useRef([]);       // rolling tilt-angle smoother
  const speechRecognitionRef = useRef(null);

  useEffect(() => {
    const loadLeads = async () => {
      try {
        const res = await fetchLeads();
        setLeads(res.data);
      } catch (e) {
        console.error('Failed to load leads');
      }
    };
    loadLeads();
  }, []);

  const handleSimulate = async () => {
    setIsSimulating(true);
    try {
      await postIncident({
        fall: true,
        movement: "fall_detected",
        critical: true,
        location: "Camera 01"
      });
      toast.success('Simulation sent to ML Backend');
    } catch (e) {
      toast.error('Simulation failed. Is ML Backend running?');
    } finally {
      setIsSimulating(false);
    }
  };

  // Toggle individual stream tracks based on privacy Mode
  useEffect(() => {
    if (streamRef.current) {
      const videoTracks = streamRef.current.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !privacyMode;
      });
    }
  }, [privacyMode]);

  // Clean up streams & animations on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.onend = null;
        speechRecognitionRef.current.onerror = null;
        speechRecognitionRef.current.abort();
      }
    };
  }, []);

  const toggleLiveFeed = async () => {
    if (!user) {
      toast.error('Please sign in to activate live webcam and microphone monitoring.');
      navigate('/login');
      return;
    }

    if (isLiveFeedActive) {
      stopLiveFeed();
    } else {
      await startLiveFeed();
    }
  };

  const startLiveFeed = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.error("Video play failed:", e));
      }

      setIsLiveFeedActive(true);
      isLiveFeedActiveRef.current = true;
      toast.success('Live Guardian Feed Active');

      // Start audio recognition
      startSpeechRecognition();

      // Start processing frame differencing
      animationFrameIdRef.current = requestAnimationFrame(processVideoFrame);
    } catch (err) {
      console.error('Failed to get media devices:', err);
      toast.error('Could not access camera/microphone. Please verify browser permissions.');
      setIsLiveFeedActive(false);
      isLiveFeedActiveRef.current = false;
    }
  };

  const stopLiveFeed = () => {
    setIsLiveFeedActive(false);
    isLiveFeedActiveRef.current = false;

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }

    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.onend = null;
      speechRecognitionRef.current.onerror = null;
      speechRecognitionRef.current.abort();
      speechRecognitionRef.current = null;
    }

    bgModelRef.current = null;
    prevYRef.current = null;
    consecutiveFallFramesRef.current = 0;
    angleHistoryRef.current = [];

    toast.success('Live Guardian Feed Stopped.');
  };

  const startSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = async (event) => {
      const lastResultIndex = event.results.length - 1;
      const transcript = event.results[lastResultIndex][0].transcript.toLowerCase();
      console.log(`🎙️ Voice heard: "${transcript}"`);

      const distressKeywords = ["help me", "help", "emergency", "fall", "save me", "ouch", "help check"];
      if (distressKeywords.some(kw => transcript.includes(kw))) {
        console.log("🚨 Distress keyword detected!");
        toast.error('Voice Distress Alert Triggered!');

        try {
          await postIncident({
            fall: false,
            movement: "audio_only",
            critical: true,
            location: "Living Room (Voice Monitoring)"
          });
        } catch (err) {
          console.error('Failed to post audio distress:', err);
        }
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (isLiveFeedActiveRef.current && event.error !== 'aborted') {
        try {
          recognition.start();
        } catch (e) {}
      }
    };

    recognition.onend = () => {
      if (isLiveFeedActiveRef.current) {
        try {
          recognition.start();
        } catch (e) {}
      }
    };

    recognition.start();
    speechRecognitionRef.current = recognition;
  };

  // ─── MediaPipe-powered live frame analysis ───────────────────────────────
  //
  //  Every ANALYSIS_INTERVAL milliseconds we:
  //    1. Capture the canvas frame as a low-quality JPEG (base64)
  //    2. POST it to Node /api/analyze-frame → Flask /api/v1/analyze-frame
  //    3. Flask runs MediaPipe Pose and returns spine_angle, fall_risk, landmarks
  //    4. We draw the video + skeleton overlay on the canvas
  //    5. If fall_risk is true for FALL_FRAME_THRESHOLD consecutive checks, alert fires
  //
  const ANALYSIS_INTERVAL = 200;   // ms between server calls (≈5 fps analysis)
  const FALL_FRAME_THRESHOLD_MP = 5; // 5 × 200ms = 1 second of confirmed fall

  const processVideoFrame = () => {
    if (!isLiveFeedActiveRef.current) return;

    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) {
      animationFrameIdRef.current = requestAnimationFrame(processVideoFrame);
      return;
    }

    const ctx    = canvas.getContext('2d');
    if (!ctx) {
      animationFrameIdRef.current = requestAnimationFrame(processVideoFrame);
      return;
    }

    const width  = canvas.width;
    const height = canvas.height;

    // ── Draw mirrored video frame ─────────────────────────────────────────
    ctx.save();
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, width, height);
    ctx.restore();

    // ── Privacy mode: blank video, show audio waves ───────────────────────
    if (privacyMode) {
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#a855f7';
      const waveCount = 15, barWidth = 6, spacing = 4;
      const startX = (width - (waveCount * (barWidth + spacing) - spacing)) / 2;
      for (let i = 0; i < waveCount; i++) {
        const t = Date.now() * 0.005 + i * 0.3;
        const wh = 15 + Math.sin(t) * 35;
        ctx.fillRect(startX + i * (barWidth + spacing), (height - wh) / 2, barWidth, wh);
      }
      ctx.fillStyle = '#a855f7';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('AUDIO SAFETY MODE ACTIVE', width / 2, height - 30);
      animationFrameIdRef.current = requestAnimationFrame(processVideoFrame);
      return;
    }

    // ── Throttle: only analyse every ANALYSIS_INTERVAL ms ────────────────
    const now = Date.now();
    if (!processVideoFrame._lastAnalysis) processVideoFrame._lastAnalysis = 0;
    if (!processVideoFrame._lastResult)   processVideoFrame._lastResult   = null;
    if (!processVideoFrame._pending)      processVideoFrame._pending      = false;

    if ((now - processVideoFrame._lastAnalysis) >= ANALYSIS_INTERVAL && !processVideoFrame._pending) {
      processVideoFrame._lastAnalysis = now;
      processVideoFrame._pending      = true;

      // Capture low-quality JPEG (0.5 quality) to minimise payload size
      const tmpCanvas = document.createElement('canvas');
      tmpCanvas.width  = Math.min(width, 320);   // downsample to 320px wide
      tmpCanvas.height = Math.round(height * (tmpCanvas.width / width));
      tmpCanvas.getContext('2d').drawImage(canvas, 0, 0, tmpCanvas.width, tmpCanvas.height);
      const frameB64 = tmpCanvas.toDataURL('image/jpeg', 0.5);

      fetch('/api/analyze-frame', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ frame: frameB64 }),
      })
        .then(r => r.json())
        .then(data => {
          processVideoFrame._lastResult = data;
          processVideoFrame._pending    = false;

          // Update fall-frame counter
          if (data.fall_risk) {
            consecutiveFallFramesRef.current += 1;
          } else {
            consecutiveFallFramesRef.current = Math.max(0, consecutiveFallFramesRef.current - 1);
          }

          // Fire alert after threshold
          if (
            consecutiveFallFramesRef.current >= FALL_FRAME_THRESHOLD_MP &&
            (Date.now() - lastAlertTimeRef.current > 8000)
          ) {
            lastAlertTimeRef.current = Date.now();
            handleLocalFallDetected(canvas);
          }
        })
        .catch(() => { processVideoFrame._pending = false; });
    }

    // ── Draw cached result overlay (runs every frame at full fps) ─────────
    const result = processVideoFrame._lastResult;
    const spineAngle  = result?.spine_angle    ?? 0;
    const hbhRatio    = result?.head_hip_ratio ?? 0;
    const fallRisk    = result?.fall_risk      ?? false;
    const poseDetected = result?.pose_detected ?? false;
    const lm          = result?.landmarks_px;
    const thresholds  = result?.thresholds ?? { spine_angle: 50, head_hip_ratio: 0.85 };

    // Scale landmarks back to canvas size (they were computed at 320px width)
    const scaleX = width  / Math.min(width, 320);
    const scaleY = height / Math.round(height * (Math.min(width, 320) / width));

    if (poseDetected && lm) {
      const shoulder = [lm.shoulder[0] * scaleX, lm.shoulder[1] * scaleY];
      const hip      = [lm.hip[0]      * scaleX, lm.hip[1]      * scaleY];
      const nose     = [lm.nose[0]     * scaleX, lm.nose[1]     * scaleY];

      // Spine line
      const spineColor = fallRisk ? '#ef4444' :
                         spineAngle >= thresholds.spine_angle ? '#f97316' : '#10b981';
      ctx.beginPath();
      ctx.moveTo(shoulder[0], shoulder[1]);
      ctx.lineTo(hip[0], hip[1]);
      ctx.strokeStyle = spineColor;
      ctx.lineWidth   = 3;
      ctx.stroke();

      // Key-point dots
      [shoulder, hip, nose].forEach(([px, py]) => {
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, 2 * Math.PI);
        ctx.fillStyle = '#fbbf24';
        ctx.fill();
      });

      // Angle label near shoulder
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px monospace';
      ctx.textAlign = 'left';
      const lx = shoulder[0] + 10, ly = shoulder[1] - 8;
      ctx.fillText(`Spine: ${spineAngle.toFixed(1)}° (≥${thresholds.spine_angle}°)`, lx, ly);
      ctx.fillText(`Head/Hip: ${hbhRatio.toFixed(2)} (≥${thresholds.head_hip_ratio})`, lx, ly + 13);
      ctx.fillText(`Frames: ${consecutiveFallFramesRef.current}/${FALL_FRAME_THRESHOLD_MP}`, lx, ly + 26);
    }

    // ── Status bar ────────────────────────────────────────────────────────
    const isAlertActive = consecutiveFallFramesRef.current >= FALL_FRAME_THRESHOLD_MP
                          || (Date.now() - lastAlertTimeRef.current < 4000);
    const statusLabel = isAlertActive ? 'FALL DETECTED!' : poseDetected ? 'SAFE' : 'Detecting...';
    const statusColor = isAlertActive ? '#ef4444' : poseDetected ? '#10b981' : '#94a3b8';

    ctx.fillStyle = 'rgba(0,0,0,0.82)';
    ctx.fillRect(8, 8, 240, 40);
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.lineWidth   = 1;
    ctx.strokeRect(8, 8, 240, 40);
    ctx.fillStyle   = statusColor;
    ctx.font        = 'bold 12px sans-serif';
    ctx.textAlign   = 'left';
    ctx.fillText(`STATUS: ${statusLabel}`, 16, 28);
    ctx.fillStyle = 'rgba(160,160,160,0.7)';
    ctx.font      = '9px monospace';
    ctx.fillText(`Spine ${spineAngle.toFixed(1)}°  H/Hip ${hbhRatio.toFixed(2)}  |  MediaPipe AI`, 16, 43);

    animationFrameIdRef.current = requestAnimationFrame(processVideoFrame);
  };

  const handleLocalFallDetected = async (canvas) => {
    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const filename = `incident_webcam_${Date.now()}.jpg`;
      const file = new File([blob], filename, { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('file', file);

      try {
        toast.loading('Reporting Fall Incident...', { id: 'fall-alert' });
        const uploadRes = await uploadPhoto(formData);
        const uploadedFilename = uploadRes.data.filename;

        await postIncident({
          fall: true,
          movement: "fall_detected",
          critical: true,
          location: "Camera 01 (Webcam)",
          image_filename: uploadedFilename
        });

        toast.success('🚨 Critical Fall Reported to Caregivers!', { id: 'fall-alert' });
      } catch (err) {
        console.error('Failed to upload fall frame:', err);
        toast.error('Failed to report fall incident.', { id: 'fall-alert' });
      }
    }, 'image/jpeg', 0.85);
  };

  // Prepare Chart Data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), i);
    return format(d, 'MMM dd');
  }).reverse();

  const barData = last7Days.map(dateStr => ({
    name: dateStr,
    incidents: logs.filter(l => {
      if (!l.timestamp) return false;
      const parsed = new Date(l.timestamp.includes(' ') ? l.timestamp.replace(' ', 'T') : l.timestamp);
      return !isNaN(parsed.getTime()) && format(parsed, 'MMM dd') === dateStr;
    }).length
  }));

  const criticalCount = logs.filter(l => l.movement_status === 'fall_detected').length;
  const warningCount = logs.filter(l => l.movement_status === 'moderate_fall').length;
  const audioCount = logs.filter(l => l.movement_status === 'audio_only').length;
  const normalCount = logs.filter(l => l.movement_status === 'normal' || !l.movement_status).length;

  const pieData = [
    { name: 'Critical Fall', value: criticalCount, color: '#ef4444' },
    { name: 'Moderate Fall', value: warningCount, color: '#f97316' },
    { name: 'Normal', value: normalCount, color: '#10b981' },
    { name: 'Audio', value: audioCount, color: '#a855f7' },
  ];
  const visiblePieData = pieData.filter(item => item.value > 0);
  const hasPieData = visiblePieData.length > 0;

  const aiStatusLabel = latestStatus === 'NORMAL' ? 'All clear' : latestStatus.replace('_', ' ');
  const aiStatusClass = latestStatus === 'CRITICAL' ? 'critical' : latestStatus === 'WARNING' ? 'warning' : latestStatus === 'AUDIO_DISTRESS' ? 'audio' : 'safe';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="dashboard-page p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto min-h-screen">
      
      {/* Demo Mode warning */}
      {!user && (
        <div className="dashboard-notice">
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
            <div>
              <span className="text-sm font-semibold text-amber-300">DEMO MODE ACTIVE</span>
              <p className="text-xs text-slate-300 mt-0.5">You are viewing the public analytics dashboard. Sign in to activate your local webcam & microphone guard.</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/login')}
            className="text-xs bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 px-4 py-2 rounded-xl transition-colors shadow-lg shadow-amber-500/10 cursor-pointer"
          >
            Sign In / Register
          </button>
        </div>
      )}

      {/* Top Status Bar */}
      <div className="dashboard-hero">
        <div>
          <div className="badge badge-blue" style={{ marginBottom: '0.85rem' }}>Live Dashboard</div>
          <h1>Care Command Center</h1>
          <p>Monitor camera feeds, review recent incidents, and keep the care team aligned from one focused workspace.</p>
        </div>

        <div className="dashboard-status-grid">
          <div className={`dashboard-status-card ${isOnline ? 'safe' : 'critical'}`}>
            <div className="dashboard-status-icon">
              <HardDrives size={20} />
            </div>
            <div>
              <span>Backend</span>
              <strong>{isOnline ? 'Online' : 'Offline'}</strong>
              <small>Checked {lastChecked.toLocaleTimeString()}</small>
            </div>
          </div>
          <div className={`dashboard-status-card ${aiStatusClass}`}>
            <div className="dashboard-status-icon">
              {latestStatus === 'NORMAL' && <ShieldCheck size={20} />}
              {latestStatus === 'WARNING' && <WarningCircle size={20} />}
              {latestStatus === 'CRITICAL' && <Record weight="fill" size={20} />}
              {latestStatus === 'AUDIO_DISTRESS' && <MicrophoneStage size={20} />}
            </div>
            <div>
              <span>AI Status</span>
              <strong>{aiStatusLabel}</strong>
              <small>Active incidents only</small>
            </div>
          </div>
          <div className="dashboard-status-card neutral">
            <div className="dashboard-status-icon">
              <Record size={20} />
            </div>
            <div>
              <span>Incidents</span>
              <strong>{logs.length}</strong>
              <small>{criticalCount} critical logged</small>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left/Middle Column (Camera & Analytics) */}
        {!isLogExpanded && (
          <div className="xl:col-span-2 space-y-6">
          
          {/* Camera Feed Simulator */}
          <div className="glass-panel dashboard-feed-panel overflow-hidden relative">
            <div className="dashboard-panel-header">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Camera size={18} className="text-blue-300" /> Camera 01 — Living Room
                </div>
                <p>Local monitoring feed with on-device motion analysis</p>
              </div>
              <div className="dashboard-actions">
                <button
                  onClick={toggleLiveFeed}
                  className={`dashboard-action-button ${
                    isLiveFeedActive
                      ? 'active'
                      : ''
                  }`}
                >
                  {isLiveFeedActive ? (
                    <>
                      <Record weight="fill" className="text-red-500" /> Stop Live Feed
                    </>
                  ) : (
                    <>
                      <Camera /> Start Live Feed {!user && '🔒'}
                    </>
                  )}
                </button>
                <button 
                  onClick={handleSimulate} 
                  disabled={isSimulating || !isOnline}
                  className="dashboard-action-button danger"
                >
                  <BugBeetle /> Simulate Fall
                </button>
                <div className="dashboard-privacy-toggle">
                  <span className="text-slate-400">Privacy Zone:</span>
                  <button 
                    onClick={() => setPrivacyMode(!privacyMode)}
                    className={`w-10 h-5 rounded-full relative transition-colors ${privacyMode ? 'bg-purple-500' : 'bg-slate-700'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${privacyMode ? 'left-[22px]' : 'left-0.5'}`}></div>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="dashboard-video-frame aspect-video bg-black relative flex items-center justify-center overflow-hidden">
              <video ref={videoRef} className="hidden" playsInline muted />
              
              {isLiveFeedActive ? (
                privacyMode ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-purple-950/20">
                    <MicrophoneStage size={64} className="text-purple-500/50 mb-4" />
                    <div className="flex items-center gap-1 h-12">
                      {[...Array(20)].map((_, i) => (
                        <motion.div 
                          key={i}
                          className="w-2 bg-purple-500/80 rounded-t"
                          animate={{ height: ['20%', '100%', '20%'] }}
                          transition={{ repeat: Infinity, duration: 0.5 + Math.random() * 0.5, delay: Math.random() * 0.5 }}
                        />
                      ))}
                    </div>
                    <div className="mt-4 text-purple-400 font-mono text-sm">AUDIO SAFETY MODE ACTIVE</div>
                  </div>
                ) : (
                  <>
                    <canvas ref={canvasRef} className="w-full h-full object-contain" width={320} height={240} />
                    {/* Overlay UI */}
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      <span className="flex h-3 w-3 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                      </span>
                      <span className="text-white text-xs font-mono drop-shadow-md bg-black/50 px-2 py-1 rounded">LIVE AI</span>
                    </div>
                  </>
                )
              ) : privacyMode ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-purple-950/20">
                  <MicrophoneStage size={64} className="text-purple-500/50 mb-4" />
                  <div className="mt-4 text-purple-400 font-mono text-sm">AUDIO SAFETY MODE ACTIVE</div>
                </div>
              ) : (
                <>
                  <div className="dashboard-standby">
                    <Camera size={54} />
                    <strong>Live feed is on standby</strong>
                    <span>Start the feed to run local fall detection. Previous incident images stay in the log, not the live preview.</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Analytics Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel p-5 h-72 flex flex-col">
              <h3 className="text-sm font-semibold text-slate-300 mb-4">Incidents (Last 7 Days)</h3>
              <div className="flex-1 w-full min-w-0 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px'}} />
                    <Bar dataKey="incidents" fill="#2dd4bf" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="glass-panel p-5 h-72 flex flex-col">
              <h3 className="text-sm font-semibold text-slate-300 mb-4">Incident Distribution</h3>
              <div className="h-[200px] w-full min-w-0 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={hasPieData ? visiblePieData : [{ name: 'No incidents', value: 1, color: 'rgba(255,255,255,0.12)' }]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {(hasPieData ? visiblePieData : [{ color: 'rgba(255,255,255,0.12)' }]).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px'}} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Custom Legend */}
                <div className="absolute top-0 right-0 flex flex-col gap-2">
                  {(hasPieData ? visiblePieData : [{ name: 'No incidents yet', value: 0, color: 'rgba(255,255,255,0.22)' }]).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-400">
                      <div className="w-3 h-3 rounded-full" style={{backgroundColor: item.color}}></div>
                      {item.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Right Column (Logs & Leads) */}
        <div className={`space-y-6 flex flex-col ${isLogExpanded ? 'xl:col-span-3 h-auto' : 'h-[calc(100vh-140px)]'}`}>
          
          {/* Incident Log Timeline */}
          <div className="glass-panel dashboard-log-panel flex-1 flex flex-col overflow-hidden">
            <div className="dashboard-panel-header compact">
              <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <Record className="text-teal-400" /> Incident Log
              </h3>
              <div className="dashboard-log-controls">
                <button 
                  onClick={() => setIsLogExpanded(!isLogExpanded)} 
                  className="dashboard-log-button"
                >
                  {isLogExpanded ? <ArrowsIn size={14} /> : <ArrowsOut size={14} />}
                  {isLogExpanded ? 'Collapse Log' : 'Expand Log'}
                </button>
                <span className="dashboard-live-pill">Live</span>
              </div>
            </div>
            <div className="dashboard-log-scroll flex-1 overflow-y-auto p-4 custom-scrollbar">
              {logsLoading ? (
                <div className="text-center text-slate-500 py-10">Loading logs...</div>
              ) : logs.length === 0 ? (
                <div className="text-center text-slate-500 py-10">No incidents logged yet.</div>
              ) : (
                <div className={isLogExpanded ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
                  {[...logs].reverse().map(log => (
                    <IncidentCard 
                      key={log.id || log._id} 
                      {...log} 
                      onDelete={(deletedId) => {
                        setLogs(prev => prev.filter(l => (l.id || l._id) !== deletedId));
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Leads Panel */}
          {!isLogExpanded && (
            <div className="glass-panel h-64 flex flex-col">
              <div className="dashboard-panel-header compact">
                <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <Users className="text-teal-400" /> Registered Leads
                </h3>
                <span className="text-xs text-slate-500">{leads.length} Total</span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {leads.length === 0 ? (
                  <div className="text-center text-slate-500 text-sm py-4">No leads registered.</div>
                ) : (
                  leads.map(lead => (
                    <div key={lead._id} className="bg-white/5 p-3 rounded-xl border border-white/5 text-sm">
                      <div className="font-medium text-white flex justify-between">
                        {lead.name}
                        <span className="text-xs bg-teal-500/20 text-teal-400 px-2 py-0.5 rounded-full">{lead.role}</span>
                      </div>
                      <div className="text-slate-400 text-xs mt-1">{lead.email} | {lead.phone}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}} />
    </motion.div>
  );
};

export default Dashboard;
