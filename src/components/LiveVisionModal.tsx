import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  Camera,
  RefreshCw,
  Mic,
  MicOff,
  Sparkles,
  Zap,
  Flame,
  Volume2,
  VolumeX,
  Scan,
  ScanFace,
  Hand,
  CheckCircle2,
  Crown,
  UserCheck,
  UserPlus,
  Calendar,
  MapPin,
  Clock,
  Activity,
  Tv,
  Trash2,
  BookOpen
} from 'lucide-react';
import { soundEffects, speechManager, getSpeechRecognition } from '../utils/audio';
import { EngineType, QAItem, AssistantResponse, MediaAttachment } from '../types';

export interface RegisteredFriendProfile {
  id: string;
  name: string;
  birthMonth: string;
  birthYear: number;
  location?: string;
  photoBase64?: string;
}

export interface FaceScanResult {
  detectedRole: 'CREATOR_BOSS' | 'VIP_FRIEND' | 'GUEST_PERSON' | 'NO_FACE';
  scanType?: 'FACE' | 'HAND' | 'NONE';
  statusBadge: string;
  name: string;
  location: string;
  dateOfBirth: string;
  birthMonth: string;
  birthYear: number;
  estimatedAgeNumber: number;
  currentAgeText: string;
  facialMarkers: string[];
  futurePrediction?: string;
  confidencePercent: number;
  tickerText?: string;
  summaryHindi: string;
  speechText: string;
  timestamp: string;
}

interface LiveVisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuestionSolved: (qa: QAItem) => void;
  currentEngine: EngineType;
  initialMode?: 'vision' | 'face';
  verifiedHumanId?: string;
}

const FRIENDS_STORAGE_KEY = 'mr_jarvis_biometric_friends_v2';

const DEFAULT_FRIENDS: RegisteredFriendProfile[] = [
  {
    id: 'friend-pandit',
    name: 'पंडित (Pandit)',
    birthMonth: 'अगस्त (August)',
    birthYear: 2006,
    location: 'ऋषिकेश, उत्तराखंड',
  },
  {
    id: 'friend-shiv',
    name: 'शिव कुमार (Shiv Kumar)',
    birthMonth: 'मई (May)',
    birthYear: 1997,
    location: 'ऋषिकेश, उत्तराखंड',
  },
];

export const LiveVisionModal: React.FC<LiveVisionModalProps> = ({
  isOpen,
  onClose,
  onQuestionSolved,
  currentEngine,
  initialMode = 'vision',
  verifiedHumanId = 'Master Ajay Boss',
}) => {
  const [scannerMode, setScannerMode] = useState<'vision' | 'face'>(initialMode);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>(
    initialMode === 'face' ? 'user' : 'environment'
  );
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAutoFaceScan, setIsAutoFaceScan] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [voiceQuery, setVoiceQuery] = useState('');
  const [liveReasoningResult, setLiveReasoningResult] = useState<AssistantResponse | null>(null);
  const [faceScanResult, setFaceScanResult] = useState<FaceScanResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Friends biometric registry (Pandit, Shiv Kumar, + custom friends with optional face/hand snapshot)
  const [registeredFriends, setRegisteredFriends] = useState<RegisteredFriendProfile[]>(() => {
    try {
      const saved = localStorage.getItem(FRIENDS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback to defaults
    }
    return DEFAULT_FRIENDS;
  });
  const [activeFriendId, setActiveFriendId] = useState<string>('');
  const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);
  const [newFriendName, setNewFriendName] = useState('');
  const [newFriendMonth, setNewFriendMonth] = useState('जनवरी (January)');
  const [newFriendYear, setNewFriendYear] = useState('2000');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const recognitionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(FRIENDS_STORAGE_KEY, JSON.stringify(registeredFriends));
    } catch {
      // ignore storage quota errors
    }
  }, [registeredFriends]);

  // Sync mode when modal opens with initialMode
  useEffect(() => {
    if (isOpen) {
      setScannerMode(initialMode);
      setFacingMode(initialMode === 'face' ? 'user' : 'environment');
    }
  }, [isOpen, initialMode]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => {
        try {
          t.stop();
        } catch {
          // ignore
        }
      });
      streamRef.current = null;
    }
    setStream(null);
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
  }, []);

  const startCamera = useCallback(
    async (mode: 'environment' | 'user') => {
      try {
        stopCamera();
        setErrorMessage(null);

        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: mode,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        streamRef.current = mediaStream;
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          await videoRef.current.play().catch(() => {});
        }

        const track = mediaStream.getVideoTracks()[0];
        const capabilities: any = track.getCapabilities?.() || {};
        setHasTorch(Boolean(capabilities.torch));
      } catch (err: any) {
        console.warn('Camera stream error:', err);
        setErrorMessage(
          err?.name === 'NotAllowedError'
            ? 'Camera permission denied. Please allow camera access in browser settings.'
            : 'Unable to start camera stream on this device.'
        );
      }
    },
    [stopCamera]
  );

  // Capture current live video frame as JPEG base64
  const captureFrame = (): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.85);
  };

  // Register friend with live camera face/hand snap
  const handleAddFriendWithSnap = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newFriendName.trim();
    const parsedYear = parseInt(newFriendYear, 10) || 2000;
    if (!trimmedName) return;

    const snap = captureFrame();
    const created: RegisteredFriendProfile = {
      id: `friend-${Date.now()}`,
      name: trimmedName,
      birthMonth: newFriendMonth.trim() || 'जनवरी (January)',
      birthYear: Math.max(1930, Math.min(2024, parsedYear)),
      location: 'ऋषिकेश मित्र मंडल',
      photoBase64: snap || undefined,
    };

    soundEffects.playSuccessChime();
    setRegisteredFriends((prev) => [created, ...prev]);
    setActiveFriendId(created.id);
    setNewFriendName('');
    setIsAddFriendOpen(false);
  };

  // Start real-time speech recognition
  const startListening = useCallback(() => {
    const recognition = getSpeechRecognition();
    if (!recognition) return;

    speechManager.unlockAudio();
    recognition.lang = 'hi-IN';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (e: any) => {
      let text = '';
      for (let i = 0; i < e.results.length; i++) {
        text += e.results[i][0].transcript;
      }
      setVoiceQuery(text);

      if (e.results[0].isFinal) {
        setIsListening(false);
        const finalQuestion = text.trim();
        if (finalQuestion) {
          if (scannerMode === 'face') {
            scanLiveBiometric(false);
          } else {
            captureAndReason(finalQuestion);
          }
        }
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      // ignore
    }
  }, [scannerMode]);

  // Initialize camera stream when modal opens
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      stopListening();
      speechManager.stop();
      setIsSpeaking(false);
      setIsAutoFaceScan(false);
      setLiveReasoningResult(null);
      setFaceScanResult(null);
      setVoiceQuery('');
      setErrorMessage(null);
      return;
    }

    startCamera(facingMode);
    soundEffects.playJarvisWake();
    speechManager.unlockAudio();

    if (!isMuted) {
      const greeting =
        initialMode === 'face'
          ? 'Aaj Tak Live Face and Hand Biometric Scanner active! Master Ajay Boss, kisi ka bhi chehra ya haath camera ke saamne laayein!'
          : 'Master Ajay Boss! Live Camera and Real-time Vision Reasoning is active!';
      speechManager.speak(greeting, {
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    }

    return () => {
      stopCamera();
      stopListening();
      speechManager.stop();
    };
  }, [isOpen, facingMode, initialMode, startCamera, stopCamera, stopListening]);

  // Toggle back/front camera
  const toggleFacingMode = () => {
    soundEffects.playBeep();
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Switch between General AI Vision and Aaj Tak Face & Hand Biometric Scanner
  const handleSwitchMode = (nextMode: 'vision' | 'face') => {
    soundEffects.playJarvisWake();
    setScannerMode(nextMode);
    setErrorMessage(null);
    if (nextMode === 'face') {
      setLiveReasoningResult(null);
      setFacingMode('user');
    } else {
      setIsAutoFaceScan(false);
      setFaceScanResult(null);
      setFacingMode('environment');
    }
  };

  // Toggle camera flashlight
  const toggleTorch = async () => {
    if (!stream || !hasTorch) return;
    try {
      const track = stream.getVideoTracks()[0];
      const nextTorch = !isTorchOn;
      await (track as any).applyConstraints({
        advanced: [{ torch: nextTorch }],
      });
      setIsTorchOn(nextTorch);
      soundEffects.playBeep();
    } catch (e) {
      console.warn('Torch constraint error:', e);
    }
  };

  // Execute Aaj Tak Style Face & Hand Biometric Scan
  const scanLiveBiometric = async (silentLog = false, overrideFriendId?: string) => {
    if (isAnalyzing) return;
    const base64Img = captureFrame();
    if (!base64Img) {
      setErrorMessage('Camera frame not ready yet. Please ensure camera permission is active.');
      return;
    }

    const effectiveFriendId = overrideFriendId !== undefined ? overrideFriendId : activeFriendId;
    setIsAnalyzing(true);
    setErrorMessage(null);
    soundEffects.playBeep();

    try {
      const res = await fetch('/api/face-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Img,
          verifiedHumanId,
          registeredFriends,
          activeFriendId: effectiveFriendId,
        }),
      });

      const scan: FaceScanResult = await res.json();
      setFaceScanResult(scan);
      soundEffects.playSuccessChime();

      if (!silentLog && scan.detectedRole !== 'NO_FACE') {
        const currentId = `biometric-scan-${Date.now()}`;
        const mediaObj: MediaAttachment = {
          base64: base64Img,
          mimeType: 'image/jpeg',
          name: `Aaj Tak ${scan.scanType === 'HAND' ? 'Hand' : 'Face'} Scan (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}).jpg`,
          type: 'image',
        };
        const qaItem: QAItem = {
          id: currentId,
          questionText: `📺 [AAJ TAK BIOMETRIC ${scan.scanType === 'HAND' ? 'HAND' : 'FACE'} SCAN] ${scan.statusBadge}`,
          questionMedia: mediaObj,
          category: 'vision',
          engineUsed: currentEngine,
          timestamp: new Date().toISOString(),
          status: 'answered',
          response: {
            speechText: scan.speechText,
            title: `📺 आज तक लाइव स्कैन: ${scan.name}`,
            subjectCategory: 'Aaj Tak Biometric Scanner',
            steps: [
              {
                stepNumber: 1,
                title: '🏷️ नाम (Name) & Scan Source',
                detail: `${scan.name} • Location: ${scan.location} • Method: ${scan.scanType === 'HAND' ? '🖐️ Hand/Palm Biometric' : '🙂 Face Scan'} (${scan.confidencePercent}%)`,
              },
              {
                stepNumber: 2,
                title: '⏳ वर्तमान उम्र, जन्म माह & जन्म साल',
                detail: `वर्तमान उम्र: ${scan.currentAgeText} • जन्म का महीना: ${scan.birthMonth} • जन्म का साल: ${scan.birthYear || '—'} • DOB: ${scan.dateOfBirth}`,
              },
              {
                stepNumber: 3,
                title: '📚 भविष्य और पढ़ाई का कच्चा चिट्ठा (Studies & Future)',
                detail: scan.futurePrediction || scan.summaryHindi,
              },
              {
                stepNumber: 4,
                title: '🧬 Biometric Markers',
                detail: scan.facialMarkers.join(' • '),
              },
            ],
            finalAnswer: scan.summaryHindi,
            beastTip:
              scan.detectedRole === 'CREATOR_BOSS'
                ? '👑 Royal Creator Master Ajay Boss (Ladu) Verified — DOB 28 March 1995, Rishikesh!'
                : '📺 Aaj Tak Live News Ticker & Biometric Profile Displayed!',
            suggestedPrompts: [
              'Scan Pandit face or hand',
              'Scan another guest person',
            ],
          },
        };
        onQuestionSolved(qaItem);
      }

      if (!isMuted && scan.speechText) {
        speechManager.speak(scan.speechText, {
          onStart: () => setIsSpeaking(true),
          onEnd: () => setIsSpeaking(false),
          onError: () => setIsSpeaking(false),
        });
      }
    } catch (e: any) {
      console.error('Aaj Tak Biometric Scanner error:', e);
      setErrorMessage(e?.message || 'Unable to execute live face/hand scan.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Optional continuous Auto-Scan interval when toggled ON
  useEffect(() => {
    if (!isOpen || scannerMode !== 'face' || !isAutoFaceScan) return;
    const interval = setInterval(() => {
      if (!isAnalyzing) {
        scanLiveBiometric(true);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isOpen, scannerMode, isAutoFaceScan, isAnalyzing]);

  // Capture frame and send to General Multimodal AI Vision Engine
  const captureAndReason = async (userPrompt?: string) => {
    const base64Img = captureFrame();
    if (!base64Img) {
      setErrorMessage('Could not capture video frame. Please ensure camera is active.');
      return;
    }

    const queryToUse =
      userPrompt ||
      voiceQuery.trim() ||
      'Examine what is visible in this live camera frame and provide complete step-by-step analysis for Master Ajay Boss (Ladu).';
    setIsAnalyzing(true);
    soundEffects.playBeep();

    const currentId = `live-vision-${Date.now()}`;
    const mediaObj: MediaAttachment = {
      base64: base64Img,
      mimeType: 'image/jpeg',
      name: `Live Camera Snap (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}).jpg`,
      type: 'image',
    };

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryToUse,
          engine: currentEngine,
          category: 'vision',
          mediaData: { base64: base64Img, mimeType: 'image/jpeg' },
        }),
      });

      const data: AssistantResponse = await res.json();
      setLiveReasoningResult(data);
      soundEffects.playSuccessChime();

      const qaItem: QAItem = {
        id: currentId,
        questionText: queryToUse,
        questionMedia: mediaObj,
        category: 'vision',
        engineUsed: currentEngine,
        timestamp: new Date().toISOString(),
        status: 'answered',
        response: data,
      };
      onQuestionSolved(qaItem);

      if (!isMuted) {
        const fullVoiceText = `${data.speechText}. Final Answer: ${data.finalAnswer}`;
        speechManager.speak(fullVoiceText, {
          onStart: () => setIsSpeaking(true),
          onEnd: () => setIsSpeaking(false),
          onError: () => setIsSpeaking(false),
        });
      }
    } catch (e: any) {
      console.error('Live vision reasoning error:', e);
      setErrorMessage(e?.message || 'Failed to reason on live visual frame.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!isOpen) return null;

  const liveTickerText =
    faceScanResult?.tickerText ||
    '🔴 आज तक LIVE BIOMETRIC STUDIO: कैमरा चालू है — मास्टर अजय Boss (ऋषिकेश), पंडित या किसी भी व्यक्ति का चेहरा या हाथ स्कैन करें... ⚡';

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#07090e] text-white overflow-hidden animate-in fade-in duration-200">
      <canvas ref={canvasRef} className="hidden" />

      {/* Top HUD Controls Bar — Aaj Tak News Studio Style when in Face/Hand Scan Mode */}
      <div
        className={`relative z-20 flex flex-wrap items-center justify-between gap-2 p-2.5 sm:p-3.5 border-b ${
          scannerMode === 'face'
            ? 'bg-gradient-to-r from-[#1a0508] via-[#07090e] to-[#0b0f1c] border-red-600/60'
            : 'bg-gradient-to-b from-[#07090e] via-[#07090e]/85 to-transparent border-[#ffd700]/20'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {scannerMode === 'face' ? (
            <div className="flex items-center shrink-0 rounded-lg overflow-hidden border border-[#ffd700]/70 shadow-lg shadow-red-600/30">
              <div className="bg-red-600 px-2 py-1.5 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                <span className="font-hindi font-black text-xs sm:text-sm text-white tracking-wide">
                  आज तक
                </span>
              </div>
              <div className="bg-[#ffd700] px-2 py-1.5 text-[#07090e] font-chakra font-black text-[10px] sm:text-xs">
                LIVE SCAN
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#ffd700] p-0.5 bg-gradient-to-tr from-[#ffd700] to-amber-300 shadow-lg shrink-0">
              <img
                src="./person-ai-assistant.png"
                alt="Sheru Bhai AI Vision Logo"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className="font-chakra font-black text-xs sm:text-base text-[#ffd700] tracking-wider truncate">
                {scannerMode === 'face'
                  ? 'FACE & HAND BIOMETRIC SCANNER'
                  : 'JARVIS & MYRA LIVE VISION'}
              </h2>
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-red-600/20 text-red-300 border border-red-500/50 uppercase">
                {scannerMode === 'face' ? 'RISHIKESH NEWS HUD' : 'REAL-TIME'}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-hindi truncate">
              Master Ajay Boss (Ladu) • Rishikesh • Face &amp; Hand Recognition
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Segmented Vision vs Aaj Tak Biometric Switch */}
          <div className="inline-flex items-center p-0.5 rounded-full bg-[#0d1322] border border-[#ffd700]/40">
            <button
              type="button"
              onClick={() => handleSwitchMode('vision')}
              className={`min-h-[34px] px-2.5 py-1 rounded-full text-[11px] font-chakra font-bold flex items-center gap-1 transition-all cursor-pointer ${
                scannerMode === 'vision'
                  ? 'bg-[#ffd700] text-[#07090e]'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Vision</span>
            </button>
            <button
              type="button"
              onClick={() => handleSwitchMode('face')}
              className={`min-h-[34px] px-2.5 py-1 rounded-full text-[11px] font-chakra font-bold flex items-center gap-1 transition-all cursor-pointer ${
                scannerMode === 'face'
                  ? 'bg-red-600 text-white shadow-sm shadow-red-600/40'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>Aaj Tak Scan</span>
            </button>
          </div>

          {hasTorch && (
            <button
              onClick={toggleTorch}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isTorchOn
                  ? 'bg-[#ffd700] text-[#07090e] border-[#ffd700]'
                  : 'bg-black/60 text-slate-300 border-white/20 hover:bg-white/10'
              }`}
              title="Toggle Flashlight Torch"
            >
              <Flame className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={toggleFacingMode}
            className="p-2 rounded-xl bg-black/60 hover:bg-white/10 text-slate-300 border border-[#ffd700]/30 transition-all cursor-pointer"
            title="Flip Camera (Front/Back)"
          >
            <RefreshCw className="w-4 h-4 text-[#ffd700]" />
          </button>

          <button
            onClick={() => {
              if (!isMuted) speechManager.stop();
              setIsMuted(!isMuted);
            }}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isMuted
                ? 'bg-red-950/60 text-red-400 border-red-500/40'
                : 'bg-black/60 text-cyan-300 border-white/20'
            }`}
            title={isMuted ? 'Unmute Voice' : 'Mute Voice'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={() => {
              soundEffects.playBeep();
              onClose();
            }}
            className="p-2 rounded-xl bg-red-950/70 hover:bg-red-900/70 text-red-300 border border-red-500/50 transition-all cursor-pointer"
            title="Close Live Camera"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Friend / Target Bar (Auto vs Pandit vs Shiv Kumar vs Custom Register) in Face/Hand Scan Mode */}
      {scannerMode === 'face' && (
        <div className="relative z-20 px-3 py-1.5 bg-[#0a0f1c] border-b border-red-600/30 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <span className="text-[10px] font-chakra font-bold text-[#ffd700] whitespace-nowrap shrink-0">
            SCAN TARGET:
          </span>

          <button
            type="button"
            onClick={() => {
              soundEffects.playBeep();
              setActiveFriendId('');
            }}
            className={`min-h-[30px] px-2.5 py-0.5 rounded-full text-[11px] font-semibold border transition-all whitespace-nowrap cursor-pointer ${
              activeFriendId === ''
                ? 'bg-[#ffd700] text-[#07090e] border-[#ffd700] font-bold'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-[#ffd700]/50'
            }`}
          >
            🤖 Auto (Boss / Guest)
          </button>

          {registeredFriends.map((friend) => (
            <div key={friend.id} className="inline-flex items-center shrink-0">
              <button
                type="button"
                onClick={() => {
                  soundEffects.playBeep();
                  setActiveFriendId(friend.id);
                }}
                className={`min-h-[30px] px-2.5 py-0.5 rounded-full text-[11px] font-hindi font-semibold border transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                  activeFriendId === friend.id
                    ? 'bg-red-600 text-white border-red-400 shadow-sm'
                    : 'bg-slate-900 text-slate-200 border-slate-700 hover:border-red-500/60'
                }`}
              >
                <span>👤 {friend.name}</span>
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => {
              soundEffects.playBeep();
              setIsAddFriendOpen((prev) => !prev);
            }}
            className="min-h-[30px] px-2.5 py-0.5 rounded-full text-[11px] font-chakra font-bold bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 flex items-center gap-1 whitespace-nowrap cursor-pointer shrink-0"
          >
            <UserPlus className="w-3 h-3" />
            <span>+ Register Friend</span>
          </button>
        </div>
      )}

      {/* Register Friend Mini Drawer (Standard HTML Inputs) */}
      {scannerMode === 'face' && isAddFriendOpen && (
        <form
          onSubmit={handleAddFriendWithSnap}
          className="relative z-20 p-3 bg-[#0e1424] border-b border-[#ffd700]/50 space-y-2.5 animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-chakra font-bold text-[#ffd700]">
              Register Friend for Face &amp; Hand Biometric Scan
            </span>
            <button
              type="button"
              onClick={() => setIsAddFriendOpen(false)}
              className="text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              Close
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              value={newFriendName}
              onChange={(e) => setNewFriendName(e.target.value)}
              placeholder="Name (e.g. पंडित / Rahul)"
              required
              className="min-h-[40px] px-3 rounded-lg bg-[#07090e] border border-[#ffd700]/40 text-xs text-white placeholder-slate-500 outline-none focus:border-[#ffd700]"
            />
            <input
              type="text"
              value={newFriendMonth}
              onChange={(e) => setNewFriendMonth(e.target.value)}
              placeholder="Birth Month (e.g. अगस्त / August)"
              className="min-h-[40px] px-3 rounded-lg bg-[#07090e] border border-[#ffd700]/40 text-xs text-white placeholder-slate-500 outline-none focus:border-[#ffd700]"
            />
            <div className="flex gap-2">
              <input
                type="number"
                min={1935}
                max={2024}
                value={newFriendYear}
                onChange={(e) => setNewFriendYear(e.target.value)}
                placeholder="Year (e.g. 1998)"
                className="w-28 min-h-[40px] px-3 rounded-lg bg-[#07090e] border border-[#ffd700]/40 text-xs text-white placeholder-slate-500 outline-none focus:border-[#ffd700]"
              />
              <button
                type="submit"
                className="flex-1 min-h-[40px] px-3 rounded-lg bg-[#ffd700] hover:bg-amber-300 text-[#07090e] font-chakra font-black text-xs cursor-pointer"
              >
                Save + Snap
              </button>
            </div>
          </div>

          {registeredFriends.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {registeredFriends.map((f) => (
                <span
                  key={f.id}
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] text-slate-300"
                >
                  <span>
                    {f.name} ({f.birthMonth} {f.birthYear})
                  </span>
                  {!DEFAULT_FRIENDS.some((d) => d.id === f.id) && (
                    <button
                      type="button"
                      onClick={() =>
                        setRegisteredFriends((prev) => prev.filter((item) => item.id !== f.id))
                      }
                      className="text-red-400 hover:text-red-300 cursor-pointer"
                      title="Remove Friend"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </span>
              ))}
            </div>
          )}
        </form>
      )}

      {/* Main Viewfinder */}
      <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
        />

        {/* Aaj Tak / Cybernetic Reticle HUD */}
        <div className="absolute inset-3 sm:inset-4 pointer-events-none border border-[#ffd700]/30 rounded-3xl flex flex-col justify-between p-3 sm:p-4">
          <div className="flex justify-between items-start gap-2">
            <div className="w-7 h-7 border-t-2 border-l-2 border-red-500 rounded-tl-xl" />
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono tracking-wider border ${
                scannerMode === 'face'
                  ? 'bg-red-700/85 border-[#ffd700]/70 text-white font-bold shadow-lg'
                  : 'bg-[#07090e]/85 border-[#ffd700]/50 text-[#ffd700]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              <span>
                {scannerMode === 'face'
                  ? '🔴 LIVE: FACE & HAND BIOMETRIC ANALYSIS'
                  : 'LIVE AI VISION REASONING'}
              </span>
            </div>
            <div className="w-7 h-7 border-t-2 border-r-2 border-red-500 rounded-tr-xl" />
          </div>

          {/* Center Biometric Target Ring (Accepts Face OR Hand/Palm) */}
          <div className="self-center flex flex-col items-center justify-center">
            {scannerMode === 'face' ? (
              <div className="relative w-48 h-56 sm:w-60 sm:h-72 rounded-3xl border-2 border-dashed border-[#ffd700]/80 shadow-[0_0_30px_rgba(255,215,0,0.22)] flex flex-col items-center justify-center gap-2 overflow-hidden">
                <div className="flex items-center gap-3 text-[#ffd700]/55">
                  <ScanFace className="w-10 h-10" />
                  <Hand className="w-9 h-9" />
                </div>
                <span className="text-[10px] font-hindi font-bold text-[#ffd700] bg-black/75 px-2.5 py-0.5 rounded-full border border-[#ffd700]/40">
                  चेहरा या हाथ यहाँ दिखाएं
                </span>
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-500 via-[#ffd700] to-red-500 opacity-90 animate-[scanSweep_2.6s_ease-in-out_infinite]" />
              </div>
            ) : (
              <div className="relative w-48 h-48 sm:w-64 sm:h-64 rounded-2xl border-2 border-dashed border-amber-400/50 flex items-center justify-center overflow-hidden">
                <Scan className="w-12 h-12 text-cyan-400/60 animate-pulse" />
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80 animate-[scanSweep_2.6s_ease-in-out_infinite]" />
              </div>
            )}
          </div>

          <div className="flex justify-between items-end pb-7">
            <div className="w-7 h-7 border-b-2 border-l-2 border-red-500 rounded-bl-xl" />
            <div className="text-[10px] font-chakra text-[#ffd700] bg-[#07090e]/85 px-3 py-1 rounded-full border border-[#ffd700]/40">
              👑 Master Ajay Boss • Rishikesh Studio
            </div>
            <div className="w-7 h-7 border-b-2 border-r-2 border-red-500 rounded-br-xl" />
          </div>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="absolute top-16 mx-4 p-3 rounded-xl bg-red-950/90 border border-red-500 text-red-200 text-xs text-center z-30 shadow-2xl">
            {errorMessage}
          </div>
        )}

        {/* Aaj Tak News Channel Style Biometric Result Broadcast Card */}
        {scannerMode === 'face' && faceScanResult && (
          <div className="absolute bottom-9 inset-x-2 sm:inset-x-6 max-w-xl mx-auto max-h-[54vh] overflow-y-auto rounded-2xl bg-[#07090e]/95 border-2 border-[#ffd700] shadow-[0_0_40px_rgba(220,38,38,0.35)] z-30 backdrop-blur-md animate-in slide-in-from-bottom duration-200">
            {/* Aaj Tak Breaking Header Strip */}
            <div className="px-3.5 py-2 bg-gradient-to-r from-red-700 via-red-600 to-amber-600 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="px-1.5 py-0.5 rounded bg-white text-red-700 font-hindi font-black text-[10px] shrink-0">
                  आज तक EXCLUSIVE
                </span>
                <span className="text-xs font-chakra font-black text-white truncate">
                  {faceScanResult.statusBadge}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span className="px-2 py-0.5 rounded bg-black/50 text-[#ffd700] text-[10px] font-mono font-bold">
                  {faceScanResult.scanType === 'HAND' ? '🖐️ HAND' : '🙂 FACE'} • {faceScanResult.confidencePercent}%
                </span>
                <button
                  type="button"
                  onClick={() => setFaceScanResult(null)}
                  className="p-1 rounded bg-black/40 text-white hover:bg-black/70 cursor-pointer"
                  title="Dismiss Card"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Structured Hindi + Cyber Breakdown Rows */}
            <div className="p-3.5 space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-[#0e1424] border border-[#ffd700]/40 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-[#ffd700] font-hindi font-bold block">
                      🏷️ नाम (Name):
                    </span>
                    <span className="text-sm font-hindi font-black text-white">
                      {faceScanResult.name}
                    </span>
                  </div>
                  {faceScanResult.detectedRole === 'CREATOR_BOSS' ? (
                    <Crown className="w-5 h-5 text-[#ffd700] shrink-0" />
                  ) : (
                    <UserCheck className="w-5 h-5 text-red-400 shrink-0" />
                  )}
                </div>

                <div className="p-2.5 rounded-xl bg-[#0e1424] border border-[#ffd700]/40">
                  <span className="text-[10px] text-[#ffd700] font-hindi font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3" /> ⏳ वर्तमान उम्र (Current Age):
                  </span>
                  <span className="text-sm font-hindi font-black text-white">
                    {faceScanResult.currentAgeText}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#0e1424] border border-[#ffd700]/40">
                  <span className="text-[10px] text-[#ffd700] font-hindi font-bold flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> 📅 जन्म का महीना (Birth Month):
                  </span>
                  <span className="text-sm font-hindi font-bold text-slate-100">
                    {faceScanResult.birthMonth}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#0e1424] border border-[#ffd700]/40">
                  <span className="text-[10px] text-[#ffd700] font-hindi font-bold flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> 🗓️ जन्म का साल (Birth Year):
                  </span>
                  <span className="text-sm font-mono font-black text-[#ffd700]">
                    {faceScanResult.birthYear > 0 ? faceScanResult.birthYear : '—'}
                  </span>
                </div>
              </div>

              {/* Studies & Future Prediction ("भविष्य और पढ़ाई का कच्चा चिट्ठा") */}
              {faceScanResult.futurePrediction && (
                <div
                  className={`p-3 rounded-xl border-2 text-xs font-hindi space-y-1 ${
                    faceScanResult.detectedRole === 'CREATOR_BOSS'
                      ? 'bg-gradient-to-br from-[#ffd700]/20 via-[#0e1424] to-amber-950/30 border-[#ffd700] shadow-[0_0_20px_rgba(255,215,0,0.2)]'
                      : 'bg-gradient-to-br from-[#ffd700]/10 via-[#0e1424] to-red-950/30 border-[#ffd700]/75'
                  }`}
                >
                  <span className="text-[11px] font-black text-[#ffd700] flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 shrink-0" />
                    <span>📚 भविष्य और पढ़ाई का कच्चा चिट्ठा (Studies &amp; Future Prediction):</span>
                  </span>
                  <p className="text-xs sm:text-[13px] text-white leading-relaxed font-semibold">
                    {faceScanResult.futurePrediction}
                  </p>
                </div>
              )}

              {/* Creator Royal Highlight or Location/DOB Strip */}
              <div
                className={`p-2.5 rounded-xl border text-xs font-hindi flex flex-wrap items-center justify-between gap-2 ${
                  faceScanResult.detectedRole === 'CREATOR_BOSS'
                    ? 'bg-[#ffd700]/15 border-[#ffd700] text-amber-100'
                    : 'bg-red-950/35 border-red-500/40 text-slate-100'
                }`}
              >
                <span className="flex items-center gap-1.5 font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-[#ffd700] shrink-0" />
                  <span>{faceScanResult.location}</span>
                </span>
                <span className="font-bold text-[#ffd700]">
                  DOB: {faceScanResult.dateOfBirth}
                </span>
              </div>

              {faceScanResult.facialMarkers?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {faceScanResult.facialMarkers.map((marker, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-[10px] text-slate-300"
                    >
                      • {marker}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* General Vision Reasoning Result Overlay */}
        {scannerMode === 'vision' && liveReasoningResult && (
          <div className="absolute bottom-3 inset-x-3 sm:inset-x-8 max-h-[45vh] overflow-y-auto p-4 rounded-2xl bg-[#0a0f1e]/95 border-2 border-[#ffd700]/60 shadow-2xl shadow-black z-30 space-y-2 backdrop-blur-md animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <h4 className="font-chakra font-bold text-sm text-amber-200">
                  {liveReasoningResult.title}
                </h4>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700">
                {liveReasoningResult.subjectCategory}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-amber-100 italic font-hindi">
              "{liveReasoningResult.speechText}"
            </p>

            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-400/40 text-xs sm:text-sm font-bold text-amber-300 font-hindi">
              🏆 Answer: {liveReasoningResult.finalAnswer}
            </div>
          </div>
        )}

        {/* Live Scrolling Aaj Tak Style Breaking News Ticker at Bottom of Viewfinder */}
        {scannerMode === 'face' && (
          <div className="absolute bottom-0 inset-x-0 z-20 h-7 bg-gradient-to-r from-red-700 via-red-600 to-red-700 border-t border-[#ffd700]/70 flex items-center overflow-hidden">
            <div className="bg-[#ffd700] text-[#07090e] font-hindi font-black text-[10px] px-2.5 h-full flex items-center shrink-0 z-10 shadow-md">
              ब्रेकिंग न्यूज़
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="animate-news-ticker text-[11px] font-hindi font-bold text-white px-3">
                <span className="mr-10">{liveTickerText}</span>
                <span className="mr-10">{liveTickerText}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Live Interaction Dock */}
      <div className="relative z-20 p-3 sm:p-4 bg-[#07090e] border-t border-[#ffd700]/30">
        <div className="max-w-lg mx-auto space-y-2.5">
          {voiceQuery && (
            <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-cyan-400/50 text-xs text-cyan-200 font-hindi flex items-center justify-between">
              <span><strong>Master Ajay Boss:</strong> "{voiceQuery}"</span>
              {isListening && <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />}
            </div>
          )}

          <div className="flex items-center justify-between gap-2.5">
            {scannerMode === 'face' ? (
              <button
                type="button"
                onClick={() => {
                  soundEffects.playBeep();
                  setIsAutoFaceScan((prev) => !prev);
                }}
                className={`min-h-[48px] px-3.5 rounded-2xl border text-xs font-chakra font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                  isAutoFaceScan
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 animate-pulse'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-[#ffd700]/50'
                }`}
                title="Toggle automatic continuous scan every 5 seconds"
              >
                <Activity className="w-4 h-4" />
                <span>{isAutoFaceScan ? 'Auto ON' : 'Auto Scan'}</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  soundEffects.playBeep();
                  if (isListening) stopListening();
                  else startListening();
                }}
                className={`min-h-[48px] p-3.5 rounded-2xl border transition-all active:scale-95 flex items-center gap-2 cursor-pointer ${
                  isListening
                    ? 'bg-red-600 text-white border-red-400 animate-pulse shadow-lg shadow-red-600/30'
                    : 'bg-slate-900/90 text-slate-200 border-slate-700 hover:border-cyan-400'
                }`}
                title={isListening ? 'Stop Voice Input' : 'Talk Naturally to Jarvis'}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-cyan-400" />}
                <span className="text-xs font-chakra font-bold hidden xs:inline">
                  {isListening ? 'Listening...' : 'Talk'}
                </span>
              </button>
            )}

            <button
              onClick={() =>
                scannerMode === 'face' ? scanLiveBiometric(false) : captureAndReason()
              }
              disabled={isAnalyzing}
              className={`flex-1 min-h-[48px] py-3 px-4 rounded-2xl font-chakra font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-2xl transition-all active:scale-[0.98] cursor-pointer ${
                isAnalyzing
                  ? 'bg-slate-800 text-[#ffd700] border border-[#ffd700]/50 animate-pulse'
                  : scannerMode === 'face'
                  ? 'bg-gradient-to-r from-red-600 via-amber-500 to-[#ffd700] text-[#07090e] shadow-[0_0_24px_rgba(220,38,38,0.45)]'
                  : 'bg-[#ffd700] hover:bg-amber-300 text-[#07090e] shadow-[0_0_24px_rgba(255,215,0,0.35)]'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-[#ffd700]" />
                  <span>
                    {scannerMode === 'face' ? 'Scanning Face / Hand...' : 'Reasoning on Live Frame...'}
                  </span>
                </>
              ) : scannerMode === 'face' ? (
                <>
                  <ScanFace className="w-5 h-5" />
                  <span>📺 SCAN FACE / HAND NOW</span>
                  <Zap className="w-4 h-4 fill-current" />
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4" />
                  <span>⚡ Reason on Live Camera</span>
                  <Zap className="w-4 h-4 fill-current" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
