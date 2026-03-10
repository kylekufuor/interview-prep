'use client';

// Web Speech API wrapper for voice interviews

/* eslint-disable @typescript-eslint/no-explicit-any */

export class SpeechManager {
  private recognition: any = null;
  private synthesis: SpeechSynthesis | null = null;
  private isListening = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionAPI =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognitionAPI) {
        this.recognition = new SpeechRecognitionAPI();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
      }
      this.synthesis = window.speechSynthesis;
    }
  }

  get isSupported(): boolean {
    return this.recognition !== null && this.synthesis !== null;
  }

  startListening(callbacks: {
    onResult: (transcript: string, isFinal: boolean) => void;
    onError: (error: string) => void;
    onEnd: () => void;
  }): void {
    if (!this.recognition) return;

    this.recognition.onresult = (event: any) => {
      let transcript = '';
      let isFinal = false;
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          isFinal = true;
        }
      }
      callbacks.onResult(transcript, isFinal);
    };

    this.recognition.onerror = (event: any) => {
      callbacks.onError(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      callbacks.onEnd();
    };

    this.recognition.start();
    this.isListening = true;
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  speak(text: string, onEnd?: () => void): void {
    if (!this.synthesis) return;

    // Cancel any ongoing speech
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Pick a natural-sounding voice if available
    const voices = this.synthesis.getVoices();
    const preferred = voices.find(
      (v) =>
        v.lang.startsWith('en') &&
        (v.name.includes('Google') ||
          v.name.includes('Samantha') ||
          v.name.includes('Daniel'))
    );
    if (preferred) utterance.voice = preferred;

    if (onEnd) {
      utterance.onend = onEnd;
    }

    this.synthesis.speak(utterance);
  }

  stopSpeaking(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  cleanup(): void {
    this.stopListening();
    this.stopSpeaking();
  }
}

// Extend Window for TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
