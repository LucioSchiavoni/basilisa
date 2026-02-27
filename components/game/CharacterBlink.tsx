"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

export function CharacterBlink() {
  const [eyesOpen, setEyesOpen] = useState(true);

  useEffect(() => {
    const img1 = new window.Image();
    img1.src = "/characters/rey_ojos_abiertos.png";
    const img2 = new window.Image();
    img2.src = "/characters/rey_ojos_cerrados.png";
  }, []);

  useEffect(() => {
    let cancelled = false;
    const pending: ReturnType<typeof setTimeout>[] = [];

    const wait = (ms: number) =>
      new Promise<void>((res) => {
        const t = setTimeout(res, ms);
        pending.push(t);
      });

    const loop = async () => {
      while (!cancelled) {
        await wait(3000 + Math.random() * 1000);
        if (cancelled) break;
        setEyesOpen(false);
        await wait(150);
        if (cancelled) break;
        setEyesOpen(true);
        await wait(100);
        if (cancelled) break;
        setEyesOpen(false);
        await wait(150);
        if (cancelled) break;
        setEyesOpen(true);
      }
    };

    loop();

    return () => {
      cancelled = true;
      pending.forEach(clearTimeout);
    };
  }, []);

  return (
    <motion.div
      animate={{ y: [0, -3, 0] }}
      transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      style={{ position: "relative", width: 280, height: 420 }}
    >
      <Image
        src="/characters/rey_ojos_abiertos.png"
        alt="Rey"
        width={280}
        height={420}
        priority
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          opacity: eyesOpen ? 1 : 0,
        }}
      />
      <Image
        src="/characters/rey_ojos_cerrados.png"
        alt="Rey"
        width={280}
        height={420}
        priority
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          opacity: eyesOpen ? 0 : 1,
        }}
      />
    </motion.div>
  );
}
