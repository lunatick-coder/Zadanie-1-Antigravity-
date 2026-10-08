// ============================================================================
// OINK OF ISAAC: BARNYARD BREAKOUT - PROCEDURAL AUDIO SYNTHESIZER
// 100% self-contained Web Audio API synthesizer for retro sound effects &
// dynamic chiptune background music tracks. Zero external audio files required!
// ============================================================================

class SoundManager {
    constructor() {
        this.ctx = null;
        this.musicGain = null;
        this.sfxGain = null;
        this.masterGain = null;
        this.isMuted = false;
        this.musicMuted = false;
        this.currentBgm = null;
        this.bgmTimer = null;
        this.isInitialized = false;
    }

    init() {
        if (this.isInitialized) return;
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioCtx();

            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.5;

            this.sfxGain = this.ctx.createGain();
            this.sfxGain.gain.value = 0.6;
            this.sfxGain.connect(this.masterGain);

            this.musicGain = this.ctx.createGain();
            this.musicGain.gain.value = 0.35;
            this.musicGain.connect(this.masterGain);

            this.masterGain.connect(this.ctx.destination);
            this.isInitialized = true;
        } catch (e) {
            console.warn('Web Audio not supported or blocked:', e);
        }
    }

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    // ========================================================================
    // SOUND EFFECTS
    // ========================================================================

    // Cute pig squeak / shoot sound
    playShoot(type = 'normal') {
        if (!this.isInitialized || this.isMuted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        if (type === 'fire') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(320, now);
            osc.frequency.exponentialRampToValueAtTime(80, now + 0.12);
            gain.gain.setValueAtTime(0.25, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
        } else if (type === 'lightning') {
            osc.type = 'square';
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.setValueAtTime(200, now + 0.04);
            osc.frequency.setValueAtTime(450, now + 0.08);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.1);
        } else if (type === 'heavy') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(140, now);
            osc.frequency.exponentialRampToValueAtTime(40, now + 0.18);
            gain.gain.setValueAtTime(0.4, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.18);
        } else {
            // Normal mud spit
            osc.type = 'sine';
            osc.frequency.setValueAtTime(420, now);
            osc.frequency.exponentialRampToValueAtTime(180, now + 0.08);
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.08);
        }

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.2);
    }

    // Pig hurt oink / squeal
    playPigHurt() {
        if (!this.isInitialized || this.isMuted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.linearRampToValueAtTime(750, now + 0.07);
        osc.frequency.exponentialRampToValueAtTime(280, now + 0.25);

        gain.gain.setValueAtTime(0.5, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.25);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.26);
    }

    // Enemy hit impact
    playEnemyHit() {
        if (!this.isInitialized || this.isMuted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.06);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.06);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.07);
    }

    // Enemy defeat splatter
    playEnemyDeath() {
        if (!this.isInitialized || this.isMuted) return;
        const now = this.ctx.currentTime;

        // White noise burst
        const bufferSize = this.ctx.sampleRate * 0.15;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, now);
        filter.frequency.exponentialRampToValueAtTime(100, now + 0.15);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.15);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        noise.start(now);
    }

    // Coin / Corn pickup chime
    playCoin() {
        if (!this.isInitialized || this.isMuted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(987.77, now); // B5
        osc.frequency.setValueAtTime(1318.51, now + 0.07); // E6

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.22);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.23);
    }

    // Health pickup
    playHealth() {
        if (!this.isInitialized || this.isMuted) return;
        const now = this.ctx.currentTime;
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.05);

            gain.gain.setValueAtTime(0.25, now + idx * 0.05);
            gain.gain.linearRampToValueAtTime(0.01, now + idx * 0.05 + 0.15);

            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(now + idx * 0.05);
            osc.stop(now + idx * 0.05 + 0.16);
        });
    }

    // Item pedestal fanfare
    playItemFanfare() {
        if (!this.isInitialized || this.isMuted) return;
        const now = this.ctx.currentTime;
        const notes = [440, 554.37, 659.25, 880];
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.07);

            gain.gain.setValueAtTime(0.3, now + idx * 0.07);
            gain.gain.linearRampToValueAtTime(0.01, now + idx * 0.07 + 0.35);

            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(now + idx * 0.07);
            osc.stop(now + idx * 0.07 + 0.36);
        });
    }

    // Synergy discovered jingle
    playSynergyJingle() {
        if (!this.isInitialized || this.isMuted) return;
        const now = this.ctx.currentTime;
        const chords = [
            [523.25, 659.25, 783.99],       // C
            [587.33, 739.99, 880.00],       // D
            [659.25, 830.61, 987.77],       // E
            [1046.50, 1318.51, 1567.98]     // High C Major
        ];

        chords.forEach((chord, step) => {
            chord.forEach(freq => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'square';
                const time = now + step * 0.11;
                osc.frequency.setValueAtTime(freq, time);

                gain.gain.setValueAtTime(0.2, time);
                gain.gain.linearRampToValueAtTime(0.01, time + (step === 3 ? 0.6 : 0.15));

                osc.connect(gain);
                gain.connect(this.sfxGain);
                osc.start(time);
                osc.stop(time + 0.7);
            });
        });
    }

    // Explosion
    playExplosion() {
        if (!this.isInitialized || this.isMuted) return;
        const now = this.ctx.currentTime;
        const bufferSize = this.ctx.sampleRate * 0.4;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, now);
        filter.frequency.exponentialRampToValueAtTime(60, now + 0.35);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.7, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.4);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        noise.start(now);
    }

    // Trap snap
    playTrap() {
        if (!this.isInitialized || this.isMuted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(90, now + 0.08);

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.08);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.09);
    }

    // Wolf howl / Boss roar
    playRoar() {
        if (!this.isInitialized || this.isMuted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.linearRampToValueAtTime(260, now + 0.2);
        osc.frequency.linearRampToValueAtTime(110, now + 0.6);

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.65);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.7);
    }

    // Door unlock / slam
    playDoor() {
        if (!this.isInitialized || this.isMuted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.12);

        gain.gain.setValueAtTime(0.5, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.12);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.13);
    }

    // ========================================================================
    // CHIPTUNE MUSIC GENERATOR
    // ========================================================================
    playBgm(track = 'barn') {
        if (this.currentBgm === track && this.bgmTimer) return;
        this.stopBgm();
        this.currentBgm = track;
        if (!this.isInitialized || this.musicMuted) return;

        let step = 0;
        const bpm = track === 'boss' ? 140 : (track === 'field' ? 115 : 125);
        const stepTime = (60 / bpm) / 4; // 16th notes

        // Scales
        const barnBass = [130.81, 130.81, 164.81, 196.00, 130.81, 196.00, 220.00, 196.00];
        const barnLead = [261.63, 329.63, 392.00, 523.25, 392.00, 329.63, 261.63, 196.00];

        const fieldBass = [110.00, 110.00, 130.81, 146.83, 110.00, 164.81, 146.83, 130.81];
        const fieldLead = [220.00, 261.63, 293.66, 329.63, 293.66, 261.63, 220.00, 164.81];

        const bossBass = [98.00, 98.00, 116.54, 98.00, 130.81, 116.54, 98.00, 87.31];
        const bossLead = [196.00, 233.08, 261.63, 392.00, 349.23, 261.63, 233.08, 196.00];

        const playStep = () => {
            if (!this.isInitialized || this.musicMuted || !this.currentBgm) return;
            const now = this.ctx.currentTime;

            let bassNotes = barnBass;
            let leadNotes = barnLead;
            if (track === 'field') {
                bassNotes = fieldBass;
                leadNotes = fieldLead;
            } else if (track === 'boss') {
                bassNotes = bossBass;
                leadNotes = bossLead;
            }

            // Play bass note on beats
            if (step % 2 === 0) {
                const bassFreq = bassNotes[(step / 2) % bassNotes.length];
                const bassOsc = this.ctx.createOscillator();
                const bassGain = this.ctx.createGain();
                bassOsc.type = 'triangle';
                bassOsc.frequency.setValueAtTime(bassFreq, now);

                bassGain.gain.setValueAtTime(0.2, now);
                bassGain.gain.linearRampToValueAtTime(0.01, now + stepTime * 1.8);

                bassOsc.connect(bassGain);
                bassGain.connect(this.musicGain);
                bassOsc.start(now);
                bassOsc.stop(now + stepTime * 2);
            }

            // Play arpeggio melody on every 16th
            if (step % 1 === 0) {
                const leadFreq = leadNotes[step % leadNotes.length];
                const leadOsc = this.ctx.createOscillator();
                const leadGain = this.ctx.createGain();
                leadOsc.type = 'square';
                leadOsc.frequency.setValueAtTime(leadFreq, now);

                leadGain.gain.setValueAtTime(0.08, now);
                leadGain.gain.linearRampToValueAtTime(0.001, now + stepTime * 0.9);

                leadOsc.connect(leadGain);
                leadGain.connect(this.musicGain);
                leadOsc.start(now);
                leadOsc.stop(now + stepTime);
            }

            step = (step + 1) % 64;
            this.bgmTimer = setTimeout(playStep, stepTime * 1000);
        };

        playStep();
    }

    stopBgm() {
        if (this.bgmTimer) {
            clearTimeout(this.bgmTimer);
            this.bgmTimer = null;
        }
        this.currentBgm = null;
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        this.musicMuted = this.isMuted;
        if (this.isMuted) {
            this.stopBgm();
        }
        return this.isMuted;
    }
}

if (typeof window !== 'undefined') {
    window.SoundManager = SoundManager;
}
