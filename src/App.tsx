import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Radar, X } from 'lucide-react';
import { EngineType, CategoryType, QAItem, AssistantResponse, MediaAttachment, PhoneAction, PrecisionType, GroundingMode, AI_MODEL_PRESETS, AiModelPreset, AiModelPresetId } from './types';
import { soundEffects, speechManager, getSpeechRecognition, assistantThemeAudio, loadVoiceConfig } from './utils/audio';
import { phoneActions } from './utils/phoneActions';
import { Header } from './components/Header';
import { PoeBotCard } from './components/PoeBotCard';
import { MessageCard } from './components/MessageCard';
import { VoiceAssistantHUD } from './components/VoiceAssistantHUD';
import { InputBar } from './components/InputBar';
import { ActionTileMenu } from './components/ActionTileMenu';
import { ImageScannerModal } from './components/ImageScannerModal';
import { BeastClockModal } from './components/BeastClockModal';
import { DialerModal } from './components/DialerModal';
import { MrBeastSubModal } from './components/MrBeastSubModal';
import { LiveVisionModal } from './components/LiveVisionModal';
import { FeaturesMatrixModal } from './components/FeaturesMatrixModal';
import { AndroidApkModal } from './components/AndroidApkModal';
import { GemsDrawer, GEMS_MODES, GemMode } from './components/GemsDrawer';
import { PhotoToVideoModal } from './components/PhotoToVideoModal';
import { MeeshoMarketplaceHub } from './components/MeeshoMarketplaceHub';
import { MasterPromptStudio } from './components/MasterPromptStudio';
import { HumanIdGate } from './components/HumanIdGate';
import { AiAppBuilderModule } from './components/AiAppBuilderModule';
import { GeminiHomeOverlay } from './components/GeminiHomeOverlay';
import { VoiceSettingsModal } from './components/VoiceSettingsModal';

export default function App() {
  const [verifiedHumanId, setVerifiedHumanId] = useState<string | null>(null);

  if (!verifiedHumanId) {
    return <HumanIdGate onVerified={(id) => setVerifiedHumanId(id)} />;
  }

  return (
    <MrJarvisWwwCore
      verifiedHumanId={verifiedHumanId}
      onLockGate={() => {
        speechManager.stop();
        assistantThemeAudio.pause();
        setVerifiedHumanId(null);
      }}
    />
  );
}

interface MrJarvisWwwCoreProps {
  verifiedHumanId: string;
  onLockGate: () => void;
}

function MrJarvisWwwCore({ verifiedHumanId, onLockGate }: MrJarvisWwwCoreProps) {
  const [messages, setMessages] = useState<QAItem[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isMeeshoActive, setIsMeeshoActive] = useState(false);
  const [isPromptStudioOpen, setIsPromptStudioOpen] = useState(false);
  const [isAppBuilderOpen, setIsAppBuilderOpen] = useState(false);
  const [isHomeOverlayOpen, setIsHomeOverlayOpen] = useState(false);
  const [isPhotoToVideoOpen, setIsPhotoToVideoOpen] = useState(false);
  const [isStandingMode, setIsStandingMode] = useState(false);
  const [voiceBannerNotice, setVoiceBannerNotice] = useState<string | null>(null);
  const [selectedModelId, setSelectedModelId] = useState<AiModelPresetId>('sheru-bhai-voice');
  const [currentEngine, setCurrentEngine] = useState<EngineType>('auto');
  const [precisionMode, setPrecisionMode] = useState<PrecisionType>('balanced');
  const [groundingMode, setGroundingMode] = useState<GroundingMode>('auto');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('maths');
  const [attachedMedia, setAttachedMedia] = useState<MediaAttachment | null>(null);

  const activeModelPreset =
    AI_MODEL_PRESETS.find((m) => m.id === selectedModelId) || AI_MODEL_PRESETS[0];

  // Status flags
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [speakingItemId, setSpeakingItemId] = useState<string | null>(null);
  const [isTorchOn, setIsTorchOn] = useState(false);

  // Gems & Assistant Personas (Default: Sheru Bhai - Person AI Assistant)
  const [isGemsDrawerOpen, setIsGemsDrawerOpen] = useState(false);
  const [activeGem, setActiveGem] = useState<GemMode>(
    GEMS_MODES.find((g) => g.id === 'sharu-bhai-assistant') || GEMS_MODES[0]
  );

  const handleSelectModelPreset = (preset: AiModelPreset) => {
    setSelectedModelId(preset.id);
    setCurrentEngine(preset.engine);
    setPrecisionMode(preset.precision);
    const matchedGem = GEMS_MODES.find((g) => g.id === preset.gemId);
    if (matchedGem) setActiveGem(matchedGem);

    const voicePresetMap: Record<AiModelPresetId, 'jarvis-royal' | 'myra-sweet' | 'sheru-bold'> = {
      'jarvis-beast-core': 'jarvis-royal',
      'myra-beast-assistant': 'myra-sweet',
      'flash-fast-mode': 'jarvis-royal',
      'sheru-bhai-voice': 'sheru-bold',
    };
    const nextVoicePreset = voicePresetMap[preset.id];
    const currentVoiceCfg = loadVoiceConfig();
    if (currentVoiceCfg.voicePreset !== nextVoicePreset) {
      speechManager.applyConfig({
        voicePreset: nextVoicePreset,
        speechPitch: nextVoicePreset === 'myra-sweet' ? 1.15 : nextVoicePreset === 'sheru-bold' ? 0.86 : 0.95,
        speechRate: preset.id === 'flash-fast-mode' ? 1.1 : nextVoicePreset === 'sheru-bold' ? 1.03 : 1.02,
      });
    }
  };

  // Modals & Menu
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isLiveVisionOpen, setIsLiveVisionOpen] = useState(false);
  const [liveVisionMode, setLiveVisionMode] = useState<'vision' | 'face'>('vision');
  const [isFeaturesMatrixOpen, setIsFeaturesMatrixOpen] = useState(false);
  const [isApkModalOpen, setIsApkModalOpen] = useState(false);
  const [isClockModalOpen, setIsClockModalOpen] = useState(false);
  const [isDialerModalOpen, setIsDialerModalOpen] = useState(false);
  const [isMrBeastModalOpen, setIsMrBeastModalOpen] = useState(false);
  const [isVoiceSettingsOpen, setIsVoiceSettingsOpen] = useState(false);
  const [isThemeAudioPlaying, setIsThemeAudioPlaying] = useState(false);

  // Refs
  const recognitionRef = useRef<any>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Voice greeting right after Human ID Gate unlock while keeping the Poe chat feed clean
  useEffect(() => {
    const timer = setTimeout(() => {
      soundEffects.playJarvisWake();
      if (!isMuted) {
        speechManager.speak(
          `Pranam ${verifiedHumanId}! Main Sheru Bhai, aapka Person AI Assistant bol raha hoon! Welcome to Mr Jarvis Sheru Bhai Myra Beast Voice Assistant!`,
          {
            onStart: () => {
              setSpeakingItemId('welcome-greeting');
              setIsSpeaking(true);
            },
            onEnd: () => {
              setIsSpeaking(false);
              setSpeakingItemId(null);
            },
            onError: () => {
              setIsSpeaking(false);
              setSpeakingItemId(null);
            },
          }
        );
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [verifiedHumanId]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isProcessing]);

  // Global user interaction listener to unlock audio & TTS on mobile browsers
  useEffect(() => {
    const unlockOnFirstInteraction = () => {
      speechManager.unlockAudio();
    };
    window.addEventListener('click', unlockOnFirstInteraction, { once: true });
    window.addEventListener('touchstart', unlockOnFirstInteraction, { once: true });

    const unsubAudio = assistantThemeAudio.subscribe((state) => {
      setIsThemeAudioPlaying(state.isPlaying);
    });

    return () => {
      window.removeEventListener('click', unlockOnFirstInteraction);
      window.removeEventListener('touchstart', unlockOnFirstInteraction);
      unsubAudio();
    };
  }, []);

  // Voice Narration handler
  const handlePlaySpeech = (text: string, itemId: string) => {
    if (isMuted) return;
    setSpeakingItemId(itemId);
    speechManager.speak(text, {
      onStart: () => setIsSpeaking(true),
      onEnd: () => {
        setIsSpeaking(false);
        setSpeakingItemId(null);
      },
      onError: () => {
        setIsSpeaking(false);
        setSpeakingItemId(null);
      }
    });
  };

  const handleStopSpeech = () => {
    speechManager.stop();
    setIsSpeaking(false);
    setSpeakingItemId(null);
  };

  const handleSetMuted = (nextMuted: boolean) => {
    if (nextMuted) {
      handleStopSpeech();
    }
    assistantThemeAudio.setMuted(nextMuted);
    setIsMuted(nextMuted);
  };

  const handleToggleMute = () => {
    handleSetMuted(!isMuted);
  };

  const handleActivateSheruBhaiVoice = () => {
    speechManager.unlockAudio();
    soundEffects.playJarvisWake();
    handleSetMuted(false);

    speechManager.applyConfig({
      voicePreset: 'sheru-bold',
      preferredLang: 'hi-IN',
      speechRate: 1.03,
      speechPitch: 0.86,
      selectedVoiceURI: '',
      themeEnabled: true,
    });
    assistantThemeAudio.play();

    const sheruGem = GEMS_MODES.find((g) => g.id === 'sharu-bhai-assistant');
    if (sheruGem) {
      setActiveGem(sheruGem);
    }

    setVoiceBannerNotice('🦁 Sheru Bhai Voice set on Person AI Assistant!');
    setTimeout(() => setVoiceBannerNotice(null), 4000);

    speechManager.speak(
      `Pranam ${verifiedHumanId}! Main Sheru Bhai, aapka Person AI Assistant bol raha hoon! Sheru Bhai voice ab set ho chuki hai, hukum kijiye Boss!`,
      {
        onStart: () => {
          setSpeakingItemId('sheru-voice-activate');
          setIsSpeaking(true);
        },
        onEnd: () => {
          setIsSpeaking(false);
          setSpeakingItemId(null);
        },
        onError: () => {
          setIsSpeaking(false);
          setSpeakingItemId(null);
        },
      }
    );
  };

  const handleToggleStandingMode = (forceState?: boolean) => {
    speechManager.unlockAudio();
    const nextState = typeof forceState === 'boolean' ? forceState : !isStandingMode;
    setIsStandingMode(nextState);
    soundEffects.playJarvisWake();

    if (nextState) {
      setSelectedCategory('standing');
      setVoiceBannerNotice('[STANDING MODE ACTIVE] Ultra-fast deep scan & कच्चा चिट्ठा ready for Master Ajay Boss (Ladu)!');
      if (!isMuted) {
        speechManager.speak(
          'Standing Mode Activated, Master Ajay Boss Ladu! Deep-scan aur poora kachcha chittha engine ab full speed par active hai!',
          {
            onStart: () => setIsSpeaking(true),
            onEnd: () => setIsSpeaking(false),
            onError: () => setIsSpeaking(false),
          }
        );
      }
    } else {
      if (selectedCategory === 'standing') {
        setSelectedCategory('maths');
      }
      setVoiceBannerNotice('Standing Mode turned off. Standard Jarvis & Myra mode active.');
      if (!isMuted) {
        speechManager.speak('Standing Mode deactivated. Standard dual-engine active!');
      }
    }
    setTimeout(() => setVoiceBannerNotice(null), 4000);
  };

  // JARVIS Phone Action Execution Engine
  const executePhoneAction = async (action: PhoneAction, itemId?: string) => {
    soundEffects.playJarvisWake();

    switch (action.actionType) {
      case 'call': {
        const targetNumber = action.target || '+919876543210';
        phoneActions.callNumber(targetNumber);
        break;
      }
      case 'whatsapp': {
        phoneActions.openWhatsApp(action.target || 'Namaste Aijay Boss!');
        break;
      }
      case 'flashlight': {
        const res = await phoneActions.toggleTorch();
        setIsTorchOn(phoneActions.isTorchOn);
        if (!isMuted) {
          speechManager.speak(`Aijay Boss! ${res.message}`);
        }
        break;
      }
      case 'battery': {
        const b = await phoneActions.getBatteryStatus();
        if (!isMuted) {
          speechManager.speak(b.message);
        }
        break;
      }
      case 'timer': {
        const secs = parseInt(action.target || '300', 10) || 300;
        if (!isMuted) {
          speechManager.speak(`Aijay Boss, starting countdown timer for ${Math.round(secs / 60)} minutes!`);
        }
        phoneActions.startTimer(secs, () => {}, () => {
          if (!isMuted) {
            speechManager.speak("Aijay Boss! Your study timer is complete!");
          }
        });
        break;
      }
      case 'maps': {
        phoneActions.openMaps(action.target || 'India');
        break;
      }
      case 'youtube': {
        phoneActions.openYouTube(action.target || 'MrBeast');
        break;
      }
      case 'copy': {
        if (action.target) {
          await phoneActions.copyText(action.target);
          if (!isMuted) {
            speechManager.speak("Aijay Boss, solution copied to clipboard!");
          }
        }
        break;
      }
      case 'vibrate': {
        phoneActions.vibrate([150, 80, 200, 100, 300]);
        if (!isMuted) {
          speechManager.speak("Aijay Boss, haptic feedback test confirmed!");
        }
        break;
      }
      case 'clock': {
        setIsClockModalOpen(true);
        break;
      }
      case 'camera': {
        setIsImageModalOpen(true);
        if (!isMuted) {
          speechManager.speak("Aijay Boss, camera khol diya hai!");
        }
        break;
      }
      case 'google': {
        phoneActions.openGoogle(action.target || '');
        if (!isMuted) {
          speechManager.speak("Aijay Boss, Google search open kar diya hai!");
        }
        break;
      }
      case 'calculator': {
        phoneActions.openCalculator();
        if (!isMuted) {
          speechManager.speak("Aijay Boss, calculator open kar diya hai!");
        }
        break;
      }
      case 'open_app': {
        const targetApp = action.target || 'YouTube';
        phoneActions.openApp(targetApp);
        if (!isMuted) {
          speechManager.speak(`Aijay Boss, ${targetApp} app open kar raha hoon!`);
        }
        break;
      }
      default:
        break;
    }

    if (itemId) {
      setMessages((prev) =>
        prev.map((m) => (m.id === itemId ? { ...m, actionExecuted: true } : m))
      );
    }
  };

  // Speech Recognition (Microphone) handler
  const handleToggleMic = () => {
    speechManager.unlockAudio();

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const recognition = getSpeechRecognition();
    if (!recognition) {
      setVoiceBannerNotice("Voice microphone speech recognition requires Chrome, Edge, or Android WebView.");
      setTimeout(() => setVoiceBannerNotice(null), 3500);
      return;
    }

    recognition.lang = 'hi-IN'; // recognizes Hindi & Hinglish & English
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      soundEffects.playJarvisWake();
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputQuery(transcript);
      setIsListening(false);
      soundEffects.playBeep();

      // Auto-submit after voice input
      setTimeout(() => {
        processQuery(transcript, attachedMedia, currentEngine, selectedCategory);
      }, 300);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  // Direct WhatsApp Share Shortcut
  const handleShareWhatsApp = (customText?: string) => {
    soundEffects.playBeep();
    const studioUrl = 'https://jarvis-beast-ai-assistant.ai.studio';
    let textToShare = customText;
    if (!textToShare) {
      const lastAnswered = [...messages].reverse().find(m => m.status === 'answered' && m.response);
      if (lastAnswered && lastAnswered.response) {
        textToShare = `*Mr Jarvis Beast Solution for Aijay Boss* 👑\n\n❓ *Question:* ${lastAnswered.questionText}\n\n✅ *Answer:* ${lastAnswered.response.finalAnswer}\n\n📌 *Title:* ${lastAnswered.response.title}\n💡 _Beast Tip: ${lastAnswered.response.beastTip}_\n\n🌐 *Studio:* ${studioUrl}`;
      } else {
        textToShare = `Namaste! Mr Jarvis Beast is active for Aijay Boss with 500M Beast Energy!\n\n🌐 *Studio:* ${studioUrl}`;
      }
    } else if (!textToShare.includes('jarvis-beast-ai-assistant.ai.studio')) {
      textToShare = `${textToShare}\n\n🌐 *Live Studio:* ${studioUrl}`;
    }
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(textToShare)}`;
    window.open(url, '_blank');
  };

  // Process Query via Live AI Engine (Question on TOP, Answer at BOTTOM, MANDATORY Auto-TTS)
  const processQuery = async (
    queryText: string,
    media: MediaAttachment | null = attachedMedia,
    engine: EngineType = currentEngine,
    category: CategoryType = selectedCategory
  ) => {
    // Unlock mobile audio for immediate autoplay
    speechManager.unlockAudio();

    const trimmedQuery = queryText.trim();
    if (!trimmedQuery && !media) return;

    // Check for direct voice/text shortcuts
    const lower = trimmedQuery.toLowerCase();
    if (
      lower === 'standing mode off' ||
      lower === 'exit standing mode' ||
      lower === 'deactivate standing mode'
    ) {
      setInputQuery('');
      handleToggleStandingMode(false);
      return;
    }

    if (
      lower === 'standing mode' ||
      lower === 'standing mode on' ||
      lower === 'activate standing mode' ||
      lower === '[standing mode active]'
    ) {
      setInputQuery('');
      handleToggleStandingMode(true);
      return;
    }

    const queryRequestsStanding =
      isStandingMode ||
      category === 'standing' ||
      lower.includes('standing mode') ||
      lower.includes('kachcha chittha') ||
      lower.includes('कच्चा चिट्ठा');

    if (queryRequestsStanding && !isStandingMode) {
      setIsStandingMode(true);
      setSelectedCategory('standing');
    }

    if (
      lower.includes('face scanner') ||
      lower.includes('scan face') ||
      lower.includes('hand scan') ||
      lower.includes('aaj tak') ||
      lower.includes('biometric') ||
      lower.includes('universal live camera') ||
      lower.includes('चेहरा स्कैन') ||
      lower.includes('हाथ स्कैन')
    ) {
      setInputQuery('');
      setLiveVisionMode('face');
      setIsLiveVisionOpen(true);
      soundEffects.playJarvisWake();
      return;
    }

    if (
      lower.includes('sheru bhai voice') ||
      lower.includes('set sheru') ||
      lower.includes('sheru voice') ||
      lower.includes('person ai voice') ||
      lower.includes('person ai assistant voice')
    ) {
      setInputQuery('');
      handleActivateSheruBhaiVoice();
      return;
    }

    if (
      lower.includes('voice settings') ||
      lower.includes('set voice') ||
      lower.includes('voice set') ||
      lower.includes('change voice') ||
      lower.includes('ai assistant voice')
    ) {
      setInputQuery('');
      setIsVoiceSettingsOpen(true);
      soundEffects.playJarvisWake();
      return;
    }

    if (lower.includes('clock') || lower.includes('time') || lower.includes('samay') || lower.includes('kitne baje')) {
      setIsClockModalOpen(true);
      soundEffects.playSuccessChime();
      return;
    }
    if (lower.includes('call') || lower.includes('phone') || lower.includes('dial') || lower.includes('phone lagao')) {
      setIsDialerModalOpen(true);
      soundEffects.playSuccessChime();
      return;
    }
    if (lower.includes('mrbeast') || (lower.includes('beast') && lower.includes('subscribe'))) {
      setIsMrBeastModalOpen(true);
      soundEffects.playSuccessChime();
      return;
    }
    if (
      lower.includes('build a apk') ||
      lower.includes('build apk') ||
      lower.includes('make apk') ||
      lower.includes('generate apk') ||
      lower.includes('create apk') ||
      lower.includes('apk banao') ||
      lower.includes('download apk') ||
      lower === 'apk'
    ) {
      setInputQuery('');
      setIsApkModalOpen(true);
      soundEffects.playSuccessChime();
      const apkCard: QAItem = {
        id: `qa-apk-${Date.now()}`,
        questionText: trimmedQuery,
        category: 'utilities',
        engineUsed: engine,
        modelModeLabel: `${activeModelPreset.badgeEmoji} ${activeModelPreset.label}`,
        timestamp: new Date().toISOString(),
        status: 'answered',
        response: {
          speechText: 'Master Ajay Boss! Android APK Builder Studio open ho gaya hai. Aap 1-click me bundle rebuild karke Android project ZIP ya standalone APK package download kar sakte hain!',
          title: '📱 Android APK Builder Studio Opened (com.aijayboss.mrjarvisbeast)',
          modelModeLabel: `${activeModelPreset.badgeEmoji} ${activeModelPreset.label}`,
          subjectCategory: 'Android APK Build',
          steps: [
            {
              stepNumber: 1,
              title: '1-Click Bundle Rebuild & Sync',
              detail: 'Compile the production bundle and sync directly into /android/app/src/main/assets/public inside the APK Studio modal.',
            },
            {
              stepNumber: 2,
              title: 'Download Android Project ZIP / Standalone Package',
              detail: 'Download the full Android Studio / Capacitor project ZIP (with synced web assets + GitHub Actions workflow) or the single-file standalone HTML package.',
            },
            {
              stepNumber: 3,
              title: 'Compile Binary .apk & Play Console .aab',
              detail: 'Run ./scripts/build-apk-and-aab.sh locally with JDK 21 + Android SDK or push to GitHub to run .github/workflows/build-apk.yml.',
            },
          ],
          finalAnswer: 'APK & Play Console AAB Studio is open. Download the Android Project ZIP or install directly as an Android PWA app.',
          beastTip: 'You can also install directly from Chrome Android menu > Install App for instant fullscreen WebAPK execution!',
          suggestedPrompts: ['Open Live Vision', 'Solve 2x + 5 = 15', 'Best places in Rishikesh'],
        },
      };
      setMessages((prev) => [...prev, apkCard]);
      if (!isMuted) {
        handlePlaySpeech(apkCard.response!.speechText, apkCard.id);
      }
      return;
    }

    if (lower.includes('torch') || lower.includes('flashlight')) {
      executePhoneAction({ actionType: 'flashlight', label: 'Flashlight' });
    }

    const currentId = `qa-${Date.now()}`;
    const currentModeLabel = `${activeModelPreset.badgeEmoji} ${activeModelPreset.label}`;

    // Create unified QA Item with Question on TOP, Answer thinking at BOTTOM
    const newQA: QAItem = {
      id: currentId,
      questionText: trimmedQuery || (media ? `Inspect attached ${media.type}: ${media.name}` : ''),
      questionMedia: media || undefined,
      category: category,
      engineUsed: engine,
      modelModeLabel: currentModeLabel,
      standingMode: queryRequestsStanding,
      timestamp: new Date().toISOString(),
      status: 'thinking',
    };

    setMessages((prev) => [...prev, newQA]);
    setInputQuery('');
    setAttachedMedia(null);
    setIsProcessing(true);
    handleStopSpeech();

    try {
      // Build multi-turn conversation history from answered messages
      const historyPayload: Array<{ role: 'user' | 'model'; text: string }> = [];
      messages
        .filter((m) => m.status === 'answered' && m.response && m.id !== 'welcome-1')
        .slice(-5)
        .forEach((m) => {
          historyPayload.push({ role: 'user', text: m.questionText });
          historyPayload.push({
            role: 'model',
            text: `${m.response!.title}\n${m.response!.finalAnswer}`,
          });
        });

      // Request geolocation briefly when Google Maps grounding is relevant
      let userLocation: { latitude: number; longitude: number } | undefined;
      const needsLocation =
        groundingMode === 'maps' ||
        /\b(near me|nearby|directions|route|distance|paas me|kahan hai)\b/i.test(lower);
      if (needsLocation && typeof navigator !== 'undefined' && navigator.geolocation) {
        userLocation = await new Promise((resolve) => {
          const timer = setTimeout(() => resolve(undefined), 1800);
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              clearTimeout(timer);
              resolve({
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
              });
            },
            () => {
              clearTimeout(timer);
              resolve(undefined);
            },
            { timeout: 1500, maximumAge: 60000 }
          );
        });
      }

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: trimmedQuery,
          engine: engine,
          category: category,
          precision: precisionMode,
          standingMode: queryRequestsStanding,
          groundingMode,
          userLocation,
          history: historyPayload,
          mediaData: media ? { base64: media.base64, mimeType: media.mimeType, fileName: media.name } : undefined,
          gemModifier: activeGem.systemPromptModifier,
          modelModeLabel: currentModeLabel,
        }),
      });

      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload?.error || `Server returned ${res.status}`);
      }
      const data: AssistantResponse = payload;

      setMessages((prev) =>
        prev.map((item) =>
          item.id === currentId
            ? {
                ...item,
                status: 'answered',
                response: data,
              }
            : item
        )
      );

      soundEffects.playSuccessChime();

      // Confetti celebration if maths equation or exam solved
      if (category === 'maths' || lower.includes('solve') || lower.includes('exam')) {
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#eab308', '#06b6d4', '#3b82f6'],
          });
        } catch (e) {}
      }

      // Check for automated phone action execution (JARVIS Protocol)
      if (data.phoneAction && data.phoneAction.actionType !== 'none' && data.phoneAction.autoExecute) {
        executePhoneAction(data.phoneAction, currentId);
      }

      // ========================================================
      // MANDATORY Answer Voice Narration (TTS):
      // Speak out the Answer out loud in a clear, natural, sweet,
      // high-quality YouTube-style AI voice so Aijay Boss hears it instantly!
      // ========================================================
      const fullVoiceScript = `${data.speechText}. Final Answer: ${data.finalAnswer}`;
      if (!isMuted) {
        handlePlaySpeech(fullVoiceScript, currentId);
      }
    } catch (err: any) {
      console.error('Failed to query Jarvis Beast:', err);
      setMessages((prev) =>
        prev.map((item) =>
          item.id === currentId
            ? {
                ...item,
                status: 'error',
                error: err.message || 'Failed to reach live AI backend',
              }
            : item
        )
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearChat = () => {
    soundEffects.playBeep();
    handleStopSpeech();
    setMessages([]);
  };

  const hasActiveSubView = isMeeshoActive || isAppBuilderOpen || isPromptStudioOpen;

  const handleHeaderBack = () => {
    if (isMeeshoActive || isAppBuilderOpen || isPromptStudioOpen) {
      setIsMeeshoActive(false);
      setIsAppBuilderOpen(false);
      setIsPromptStudioOpen(false);
      return;
    }
    setIsGemsDrawerOpen(true);
  };

  return (
    <div className="h-[100dvh] flex flex-col bg-[#07090e] text-slate-100 font-sans selection:bg-amber-500/30 selection:text-amber-200 overflow-hidden animate-in fade-in duration-300">
      
      {/* Poe-Style Clean Top Header */}
      <Header
        selectedModelId={selectedModelId}
        onSelectModel={handleSelectModelPreset}
        onBack={handleHeaderBack}
        hasActiveSubView={hasActiveSubView}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onClearChat={handleClearChat}
        messageCount={messages.length}
        onOpenGemsMenu={() => setIsGemsDrawerOpen(true)}
        onActivateSheruVoice={handleActivateSheruBhaiVoice}
        isListening={isListening}
        isSpeaking={isSpeaking}
      />

      {/* Standing Mode Active Banner (only when toggled on) */}
      {isStandingMode && (
        <div className="px-3 py-1.5 shrink-0 bg-amber-950/50 border-b border-[#ffd700]/40 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Radar className="w-4 h-4 text-[#ffd700] shrink-0" />
            <span className="text-xs font-chakra font-bold text-[#ffd700] truncate">
              Standing Mode Active · Deep-Scan
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleToggleStandingMode(false)}
            className="px-2.5 py-0.5 rounded-lg bg-[#07090e] border border-[#ffd700]/50 text-[11px] font-chakra font-bold text-[#ffd700] shrink-0 cursor-pointer"
          >
            Exit
          </button>
        </div>
      )}

      {/* Clean Poe-Style Scrollable Bot Chat Feed */}
      <div 
        ref={chatScrollRef}
        className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 space-y-4 min-h-0 overscroll-contain"
      >
        {isMeeshoActive ? (
          <MeeshoMarketplaceHub
            onOpenPhotoToVideo={() => setIsPhotoToVideoOpen(true)}
            onOpenLiveVision={() => setIsLiveVisionOpen(true)}
            onOpenDialer={() => setIsDialerModalOpen(true)}
            onOpenMrBeast={() => setIsMrBeastModalOpen(true)}
            onOpenClock={() => setIsClockModalOpen(true)}
            onShareWhatsApp={(caption) => handleShareWhatsApp(caption)}
            onToggleTorch={() => executePhoneAction({ actionType: 'flashlight', label: 'Flashlight' })}
            onCheckBattery={() => executePhoneAction({ actionType: 'battery', label: 'Battery Check' })}
            onTriggerVoice={handleToggleMic}
            onOpenApkModal={() => setIsApkModalOpen(true)}
            onSelectEngine={(eng) => setCurrentEngine(eng)}
            currentEngine={currentEngine}
            isTorchOn={isTorchOn}
          />
        ) : (
          <>
            {/* Focused Poe-Style Bot Header Card with Sound Button */}
            <PoeBotCard
              activeModelPreset={activeModelPreset}
              groundingMode={groundingMode}
              isStandingMode={isStandingMode}
              isThemeAudioPlaying={isThemeAudioPlaying}
              hasMessages={messages.length > 0}
              onQuickPrompt={(prompt) => {
                processQuery(prompt, null, currentEngine, selectedCategory);
              }}
              onOpenVoiceSettings={() => setIsVoiceSettingsOpen(true)}
              onOpenLiveVision={() => setIsLiveVisionOpen(true)}
              onOpenApkModal={() => setIsApkModalOpen(true)}
            />

            {/* Optional Tools (closed by default; opened cleanly from '+' menu) */}
            {isAppBuilderOpen && (
              <div className="max-w-3xl mx-auto space-y-2">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsAppBuilderOpen(false)}
                    className="min-h-[36px] px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Close App Builder</span>
                  </button>
                </div>
                <AiAppBuilderModule
                  verifiedHumanId={verifiedHumanId}
                  onSpeakStatus={(text) => {
                    if (!isMuted) {
                      speechManager.speak(text, {
                        onStart: () => setIsSpeaking(true),
                        onEnd: () => setIsSpeaking(false),
                        onError: () => setIsSpeaking(false),
                      });
                    }
                  }}
                />
              </div>
            )}

            {isPromptStudioOpen && (
              <div className="max-w-3xl mx-auto space-y-2">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsPromptStudioOpen(false)}
                    className="min-h-[36px] px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Close Prompt Studio</span>
                  </button>
                </div>
                <MasterPromptStudio
                  isProcessingMain={isProcessing}
                  onRunInMainChat={(promptText) => {
                    processQuery(promptText, null, currentEngine, selectedCategory);
                  }}
                />
              </div>
            )}

            {/* Chat Messages Stream */}
            {messages.map((item) => (
              <MessageCard
                key={item.id}
                item={item}
                isSpeakingThis={speakingItemId === item.id && isSpeaking}
                onPlaySpeech={handlePlaySpeech}
                onStopSpeech={handleStopSpeech}
                onFollowUpClick={(prompt) => {
                  processQuery(prompt, null, currentEngine, selectedCategory);
                }}
                onShareWhatsApp={handleShareWhatsApp}
                onExecutePhoneAction={executePhoneAction}
              />
            ))}
          </>
        )}
      </div>

      {/* Compact Single-Row Bottom Chat Bar with '+' Icon */}
      <footer className="shrink-0 bg-[#07090e]/98 border-t border-slate-800/90 px-3 py-2 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto space-y-2">
          {voiceBannerNotice && (
            <div className="px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-400/40 text-amber-200 text-xs text-center">
              {voiceBannerNotice}
            </div>
          )}

          {(isListening || isSpeaking || isProcessing) && (
            <VoiceAssistantHUD
              isListening={isListening}
              isSpeaking={isSpeaking}
              isProcessing={isProcessing}
              onToggleMic={handleToggleMic}
              onStopSpeech={handleStopSpeech}
            />
          )}

          <InputBar
            inputQuery={inputQuery}
            onChangeQuery={(val) => setInputQuery(val)}
            onSubmit={() => {
              processQuery(inputQuery, attachedMedia, currentEngine, selectedCategory);
            }}
            isProcessing={isProcessing}
            isListening={isListening}
            isSpeaking={isSpeaking}
            onToggleMic={handleToggleMic}
            onStopSpeech={handleStopSpeech}
            attachedMedia={attachedMedia}
            onRemoveMedia={() => setAttachedMedia(null)}
            onOpenActionMenu={() => setIsActionMenuOpen(true)}
            isStandingMode={isStandingMode}
          />
        </div>
      </footer>

      {/* Google Gemini-Inspired Home Screen Overlay */}
      <GeminiHomeOverlay
        isOpen={isHomeOverlayOpen}
        onClose={() => setIsHomeOverlayOpen(false)}
        verifiedHumanId={verifiedHumanId}
        isListening={isListening}
        isSpeaking={isSpeaking}
        isTorchOn={isTorchOn}
        onToggleMic={handleToggleMic}
        onStopSpeech={handleStopSpeech}
        onQuickPrompt={(promptText) => {
          processQuery(promptText, null, currentEngine, selectedCategory);
        }}
        onOpenLiveVision={() => setIsLiveVisionOpen(true)}
        onOpenAppBuilder={() => {
          setIsMeeshoActive(false);
          setIsAppBuilderOpen(true);
          chatScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenPromptStudio={() => {
          setIsMeeshoActive(false);
          setIsPromptStudioOpen(true);
          chatScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onToggleTorch={() => executePhoneAction({ actionType: 'flashlight', label: 'Flashlight' })}
        onOpenDialer={() => setIsDialerModalOpen(true)}
        isStandingMode={isStandingMode}
        onToggleStandingMode={() => handleToggleStandingMode()}
      />

      {/* Gemini/WhatsApp '+' Action Tile Menu Sheet */}
      <ActionTileMenu
        isOpen={isActionMenuOpen}
        onClose={() => setIsActionMenuOpen(false)}
        onAttachMedia={(media) => {
          setAttachedMedia(media);
          soundEffects.playSuccessChime();
        }}
        onOpenLiveVision={() => setIsLiveVisionOpen(true)}
        onOpenDialer={() => setIsDialerModalOpen(true)}
        onOpenMrBeast={() => setIsMrBeastModalOpen(true)}
        onOpenClock={() => setIsClockModalOpen(true)}
        onShareWhatsApp={() => handleShareWhatsApp()}
        onToggleTorch={() => executePhoneAction({ actionType: 'flashlight', label: 'Toggle Torch' })}
        onCheckBattery={() => executePhoneAction({ actionType: 'battery', label: 'Battery Check' })}
        isTorchOn={isTorchOn}
        currentEngine={currentEngine}
        onSelectEngine={(eng) => setCurrentEngine(eng)}
        onOpenFeaturesMatrix={() => setIsFeaturesMatrixOpen(true)}
        onOpenApkModal={() => setIsApkModalOpen(true)}
        onOpenPhotoToVideo={() => setIsPhotoToVideoOpen(true)}
        onOpenMeesho={() => setIsMeeshoActive(true)}
        onOpenPromptStudio={() => {
          setIsMeeshoActive(false);
          setIsPromptStudioOpen(true);
          chatScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAppBuilder={() => {
          setIsMeeshoActive(false);
          setIsAppBuilderOpen(true);
          chatScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        currentPrecision={precisionMode}
        onSelectPrecision={(prec) => setPrecisionMode(prec)}
        groundingMode={groundingMode}
        onChangeGroundingMode={(mode) => setGroundingMode(mode)}
        isStandingMode={isStandingMode}
        onToggleStandingMode={() => handleToggleStandingMode()}
        onOpenVoiceSettings={() => setIsVoiceSettingsOpen(true)}
        onOpenHomeOverlay={() => setIsHomeOverlayOpen(true)}
      />

      {/* Photo-to-Video AI Engine Modal */}
      <PhotoToVideoModal
        isOpen={isPhotoToVideoOpen}
        onClose={() => setIsPhotoToVideoOpen(false)}
        onShareWhatsApp={(caption) => handleShareWhatsApp(caption)}
      />

      {/* World-No. 1 Real-Time Multimodal Voice, Live Vision & Universal Face Scanner Modal */}
      <LiveVisionModal
        isOpen={isLiveVisionOpen}
        onClose={() => {
          setIsLiveVisionOpen(false);
          setLiveVisionMode('vision');
        }}
        onQuestionSolved={(qa) => {
          setMessages((prev) => [...prev, qa]);
        }}
        currentEngine={currentEngine}
        initialMode={liveVisionMode}
        verifiedHumanId={verifiedHumanId}
      />

      {/* 19 World-Class Features Matrix Modal */}
      <FeaturesMatrixModal
        isOpen={isFeaturesMatrixOpen}
        onClose={() => setIsFeaturesMatrixOpen(false)}
      />

      {/* Native Android APK & Web App Package Modal */}
      <AndroidApkModal
        isOpen={isApkModalOpen}
        onClose={() => setIsApkModalOpen(false)}
      />

      {/* Additional Modals */}
      <ImageScannerModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onSubmitImage={(imgBase64, promptText) => {
          const media: MediaAttachment = {
            base64: imgBase64,
            mimeType: 'image/jpeg',
            name: 'Scanned Homework.jpg',
            type: 'image',
          };
          setAttachedMedia(media);
          processQuery(promptText, media, currentEngine, 'vision');
        }}
      />

      <BeastClockModal
        isOpen={isClockModalOpen}
        onClose={() => setIsClockModalOpen(false)}
      />

      <DialerModal
        isOpen={isDialerModalOpen}
        onClose={() => setIsDialerModalOpen(false)}
      />

      <MrBeastSubModal
        isOpen={isMrBeastModalOpen}
        onClose={() => setIsMrBeastModalOpen(false)}
      />

      {/* AI Assistant Voice & Signature Audio Studio Modal */}
      <VoiceSettingsModal
        isOpen={isVoiceSettingsOpen}
        onClose={() => setIsVoiceSettingsOpen(false)}
        isMuted={isMuted}
        onSetMuted={handleSetMuted}
        onSpeakSample={(text) => handlePlaySpeech(text, 'voice-sample')}
        onPresetApplied={(presetId) => {
          const targetGemId =
            presetId === 'sheru-bold'
              ? 'sharu-bhai-assistant'
              : presetId === 'myra-sweet'
              ? 'myra-voice-engine'
              : presetId === 'jarvis-royal'
              ? 'beast-master'
              : null;
          if (targetGemId) {
            const matched = GEMS_MODES.find((g) => g.id === targetGemId);
            if (matched) setActiveGem(matched);
          }
        }}
      />

      {/* 3-Line Hamburger Sidebar / Gems Menu */}
      <GemsDrawer
        isOpen={isGemsDrawerOpen}
        onClose={() => setIsGemsDrawerOpen(false)}
        activeGemId={activeGem.id}
        onSelectGem={(gem) => {
          setActiveGem(gem);
          if (gem.id === 'standing-mode-deep-scan') {
            handleToggleStandingMode(true);
          } else if (isStandingMode) {
            setIsStandingMode(false);
          }
          setIsGemsDrawerOpen(false);
        }}
        currentEngine={currentEngine}
        onSelectEngine={(eng) => setCurrentEngine(eng)}
        onOpenApkModal={() => setIsApkModalOpen(true)}
        onOpenDefaultAssistantBanner={() => {
          chatScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onToggleTorch={() => executePhoneAction({ actionType: 'flashlight', label: 'Flashlight' })}
        isTorchOn={isTorchOn}
        onBatteryCheck={() => executePhoneAction({ actionType: 'battery', label: 'Battery Check' })}
        onOpenVoiceSettings={() => setIsVoiceSettingsOpen(true)}
        onLockGate={onLockGate}
      />
    </div>
  );
}
