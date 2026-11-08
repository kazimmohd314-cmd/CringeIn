export type Mode = 'to-linkedin' | 'to-real';

export interface TranslateRequest {
  text: string;
  mode: Mode;
}

export interface TranslateResponse {
  result: string;
  source: 'gemini' | 'groq' | 'offline';
  error?: string;
}
