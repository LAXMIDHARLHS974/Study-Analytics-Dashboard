// Web Audio API sound generator for Pomodoro bell, task complete chimes, and ambient sounds

class SoundManager {
  constructor() {
    this.ctx = null;
    this.ambientSource = null;
    this.ambientGain = null;
    this.currentAmbient = 'none';
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play a gentle two-tone bell chime for timer complete
  playBell() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Frequencies for a soothing Tibetan bell / chime (E5 and B5 harmonic)
      const freqs = [659.25, 987.77, 1318.51];
      freqs.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.001, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.25 / (idx + 1), now + idx * 0.08 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 1.8);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 2.0);
      });
    } catch (e) {
      console.warn('Audio play error', e);
    }
  }

  // Cheerful chime when a task is checked off
  playSuccess() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      // C5 - E5 - G5 - C6 rapid arpeggio
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.07);

        gain.gain.setValueAtTime(0.01, now + i * 0.07);
        gain.gain.linearRampToValueAtTime(0.18, now + i * 0.07 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + i * 0.07);
        osc.stop(now + i * 0.07 + 0.45);
      });
    } catch (e) {
      console.warn('Audio play error', e);
    }
  }

  // Synthesize ambient sounds: 'rain', 'whitenoise', 'none'
  setAmbient(type, volume = 0.2) {
    try {
      this.init();
      if (!this.ctx) return;

      if (this.ambientSource) {
        try {
          this.ambientSource.stop();
          this.ambientSource.disconnect();
        } catch (_) {}
        this.ambientSource = null;
      }

      this.currentAmbient = type;
      if (type === 'none') return;

      // 5-second loop buffer of white/pink noise
      const bufferSize = this.ctx.sampleRate * 3;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        if (type === 'rain') {
          // Pink-ish filtered noise for rain
          data[i] = (lastOut * 0.94) + (white * 0.06);
          lastOut = data[i];
        } else {
          // Soft white noise
          data[i] = white * 0.15;
        }
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      if (type === 'rain') {
        filter.type = 'lowpass';
        filter.frequency.value = 850;
      } else {
        filter.type = 'bandpass';
        filter.frequency.value = 1200;
      }

      const gain = this.ctx.createGain();
      gain.gain.value = volume;

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start();
      this.ambientSource = noise;
      this.ambientGain = gain;
    } catch (e) {
      console.warn('Ambient audio error', e);
    }
  }
}

export const soundManager = new SoundManager();
