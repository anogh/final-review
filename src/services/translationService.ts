import axios from 'axios';
import { GoogleAuth } from 'google-auth-library';

export interface TranslationResult {
  translatedText: string;
  detectedLanguage?: string;
}

export class TranslationService {
  private readonly auth: GoogleAuth;
  private readonly baseUrl = 'https://translation.googleapis.com/language/translate/v2';
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    // Initialize Google Auth with service account credentials
    this.auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-translation'],
      // Credentials will be loaded from environment variables or service account JSON
      credentials: this.getCredentialsFromEnv()
    });
    
    console.log('🔐 Google Cloud Translation service initialized');
  }

  private getCredentialsFromEnv() {
    // Try to get credentials from environment variable (JSON string)
    const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
    
    if (credentialsJson) {
      try {
        return JSON.parse(credentialsJson);
      } catch (error) {
        console.error('❌ Failed to parse GOOGLE_APPLICATION_CREDENTIALS_JSON:', error);
      }
    }
    
    // Fallback: construct from individual environment variables
    const serviceAccount = {
      type: process.env.GOOGLE_SERVICE_ACCOUNT_TYPE || 'service_account',
      project_id: process.env.GOOGLE_PROJECT_ID,
      private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      client_id: process.env.GOOGLE_CLIENT_ID,
      auth_uri: process.env.GOOGLE_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
      token_uri: process.env.GOOGLE_TOKEN_URI || 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_X509_CERT_URL || 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL,
      universe_domain: process.env.GOOGLE_UNIVERSE_DOMAIN || 'googleapis.com'
    };

    // Check if all required fields are present
    if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
      console.warn('⚠️  Google Cloud service account credentials not found.');
      console.warn('   Set GOOGLE_APPLICATION_CREDENTIALS_JSON or individual environment variables.');
      return null;
    }

    return serviceAccount;
  }

  private async getAccessToken(): Promise<string> {
    // Check if we have a valid token
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const client = await this.auth.getClient();
      const tokenResponse = await client.getAccessToken();
      
      if (!tokenResponse.token) {
        throw new Error('Failed to get access token');
      }

      this.accessToken = tokenResponse.token;
      // Set expiry to 50 minutes from now (tokens usually last 1 hour)
      this.tokenExpiry = Date.now() + (50 * 60 * 1000);
      
      console.log('✅ Google Cloud access token refreshed');
      
      if (!this.accessToken) {
        throw new Error('Access token is null after refresh');
      }
      
      return this.accessToken;
    } catch (error) {
      console.error('❌ Failed to get Google Cloud access token:', error);
      throw new Error('Authentication failed with Google Cloud');
    }
  }

  /**
   * Translate text using Google Translate API v2 with service account authentication
   * @param text - Text to translate
   * @param targetLanguage - Target language code (e.g., 'zh-CN', 'en', 'es')
   * @param sourceLanguage - Source language code (optional, defaults to 'auto')
   */
  async translateText(
    text: string, 
    targetLanguage: string = 'zh-CN', 
    sourceLanguage: string = 'auto'
  ): Promise<TranslationResult> {
    
    if (!text || text.trim().length === 0) {
      throw new Error('Text to translate cannot be empty');
    }

    try {
      console.log(`🌐 Translating: "${text}" to ${targetLanguage}`);
      
      // Get access token
      const accessToken = await this.getAccessToken();
      
      const response = await axios.post(
        this.baseUrl,
        null,
        {
          params: {
            q: text,
            target: targetLanguage,
            source: sourceLanguage === 'auto' ? undefined : sourceLanguage,
            format: 'text'
          },
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000 // 10 second timeout
        }
      );

      if (!response.data || !response.data.data || !response.data.data.translations) {
        throw new Error('Invalid response from Google Translate API');
      }

      const translation = response.data.data.translations[0];
      
      const result: TranslationResult = {
        translatedText: translation.translatedText,
        detectedLanguage: translation.detectedSourceLanguage
      };

      console.log(`✅ Translation successful: "${result.translatedText}"`);
      return result;

    } catch (error) {
      console.error('❌ Translation failed:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          // Token might be expired, clear it
          this.accessToken = null;
          this.tokenExpiry = 0;
          throw new Error('Google Cloud authentication failed. Check service account credentials.');
        } else if (error.response?.status === 403) {
          throw new Error('Google Translate API access denied. Check permissions and billing.');
        } else if (error.response?.status === 400) {
          throw new Error('Invalid translation request. Check language codes.');
        } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
          throw new Error('Network error: Cannot reach Google Translate API. Check your internet connection.');
        }
      }
      
      throw new Error(`Translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get list of supported languages
   */
  async getSupportedLanguages(): Promise<any[]> {
    try {
      const accessToken = await this.getAccessToken();
      
      const response = await axios.get(
        `${this.baseUrl}/languages`,
        {
          params: {
            target: 'en' // Get language names in English
          },
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.data.languages;
    } catch (error) {
      console.error('Failed to get supported languages:', error);
      throw error;
    }
  }

  /**
   * Detect language of given text
   */
  async detectLanguage(text: string): Promise<string> {
    try {
      const accessToken = await this.getAccessToken();
      
      const response = await axios.post(
        `${this.baseUrl}/detect`,
        null,
        {
          params: {
            q: text
          },
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.data.detections[0][0].language;
    } catch (error) {
      console.error('Language detection failed:', error);
      throw error;
    }
  }

  /**
   * Automatically translate between Chinese and English based on detected language
   * If Chinese is detected, translate to English
   * If English is detected, translate to Chinese
   * @param text - Text to translate
   */
  async autoTranslateChineseEnglish(text: string): Promise<TranslationResult> {
    if (!text || text.trim().length === 0) {
      throw new Error('Text to translate cannot be empty');
    }

    try {
      // First detect the language
      const detectedLanguage = await this.detectLanguage(text);
      console.log(`🔍 Detected language: ${detectedLanguage}`);

      let targetLanguage: string;
      
      // Check if detected language is Chinese (any variant)
      if (detectedLanguage.startsWith('zh')) {
        // Chinese detected, translate to English
        targetLanguage = 'en';
        console.log('🇨🇳 → 🇺🇸 Chinese detected, translating to English');
      } else if (detectedLanguage === 'en') {
        // English detected, translate to Chinese (Simplified)
        targetLanguage = 'zh-CN';
        console.log('🇺🇸 → 🇨🇳 English detected, translating to Chinese');
      } else {
        // For other languages, default to English
        targetLanguage = 'en';
        console.log(`🌐 → 🇺🇸 Other language (${detectedLanguage}) detected, translating to English`);
      }

      // Perform the translation
      const result = await this.translateText(text, targetLanguage, 'auto');
      
      // Add the detected language to the result
      result.detectedLanguage = detectedLanguage;
      
      return result;

    } catch (error) {
      console.error('❌ Auto translation failed:', error);
      throw error;
    }
  }

  /**
   * Check if text contains Chinese characters
   */
  private containsChinese(text: string): boolean {
    // Unicode ranges for Chinese characters
    const chineseRegex = /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/;
    return chineseRegex.test(text);
  }

  /**
   * Simple language detection based on character patterns (fallback method)
   */
  private simpleLanguageDetection(text: string): 'zh' | 'en' | 'unknown' {
    if (this.containsChinese(text)) {
      return 'zh';
    }
    
    // Check if text is primarily English (basic ASCII characters)
    const englishRegex = /^[a-zA-Z0-9\s.,!?;:'"()\-]+$/;
    if (englishRegex.test(text)) {
      return 'en';
    }
    
    return 'unknown';
  }
}