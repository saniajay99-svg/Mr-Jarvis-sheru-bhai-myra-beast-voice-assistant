export type EngineType = 'auto' | 'gemini' | 'chatgpt' | 'claude';
export type PrecisionType = 'concise' | 'balanced' | 'rigorous';
export type GroundingMode = 'auto' | 'search' | 'maps';

export type AiModelPresetId =
  | 'jarvis-beast-core'
  | 'myra-beast-assistant'
  | 'flash-fast-mode'
  | 'sheru-bhai-voice';

export interface AiModelPreset {
  id: AiModelPresetId;
  label: string;
  shortLabel: string;
  badgeEmoji: string;
  engine: EngineType;
  precision: PrecisionType;
  gemId: string;
  backendModel: string;
  description: string;
}

export const AI_MODEL_PRESETS: AiModelPreset[] = [
  {
    id: 'jarvis-beast-core',
    label: 'Jarvis Beast Core',
    shortLabel: 'Jarvis Core',
    badgeEmoji: '⚡',
    engine: 'auto',
    precision: 'balanced',
    gemId: 'beast-master',
    backendModel: 'gemini-4-hydrogen',
    description: 'Flagship balanced intelligence for coding, maths & general tasks',
  },
  {
    id: 'myra-beast-assistant',
    label: 'Myra Beast Assistant',
    shortLabel: 'Myra Beast',
    badgeEmoji: '✨',
    engine: 'chatgpt',
    precision: 'balanced',
    gemId: 'myra-voice-engine',
    backendModel: 'gemini-4-hydrogen',
    description: 'Warm, expressive personal secretary with sweet Hinglish narration',
  },
  {
    id: 'flash-fast-mode',
    label: 'Flash Fast Mode',
    shortLabel: 'Flash Fast',
    badgeEmoji: '🚀',
    engine: 'gemini',
    precision: 'concise',
    gemId: 'code-architect',
    backendModel: 'gemini-3.1-flash-lite',
    description: 'Ultra-fast concise answers powered by Gemini Flash Lite',
  },
  {
    id: 'sheru-bhai-voice',
    label: 'Sheru Bhai Voice Mode',
    shortLabel: 'Sheru Bhai',
    badgeEmoji: '🦁',
    engine: 'auto',
    precision: 'balanced',
    gemId: 'sharu-bhai-assistant',
    backendModel: 'gemini-4-hydrogen',
    description: 'Bold Sheru Bhai persona with signature Hindi/Hinglish voice preset',
  },
];

export interface GroundingLink {
  title: string;
  uri: string;
  sourceType: 'search' | 'maps';
  snippets?: string[];
}

export type CategoryType = 
  | 'all'
  | 'standing'
  | 'maths'
  | 'english_grammar'
  | 'hindi_grammar'
  | 'vision'
  | 'jokes'
  | 'utilities'
  | 'phone_actions';

export interface StepItem {
  stepNumber: number;
  title: string;
  detail: string;
  formulaOrCode?: string;
}

export interface PhoneAction {
  actionType: 'call' | 'whatsapp' | 'flashlight' | 'battery' | 'timer' | 'maps' | 'youtube' | 'copy' | 'vibrate' | 'clock' | 'camera' | 'google' | 'calculator' | 'open_app' | 'none';
  label: string;
  target?: string;
  autoExecute?: boolean;
}

export interface AssistantResponse {
  speechText: string;
  title: string;
  subjectCategory: string;
  steps: StepItem[];
  finalAnswer: string;
  beastTip: string;
  suggestedPrompts: string[];
  engineUsed?: string;
  modelName?: string;
  modelModeLabel?: string;
  groundingType?: 'search' | 'maps';
  groundingLinks?: GroundingLink[];
  standingMode?: boolean;
  timestamp?: string;
  phoneAction?: PhoneAction;
}

export interface MediaAttachment {
  base64: string;
  mimeType: string;
  name: string;
  type: 'image' | 'video' | 'pdf';
  sizeFormatted?: string;
}

export interface QAItem {
  id: string;
  questionText: string;
  questionMedia?: MediaAttachment;
  category?: CategoryType;
  engineUsed?: EngineType;
  modelModeLabel?: string;
  standingMode?: boolean;
  timestamp: string;
  status: 'thinking' | 'answered' | 'error';
  response?: AssistantResponse;
  error?: string;
  isAudioPlaying?: boolean;
  actionExecuted?: boolean;
}

// Backwards-compatibility
export type ChatMessage = QAItem;
