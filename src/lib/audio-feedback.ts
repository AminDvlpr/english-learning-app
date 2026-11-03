"use client"

class AudioFeedbackService {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;

  private initContext() {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    // Resume context if it was suspended (autoplay policy)
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
  }

  public isMuted() {
    return this.muted;
  }

  public toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  // A helper to play an oscillator tone with an envelope
  private playTone(frequency: number, type: OscillatorType, duration: number, gainValue: number = 0.5) {
    if (this.muted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    // Envelope
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(gainValue, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  }

  // Warm harmonic chord for first-try mastery
  public playSuccessChime() {
    if (this.muted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    // C Major chord (C5, E5, G5)
    const frequencies = [523.25, 659.25, 783.99];
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        this.playTone(freq, 'sine', 1.2, 0.3);
      }, index * 100); // Staggered arpeggio effect
    });
  }

  // Gentle chime for post-remediation completion
  public playAssistedSuccessChime() {
    if (this.muted) return;
    // Just the root and fifth for a simpler, gentle chime
    this.playTone(523.25, 'sine', 0.8, 0.2); // C5
    setTimeout(() => {
      this.playTone(783.99, 'sine', 1.0, 0.2); // G5
    }, 150);
  }

  // Soft, non-punitive wooden/marimba nudge
  public playRemediationTone() {
    if (this.muted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    // A slightly flat wooden thunk. Two close low frequencies to create a thud.
    this.playTone(300, 'triangle', 0.3, 0.4);
    setTimeout(() => {
      this.playTone(250, 'triangle', 0.4, 0.3);
    }, 80);
  }

  // Subtle tick for countdown
  public playTick() {
    if (this.muted) return;
    this.playTone(1000, 'square', 0.05, 0.1);
  }

  // TTS playback
  public speakEnglishPhrase(text: string, rate: number = 1.0) {
    if (this.muted) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = rate;

    // Optional: pick a specific voice if desired, otherwise default browser voice is used

    window.speechSynthesis.speak(utterance);
  }
}

export const audioFeedback = new AudioFeedbackService();
