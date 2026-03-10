"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Play, Volume2, RotateCcw } from "lucide-react"

interface AudioPlayerProps {
  src: string
  autoPlay?: boolean
}

export function AudioPlayer({ src, autoPlay = true }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [ended, setEnded] = useState(false)

  useEffect(() => {
    setPlaying(false)
    setEnded(false)
  }, [src])

  const handleLoadedMetadata = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (autoPlay) {
      audio.play().catch(() => {})
    }
  }, [autoPlay])

  const handlePlay = useCallback(() => {
    setPlaying(true)
    setEnded(false)
  }, [])

  const handlePause = useCallback(() => setPlaying(false), [])

  const handleEnded = useCallback(() => {
    setPlaying(false)
    setEnded(true)
  }, [])

  const handleClick = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = 0
    audio.play().catch(() => {})
  }, [])

  return (
    <div className="flex flex-col items-center gap-2">
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleEnded}
      />
      <div className="relative flex items-center justify-center">
        {playing && (
          <>
            <span className="absolute inset-0 rounded-full bg-amber-400/40 animate-ping" />
            <span
              className="absolute rounded-full bg-amber-400/20 animate-ping"
              style={{ inset: "-10px", animationDelay: "200ms" }}
            />
          </>
        )}
        <button
          type="button"
          onClick={handleClick}
          aria-label={ended ? "Escuchar de nuevo" : "Escuchar audio"}
          className="relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all duration-150 active:scale-95"
          style={{
            background: "linear-gradient(135deg, #fbbf24 0%, #f97316 100%)",
            boxShadow: playing
              ? "0 0 0 6px rgba(251,191,36,0.25), 0 8px 24px rgba(249,115,22,0.45)"
              : "0 6px 20px rgba(249,115,22,0.40)",
          }}
        >
          {ended ? (
            <RotateCcw className="w-8 h-8 text-white" strokeWidth={2.5} />
          ) : playing ? (
            <Volume2 className="w-8 h-8 text-white" strokeWidth={2.5} />
          ) : (
            <Play className="w-8 h-8 text-white" strokeWidth={2.5} fill="white" style={{ marginLeft: "4px" }} />
          )}
        </button>
      </div>
      <p className="text-xs font-medium opacity-60">
        {ended ? "Toca para escuchar de nuevo" : playing ? "Escuchando..." : "Toca para escuchar"}
      </p>
    </div>
  )
}
