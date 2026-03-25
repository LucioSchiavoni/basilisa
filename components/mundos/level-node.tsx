"use client"

import Image from "next/image"
import Link from "next/link"

interface LevelNodeProps {
  name: string
  imageUrl: string
  href: string
  isActive?: boolean
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void
}

export function LevelNode({
  name,
  imageUrl,
  href,
  isActive = false,
  onClick,
}: LevelNodeProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="group relative flex flex-col items-center"
    >
      <div style={{ position: "relative", width: 112, height: 118 }}>
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: 108,
            height: 108,
            borderRadius: "50%",
            background: "rgba(0,0,0,0.25)",
          }}
        />
        <div
          className="relative rounded-full overflow-hidden transition-transform duration-150 ease-in-out group-hover:[transform:translateY(2px)] group-active:[transform:translateY(6px)]"
          style={{ width: 108, height: 108 }}
        >
          <Image src={imageUrl} alt={name} fill className="object-cover" />
        </div>
      </div>

      <p
        className="mt-3 text-xs font-bold text-center leading-tight text-foreground"
        style={{ width: 120 }}
      >
        {name}
      </p>
    </Link>
  )
}
