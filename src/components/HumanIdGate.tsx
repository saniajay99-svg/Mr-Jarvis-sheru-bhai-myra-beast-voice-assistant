import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  ShieldCheck,
  ScanFace,
  Camera,
  RefreshCw,
  Lock,
  Unlock,
  AlertCircle,
  UserCheck
} from 'lucide-react';
import { soundEffects, speechManager, assistantThemeAudio, loadVoiceConfig } from '../utils/audio';

interface HumanIdGateProps {
  onVerified: (humanId: string) => void;
}

export const HumanIdGate: React.FC<HumanIdGateProps> = ({ onVerified }) => {
  const [humanId, setHumanId] = useState('');
  const [cameraState, setCameraState] = useState<'initializing' | 'live' | 'fallback'>('initializing');
  const [cameraError, setCameraError] = useState<string>('');
  const [validationError, setValidationError] = useState<string>('');
  const [isUnlocking, setIsUnlocking] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore cleanup failure
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startFrontCamera = useCallback(async () => {
    stopCameraStream();
    setCameraState('initializing');
    setCameraError('');

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setCameraState('fallback');
      setCameraError('Front camera unavailable in this browser. Face scan standby active.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 640 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setCameraState('live');
    } catch {
      setCameraState('fallback');
      setCameraError('Camera permission denied or no front camera detected. Enter Human ID to verify.');
    }
  }, [stopCameraStream]);

  useEffect(() => {
    startFrontCamera();
    return () => {
      stopCameraStream();
    };
  }, [startFrontCamera, stopCameraStream]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = humanId.trim();

    if (trimmed.length < 2) {
      soundEffects.playBeep();
      setValidationError('Please enter a valid Human ID (minimum 2 characters, e.g. Master Ajay Boss).');
      return;
    }

    // Unlock audio engine on user gesture so the WWW Core voice greeting & theme track play seamlessly
    speechManager.unlockAudio();
    soundEffects.playJarvisWake();
    const voiceCfg = loadVoiceConfig();
    if (voiceCfg.themeEnabled && voiceCfg.autoPlayOnUnlock) {
      assistantThemeAudio.play();
    }

    setValidationError('');
    setIsUnlocking(true);

    setTimeout(() => {
      stopCameraStream();
      soundEffects.playSuccessChime();
      onVerified(trimmed);
    }, 450);
  };

  return (
    <div
      className={`min-h-[100dvh] w-full bg-[#07090e] text-slate-100 flex flex-col items-center justify-center px-4 py-6 sm:p-8 transition-all duration-500 ${
        isUnlocking ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
      }`}
    >
      {/* Subtle Radial Gold Atmosphere */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,215,0,0.12),transparent_55%)]"
      />

      <main className="relative z-10 w-full max-w-md sm:max-w-lg rounded-3xl bg-[#0b0f18] border border-[#ffd700]/45 shadow-[0_0_50px_rgba(255,215,0,0.14)] p-5 sm:p-8 space-y-6">
        {/* Gate Header */}
        <header className="text-center space-y-2">
          <div className="inline-flex items-center justify-center gap-2 text-xs font-medium tracking-wide text-[#ffd700]">
            {isUnlocking ? (
              <Unlock className="w-4 h-4 text-emerald-400" />
            ) : (
              <Lock className="w-4 h-4 text-[#ffd700]" />
            )}
            <span>Human ID Verification Gate</span>
          </div>

          <h1 className="font-chakra font-black text-2xl sm:text-3xl tracking-wide text-[#ffd700] text-balance">
            Mr Jarvis Sheru Bhai Myra Beast
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm mx-auto">
            Voice Assistant &amp; WWW Core stays locked until face scan preview and Human ID verification complete.
          </p>
        </header>

        {/* Circular Front-Camera Live Preview for Face Scanning */}
        <section aria-label="Circular front-camera face scan preview" className="flex flex-col items-center space-y-3">
          <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-full p-1.5 bg-gradient-to-tr from-[#ffd700] via-amber-300 to-[#ffd700]/40 shadow-[0_0_32px_rgba(255,215,0,0.28)]">
            <div className="relative w-full h-full rounded-full overflow-hidden bg-[#07090e] border border-[#ffd700]/50 flex items-center justify-center">
              {/* Live Front Camera Video Stream */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover scale-x-[-1] transition-opacity duration-300 ${
                  cameraState === 'live' ? 'opacity-100' : 'opacity-0 absolute inset-0'
                }`}
              />

              {/* Fallback / Initializing Visual */}
              {cameraState !== 'live' && (
                <div className="flex flex-col items-center justify-center text-center p-4 space-y-2">
                  <div className="w-16 h-16 rounded-full bg-[#ffd700]/10 border border-[#ffd700]/40 flex items-center justify-center">
                    <ScanFace className="w-8 h-8 text-[#ffd700]" />
                  </div>
                  <span className="text-[11px] font-medium text-slate-300">
                    {cameraState === 'initializing' ? 'Activating front camera...' : 'Biometric Standby Mode'}
                  </span>
                </div>
              )}

              {/* Subtle Face-Scan Laser Sweep Overlay (compositor transform only) */}
              {!isUnlocking && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#ffd700] to-transparent opacity-80 animate-[scanSweep_2.6s_ease-in-out_infinite]"
                />
              )}

              {/* Verified Success Overlay */}
              {isUnlocking && (
                <div className="absolute inset-0 bg-[#07090e]/80 flex flex-col items-center justify-center gap-1.5">
                  <ShieldCheck className="w-10 h-10 text-emerald-400" />
                  <span className="text-xs font-chakra font-bold text-emerald-300">ID Verified</span>
                </div>
              )}
            </div>
          </div>

          {/* Camera Status & Retry Control */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-[#ffd700]" />
              <span>
                {cameraState === 'live'
                  ? 'Front camera face scan active'
                  : cameraState === 'initializing'
                  ? 'Connecting front camera'
                  : 'Manual ID scan mode'}
              </span>
            </span>

            {cameraState === 'fallback' && (
              <button
                type="button"
                onClick={startFrontCamera}
                className="min-h-[44px] px-3 py-1.5 rounded-lg bg-[#141a28] hover:bg-[#1b2336] border border-[#ffd700]/40 text-[#ffd700] font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Camera</span>
              </button>
            )}
          </div>

          {cameraError && (
            <p className="text-[11px] text-amber-200/80 text-center max-w-xs leading-snug">
              {cameraError}
            </p>
          )}
        </section>

        {/* Human ID Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="humanIdInput"
              className="block text-xs font-semibold tracking-wide text-[#ffd700]"
            >
              Human ID
            </label>
            <input
              id="humanIdInput"
              type="text"
              autoComplete="name"
              value={humanId}
              onChange={(e) => {
                setHumanId(e.target.value);
                if (validationError) setValidationError('');
              }}
              placeholder="Enter Human ID (e.g., Master Ajay Boss)"
              className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-[#07090e] border border-[#ffd700]/50 focus:border-[#ffd700] focus:ring-2 focus:ring-[#ffd700]/25 text-sm sm:text-base text-slate-100 placeholder-slate-500 outline-none transition-colors"
            />
          </div>

          {/* 1-Tap Verified Profile Shortcuts */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-slate-400">Quick ID:</span>
            {['Master Ajay Boss', 'Shiv Kumar', 'Ladu'].map((presetName) => (
              <button
                key={presetName}
                type="button"
                onClick={() => {
                  soundEffects.playBeep();
                  setHumanId(presetName);
                  setValidationError('');
                }}
                className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer inline-flex items-center gap-1 ${
                  humanId.trim() === presetName
                    ? 'bg-[#ffd700]/20 border-[#ffd700] text-[#ffd700]'
                    : 'bg-[#111726] border-slate-800 text-slate-300 hover:border-[#ffd700]/50'
                }`}
              >
                <UserCheck className="w-3 h-3 text-[#ffd700]" />
                <span>{presetName}</span>
              </button>
            ))}
          </div>

          {/* Inline Validation Message */}
          {validationError && (
            <div
              role="alert"
              className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Primary Unlock CTA */}
          <button
            type="submit"
            disabled={isUnlocking}
            className="w-full min-h-[48px] py-3 px-6 rounded-xl bg-[#ffd700] hover:bg-amber-300 disabled:opacity-70 text-[#07090e] font-chakra font-black text-sm tracking-wider shadow-[0_0_24px_rgba(255,215,0,0.35)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShieldCheck className="w-5 h-5" />
            <span>{isUnlocking ? 'UNLOCKING WWW CORE...' : 'VERIFY ID & OPEN WWW'}</span>
          </button>
        </form>
      </main>
    </div>
  );
};
