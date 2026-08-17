/**
 * Synthesised interface sounds.
 *
 * Tones are generated with the Web Audio API rather than shipped as files, so
 * the whole feedback layer costs no network requests. Audio is decorative:
 * every failure path is swallowed and visual state stays the source of truth.
 */

export type InterfaceSound = "tap" | "toggle" | "ready";

const MAX_CONCURRENT_VOICES = 4;
const MASTER_GAIN = 0.04;

type Voice = { frequency: number; offset: number; duration: number; peak: number };

const CUES: Record<InterfaceSound, Voice[]> = {
  tap: [{ frequency: 620, offset: 0, duration: 0.035, peak: 0.42 }],
  toggle: [
    { frequency: 520, offset: 0, duration: 0.045, peak: 0.5 },
    { frequency: 640, offset: 0.028, duration: 0.05, peak: 0.35 },
  ],
  ready: [
    { frequency: 440, offset: 0, duration: 0.07, peak: 0.55 },
    { frequency: 660, offset: 0.055, duration: 0.09, peak: 0.45 },
  ],
};

let enabled = true;
let context: AudioContext | null = null;
let masterGain: GainNode | null = null;
let activeVoices = 0;

export function setInterfaceSoundEnabled(next: boolean) {
  enabled = next;
}

export function isInterfaceSoundEnabled() {
  return enabled;
}

/**
 * The graph is built on first use - inside a user gesture - so browsers do not
 * start it in a suspended state.
 */
function getAudioGraph() {
  if (typeof window === "undefined" || !window.AudioContext) return null;

  if (!context) {
    context = new AudioContext();
    masterGain = context.createGain();
    masterGain.gain.value = MASTER_GAIN;

    const limiter = context.createDynamicsCompressor();
    limiter.threshold.value = -18;
    limiter.knee.value = 6;
    limiter.ratio.value = 8;
    limiter.attack.value = 0.003;
    limiter.release.value = 0.1;

    masterGain.connect(limiter);
    limiter.connect(context.destination);
  }

  return masterGain ? { context, masterGain } : null;
}

function scheduleVoice(audioContext: AudioContext, destination: AudioNode, voice: Voice, start: number) {
  if (activeVoices >= MAX_CONCURRENT_VOICES) return;
  activeVoices += 1;

  const oscillator = audioContext.createOscillator();
  const envelope = audioContext.createGain();
  const at = start + voice.offset;

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(voice.frequency, at);
  envelope.gain.setValueAtTime(0.0001, at);
  envelope.gain.exponentialRampToValueAtTime(voice.peak, at + 0.006);
  envelope.gain.exponentialRampToValueAtTime(0.0001, at + voice.duration);

  oscillator.connect(envelope);
  envelope.connect(destination);
  oscillator.start(at);
  oscillator.stop(at + voice.duration + 0.01);
  oscillator.onended = () => {
    activeVoices = Math.max(0, activeVoices - 1);
    oscillator.disconnect();
    envelope.disconnect();
  };
}

function renderCue(kind: InterfaceSound, audioContext: AudioContext, destination: AudioNode) {
  const start = audioContext.currentTime + 0.004;
  for (const voice of CUES[kind]) scheduleVoice(audioContext, destination, voice, start);
}

export function playInterfaceSound(kind: InterfaceSound) {
  if (!enabled) return;

  try {
    const graph = getAudioGraph();
    if (!graph) return;

    if (graph.context.state === "suspended") {
      void graph.context
        .resume()
        .then(() => renderCue(kind, graph.context, graph.masterGain))
        .catch(() => undefined);
      return;
    }

    renderCue(kind, graph.context, graph.masterGain);
  } catch {
    // Sound is decorative - never let it break an interaction.
  }
}
