'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Square, Loader2, Volume2, VolumeX, ShieldCheck, AlertCircle } from 'lucide-react';

// Singleton cache for the browser-side Whisper pipeline so it only downloads once per session
let whisperPipelineInstance: any = null;
let whisperLoadingPromise: Promise<any> | null = null;

/**
 * Strips Markdown syntax (asterisks, hashtags, backticks, code fences, links, tables)
 * so native browser speechSynthesis reads natural sentences instead of punctuation symbols.
 */
export function stripMarkdownForSpeech(markdown: string): string {
  if (!markdown) return '';

  let text = markdown;

  // 1. Replace fenced code blocks with a brief spoken note
  text = text.replace(/```[\s\S]*?```/g, ' Code block omitted. ');

  // 2. Strip inline code backticks but keep the identifier inside
  text = text.replace(/`([^`]+)`/g, '$1');

  // 3. Strip images ![alt](url) -> alt
  text = text.replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1');

  // 4. Strip links [label](url) -> label
  text = text.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');

  // 5. Strip HTML tags
  text = text.replace(/<[^>]+>/g, ' ');

  // 6. Strip headings (#, ##, ###, etc.) at start of lines or inline
  text = text.replace(/(^|\n)\s*#{1,6}\s+/g, '$1');
  text = text.replace(/#{2,6}/g, ' ');

  // 7. Strip bold/italic asterisks and underscores (***, **, *, ___, __, _)
  text = text.replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1');
  text = text.replace(/_{1,3}([^_]+)_{1,3}/g, '$1');
  text = text.replace(/[*_~`]+/g, '');

  // 8. Strip blockquotes (>) and markdown table pipes/dividers
  text = text.replace(/(^|\n)\s*>\s*/g, '$1');
  text = text.replace(/\|[-:\s|]+\|/g, ' ');
  text = text.replace(/\|/g, ', ');

  // 9. Strip list bullets and checkboxes (- [ ], - [x], -, •)
  text = text.replace(/(^|\n)\s*[-*+•]\s*(\[[ xX]\]\s*)?/g, '$1');

  // 10. Strip horizontal rules and box-drawing/arrow characters
  text = text.replace(/(^|\n)\s*[-=_]{3,}\s*(\n|$)/g, '\n');
  text = text.replace(/[➔→←↑↓─│┌┐└┘├┤┬┴┼═║╔╗╚╝]/g, ' ');

  // 11. Collapse extra whitespace into clean sentences
  text = text.replace(/\n+/g, '. ');
  text = text.replace(/\.\s*\./g, '.');
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}

/**
 * Decodes a recorded audio Blob into a 16kHz mono Float32Array required by Whisper ONNX.
 */
async function decodeAudioBlobTo16kHzFloat32(blob: Blob): Promise<Float32Array> {
  const arrayBuffer = await blob.arrayBuffer();
  const AudioContextClass =
    window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

  const audioCtx = new AudioContextClass({ sampleRate: 16000 });
  try {
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

    if (audioBuffer.sampleRate === 16000) {
      return new Float32Array(audioBuffer.getChannelData(0));
    }

    // Resample to 16,000 Hz mono using OfflineAudioContext if browser kept native sample rate
    const targetLength = Math.max(1, Math.ceil(audioBuffer.duration * 16000));
    const offlineCtx = new OfflineAudioContext(1, targetLength, 16000);
    const source = offlineCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(offlineCtx.destination);
    source.start(0);

    const renderedBuffer = await offlineCtx.startRendering();
    return new Float32Array(renderedBuffer.getChannelData(0));
  } finally {
    if (audioCtx.state !== 'closed') {
      await audioCtx.close().catch(() => {});
    }
  }
}

/**
 * Loads and caches the Xenova/whisper-tiny.en pipeline in the browser via WebAssembly/WebGPU.
 */
async function getWhisperTranscriber(onProgress?: (progressPct: number | null) => void) {
  if (whisperPipelineInstance) {
    return whisperPipelineInstance;
  }

  if (!whisperLoadingPromise) {
    whisperLoadingPromise = (async () => {
      const { pipeline, env } = await import('@xenova/transformers');
      // Force HuggingFace Hub CDN & Browser Cache API (avoid fetching local Next.js /models 404 route)
      env.allowLocalModels = false;
      env.useBrowserCache = true;

      const instance = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny.en', {
        quantized: true,
        progress_callback: (data: any) => {
          if (data && typeof data.progress === 'number' && onProgress) {
            onProgress(Math.round(data.progress));
          }
        },
      });
      whisperPipelineInstance = instance;
      return instance;
    })().catch((err) => {
      whisperLoadingPromise = null;
      throw err;
    });
  }

  return whisperLoadingPromise;
}

export interface VoiceInputProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
  variant?: 'console' | 'hq';
}

/**
 * Browser-Based Whisper (Speech-to-Text) Microphone Button Component.
 * Records user audio and transcribes it 100% locally in the browser using Xenova/whisper-tiny.en.
 */
export default function VoiceInput({
  onTranscript,
  disabled = false,
  variant = 'console',
}: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isModelLoading, setIsModelLoading] = useState<boolean>(false);
  const [loadProgress, setLoadProgress] = useState<number | null>(null);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // Clean up microphone stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const stopStreamTracks = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const processRecordedAudio = useCallback(
    async (blob: Blob) => {
      try {
        setErrorMsg(null);

        // Step 1: Ensure Whisper model is downloaded and initialized in browser
        if (!whisperPipelineInstance) {
          setIsModelLoading(true);
          setLoadProgress(null);
        }
        const transcriber = await getWhisperTranscriber((pct) => {
          setLoadProgress(pct);
        });
        setIsModelLoading(false);

        // Step 2: Decode audio and run Whisper inference locally
        setIsTranscribing(true);
        const audioData = await decodeAudioBlobTo16kHzFloat32(blob);

        const result = await transcriber(audioData, {
          chunk_length_s: 30,
          stride_length_s: 5,
        });

        const rawText = typeof result?.text === 'string' ? result.text : '';
        // Strip Whisper silence hallucinations like [BLANK_AUDIO] or (bell ringing)
        const cleanedText = rawText
          .replace(/\[.*?\]/g, '')
          .replace(/\(.*?\)/g, '')
          .replace(/\s+/g, ' ')
          .trim();

        if (cleanedText) {
          onTranscript(cleanedText);
        } else {
          setErrorMsg('No speech detected. Try speaking closer to the mic.');
          setTimeout(() => setErrorMsg(null), 3500);
        }
      } catch (err: any) {
        console.error('Local Whisper transcription error:', err);
        setErrorMsg(err?.message || 'Whisper transcription failed');
        setTimeout(() => setErrorMsg(null), 4000);
      } finally {
        setIsModelLoading(false);
        setIsTranscribing(false);
        setLoadProgress(null);
      }
    },
    [onTranscript]
  );

  const handleToggleRecording = async () => {
    // If currently recording, always allow stopping and trigger local Whisper transcription
    if (isRecording && mediaRecorderRef.current) {
      setIsRecording(false);
      if (mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      return;
    }

    if (disabled || isTranscribing || isModelLoading) return;

    // Otherwise, request microphone permission and start recording
    setErrorMsg(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone access is not supported in this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Ensure Whisper model is downloaded in browser (shows "Loading Whisper..." on first use)
      if (!whisperPipelineInstance) {
        setIsModelLoading(true);
        setLoadProgress(null);
        await getWhisperTranscriber((pct) => setLoadProgress(pct));
        setIsModelLoading(false);
      }

      audioChunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : '';

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        stopStreamTracks();
        const audioBlob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || 'audio/webm',
        });
        if (audioBlob.size > 0) {
          processRecordedAudio(audioBlob);
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch (err: any) {
      stopStreamTracks();
      setIsRecording(false);
      setIsModelLoading(false);
      const msg =
        err?.name === 'NotAllowedError'
          ? 'Microphone permission denied.'
          : err?.message || 'Could not access microphone.';
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(null), 4000);
    }
  };

  const isBusy = isModelLoading || isTranscribing;

  const buttonLabel = isModelLoading
    ? loadProgress !== null && loadProgress < 100
      ? `Loading Whisper (${loadProgress}%)...`
      : 'Loading Whisper...'
    : isTranscribing
    ? 'Transcribing...'
    : isRecording
    ? 'Stop'
    : null;

  const isHq = variant === 'hq';

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={handleToggleRecording}
        disabled={disabled || isTranscribing}
        title={
          isModelLoading
            ? 'Downloading whisper-tiny.en model into browser cache...'
            : isTranscribing
            ? 'Transcribing audio locally with Whisper ONNX...'
            : isRecording
            ? 'Click to stop recording and transcribe'
            : 'Voice Input (Local Browser Whisper STT)'
        }
        className={` rounded-lg border font-mono text-xs transition-all cursor-pointer shrink-0 flex items-center justify-center gap-1.5 ${
          isHq ? 'h-10 px-2.5' : 'p-2'
        } ${
          isRecording
            ? 'bg-red-500/20 border-red-500 text-red-500 dark:text-red-400 animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.4)]'
            : isBusy
            ? 'bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-300'
            : isHq
            ? 'bg-black/60 border-zinc-700 hover:border-cyan-400 text-zinc-300 hover:text-cyan-300'
            : 'bg-white dark:bg-white/5 border-black/10 dark:border-white/15 text-slate-600 dark:text-zinc-400 hover:text-cyan-600 dark:hover:text-[#00ffff] hover:border-cyan-500/40'
        } disabled:opacity-40`}
      >
        {isBusy ? (
          <Loader2 className="w-4 h-4 animate-spin text-amber-500 dark:text-amber-400 shrink-0" />
        ) : isRecording ? (
          <Square className="w-3.5 h-3.5 fill-current text-red-500 shrink-0" />
        ) : (
          <Mic className="w-4 h-4 shrink-0" />
        )}

        {buttonLabel && (
          <span className="text-[10px] font-semibold whitespace-nowrap">
            {buttonLabel}
          </span>
        )}
      </button>

      {errorMsg && (
        <div className="absolute bottom-full right-0 mb-2 px-2.5 py-1.5 rounded-lg bg-red-950/95 border border-red-500/50 text-red-200 text-[10px] font-mono whitespace-nowrap shadow-xl z-50 flex items-center gap-1.5">
          <AlertCircle className="w-3 h-3 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}

/**
 * Native Browser Text-to-Speech (TTS) Speaker Toggle Button.
 * Uses window.speechSynthesis and strips Markdown formatting before speaking.
 */
export function VoiceTTSButton({
  text,
  className = '',
}: {
  text: string;
  className?: string;
}) {
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  useEffect(() => {
    return () => {
      // Stop speech if unmounted while speaking
      if (isSpeaking && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSpeaking]);

  const handleToggleSpeak = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    const synth = window.speechSynthesis;

    // If this message is currently being spoken, stop it
    if (isSpeaking) {
      synth.cancel();
      setIsSpeaking(false);
      return;
    }

    // Cancel any other active utterance before starting
    synth.cancel();

    const cleanSpeechText = stripMarkdownForSpeech(text);
    if (!cleanSpeechText) return;

    const utterance = new SpeechSynthesisUtterance(cleanSpeechText);
    utterance.rate = 1.02;
    utterance.pitch = 1.0;

    // Select a clear English voice if available
    const voices = synth.getVoices();
    const preferredVoice =
      voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Microsoft'))
      ) || voices.find((v) => v.lang.startsWith('en'));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onend = () => {
      setIsSpeaking(false);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    setIsSpeaking(true);
    synth.speak(utterance);
  };

  return (
    <button
      type="button"
      onClick={handleToggleSpeak}
      title={isSpeaking ? 'Stop reading aloud' : 'Read AI response aloud (Local Native TTS)'}
      aria-label={isSpeaking ? 'Stop reading aloud' : 'Read AI response aloud'}
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded transition-all cursor-pointer font-mono text-[10px] border ${
        isSpeaking
          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/40 animate-pulse'
          : 'bg-black/5 dark:bg-white/5 hover:bg-cyan-500/15 text-slate-500 dark:text-zinc-400 hover:text-cyan-600 dark:hover:text-[#00ffff] border-transparent hover:border-cyan-500/30'
      } ${className}`}
    >
      {isSpeaking ? (
        <>
          <VolumeX className="w-3 h-3 shrink-0" />
          <span>Stop</span>
        </>
      ) : (
        <>
          <Volume2 className="w-3 h-3 shrink-0" />
          <span>Speak</span>
        </>
      )}
    </button>
  );
}

/**
 * Sleek "VOICE MODE: LOCAL" security & privacy badge indicating 100% in-browser audio processing.
 */
export function VoiceModeBadge({ className = '' }: { className?: string }) {
  return (
    <span
      title="Audio is processed 100% locally in your browser using @xenova/transformers (whisper-tiny.en) and native SpeechSynthesis. $0 API cost."
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-[9px] font-mono font-bold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase shadow-[0_0_8px_rgba(16,185,129,0.15)] select-none ${className}`}
    >
      <ShieldCheck className="w-2.5 h-2.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
      <span>VOICE MODE: LOCAL</span>
    </span>
  );
}
