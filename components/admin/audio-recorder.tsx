"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, Pause, Play, Square, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatDuration } from "@/lib/utils/audio";

const MAX_DURATION = 300;

function getMimeType(): string {
  if (typeof MediaRecorder === "undefined") return "";
  if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus"))
    return "audio/webm;codecs=opus";
  if (MediaRecorder.isTypeSupported("audio/webm")) return "audio/webm";
  if (MediaRecorder.isTypeSupported("audio/mp4")) return "audio/mp4";
  if (MediaRecorder.isTypeSupported("audio/ogg;codecs=opus"))
    return "audio/ogg;codecs=opus";
  return "";
}

interface UseAudioRecorderReturn {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioBlob: Blob | null;
  error: string | null;
  isSupported: boolean;
  startRecording: () => Promise<void>;
  pauseRecording: () => void;
  resumeRecording: () => void;
  stopRecording: () => void;
  reset: () => void;
}

function useAudioRecorder(): UseAudioRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSupported] = useState(
    () =>
      typeof window !== "undefined" &&
      typeof navigator.mediaDevices?.getUserMedia === "function" &&
      typeof MediaRecorder !== "undefined"
  );

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cleanupStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    timerRef.current = setInterval(() => {
      setDuration((prev) => {
        if (prev + 1 >= MAX_DURATION) {
          mediaRecorderRef.current?.stop();
          return prev + 1;
        }
        return prev + 1;
      });
    }, 1000);
  }, [clearTimer]);

  const startRecording = useCallback(async () => {
    setError(null);
    setAudioBlob(null);
    setDuration(0);
    chunksRef.current = [];

    const mimeType = getMimeType();
    if (!mimeType) {
      setError("Tu navegador no soporta grabación de audio");
      return;
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      const name = err instanceof DOMException ? err.name : "";
      if (name === "NotAllowedError") {
        setError(
          "Permiso de micrófono denegado. Haz clic en el icono de candado en la barra de direcciones y permite el acceso al micrófono."
        );
      } else if (name === "NotFoundError") {
        setError(
          "No se encontró ningún micrófono. Conecta uno e intenta de nuevo."
        );
      } else if (name === "NotReadableError") {
        setError(
          "El micrófono está siendo usado por otra aplicación. Ciérrala e intenta de nuevo."
        );
      } else {
        setError(
          `No se pudo acceder al micrófono: ${err instanceof Error ? err.message : "error desconocido"}`
        );
      }
      return;
    }

    streamRef.current = stream;

    const recorder = new MediaRecorder(stream, { mimeType });
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      setAudioBlob(blob);
      setIsRecording(false);
      setIsPaused(false);
      clearTimer();
      cleanupStream();
    };

    recorder.onerror = () => {
      setError("Error durante la grabación");
      setIsRecording(false);
      setIsPaused(false);
      clearTimer();
      cleanupStream();
    };

    recorder.start(1000);
    setIsRecording(true);
    setIsPaused(false);
    startTimer();
  }, [startTimer, clearTimer, cleanupStream]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      clearTimer();
    }
  }, [clearTimer]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "paused") {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      startTimer();
    }
  }, [startTimer]);

  const stopRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const reset = useCallback(() => {
    stopRecording();
    setAudioBlob(null);
    setDuration(0);
    setError(null);
    setIsRecording(false);
    setIsPaused(false);
    chunksRef.current = [];
    clearTimer();
    cleanupStream();
  }, [stopRecording, clearTimer, cleanupStream]);

  useEffect(() => {
    return () => {
      clearTimer();
      cleanupStream();
    };
  }, [clearTimer, cleanupStream]);

  return {
    isRecording,
    isPaused,
    duration,
    audioBlob,
    error,
    isSupported,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    reset,
  };
}

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
}

export function AudioRecorder({ onRecordingComplete }: AudioRecorderProps) {
  const {
    isRecording,
    isPaused,
    duration,
    audioBlob,
    error,
    isSupported,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    reset,
  } = useAudioRecorder();

  if (!isSupported) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Tu navegador no soporta grabación de audio.
        </AlertDescription>
      </Alert>
    );
  }

  if (audioBlob) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="bg-muted rounded-full p-2">
            <Mic className="text-muted-foreground size-5" />
          </div>
          <span className="text-sm font-medium">
            Grabación lista ({formatDuration(duration)})
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            onClick={() => onRecordingComplete(audioBlob)}
          >
            <Check className="size-4" />
            Usar esta grabación
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={reset}>
            <Trash2 className="size-4" />
            Descartar
          </Button>
        </div>
      </div>
    );
  }

  if (isRecording) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          {!isPaused && (
            <span className="relative flex size-3">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex size-3 rounded-full bg-red-500" />
            </span>
          )}
          {isPaused && <span className="inline-flex size-3 rounded-full bg-yellow-500" />}
          <span className="font-mono text-lg font-semibold tabular-nums">
            {formatDuration(duration)}
          </span>
          <span className="text-muted-foreground text-xs">
            {isPaused ? "Pausado" : "Grabando..."} (máx. 05:00)
          </span>
        </div>
        <div className="flex gap-2">
          {isPaused ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={resumeRecording}
            >
              <Play className="size-4" />
              Reanudar
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={pauseRecording}
            >
              <Pause className="size-4" />
              Pausar
            </Button>
          )}
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={stopRecording}
          >
            <Square className="size-4" />
            Detener
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button type="button" variant="outline" onClick={startRecording}>
        <Mic className="size-4" />
        Grabar audio
      </Button>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
