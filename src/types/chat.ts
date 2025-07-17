// Chat message types
export interface ChatMessage {
  type: 'text' | 'file';
  text?: string;
  fileName?: string;
  fileData?: string;
  fileType?: string;
}

export interface TranslatedMessage {
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
}

export interface MessageWithMeta extends ChatMessage {
  id: string;
  timestamp: string;
  userId: string;
  userIdentity: 'User1' | 'User2';
  translation?: TranslatedMessage;
}

export interface ConnectedUser {
  id: string;
  authenticated: boolean;
  userIdentity: 'User1' | 'User2';
  connectedAt: string;
}

export interface AuthResult {
  success: boolean;
  userIdentity?: 'User1' | 'User2';
  message: string;
}

// Socket event types
export interface ServerToClientEvents {
  auth_success: (message: string) => void;
  auth_error: (message: string) => void;
  message_received: (message: MessageWithMeta) => void;
  user_count: (count: number) => void;
  error: (message: string) => void;
}

export interface ClientToServerEvents {
  authenticate: (password: string) => void;
  chat_message: (message: ChatMessage) => void;
  file_upload: (data: { fileName: string; fileData: string; fileType: string }) => void;
}

// Language options for translation
export interface LanguageOption {
  code: string;
  name: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'zh-CN', name: '中文 (简体)', flag: '🇨🇳' },
  { code: 'zh-TW', name: '中文 (繁體)', flag: '🇹🇼' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'th', name: 'ไทย', flag: '🇹🇭' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' }
];