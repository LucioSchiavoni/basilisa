"use client"

import { useState, useEffect, useRef, useCallback } from "react"

const PREFERRED_VOICE_NAMES = ["paulina", "monica", "luciana", "mónica"]

function selectBestVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (voices.length === 0) return null

  const byName = voices.find((v) =>
    PREFERRED_VOICE_NAMES.some((name) => v.name.toLowerCase().includes(name))
  )
  if (byName) return byName

  const byLangAndGender = voices.find(
    (v) =>
      v.lang.startsWith("es") &&
      (v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("mujer"))
  )
  if (byLangAndGender) return byLangAndGender

  const byLang = voices.find((v) => v.lang.startsWith("es"))
  if (byLang) return byLang

  return voices[0]
}

export function useSpeech() {
  const isSupported = typeof window !== "undefined" && "speechSynthesis" in window

  const [isSpeaking, setIsSpeaking] = useState(false)
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null)

  useEffect(() => {
    if (!isSupported) return

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices()
      voiceRef.current = selectBestVoice(voices)
    }

    loadVoices()
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices)

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices)
      window.speechSynthesis.cancel()
    }
  }, [isSupported])

  const stop = useCallback(() => {
    if (!isSupported) return
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [isSupported])

  const speak = useCallback(
    (text: string, rate: number = 0.85) => {
      if (!isSupported) return

      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = rate
      if (voiceRef.current) utterance.voice = voiceRef.current

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)

      window.speechSynthesis.speak(utterance)
    },
    [isSupported]
  )

  return { speak, stop, isSpeaking, isSupported }
}
