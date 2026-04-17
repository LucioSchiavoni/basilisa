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
  const [isSupported, setIsSupported] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null)

  useEffect(() => {
    setIsSupported(typeof window !== "undefined" && "speechSynthesis" in window)
  }, [])

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

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const stop = useCallback(() => {
    if (!isSupported) return
    if (timerRef.current) clearTimeout(timerRef.current)
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [isSupported])

  const speak = useCallback(
    (text: string, rate: number = 0.72) => {
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

  const speakSpelled = useCallback(
    (text: string) => {
      if (!isSupported) return
      if (timerRef.current) clearTimeout(timerRef.current)
      window.speechSynthesis.cancel()

      const tokens = text.trim().split(/\s+/)
      let idx = 0

      const speakNext = () => {
        if (idx >= tokens.length) {
          setIsSpeaking(false)
          return
        }
        const utterance = new SpeechSynthesisUtterance(tokens[idx])
        utterance.rate = 0.55
        if (voiceRef.current) utterance.voice = voiceRef.current
        utterance.onend = () => {
          idx++
          timerRef.current = setTimeout(speakNext, 420)
        }
        utterance.onerror = () => setIsSpeaking(false)
        window.speechSynthesis.speak(utterance)
      }

      setIsSpeaking(true)
      speakNext()
    },
    [isSupported]
  )

  return { speak, speakSpelled, stop, isSpeaking, isSupported }
}
