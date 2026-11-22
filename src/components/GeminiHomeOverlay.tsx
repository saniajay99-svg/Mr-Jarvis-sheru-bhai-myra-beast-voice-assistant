import React from 'react';
import {
  X,
  Mic,
  MicOff,
  Camera,
  Hammer,
  Flame,
  Phone,
  Sparkles,
  Volume2,
  ArrowUpRight,
  Terminal,
  Radar,
  ScanFace
} from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface GeminiHomeOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  verifiedHumanId: string;
  isListening: boolean;
  isSpeaking: boolean;
  isTorchOn: boolean;
  onToggleMic: () => void;
  onStopSpeech: () => void;
  onQuickPrompt: (prompt: string) => void;
  onOpenLiveVision: () => void;
  onOpenAppBuilder: () => void;
  onOpenPromptStudio: () => void;
  onToggleTorch: () => void;
  onOpenDialer: () => void;
  isStandingMode?: boolean;
  onToggleStandingMode?: () => void;
}

const OVERLAY_SUGGESTIONS = [
  '⚡ Standing Mode: vivo V17 AMOLED screen ka poora कच्चा चिट्ठा',
  'Solve 3x² - 12x + 9 = 0 step-by-step',
  'हिंदी व्याकरण: संधि के भेद उदाहरण सहित समझाएं',
];

export const GeminiHomeOverlay: React.FC<GeminiHomeOverlayProps> = ({
  isOpen,
  onClose,
  verifiedHumanId,
  isListening,
  isSpeaking,
  isTorchOn,
  onToggleMic,
  onStopSpeech,
  onQuickPrompt,
  onOpenLiveVision,
  onOpenAppBuilder,
  onOpenPromptStudio,
  onToggleTorch,
  onOpenDialer,
  isStandingMode = false,
  onToggleStandingMode,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Mr Jarvis Sheru Bhai Myra Beast Home Screen Overlay"
      className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center p-0 sm:p-4"
    >
      {/* Dimmed Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
        onClick={() => {
          soundEffects.playBeep();
          onClose();
        }}
      />

      {/* Floating Gemini-Inspired Overlay Sheet */}
      <div className="relative z-10 w-full max-w-lg mx-auto bg-[#0b0f19]/95 border-t-2 sm:border-2 border-[#ffd700]/55 rounded-t-3xl sm:rounded-3xl shadow-[0_-12px_48px_rgba(255,215,0,0.18)] overflow-hidden animate-in slide-in-from-bottom duration-200">
        {/* Top Glowing Cyber Rim */}
        <div
          aria-hidden="true"
          className="h-1 w-full bg-gradient-to-r from-[#ffd700] via-cyan-400 to-[#ffd700]"
        />

        {/* Drag Handle (Mobile Affordance) */}
        <div className="sm:hidden pt-2.5 flex justify-center">
          <div className="w-10 h-1 rounded-full bg-[#ffd700]/40" />
        </div>

        <div className="p-4 sm:p-6 space-y-5">
          {/* Header Row: Sheru Bhai & Master Ajay Dual Avatar + Close */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative flex items-center -space-x-2.5 shrink-0">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#ffd700] bg-[#07090e]">
                  <img
                    src="./ajay-crown.png"
                    alt="Master Ajay Boss"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-cyan-400 bg-[#07090e]">
                  <img
                    src="./person-ai-assistant.png"
                    alt="Sheru Bhai AI Assistant"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="min-w-0">
                <p className="text-[11px] font-medium text-[#ffd700] truncate">
                  Mr Jarvis Sheru Bhai Myra Beast
                </p>
                <h2 className="font-chakra font-bold text-base sm:text-lg text-slate-100 truncate">
                  Hi {verifiedHumanId}, how can we help?
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                soundEffects.playBeep();
                onClose();
              }}
              aria-label="Close Home Screen Overlay"
              className="min-h-[44px] min-w-[44px] rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Gemini Live Acoustic Voice Orb Strip */}
          <div className="p-3.5 rounded-2xl bg-[#07090e] border border-[#ffd700]/35 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => {
                  soundEffects.playJarvisWake();
                  if (isSpeaking) {
                    onStopSpeech();
                  } else {
                    onToggleMic();
                  }
                }}
                aria-label={isListening ? 'Stop voice listening' : isSpeaking ? 'Stop assistant voice' : 'Start voice command'}
                className={`min-h-[48px] min-w-[48px] rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                  isListening
                    ? 'bg-red-600 text-white shadow-[0_0_24px_rgba(239,68,68,0.5)] animate-pulse'
                    : isSpeaking
                    ? 'bg-cyan-400 text-[#07090e] shadow-[0_0_24px_rgba(34,211,238,0.45)]'
                    : 'bg-[#ffd700] text-[#07090e] shadow-[0_0_20px_rgba(255,215,0,0.35)] hover:bg-amber-300'
                }`}
              >
                {isListening ? (
                  <MicOff className="w-5 h-5" />
                ) : isSpeaking ? (
                  <Volume2 className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </button>

              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-chakra font-bold text-slate-100 truncate">
                  {isListening
                    ? 'Listening to your voice...'
                    : isSpeaking
                    ? 'Sheru Bhai & Myra Speaking'
                    : 'Tap to Talk with Sheru Bhai & Myra'}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  Hindi, Hinglish &amp; English real-time voice engine
                </p>
              </div>
            </div>

            {isSpeaking && (
              <button
                type="button"
                onClick={() => {
                  soundEffects.playBeep();
                  onStopSpeech();
                }}
                className="min-h-[40px] px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-semibold text-slate-200 cursor-pointer shrink-0"
              >
                Stop
              </button>
            )}
          </div>

          {/* 4 Thumb-Friendly Quick Actions Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => {
                soundEffects.playJarvisWake();
                onClose();
                onOpenLiveVision();
              }}
              className="min-h-[52px] p-3 rounded-2xl bg-[#111726] hover:bg-[#172034] border border-slate-800 hover:border-[#ffd700]/50 flex items-center gap-2.5 text-left transition-all cursor-pointer active:scale-[0.98]"
            >
              <div className="w-9 h-9 rounded-xl bg-[#ffd700]/15 text-[#ffd700] flex items-center justify-center shrink-0">
                <ScanFace className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-chakra font-bold text-slate-100 truncate">Face &amp; Vision</div>
                <div className="text-[10px] text-slate-400 truncate">Live face &amp; age scan</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                soundEffects.playJarvisWake();
                onClose();
                onOpenAppBuilder();
              }}
              className="min-h-[52px] p-3 rounded-2xl bg-[#111726] hover:bg-[#172034] border border-slate-800 hover:border-[#ffd700]/50 flex items-center gap-2.5 text-left transition-all cursor-pointer active:scale-[0.98]"
            >
              <div className="w-9 h-9 rounded-xl bg-cyan-500/15 text-cyan-300 flex items-center justify-center shrink-0">
                <Hammer className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-chakra font-bold text-slate-100 truncate">AI App Builder</div>
                <div className="text-[10px] text-slate-400 truncate">Build live apps</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                soundEffects.playJarvisWake();
                onToggleStandingMode?.();
                onClose();
              }}
              className={`min-h-[52px] p-3 rounded-2xl border flex items-center gap-2.5 text-left transition-all cursor-pointer active:scale-[0.98] ${
                isStandingMode
                  ? 'bg-[#ffd700]/20 border-[#ffd700] shadow-[0_0_20px_rgba(255,215,0,0.22)]'
                  : 'bg-[#111726] hover:bg-[#172034] border-slate-800 hover:border-[#ffd700]/50'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-[#ffd700]/15 text-[#ffd700] flex items-center justify-center shrink-0">
                <Radar className={`w-4 h-4 ${isStandingMode ? 'animate-spin' : ''}`} />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-chakra font-bold text-[#ffd700] truncate">
                  {isStandingMode ? 'Standing Mode ON' : 'Standing Mode'}
                </div>
                <div className="text-[10px] text-slate-400 truncate">Deep-scan कच्चा चिट्ठा</div>
              </div>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  soundEffects.playJarvisWake();
                  onToggleTorch();
                }}
                title="Toggle Flashlight"
                className={`min-h-[52px] p-2 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer active:scale-[0.98] ${
                  isTorchOn
                    ? 'bg-[#ffd700] text-[#07090e] border-[#ffd700] font-bold'
                    : 'bg-[#111726] hover:bg-[#172034] border-slate-800 text-slate-200'
                }`}
              >
                <Flame className="w-4 h-4" />
                <span className="text-[10px] font-semibold">Torch</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundEffects.playBeep();
                  onClose();
                  onOpenDialer();
                }}
                title="Quick Phone Dialer"
                className="min-h-[52px] p-2 rounded-2xl bg-[#111726] hover:bg-[#172034] border border-slate-800 hover:border-[#ffd700]/50 text-slate-200 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer active:scale-[0.98]"
              >
                <Phone className="w-4 h-4 text-[#ffd700]" />
                <span className="text-[10px] font-semibold">Call</span>
              </button>
            </div>
          </div>

          {/* Smart Suggestions */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#ffd700]" />
              <span>Try asking</span>
            </p>
            <div className="space-y-1.5">
              {OVERLAY_SUGGESTIONS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => {
                    soundEffects.playJarvisWake();
                    onClose();
                    onQuickPrompt(prompt);
                  }}
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-[#07090e] hover:bg-[#141a29] border border-slate-800 hover:border-[#ffd700]/50 text-left text-xs text-slate-200 flex items-center justify-between gap-2 transition-colors cursor-pointer"
                >
                  <span className="truncate font-hindi">{prompt}</span>
                  <ArrowUpRight className="w-4 h-4 text-[#ffd700] shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
